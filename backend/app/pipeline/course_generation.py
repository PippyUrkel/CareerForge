"""Course generation pipeline orchestrator."""

from __future__ import annotations

import logging
import time
import uuid
from typing import TYPE_CHECKING

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import CourseRecord, ModuleRecord, ModuleVideoRecord, VideoRecord
from app.schemas.course import (
    Course,
    CourseGenerationResponse,
    DebugInfo,
    PipelineMetadata,
)
from app.schemas.course_request import CourseGenerationRequest
from app.schemas.taxonomy import CourseTaxonomy
from app.schemas.video import ScoredVideo, Video
from app.services.assembly.assembler import CourseAssemblyService
from app.services.difficulty.scorer import DifficultyScorer
from app.services.embeddings.service import EmbeddingService
from app.services.ingestion.adapter import VideoIngestionAdapter
from app.services.llm.base import LLMError, LLMProvider
from app.services.matching.cosine import CosineScorer
from app.services.matching.cross_encoder import CrossEncoderScorer
from app.services.matching.lexical import LexicalScorer
from app.services.matching.metadata import MetadataScorer
from app.services.matching.ranking import RankingService
from app.services.matching.tfidf import TFIDFScorer
from app.services.taxonomy.generator import TaxonomyGenerator

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)


class CourseGenerationPipeline:
    """End-to-end course generation pipeline.

    Orchestrates all services in the correct order:
    1. Taxonomy generation (LLM)
    2. Search query generation (LLM)
    3. Video retrieval (YouTube / catalog)
    4. Embedding generation
    5. Multi-signal ranking
    6. Diversity-aware selection
    7. Course assembly
    8. Validation
    9. Persistence

    Each service is independently testable and configurable.
    """

    def __init__(
        self,
        llm_provider: LLMProvider,
        ingestion_adapter: VideoIngestionAdapter,
        embedding_service: EmbeddingService,
        cross_encoder_scorer: CrossEncoderScorer,
        db_session: AsyncSession | None = None,
    ) -> None:
        self._llm = llm_provider
        self._ingestion = ingestion_adapter
        self._embedding = embedding_service
        self._cross_encoder = cross_encoder_scorer
        self._db = db_session

        # Build internal services
        self._taxonomy_generator = TaxonomyGenerator(self._llm)
        self._cosine_scorer = CosineScorer()
        self._lexical_scorer = LexicalScorer()
        self._metadata_scorer = MetadataScorer()
        self._tfidf_scorer = TFIDFScorer()
        self._difficulty_scorer = DifficultyScorer()
        self._assembler = CourseAssemblyService()

        self._ranking_service = RankingService(
            embedding_service=self._embedding,
            cosine_scorer=self._cosine_scorer,
            lexical_scorer=self._lexical_scorer,
            metadata_scorer=self._metadata_scorer,
            tfidf_scorer=self._tfidf_scorer,
            cross_encoder_scorer=self._cross_encoder,
            difficulty_scorer=self._difficulty_scorer,
        )

    async def generate(
        self, request: CourseGenerationRequest
    ) -> CourseGenerationResponse:
        """Execute the complete course generation pipeline.

        Args:
            request: Validated course generation request.

        Returns:
            CourseGenerationResponse with the assembled course.
        """
        generation_id = f"gen_{uuid.uuid4().hex[:12]}"
        start_time = time.time()
        total_candidates = 0
        total_selected = 0
        debug_info = DebugInfo() if request.debug else None

        logger.info(
            "course_generation_started generation_id=%s topic=%s",
            generation_id,
            request.topic,
        )

        # ── Step 1: Taxonomy Generation ──────────────────────────────
        logger.info("taxonomy_generation_started generation_id=%s", generation_id)
        taxonomy = await self._taxonomy_generator.generate_taxonomy(request)
        logger.info(
            "taxonomy_generation_completed generation_id=%s modules=%d",
            generation_id,
            len(taxonomy.modules),
        )

        # ── Step 2: Search Query Generation ──────────────────────────
        if request.search_config.llm_query_generation_enabled:
            logger.info(
                "query_generation_started generation_id=%s", generation_id
            )
            for module in taxonomy.modules:
                try:
                    queries = await self._taxonomy_generator.generate_search_queries(
                        module, request
                    )
                    module.search_queries = queries
                except LLMError as exc:
                    logger.warning(
                        "Query generation failed for module='%s': %s, using keywords",
                        module.title,
                        exc,
                    )
                    # Fallback to keyword-based queries
                    module.search_queries = self._fallback_queries(module, request)
            logger.info(
                "query_generation_completed generation_id=%s", generation_id
            )
        else:
            for module in taxonomy.modules:
                module.search_queries = self._fallback_queries(module, request)

        # ── Step 3: Video Retrieval ──────────────────────────────────
        logger.info("video_search_started generation_id=%s", generation_id)
        module_candidates: dict[str, list[Video]] = {}

        for module in taxonomy.modules:
            queries = module.search_queries or self._fallback_queries(
                module, request
            )
            candidates = await self._ingestion.search_for_module(
                queries,
                request.source_config,
                language=request.language,
            )
            module_candidates[module.title] = candidates
            total_candidates += len(candidates)

            if debug_info is not None:
                debug_info.candidate_counts[module.title] = len(candidates)

            logger.debug(
                "video_search_module_completed module='%s' candidates=%d",
                module.title,
                len(candidates),
            )

        logger.info(
            "video_search_completed generation_id=%s total_candidates=%d",
            generation_id,
            total_candidates,
        )

        # ── Step 4–8: Ranking + Selection ────────────────────────────
        logger.info("matching_started generation_id=%s", generation_id)
        module_selected: dict[str, list[ScoredVideo]] = {}

        for module in taxonomy.modules:
            candidates = module_candidates.get(module.title, [])
            if not candidates:
                logger.warning(
                    "No candidates for module='%s', skipping",
                    module.title,
                )
                module_selected[module.title] = []
                continue

            # Update lexical scorer config
            self._lexical_scorer._config = request.matching_config

            # Rank all candidates
            scored = await self._ranking_service.rank_videos(
                module=module,
                videos=candidates,
                ranking_config=request.ranking_config,
                video_config=request.video_config,
                matching_config=request.matching_config,
                selection_config=request.selection_config,
                cross_encoder_config=request.cross_encoder_config,
                tfidf_config=request.tfidf_config,
                difficulty_config=request.difficulty_config,
                target_language=request.language,
            )

            # Select with diversity
            selected = self._ranking_service.select_diverse(
                scored, request.selection_config
            )
            module_selected[module.title] = selected
            total_selected += len(selected)

            # Debug info
            if debug_info is not None:
                debug_info.score_breakdowns[module.title] = [
                    {
                        "video_id": v.source_id,
                        "title": v.title,
                        "cosine": round(v.cosine_score, 4),
                        "cross_encoder": round(v.cross_encoder_score, 4),
                        "lexical": round(v.lexical_score, 4),
                        "metadata": round(v.metadata_score, 4),
                        "tfidf": round(v.tfidf_score, 4),
                        "difficulty": round(v.difficulty_score, 4),
                        "duration": round(v.duration_score, 4),
                        "final": round(v.final_score, 4),
                        "detected_difficulty": v.detected_difficulty,
                        "selected": v in selected,
                    }
                    for v in scored[:20]  # Include top 20 for debug
                ]

        logger.info(
            "matching_completed generation_id=%s selected=%d",
            generation_id,
            total_selected,
        )

        # ── Step 9: Course Assembly ──────────────────────────────────
        logger.info("course_assembly_started generation_id=%s", generation_id)
        course = self._assembler.assemble(taxonomy, module_selected, request)
        logger.info("course_assembly_completed generation_id=%s", generation_id)

        # ── Step 10: Validation ──────────────────────────────────────
        logger.info("course_validation_started generation_id=%s", generation_id)
        # Pydantic validation happens automatically via the Course model
        Course.model_validate(course.model_dump())
        logger.info("course_validation_completed generation_id=%s", generation_id)

        # ── Step 11: Persistence ─────────────────────────────────────
        if self._db is not None:
            logger.info("persistence_started generation_id=%s", generation_id)
            await self._persist_course(
                generation_id, course, taxonomy, module_selected, request
            )
            logger.info("persistence_completed generation_id=%s", generation_id)

        # ── Build Response ───────────────────────────────────────────
        elapsed = time.time() - start_time
        metadata = PipelineMetadata(
            generation_id=generation_id,
            modules_generated=len(taxonomy.modules),
            videos_considered=total_candidates,
            videos_selected=total_selected,
            processing_time_seconds=round(elapsed, 2),
        )

        response = CourseGenerationResponse(
            status="completed",
            generation_id=generation_id,
            course=course,
            metadata=metadata,
            debug=debug_info,
        )

        logger.info(
            "course_generation_completed generation_id=%s "
            "modules=%d videos=%d time=%.2fs",
            generation_id,
            len(taxonomy.modules),
            total_selected,
            elapsed,
        )

        return response

    def _fallback_queries(
        self, module, request: CourseGenerationRequest
    ) -> list[str]:
        """Generate fallback search queries from module keywords."""
        queries = []
        # Primary query: topic + module title
        queries.append(f"{request.topic} {module.title} tutorial")
        # Secondary: module title + difficulty
        queries.append(f"{module.title} {request.difficulty}")
        # Tertiary: keywords-based
        if module.keywords:
            queries.append(" ".join(module.keywords[:3]))
        return queries[: request.search_config.queries_per_module]

    async def _persist_course(
        self,
        generation_id: str,
        course: Course,
        taxonomy: CourseTaxonomy,
        module_videos: dict[str, list[ScoredVideo]],
        request: CourseGenerationRequest,
    ) -> None:
        """Persist the generated course to the database."""
        try:
            from sqlalchemy import select

            course_record = CourseRecord(
                generation_id=generation_id,
                course_title=course.course_title,
                description=course.description,
                difficulty=course.difficulty,
                language=course.language,
                topic=request.topic,
                target_audience=request.target_audience,
                learning_objectives=course.learning_objectives,
                prerequisites=course.prerequisites,
                request_payload=request.model_dump(mode="json"),
            )
            self._db.add(course_record)
            await self._db.flush()

            for module in taxonomy.modules:
                module_record = ModuleRecord(
                    course_id=course_record.id,
                    title=module.title,
                    description=module.description,
                    order=module.order,
                    learning_objectives=module.learning_objectives,
                )
                self._db.add(module_record)
                await self._db.flush()

                selected = module_videos.get(module.title, [])
                for order_idx, scored_video in enumerate(selected):
                    # Upsert video record by source_id
                    result = await self._db.execute(
                        select(VideoRecord).where(
                            VideoRecord.source_id == scored_video.source_id
                        )
                    )
                    video_record = result.scalar_one_or_none()

                    if video_record is None:
                        video_record = VideoRecord(
                            source=scored_video.source,
                            source_id=scored_video.source_id,
                            title=scored_video.title,
                            description=scored_video.description,
                            url=scored_video.url,
                            channel_name=scored_video.channel_name,
                            channel_id=scored_video.channel_id,
                            duration_seconds=scored_video.duration_seconds,
                            language=scored_video.language,
                            published_at=scored_video.published_at,
                            tags=scored_video.tags,
                            thumbnail_url=scored_video.thumbnail_url,
                            view_count=scored_video.view_count,
                            like_count=scored_video.like_count,
                            category=scored_video.category,
                        )
                        self._db.add(video_record)
                        await self._db.flush()

                    mv_record = ModuleVideoRecord(
                        module_id=module_record.id,
                        video_id=video_record.id,
                        order=order_idx + 1,
                        relevance_score=scored_video.final_score,
                        cosine_score=scored_video.cosine_score,
                        cross_encoder_score=scored_video.cross_encoder_score,
                        lexical_score=scored_video.lexical_score,
                        metadata_score=scored_video.metadata_score,
                        tfidf_score=scored_video.tfidf_score,
                        difficulty_score=scored_video.difficulty_score,
                        duration_score=scored_video.duration_score,
                        detected_difficulty=scored_video.detected_difficulty,
                        difficulty_confidence=scored_video.difficulty_confidence,
                    )
                    self._db.add(mv_record)

            await self._db.flush()
            logger.info("Course persisted: generation_id=%s", generation_id)

        except Exception as exc:
            logger.error(
                "Failed to persist course generation_id=%s: %s",
                generation_id,
                exc,
            )
            # Don't fail the pipeline if persistence fails

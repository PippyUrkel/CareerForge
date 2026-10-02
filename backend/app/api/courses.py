"""Course generation API routes."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import AppSettings, get_settings
from app.db.session import get_db
from app.schemas.course import CourseGenerationResponse, CourseListItem, CourseListResponse
from app.schemas.course_request import CourseGenerationRequest
from app.services.llm.base import LLMError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/courses", tags=["courses"])


def _get_pipeline(
    settings: AppSettings,
    db: AsyncSession | None = None,
):
    """Build the course generation pipeline with all dependencies.

    Services are instantiated fresh per-request but models (embedding,
    cross-encoder) are cached via class-level singletons.
    """
    from app.pipeline.course_generation import CourseGenerationPipeline
    from app.services.embeddings.service import EmbeddingService
    from app.services.ingestion.adapter import VideoIngestionAdapter
    from app.services.llm.provider import OpenAIProvider
    from app.services.matching.cross_encoder import CrossEncoderScorer
    from app.services.videos.base import VideoSource
    from app.services.videos.catalog import PresetCatalogVideoSource

    # LLM Provider
    try:
        llm_provider = OpenAIProvider(settings)
    except LLMError:
        llm_provider = None

    # Video sources
    sources: list[VideoSource] = []

    # YouTube source (only if API key is configured)
    if settings.youtube_api_key:
        try:
            from app.services.videos.youtube import YouTubeVideoSource

            sources.append(YouTubeVideoSource(settings))
        except Exception as exc:
            logger.warning("YouTube source unavailable: %s", exc)

    # Preset catalog (always available)
    sources.append(PresetCatalogVideoSource())

    ingestion_adapter = VideoIngestionAdapter(sources)

    # Embedding service
    embedding_service = EmbeddingService(
        model_name=settings.embedding_model,
        device=settings.embedding_device,
    )

    # Cross-encoder scorer
    cross_encoder_scorer = CrossEncoderScorer(
        model_name=settings.cross_encoder_model,
        device=settings.embedding_device,
    )

    return CourseGenerationPipeline(
        llm_provider=llm_provider,
        ingestion_adapter=ingestion_adapter,
        embedding_service=embedding_service,
        cross_encoder_scorer=cross_encoder_scorer,
        db_session=db,
    )


@router.post(
    "/generate",
    response_model=CourseGenerationResponse,
    summary="Generate an AI-powered course",
    description=(
        "Generate a complete course with modules and curated video content. "
        "All pipeline parameters are configurable through the request body. "
        "Only 'topic' is required — everything else has sensible defaults."
    ),
    responses={
        200: {"description": "Successfully generated course"},
        422: {"description": "Validation error in request parameters"},
        500: {"description": "Pipeline execution error"},
        503: {"description": "Required external service unavailable"},
    },
)
async def generate_course(
    request: CourseGenerationRequest,
    settings: AppSettings = Depends(get_settings),
    db: AsyncSession = Depends(get_db),
) -> CourseGenerationResponse:
    """Generate a complete AI-powered course.

    The pipeline:
    1. Generates a course taxonomy using an LLM
    2. Retrieves candidate videos from multiple sources
    3. Ranks videos using multi-signal scoring (cosine, lexical, TF-IDF, etc.)
    4. Selects diverse, high-quality videos per module
    5. Assembles and validates the final course
    6. Persists the result to the database
    """
    logger.info(
        "Course generation requested: topic='%s' difficulty=%s",
        request.topic,
        request.difficulty,
    )

    pipeline = _get_pipeline(settings, db)

    if pipeline._llm is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "LLM service is not configured. "
                "Set LLM_API_KEY environment variable."
            ),
        )

    try:
        response = await pipeline.generate(request)
        if request.user_id:
            try:
                from app.db.appwrite_service import save_course_to_appwrite

                course_payload = response.course.model_dump(mode="json")
                meta_payload = response.metadata.model_dump(mode="json") if response.metadata else None
                await save_course_to_appwrite(
                    generation_id=response.generation_id,
                    course_data=course_payload,
                    user_id=request.user_id,
                    metadata_data=meta_payload,
                    settings=settings,
                )
            except Exception as appwrite_err:
                logger.warning("Could not persist course to Appwrite: %s", appwrite_err)
    except LLMError as exc:
        logger.error("LLM error during course generation: %s", exc)
        raise HTTPException(
            status_code=502,
            detail=f"LLM service error: {exc}",
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected error during course generation")
        raise HTTPException(
            status_code=500,
            detail=f"Course generation failed: {exc}",
        ) from exc

    return response


@router.get(
    "",
    response_model=CourseListResponse,
    summary="List all stored courses",
    description="Retrieve all courses stored in the careerforge database, ordered newest first.",
)
async def list_courses(
    db: AsyncSession = Depends(get_db),
) -> CourseListResponse:
    """Retrieve all stored courses from the database."""
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    from app.db.models import CourseRecord, ModuleRecord, ModuleVideoRecord

    result = await db.execute(
        select(CourseRecord)
        .options(
            selectinload(CourseRecord.modules)
            .selectinload(ModuleRecord.module_videos)
            .selectinload(ModuleVideoRecord.video)
        )
        .order_by(CourseRecord.created_at.desc())
    )
    course_records = result.scalars().all()

    course_items = []
    for c in course_records:
        total_videos = 0
        total_duration = 0
        for m in c.modules:
            total_videos += len(m.module_videos)
            for mv in m.module_videos:
                if mv.video and mv.video.duration_seconds:
                    total_duration += mv.video.duration_seconds

        course_items.append(
            CourseListItem(
                id=c.id,
                generation_id=c.generation_id,
                course_title=c.course_title,
                description=c.description,
                difficulty=c.difficulty,
                language=c.language,
                topic=c.topic,
                target_audience=c.target_audience,
                learning_objectives=c.learning_objectives or [],
                prerequisites=c.prerequisites or [],
                created_at=c.created_at.isoformat() if c.created_at else None,
                module_count=len(c.modules),
                video_count=total_videos,
                total_duration_seconds=total_duration,
            )
        )

    return CourseListResponse(
        total=len(course_items),
        courses=course_items,
    )


@router.get(
    "/{course_id}",
    response_model=CourseGenerationResponse,
    summary="Get a stored course by ID",
    description="Retrieve a complete course with modules and videos by its course ID or generation ID.",
    responses={
        200: {"description": "Course found"},
        404: {"description": "Course not found"},
    },
)
async def get_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
) -> CourseGenerationResponse:
    """Retrieve a stored course with all modules and video details."""
    from sqlalchemy import or_, select
    from sqlalchemy.orm import selectinload

    from app.db.models import CourseRecord, ModuleRecord, ModuleVideoRecord
    from app.schemas.course import Course, CourseModule, CourseVideo, PipelineMetadata

    result = await db.execute(
        select(CourseRecord)
        .where(or_(CourseRecord.id == course_id, CourseRecord.generation_id == course_id))
        .options(
            selectinload(CourseRecord.modules)
            .selectinload(ModuleRecord.module_videos)
            .selectinload(ModuleVideoRecord.video)
        )
    )
    course_record = result.scalar_one_or_none()

    if course_record is None:
        raise HTTPException(
            status_code=404,
            detail=f"Course '{course_id}' not found in database.",
        )

    # Reconstruct modules and videos with correct order
    modules = []
    total_videos = 0
    for m_rec in sorted(course_record.modules, key=lambda m: m.order):
        videos = []
        for mv_rec in sorted(m_rec.module_videos, key=lambda mv: mv.order):
            v = mv_rec.video
            if v:
                videos.append(
                    CourseVideo(
                        video_id=v.id,
                        source=v.source,
                        title=v.title,
                        url=v.url,
                        channel_name=v.channel_name,
                        duration_seconds=v.duration_seconds,
                        difficulty=mv_rec.detected_difficulty,
                        difficulty_confidence=mv_rec.difficulty_confidence,
                        relevance_score=mv_rec.relevance_score or 0.0,
                        order=mv_rec.order,
                    )
                )
        total_videos += len(videos)
        modules.append(
            CourseModule(
                title=m_rec.title,
                description=m_rec.description or "",
                order=m_rec.order,
                learning_objectives=m_rec.learning_objectives or [],
                videos=videos,
            )
        )

    assembled_course = Course(
        course_title=course_record.course_title,
        description=course_record.description or "",
        difficulty=course_record.difficulty or "beginner",
        language=course_record.language or "en",
        learning_objectives=course_record.learning_objectives or [],
        prerequisites=course_record.prerequisites or [],
        target_audience=course_record.target_audience or "All Learners",
        modules=modules,
    )

    metadata = PipelineMetadata(
        generation_id=course_record.generation_id,
        modules_generated=len(modules),
        videos_considered=total_videos,
        videos_selected=total_videos,
        pipeline_version="1.0",
        processing_time_seconds=None,
    )

    return CourseGenerationResponse(
        status="completed",
        generation_id=course_record.generation_id,
        course=assembled_course,
        metadata=metadata,
    )


@router.delete(
    "/{course_id}",
    summary="Delete a stored course",
    description="Remove a course from the database by ID or generation ID.",
    responses={
        200: {"description": "Course deleted successfully"},
        404: {"description": "Course not found"},
    },
)
async def delete_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a course and cascade its modules."""
    from sqlalchemy import or_, select

    from app.db.models import CourseRecord

    result = await db.execute(
        select(CourseRecord).where(
            or_(CourseRecord.id == course_id, CourseRecord.generation_id == course_id)
        )
    )
    course_record = result.scalar_one_or_none()

    if course_record is None:
        raise HTTPException(
            status_code=404,
            detail=f"Course '{course_id}' not found in database.",
        )

    await db.delete(course_record)
    await db.commit()

    return {
        "status": "deleted",
        "id": course_record.id,
        "generation_id": course_record.generation_id,
        "course_title": course_record.course_title,
    }


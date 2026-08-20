"""Course generation API routes."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import AppSettings, get_settings
from app.db.session import get_db
from app.schemas.course import CourseGenerationResponse
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

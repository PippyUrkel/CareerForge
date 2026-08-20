"""Video ingestion adapter — aggregates results from multiple video sources."""

from __future__ import annotations

import asyncio
import logging
from typing import TYPE_CHECKING

from app.schemas.video import Video
from app.services.videos.base import VideoSource

if TYPE_CHECKING:
    from app.schemas.course_request import CourseGenerationRequest, SourceConfig

logger = logging.getLogger(__name__)


class VideoIngestionAdapter:
    """Aggregates and deduplicates videos from multiple video sources.

    Manages the lifecycle of video sources and provides a unified search
    interface that queries all enabled sources concurrently.
    """

    def __init__(self, sources: list[VideoSource]) -> None:
        self._sources = sources

    async def search_for_module(
        self,
        queries: list[str],
        source_config: SourceConfig,
        *,
        language: str | None = None,
    ) -> list[Video]:
        """Search all enabled sources with multiple queries and deduplicate results.

        Args:
            queries: List of search queries (typically generated per module).
            source_config: Configuration controlling which sources are enabled.
            language: Preferred language for results.

        Returns:
            A deduplicated list of normalized Video objects.
        """
        all_videos: list[Video] = []
        max_per_query = max(
            5,
            source_config.max_candidates_per_module // max(len(queries), 1),
        )

        # Build list of search tasks
        tasks: list[asyncio.Task] = []
        for source in self._sources:
            if not self._is_source_enabled(source, source_config):
                continue
            for query in queries:
                task = asyncio.create_task(
                    self._safe_search(source, query, max_per_query, language)
                )
                tasks.append(task)

        if not tasks:
            logger.warning("No video sources are enabled")
            return []

        # Execute all searches concurrently
        results = await asyncio.gather(*tasks)
        for result_list in results:
            all_videos.extend(result_list)

        # Deduplicate by source_id
        deduplicated = self._deduplicate(all_videos)

        # Enforce max candidates
        if len(deduplicated) > source_config.max_candidates_per_module:
            deduplicated = deduplicated[: source_config.max_candidates_per_module]

        logger.info(
            "Ingested %d unique videos from %d total results across %d queries",
            len(deduplicated),
            len(all_videos),
            len(queries),
        )

        return deduplicated

    async def _safe_search(
        self,
        source: VideoSource,
        query: str,
        max_results: int,
        language: str | None,
    ) -> list[Video]:
        """Execute a search with error handling so one failure doesn't break everything."""
        try:
            return await source.search(
                query, max_results=max_results, language=language
            )
        except Exception as exc:
            logger.error(
                "Video search failed for source=%s, query='%s': %s",
                source.source_name,
                query,
                exc,
            )
            return []

    def _is_source_enabled(
        self, source: VideoSource, config: SourceConfig
    ) -> bool:
        """Check if a source is enabled in the configuration."""
        if source.source_name == "youtube" and not config.youtube_enabled:
            return False
        if source.source_name == "catalog" and not config.preset_catalog_enabled:
            return False
        return True

    def _deduplicate(self, videos: list[Video]) -> list[Video]:
        """Remove duplicate videos based on source_id."""
        seen: set[str] = set()
        unique: list[Video] = []
        for video in videos:
            key = f"{video.source}:{video.source_id}"
            if key not in seen:
                seen.add(key)
                unique.append(video)
        return unique

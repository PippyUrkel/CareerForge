"""Abstract base class for video sources."""

from __future__ import annotations

import abc

from app.schemas.video import Video


class VideoSource(abc.ABC):
    """Abstract video source interface.

    All video providers (YouTube, preset catalog, etc.) must implement
    this interface to keep the pipeline decoupled from any specific provider.
    """

    @property
    @abc.abstractmethod
    def source_name(self) -> str:
        """Return the name of this video source (e.g., 'youtube', 'catalog')."""
        ...

    @abc.abstractmethod
    async def search(
        self,
        query: str,
        *,
        max_results: int = 25,
        language: str | None = None,
    ) -> list[Video]:
        """Search for videos matching a query.

        Args:
            query: Search query string.
            max_results: Maximum number of results to return.
            language: Preferred language for results.

        Returns:
            A list of normalized Video objects.
        """
        ...

    @abc.abstractmethod
    async def get_video(self, video_id: str) -> Video | None:
        """Retrieve a single video by its source-specific ID.

        Args:
            video_id: The provider's video ID.

        Returns:
            A normalized Video if found, else None.
        """
        ...

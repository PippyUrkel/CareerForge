"""YouTube Data API video source adapter."""

from __future__ import annotations

import logging
import re
import uuid
from datetime import datetime, timezone

import httpx
import isodate

from app.core.config import AppSettings
from app.schemas.video import Video
from app.services.videos.base import VideoSource

logger = logging.getLogger(__name__)

_YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
_YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"


class YouTubeVideoSource(VideoSource):
    """YouTube Data API v3 adapter.

    Searches for videos and retrieves metadata using the YouTube API,
    then normalizes results into the internal Video model.
    """

    def __init__(self, settings: AppSettings) -> None:
        if not settings.youtube_api_key:
            raise ValueError(
                "YOUTUBE_API_KEY is not configured. "
                "Set the environment variable to use YouTube as a video source."
            )
        self._api_key = settings.youtube_api_key
        self._max_results = settings.youtube_max_results
        self._client = httpx.AsyncClient(timeout=30.0)

    @property
    def source_name(self) -> str:
        return "youtube"

    async def search(
        self,
        query: str,
        *,
        max_results: int = 25,
        language: str | None = None,
    ) -> list[Video]:
        """Search YouTube for videos matching a query."""
        effective_max = min(max_results, self._max_results, 50)  # YT API max is 50

        params: dict = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "maxResults": effective_max,
            "key": self._api_key,
            "videoEmbeddable": "true",
            "safeSearch": "strict",
            "order": "relevance",
        }

        if language:
            params["relevanceLanguage"] = _normalize_language_code(language)

        try:
            response = await self._client.get(_YOUTUBE_SEARCH_URL, params=params)
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPStatusError as exc:
            logger.error(
                "YouTube search API error: status=%d, body=%s",
                exc.response.status_code,
                exc.response.text[:500],
            )
            return []
        except httpx.RequestError as exc:
            logger.error("YouTube search request failed: %s", exc)
            return []

        video_ids = []
        for item in data.get("items", []):
            vid = item.get("id", {}).get("videoId")
            if vid:
                video_ids.append(vid)

        if not video_ids:
            return []

        # Fetch full video details (duration, stats, etc.)
        return await self._get_video_details(video_ids)

    async def get_video(self, video_id: str) -> Video | None:
        """Retrieve a single YouTube video by its video ID."""
        videos = await self._get_video_details([video_id])
        return videos[0] if videos else None

    async def _get_video_details(self, video_ids: list[str]) -> list[Video]:
        """Fetch detailed metadata for a list of YouTube video IDs."""
        if not video_ids:
            return []

        params = {
            "part": "snippet,contentDetails,statistics",
            "id": ",".join(video_ids),
            "key": self._api_key,
        }

        try:
            response = await self._client.get(_YOUTUBE_VIDEOS_URL, params=params)
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPStatusError as exc:
            logger.error(
                "YouTube videos API error: status=%d, body=%s",
                exc.response.status_code,
                exc.response.text[:500],
            )
            return []
        except httpx.RequestError as exc:
            logger.error("YouTube video details request failed: %s", exc)
            return []

        videos: list[Video] = []
        for item in data.get("items", []):
            video = self._normalize_video(item)
            if video:
                videos.append(video)

        logger.debug("Fetched details for %d/%d YouTube videos", len(videos), len(video_ids))
        return videos

    def _normalize_video(self, item: dict) -> Video | None:
        """Normalize a YouTube API video item into our internal Video model."""
        try:
            snippet = item.get("snippet", {})
            content_details = item.get("contentDetails", {})
            statistics = item.get("statistics", {})

            video_id = item["id"]
            title = snippet.get("title", "")

            # Skip private/deleted videos
            if not title or title in ("Private video", "Deleted video"):
                return None

            # Parse duration
            duration_seconds = None
            duration_iso = content_details.get("duration")
            if duration_iso:
                try:
                    duration_seconds = int(
                        isodate.parse_duration(duration_iso).total_seconds()
                    )
                except (ValueError, isodate.ISO8601Error):
                    pass

            # Parse published date
            published_at = None
            published_str = snippet.get("publishedAt")
            if published_str:
                try:
                    published_at = datetime.fromisoformat(
                        published_str.replace("Z", "+00:00")
                    )
                except ValueError:
                    pass

            # Parse numeric stats
            view_count = _safe_int(statistics.get("viewCount"))
            like_count = _safe_int(statistics.get("likeCount"))

            # Get best thumbnail
            thumbnails = snippet.get("thumbnails", {})
            thumbnail_url = None
            for quality in ("high", "medium", "default"):
                if quality in thumbnails:
                    thumbnail_url = thumbnails[quality].get("url")
                    break

            return Video(
                id=str(uuid.uuid4()),
                source="youtube",
                source_id=video_id,
                title=title,
                description=snippet.get("description"),
                url=f"https://www.youtube.com/watch?v={video_id}",
                channel_name=snippet.get("channelTitle"),
                channel_id=snippet.get("channelId"),
                duration_seconds=duration_seconds,
                language=snippet.get("defaultAudioLanguage")
                or snippet.get("defaultLanguage"),
                published_at=published_at,
                tags=snippet.get("tags", []),
                thumbnail_url=thumbnail_url,
                view_count=view_count,
                like_count=like_count,
                category=snippet.get("categoryId"),
            )
        except Exception as exc:
            logger.warning("Failed to normalize YouTube video: %s", exc)
            return None

    async def close(self) -> None:
        """Close the underlying HTTP client."""
        await self._client.aclose()


def _safe_int(value: str | int | None) -> int | None:
    """Safely convert a value to int."""
    if value is None:
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


def _normalize_language_code(language: str) -> str:
    """Convert a language name to a 2-letter ISO code for YouTube API."""
    _LANG_MAP = {
        "english": "en",
        "spanish": "es",
        "french": "fr",
        "german": "de",
        "portuguese": "pt",
        "chinese": "zh",
        "japanese": "ja",
        "korean": "ko",
        "hindi": "hi",
        "arabic": "ar",
        "russian": "ru",
        "italian": "it",
        "dutch": "nl",
        "turkish": "tr",
        "polish": "pl",
        "swedish": "sv",
    }
    lower = language.lower().strip()
    if len(lower) == 2:
        return lower
    return _LANG_MAP.get(lower, "en")

"""Metadata scoring service for video quality signals."""

from __future__ import annotations

import logging
import math
from datetime import datetime, timezone

from app.schemas.course_request import VideoConfig
from app.schemas.video import Video

logger = logging.getLogger(__name__)


class MetadataScorer:
    """Scores videos based on metadata quality signals.

    Signals are individually normalized to [0, 1] before being combined
    to prevent any single raw value (e.g., view count) from dominating.

    Scoring dimensions:
    - Title quality (length, information density)
    - Description availability and quality
    - Duration proximity to target
    - Language match
    - View count (log-scaled)
    - Publication recency
    - Tag availability
    - Source reliability
    """

    def score(
        self,
        video: Video,
        video_config: VideoConfig,
        *,
        target_language: str | None = None,
    ) -> float:
        """Compute a metadata quality score for a video.

        Args:
            video: The candidate video.
            video_config: Video configuration with duration preferences.
            target_language: Target language for the course.

        Returns:
            A normalized score in [0, 1].
        """
        scores: list[tuple[float, float]] = []  # (weight, score) pairs

        # Title quality
        scores.append((0.15, self._title_quality(video.title)))

        # Description quality
        scores.append((0.10, self._description_quality(video.description)))

        # Duration proximity
        scores.append(
            (0.20, self._duration_score(video.duration_seconds, video_config))
        )

        # Language match
        if target_language:
            scores.append(
                (0.15, self._language_match(video.language, target_language))
            )
        else:
            scores.append((0.15, 0.5))  # neutral if no target language

        # View count (popularity signal)
        scores.append((0.15, self._view_count_score(video.view_count)))

        # Publication recency
        scores.append((0.10, self._recency_score(video.published_at)))

        # Tag availability
        scores.append((0.10, self._tag_score(video.tags)))

        # Source reliability
        scores.append((0.05, self._source_reliability(video.source)))

        # Weighted sum
        total_weight = sum(w for w, _ in scores)
        if total_weight == 0:
            return 0.0

        combined = sum(w * s for w, s in scores) / total_weight
        return min(1.0, max(0.0, combined))

    def _title_quality(self, title: str) -> float:
        """Score title based on length and information density."""
        if not title:
            return 0.0
        length = len(title)
        # Ideal title: 20-80 characters
        if 20 <= length <= 80:
            return 1.0
        elif length < 20:
            return length / 20.0
        else:
            return max(0.3, 1.0 - (length - 80) / 200.0)

    def _description_quality(self, description: str | None) -> float:
        """Score description based on availability and length."""
        if not description:
            return 0.0
        length = len(description)
        if length < 20:
            return 0.2
        elif length < 100:
            return 0.5
        elif length < 500:
            return 0.8
        else:
            return 1.0

    def _duration_score(
        self, duration: int | None, config: VideoConfig
    ) -> float:
        """Score duration based on proximity to target.

        Uses a Gaussian-like decay from the target duration.
        """
        if duration is None:
            return 0.3  # Unknown duration gets a low-neutral score

        target = config.preferred_duration_seconds or config.target_duration_seconds
        diff = abs(duration - target)
        sigma = target * 0.5  # Half the target as standard deviation

        score = math.exp(-(diff ** 2) / (2 * sigma ** 2))

        # Apply soft penalties for being outside the range
        if duration < config.min_duration_seconds:
            if not config.allow_shorter_videos:
                return 0.0
            score *= 0.5
        elif duration > config.max_duration_seconds:
            if not config.allow_longer_videos:
                return 0.0
            score *= 0.5

        return min(1.0, max(0.0, score))

    def _language_match(
        self, video_language: str | None, target_language: str
    ) -> float:
        """Score based on language match."""
        if not video_language:
            return 0.3  # Unknown language gets a low-neutral score

        vid_lang = video_language.lower().strip()[:2]
        target_lang = target_language.lower().strip()[:2]

        # Map common language names to codes
        lang_map = {"english": "en", "spanish": "es", "french": "fr", "german": "de"}
        vid_lang = lang_map.get(video_language.lower().strip(), vid_lang)
        target_lang = lang_map.get(target_language.lower().strip(), target_lang)

        if vid_lang == target_lang:
            return 1.0
        return 0.1

    def _view_count_score(self, view_count: int | None) -> float:
        """Score based on view count using logarithmic scaling."""
        if view_count is None or view_count <= 0:
            return 0.2

        # Log scale: 100 views = 0.3, 1000 = 0.5, 10000 = 0.7, 100000 = 0.9
        log_views = math.log10(max(1, view_count))
        score = min(1.0, log_views / 6.0)  # 1M views ≈ 1.0
        return max(0.1, score)

    def _recency_score(self, published_at: datetime | None) -> float:
        """Score based on publication recency."""
        if published_at is None:
            return 0.3

        now = datetime.now(timezone.utc)
        if published_at.tzinfo is None:
            published_at = published_at.replace(tzinfo=timezone.utc)

        age_days = (now - published_at).days

        if age_days < 0:
            return 0.5
        elif age_days < 365:
            return 1.0
        elif age_days < 730:
            return 0.8
        elif age_days < 1825:  # 5 years
            return 0.6
        else:
            return 0.4

    def _tag_score(self, tags: list[str]) -> float:
        """Score based on tag availability."""
        count = len(tags)
        if count == 0:
            return 0.0
        elif count < 3:
            return 0.4
        elif count < 8:
            return 0.7
        else:
            return 1.0

    def _source_reliability(self, source: str) -> float:
        """Score based on source reliability."""
        reliability_map = {
            "catalog": 0.9,  # Curated content
            "youtube": 0.7,  # Variable quality
        }
        return reliability_map.get(source, 0.5)

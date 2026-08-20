"""TF-IDF scoring service for term-importance-based relevance."""

from __future__ import annotations

import asyncio
import functools
import logging
from typing import TYPE_CHECKING

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.schemas.taxonomy import TaxonomyModule
from app.schemas.video import Video

if TYPE_CHECKING:
    from app.schemas.course_request import TFIDFConfig

logger = logging.getLogger(__name__)


class TFIDFScorer:
    """Computes TF-IDF similarity between module text and video text.

    Uses scikit-learn's TfidfVectorizer to determine important terms
    across the corpus of module + video texts, then computes cosine
    similarity in the TF-IDF space.
    """

    def __init__(self, config: TFIDFConfig | None = None) -> None:
        from app.schemas.course_request import TFIDFConfig as TFIDFConfigClass
        self._config = config or TFIDFConfigClass()

    async def score_videos(
        self,
        module: TaxonomyModule,
        videos: list[Video],
    ) -> list[float]:
        """Score videos against a module using TF-IDF similarity.

        Runs in a thread pool since TF-IDF vectorization is CPU-bound.

        Args:
            module: The taxonomy module.
            videos: List of candidate videos.

        Returns:
            List of TF-IDF similarity scores in [0, 1].
        """
        if not videos:
            return []

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            functools.partial(self._score_sync, module, videos),
        )

    def _score_sync(
        self,
        module: TaxonomyModule,
        videos: list[Video],
    ) -> list[float]:
        """Synchronous TF-IDF scoring."""
        # Build module text
        module_text = self._build_module_text(module)

        # Build video texts
        video_texts = [self._build_video_text(v) for v in videos]

        # Combine all texts: module first, then videos
        all_texts = [module_text] + video_texts

        try:
            vectorizer = TfidfVectorizer(
                max_features=self._config.max_features,
                ngram_range=(self._config.ngram_min, self._config.ngram_max),
                stop_words="english",
                lowercase=True,
                sublinear_tf=True,
            )
            tfidf_matrix = vectorizer.fit_transform(all_texts)
        except ValueError as exc:
            # Can happen if all texts are empty/stop words only
            logger.warning("TF-IDF vectorization failed: %s", exc)
            return [0.0] * len(videos)

        # Module vector is the first row
        module_vector = tfidf_matrix[0:1]
        video_vectors = tfidf_matrix[1:]

        # Compute cosine similarity
        similarities = cosine_similarity(module_vector, video_vectors).flatten()

        return [max(0.0, min(1.0, float(s))) for s in similarities]

    def _build_module_text(self, module: TaxonomyModule) -> str:
        """Build text representation for TF-IDF."""
        parts = [module.title, module.description]
        parts.extend(module.keywords)
        if module.concepts:
            parts.extend(c.name for c in module.concepts)
        if module.learning_objectives:
            parts.extend(module.learning_objectives)
        return " ".join(parts)

    def _build_video_text(self, video: Video) -> str:
        """Build text representation for TF-IDF."""
        parts = [video.title]
        if video.description:
            parts.append(video.description[:500])
        if video.tags:
            parts.extend(video.tags[:15])
        return " ".join(parts)

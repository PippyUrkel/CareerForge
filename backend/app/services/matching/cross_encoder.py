"""Cross-encoder reranking service."""

from __future__ import annotations

import asyncio
import functools
import logging

logger = logging.getLogger(__name__)


class CrossEncoderScorer:
    """Reranks candidate videos using a cross-encoder model.

    Cross-encoders are more accurate than bi-encoders for similarity
    but are much slower, so they are only applied to the top-K candidates
    after initial cosine filtering.

    Model loading is lazy and cached.
    """

    _model_cache: dict[str, object] = {}

    def __init__(
        self,
        model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2",
        device: str = "cpu",
    ) -> None:
        self._model_name = model_name
        self._device = device
        self._model = None

    def _get_model(self):
        """Lazy-load and cache the cross-encoder model."""
        if self._model is not None:
            return self._model

        cache_key = f"{self._model_name}:{self._device}"
        if cache_key in CrossEncoderScorer._model_cache:
            self._model = CrossEncoderScorer._model_cache[cache_key]
            return self._model

        from sentence_transformers import CrossEncoder

        logger.info(
            "Loading cross-encoder model: %s on device: %s",
            self._model_name,
            self._device,
        )
        model = CrossEncoder(self._model_name, device=self._device)
        CrossEncoderScorer._model_cache[cache_key] = model
        self._model = model
        return model

    async def score_pairs(
        self,
        query: str,
        documents: list[str],
        *,
        batch_size: int = 16,
    ) -> list[float]:
        """Score query-document pairs using the cross-encoder.

        Runs in a thread pool to avoid blocking the event loop.

        Args:
            query: The module text representation.
            documents: List of video text representations.
            batch_size: Batch size for inference.

        Returns:
            List of relevance scores (one per document).
        """
        if not documents:
            return []

        loop = asyncio.get_event_loop()
        scores = await loop.run_in_executor(
            None,
            functools.partial(
                self._score_sync, query, documents, batch_size=batch_size
            ),
        )
        return scores

    def _score_sync(
        self,
        query: str,
        documents: list[str],
        *,
        batch_size: int = 16,
    ) -> list[float]:
        """Synchronous cross-encoder scoring."""
        model = self._get_model()

        pairs = [[query, doc] for doc in documents]
        raw_scores = model.predict(pairs, batch_size=batch_size, show_progress_bar=False)

        # Normalize scores to [0, 1] using sigmoid-like clamping
        normalized = []
        for score in raw_scores:
            s = float(score)
            # Cross-encoder scores can be arbitrary; map to [0, 1]
            # Using a simple min-max within the batch, or sigmoid
            normalized.append(s)

        # Min-max normalize within the batch
        if normalized:
            min_s = min(normalized)
            max_s = max(normalized)
            rng = max_s - min_s
            if rng > 0:
                normalized = [(s - min_s) / rng for s in normalized]
            else:
                normalized = [0.5 for _ in normalized]

        return normalized

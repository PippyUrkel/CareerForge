"""Cosine similarity scoring between module and video embeddings."""

from __future__ import annotations

import logging

import numpy as np

logger = logging.getLogger(__name__)


class CosineScorer:
    """Computes cosine similarity between module and video embedding vectors.

    Assumes embeddings are L2-normalized (dot product == cosine similarity).
    """

    def score(
        self,
        module_embedding: np.ndarray,
        video_embedding: np.ndarray,
    ) -> float:
        """Compute cosine similarity between a module and a video embedding.

        Args:
            module_embedding: 1-D embedding vector for the module.
            video_embedding: 1-D embedding vector for the video.

        Returns:
            Cosine similarity in [-1, 1], clamped to [0, 1].
        """
        if module_embedding.size == 0 or video_embedding.size == 0:
            return 0.0

        dot = float(np.dot(module_embedding, video_embedding))
        # Clamp to [0, 1] — negative similarity means irrelevant
        return max(0.0, min(1.0, dot))

    def score_batch(
        self,
        module_embedding: np.ndarray,
        video_embeddings: np.ndarray,
    ) -> list[float]:
        """Score a batch of videos against a single module embedding.

        Args:
            module_embedding: 1-D embedding vector for the module.
            video_embeddings: 2-D array of shape (n_videos, embedding_dim).

        Returns:
            List of cosine similarity scores.
        """
        if module_embedding.size == 0 or video_embeddings.size == 0:
            return []

        # For normalized vectors, dot product == cosine similarity
        scores = video_embeddings @ module_embedding
        return [max(0.0, min(1.0, float(s))) for s in scores]

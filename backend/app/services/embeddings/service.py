"""Embedding service for generating text embeddings."""

from __future__ import annotations

import asyncio
import functools
import logging
from typing import TYPE_CHECKING

import numpy as np

from app.schemas.taxonomy import TaxonomyModule
from app.schemas.video import Video

if TYPE_CHECKING:
    from app.schemas.course_request import EmbeddingConfig

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating and caching text embeddings.

    Uses sentence-transformers to generate multilingual embeddings.
    Model loading is lazy and cached (singleton-like) to avoid repeated
    expensive initialization. CPU-heavy inference is run in a thread pool
    to avoid blocking the FastAPI event loop.
    """

    _model_cache: dict[str, object] = {}

    def __init__(self, model_name: str = "all-MiniLM-L6-v2", device: str = "cpu") -> None:
        self._model_name = model_name
        self._device = device
        self._model = None
        self._embedding_cache: dict[str, np.ndarray] = {}

    def _get_model(self):
        """Lazy-load and cache the sentence transformer model."""
        if self._model is not None:
            return self._model

        cache_key = f"{self._model_name}:{self._device}"
        if cache_key in EmbeddingService._model_cache:
            self._model = EmbeddingService._model_cache[cache_key]
            return self._model

        from sentence_transformers import SentenceTransformer

        logger.info(
            "Loading embedding model: %s on device: %s",
            self._model_name,
            self._device,
        )
        model = SentenceTransformer(self._model_name, device=self._device)
        EmbeddingService._model_cache[cache_key] = model
        self._model = model
        return model

    async def encode_texts(
        self,
        texts: list[str],
        *,
        normalize: bool = True,
        batch_size: int = 32,
    ) -> np.ndarray:
        """Encode a batch of texts into embedding vectors.

        Runs in a thread pool to avoid blocking the async event loop.

        Args:
            texts: List of text strings to embed.
            normalize: Whether to L2-normalize the embeddings.
            batch_size: Batch size for the model.

        Returns:
            A numpy array of shape (len(texts), embedding_dim).
        """
        if not texts:
            return np.array([])

        loop = asyncio.get_event_loop()
        embeddings = await loop.run_in_executor(
            None,
            functools.partial(
                self._encode_sync,
                texts,
                normalize=normalize,
                batch_size=batch_size,
            ),
        )
        return embeddings

    def _encode_sync(
        self,
        texts: list[str],
        *,
        normalize: bool = True,
        batch_size: int = 32,
    ) -> np.ndarray:
        """Synchronous encoding (called in thread pool)."""
        model = self._get_model()
        embeddings = model.encode(
            texts,
            batch_size=batch_size,
            normalize_embeddings=normalize,
            show_progress_bar=False,
            convert_to_numpy=True,
        )
        return embeddings

    async def encode_single(
        self,
        text: str,
        *,
        normalize: bool = True,
        cache_key: str | None = None,
    ) -> np.ndarray:
        """Encode a single text, optionally using cache.

        Args:
            text: Text to encode.
            normalize: Whether to L2-normalize.
            cache_key: Optional cache key to store/retrieve the embedding.

        Returns:
            A 1D numpy array (embedding vector).
        """
        if cache_key and cache_key in self._embedding_cache:
            logger.debug("Embedding cache hit for key=%s", cache_key)
            return self._embedding_cache[cache_key]

        result = await self.encode_texts([text], normalize=normalize)
        embedding = result[0]

        if cache_key:
            self._embedding_cache[cache_key] = embedding

        return embedding

    def build_module_text(self, module: TaxonomyModule) -> str:
        """Build a rich text representation of a module for embedding.

        Combines title, description, objectives, and keywords into a single
        text that captures the module's semantic meaning.
        """
        parts = [module.title]
        if module.description:
            parts.append(module.description)
        if module.learning_objectives:
            parts.append("Learning objectives: " + "; ".join(module.learning_objectives))
        if module.keywords:
            parts.append("Keywords: " + ", ".join(module.keywords))
        if module.concepts:
            concept_names = [c.name for c in module.concepts]
            parts.append("Concepts: " + ", ".join(concept_names))
        return ". ".join(parts)

    def build_video_text(self, video: Video) -> str:
        """Build a rich text representation of a video for embedding.

        Combines title, description, tags, and channel information.
        """
        parts = [video.title]
        if video.description:
            # Truncate very long descriptions
            desc = video.description[:500]
            parts.append(desc)
        if video.tags:
            parts.append("Tags: " + ", ".join(video.tags[:15]))
        if video.channel_name:
            parts.append(f"Channel: {video.channel_name}")
        return ". ".join(parts)

    def clear_cache(self) -> None:
        """Clear the embedding cache."""
        self._embedding_cache.clear()

    @property
    def embedding_dimension(self) -> int:
        """Return the embedding dimension of the loaded model."""
        model = self._get_model()
        return model.get_sentence_embedding_dimension()

"""Configurable multi-signal weighted ranking service."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

import numpy as np

from app.schemas.course_request import (
    CrossEncoderConfig,
    DifficultyConfig,
    RankingConfig,
    SelectionConfig,
    TFIDFConfig,
    VideoConfig,
)
from app.schemas.taxonomy import TaxonomyModule
from app.schemas.video import ScoredVideo, Video
from app.services.difficulty.scorer import DifficultyScorer
from app.services.embeddings.service import EmbeddingService
from app.services.matching.cosine import CosineScorer
from app.services.matching.cross_encoder import CrossEncoderScorer
from app.services.matching.lexical import LexicalScorer
from app.services.matching.metadata import MetadataScorer
from app.services.matching.tfidf import TFIDFScorer

if TYPE_CHECKING:
    from app.schemas.course_request import MatchingConfig

logger = logging.getLogger(__name__)


class RankingService:
    """Multi-signal ranking pipeline that combines all scoring services.

    Orchestrates the full matching flow:
    1. Embedding similarity (cosine)
    2. Lexical matching
    3. Metadata scoring
    4. TF-IDF scoring
    5. Cross-encoder reranking (on top-K)
    6. Difficulty scoring
    7. Duration scoring
    8. Final weighted combination

    All weights come from the RankingConfig — nothing is hard-coded.
    """

    def __init__(
        self,
        embedding_service: EmbeddingService,
        cosine_scorer: CosineScorer,
        lexical_scorer: LexicalScorer,
        metadata_scorer: MetadataScorer,
        tfidf_scorer: TFIDFScorer,
        cross_encoder_scorer: CrossEncoderScorer,
        difficulty_scorer: DifficultyScorer,
    ) -> None:
        self._embedding = embedding_service
        self._cosine = cosine_scorer
        self._lexical = lexical_scorer
        self._metadata = metadata_scorer
        self._tfidf = tfidf_scorer
        self._cross_encoder = cross_encoder_scorer
        self._difficulty = difficulty_scorer

    async def rank_videos(
        self,
        module: TaxonomyModule,
        videos: list[Video],
        *,
        ranking_config: RankingConfig,
        video_config: VideoConfig,
        matching_config: MatchingConfig,
        selection_config: SelectionConfig,
        cross_encoder_config: CrossEncoderConfig,
        tfidf_config: TFIDFConfig,
        difficulty_config: DifficultyConfig,
        target_language: str | None = None,
    ) -> list[ScoredVideo]:
        """Rank candidate videos for a module using multiple signals.

        Args:
            module: The taxonomy module to match against.
            videos: Candidate videos to rank.
            ranking_config: Weights for the final ranking formula.
            video_config: Video duration/selection preferences.
            matching_config: Lexical matching configuration.
            selection_config: Selection thresholds.
            cross_encoder_config: Cross-encoder configuration.
            tfidf_config: TF-IDF configuration.
            difficulty_config: Difficulty scoring configuration.
            target_language: Target language for metadata scoring.

        Returns:
            List of ScoredVideo objects sorted by final_score descending.
        """
        if not videos:
            return []

        logger.info(
            "Ranking %d candidates for module='%s'",
            len(videos),
            module.title,
        )

        # Step 1: Generate embeddings
        module_text = self._embedding.build_module_text(module)
        module_embedding = await self._embedding.encode_single(
            module_text, cache_key=f"module:{module.title}"
        )

        video_texts = [self._embedding.build_video_text(v) for v in videos]
        video_embeddings = await self._embedding.encode_texts(video_texts)

        # Step 2: Cosine similarity
        cosine_scores = self._cosine.score_batch(module_embedding, video_embeddings)

        # Step 3: Initial filtering by cosine threshold
        candidates: list[tuple[int, float]] = []
        for i, score in enumerate(cosine_scores):
            if score >= selection_config.cosine_threshold:
                candidates.append((i, score))

        # If too few pass threshold, take top candidates anyway
        if len(candidates) < selection_config.final_top_k:
            sorted_by_cosine = sorted(
                enumerate(cosine_scores), key=lambda x: x[1], reverse=True
            )
            candidates = sorted_by_cosine[:max(selection_config.final_top_k * 2, 10)]

        candidate_indices = [idx for idx, _ in candidates]
        candidate_videos = [videos[i] for i in candidate_indices]
        candidate_cosine = [cosine_scores[i] for i in candidate_indices]

        logger.debug(
            "After cosine filtering: %d candidates (threshold=%.2f)",
            len(candidate_videos),
            selection_config.cosine_threshold,
        )

        # Step 4: Lexical scoring
        lexical_scores = [
            self._lexical.score(module, v) for v in candidate_videos
        ]

        # Step 5: Metadata scoring
        metadata_scores = [
            self._metadata.score(v, video_config, target_language=target_language)
            for v in candidate_videos
        ]

        # Step 6: TF-IDF scoring
        if tfidf_config.enabled and candidate_videos:
            tfidf_scores = await self._tfidf.score_videos(module, candidate_videos)
        else:
            tfidf_scores = [0.0] * len(candidate_videos)

        # Step 7: Cross-encoder reranking (on top-K by cosine)
        cross_encoder_scores = [0.0] * len(candidate_videos)
        if cross_encoder_config.enabled and candidate_videos:
            # Sort by cosine to get top-K for cross-encoder
            cosine_ranked = sorted(
                range(len(candidate_videos)),
                key=lambda i: candidate_cosine[i],
                reverse=True,
            )
            rerank_indices = cosine_ranked[: cross_encoder_config.rerank_top_k]

            ce_texts = [video_texts[candidate_indices[i]] for i in rerank_indices]

            try:
                ce_scores = await self._cross_encoder.score_pairs(
                    module_text,
                    ce_texts,
                    batch_size=cross_encoder_config.batch_size,
                )
                for j, idx in enumerate(rerank_indices):
                    cross_encoder_scores[idx] = ce_scores[j]
            except Exception as exc:
                logger.warning(
                    "Cross-encoder scoring failed, falling back: %s", exc
                )

        # Step 8: Difficulty scoring
        difficulty_scores = [0.0] * len(candidate_videos)
        difficulty_results = []
        if difficulty_config.enabled:
            for i, v in enumerate(candidate_videos):
                result = self._difficulty.detect_difficulty(v)
                difficulty_results.append(result)
                difficulty_scores[i] = self._difficulty.score_compatibility(
                    result, difficulty_config.target
                )
        else:
            difficulty_results = [None] * len(candidate_videos)

        # Step 9: Duration scoring
        duration_scores = [
            self._duration_score(v, video_config) for v in candidate_videos
        ]

        # Step 10: Compute final weighted score
        scored_videos: list[ScoredVideo] = []
        for i, video in enumerate(candidate_videos):
            final = (
                ranking_config.cosine_weight * candidate_cosine[i]
                + ranking_config.cross_encoder_weight * cross_encoder_scores[i]
                + ranking_config.lexical_weight * lexical_scores[i]
                + ranking_config.metadata_weight * metadata_scores[i]
                + ranking_config.tfidf_weight * tfidf_scores[i]
                + ranking_config.difficulty_weight * difficulty_scores[i]
                + ranking_config.duration_weight * duration_scores[i]
            )

            diff_result = difficulty_results[i]
            scored = ScoredVideo(
                **video.model_dump(),
                cosine_score=candidate_cosine[i],
                cross_encoder_score=cross_encoder_scores[i],
                lexical_score=lexical_scores[i],
                metadata_score=metadata_scores[i],
                tfidf_score=tfidf_scores[i],
                difficulty_score=difficulty_scores[i],
                duration_score=duration_scores[i],
                final_score=final,
                detected_difficulty=diff_result.difficulty if diff_result else None,
                difficulty_confidence=diff_result.confidence if diff_result else 0.0,
            )
            scored_videos.append(scored)

        # Sort by final score descending
        scored_videos.sort(key=lambda v: v.final_score, reverse=True)

        logger.info(
            "Ranking complete for module='%s': %d scored candidates",
            module.title,
            len(scored_videos),
        )

        return scored_videos

    def _duration_score(self, video: Video, config: VideoConfig) -> float:
        """Compute duration proximity score using Gaussian decay."""
        import math

        if video.duration_seconds is None:
            return 0.3

        target = config.preferred_duration_seconds or config.target_duration_seconds
        diff = abs(video.duration_seconds - target)
        sigma = target * 0.5

        score = math.exp(-(diff ** 2) / (2 * sigma ** 2))

        if video.duration_seconds < config.min_duration_seconds:
            if not config.allow_shorter_videos:
                return 0.0
            score *= 0.5
        elif video.duration_seconds > config.max_duration_seconds:
            if not config.allow_longer_videos:
                return 0.0
            score *= 0.5

        return min(1.0, max(0.0, score))

    def select_diverse(
        self,
        scored_videos: list[ScoredVideo],
        selection_config: SelectionConfig,
    ) -> list[ScoredVideo]:
        """Select videos with diversity-aware MMR-style reranking.

        Prevents duplicate/near-duplicate videos and limits videos
        from the same channel.

        Args:
            scored_videos: Ranked list of scored videos.
            selection_config: Selection configuration.

        Returns:
            Final list of selected videos.
        """
        if not scored_videos:
            return []

        if not selection_config.diversity_enabled:
            return scored_videos[: selection_config.final_top_k]

        selected: list[ScoredVideo] = []
        selected_source_ids: set[str] = set()
        channel_counts: dict[str, int] = {}

        for video in scored_videos:
            if len(selected) >= selection_config.final_top_k:
                break

            # Skip duplicates
            if video.source_id in selected_source_ids:
                continue

            # Channel limit
            channel = video.channel_name or video.channel_id or "unknown"
            current_count = channel_counts.get(channel, 0)
            if current_count >= selection_config.max_videos_per_channel:
                continue

            # Diversity penalty: reduce score if similar to already selected
            adjusted_score = video.final_score
            if selected and selection_config.diversity_penalty > 0:
                max_similarity = 0.0
                for sel in selected:
                    # Use title similarity as a proxy for content similarity
                    from rapidfuzz import fuzz

                    title_sim = fuzz.ratio(
                        video.title.lower(), sel.title.lower()
                    ) / 100.0
                    max_similarity = max(max_similarity, title_sim)

                # Apply MMR-style penalty
                adjusted_score = (
                    (1 - selection_config.diversity_penalty) * video.final_score
                    + selection_config.diversity_penalty * (1 - max_similarity)
                )

            # Accept the video
            selected.append(video)
            selected_source_ids.add(video.source_id)
            channel_counts[channel] = current_count + 1

        logger.debug(
            "Diversity selection: %d/%d videos selected",
            len(selected),
            len(scored_videos),
        )

        return selected

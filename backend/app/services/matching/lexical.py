"""Lexical matching service using token overlap and RapidFuzz."""

from __future__ import annotations

import logging
import re

from rapidfuzz import fuzz

from app.schemas.course_request import MatchingConfig
from app.schemas.taxonomy import TaxonomyModule
from app.schemas.video import Video

logger = logging.getLogger(__name__)

# Simple tokenizer: lowercase, split on non-alphanumeric, filter short tokens
_SPLIT_RE = re.compile(r"[^a-z0-9]+")

# Common stop words to exclude from token matching
_STOP_WORDS = frozenset(
    {
        "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "is", "it", "as", "be", "was", "were",
        "are", "been", "has", "had", "do", "does", "did", "will", "would",
        "can", "could", "should", "may", "might", "this", "that", "these",
        "those", "i", "you", "he", "she", "we", "they", "my", "your", "his",
        "her", "our", "their", "its", "not", "no", "so", "if", "how", "what",
        "when", "where", "who", "which", "all", "each", "every", "both",
        "few", "more", "most", "other", "some", "such", "than", "too", "very",
        "just", "about", "also", "into", "over", "after", "before", "between",
    }
)


def _tokenize(text: str) -> set[str]:
    """Tokenize text into a set of lowercase tokens, excluding stop words."""
    tokens = _SPLIT_RE.split(text.lower())
    return {t for t in tokens if len(t) > 1 and t not in _STOP_WORDS}


class LexicalScorer:
    """Computes lexical relevance between a module and a video.

    Uses:
    - Token overlap (Jaccard similarity)
    - RapidFuzz fuzzy matching (token_set_ratio)
    - Configurable weights for title, description, and tags
    """

    def __init__(self, config: MatchingConfig | None = None) -> None:
        self._config = config or MatchingConfig()

    def score(self, module: TaxonomyModule, video: Video) -> float:
        """Compute a lexical relevance score between a module and a video.

        Args:
            module: The taxonomy module.
            video: The candidate video.

        Returns:
            A score in [0, 1].
        """
        module_text = self._build_module_query(module)
        module_tokens = _tokenize(module_text)

        if not module_tokens:
            return 0.0

        # Score each component
        title_score = self._score_field(module_text, module_tokens, video.title)
        desc_score = self._score_field(
            module_text, module_tokens, video.description or ""
        )
        tag_score = self._score_tags(module_tokens, video.tags)

        # Weighted combination
        combined = (
            self._config.title_weight * title_score
            + self._config.description_weight * desc_score
            + self._config.tag_weight * tag_score
        )

        return min(1.0, max(0.0, combined))

    def _score_field(
        self, module_text: str, module_tokens: set[str], field_text: str
    ) -> float:
        """Score a single text field using both token overlap and fuzzy matching."""
        if not field_text:
            return 0.0

        field_tokens = _tokenize(field_text)
        if not field_tokens:
            return 0.0

        # Token overlap (Jaccard)
        intersection = module_tokens & field_tokens
        union = module_tokens | field_tokens
        jaccard = len(intersection) / len(union) if union else 0.0

        # Fuzzy matching (RapidFuzz)
        fuzzy_score = fuzz.token_set_ratio(module_text, field_text) / 100.0

        # Combine: give slight preference to exact token matches
        return 0.4 * jaccard + 0.6 * fuzzy_score

    def _score_tags(self, module_tokens: set[str], tags: list[str]) -> float:
        """Score tag overlap between module keywords and video tags."""
        if not tags:
            return 0.0

        tag_tokens = set()
        for tag in tags:
            tag_tokens.update(_tokenize(tag))

        if not tag_tokens:
            return 0.0

        intersection = module_tokens & tag_tokens
        union = module_tokens | tag_tokens
        jaccard = len(intersection) / len(union) if union else 0.0

        return jaccard

    def _build_module_query(self, module: TaxonomyModule) -> str:
        """Build a text query from the module for matching."""
        parts = [module.title, module.description]
        parts.extend(module.keywords)
        if module.concepts:
            parts.extend(c.name for c in module.concepts)
        if module.learning_objectives:
            parts.extend(module.learning_objectives)
        return " ".join(parts)

"""Difficulty detection and scoring service."""

from __future__ import annotations

import logging
import re

from rapidfuzz import fuzz

from app.schemas.video import Video

logger = logging.getLogger(__name__)

# Difficulty-level keyword lexicons
_DIFFICULTY_LEXICONS: dict[str, list[str]] = {
    "beginner": [
        "beginner", "beginners", "basics", "basic", "introduction", "intro",
        "getting started", "fundamentals", "fundamental", "101", "for beginners",
        "newbie", "newbies", "starter", "starting", "first steps", "learn",
        "easy", "simple", "elementary", "novice", "crash course", "tutorial",
        "from scratch", "from zero", "step by step", "absolute beginner",
        "no experience", "no prior", "complete beginner",
    ],
    "intermediate": [
        "intermediate", "beyond basics", "next level", "practical",
        "hands-on", "project-based", "applied", "real-world", "in depth",
        "deep dive", "comprehensive", "complete guide", "mastering",
        "201", "level 2", "moderate", "mid-level", "working with",
        "building", "developing", "implementing",
    ],
    "advanced": [
        "advanced", "expert", "pro", "professional", "in-depth",
        "complex", "sophisticated", "optimization", "performance",
        "architecture", "design patterns", "best practices", "301",
        "level 3", "senior", "production", "enterprise", "scaling",
        "distributed", "concurrency", "internals", "under the hood",
    ],
    "expert": [
        "expert", "mastery", "cutting edge", "research", "paper",
        "state of the art", "bleeding edge", "phd", "graduate level",
        "401", "level 4", "theory", "mathematical", "formal",
        "proof", "academic", "scholarly",
    ],
}

# Regex patterns for difficulty indicators
_DIFFICULTY_PATTERNS: dict[str, list[re.Pattern]] = {
    "beginner": [
        re.compile(r"\b(?:beginn|introduct|basic|fundamental|101|easy|simple)\w*\b", re.I),
        re.compile(r"\bfor\s+(?:beginn|newbi|start)\w*\b", re.I),
        re.compile(r"\bfrom\s+(?:scratch|zero)\b", re.I),
    ],
    "intermediate": [
        re.compile(r"\b(?:intermediat|practical|hands[\s-]?on|project[\s-]?based)\w*\b", re.I),
        re.compile(r"\b(?:deep\s+dive|in[\s-]?depth|201)\b", re.I),
    ],
    "advanced": [
        re.compile(r"\b(?:advanc|expert|profession|complex|301)\w*\b", re.I),
        re.compile(r"\b(?:design\s+pattern|best\s+practice|optimiz)\w*\b", re.I),
    ],
    "expert": [
        re.compile(r"\b(?:expert|mastery|research|state[\s-]?of[\s-]?the[\s-]?art|401)\w*\b", re.I),
        re.compile(r"\b(?:graduate|phd|academic|scholarly)\b", re.I),
    ],
}

_DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced", "expert"]
_LEVEL_INDEX = {level: i for i, level in enumerate(_DIFFICULTY_LEVELS)}


class DifficultyResult:
    """Result of difficulty detection."""

    __slots__ = ("difficulty", "confidence", "scores")

    def __init__(
        self,
        difficulty: str,
        confidence: float,
        scores: dict[str, float],
    ) -> None:
        self.difficulty = difficulty
        self.confidence = confidence
        self.scores = scores


class DifficultyScorer:
    """Detects video difficulty level and scores compatibility with the target.

    Uses regex patterns, keyword lexicons, and RapidFuzz fuzzy matching
    to classify videos without requiring an LLM.
    """

    def detect_difficulty(self, video: Video) -> DifficultyResult:
        """Detect the difficulty level of a video.

        Args:
            video: The video to analyze.

        Returns:
            DifficultyResult with detected level, confidence, and per-level scores.
        """
        text = self._build_analysis_text(video)

        scores: dict[str, float] = {}

        for level in _DIFFICULTY_LEVELS:
            regex_score = self._regex_score(text, level)
            keyword_score = self._keyword_score(text, level)
            fuzzy_score = self._fuzzy_score(text, level)

            # Weighted combination of detection methods
            combined = 0.3 * regex_score + 0.4 * keyword_score + 0.3 * fuzzy_score
            scores[level] = combined

        # Determine the best level
        total = sum(scores.values())
        if total == 0:
            return DifficultyResult("beginner", 0.3, scores)

        # Normalize scores
        normalized = {k: v / total for k, v in scores.items()}
        best_level = max(normalized, key=lambda k: normalized[k])
        confidence = normalized[best_level]

        return DifficultyResult(best_level, confidence, normalized)

    def score_compatibility(
        self, detected: DifficultyResult, target: str
    ) -> float:
        """Score how compatible a detected difficulty is with the target.

        Args:
            detected: Result from detect_difficulty().
            target: Target difficulty level from the request.

        Returns:
            A score in [0, 1] where 1.0 means perfect match.
        """
        if target not in _LEVEL_INDEX:
            return 0.5

        target_idx = _LEVEL_INDEX[target]
        detected_idx = _LEVEL_INDEX.get(detected.difficulty, 0)

        # Distance-based scoring
        distance = abs(target_idx - detected_idx)
        if distance == 0:
            base_score = 1.0
        elif distance == 1:
            base_score = 0.6
        elif distance == 2:
            base_score = 0.3
        else:
            base_score = 0.1

        # Modulate by confidence
        score = base_score * (0.5 + 0.5 * detected.confidence)

        return min(1.0, max(0.0, score))

    def _build_analysis_text(self, video: Video) -> str:
        """Build text from video metadata for difficulty analysis."""
        parts = [video.title]
        if video.description:
            parts.append(video.description[:300])
        if video.tags:
            parts.extend(video.tags[:10])
        return " ".join(parts).lower()

    def _regex_score(self, text: str, level: str) -> float:
        """Score using regex pattern matches."""
        patterns = _DIFFICULTY_PATTERNS.get(level, [])
        if not patterns:
            return 0.0

        matches = sum(1 for p in patterns if p.search(text))
        return min(1.0, matches / max(1, len(patterns)))

    def _keyword_score(self, text: str, level: str) -> float:
        """Score using keyword lexicon overlap."""
        keywords = _DIFFICULTY_LEXICONS.get(level, [])
        if not keywords:
            return 0.0

        matches = sum(1 for kw in keywords if kw in text)
        return min(1.0, matches / max(1, min(5, len(keywords))))

    def _fuzzy_score(self, text: str, level: str) -> float:
        """Score using RapidFuzz fuzzy matching against keywords."""
        keywords = _DIFFICULTY_LEXICONS.get(level, [])
        if not keywords:
            return 0.0

        best_scores = []
        for kw in keywords[:10]:  # Limit to avoid excessive computation
            ratio = fuzz.partial_ratio(kw, text) / 100.0
            if ratio > 0.7:
                best_scores.append(ratio)

        if not best_scores:
            return 0.0

        return min(1.0, sum(best_scores) / max(1, min(5, len(keywords))))

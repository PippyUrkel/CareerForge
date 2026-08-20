"""Preset catalog video source — a static/configurable catalog of curated videos."""

from __future__ import annotations

import logging
import uuid
from typing import Any

from rapidfuzz import fuzz

from app.schemas.video import Video
from app.services.videos.base import VideoSource

logger = logging.getLogger(__name__)

# A sample preset catalog for demonstration / testing.
# In production, this would be loaded from a database or config file.
_DEFAULT_CATALOG: list[dict[str, Any]] = [
    {
        "source_id": "catalog_py_001",
        "title": "Introduction to Python Programming",
        "description": "A comprehensive beginner-friendly introduction to Python covering syntax, variables, and basic data types.",
        "url": "https://example.com/videos/intro-python",
        "channel_name": "CareerForge Academy",
        "duration_seconds": 720,
        "language": "English",
        "tags": ["python", "programming", "beginner", "introduction", "syntax"],
        "view_count": 50000,
        "category": "Education",
    },
    {
        "source_id": "catalog_py_002",
        "title": "Python Data Types and Variables",
        "description": "Learn about Python data types: strings, integers, floats, booleans, and how to use variables effectively.",
        "url": "https://example.com/videos/python-data-types",
        "channel_name": "CareerForge Academy",
        "duration_seconds": 540,
        "language": "English",
        "tags": ["python", "data types", "variables", "strings", "beginner"],
        "view_count": 35000,
        "category": "Education",
    },
    {
        "source_id": "catalog_py_003",
        "title": "Control Flow in Python: If Statements and Loops",
        "description": "Master Python control flow with if/elif/else statements, for loops, and while loops.",
        "url": "https://example.com/videos/python-control-flow",
        "channel_name": "CareerForge Academy",
        "duration_seconds": 660,
        "language": "English",
        "tags": ["python", "control flow", "if statements", "loops", "beginner"],
        "view_count": 42000,
        "category": "Education",
    },
    {
        "source_id": "catalog_py_004",
        "title": "Python Functions: Definition, Arguments, and Return Values",
        "description": "Learn how to define and use functions in Python, including parameters, return values, and scope.",
        "url": "https://example.com/videos/python-functions",
        "channel_name": "CareerForge Academy",
        "duration_seconds": 780,
        "language": "English",
        "tags": ["python", "functions", "arguments", "return", "intermediate"],
        "view_count": 38000,
        "category": "Education",
    },
    {
        "source_id": "catalog_py_005",
        "title": "Working with Lists and Tuples in Python",
        "description": "Explore Python's list and tuple data structures, including creation, indexing, slicing, and common methods.",
        "url": "https://example.com/videos/python-lists-tuples",
        "channel_name": "CareerForge Academy",
        "duration_seconds": 600,
        "language": "English",
        "tags": ["python", "lists", "tuples", "data structures", "beginner"],
        "view_count": 30000,
        "category": "Education",
    },
    {
        "source_id": "catalog_py_006",
        "title": "Python Dictionaries and Sets",
        "description": "Master Python dictionaries and sets: creation, operations, iteration, and practical use cases.",
        "url": "https://example.com/videos/python-dicts-sets",
        "channel_name": "CareerForge Academy",
        "duration_seconds": 550,
        "language": "English",
        "tags": ["python", "dictionaries", "sets", "data structures", "intermediate"],
        "view_count": 28000,
        "category": "Education",
    },
    {
        "source_id": "catalog_py_007",
        "title": "File Handling in Python",
        "description": "Learn how to read and write files in Python, including text files, CSV, and JSON.",
        "url": "https://example.com/videos/python-file-handling",
        "channel_name": "CareerForge Academy",
        "duration_seconds": 480,
        "language": "English",
        "tags": ["python", "file handling", "IO", "csv", "json", "intermediate"],
        "view_count": 25000,
        "category": "Education",
    },
    {
        "source_id": "catalog_py_008",
        "title": "Error Handling and Exceptions in Python",
        "description": "Understand try/except blocks, custom exceptions, and best practices for error handling in Python.",
        "url": "https://example.com/videos/python-error-handling",
        "channel_name": "CareerForge Academy",
        "duration_seconds": 420,
        "language": "English",
        "tags": ["python", "exceptions", "error handling", "try except", "intermediate"],
        "view_count": 22000,
        "category": "Education",
    },
    {
        "source_id": "catalog_ml_001",
        "title": "Introduction to Machine Learning Concepts",
        "description": "A beginner-friendly overview of machine learning: supervised, unsupervised, and reinforcement learning.",
        "url": "https://example.com/videos/intro-ml",
        "channel_name": "CareerForge Academy",
        "duration_seconds": 900,
        "language": "English",
        "tags": ["machine learning", "ML", "AI", "beginner", "introduction"],
        "view_count": 65000,
        "category": "Education",
    },
    {
        "source_id": "catalog_ml_002",
        "title": "Linear Regression Explained",
        "description": "Understanding linear regression from scratch, including the math, implementation, and evaluation metrics.",
        "url": "https://example.com/videos/linear-regression",
        "channel_name": "CareerForge Academy",
        "duration_seconds": 840,
        "language": "English",
        "tags": ["machine learning", "regression", "linear regression", "statistics", "intermediate"],
        "view_count": 45000,
        "category": "Education",
    },
    {
        "source_id": "catalog_web_001",
        "title": "HTML and CSS Basics for Beginners",
        "description": "Learn the fundamentals of HTML5 and CSS3 for building modern web pages.",
        "url": "https://example.com/videos/html-css-basics",
        "channel_name": "CareerForge Academy",
        "duration_seconds": 600,
        "language": "English",
        "tags": ["html", "css", "web development", "beginner", "frontend"],
        "view_count": 55000,
        "category": "Education",
    },
    {
        "source_id": "catalog_web_002",
        "title": "JavaScript Fundamentals",
        "description": "Master JavaScript basics: variables, functions, DOM manipulation, and event handling.",
        "url": "https://example.com/videos/javascript-fundamentals",
        "channel_name": "CareerForge Academy",
        "duration_seconds": 750,
        "language": "English",
        "tags": ["javascript", "web development", "DOM", "beginner", "frontend"],
        "view_count": 60000,
        "category": "Education",
    },
]


class PresetCatalogVideoSource(VideoSource):
    """A preset catalog of curated educational videos.

    Videos are matched against search queries using fuzzy string matching.
    In production, this catalog could be loaded from a database or
    configuration file.
    """

    def __init__(self, catalog: list[dict[str, Any]] | None = None) -> None:
        self._catalog = catalog or _DEFAULT_CATALOG
        self._videos = [self._dict_to_video(item) for item in self._catalog]
        logger.info("Preset catalog loaded with %d videos", len(self._videos))

    @property
    def source_name(self) -> str:
        return "catalog"

    async def search(
        self,
        query: str,
        *,
        max_results: int = 25,
        language: str | None = None,
    ) -> list[Video]:
        """Search the preset catalog using fuzzy matching."""
        scored: list[tuple[float, Video]] = []

        query_lower = query.lower()

        for video in self._videos:
            # Language filter
            if language and video.language:
                if video.language.lower() != language.lower():
                    continue

            # Compute fuzzy match score
            title_score = fuzz.token_set_ratio(query_lower, video.title.lower()) / 100.0
            desc_score = 0.0
            if video.description:
                desc_score = (
                    fuzz.token_set_ratio(query_lower, video.description.lower())
                    / 100.0
                )
            tag_score = 0.0
            if video.tags:
                tag_text = " ".join(video.tags).lower()
                tag_score = fuzz.token_set_ratio(query_lower, tag_text) / 100.0

            combined = title_score * 0.5 + desc_score * 0.3 + tag_score * 0.2

            # Only include videos with a minimum relevance
            if combined >= 0.3:
                scored.append((combined, video))

        # Sort by score descending
        scored.sort(key=lambda x: x[0], reverse=True)

        results = [video for _, video in scored[:max_results]]
        logger.debug(
            "Catalog search for '%s' returned %d results", query, len(results)
        )
        return results

    async def get_video(self, video_id: str) -> Video | None:
        """Retrieve a catalog video by its source ID."""
        for video in self._videos:
            if video.source_id == video_id:
                return video
        return None

    def _dict_to_video(self, item: dict[str, Any]) -> Video:
        """Convert a catalog dictionary entry to a Video model."""
        return Video(
            id=str(uuid.uuid4()),
            source="catalog",
            source_id=item["source_id"],
            title=item["title"],
            description=item.get("description"),
            url=item["url"],
            channel_name=item.get("channel_name"),
            channel_id=None,
            duration_seconds=item.get("duration_seconds"),
            language=item.get("language"),
            published_at=None,
            tags=item.get("tags", []),
            thumbnail_url=item.get("thumbnail_url"),
            view_count=item.get("view_count"),
            like_count=item.get("like_count"),
            category=item.get("category"),
        )

"""Normalized video models independent of any provider."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class Video(BaseModel):
    """Normalized internal video representation.

    All video sources produce instances of this model, keeping the rest
    of the pipeline decoupled from provider-specific response structures.
    """

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Internal UUID")
    source: str = Field(..., description="Source platform (e.g. 'youtube', 'catalog')")
    source_id: str = Field(..., description="Provider's video ID")
    title: str = Field(..., description="Video title")
    description: str | None = Field(default=None, description="Video description")
    url: str = Field(..., description="Video URL")
    channel_name: str | None = Field(default=None, description="Channel / creator name")
    channel_id: str | None = Field(default=None, description="Channel ID")
    duration_seconds: int | None = Field(default=None, description="Duration in seconds")
    language: str | None = Field(default=None, description="Video language")
    published_at: datetime | None = Field(default=None, description="Publication date")
    tags: list[str] = Field(default_factory=list, description="Tags / keywords")
    thumbnail_url: str | None = Field(default=None, description="Thumbnail URL")
    view_count: int | None = Field(default=None, description="Number of views")
    like_count: int | None = Field(default=None, description="Number of likes")
    category: str | None = Field(default=None, description="Video category")


class ScoredVideo(Video):
    """A Video augmented with all scoring signals from the matching pipeline."""

    cosine_score: float = Field(default=0.0, description="Cosine similarity score")
    cross_encoder_score: float = Field(default=0.0, description="Cross-encoder reranking score")
    lexical_score: float = Field(default=0.0, description="Lexical matching score")
    metadata_score: float = Field(default=0.0, description="Metadata quality score")
    tfidf_score: float = Field(default=0.0, description="TF-IDF similarity score")
    difficulty_score: float = Field(default=0.0, description="Difficulty compatibility score")
    duration_score: float = Field(default=0.0, description="Duration proximity score")
    final_score: float = Field(default=0.0, description="Final weighted score")
    detected_difficulty: str | None = Field(default=None, description="Detected difficulty level")
    difficulty_confidence: float = Field(default=0.0, description="Confidence of difficulty detection")

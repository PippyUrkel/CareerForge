"""SQLAlchemy ORM models for course persistence."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""

    pass


class CourseRecord(Base):
    """Persisted course record."""

    __tablename__ = "courses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    generation_id = Column(String, unique=True, nullable=False, index=True)
    course_title = Column(String, nullable=False)
    description = Column(Text)
    difficulty = Column(String)
    language = Column(String)
    topic = Column(String, nullable=False)
    target_audience = Column(String)
    learning_objectives = Column(JSON, default=list)
    prerequisites = Column(JSON, default=list)
    request_payload = Column(JSON)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    modules = relationship(
        "ModuleRecord", back_populates="course", cascade="all, delete-orphan"
    )


class ModuleRecord(Base):
    """Persisted module record."""

    __tablename__ = "modules"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    order = Column(Integer, nullable=False)
    learning_objectives = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    course = relationship("CourseRecord", back_populates="modules")
    module_videos = relationship(
        "ModuleVideoRecord", back_populates="module", cascade="all, delete-orphan"
    )


class VideoRecord(Base):
    """Persisted video record (deduplicated by source_id)."""

    __tablename__ = "videos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String, nullable=False)
    source_id = Column(String, nullable=False, unique=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    url = Column(String, nullable=False)
    channel_name = Column(String)
    channel_id = Column(String)
    duration_seconds = Column(Integer)
    language = Column(String)
    published_at = Column(DateTime)
    tags = Column(JSON, default=list)
    thumbnail_url = Column(String)
    view_count = Column(Integer)
    like_count = Column(Integer)
    category = Column(String)
    embedding = Column(JSON)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    module_videos = relationship("ModuleVideoRecord", back_populates="video")


class ModuleVideoRecord(Base):
    """Junction table linking modules to videos with scoring metadata."""

    __tablename__ = "module_videos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    module_id = Column(String, ForeignKey("modules.id"), nullable=False)
    video_id = Column(String, ForeignKey("videos.id"), nullable=False)
    order = Column(Integer, nullable=False)
    relevance_score = Column(Float)
    cosine_score = Column(Float)
    cross_encoder_score = Column(Float)
    lexical_score = Column(Float)
    metadata_score = Column(Float)
    tfidf_score = Column(Float)
    difficulty_score = Column(Float)
    duration_score = Column(Float)
    detected_difficulty = Column(String)
    difficulty_confidence = Column(Float)

    module = relationship("ModuleRecord", back_populates="module_videos")
    video = relationship("VideoRecord", back_populates="module_videos")

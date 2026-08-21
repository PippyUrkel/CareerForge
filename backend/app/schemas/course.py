"""Course response schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class CourseVideo(BaseModel):
    """A video selected for inclusion in the final course."""

    model_config = ConfigDict(from_attributes=True)

    video_id: str = Field(..., description="Internal video UUID")
    source: str = Field(..., description="Video source platform")
    title: str = Field(..., description="Video title")
    url: str = Field(..., description="Video URL")
    channel_name: str | None = Field(default=None, description="Channel name")
    duration_seconds: int | None = Field(default=None, description="Duration in seconds")
    difficulty: str | None = Field(default=None, description="Detected difficulty level")
    difficulty_confidence: float | None = Field(default=None, description="Difficulty detection confidence")
    relevance_score: float = Field(..., description="Final relevance score")
    order: int = Field(..., description="Order within the module")


class CourseModule(BaseModel):
    """A module in the final course."""

    model_config = ConfigDict(from_attributes=True)

    title: str = Field(..., description="Module title")
    description: str = Field(..., description="Module description")
    order: int = Field(..., description="Module order")
    learning_objectives: list[str] = Field(default_factory=list, description="Module learning objectives")
    videos: list[CourseVideo] = Field(..., description="Selected videos")


class Course(BaseModel):
    """The complete generated course."""

    model_config = ConfigDict(from_attributes=True)

    course_title: str = Field(..., description="Course title")
    description: str = Field(..., description="Course description")
    difficulty: str = Field(..., description="Difficulty level")
    language: str = Field(..., description="Course language")
    learning_objectives: list[str] = Field(..., description="Learning objectives")
    prerequisites: list[str] = Field(default_factory=list, description="Prerequisites")
    target_audience: str = Field(..., description="Target audience")
    modules: list[CourseModule] = Field(..., description="Course modules")


class PipelineMetadata(BaseModel):
    """Metadata about the pipeline execution."""

    model_config = ConfigDict(from_attributes=True)

    generation_id: str = Field(..., description="Unique generation run ID")
    modules_generated: int = Field(..., description="Number of modules generated")
    videos_considered: int = Field(..., description="Total candidate videos considered")
    videos_selected: int = Field(..., description="Total videos selected")
    pipeline_version: str = Field(default="1.0", description="Pipeline version")
    processing_time_seconds: float | None = Field(default=None, description="Total processing time (seconds)")


class DebugInfo(BaseModel):
    """Optional debug information returned when debug=true."""

    model_config = ConfigDict(from_attributes=True)

    candidate_counts: dict[str, int] = Field(default_factory=dict, description="Candidate counts per module")
    score_breakdowns: dict[str, list[dict]] = Field(
        default_factory=dict, description="Detailed per-video score breakdowns"
    )


class CourseGenerationResponse(BaseModel):
    """Top-level response from the course generation endpoint."""

    model_config = ConfigDict(from_attributes=True)

    status: str = Field(default="completed", description="Pipeline status")
    generation_id: str = Field(..., description="Generation run ID")
    course: Course = Field(..., description="The generated course")
    metadata: PipelineMetadata = Field(..., description="Pipeline execution metadata")
    debug: DebugInfo | None = Field(default=None, description="Debug info (when requested)")


class CourseListItem(BaseModel):
    """Summary item for course listings."""

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Internal course UUID")
    generation_id: str = Field(..., description="Unique generation run ID")
    course_title: str = Field(..., description="Course title")
    description: str | None = Field(default=None, description="Course description")
    difficulty: str | None = Field(default=None, description="Difficulty level")
    language: str | None = Field(default=None, description="Language")
    topic: str = Field(..., description="Course topic")
    target_audience: str | None = Field(default=None, description="Target audience")
    learning_objectives: list[str] = Field(default_factory=list, description="Learning objectives")
    prerequisites: list[str] = Field(default_factory=list, description="Prerequisites")
    created_at: str | None = Field(default=None, description="Creation timestamp ISO string")
    module_count: int = Field(default=0, description="Total number of modules")
    video_count: int = Field(default=0, description="Total number of videos")
    total_duration_seconds: int = Field(default=0, description="Total duration across all videos in seconds")


class CourseListResponse(BaseModel):
    """Response containing a list of persisted courses."""

    model_config = ConfigDict(from_attributes=True)

    total: int = Field(..., description="Total number of courses")
    courses: list[CourseListItem] = Field(default_factory=list, description="List of courses")


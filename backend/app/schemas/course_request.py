"""Course generation request schemas with all pipeline configuration."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class ModuleConfig(BaseModel):
    """Configuration for course module generation."""

    min_modules: int = Field(default=3, ge=1, le=20, description="Minimum number of modules")
    max_modules: int = Field(default=10, ge=1, le=20, description="Maximum number of modules")
    target_modules: int = Field(default=6, ge=1, le=20, description="Target number of modules")
    min_concepts_per_module: int = Field(default=2, ge=1, description="Minimum concepts per module")
    max_concepts_per_module: int = Field(default=8, ge=1, description="Maximum concepts per module")
    force_module_titles: list[str] | None = Field(
        default=None,
        description="If supplied, the LLM will use these exact module titles",
    )

    @model_validator(mode="before")
    @classmethod
    def adjust_module_bounds(cls, data: Any) -> Any:
        if isinstance(data, dict):
            target = data.get("target_modules")
            if target is not None and isinstance(target, int):
                if "min_modules" not in data and target < 3:
                    data["min_modules"] = target
                if "max_modules" not in data and target > 10:
                    data["max_modules"] = target
        return data

    @model_validator(mode="after")
    def validate_module_counts(self) -> ModuleConfig:
        if not (self.min_modules <= self.target_modules <= self.max_modules):
            raise ValueError(
                f"Must have min_modules({self.min_modules}) <= "
                f"target_modules({self.target_modules}) <= "
                f"max_modules({self.max_modules})"
            )
        return self


class VideoConfig(BaseModel):
    """Configuration for video selection criteria."""

    videos_per_module: int = Field(default=3, ge=1, le=10, description="Target videos per module")
    min_videos_per_module: int = Field(default=2, ge=1, description="Minimum videos per module")
    max_videos_per_module: int = Field(default=5, ge=1, le=20, description="Maximum videos per module")
    min_duration_seconds: int = Field(default=120, ge=0, description="Minimum video duration (seconds)")
    max_duration_seconds: int = Field(default=1800, ge=60, description="Maximum video duration (seconds)")
    target_duration_seconds: int = Field(default=600, ge=30, description="Ideal video duration (seconds)")
    preferred_duration_seconds: int | None = Field(
        default=None, description="Preferred duration if different from target"
    )
    allow_shorter_videos: bool = Field(default=True, description="Allow videos shorter than min_duration")
    allow_longer_videos: bool = Field(default=True, description="Allow videos longer than max_duration")
    language_match_required: bool = Field(default=False, description="Require exact language match")

    @model_validator(mode="before")
    @classmethod
    def adjust_video_bounds(cls, data: Any) -> Any:
        if isinstance(data, dict):
            videos = data.get("videos_per_module")
            if videos is not None and isinstance(videos, int):
                if "min_videos_per_module" not in data and videos < 2:
                    data["min_videos_per_module"] = videos
                if "max_videos_per_module" not in data and videos > 5:
                    data["max_videos_per_module"] = videos
        return data

    @model_validator(mode="after")
    def validate_video_config(self) -> VideoConfig:
        if not (self.min_videos_per_module <= self.videos_per_module <= self.max_videos_per_module):
            raise ValueError(
                f"Must have min_videos({self.min_videos_per_module}) <= "
                f"videos_per_module({self.videos_per_module}) <= "
                f"max_videos({self.max_videos_per_module})"
            )
        if self.min_duration_seconds >= self.max_duration_seconds:
            raise ValueError("min_duration_seconds must be less than max_duration_seconds")
        return self


class SourceConfig(BaseModel):
    """Configuration for video source providers."""

    youtube_enabled: bool = Field(default=True, description="Enable YouTube as a video source")
    preset_catalog_enabled: bool = Field(default=True, description="Enable the preset video catalog")
    max_candidates_per_module: int = Field(
        default=50, ge=5, le=200, description="Max candidate videos per module"
    )


class EmbeddingConfig(BaseModel):
    """Configuration for the embedding service."""

    model_name: str = Field(default="all-MiniLM-L6-v2", description="Sentence-transformers model name")
    normalize_embeddings: bool = Field(default=True, description="L2-normalize embeddings")
    batch_size: int = Field(default=32, ge=1, le=256, description="Batch size for embedding generation")


class CrossEncoderConfig(BaseModel):
    """Configuration for cross-encoder reranking."""

    enabled: bool = Field(default=True, description="Enable cross-encoder reranking stage")
    model_name: str = Field(
        default="cross-encoder/ms-marco-MiniLM-L-6-v2",
        description="Cross-encoder model name",
    )
    rerank_top_k: int = Field(default=20, ge=1, le=100, description="Rerank the top K candidates")
    batch_size: int = Field(default=16, ge=1, le=128, description="Batch size for cross-encoder")


class MatchingConfig(BaseModel):
    """Configuration for lexical matching."""

    title_weight: float = Field(default=0.4, ge=0.0, le=1.0, description="Weight for title matching")
    description_weight: float = Field(default=0.35, ge=0.0, le=1.0, description="Weight for description matching")
    tag_weight: float = Field(default=0.25, ge=0.0, le=1.0, description="Weight for tag matching")
    fuzzy_matching_threshold: float = Field(
        default=0.6, ge=0.0, le=1.0, description="RapidFuzz threshold for fuzzy matches"
    )


class TFIDFConfig(BaseModel):
    """Configuration for TF-IDF scoring."""

    enabled: bool = Field(default=True, description="Enable TF-IDF as a ranking signal")
    max_features: int = Field(default=5000, ge=100, description="Max features for TF-IDF vectorizer")
    ngram_min: int = Field(default=1, ge=1, description="Minimum n-gram size")
    ngram_max: int = Field(default=2, ge=1, description="Maximum n-gram size")

    @model_validator(mode="after")
    def validate_ngrams(self) -> TFIDFConfig:
        if self.ngram_min > self.ngram_max:
            raise ValueError("ngram_min must be <= ngram_max")
        return self


class DifficultyConfig(BaseModel):
    """Configuration for difficulty scoring."""

    enabled: bool = Field(default=True, description="Enable difficulty-based scoring")
    target: Literal["beginner", "intermediate", "advanced", "expert"] = Field(
        default="beginner", description="Target difficulty level"
    )
    difficulty_weight: float = Field(default=0.15, ge=0.0, le=1.0, description="Weight of difficulty score")


class RankingConfig(BaseModel):
    """Weights for the final multi-signal ranking formula.

    Weights are automatically normalized to sum to 1.0.
    """

    cosine_weight: float = Field(default=0.35, ge=0.0, description="Weight for cosine similarity")
    cross_encoder_weight: float = Field(default=0.25, ge=0.0, description="Weight for cross-encoder score")
    lexical_weight: float = Field(default=0.10, ge=0.0, description="Weight for lexical matching")
    metadata_weight: float = Field(default=0.10, ge=0.0, description="Weight for metadata score")
    tfidf_weight: float = Field(default=0.05, ge=0.0, description="Weight for TF-IDF score")
    difficulty_weight: float = Field(default=0.10, ge=0.0, description="Weight for difficulty compatibility")
    duration_weight: float = Field(default=0.05, ge=0.0, description="Weight for duration proximity")

    @model_validator(mode="after")
    def normalize_weights(self) -> RankingConfig:
        total = (
            self.cosine_weight
            + self.cross_encoder_weight
            + self.lexical_weight
            + self.metadata_weight
            + self.tfidf_weight
            + self.difficulty_weight
            + self.duration_weight
        )
        if total > 0:
            self.cosine_weight /= total
            self.cross_encoder_weight /= total
            self.lexical_weight /= total
            self.metadata_weight /= total
            self.tfidf_weight /= total
            self.difficulty_weight /= total
            self.duration_weight /= total
        return self


class SelectionConfig(BaseModel):
    """Configuration for final video selection."""

    cosine_threshold: float = Field(
        default=0.45, ge=0.0, le=1.0, description="Minimum cosine similarity to consider a video"
    )
    rerank_top_k: int = Field(default=20, ge=1, description="Top K candidates for reranking")
    final_top_k: int = Field(default=3, ge=1, le=20, description="Final videos to select per module")
    diversity_enabled: bool = Field(default=True, description="Enable diversity-aware selection")
    diversity_penalty: float = Field(
        default=0.10, ge=0.0, le=1.0, description="Penalty for selecting similar/same-channel videos"
    )
    max_videos_per_channel: int = Field(default=2, ge=1, description="Max videos from one channel per module")


class SearchConfig(BaseModel):
    """Configuration for search query generation."""

    queries_per_module: int = Field(default=3, ge=1, le=10, description="Number of search queries per module")
    llm_query_generation_enabled: bool = Field(
        default=True, description="Use LLM to generate search queries (vs. keyword-based)"
    )


class CourseGenerationRequest(BaseModel):
    """Main request model for the course generation endpoint.

    All configuration parameters have sensible defaults. Only `topic` is required.
    """

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "topic": "Python Programming",
                "course_title": "Python Fundamentals",
                "difficulty": "beginner",
                "target_audience": "undergraduate students",
                "module_config": {"target_modules": 6},
                "video_config": {"videos_per_module": 3, "target_duration_seconds": 600},
            }
        }
    )

    # Course identity
    user_id: str | None = Field(default=None, description="Appwrite authenticated user ID")
    topic: str = Field(..., min_length=1, description="Main topic for the course (required)")
    course_title: str | None = Field(default=None, description="Course title; generated by LLM if omitted")
    course_description: str | None = Field(
        default=None, description="Course description; generated by LLM if omitted"
    )
    language: str = Field(default="English", description="Target language for the course")
    target_audience: str = Field(default="general learners", description="Target audience")
    difficulty: Literal["beginner", "intermediate", "advanced", "expert"] = Field(
        default="beginner", description="Overall difficulty level"
    )

    @field_validator("difficulty", mode="before")
    @classmethod
    def normalize_difficulty(cls, v: Any) -> str:
        if isinstance(v, str):
            v_lower = v.strip().lower()
            if v_lower in ("beginner", "intermediate", "advanced", "expert"):
                return v_lower
            if "begin" in v_lower or "all" in v_lower:
                return "beginner"
            if "inter" in v_lower or "mid" in v_lower:
                return "intermediate"
            if "adv" in v_lower:
                return "advanced"
            if "exp" in v_lower:
                return "expert"
        return "beginner"
    learning_objectives: list[str] | None = Field(
        default=None, description="Explicit learning objectives; generated by LLM if omitted"
    )
    prerequisites: list[str] | None = Field(default=None, description="Prerequisites for the course")
    tone: str = Field(default="professional", description="Tone of generated content")
    teaching_style: str = Field(default="balanced", description="Teaching style (e.g., practical, theoretical)")
    domain: str | None = Field(default=None, description="Specific domain (e.g., Data Science)")
    region: str | None = Field(default=None, description="Regional focus if any")
    skill_context: dict[str, Any] | None = Field(
        default=None, description="Personalized skill assessment context, strengths, and identified gaps"
    )

    # Pipeline configuration
    module_config: ModuleConfig = Field(default_factory=ModuleConfig, description="Module generation settings")
    video_config: VideoConfig = Field(default_factory=VideoConfig, description="Video selection settings")
    source_config: SourceConfig = Field(default_factory=SourceConfig, description="Video source settings")
    embedding_config: EmbeddingConfig = Field(default_factory=EmbeddingConfig, description="Embedding settings")
    cross_encoder_config: CrossEncoderConfig = Field(
        default_factory=CrossEncoderConfig, description="Cross-encoder settings"
    )
    matching_config: MatchingConfig = Field(default_factory=MatchingConfig, description="Lexical matching settings")
    tfidf_config: TFIDFConfig = Field(default_factory=TFIDFConfig, description="TF-IDF settings")
    difficulty_config: DifficultyConfig = Field(default_factory=DifficultyConfig, description="Difficulty scoring settings")
    ranking_config: RankingConfig = Field(default_factory=RankingConfig, description="Ranking weights")
    selection_config: SelectionConfig = Field(default_factory=SelectionConfig, description="Selection settings")
    search_config: SearchConfig = Field(default_factory=SearchConfig, description="Search query settings")

    # Debug
    debug: bool = Field(default=False, description="Return detailed debug information in the response")

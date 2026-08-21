"""Application configuration using pydantic-settings."""

from __future__ import annotations

import functools

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


from pathlib import Path

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_DEFAULT_DB_PATH = _BACKEND_DIR / "careerforge.db"

class AppSettings(BaseSettings):
    """Central application configuration loaded from environment variables and .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # LLM Configuration
    llm_api_key: str = Field(
        default="ollama", description="API key for the LLM provider (or 'ollama' for local)"
    )
    llm_model: str = Field(default="qwen3.5:4b", description="LLM model name")
    llm_base_url: str = Field(
        default="http://localhost:11434/v1", description="LLM API base URL"
    )
    llm_max_retries: int = Field(default=3, description="Max retries for LLM calls")
    llm_timeout: int = Field(default=180, description="Timeout in seconds for LLM calls")

    # YouTube Configuration
    youtube_api_key: str = Field(default="", description="YouTube Data API key")
    youtube_max_results: int = Field(
        default=25, description="Default max results per YouTube search"
    )

    # Embedding Configuration
    embedding_model: str = Field(
        default="all-MiniLM-L6-v2", description="Sentence transformer model name"
    )
    embedding_device: str = Field(
        default="cpu", description="Device for embedding model (cpu/cuda)"
    )

    # Cross Encoder Configuration
    cross_encoder_model: str = Field(
        default="cross-encoder/ms-marco-MiniLM-L-6-v2",
        description="Cross encoder model name",
    )

    # Database Configuration
    database_url: str = Field(
        default=f"sqlite+aiosqlite:///{_DEFAULT_DB_PATH}",
        description="Async database URL",
    )

    # Redis Configuration (optional caching)
    redis_url: str = Field(default="", description="Redis URL for caching")

    # Application Settings
    debug: bool = Field(default=False, description="Debug mode")
    log_level: str = Field(default="INFO", description="Logging level")


@functools.lru_cache
def get_settings() -> AppSettings:
    """Get cached application settings (singleton)."""
    return AppSettings()

"""CareerForge Backend — AI-powered course generation API."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.courses import router as courses_router
from app.api.skills import router as skills_router
from app.core.config import get_settings
from app.db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    settings = get_settings()

    # Configure logging
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    logger = logging.getLogger(__name__)
    logger.info("Starting CareerForge Backend")

    # Initialize database tables
    await init_db()
    logger.info("Database initialized")

    yield

    logger.info("Shutting down CareerForge Backend")


app = FastAPI(
    title="CareerForge API",
    description=(
        "AI-powered course content generation pipeline. "
        "Generate structured courses with curated video content "
        "using multi-signal ranking and intelligent matching."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(courses_router)
app.include_router(skills_router)


@app.get("/", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "CareerForge API", "version": "1.0.0"}


@app.get("/api/health", tags=["health"])
async def api_health():
    """API health check with dependency status."""
    settings = get_settings()
    return {
        "status": "ok",
        "llm_configured": bool(settings.llm_api_key),
        "youtube_configured": bool(settings.youtube_api_key),
        "database_url": settings.database_url.split("///")[0] + "///***",
    }

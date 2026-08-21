"""Comprehensive test suite for the course generation pipeline."""

from __future__ import annotations

import asyncio
import math
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import numpy as np
import pytest

from app.schemas.course_request import (
    CourseGenerationRequest,
    DifficultyConfig,
    MatchingConfig,
    ModuleConfig,
    RankingConfig,
    SelectionConfig,
    TFIDFConfig,
    VideoConfig,
)
from app.schemas.taxonomy import CourseTaxonomy, TaxonomyConcept, TaxonomyModule
from app.schemas.video import ScoredVideo, Video


# ─── Fixtures ──────────────────────────────────────────────────────────────

def make_video(**overrides) -> Video:
    """Helper to create test videos."""
    defaults = {
        "source": "catalog",
        "source_id": "test_001",
        "title": "Python Basics Tutorial",
        "description": "Learn the basics of Python programming language.",
        "url": "https://example.com/video1",
        "channel_name": "TestChannel",
        "channel_id": "UC123",
        "duration_seconds": 600,
        "language": "en",
        "published_at": datetime(2025, 1, 1, tzinfo=timezone.utc),
        "tags": ["python", "programming", "beginner", "tutorial"],
        "thumbnail_url": "https://example.com/thumb.jpg",
        "view_count": 10000,
        "like_count": 500,
        "category": "Education",
    }
    defaults.update(overrides)
    return Video(**defaults)


def make_module(**overrides) -> TaxonomyModule:
    """Helper to create test modules."""
    defaults = {
        "title": "Python Basics",
        "description": "Introduction to Python programming fundamentals.",
        "order": 1,
        "keywords": ["python", "basics", "syntax", "variables"],
        "concepts": [
            TaxonomyConcept(name="Variables", description="Python variables"),
            TaxonomyConcept(name="Data Types", description="Python data types"),
        ],
        "learning_objectives": [
            "Understand Python syntax",
            "Work with variables and data types",
        ],
    }
    defaults.update(overrides)
    return TaxonomyModule(**defaults)


def make_scored_video(**overrides) -> ScoredVideo:
    """Helper to create test scored videos."""
    video = make_video(**{k: v for k, v in overrides.items() if k in Video.model_fields})
    scored_defaults = {
        "cosine_score": 0.8,
        "cross_encoder_score": 0.7,
        "lexical_score": 0.6,
        "metadata_score": 0.5,
        "tfidf_score": 0.4,
        "difficulty_score": 0.9,
        "duration_score": 0.8,
        "final_score": 0.75,
        "detected_difficulty": "beginner",
        "difficulty_confidence": 0.85,
    }
    scored_defaults.update({k: v for k, v in overrides.items() if k not in Video.model_fields})
    return ScoredVideo(**video.model_dump(), **scored_defaults)


# ─── Pydantic Validation Tests ────────────────────────────────────────────

class TestPydanticValidation:
    """Test Pydantic model validation and constraints."""

    def test_minimal_request(self):
        """Only topic is required."""
        req = CourseGenerationRequest(topic="Python")
        assert req.topic == "Python"
        assert req.difficulty == "beginner"
        assert req.module_config.target_modules == 6

    def test_full_request(self):
        """All fields can be provided."""
        req = CourseGenerationRequest(
            topic="Machine Learning",
            course_title="ML Fundamentals",
            course_description="Learn ML",
            language="English",
            target_audience="students",
            difficulty="intermediate",
            learning_objectives=["Learn regression"],
            module_config=ModuleConfig(target_modules=5, min_modules=3, max_modules=8),
            video_config=VideoConfig(videos_per_module=4, min_videos_per_module=2, max_videos_per_module=6),
        )
        assert req.course_title == "ML Fundamentals"
        assert req.module_config.target_modules == 5

    def test_module_config_validation(self):
        """min <= target <= max must hold."""
        with pytest.raises(ValueError, match="min_modules"):
            ModuleConfig(min_modules=5, target_modules=3, max_modules=10)

    def test_video_config_duration_validation(self):
        """min_duration < max_duration must hold."""
        with pytest.raises(ValueError, match="min_duration"):
            VideoConfig(min_duration_seconds=1000, max_duration_seconds=500)

    def test_video_config_count_validation(self):
        """min <= videos_per_module <= max must hold."""
        with pytest.raises(ValueError, match="min_videos"):
            VideoConfig(min_videos_per_module=5, videos_per_module=3, max_videos_per_module=10)

    def test_ranking_weights_normalize(self):
        """Ranking weights are normalized to sum to 1."""
        config = RankingConfig(
            cosine_weight=2.0,
            cross_encoder_weight=2.0,
            lexical_weight=1.0,
            metadata_weight=1.0,
            tfidf_weight=1.0,
            difficulty_weight=1.0,
            duration_weight=2.0,
        )
        total = (
            config.cosine_weight + config.cross_encoder_weight
            + config.lexical_weight + config.metadata_weight
            + config.tfidf_weight + config.difficulty_weight
            + config.duration_weight
        )
        assert abs(total - 1.0) < 1e-6

    def test_tfidf_ngram_validation(self):
        """ngram_min <= ngram_max must hold."""
        with pytest.raises(ValueError, match="ngram_min"):
            TFIDFConfig(ngram_min=3, ngram_max=1)

    def test_taxonomy_empty_modules_validation(self):
        """Modules list must not be empty."""
        with pytest.raises(ValueError, match="Modules"):
            CourseTaxonomy(
                course_title="Test",
                course_description="Test",
                difficulty="beginner",
                language="English",
                learning_objectives=["Test"],
                modules=[],
            )

    def test_video_model(self):
        """Video model validates correctly."""
        video = make_video()
        assert video.source == "catalog"
        assert video.duration_seconds == 600

    def test_scored_video_model(self):
        """ScoredVideo extends Video with scoring fields."""
        sv = make_scored_video()
        assert sv.cosine_score == 0.8
        assert sv.final_score == 0.75
        assert sv.detected_difficulty == "beginner"


# ─── Cosine Scoring Tests ─────────────────────────────────────────────────

class TestCosineScoring:
    """Test cosine similarity scoring."""

    def test_identical_vectors(self):
        from app.services.matching.cosine import CosineScorer

        scorer = CosineScorer()
        vec = np.array([1.0, 0.0, 0.0])
        assert scorer.score(vec, vec) == pytest.approx(1.0)

    def test_orthogonal_vectors(self):
        from app.services.matching.cosine import CosineScorer

        scorer = CosineScorer()
        a = np.array([1.0, 0.0, 0.0])
        b = np.array([0.0, 1.0, 0.0])
        assert scorer.score(a, b) == pytest.approx(0.0)

    def test_similar_vectors(self):
        from app.services.matching.cosine import CosineScorer

        scorer = CosineScorer()
        a = np.array([1.0, 0.5, 0.0])
        a = a / np.linalg.norm(a)
        b = np.array([0.9, 0.6, 0.1])
        b = b / np.linalg.norm(b)
        score = scorer.score(a, b)
        assert 0.9 < score <= 1.0

    def test_batch_scoring(self):
        from app.services.matching.cosine import CosineScorer

        scorer = CosineScorer()
        module_emb = np.array([1.0, 0.0, 0.0])
        video_embs = np.array([
            [1.0, 0.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.5, 0.5, 0.0],
        ])
        scores = scorer.score_batch(module_emb, video_embs)
        assert len(scores) == 3
        assert scores[0] == pytest.approx(1.0)
        assert scores[1] == pytest.approx(0.0)

    def test_empty_vectors(self):
        from app.services.matching.cosine import CosineScorer

        scorer = CosineScorer()
        assert scorer.score(np.array([]), np.array([1.0])) == 0.0


# ─── Lexical Matching Tests ───────────────────────────────────────────────

class TestLexicalMatching:
    """Test lexical matching scorer."""

    def test_exact_match_high_score(self):
        from app.services.matching.lexical import LexicalScorer

        scorer = LexicalScorer()
        module = make_module(title="Python Functions", keywords=["python", "functions", "def"])
        video = make_video(title="Python Functions Tutorial", tags=["python", "functions"])
        score = scorer.score(module, video)
        assert score > 0.3  # Jaccard + fuzzy combination yields moderate scores

    def test_no_match_low_score(self):
        from app.services.matching.lexical import LexicalScorer

        scorer = LexicalScorer()
        module = make_module(title="Quantum Physics", keywords=["quantum", "physics"])
        video = make_video(title="Cooking Italian Pasta", tags=["cooking", "pasta"])
        score = scorer.score(module, video)
        assert score < 0.3

    def test_partial_match(self):
        from app.services.matching.lexical import LexicalScorer

        scorer = LexicalScorer()
        module = make_module(
            title="Python Data Structures",
            keywords=["python", "lists", "dictionaries"],
        )
        video = make_video(
            title="Working with Lists in Python",
            description="Learn about Python lists and tuples.",
            tags=["python", "lists"],
        )
        score = scorer.score(module, video)
        assert 0.3 < score < 0.9

    def test_empty_description(self):
        from app.services.matching.lexical import LexicalScorer

        scorer = LexicalScorer()
        module = make_module()
        video = make_video(description=None, tags=[])
        score = scorer.score(module, video)
        assert 0.0 <= score <= 1.0


# ─── RapidFuzz Integration Tests ──────────────────────────────────────────

class TestRapidFuzz:
    """Test RapidFuzz fuzzy matching integration."""

    def test_fuzzy_matching_similar_strings(self):
        from rapidfuzz import fuzz

        score = fuzz.token_set_ratio("python programming tutorial", "python tutorial for beginners")
        assert score > 50

    def test_fuzzy_matching_different_strings(self):
        from rapidfuzz import fuzz

        score = fuzz.token_set_ratio("quantum physics", "cooking recipes")
        assert score < 30


# ─── Duration Scoring Tests ───────────────────────────────────────────────

class TestDurationScoring:
    """Test duration proximity scoring."""

    def test_exact_target_duration(self):
        from app.services.matching.metadata import MetadataScorer

        scorer = MetadataScorer()
        config = VideoConfig(target_duration_seconds=600)
        score = scorer._duration_score(600, config)
        assert score == pytest.approx(1.0)

    def test_close_to_target(self):
        from app.services.matching.metadata import MetadataScorer

        scorer = MetadataScorer()
        config = VideoConfig(target_duration_seconds=600)
        score = scorer._duration_score(550, config)
        assert score > 0.8

    def test_far_from_target(self):
        from app.services.matching.metadata import MetadataScorer

        scorer = MetadataScorer()
        config = VideoConfig(target_duration_seconds=600, max_duration_seconds=1800)
        score = scorer._duration_score(1800, config)
        assert score < 0.5

    def test_none_duration(self):
        from app.services.matching.metadata import MetadataScorer

        scorer = MetadataScorer()
        config = VideoConfig()
        score = scorer._duration_score(None, config)
        assert score == pytest.approx(0.3)

    def test_strict_reject_too_short(self):
        from app.services.matching.metadata import MetadataScorer

        scorer = MetadataScorer()
        config = VideoConfig(
            min_duration_seconds=300,
            allow_shorter_videos=False,
        )
        score = scorer._duration_score(100, config)
        assert score == 0.0


# ─── Difficulty Scoring Tests ─────────────────────────────────────────────

class TestDifficultyScoring:
    """Test difficulty detection and scoring."""

    def test_detect_beginner(self):
        from app.services.difficulty.scorer import DifficultyScorer

        scorer = DifficultyScorer()
        video = make_video(
            title="Python for Beginners - Complete Tutorial",
            description="A beginner-friendly introduction to Python programming.",
            tags=["beginner", "python", "introduction"],
        )
        result = scorer.detect_difficulty(video)
        assert result.difficulty == "beginner"
        assert result.confidence > 0.3

    def test_detect_advanced(self):
        from app.services.difficulty.scorer import DifficultyScorer

        scorer = DifficultyScorer()
        video = make_video(
            title="Advanced Python Design Patterns and Optimization",
            description="Advanced techniques for professional Python developers.",
            tags=["advanced", "design patterns", "optimization"],
        )
        result = scorer.detect_difficulty(video)
        assert result.difficulty == "advanced"

    def test_compatibility_exact_match(self):
        from app.services.difficulty.scorer import DifficultyResult, DifficultyScorer

        scorer = DifficultyScorer()
        result = DifficultyResult("beginner", 0.9, {"beginner": 0.9})
        score = scorer.score_compatibility(result, "beginner")
        assert score > 0.8

    def test_compatibility_far_mismatch(self):
        from app.services.difficulty.scorer import DifficultyResult, DifficultyScorer

        scorer = DifficultyScorer()
        result = DifficultyResult("expert", 0.9, {"expert": 0.9})
        score = scorer.score_compatibility(result, "beginner")
        assert score < 0.3


# ─── Metadata Scoring Tests ───────────────────────────────────────────────

class TestMetadataScoring:
    """Test metadata quality scoring."""

    def test_high_quality_video(self):
        from app.services.matching.metadata import MetadataScorer

        scorer = MetadataScorer()
        video = make_video(
            title="Complete Python Tutorial for Beginners",
            description="A comprehensive guide covering all basics." * 5,
            view_count=100000,
            duration_seconds=600,
            tags=["python", "tutorial", "beginner", "programming", "coding"],
        )
        config = VideoConfig(target_duration_seconds=600)
        score = scorer.score(video, config, target_language="en")
        assert score > 0.6

    def test_low_quality_video(self):
        from app.services.matching.metadata import MetadataScorer

        scorer = MetadataScorer()
        video = make_video(
            title="vid",
            description=None,
            view_count=5,
            duration_seconds=30,
            tags=[],
            language=None,
        )
        config = VideoConfig(target_duration_seconds=600)
        score = scorer.score(video, config)
        assert score < 0.4


# ─── Diversity Selection Tests ────────────────────────────────────────────

class TestDiversitySelection:
    """Test diversity-aware video selection."""

    def test_diversity_limits_same_channel(self):
        from app.services.matching.ranking import RankingService
        from app.services.matching.cosine import CosineScorer
        from app.services.matching.lexical import LexicalScorer
        from app.services.matching.metadata import MetadataScorer
        from app.services.matching.tfidf import TFIDFScorer
        from app.services.matching.cross_encoder import CrossEncoderScorer
        from app.services.difficulty.scorer import DifficultyScorer
        from app.services.embeddings.service import EmbeddingService

        ranking = RankingService(
            embedding_service=MagicMock(spec=EmbeddingService),
            cosine_scorer=CosineScorer(),
            lexical_scorer=LexicalScorer(),
            metadata_scorer=MetadataScorer(),
            tfidf_scorer=TFIDFScorer(),
            cross_encoder_scorer=MagicMock(spec=CrossEncoderScorer),
            difficulty_scorer=DifficultyScorer(),
        )

        videos = [
            make_scored_video(
                source_id=f"vid_{i}",
                channel_name="SameChannel",
                final_score=0.9 - i * 0.05,
            )
            for i in range(5)
        ]

        config = SelectionConfig(
            final_top_k=4,
            diversity_enabled=True,
            max_videos_per_channel=2,
        )

        selected = ranking.select_diverse(videos, config)
        assert len(selected) <= 2  # Channel limit

    def test_diversity_prevents_duplicates(self):
        from app.services.matching.ranking import RankingService

        ranking = RankingService(
            embedding_service=MagicMock(),
            cosine_scorer=MagicMock(),
            lexical_scorer=MagicMock(),
            metadata_scorer=MagicMock(),
            tfidf_scorer=MagicMock(),
            cross_encoder_scorer=MagicMock(),
            difficulty_scorer=MagicMock(),
        )

        # Create videos with same source_id
        v1 = make_scored_video(source_id="dup", final_score=0.9)
        v2 = make_scored_video(source_id="dup", final_score=0.8)
        v3 = make_scored_video(source_id="other", final_score=0.7)

        config = SelectionConfig(final_top_k=3, diversity_enabled=True)
        selected = ranking.select_diverse([v1, v2, v3], config)

        source_ids = [v.source_id for v in selected]
        assert source_ids.count("dup") == 1


# ─── Course Assembly Tests ────────────────────────────────────────────────

class TestCourseAssembly:
    """Test course assembly service."""

    def test_basic_assembly(self):
        from app.services.assembly.assembler import CourseAssemblyService

        assembler = CourseAssemblyService()

        taxonomy = CourseTaxonomy(
            course_title="Python Basics",
            course_description="Learn Python",
            difficulty="beginner",
            language="English",
            learning_objectives=["Learn Python"],
            modules=[
                make_module(title="Module 1", order=1),
                make_module(title="Module 2", order=2),
            ],
        )

        module_videos = {
            "Module 1": [
                make_scored_video(source_id="v1", final_score=0.9),
                make_scored_video(source_id="v2", final_score=0.8),
            ],
            "Module 2": [
                make_scored_video(source_id="v3", final_score=0.85),
            ],
        }

        request = CourseGenerationRequest(topic="Python")

        course = assembler.assemble(taxonomy, module_videos, request)

        assert course.course_title == "Python Basics"
        assert len(course.modules) == 2
        assert len(course.modules[0].videos) == 2
        assert len(course.modules[1].videos) == 1
        assert course.modules[0].videos[0].order == 1
        assert course.modules[0].videos[1].order == 2

    def test_assembly_with_empty_module(self):
        from app.services.assembly.assembler import CourseAssemblyService

        assembler = CourseAssemblyService()

        taxonomy = CourseTaxonomy(
            course_title="Test",
            course_description="Test",
            difficulty="beginner",
            language="English",
            learning_objectives=["Test"],
            modules=[make_module(title="Empty Module", order=1)],
        )

        request = CourseGenerationRequest(topic="Test")
        course = assembler.assemble(taxonomy, {}, request)

        assert len(course.modules) == 1
        assert len(course.modules[0].videos) == 0


# ─── TF-IDF Scoring Tests ─────────────────────────────────────────────────

class TestTFIDFScoring:
    """Test TF-IDF scoring."""

    @pytest.mark.asyncio
    async def test_tfidf_relevant_videos(self):
        from app.services.matching.tfidf import TFIDFScorer

        scorer = TFIDFScorer()
        module = make_module(
            title="Python Functions",
            keywords=["python", "functions", "def", "return"],
        )

        videos = [
            make_video(
                source_id="rel",
                title="Python Functions Tutorial",
                description="Learn about Python functions, def, arguments",
                tags=["python", "functions"],
            ),
            make_video(
                source_id="unrel",
                title="Cooking Italian Recipes",
                description="Best pasta recipes from Italy",
                tags=["cooking", "food"],
            ),
        ]

        scores = await scorer.score_videos(module, videos)
        assert len(scores) == 2
        assert scores[0] > scores[1]  # Relevant > irrelevant

    @pytest.mark.asyncio
    async def test_tfidf_empty_videos(self):
        from app.services.matching.tfidf import TFIDFScorer

        scorer = TFIDFScorer()
        module = make_module()
        scores = await scorer.score_videos(module, [])
        assert scores == []


# ─── Integration Test (Mock Pipeline) ─────────────────────────────────────

class TestPipelineIntegration:
    """Integration test using mock LLM and video sources."""

    @pytest.mark.asyncio
    async def test_full_pipeline_with_mocks(self):
        from app.pipeline.course_generation import CourseGenerationPipeline
        from app.services.embeddings.service import EmbeddingService
        from app.services.ingestion.adapter import VideoIngestionAdapter
        from app.services.llm.base import LLMProvider
        from app.services.matching.cross_encoder import CrossEncoderScorer
        from app.schemas.taxonomy import CourseTaxonomy, TaxonomyModule, TaxonomyConcept
        from app.services.taxonomy.generator import BatchSearchQueriesOutput, ModuleQueriesOutput
        
        # Mock LLM
        mock_llm = AsyncMock(spec=LLMProvider)

        # Mock taxonomy output
        taxonomy = CourseTaxonomy(
            course_title="Python Basics",
            course_description="Learn Python fundamentals",
            difficulty="beginner",
            language="English",
            learning_objectives=["Learn Python syntax", "Write functions"],
            modules=[
                TaxonomyModule(
                    title="Introduction",
                    description="Get started with Python",
                    order=1,
                    keywords=["python", "introduction", "basics"],
                    concepts=[TaxonomyConcept(name="Syntax")],
                    learning_objectives=["Understand Python syntax"],
                ),
            ],
        )

        # The taxonomy generator will call generate_structured twice:
        # once for taxonomy, once for search queries
        from app.services.taxonomy.generator import _LLMTaxonomyOutput, _LLMModuleOutput, _LLMConceptOutput

        llm_taxonomy_output = _LLMTaxonomyOutput(
            course_title="Python Basics",
            course_description="Learn Python fundamentals",
            learning_objectives=["Learn Python syntax", "Write functions"],
            modules=[
                _LLMModuleOutput(
                    title="Introduction",
                    description="Get started with Python",
                    keywords=["python", "introduction", "basics"],
                    concepts=[_LLMConceptOutput(name="Syntax")],
                    learning_objectives=["Understand Python syntax"],
                ),
            ],
        )

        search_queries = BatchSearchQueriesOutput(
            module_queries=[
                ModuleQueriesOutput(
                    module_title="Introduction",
                    queries=["python basics tutorial", "introduction to python"]
                )
            ]
        )

        mock_llm.generate_structured = AsyncMock(
            side_effect=[llm_taxonomy_output, search_queries]
        )

        # Mock ingestion adapter
        mock_ingestion = AsyncMock(spec=VideoIngestionAdapter)
        test_videos = [
            make_video(source_id=f"test_{i}", title=f"Python Tutorial Part {i}")
            for i in range(5)
        ]
        mock_ingestion.search_for_module = AsyncMock(return_value=test_videos)

        # Real embedding service and cross-encoder (will use actual models)
        embedding_service = EmbeddingService(model_name="all-MiniLM-L6-v2")
        cross_encoder = CrossEncoderScorer()

        pipeline = CourseGenerationPipeline(
            llm_provider=mock_llm,
            ingestion_adapter=mock_ingestion,
            embedding_service=embedding_service,
            cross_encoder_scorer=cross_encoder,
            db_session=None,
        )

        request = CourseGenerationRequest(
            topic="Python Programming",
            difficulty="beginner",
            module_config=ModuleConfig(target_modules=1, min_modules=1, max_modules=3),
            selection_config=SelectionConfig(final_top_k=2),
            cross_encoder_config={"enabled": False},  # Disable for faster test
        )

        response = await pipeline.generate(request)

        assert response.status == "completed"
        assert response.generation_id.startswith("gen_")
        assert response.course.course_title == "Python Basics"
        assert len(response.course.modules) == 1
        assert response.metadata.modules_generated == 1
        assert response.metadata.videos_considered > 0


# ─── Preset Catalog Tests ─────────────────────────────────────────────────

class TestPresetCatalog:
    """Test the preset catalog video source."""

    @pytest.mark.asyncio
    async def test_search_finds_relevant(self):
        from app.services.videos.catalog import PresetCatalogVideoSource

        catalog = PresetCatalogVideoSource()
        results = await catalog.search("python programming", max_results=5)
        assert len(results) > 0
        # Should find python-related videos
        assert any("python" in v.title.lower() for v in results)

    @pytest.mark.asyncio
    async def test_search_irrelevant_query(self):
        from app.services.videos.catalog import PresetCatalogVideoSource

        catalog = PresetCatalogVideoSource()
        results = await catalog.search(
            "quantum teleportation spacetime", max_results=5
        )
        # May return few or no results
        assert isinstance(results, list)

    @pytest.mark.asyncio
    async def test_get_video(self):
        from app.services.videos.catalog import PresetCatalogVideoSource

        catalog = PresetCatalogVideoSource()
        video = await catalog.get_video("catalog_py_001")
        assert video is not None
        assert "Python" in video.title

    @pytest.mark.asyncio
    async def test_get_nonexistent_video(self):
        from app.services.videos.catalog import PresetCatalogVideoSource

        catalog = PresetCatalogVideoSource()
        video = await catalog.get_video("nonexistent_id")
        assert video is None


# ─── Response Schema Tests ────────────────────────────────────────────────

class TestResponseSchemas:
    """Test response model validation."""

    def test_course_generation_response(self):
        from app.schemas.course import (
            Course,
            CourseGenerationResponse,
            CourseModule,
            CourseVideo,
            PipelineMetadata,
        )

        response = CourseGenerationResponse(
            status="completed",
            generation_id="gen_test123",
            course=Course(
                course_title="Test Course",
                description="A test course",
                difficulty="beginner",
                language="English",
                learning_objectives=["Learn testing"],
                target_audience="developers",
                modules=[
                    CourseModule(
                        title="Module 1",
                        description="First module",
                        order=1,
                        videos=[
                            CourseVideo(
                                video_id="v1",
                                source="catalog",
                                title="Test Video",
                                url="https://example.com",
                                relevance_score=0.85,
                                order=1,
                            )
                        ],
                    )
                ],
            ),
            metadata=PipelineMetadata(
                generation_id="gen_test123",
                modules_generated=1,
                videos_considered=50,
                videos_selected=1,
            ),
        )

        assert response.status == "completed"
        assert response.course.modules[0].videos[0].relevance_score == 0.85

    def test_debug_info(self):
        from app.schemas.course import DebugInfo

        debug = DebugInfo(
            candidate_counts={"Module 1": 25, "Module 2": 30},
            score_breakdowns={
                "Module 1": [
                    {"video_id": "v1", "cosine": 0.9, "final": 0.85}
                ]
            },
        )
        assert debug.candidate_counts["Module 1"] == 25


# ─── LLM Unwrapper Tests ──────────────────────────────────────────────────

class TestLLMUnwrapper:
    """Test unwrapping of root-wrapped LLM JSON outputs."""

    def test_unwrap_root_key(self):
        from app.services.llm.provider import _unwrap_root_key
        from app.services.taxonomy.generator import _LLMTaxonomyOutput

        wrapped_payload = {
            "_LLMTaxonomyOutput": {
                "course_title": "Python 101",
                "course_description": "Introductory Python",
                "learning_objectives": ["Syntax"],
                "modules": [],
            }
        }

        unwrapped = _unwrap_root_key(wrapped_payload, _LLMTaxonomyOutput)
        assert "course_title" in unwrapped
        assert unwrapped["course_title"] == "Python 101"

    def test_unwrap_not_needed_for_clean_dict(self):
        from app.services.llm.provider import _unwrap_root_key
        from app.services.taxonomy.generator import _LLMTaxonomyOutput

        clean_payload = {
            "course_title": "Python 101",
            "course_description": "Introductory Python",
            "learning_objectives": ["Syntax"],
            "modules": [],
        }

        unwrapped = _unwrap_root_key(clean_payload, _LLMTaxonomyOutput)
        assert unwrapped == clean_payload


# ─── Course Storage Endpoints Tests ──────────────────────────────────────────

class TestCourseStorageEndpoints:
    """Test retrieving and listing stored courses from the database."""

    @pytest.mark.asyncio
    async def test_list_courses_empty(self):
        from app.api.courses import list_courses

        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_db.execute.return_value = mock_result

        response = await list_courses(db=mock_db)
        assert response.total == 0
        assert response.courses == []

    @pytest.mark.asyncio
    async def test_get_course_not_found(self):
        from fastapi import HTTPException
        from app.api.courses import get_course

        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        with pytest.raises(HTTPException) as exc_info:
            await get_course("nonexistent_id", db=mock_db)

        assert exc_info.value.status_code == 404



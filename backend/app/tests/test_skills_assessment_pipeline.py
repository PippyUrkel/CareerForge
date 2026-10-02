"""Comprehensive Verification Test Suite for Part 2 Skill Analysis & Course Bridge."""

import asyncio
import unittest

from app.api.skills import (
    generate_assessment,
    list_occupations,
    list_taxonomy,
    submit_assessment,
)
from app.core.config import get_settings
from app.db.appwrite_service import (
    get_appwrite_databases,
    save_assessment_to_appwrite,
    update_profile_skills_in_appwrite,
)
from app.services.skills.assessment.bank import INTERNAL_QUESTION_BANK
from app.services.skills.assessment.bridge import (
    create_comprehensive_remedial_course_payload,
    create_course_generation_payload_from_gap,
)
from app.services.skills.assessment.gap_analyzer import compute_skill_gaps
from app.services.skills.assessment.generator import generate_assessment_for_occupation
from app.services.skills.assessment.models import (
    AssessmentAnswer,
    AssessmentQuestion,
    AssessmentSubmission,
    SkillScoreResult,
)
from app.services.skills.assessment.provider import get_assessment_provider
from app.services.skills.assessment.scorer import evaluate_skill_assessment
from app.services.skills.esco import ESCO_OCCUPATIONS_CACHE
from app.services.skills.occupations import OCCUPATION_PROFILES, get_occupation
from app.services.skills.onet import ONET_OCCUPATIONS_CACHE, map_onet_keyword_to_internal_skill
from app.services.skills.taxonomy import SKILLS_REGISTRY, get_skill


class TestSkillAnalysisSystem(unittest.IsolatedAsyncioTestCase):
    """Test suite ensuring all Part 2 requirements and non-negotiables are satisfied."""

    def test_1_normalized_skill_taxonomy(self):
        """Requirement 1: Normalized internal skill model."""
        self.assertGreaterEqual(len(SKILLS_REGISTRY), 8)
        py_skill = get_skill("skill_python")
        self.assertIsNotNone(py_skill)
        self.assertEqual(py_skill.internal_skill_id, "skill_python")
        self.assertEqual(py_skill.category, "Backend Architecture")
        self.assertIn("esco_uri", py_skill.metadata)
        self.assertIn("onet_element", py_skill.metadata)

    def test_2_esco_integration(self):
        """Requirement 2: ESCO occupations, skills, and caching."""
        self.assertIn("2512.2", ESCO_OCCUPATIONS_CACHE)
        backend_esco = ESCO_OCCUPATIONS_CACHE["2512.2"]
        self.assertEqual(backend_esco.preferred_label, "Backend Developer")
        skill_ids = [s.internal_skill_id for s in backend_esco.skills]
        self.assertIn("skill_python", skill_ids)
        self.assertIn("skill_sql", skill_ids)
        self.assertIn("skill_docker", skill_ids)

    def test_3_onet_integration_and_mapping(self):
        """Requirement 3: O*NET occupations and mapping layer to internal skills."""
        self.assertIn("15-1252.00", ONET_OCCUPATIONS_CACHE)
        # Verify mapping layer resolves hot tech keywords into normalized internal skills
        self.assertEqual(map_onet_keyword_to_internal_skill("python"), "skill_python")
        self.assertEqual(map_onet_keyword_to_internal_skill("docker"), "skill_docker")
        self.assertEqual(map_onet_keyword_to_internal_skill("postgresql"), "skill_sql")

    def test_4_and_7_question_bank_metadata_and_difficulty(self):
        """Requirements 4 & 7: Questions have metadata, difficulty (1,2,3), and weights (1.0, 1.5, 2.0)."""
        self.assertGreaterEqual(len(INTERNAL_QUESTION_BANK), 20)
        for q in INTERNAL_QUESTION_BANK:
            self.assertIn(q.difficulty, (1, 2, 3))
            expected_weight = 1.0 if q.difficulty == 1 else (1.5 if q.difficulty == 2 else 2.0)
            self.assertEqual(q.weight, expected_weight)
            self.assertTrue(len(q.options) >= 2)
            self.assertTrue(any(opt.id == q.correct_answer for opt in q.options))
            self.assertTrue(len(q.explanation) > 10)

    def test_5_assessment_provider_architecture(self):
        """Requirement 5: AssessmentProvider abstraction and commercial adapters."""
        for provider_name in ["INTERNAL", "METTL", "TESTGORILLA", "SHL", "HACKERRANK", "CODESIGNAL"]:
            provider = get_assessment_provider(provider_name)
            self.assertIsNotNone(provider)
            questions = provider.fetch_questions(skill_ids=["skill_python"], difficulties=[1, 2], limit_per_skill=2)
            self.assertTrue(len(questions) > 0)

    def test_6_assessment_selection_coverage(self):
        """Requirement 6: Multi-skill and multi-difficulty assessment selection with source disclosure."""
        asmt = generate_assessment_for_occupation("backend_developer", questions_per_skill=2)
        self.assertTrue(asmt["total_questions"] >= 8)
        difficulties_represented = {q["difficulty"] for q in asmt["questions"]}
        self.assertTrue(len(difficulties_represented) >= 2)
        self.assertIn("source_disclosure", asmt)
        self.assertTrue(len(asmt["source_disclosure"]) > 20)
        for q in asmt["questions"]:
            self.assertIn("source", q)
            self.assertIn("source_attribution", q)

    def test_8_and_9_deterministic_scoring_and_confidence(self):
        """Requirements 8 & 9: Deterministic scoring and distinct evidence-based confidence."""
        py_questions = [q for q in INTERNAL_QUESTION_BANK if q.skill_id == "skill_python"]
        self.assertTrue(len(py_questions) >= 4)

        # Case A: Answer all questions correctly across Beg, Int, Adv
        answers_all_correct = [
            AssessmentAnswer(question_id=q.question_id, selected_option=q.correct_answer)
            for q in py_questions
        ]
        res_a = evaluate_skill_assessment("skill_python", answers_all_correct, py_questions)
        self.assertEqual(res_a.score, 100.0)
        self.assertGreaterEqual(res_a.confidence, 0.70)
        self.assertEqual(res_a.classification, "STRONG")

        # Case B: Answer only 1 question (sparse evidence)
        res_b = evaluate_skill_assessment("skill_python", answers_all_correct[:1], py_questions[:1])
        self.assertEqual(res_b.score, 100.0)  # 100% score!
        # But confidence MUST be low because evidence is sparse!
        self.assertLess(res_b.confidence, 0.55)
        self.assertNotEqual(res_b.score, res_b.confidence * 100)  # Score is NOT confidence!
        self.assertEqual(res_b.classification, "INSUFFICIENT_EVIDENCE")

    def test_10_and_12_skill_gap_analysis(self):
        """Requirements 10 & 12: Skill gap calculation and confidence qualification."""
        occ = get_occupation("backend_developer")
        self.assertIsNotNone(occ)

        evaluated = [
            SkillScoreResult(
                skill_id="skill_python",
                skill_name="Python Programming",
                category="Backend Architecture",
                score=85.0,
                confidence=0.92,
                level="Advanced",
                classification="STRONG",
                status_label="Strong",
                evidence_count=6,
            ),
            SkillScoreResult(
                skill_id="skill_docker",
                skill_name="Docker & Containerization",
                category="Cloud & DevOps",
                score=25.0,
                confidence=0.88,
                level="Beginner",
                classification="WEAK",
                status_label="Weak",
                evidence_count=4,
            ),
            SkillScoreResult(
                skill_id="skill_testing",
                skill_name="Software Testing & Quality Assurance",
                category="Testing & QA",
                score=30.0,
                confidence=0.35,  # LOW CONFIDENCE
                level="Beginner",
                classification="INSUFFICIENT_EVIDENCE",
                status_label="Potential Weakness",
                evidence_count=1,
            ),
        ]

        gaps, fit_pct = compute_skill_gaps(occ, evaluated)
        self.assertTrue(len(gaps) > 0)

        # Docker has high confidence weak score -> critical gap
        docker_gap = next(g for g in gaps if g.skill_id == "skill_docker")
        self.assertEqual(docker_gap.status, "critical_gap")
        self.assertEqual(docker_gap.gap, 45.0)  # 70 benchmark - 25 score = 45 gap

        # Testing has low confidence -> insufficient evidence interpretation
        testing_gap = next(g for g in gaps if g.skill_id == "skill_testing")
        self.assertEqual(testing_gap.status, "insufficient_evidence")

    def test_14_course_generation_personalization_bridge(self):
        """Requirement 14: Bridge skill gaps into sacred course generation payload."""
        occ = get_occupation("backend_developer")
        evaluated = [
            SkillScoreResult(
                skill_id="skill_python",
                skill_name="Python Programming",
                category="Backend Architecture",
                score=90.0,
                confidence=0.95,
                level="Advanced",
                classification="STRONG",
                status_label="Strong",
                evidence_count=6,
            ),
            SkillScoreResult(
                skill_id="skill_docker",
                skill_name="Docker & Containerization",
                category="Cloud & DevOps",
                score=20.0,
                confidence=0.90,
                level="Beginner",
                classification="WEAK",
                status_label="Weak",
                evidence_count=5,
            ),
        ]
        gaps, _ = compute_skill_gaps(occ, evaluated)
        docker_gap = next(g for g in gaps if g.skill_id == "skill_docker")

        payload = create_course_generation_payload_from_gap(
            skill_gap=docker_gap,
            target_occupation_title=occ.title,
            evaluated_skills=evaluated,
        )

        self.assertEqual(payload["topic"], "Docker & Containerization")
        self.assertEqual(payload["difficulty"], "beginner")
        self.assertIn("Python Programming", payload["prerequisites"][0])
        self.assertIn("skill_context", payload)
        self.assertEqual(payload["skill_context"]["target_occupation"], occ.title)
        self.assertEqual(payload["skill_context"]["gap_percentage"], 50.0)

    async def test_11_appwrite_persistence(self):
        """Requirement 11: Appwrite persistence of assessments and profiles."""
        settings = get_settings()
        if not settings.appwrite_api_key:
            self.skipTest("Appwrite API key not configured")

        asmt = generate_assessment_for_occupation("backend_developer", questions_per_skill=1)
        answers = [AssessmentAnswer(question_id=q["question_id"], selected_option="a") for q in asmt["questions"]]
        submission = AssessmentSubmission(
            assessment_id=asmt["assessment_id"],
            user_id="test_unit_user_42",
            target_occupation_id="backend_developer",
            answers=answers,
        )

        res = await submit_assessment(submission, settings)
        self.assertEqual(res.assessment_id, asmt["assessment_id"])

        # Check Appwrite collection
        db = get_appwrite_databases(settings)
        from appwrite.query import Query

        docs = db.list_documents(
            settings.appwrite_database_id,
            settings.appwrite_assessments_collection_id,
            queries=[Query.equal("assessmentId", res.assessment_id)],
        )
        self.assertGreaterEqual(len(docs.documents), 1)

        # Cleanup test document
        doc_id = docs.documents[0].id
        db.delete_document(settings.appwrite_database_id, settings.appwrite_assessments_collection_id, doc_id)

    def test_15_dynamic_occupation_generation(self):
        """Test on-the-fly dynamic occupation benchmark generation for arbitrary roles."""
        from app.services.skills.occupations import generate_dynamic_occupation_profile, get_occupation
        dyn_role = generate_dynamic_occupation_profile("Senior Flutter Architect", category="Mobile Engineering", experience_level="senior")
        self.assertEqual(dyn_role.title, "Senior Flutter Architect")
        self.assertEqual(dyn_role.category, "Mobile Engineering")
        self.assertTrue(len(dyn_role.required_skills) >= 4)
        # Verify senior benchmark target is set
        for s in dyn_role.required_skills:
            if s.skill_id == "skill_mobile":
                self.assertGreaterEqual(s.benchmark_level, 80)
        # Verify get_occupation resolves it dynamically
        fetched = get_occupation("senior_flutter_architect")
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched.title, "Senior Flutter Architect")

    def test_16_commercial_scraper_attribution(self):
        """Test commercial platform scraper provenance and questions from Mercer Mettl, TestGorilla, SHL, HackerRank, CodeSignal."""
        from app.services.skills.assessment.scraper import get_scraper_service
        scraper = get_scraper_service()
        curated = scraper.get_curated_questions(skill_ids=["skill_python", "skill_testing", "skill_react", "skill_docker"])
        self.assertTrue(len(curated) >= 4)
        sources = {q.source for q in curated}
        # Verify commercial platform names appear
        self.assertTrue(any(p in sources for p in ["Mercer Mettl", "TestGorilla", "HackerRank", "CodeSignal", "SHL"]))
        for q in curated:
            self.assertTrue(q.external_question_id is not None)
            self.assertTrue(len(q.external_question_id) > 2)

        # Verify multi-source provider distributes commercial sources
        multi_provider = get_assessment_provider("all")
        asmt_questions = multi_provider.fetch_questions(skill_ids=["skill_python", "skill_sql", "skill_docker"], limit_per_skill=2)
        asmt_sources = {q.source for q in asmt_questions}
        self.assertTrue(any(p in asmt_sources for p in ["Mercer Mettl", "TestGorilla", "HackerRank", "CodeSignal", "SHL"]))


if __name__ == "__main__":
    unittest.main()

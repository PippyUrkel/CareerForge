"""Personalization Bridge connecting Skill Gap Analysis to the Course Generation Pipeline.

Feeds structured user context and identified skill gaps into the sacred course generation
pipeline without altering the internal algorithmic pipeline or video scoring logic.
"""

from __future__ import annotations

from typing import Any
from app.services.skills.assessment.models import AssessmentResult, SkillGapItem, SkillScoreResult
from app.services.skills.occupations import get_occupation


def create_course_generation_payload_from_gap(
    skill_gap: SkillGapItem,
    target_occupation_title: str,
    evaluated_skills: list[SkillScoreResult],
    modules_count: int = 6,
    videos_per_module: int = 3,
) -> dict[str, Any]:
    """Generate a pre-filled, personalized CourseGenerationRequest payload for a specific gap."""
    strong_skills = [s for s in evaluated_skills if s.classification == "STRONG"]
    weak_skills = [s for s in evaluated_skills if s.classification in ("WEAK", "INSUFFICIENT_EVIDENCE")]

    # Calibrate recommended difficulty based on current evaluated score
    if skill_gap.current_score < 40:
        recommended_difficulty = "beginner"
    elif skill_gap.current_score < 70:
        recommended_difficulty = "intermediate"
    else:
        recommended_difficulty = "advanced"

    # Targeted objectives bridging the gap
    objectives = [
        f"Bridge technical gap in {skill_gap.skill_name} from current baseline ({skill_gap.current_score:.0f}%) toward target benchmark ({skill_gap.required_benchmark}%)",
        f"Master core industrial patterns required for {target_occupation_title}",
        f"Apply practical implementations and hands-on exercises in {skill_gap.category}",
        f"Resolve edge cases and eliminate conceptual vulnerabilities in {skill_gap.skill_name}",
    ]

    # Prerequisites derived from verified strengths
    prerequisites = [
        f"Proficiency in {s.skill_name} (Score: {s.score:.0f}%)"
        for s in strong_skills[:3]
    ]
    if not prerequisites:
        prerequisites = ["Foundational computer science concepts and basic command-line proficiency"]

    target_audience = (
        f"Engineers targeting {target_occupation_title} roles with verified strengths in "
        f"{', '.join(s.skill_name for s in strong_skills[:2]) or 'software development'} "
        f"who need accelerated remediation in {skill_gap.skill_name}."
    )

    skill_context = {
        "target_occupation": target_occupation_title,
        "primary_gap_skill": skill_gap.skill_name,
        "gap_percentage": skill_gap.gap,
        "confidence": skill_gap.confidence,
        "strong_skills": [s.skill_name for s in strong_skills],
        "weak_skills": [s.skill_name for s in weak_skills],
    }

    return {
        "topic": skill_gap.skill_name,
        "course_title": f"Mastering {skill_gap.skill_name} for {target_occupation_title}",
        "course_description": (
            f"A personalized remedial curriculum designed to bridge the verified {skill_gap.gap:.0f}% "
            f"competency gap in {skill_gap.skill_name} for aspiring {target_occupation_title} professionals."
        ),
        "difficulty": recommended_difficulty,
        "target_audience": target_audience,
        "learning_objectives": objectives,
        "prerequisites": prerequisites,
        "module_config": {
            "target_modules": modules_count,
        },
        "video_config": {
            "videos_per_module": videos_per_module,
            "target_duration_seconds": 600,
        },
        "skill_context": skill_context,
    }


def create_comprehensive_remedial_course_payload(
    result: AssessmentResult,
    modules_count: int = 6,
) -> dict[str, Any]:
    """Generate a multi-gap remedial curriculum payload targeting all critical gaps."""
    critical_gaps = [g for g in result.gaps if g.status in ("critical_gap", "developing")]
    gap_names = [g.skill_name for g in critical_gaps[:3]]

    topic = f"{result.target_occupation_title} Remedial Accelerator"
    if gap_names:
        topic = f"{' & '.join(gap_names[:2])} for {result.target_occupation_title}"

    objectives = [
        f"Targeted remediation of identified competency deficits: {', '.join(g.skill_name for g in critical_gaps[:4])}",
        f"Attain professional benchmark proficiency for {result.target_occupation_title}",
        "Synthesize practical workflows and production-ready architectures",
    ]

    prerequisites = [
        f"Verified strength in {s}" for s in result.strong_skills[:3]
    ]

    return {
        "topic": topic,
        "course_title": f"Accelerated Competency Bridge: {result.target_occupation_title}",
        "course_description": (
            f"Comprehensive curriculum focused directly on resolving {len(critical_gaps)} identified "
            f"skill gaps to achieve 100% role alignment for {result.target_occupation_title}."
        ),
        "difficulty": "intermediate",
        "target_audience": f"Candidates preparing for {result.target_occupation_title} with current fit of {result.overall_fit_percentage:.0f}%.",
        "learning_objectives": objectives,
        "prerequisites": prerequisites or ["Basic programming fundamentals"],
        "module_config": {
            "target_modules": modules_count,
        },
        "video_config": {
            "videos_per_module": 3,
            "target_duration_seconds": 600,
        },
        "skill_context": {
            "target_occupation": result.target_occupation_title,
            "overall_fit_percentage": result.overall_fit_percentage,
            "strong_skills": result.strong_skills,
            "weak_skills": result.weak_skills,
            "skill_gaps": [
                {
                    "skill": g.skill_name,
                    "current_score": g.current_score,
                    "required_score": g.required_benchmark,
                    "gap": g.gap,
                    "confidence": g.confidence,
                }
                for g in critical_gaps
            ],
        },
    }

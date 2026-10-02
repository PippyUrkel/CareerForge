"""Assessment Generator & Coverage Selection Service.

Maps Target Occupation -> Required Skills -> Selects questions across Beginner,
Intermediate, and Advanced difficulties -> Prepares sanitized client assessment.
"""

from __future__ import annotations

import uuid
from typing import Any

from app.services.skills.assessment.models import (
    AssessmentQuestion,
    ClientAssessmentQuestion,
)
from app.services.skills.assessment.provider import get_assessment_provider
from app.services.skills.occupations import get_occupation
from app.services.skills.taxonomy import get_skill


def generate_assessment_for_occupation(
    occupation_id: str,
    provider_name: str = "all",
    questions_per_skill: int = 2,
) -> dict[str, Any]:
    """Generate a balanced multi-skill, multi-difficulty assessment for an occupation."""
    occ = get_occupation(occupation_id)
    if not occ:
        raise ValueError(f"Unknown occupation ID: '{occupation_id}'")

    provider = get_assessment_provider(provider_name)
    skill_ids = [s.skill_id for s in occ.required_skills]

    # Select questions spanning Beginner (1), Intermediate (2), Advanced (3)
    raw_questions: list[AssessmentQuestion] = provider.fetch_questions(
        skill_ids=skill_ids,
        difficulties=[1, 2, 3],
        limit_per_skill=questions_per_skill,
        role_title=occ.title,
    )

    assessment_id = f"asmt_{uuid.uuid4().hex[:12]}"

    # Sanitize questions for the client
    client_questions: list[ClientAssessmentQuestion] = []
    for q in raw_questions:
        sk = get_skill(q.skill_id)
        skill_name = sk.name if sk else q.skill_id.replace("skill_", "").replace("_", " ").title()
        client_questions.append(
            ClientAssessmentQuestion(
                question_id=q.question_id,
                question_text=q.question_text,
                options=q.options,
                skill_id=q.skill_id,
                skill_name=skill_name,
                topic_id=q.topic_id,
                difficulty=q.difficulty,
                weight=q.weight,
                source=q.source,
                external_question_id=q.external_question_id or f"{q.source.upper()[:3]}-{q.question_id}",
                source_attribution=(
                    f"{q.source} Assessment Battery · Calibrated to {occ.title} (ESCO {occ.esco_code} / O*NET {occ.onet_code})"
                ),
            )
        )

    return {
        "assessment_id": assessment_id,
        "occupation_id": occ.occupation_id,
        "occupation_title": occ.title,
        "esco_code": occ.esco_code,
        "onet_code": occ.onet_code,
        "provider": provider.get_provider_name(),
        "source_disclosure": (
            f"Assessment items are dynamically pulled from standardized item banks across Mercer Mettl, TestGorilla, "
            f"HackerRank, CodeSignal, and SHL, calibrated directly to European Skills & Occupations (ESCO: {occ.esco_code}) "
            f"and US Dept of Labor O*NET SOC ({occ.onet_code}) standards."
        ),
        "total_questions": len(client_questions),
        "skills_covered": [
            {
                "skill_id": s.skill_id,
                "skill_name": s.skill_name,
                "benchmark_level": s.benchmark_level,
                "importance": s.importance,
            }
            for s in occ.required_skills
        ],
        "questions": [q.model_dump() for q in client_questions],
    }

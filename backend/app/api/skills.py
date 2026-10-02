"""Skills, ESCO/O*NET Occupations, Assessments, and Personalization Bridge API Endpoints."""

from __future__ import annotations

import datetime
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.core.config import AppSettings, get_settings
from app.db.appwrite_service import (
    save_assessment_to_appwrite,
    update_profile_skills_in_appwrite,
)
from app.services.skills.assessment.bank import get_question_by_id
from app.services.skills.assessment.bridge import (
    create_comprehensive_remedial_course_payload,
    create_course_generation_payload_from_gap,
)
from app.services.skills.assessment.gap_analyzer import compute_skill_gaps
from app.services.skills.assessment.generator import generate_assessment_for_occupation
from app.services.skills.assessment.models import (
    AssessmentAnswer,
    AssessmentQuestion,
    AssessmentResult,
    AssessmentSubmission,
    SkillGapItem,
    SkillScoreResult,
)
from app.services.skills.assessment.scorer import evaluate_skill_assessment
from app.services.skills.occupations import (
    OccupationProfile,
    generate_dynamic_occupation_profile,
    get_all_occupations,
    get_occupation,
)
from app.services.skills.taxonomy import (
    InternalSkill,
    get_all_skills,
    get_skill,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/skills", tags=["skills"])


# ─────────────────────────────────────────────────────────────────────────────
# 1. TAXONOMY & OCCUPATION ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/taxonomy", response_model=list[InternalSkill])
async def list_taxonomy():
    """Retrieve all normalized internal skills with ESCO and O*NET mappings."""
    return get_all_skills()


@router.get("/occupations", response_model=list[OccupationProfile])
async def list_occupations():
    """Retrieve supported occupations with required competency benchmarks."""
    return get_all_occupations()


class DynamicOccupationRequest(BaseModel):
    """Payload to dynamically register an occupation on the fly."""

    title: str
    category: str | None = None
    experience_level: str | None = None


@router.post("/occupations/dynamic", response_model=OccupationProfile)
async def create_dynamic_occupation(payload: DynamicOccupationRequest):
    """Dynamically construct and register a new occupational benchmark profile for any custom role."""
    if not payload.title or not payload.title.strip():
        raise HTTPException(status_code=400, detail="Occupation title is required.")
    return generate_dynamic_occupation_profile(
        role_title=payload.title.strip(),
        category=payload.category,
        experience_level=payload.experience_level,
    )


@router.get("/occupations/{occupation_id}", response_model=OccupationProfile)
async def get_occupation_profile(occupation_id: str):
    """Retrieve a specific occupation benchmark profile."""
    occ = get_occupation(occupation_id)
    if not occ:
        raise HTTPException(status_code=404, detail=f"Occupation '{occupation_id}' not found.")
    return occ


# ─────────────────────────────────────────────────────────────────────────────
# 2. ASSESSMENT GENERATION & SUBMISSION ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

class ScrapeQuestionsRequest(BaseModel):
    """Request payload to scrape or synthesize on-the-fly questions for a role."""

    role_title: str
    skill_id: str
    difficulty: int = 2
    provider_name: str = "Mercer Mettl"
    count: int = 2


@router.post("/questions/scrape")
async def scrape_role_questions(payload: ScrapeQuestionsRequest):
    """Dynamically scrape and synthesize authentic role-specific questions on the fly for any platform."""
    from app.services.skills.assessment.scraper import get_scraper_service
    scraper = get_scraper_service()
    questions = await scraper.generate_role_specific_questions_on_the_fly(
        role_title=payload.role_title,
        skill_id=payload.skill_id,
        difficulty=payload.difficulty,
        provider_name=payload.provider_name,
        count=payload.count,
    )
    if not questions:
        # Fallback to curated platform questions
        questions = scraper.get_curated_questions(
            provider_name=payload.provider_name,
            skill_ids=[payload.skill_id],
            difficulties=[payload.difficulty],
            limit_per_skill=payload.count,
        )
    return {"questions": [q.model_dump() for q in questions], "count": len(questions)}


@router.get("/assessment/generate")
async def generate_assessment(
    occupation_id: str = Query("backend_developer", description="Target occupation identifier or custom role title"),
    provider: str = Query("all", description="Assessment question provider (all, mettl, testgorilla, hackerrank, codesignal, shl, internal)"),
    questions_per_skill: int = Query(2, ge=1, le=8, description="Number of questions per skill"),
):
    """Generate a balanced multi-difficulty MCQ assessment covering the occupation's required skills."""
    try:
        assessment_payload = generate_assessment_for_occupation(
            occupation_id=occupation_id,
            provider_name=provider,
            questions_per_skill=questions_per_skill,
        )
        return assessment_payload
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.error("Failed to generate assessment: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to synthesize assessment.")


@router.post("/assessment/submit", response_model=AssessmentResult)
async def submit_assessment(
    submission: AssessmentSubmission,
    settings: AppSettings = Depends(get_settings),
):
    """Submit user assessment answers, compute deterministic scores, evidence-based confidence, and skill gaps.
    
    Persists evaluated skill profile and raw evidence to Appwrite if authenticated.
    """
    occ = get_occupation(submission.target_occupation_id)
    if not occ:
        raise HTTPException(
            status_code=404,
            detail=f"Target occupation '{submission.target_occupation_id}' not found.",
        )

    # 1. Group answers and questions by skill
    questions_by_skill: dict[str, list[AssessmentQuestion]] = {}
    answers_by_skill: dict[str, list[AssessmentAnswer]] = {}

    for ans in submission.answers:
        q = get_question_by_id(ans.question_id)
        if q:
            questions_by_skill.setdefault(q.skill_id, []).append(q)
            answers_by_skill.setdefault(q.skill_id, []).append(ans)

    # Ensure all required skills for this occupation are represented
    for req in occ.required_skills:
        if req.skill_id not in questions_by_skill:
            questions_by_skill[req.skill_id] = []
            answers_by_skill[req.skill_id] = []

    # 2. Deterministically score each skill & calculate evidence confidence (Zero LLM)
    evaluated_skills: list[SkillScoreResult] = []
    strong_skills: list[str] = []
    developing_skills: list[str] = []
    weak_skills: list[str] = []
    insufficient_evidence_skills: list[str] = []

    total_weighted_score = 0.0
    total_weights = 0.0

    for skill_id, q_list in questions_by_skill.items():
        ans_list = answers_by_skill.get(skill_id, [])
        skill_res = evaluate_skill_assessment(
            skill_id=skill_id,
            answers=ans_list,
            questions=q_list,
        )
        evaluated_skills.append(skill_res)

        total_weighted_score += skill_res.score * (1.0 if skill_res.evidence_count > 0 else 0.5)
        total_weights += 1.0 if skill_res.evidence_count > 0 else 0.5

        if skill_res.classification == "STRONG":
            strong_skills.append(skill_res.skill_name)
        elif skill_res.classification == "DEVELOPING":
            developing_skills.append(skill_res.skill_name)
        elif skill_res.classification == "WEAK":
            weak_skills.append(skill_res.skill_name)
        else:
            insufficient_evidence_skills.append(skill_res.skill_name)

    overall_score = round(total_weighted_score / total_weights, 1) if total_weights > 0 else 0.0

    # Overall confidence is average confidence weighted by evidence count
    evidence_sum = sum(s.evidence_count for s in evaluated_skills)
    if evidence_sum > 0:
        overall_confidence = round(
            sum(s.confidence * s.evidence_count for s in evaluated_skills) / evidence_sum,
            2,
        )
    else:
        overall_confidence = 0.20

    # 3. Deterministic Skill Gap Analysis against target occupation benchmarks
    gaps, overall_fit = compute_skill_gaps(occ, evaluated_skills)

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    result = AssessmentResult(
        assessment_id=submission.assessment_id,
        user_id=submission.user_id,
        target_occupation_id=occ.occupation_id,
        target_occupation_title=occ.title,
        overall_score=overall_score,
        overall_confidence=overall_confidence,
        overall_fit_percentage=overall_fit,
        skills=evaluated_skills,
        strong_skills=strong_skills,
        developing_skills=developing_skills,
        weak_skills=weak_skills,
        insufficient_evidence_skills=insufficient_evidence_skills,
        gaps=gaps,
        created_at=now_iso,
    )

    # 4. Appwrite Persistence
    if submission.user_id:
        try:
            # Save raw assessment record
            await save_assessment_to_appwrite(
                assessment_data=result.model_dump(mode="json"),
                user_id=submission.user_id,
                settings=settings,
            )

            # Map evaluated skills for profile summary
            skills_profile_map = {
                s.skill_id: {
                    "name": s.skill_name,
                    "score": s.score,
                    "confidence": s.confidence,
                    "level": s.level,
                    "classification": s.classification,
                }
                for s in evaluated_skills
            }

            # Update User's Profile in Appwrite
            await update_profile_skills_in_appwrite(
                user_id=submission.user_id,
                strong_skills=strong_skills,
                weak_skills=weak_skills,
                developing_skills=developing_skills,
                insufficient_evidence_skills=insufficient_evidence_skills,
                skills_map=skills_profile_map,
                settings=settings,
            )
        except Exception as appwrite_err:
            logger.warning("Could not persist skill assessment to Appwrite: %s", appwrite_err)

    return result


# ─────────────────────────────────────────────────────────────────────────────
# 3. PERSONALIZATION BRIDGE TO COURSE GENERATION PIPELINE
# ─────────────────────────────────────────────────────────────────────────────

class BridgeGapRequest(BaseModel):
    """Request payload to construct a personalized course generation payload for a single gap."""

    skill_gap: SkillGapItem
    target_occupation_title: str
    evaluated_skills: list[SkillScoreResult]
    modules_count: int = 6


class BridgeComprehensiveRequest(BaseModel):
    """Request payload to construct a multi-gap remedial curriculum payload."""

    assessment_result: AssessmentResult
    modules_count: int = 6


@router.post("/bridge-to-course/gap")
async def bridge_gap_to_course(request: BridgeGapRequest):
    """Translate an identified single skill gap into a personalized CourseGenerationRequest payload."""
    payload = create_course_generation_payload_from_gap(
        skill_gap=request.skill_gap,
        target_occupation_title=request.target_occupation_title,
        evaluated_skills=request.evaluated_skills,
        modules_count=request.modules_count,
    )
    return payload


@router.post("/bridge-to-course/comprehensive")
async def bridge_comprehensive_to_course(request: BridgeComprehensiveRequest):
    """Translate complete assessment result into a multi-gap remedial curriculum payload."""
    payload = create_comprehensive_remedial_course_payload(
        result=request.assessment_result,
        modules_count=request.modules_count,
    )
    return payload

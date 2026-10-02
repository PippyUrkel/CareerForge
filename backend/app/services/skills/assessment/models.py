"""Data models for MCQ assessment system, submissions, scoring, and skill profiles."""

from __future__ import annotations

from typing import Any
from pydantic import BaseModel, Field


class QuestionOption(BaseModel):
    """An answer option for a multiple-choice question."""

    id: str = Field(..., description="Option key, e.g. 'a', 'b', 'c', 'd'")
    text: str = Field(..., description="Answer option description")


class AssessmentQuestion(BaseModel):
    """A multiple-choice assessment question mapped to a specific skill & topic."""

    question_id: str
    question_text: str
    options: list[QuestionOption]
    correct_answer: str = Field(..., description="Option id of the correct choice (hidden during client assessment)")
    skill_id: str = Field(..., description="Internal skill ID being assessed")
    topic_id: str = Field(..., description="Specific subtopic, e.g. 'oop', 'asyncio', 'indexes'")
    difficulty: int = Field(..., ge=1, le=3, description="1 = Beginner, 2 = Intermediate, 3 = Advanced")
    weight: float = Field(default=1.0, description="1.0 for Beginner, 1.5 for Intermediate, 2.0 for Advanced")
    source: str = Field(default="INTERNAL", description="Provider: INTERNAL, METTL, TESTGORILLA, SHL, etc.")
    external_question_id: str | None = None
    explanation: str = Field(..., description="Technical rationale for the correct answer")


class ClientAssessmentQuestion(BaseModel):
    """Sanitized question payload delivered to the client (omits correct_answer & explanation)."""

    question_id: str
    question_text: str
    options: list[QuestionOption]
    skill_id: str
    skill_name: str
    topic_id: str
    difficulty: int
    weight: float
    source: str = Field(default="INTERNAL", description="Source provider: INTERNAL, METTL, TESTGORILLA, SHL, etc.")
    external_question_id: str | None = None
    source_attribution: str = Field(default="CareerForge Standard Technical Question Bank (Calibrated to ESCO v1.2 & O*NET SOC)", description="Attribution text disclosing origin and occupational mapping")


class AssessmentAnswer(BaseModel):
    """User response to a single question."""

    question_id: str
    selected_option: str
    time_spent_seconds: float = 0.0


class AssessmentSubmission(BaseModel):
    """Complete assessment submission payload."""

    assessment_id: str
    user_id: str | None = None
    target_occupation_id: str
    answers: list[AssessmentAnswer]


class SkillScoreResult(BaseModel):
    """Deterministic score and confidence evaluation for a single skill."""

    skill_id: str
    skill_name: str
    category: str
    score: float = Field(..., description="Weighted score 0 - 100")
    confidence: float = Field(..., description="Evidence reliability 0.0 - 1.0")
    level: str = Field(..., description="Beginner, Intermediate, or Advanced")
    classification: str = Field(..., description="STRONG, DEVELOPING, WEAK, or INSUFFICIENT_EVIDENCE")
    status_label: str = Field(..., description="User-facing status label")
    evidence_count: int
    difficulty_coverage: dict[str, int] = Field(default_factory=dict)
    topic_coverage: list[str] = Field(default_factory=list)
    raw_evidence: dict[str, Any] = Field(default_factory=dict)


class SkillGapItem(BaseModel):
    """Detailed gap measurement for a required skill."""

    skill_id: str
    skill_name: str
    category: str
    current_score: float
    required_benchmark: int
    gap: float = Field(..., description="required_benchmark - current_score (0 if mastered)")
    confidence: float
    status: str = Field(..., description="matched, developing, critical_gap, or insufficient_evidence")
    status_label: str
    importance: str = "essential"
    market_demand: str = "High"


class AssessmentResult(BaseModel):
    """Complete evaluated assessment report."""

    assessment_id: str
    user_id: str | None = None
    target_occupation_id: str
    target_occupation_title: str
    overall_score: float
    overall_confidence: float
    overall_fit_percentage: float
    skills: list[SkillScoreResult]
    strong_skills: list[str]
    developing_skills: list[str]
    weak_skills: list[str]
    insufficient_evidence_skills: list[str]
    gaps: list[SkillGapItem]
    created_at: str

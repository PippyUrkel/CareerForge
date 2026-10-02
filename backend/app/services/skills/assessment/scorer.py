"""Deterministic Scoring & Evidence-Based Skill Confidence Engine.

Adheres strictly to architectural non-negotiables:
1. Scores are computed deterministically from question weights and difficulty (Zero LLM).
2. Confidence is evaluated from evidentiary breadth (question count, difficulty spread,
   topic coverage, performance consistency) — NOT equated to score percentage.
3. Classifies competencies into Strong, Developing, Weak, and Insufficient Evidence.
"""

from __future__ import annotations

import logging
from typing import Any

from app.services.skills.assessment.bank import get_question_by_id
from app.services.skills.assessment.models import (
    AssessmentAnswer,
    AssessmentQuestion,
    SkillScoreResult,
)
from app.services.skills.taxonomy import get_skill

logger = logging.getLogger(__name__)


def calculate_difficulty_coverage(questions: list[AssessmentQuestion]) -> float:
    """Evaluate how well difficulty levels (1=Beg, 2=Int, 3=Adv) were sampled."""
    distinct_difficulties = {q.difficulty for q in questions}
    if len(distinct_difficulties) >= 3:
        return 1.0
    if len(distinct_difficulties) == 2:
        return 0.75
    if len(distinct_difficulties) == 1:
        return 0.45
    return 0.20


def calculate_performance_consistency(
    answers_by_difficulty: dict[int, list[bool]]
) -> float:
    """Evaluate if user performance is coherent across difficulty tiers.
    
    Expected coherent pattern: Beginner accuracy >= Intermediate accuracy >= Advanced accuracy.
    Erratic patterns (failing easy questions while passing hard questions) indicate
    guessing or noisy evidence, reducing confidence.
    """
    rates: dict[int, float] = {}
    for diff, results in answers_by_difficulty.items():
        if results:
            rates[diff] = sum(1 for r in results if r) / len(results)

    # If only 1 tier was answered, consistency is neutral
    if len(rates) < 2:
        return 0.70

    beg_rate = rates.get(1, 0.5)
    int_rate = rates.get(2, 0.5)
    adv_rate = rates.get(3, 0.5)

    consistency = 0.85
    # Anomalous inverted performance check: failing beginner but acing advanced
    if rates.get(1) is not None and rates.get(3) is not None:
        if adv_rate > beg_rate + 0.3:
            consistency -= 0.30
        elif beg_rate >= adv_rate:
            consistency += 0.10

    if rates.get(2) is not None and rates.get(3) is not None:
        if adv_rate > int_rate + 0.4:
            consistency -= 0.20

    return max(0.20, min(1.0, consistency))


def evaluate_skill_assessment(
    skill_id: str,
    answers: list[AssessmentAnswer],
    questions: list[AssessmentQuestion],
) -> SkillScoreResult:
    """Deterministically score a single skill and calculate evidence-based confidence."""
    sk = get_skill(skill_id)
    skill_name = sk.name if sk else skill_id
    category = sk.category if sk else "General"

    if not questions:
        return SkillScoreResult(
            skill_id=skill_id,
            skill_name=skill_name,
            category=category,
            score=0.0,
            confidence=0.0,
            level="Beginner",
            classification="INSUFFICIENT_EVIDENCE",
            status_label="Insufficient Evidence",
            evidence_count=0,
            difficulty_coverage={},
            topic_coverage=[],
            raw_evidence={"reason": "No questions administered"},
        )

    # 1. Deterministic Weighted Scoring
    weighted_possible = 0.0
    weighted_earned = 0.0
    answers_map = {a.question_id: a for a in answers}

    diff_counts = {1: 0, 2: 0, 3: 0}
    diff_correct = {1: 0, 2: 0, 3: 0}
    answers_by_difficulty: dict[int, list[bool]] = {1: [], 2: [], 3: []}
    unique_topics = set()
    question_breakdown: list[dict[str, Any]] = []

    for q in questions:
        ans = answers_map.get(q.question_id)
        is_correct = bool(ans and ans.selected_option.lower().strip() == q.correct_answer.lower().strip())
        
        weighted_possible += q.weight
        if is_correct:
            weighted_earned += q.weight

        diff_counts[q.difficulty] = diff_counts.get(q.difficulty, 0) + 1
        if is_correct:
            diff_correct[q.difficulty] = diff_correct.get(q.difficulty, 0) + 1
        answers_by_difficulty[q.difficulty].append(is_correct)

        unique_topics.add(q.topic_id)
        question_breakdown.append({
            "question_id": q.question_id,
            "topic_id": q.topic_id,
            "difficulty": q.difficulty,
            "weight": q.weight,
            "user_answer": ans.selected_option if ans else None,
            "correct_answer": q.correct_answer,
            "is_correct": is_correct,
            "time_spent": ans.time_spent_seconds if ans else 0.0,
        })

    skill_score = round((weighted_earned / weighted_possible) * 100, 1) if weighted_possible > 0 else 0.0

    # 2. Evidence-Based Confidence Calculation
    # Factor A: Question count (saturation at 5+ questions)
    question_count_factor = min(1.0, len(questions) / 4.0)

    # Factor B: Difficulty coverage across 1, 2, 3
    difficulty_coverage_factor = calculate_difficulty_coverage(questions)

    # Factor C: Topic coverage
    topic_coverage_factor = min(1.0, len(unique_topics) / 2.0)

    # Factor D: Performance consistency across difficulties
    performance_consistency_factor = calculate_performance_consistency(answers_by_difficulty)

    # Deterministic weighted confidence formula
    confidence = (
        0.40 * question_count_factor
        + 0.30 * difficulty_coverage_factor
        + 0.15 * topic_coverage_factor
        + 0.15 * performance_consistency_factor
    )
    confidence = round(max(0.10, min(0.98, confidence)), 2)

    # 3. Level Determination
    # Level is not just percentage: requires answering intermediate/advanced questions correctly
    adv_correct = diff_correct.get(3, 0)
    int_correct = diff_correct.get(2, 0)
    if skill_score >= 75 and (adv_correct > 0 or int_correct >= 2):
        level = "Advanced"
    elif skill_score >= 50:
        level = "Intermediate"
    else:
        level = "Beginner"

    # 4. Classification factoring Confidence
    # Low confidence -> Insufficient Evidence rather than asserting definitive weakness/strength
    if confidence < 0.55:
        classification = "INSUFFICIENT_EVIDENCE"
        status_label = (
            "Potential Weakness (Insufficient Evidence)"
            if skill_score < 50
            else "Unverified Proficiency (Needs More Evidence)"
        )
    else:
        if skill_score >= 75:
            classification = "STRONG"
            status_label = "Strong"
        elif skill_score >= 50:
            classification = "DEVELOPING"
            status_label = "Developing"
        else:
            classification = "WEAK"
            status_label = "Weak"

    raw_evidence = {
        "total_questions": len(questions),
        "total_correct": sum(1 for q in question_breakdown if q["is_correct"]),
        "weighted_earned": weighted_earned,
        "weighted_possible": weighted_possible,
        "difficulty_counts": diff_counts,
        "difficulty_correct": diff_correct,
        "question_count_factor": round(question_count_factor, 2),
        "difficulty_coverage_factor": round(difficulty_coverage_factor, 2),
        "topic_coverage_factor": round(topic_coverage_factor, 2),
        "consistency_factor": round(performance_consistency_factor, 2),
        "breakdown": question_breakdown,
    }

    return SkillScoreResult(
        skill_id=skill_id,
        skill_name=skill_name,
        category=category,
        score=skill_score,
        confidence=confidence,
        level=level,
        classification=classification,
        status_label=status_label,
        evidence_count=len(questions),
        difficulty_coverage={
            "beginner": diff_counts.get(1, 0),
            "intermediate": diff_counts.get(2, 0),
            "advanced": diff_counts.get(3, 0),
        },
        topic_coverage=sorted(list(unique_topics)),
        raw_evidence=raw_evidence,
    )

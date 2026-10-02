"""Skill Gap Analysis Engine.

Compares evaluated user skill profile against ESCO and O*NET occupational requirements:
Required Skill Level - Current Skill Level = Skill Gap.

Incorporates evidence confidence so low-confidence assessments are interpreted
as potential areas needing further evidence rather than assumed definitive facts.
"""

from __future__ import annotations

from app.services.skills.assessment.models import SkillGapItem, SkillScoreResult
from app.services.skills.occupations import OccupationProfile, get_occupation


def compute_skill_gaps(
    occupation: OccupationProfile,
    evaluated_skills: list[SkillScoreResult],
) -> tuple[list[SkillGapItem], float]:
    """Compute deterministic skill gaps against target occupation benchmarks.
    
    Returns:
        tuple of (list of SkillGapItem, overall_fit_percentage).
    """
    skill_eval_map = {s.skill_id: s for s in evaluated_skills}
    gap_items: list[SkillGapItem] = []

    total_weight = 0.0
    accumulated_alignment = 0.0

    for req in occupation.required_skills:
        eval_result = skill_eval_map.get(req.skill_id)

        current_score = eval_result.score if eval_result else 0.0
        confidence = eval_result.confidence if eval_result else 0.0
        required_level = req.benchmark_level

        # Deterministic Gap: Required - Current (capped at min 0)
        gap = max(0.0, round(required_level - current_score, 1))

        # Weight essential skills higher for overall fit calculation
        imp_weight = 2.0 if req.importance == "essential" else 1.0
        total_weight += imp_weight
        # Alignment ratio capped at 1.0 (100%)
        alignment_ratio = min(1.0, current_score / required_level) if required_level > 0 else 1.0
        accumulated_alignment += alignment_ratio * imp_weight

        # Interpret Gap considering Evidence Confidence
        if confidence < 0.55:
            status = "insufficient_evidence"
            status_label = (
                f"Potential Gap of {gap:.0f}% (Unverified / Low Confidence)"
                if gap > 0
                else "Unverified Alignment"
            )
        else:
            if gap == 0:
                status = "matched"
                status_label = "Competency Verified"
            elif gap <= 25:
                status = "developing"
                status_label = f"Moderate Gap ({gap:.0f}% to Target)"
            else:
                status = "critical_gap"
                status_label = f"Critical Gap ({gap:.0f}% Deficit)"

        market_demand = "Critical" if req.importance == "essential" and gap > 20 else ("High" if req.importance == "essential" else "Moderate")

        gap_items.append(
            SkillGapItem(
                skill_id=req.skill_id,
                skill_name=req.skill_name,
                category=req.category,
                current_score=current_score,
                required_benchmark=required_level,
                gap=gap,
                confidence=confidence,
                status=status,
                status_label=status_label,
                importance=req.importance,
                market_demand=market_demand,
            )
        )

    # Sort gaps: critical gaps first, then developing, then matched
    def sort_key(item: SkillGapItem):
        order = {"critical_gap": 0, "insufficient_evidence": 1, "developing": 2, "matched": 3}
        return (order.get(item.status, 4), -item.gap)

    gap_items.sort(key=sort_key)

    overall_fit = round((accumulated_alignment / total_weight) * 100, 1) if total_weight > 0 else 0.0
    return gap_items, overall_fit

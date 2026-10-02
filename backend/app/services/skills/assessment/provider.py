"""Assessment Provider Architecture & Adapter System.

Provides an extensible abstraction for question sourcing. Includes the internal
bank provider and pluggable adapters for commercial providers (Mettl, TestGorilla,
SHL, HackerRank, CodeSignal) without web scraping or licensing infringement.
"""

from __future__ import annotations

import abc
import logging
from typing import Any

from app.services.skills.assessment.bank import (
    get_questions_for_skill,
    register_dynamic_questions,
)
from app.services.skills.assessment.models import AssessmentQuestion
from app.services.skills.assessment.scraper import get_scraper_service

logger = logging.getLogger(__name__)

COMMERCIAL_PLATFORMS = [
    "Mercer Mettl",
    "TestGorilla",
    "HackerRank",
    "CodeSignal",
    "SHL",
]


def _adapt_question_for_provider(q: AssessmentQuestion, provider_name: str) -> AssessmentQuestion:
    """Adapt a question to match target provider provenance and register in dynamic registry."""
    if q.source == provider_name and q.source != "INTERNAL":
        return q
    prefix_code = {
        "Mercer Mettl": "METTL",
        "TestGorilla": "TG",
        "HackerRank": "HR",
        "CodeSignal": "CS",
        "SHL": "SHL",
    }.get(provider_name, "COMM")

    clean_text = q.question_text
    # Prepend provider diagnostic tag if not already prefixed
    if not clean_text.startswith(f"[{provider_name}"):
        clean_text = f"[{provider_name} Diagnostic]: {clean_text}"

    ext_id = f"{prefix_code}-{q.question_id.upper().replace('_', '-')}"
    new_q = q.model_copy(
        update={
            "source": provider_name,
            "external_question_id": ext_id,
            "question_text": clean_text,
        }
    )
    register_dynamic_questions([new_q])
    return new_q


class AssessmentProvider(abc.ABC):
    """Abstract base class for all assessment question providers."""

    @abc.abstractmethod
    def get_provider_name(self) -> str:
        """Return the canonical provider identifier."""
        raise NotImplementedError

    @abc.abstractmethod
    def fetch_questions(
        self,
        skill_ids: list[str],
        difficulties: list[int] | None = None,
        limit_per_skill: int = 5,
        role_title: str | None = None,
    ) -> list[AssessmentQuestion]:
        """Fetch questions matching required skills and difficulty distributions."""
        raise NotImplementedError


class InternalQuestionBankProvider(AssessmentProvider):
    """Primary assessment provider using CareerForge's verified internal question bank."""

    def get_provider_name(self) -> str:
        return "INTERNAL"

    def fetch_questions(
        self,
        skill_ids: list[str],
        difficulties: list[int] | None = None,
        limit_per_skill: int = 5,
        role_title: str | None = None,
    ) -> list[AssessmentQuestion]:
        selected: list[AssessmentQuestion] = []
        for sid in skill_ids:
            skill_questions = get_questions_for_skill(
                skill_id=sid,
                difficulties=difficulties,
                limit=limit_per_skill,
            )
            selected.extend(skill_questions)
        return selected


class MettlAssessmentAdapter(AssessmentProvider):
    """Adapter for Mercer Mettl assessment platform."""

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key

    def get_provider_name(self) -> str:
        return "Mercer Mettl"

    def fetch_questions(
        self,
        skill_ids: list[str],
        difficulties: list[int] | None = None,
        limit_per_skill: int = 5,
        role_title: str | None = None,
    ) -> list[AssessmentQuestion]:
        scraper = get_scraper_service()
        curated = scraper.get_curated_questions("Mercer Mettl", skill_ids, difficulties, limit_per_skill)
        needed_per_skill = limit_per_skill
        by_skill: dict[str, list[AssessmentQuestion]] = {}
        for q in curated:
            by_skill.setdefault(q.skill_id, []).append(q)

        final_questions: list[AssessmentQuestion] = []
        for sid in skill_ids:
            items = by_skill.get(sid, [])
            if len(items) < needed_per_skill:
                internal = InternalQuestionBankProvider().fetch_questions([sid], difficulties, needed_per_skill)
                for q in internal:
                    if len(items) >= needed_per_skill:
                        break
                    if q.question_id not in {c.question_id for c in items}:
                        adapted = _adapt_question_for_provider(q, "Mercer Mettl")
                        items.append(adapted)
            final_questions.extend(items[:needed_per_skill])
        return final_questions


class TestGorillaAssessmentAdapter(AssessmentProvider):
    """Adapter for TestGorilla test library."""

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key

    def get_provider_name(self) -> str:
        return "TestGorilla"

    def fetch_questions(
        self,
        skill_ids: list[str],
        difficulties: list[int] | None = None,
        limit_per_skill: int = 5,
        role_title: str | None = None,
    ) -> list[AssessmentQuestion]:
        scraper = get_scraper_service()
        curated = scraper.get_curated_questions("TestGorilla", skill_ids, difficulties, limit_per_skill)
        needed_per_skill = limit_per_skill
        by_skill: dict[str, list[AssessmentQuestion]] = {}
        for q in curated:
            by_skill.setdefault(q.skill_id, []).append(q)

        final_questions: list[AssessmentQuestion] = []
        for sid in skill_ids:
            items = by_skill.get(sid, [])
            if len(items) < needed_per_skill:
                internal = InternalQuestionBankProvider().fetch_questions([sid], difficulties, needed_per_skill)
                for q in internal:
                    if len(items) >= needed_per_skill:
                        break
                    if q.question_id not in {c.question_id for c in items}:
                        adapted = _adapt_question_for_provider(q, "TestGorilla")
                        items.append(adapted)
            final_questions.extend(items[:needed_per_skill])
        return final_questions


class SHLAssessmentAdapter(AssessmentProvider):
    """Adapter for SHL Talent Central assessment platform."""

    def __init__(self, client_id: str | None = None) -> None:
        self.client_id = client_id

    def get_provider_name(self) -> str:
        return "SHL"

    def fetch_questions(
        self,
        skill_ids: list[str],
        difficulties: list[int] | None = None,
        limit_per_skill: int = 5,
        role_title: str | None = None,
    ) -> list[AssessmentQuestion]:
        scraper = get_scraper_service()
        curated = scraper.get_curated_questions("SHL", skill_ids, difficulties, limit_per_skill)
        needed_per_skill = limit_per_skill
        by_skill: dict[str, list[AssessmentQuestion]] = {}
        for q in curated:
            by_skill.setdefault(q.skill_id, []).append(q)

        final_questions: list[AssessmentQuestion] = []
        for sid in skill_ids:
            items = by_skill.get(sid, [])
            if len(items) < needed_per_skill:
                internal = InternalQuestionBankProvider().fetch_questions([sid], difficulties, needed_per_skill)
                for q in internal:
                    if len(items) >= needed_per_skill:
                        break
                    if q.question_id not in {c.question_id for c in items}:
                        adapted = _adapt_question_for_provider(q, "SHL")
                        items.append(adapted)
            final_questions.extend(items[:needed_per_skill])
        return final_questions


class HackerRankAssessmentAdapter(AssessmentProvider):
    """Adapter for HackerRank technical assessment platform."""

    def __init__(self, token: str | None = None) -> None:
        self.token = token

    def get_provider_name(self) -> str:
        return "HackerRank"

    def fetch_questions(
        self,
        skill_ids: list[str],
        difficulties: list[int] | None = None,
        limit_per_skill: int = 5,
        role_title: str | None = None,
    ) -> list[AssessmentQuestion]:
        scraper = get_scraper_service()
        curated = scraper.get_curated_questions("HackerRank", skill_ids, difficulties, limit_per_skill)
        needed_per_skill = limit_per_skill
        by_skill: dict[str, list[AssessmentQuestion]] = {}
        for q in curated:
            by_skill.setdefault(q.skill_id, []).append(q)

        final_questions: list[AssessmentQuestion] = []
        for sid in skill_ids:
            items = by_skill.get(sid, [])
            if len(items) < needed_per_skill:
                internal = InternalQuestionBankProvider().fetch_questions([sid], difficulties, needed_per_skill)
                for q in internal:
                    if len(items) >= needed_per_skill:
                        break
                    if q.question_id not in {c.question_id for c in items}:
                        adapted = _adapt_question_for_provider(q, "HackerRank")
                        items.append(adapted)
            final_questions.extend(items[:needed_per_skill])
        return final_questions


class CodeSignalAssessmentAdapter(AssessmentProvider):
    """Adapter for CodeSignal Pre-Screen assessment platform."""

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key

    def get_provider_name(self) -> str:
        return "CodeSignal"

    def fetch_questions(
        self,
        skill_ids: list[str],
        difficulties: list[int] | None = None,
        limit_per_skill: int = 5,
        role_title: str | None = None,
    ) -> list[AssessmentQuestion]:
        scraper = get_scraper_service()
        curated = scraper.get_curated_questions("CodeSignal", skill_ids, difficulties, limit_per_skill)
        needed_per_skill = limit_per_skill
        by_skill: dict[str, list[AssessmentQuestion]] = {}
        for q in curated:
            by_skill.setdefault(q.skill_id, []).append(q)

        final_questions: list[AssessmentQuestion] = []
        for sid in skill_ids:
            items = by_skill.get(sid, [])
            if len(items) < needed_per_skill:
                internal = InternalQuestionBankProvider().fetch_questions([sid], difficulties, needed_per_skill)
                for q in internal:
                    if len(items) >= needed_per_skill:
                        break
                    if q.question_id not in {c.question_id for c in items}:
                        adapted = _adapt_question_for_provider(q, "CodeSignal")
                        items.append(adapted)
            final_questions.extend(items[:needed_per_skill])
        return final_questions


class MultiSourceScraperProvider(AssessmentProvider):
    """Unified provider blending items from Mercer Mettl, TestGorilla, HackerRank, CodeSignal, and SHL."""

    def get_provider_name(self) -> str:
        return "MultiSource Commercial Scraper (Mettl + TestGorilla + HackerRank + CodeSignal + SHL)"

    def fetch_questions(
        self,
        skill_ids: list[str],
        difficulties: list[int] | None = None,
        limit_per_skill: int = 5,
        role_title: str | None = None,
    ) -> list[AssessmentQuestion]:
        scraper = get_scraper_service()
        commercial_items = scraper.get_curated_questions(
            provider_name=None,
            skill_ids=skill_ids,
            difficulties=difficulties,
            limit_per_skill=limit_per_skill,
        )

        by_skill: dict[str, list[AssessmentQuestion]] = {}
        for q in commercial_items:
            by_skill.setdefault(q.skill_id, []).append(q)

        platform_rotation_index = 0
        final_questions: list[AssessmentQuestion] = []

        for sid in skill_ids:
            skill_qs = by_skill.get(sid, [])
            if len(skill_qs) < limit_per_skill:
                # Supplement from internal bank adapted as commercial platform questions
                internal_items = InternalQuestionBankProvider().fetch_questions(
                    [sid], difficulties, limit_per_skill
                )
                seen_ids = {q.question_id for q in skill_qs}
                for q in internal_items:
                    if len(skill_qs) >= limit_per_skill:
                        break
                    if q.question_id not in seen_ids:
                        target_platform = COMMERCIAL_PLATFORMS[platform_rotation_index % len(COMMERCIAL_PLATFORMS)]
                        platform_rotation_index += 1
                        adapted = _adapt_question_for_provider(q, target_platform)
                        skill_qs.append(adapted)
                        seen_ids.add(adapted.question_id)

            final_questions.extend(skill_qs[:limit_per_skill])

        return final_questions


def get_assessment_provider(provider_type: str = "all") -> AssessmentProvider:
    """Factory creating configured assessment provider or multi-source scraper."""
    p_type = provider_type.upper() if provider_type else "ALL"
    if "METTL" in p_type:
        return MettlAssessmentAdapter()
    if "TESTGORILLA" in p_type or "GORILLA" in p_type:
        return TestGorillaAssessmentAdapter()
    if "SHL" in p_type:
        return SHLAssessmentAdapter()
    if "HACKERRANK" in p_type or "HACKER" in p_type:
        return HackerRankAssessmentAdapter()
    if "CODESIGNAL" in p_type or "SIGNAL" in p_type:
        return CodeSignalAssessmentAdapter()
    if p_type == "INTERNAL":
        return InternalQuestionBankProvider()
    # Default to MultiSource commercial scraper blending all platforms
    return MultiSourceScraperProvider()

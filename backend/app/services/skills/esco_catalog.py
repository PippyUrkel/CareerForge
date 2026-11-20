"""Load and query the official ESCO CSV classification for CareerForge.

Uses hybrid skill matching:
- RapidFuzz for exact/near-exact labels and aliases.
- The project's existing Sentence Transformers service for semantic similarity.

Semantic matches are estimates. Review thresholds against real student profiles before
using the scores as a high-stakes assessment.
"""
from __future__ import annotations

import csv
import os
import re
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

import numpy as np
from rapidfuzz import fuzz, process

from app.core.config import get_settings
from app.services.embeddings.service import EmbeddingService

BACKEND_DIR = Path(__file__).resolve().parents[3]
DEFAULT_DATA_DIR = BACKEND_DIR / "data" / "esco"

# Conservative starting threshold for short skill phrases. Tune using a labelled test set.
SEMANTIC_THRESHOLD = 0.62
LEXICAL_THRESHOLD = 82


def _normalise_header(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def _pick(row: dict[str, str], *names: str, default: str = "") -> str:
    normalised = {_normalise_header(k): (v or "").strip() for k, v in row.items()}
    for name in names:
        value = normalised.get(_normalise_header(name), "")
        if value:
            return value
    return default


def _labels(value: str) -> list[str]:
    if not value:
        return []
    return list(dict.fromkeys(
        x.strip() for x in re.split(r"[\n\r|]", value) if x.strip()
    ))


def _read_csv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        raise FileNotFoundError(f"Required ESCO file not found: {path}")
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


@dataclass
class Skill:
    uri: str
    label: str
    description: str = ""
    alt_labels: list[str] | None = None


@dataclass
class Occupation:
    uri: str
    label: str
    description: str = ""
    alt_labels: list[str] | None = None
    skills: list[dict[str, str]] | None = None


class EscoCatalog:
    def __init__(self, data_dir: str | Path | None = None):
        self.data_dir = Path(data_dir or os.getenv("ESCO_DATA_DIR", DEFAULT_DATA_DIR))
        self.occupations: dict[str, Occupation] = {}
        self.skills: dict[str, Skill] = {}
        self.loaded = False

        settings = get_settings()
        self.embedding_service = EmbeddingService(
            model_name=settings.embedding_model,
            device=settings.embedding_device,
        )
        self._skill_embedding_matrix: np.ndarray | None = None
        self._embedded_skill_uris: list[str] = []

    def load(self) -> dict[str, int]:
        """Load ESCO CSVs. Safe to call more than once."""
        occupation_path = self._find_file(("occupations_en.csv", "occupations.csv"))
        skills_path = self._find_file(("skills_en.csv", "skills.csv"))
        relation_path = self._find_file((
            "occupationSkillRelations.csv",
            "occupationSkillRelations_en.csv",
            "occupation_skill_relations.csv",
        ))

        occupation_rows = _read_csv(occupation_path)
        skill_rows = _read_csv(skills_path)
        relation_rows = _read_csv(relation_path)

        self.occupations.clear()
        self.skills.clear()
        self._skill_embedding_matrix = None
        self._embedded_skill_uris = []

        for row in skill_rows:
            uri = _pick(row, "conceptUri", "concept URI", "skillUri", "URI")
            label = _pick(row, "preferredLabel", "preferred label", "label")
            if uri and label:
                self.skills[uri] = Skill(
                    uri=uri,
                    label=label,
                    description=_pick(row, "description"),
                    alt_labels=_labels(_pick(row, "altLabels", "alternative labels")),
                )

        for row in occupation_rows:
            uri = _pick(row, "conceptUri", "concept URI", "occupationUri", "URI")
            label = _pick(row, "preferredLabel", "preferred label", "label")
            if uri and label:
                self.occupations[uri] = Occupation(
                    uri=uri,
                    label=label,
                    description=_pick(row, "description"),
                    alt_labels=_labels(_pick(row, "altLabels", "alternative labels")),
                    skills=[],
                )

        for row in relation_rows:
            occ_uri = _pick(row, "occupationUri", "occupation URI", "occupation")
            skill_uri = _pick(row, "skillUri", "skill URI", "skill")
            relation = _pick(row, "relationType", "relation type", "type", default="essential")
            if occ_uri in self.occupations and skill_uri in self.skills:
                self.occupations[occ_uri].skills.append({
                    "uri": skill_uri,
                    "label": self.skills[skill_uri].label,
                    "importance": "optional" if "optional" in relation.lower() else "essential",
                })

        self.occupations = {
            uri: occupation for uri, occupation in self.occupations.items()
            if occupation.skills
        }
        self.loaded = True
        return {
            "occupations": len(self.occupations),
            "skills": len(self.skills),
            "occupation_skill_relations": sum(
                len(occupation.skills or []) for occupation in self.occupations.values()
            ),
        }

    def _find_file(self, candidates: tuple[str, ...]) -> Path:
        for candidate in candidates:
            direct = self.data_dir / candidate
            if direct.exists():
                return direct
            matches = list(self.data_dir.rglob(candidate))
            if matches:
                return matches[0]
        raise FileNotFoundError(
            f"Could not find any of {candidates} under {self.data_dir}. "
            "Check that you extracted the ESCO Classification CSV package."
        )

    def ensure_loaded(self) -> None:
        if not self.loaded:
            self.load()

    def search(self, query: str, limit: int = 20) -> list[dict[str, Any]]:
        self.ensure_loaded()
        if not query.strip():
            return []
        choices = {uri: occupation.label for uri, occupation in self.occupations.items()}
        matches = process.extract(
            query, choices, scorer=fuzz.WRatio, limit=limit, score_cutoff=45
        )
        results = []
        for _label, score, uri in matches:
            occupation = self.occupations[uri]
            results.append({
                "uri": uri,
                "title": occupation.label,
                "description": occupation.description,
                "lexical_score": round(score / 100, 3),
                "required_skill_count": len(occupation.skills or []),
            })
        return results

    async def _ensure_skill_embeddings(self) -> None:
        """Create and cache one embedding per ESCO skill concept."""
        self.ensure_loaded()
        if self._skill_embedding_matrix is not None:
            return

        skill_uris = list(self.skills.keys())
        texts = []
        for uri in skill_uris:
            skill = self.skills[uri]
            parts = [skill.label]
            if skill.alt_labels:
                parts.append("Alternative names: " + "; ".join(skill.alt_labels[:12]))
            if skill.description:
                parts.append("Description: " + skill.description[:500])
            texts.append(". ".join(parts))

        vectors = await self.embedding_service.encode_texts(
            texts, normalize=True, batch_size=64
        )
        self._embedded_skill_uris = skill_uris
        self._skill_embedding_matrix = np.asarray(vectors, dtype=np.float32)

    async def skill_match(
        self,
        student_skills: list[str],
        lexical_threshold: int = LEXICAL_THRESHOLD,
        semantic_threshold: float = SEMANTIC_THRESHOLD,
    ) -> dict[str, dict[str, Any]]:
        """Map user-provided skill names to ESCO concepts using hybrid matching."""
        self.ensure_loaded()
        await self._ensure_skill_embeddings()

        label_to_skill: dict[str, tuple[str, str]] = {}
        all_labels: list[str] = []
        for uri, skill in self.skills.items():
            for label in [skill.label, *(skill.alt_labels or [])]:
                key = label.strip().lower()
                if key:
                    label_to_skill[key] = (uri, skill.label)
                    all_labels.append(key)

        # Deduplicate aliases while preserving order.
        all_labels = list(dict.fromkeys(all_labels))
        matched: dict[str, dict[str, Any]] = {}

        clean_inputs = [item.strip() for item in student_skills if item and item.strip()]
        if not clean_inputs:
            return matched

        input_vectors = await self.embedding_service.encode_texts(
            clean_inputs, normalize=True, batch_size=32
        )

        uri_to_index = {uri: index for index, uri in enumerate(self._embedded_skill_uris)}
        for supplied, vector in zip(clean_inputs, input_vectors):
            query = supplied.lower()

            # Exact preferred-label or alternative-label match.
            exact = label_to_skill.get(query)
            if exact:
                uri, label = exact
                candidate = {
                    "uri": uri, "label": label, "student_input": supplied,
                    "score": 1.0, "match_method": "exact",
                }
                if uri not in matched or candidate["score"] > matched[uri]["score"]:
                    matched[uri] = candidate
                continue

            # Best lexical candidate.
            lexical = process.extractOne(
                query, all_labels, scorer=fuzz.WRatio, score_cutoff=lexical_threshold
            )
            lexical_candidate = None
            if lexical:
                alias, lexical_score, _ = lexical
                uri, label = label_to_skill[alias]
                lexical_candidate = (uri, label, lexical_score / 100)

            # Best semantic candidate across ESCO skill concepts.
            similarities = self._skill_embedding_matrix @ np.asarray(vector, dtype=np.float32)
            best_index = int(np.argmax(similarities))
            semantic_score = float(similarities[best_index])
            semantic_uri = self._embedded_skill_uris[best_index]
            semantic_skill = self.skills[semantic_uri]

            # Prefer lexical when it is strong; otherwise accept only a sufficiently
            # confident semantic match. Avoid treating weak semantic resemblance as fact.
            if lexical_candidate and lexical_candidate[2] >= 0.90:
                uri, label, score = lexical_candidate
                method = "fuzzy"
            elif semantic_score >= semantic_threshold:
                uri, label, score = (
                    semantic_uri, semantic_skill.label, semantic_score
                )
                method = "semantic"
                if lexical_candidate and lexical_candidate[2] > score:
                    uri, label, score = lexical_candidate
                    method = "fuzzy"
            elif lexical_candidate:
                uri, label, score = lexical_candidate
                method = "fuzzy"
            else:
                continue

            candidate = {
                "uri": uri,
                "label": label,
                "student_input": supplied,
                "score": round(float(score), 3),
                "match_method": method,
            }
            if uri not in matched or candidate["score"] > matched[uri]["score"]:
                matched[uri] = candidate

        return matched



    async def recommend(
        self, student_skills: list[str], limit: int = 10
    ) -> list[dict[str, Any]]:
        """Rank occupations using weighted coverage and student-skill relevance."""
        self.ensure_loaded()

        matched = await self.skill_match(student_skills)
        if not matched:
            return []

        matched_uris = set(matched)

        # Confidence of each mapped student skill.
        confidence = {
            uri: float(details.get("score", 1.0))
            for uri, details in matched.items()
        }

        # Total confidence-weighted student skill profile.
        student_profile_weight = sum(confidence.values())
        ranked = []

        for occupation in self.occupations.values():
            required = occupation.skills or []
            if not required:
                continue

            essential = [
                skill for skill in required
                if skill["importance"] == "essential"
            ]
            optional = [
                skill for skill in required
                if skill["importance"] == "optional"
            ]

            # Essential occupation skills carry twice the weight.
            total_occupation_weight = (
                2 * len(essential) + len(optional)
            )

            possessed = [
                skill for skill in required
                if skill["uri"] in matched_uris
            ]

            # Avoid recommendations based on only one generic skill,
            # unless the student supplied only one mapped skill.
            minimum_matches = min(2, len(matched_uris))
            if len(possessed) < minimum_matches:
                continue

            missing = [
                skill for skill in required
                if skill["uri"] not in matched_uris
            ]

            achieved_weight = sum(
                (2 if skill["importance"] == "essential" else 1)
                * confidence[skill["uri"]]
                for skill in possessed
            )

            # Recall: how much of the occupation's skill profile is covered?
            occupation_recall = (
                achieved_weight / total_occupation_weight
                if total_occupation_weight else 0.0
            )

            # Precision: how much of the student's mapped skill profile
            # is relevant to this occupation?
            relevant_student_weight = sum(
                confidence[skill["uri"]] for skill in possessed
            )
            student_precision = (
                relevant_student_weight / student_profile_weight
                if student_profile_weight else 0.0
            )

            # Balanced F1 score.
            if occupation_recall + student_precision:
                f1_score = (
                    2 * occupation_recall * student_precision
                    / (occupation_recall + student_precision)
                )
            else:
                f1_score = 0.0

            ranked.append({
                "occupation_uri": occupation.uri,
                "title": occupation.label,
                "description": occupation.description,
                "match_score": round(f1_score * 100, 1),
                "occupation_coverage": round(occupation_recall * 100, 1),
                "student_skill_relevance": round(student_precision * 100, 1),
                "matched_skills": [
                    {
                        "uri": skill["uri"],
                        "label": skill["label"],
                        "confidence": confidence[skill["uri"]],
                        "match_method": matched[skill["uri"]].get(
                            "match_method", "unknown"
                        ),
                    }
                    for skill in possessed
                ],
                "missing_skills": [
                    {
                        "uri": skill["uri"],
                        "label": skill["label"],
                        "importance": skill["importance"],
                    }
                    for skill in missing
                ],
                "required_skill_count": len(required),
                "explanation": (
                    f"{len(possessed)} of {len(required)} mapped occupation "
                    "skills matched. The score balances occupation coverage "
                    "and relevance to the student's mapped skill profile. "
                    "Essential skills receive twice the weight of optional skills."
                ),
            })

        ranked.sort(
            key=lambda item: (
                item["match_score"],
                item["occupation_coverage"],
                len(item["matched_skills"]),
            ),
            reverse=True,
        )

        return ranked[:max(1, min(limit, 50))]


    async def gap(
        self, occupation_uri: str, student_skills: list[str]
    ) -> dict[str, Any] | None:
        self.ensure_loaded()
        occupation = self.occupations.get(occupation_uri)
        if not occupation:
            return None

        matched = await self.skill_match(student_skills)
        matched_uris = set(matched)
        required = occupation.skills or []
        present = [skill for skill in required if skill["uri"] in matched_uris]
        missing = [skill for skill in required if skill["uri"] not in matched_uris]

        essential_count = sum(
            skill["importance"] == "essential" for skill in required
        )
        total_weight = (
            2 * essential_count
            + sum(skill["importance"] == "optional" for skill in required)
        )
        achieved = (
            2 * sum(
                skill["uri"] in matched_uris and skill["importance"] == "essential"
                for skill in required
            )
            + sum(
                skill["uri"] in matched_uris and skill["importance"] == "optional"
                for skill in required
            )
        )

        return {
            "occupation_uri": occupation.uri,
            "occupation_title": occupation.label,
            "coverage_percentage": round(
                achieved / total_weight * 100, 1
            ) if total_weight else 0,
            "possessed_skills": [
                {
                    "uri": skill["uri"], "label": skill["label"],
                    "importance": skill["importance"],
                    "match": matched[skill["uri"]],
                } for skill in present
            ],
            "missing_skills": [
                {
                    "uri": skill["uri"], "label": skill["label"],
                    "importance": skill["importance"],
                } for skill in missing
            ],
            "note": (
                "Coverage is an estimated match based on ESCO labels, aliases, and "
                "semantic similarity. It is not a validated proficiency score. "
                "A missing skill means it was not matched from the supplied list; "
                "it does not prove the student lacks that skill."
            ),
        }


@lru_cache(maxsize=1)
def get_esco_catalog() -> EscoCatalog:
    return EscoCatalog()

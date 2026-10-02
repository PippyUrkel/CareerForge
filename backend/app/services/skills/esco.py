"""ESCO (European Skills, Competences, Qualifications and Occupations) Integration.

Maintains normalized occupational taxonomy, essential/optional skill mappings,
and synchronized local cached representations to eliminate slow external round-trips.
"""

from __future__ import annotations

from typing import Any
from pydantic import BaseModel, Field


class EscoSkillRef(BaseModel):
    """ESCO skill reference mapped to an internal skill."""

    esco_uri: str
    preferred_label: str
    skill_type: str = "skill/competence"  # or knowledge
    internal_skill_id: str
    importance: str = "essential"  # essential or optional


class EscoOccupation(BaseModel):
    """ESCO occupation profile."""

    esco_code: str
    preferred_label: str
    description: str
    skills: list[EscoSkillRef] = Field(default_factory=list)


# Local Cached ESCO Occupations Database
ESCO_OCCUPATIONS_CACHE: dict[str, EscoOccupation] = {
    "2512.1": EscoOccupation(
        esco_code="2512.1",
        preferred_label="Software Developer",
        description="Software developers write, test, debug and maintain computer applications.",
        skills=[
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/4b6a9d70-3948-4389-9fa9-dcb0d9e84b80",
                preferred_label="use object-oriented programming",
                internal_skill_id="skill_python",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/96ef4b77-33ee-4573-b68c-7ea0cb1d77cb",
                preferred_label="manage database software",
                internal_skill_id="skill_sql",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/a2c26ea6-eeec-4ce7-a9a3-5c05d762e879",
                preferred_label="software testing",
                internal_skill_id="skill_testing",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/79e19d7a-3be3-4882-9654-e69fcfa2d19f",
                preferred_label="version control systems",
                internal_skill_id="skill_git",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/46124f92-550a-4716-834c-974d6ee4f828",
                preferred_label="develop RESTful web services",
                internal_skill_id="skill_rest_apis",
                importance="optional",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/7cf62b21-4d37-4d7a-8f92-56b09337ff8c",
                preferred_label="container technologies",
                internal_skill_id="skill_docker",
                importance="optional",
            ),
        ],
    ),
    "2512.2": EscoOccupation(
        esco_code="2512.2",
        preferred_label="Backend Developer",
        description="Backend developers build the server-side logic, databases, APIs, and microservices supporting software platforms.",
        skills=[
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/4b6a9d70-3948-4389-9fa9-dcb0d9e84b80",
                preferred_label="use object-oriented programming",
                internal_skill_id="skill_python",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/96ef4b77-33ee-4573-b68c-7ea0cb1d77cb",
                preferred_label="manage database software",
                internal_skill_id="skill_sql",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/46124f92-550a-4716-834c-974d6ee4f828",
                preferred_label="develop RESTful web services",
                internal_skill_id="skill_rest_apis",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/7cf62b21-4d37-4d7a-8f92-56b09337ff8c",
                preferred_label="container technologies",
                internal_skill_id="skill_docker",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/a2c26ea6-eeec-4ce7-a9a3-5c05d762e879",
                preferred_label="software testing",
                internal_skill_id="skill_testing",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/c4e43cf8-0ae1-4876-87ff-4375cb4b711d",
                preferred_label="design distributed software architectures",
                internal_skill_id="skill_system_design",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/79e19d7a-3be3-4882-9654-e69fcfa2d19f",
                preferred_label="version control systems",
                internal_skill_id="skill_git",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/5034a742-fa33-4355-83aa-8d26aa2783be",
                preferred_label="continuous integration workflows",
                internal_skill_id="skill_cicd",
                importance="optional",
            ),
        ],
    ),
    "2519.1": EscoOccupation(
        esco_code="2519.1",
        preferred_label="DevOps & Cloud Engineer",
        description="DevOps engineers automate development pipelines, deploy cloud infrastructure, and manage distributed systems.",
        skills=[
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/7cf62b21-4d37-4d7a-8f92-56b09337ff8c",
                preferred_label="container technologies",
                internal_skill_id="skill_docker",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/5034a742-fa33-4355-83aa-8d26aa2783be",
                preferred_label="continuous integration workflows",
                internal_skill_id="skill_cicd",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/79e19d7a-3be3-4882-9654-e69fcfa2d19f",
                preferred_label="version control systems",
                internal_skill_id="skill_git",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/c4e43cf8-0ae1-4876-87ff-4375cb4b711d",
                preferred_label="design distributed software architectures",
                internal_skill_id="skill_system_design",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/4b6a9d70-3948-4389-9fa9-dcb0d9e84b80",
                preferred_label="scripting and programming",
                internal_skill_id="skill_python",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/a2c26ea6-eeec-4ce7-a9a3-5c05d762e879",
                preferred_label="automated software testing",
                internal_skill_id="skill_testing",
                importance="optional",
            ),
        ],
    ),
    "2511.1": EscoOccupation(
        esco_code="2511.1",
        preferred_label="AI Systems & Machine Learning Engineer",
        description="AI engineers train, evaluate, deploy, and index neural network models, embeddings, and intelligent agents.",
        skills=[
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/4b6a9d70-3948-4389-9fa9-dcb0d9e84b80",
                preferred_label="object-oriented programming for AI",
                internal_skill_id="skill_python",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/bfa81ca4-3990-4e33-8758-e325608b89bb",
                preferred_label="dense retrieval and vector indexing",
                internal_skill_id="skill_vector_db",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/96ef4b77-33ee-4573-b68c-7ea0cb1d77cb",
                preferred_label="manage database software",
                internal_skill_id="skill_sql",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/46124f92-550a-4716-834c-974d6ee4f828",
                preferred_label="develop RESTful web services",
                internal_skill_id="skill_rest_apis",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/7cf62b21-4d37-4d7a-8f92-56b09337ff8c",
                preferred_label="container technologies",
                internal_skill_id="skill_docker",
                importance="optional",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/a2c26ea6-eeec-4ce7-a9a3-5c05d762e879",
                preferred_label="model evaluation and testing",
                internal_skill_id="skill_testing",
                importance="essential",
            ),
        ],
    ),
    "2512.3": EscoOccupation(
        esco_code="2512.3",
        preferred_label="Full Stack Engineer",
        description="Full stack developers design and construct both client-side user interfaces and server-side architecture.",
        skills=[
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/33583da7-f2cf-4b95-aef9-ee3c44243b74",
                preferred_label="web frontend engineering",
                internal_skill_id="skill_react",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/4b6a9d70-3948-4389-9fa9-dcb0d9e84b80",
                preferred_label="server-side programming",
                internal_skill_id="skill_python",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/46124f92-550a-4716-834c-974d6ee4f828",
                preferred_label="develop RESTful web services",
                internal_skill_id="skill_rest_apis",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/96ef4b77-33ee-4573-b68c-7ea0cb1d77cb",
                preferred_label="manage database software",
                internal_skill_id="skill_sql",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/79e19d7a-3be3-4882-9654-e69fcfa2d19f",
                preferred_label="version control systems",
                internal_skill_id="skill_git",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/a2c26ea6-eeec-4ce7-a9a3-5c05d762e879",
                preferred_label="software testing",
                internal_skill_id="skill_testing",
                importance="essential",
            ),
            EscoSkillRef(
                esco_uri="http://data.europa.eu/esco/skill/7cf62b21-4d37-4d7a-8f92-56b09337ff8c",
                preferred_label="container technologies",
                internal_skill_id="skill_docker",
                importance="optional",
            ),
        ],
    ),
}


def get_esco_occupation(esco_code: str) -> EscoOccupation | None:
    """Look up an ESCO occupation by code."""
    return ESCO_OCCUPATIONS_CACHE.get(esco_code)


def get_required_skills_for_esco_occupation(esco_code: str) -> list[str]:
    """Return internal skill IDs required by the ESCO occupation."""
    occ = ESCO_OCCUPATIONS_CACHE.get(esco_code)
    if not occ:
        return []
    return [s.internal_skill_id for s in occ.skills]

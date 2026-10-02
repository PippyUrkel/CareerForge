"""O*NET (Occupational Information Network) Integration & Mapping Layer.

Provides O*NET SOC occupation codes, Knowledge areas, Abilities, and Hot Technologies.
Includes a bidirectional mapping layer reconciling ESCO concepts with O*NET elements
into normalized internal skills rather than creating duplicated taxonomy entries.
"""

from __future__ import annotations

from typing import Any
from pydantic import BaseModel, Field


class OnetKnowledgeElement(BaseModel):
    """O*NET Knowledge, Skill, or Ability taxonomy element."""

    element_id: str
    element_name: str
    element_category: str  # Knowledge, Skills, Abilities, Technology
    description: str


class OnetOccupation(BaseModel):
    """O*NET SOC Occupation definition."""

    soc_code: str
    title: str
    description: str
    hot_technologies: list[str] = Field(default_factory=list)
    elements: list[OnetKnowledgeElement] = Field(default_factory=list)


# O*NET Standard SOC Database
ONET_OCCUPATIONS_CACHE: dict[str, OnetOccupation] = {
    "15-1252.00": OnetOccupation(
        soc_code="15-1252.00",
        title="Software Developers",
        description="Research, design, and develop computer and network software or specialized utility programs.",
        hot_technologies=["Python", "Docker", "SQL", "Git", "REST APIs", "FastAPI"],
        elements=[
            OnetKnowledgeElement(
                element_id="2.A.2.a",
                element_name="Programming",
                element_category="Skills",
                description="Writing computer programs for various purposes.",
            ),
            OnetKnowledgeElement(
                element_id="2.C.3.a",
                element_name="Computers and Electronics",
                element_category="Knowledge",
                description="Knowledge of circuit boards, processors, chips, electronic equipment, and computer hardware and software, including applications and programming.",
            ),
            OnetKnowledgeElement(
                element_id="2.B.3.e",
                element_name="Quality Control Analysis",
                element_category="Skills",
                description="Conducting tests and inspections of products, services, or processes to evaluate quality or performance.",
            ),
            OnetKnowledgeElement(
                element_id="4.A.1.b.2",
                element_name="Technology Design",
                element_category="Skills",
                description="Generating or adapting equipment and technology to serve user needs.",
            ),
        ],
    ),
    "15-1299.08": OnetOccupation(
        soc_code="15-1299.08",
        title="Computer Systems Engineers/Architects",
        description="Design and develop solutions to complex applications problems, system administration issues, or network concerns.",
        hot_technologies=["Docker", "Kubernetes", "Git", "Python", "CI/CD", "PostgreSQL"],
        elements=[
            OnetKnowledgeElement(
                element_id="4.A.1.b.2",
                element_name="System Architecture & Technology Design",
                element_category="Skills",
                description="Designing fault-tolerant, high-throughput distributed architectures.",
            ),
            OnetKnowledgeElement(
                element_id="2.A.2.a",
                element_name="Complex Problem Solving",
                element_category="Skills",
                description="Identifying complex problems and reviewing related information to develop and evaluate options.",
            ),
        ],
    ),
    "15-2051.00": OnetOccupation(
        soc_code="15-2051.00",
        title="Data Scientists",
        description="Develop and implement algorithms and statistical models to extract value from data collections.",
        hot_technologies=["Python", "Vector Databases", "SQL", "PyTorch", "Git"],
        elements=[
            OnetKnowledgeElement(
                element_id="2.C.4.a",
                element_name="Mathematics & Statistics",
                element_category="Knowledge",
                description="Knowledge of arithmetic, algebra, geometry, calculus, statistics, and their applications.",
            ),
            OnetKnowledgeElement(
                element_id="2.A.2.a",
                element_name="Mathematical Reasoning & Programming",
                element_category="Abilities",
                description="The ability to choose the right mathematical methods or formulas to solve a problem.",
            ),
        ],
    ),
    "15-1254.00": OnetOccupation(
        soc_code="15-1254.00",
        title="Web Developers",
        description="Develop and create web applications and pages, analyze user needs to implement web site content and graphics.",
        hot_technologies=["React", "TypeScript", "REST APIs", "CSS", "Git"],
        elements=[
            OnetKnowledgeElement(
                element_id="2.A.2.a",
                element_name="Web Programming",
                element_category="Skills",
                description="Writing client-side and server-side code for internet applications.",
            ),
        ],
    ),
}

# Mapping Layer: Maps O*NET SOC elements and Hot Tech keywords to InternalSkill IDs
ONET_TO_INTERNAL_SKILL_MAP: dict[str, str] = {
    # Hot Technologies & Knowledge keywords
    "python": "skill_python",
    "sql": "skill_sql",
    "postgresql": "skill_sql",
    "mysql": "skill_sql",
    "database management system software": "skill_sql",
    "docker": "skill_docker",
    "cloud-based data or development software": "skill_docker",
    "rest apis": "skill_rest_apis",
    "fastapi": "skill_rest_apis",
    "web platform development software": "skill_rest_apis",
    "git": "skill_git",
    "version control": "skill_git",
    "quality control analysis": "skill_testing",
    "software testing": "skill_testing",
    "pytest": "skill_testing",
    "system architecture & technology design": "skill_system_design",
    "distributed systems": "skill_system_design",
    "ci/cd": "skill_cicd",
    "development environment software": "skill_cicd",
    "vector databases": "skill_vector_db",
    "dense retrieval": "skill_vector_db",
    "react": "skill_react",
    "typescript": "skill_react",
}


def get_onet_occupation(soc_code: str) -> OnetOccupation | None:
    """Retrieve an O*NET occupation by SOC code."""
    return ONET_OCCUPATIONS_CACHE.get(soc_code)


def map_onet_keyword_to_internal_skill(keyword: str) -> str | None:
    """Resolve an O*NET concept or technology keyword to an internal skill ID."""
    return ONET_TO_INTERNAL_SKILL_MAP.get(keyword.strip().lower())

"""Unified Occupational Profiles & Industry Benchmarks.

Fuses ESCO qualifications and O*NET occupational standards to specify required
competencies, target proficiency benchmarks (0-100), and assessment coverage.
"""

from __future__ import annotations

from pydantic import BaseModel, Field
from app.services.skills.taxonomy import SKILLS_REGISTRY


class SkillRequirement(BaseModel):
    """Specific skill requirement for an occupation."""

    skill_id: str
    skill_name: str
    importance: str = "essential"  # "essential" or "optional"
    benchmark_level: int = 75  # Target proficiency score (0 - 100)
    difficulty_target: str = "intermediate"  # "beginner", "intermediate", "advanced"
    recommended_questions: int = 5
    category: str = "General"


class OccupationProfile(BaseModel):
    """Complete unified occupation profile."""

    occupation_id: str
    title: str
    description: str
    category: str
    esco_code: str
    onet_code: str
    required_skills: list[SkillRequirement] = Field(default_factory=list)


# Industry Occupational Profiles
OCCUPATION_PROFILES: dict[str, OccupationProfile] = {
    "backend_developer": OccupationProfile(
        occupation_id="backend_developer",
        title="Senior Backend Developer",
        description="Designs, builds, and maintains server-side architecture, relational and document datastores, RESTful microservices, and containerized deployments.",
        category="Software Engineering",
        esco_code="2512.2",
        onet_code="15-1252.00",
        required_skills=[
            SkillRequirement(
                skill_id="skill_python",
                skill_name="Python Programming",
                importance="essential",
                benchmark_level=80,
                difficulty_target="advanced",
                recommended_questions=6,
                category="Backend Architecture",
            ),
            SkillRequirement(
                skill_id="skill_sql",
                skill_name="SQL & Relational Databases",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="Databases & Storage",
            ),
            SkillRequirement(
                skill_id="skill_rest_apis",
                skill_name="RESTful API Design & HTTP",
                importance="essential",
                benchmark_level=80,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="API Engineering",
            ),
            SkillRequirement(
                skill_id="skill_docker",
                skill_name="Docker & Containerization",
                importance="essential",
                benchmark_level=70,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="Cloud & DevOps",
            ),
            SkillRequirement(
                skill_id="skill_testing",
                skill_name="Software Testing & Quality Assurance",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="Testing & QA",
            ),
            SkillRequirement(
                skill_id="skill_system_design",
                skill_name="Distributed Systems & System Design",
                importance="essential",
                benchmark_level=70,
                difficulty_target="advanced",
                recommended_questions=4,
                category="Backend Architecture",
            ),
            SkillRequirement(
                skill_id="skill_git",
                skill_name="Git Version Control & Workflows",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Engineering Workflow",
            ),
        ],
    ),
    "ai_systems_engineer": OccupationProfile(
        occupation_id="ai_systems_engineer",
        title="AI Systems & Machine Learning Engineer",
        description="Builds modern AI platforms, implements retrieval-augmented generation (RAG), vector indexing, embeddings pipelines, and high-performance inference services.",
        category="Artificial Intelligence",
        esco_code="2511.1",
        onet_code="15-2051.00",
        required_skills=[
            SkillRequirement(
                skill_id="skill_python",
                skill_name="Python Programming",
                importance="essential",
                benchmark_level=85,
                difficulty_target="advanced",
                recommended_questions=6,
                category="Backend Architecture",
            ),
            SkillRequirement(
                skill_id="skill_vector_db",
                skill_name="Vector Databases & Information Retrieval",
                importance="essential",
                benchmark_level=80,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="AI & Machine Learning",
            ),
            SkillRequirement(
                skill_id="skill_sql",
                skill_name="SQL & Relational Databases",
                importance="essential",
                benchmark_level=70,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="Databases & Storage",
            ),
            SkillRequirement(
                skill_id="skill_rest_apis",
                skill_name="RESTful API Design & HTTP",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="API Engineering",
            ),
            SkillRequirement(
                skill_id="skill_testing",
                skill_name="Software Testing & Quality Assurance",
                importance="essential",
                benchmark_level=70,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Testing & QA",
            ),
            SkillRequirement(
                skill_id="skill_docker",
                skill_name="Docker & Containerization",
                importance="optional",
                benchmark_level=65,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Cloud & DevOps",
            ),
        ],
    ),
    "devops_engineer": OccupationProfile(
        occupation_id="devops_engineer",
        title="DevOps & Cloud Infrastructure Lead",
        description="Automates continuous delivery pipelines, manages Kubernetes and Docker container estates, and enforces system reliability and security.",
        category="Cloud & Infrastructure",
        esco_code="2519.1",
        onet_code="15-1299.08",
        required_skills=[
            SkillRequirement(
                skill_id="skill_docker",
                skill_name="Docker & Containerization",
                importance="essential",
                benchmark_level=85,
                difficulty_target="advanced",
                recommended_questions=6,
                category="Cloud & DevOps",
            ),
            SkillRequirement(
                skill_id="skill_cicd",
                skill_name="CI/CD Pipelines & Automation",
                importance="essential",
                benchmark_level=85,
                difficulty_target="advanced",
                recommended_questions=5,
                category="Cloud & DevOps",
            ),
            SkillRequirement(
                skill_id="skill_git",
                skill_name="Git Version Control & Workflows",
                importance="essential",
                benchmark_level=80,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="Engineering Workflow",
            ),
            SkillRequirement(
                skill_id="skill_system_design",
                skill_name="Distributed Systems & System Design",
                importance="essential",
                benchmark_level=75,
                difficulty_target="advanced",
                recommended_questions=5,
                category="Backend Architecture",
            ),
            SkillRequirement(
                skill_id="skill_python",
                skill_name="Python Programming",
                importance="essential",
                benchmark_level=70,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Backend Architecture",
            ),
        ],
    ),
    "fullstack_engineer": OccupationProfile(
        occupation_id="fullstack_engineer",
        title="Full Stack Engineer",
        description="Creates end-to-end web applications combining reactive browser user interfaces with resilient server services and databases.",
        category="Software Engineering",
        esco_code="2512.3",
        onet_code="15-1254.00",
        required_skills=[
            SkillRequirement(
                skill_id="skill_react",
                skill_name="React & Modern Frontend Architecture",
                importance="essential",
                benchmark_level=80,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="Frontend Architecture",
            ),
            SkillRequirement(
                skill_id="skill_python",
                skill_name="Python Programming",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="Backend Architecture",
            ),
            SkillRequirement(
                skill_id="skill_rest_apis",
                skill_name="RESTful API Design & HTTP",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="API Engineering",
            ),
            SkillRequirement(
                skill_id="skill_sql",
                skill_name="SQL & Relational Databases",
                importance="essential",
                benchmark_level=70,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Databases & Storage",
            ),
            SkillRequirement(
                skill_id="skill_git",
                skill_name="Git Version Control & Workflows",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Engineering Workflow",
            ),
            SkillRequirement(
                skill_id="skill_testing",
                skill_name="Software Testing & Quality Assurance",
                importance="essential",
                benchmark_level=70,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Testing & QA",
            ),
        ],
    ),
    "frontend_developer": OccupationProfile(
        occupation_id="frontend_developer",
        title="Frontend Web Engineer",
        description="Builds accessible, highly responsive, interactive user interfaces with modern component frameworks and web standards.",
        category="Frontend Architecture",
        esco_code="2512.4",
        onet_code="15-1254.00",
        required_skills=[
            SkillRequirement(
                skill_id="skill_react",
                skill_name="React & Modern Frontend Architecture",
                importance="essential",
                benchmark_level=85,
                difficulty_target="advanced",
                recommended_questions=5,
                category="Frontend Architecture",
            ),
            SkillRequirement(
                skill_id="skill_javascript",
                skill_name="JavaScript & TypeScript Fundamentals",
                importance="essential",
                benchmark_level=80,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="Frontend Architecture",
            ),
            SkillRequirement(
                skill_id="skill_rest_apis",
                skill_name="RESTful API Design & HTTP",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="API Engineering",
            ),
            SkillRequirement(
                skill_id="skill_testing",
                skill_name="Software Testing & Quality Assurance",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Testing & QA",
            ),
            SkillRequirement(
                skill_id="skill_git",
                skill_name="Git Version Control & Workflows",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Engineering Workflow",
            ),
        ],
    ),
    "data_engineer": OccupationProfile(
        occupation_id="data_engineer",
        title="Data Engineer & Analytics Architect",
        description="Designs, scales, and manages robust ETL/ELT pipelines, distributed data warehouses, streaming platforms, and data lake storage.",
        category="Data Engineering",
        esco_code="2511.2",
        onet_code="15-1243.00",
        required_skills=[
            SkillRequirement(
                skill_id="skill_sql",
                skill_name="SQL & Relational Databases",
                importance="essential",
                benchmark_level=85,
                difficulty_target="advanced",
                recommended_questions=5,
                category="Databases & Storage",
            ),
            SkillRequirement(
                skill_id="skill_python",
                skill_name="Python Programming",
                importance="essential",
                benchmark_level=80,
                difficulty_target="advanced",
                recommended_questions=5,
                category="Backend Architecture",
            ),
            SkillRequirement(
                skill_id="skill_data_engineering",
                skill_name="Data Engineering & Pipeline Orchestration",
                importance="essential",
                benchmark_level=80,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="Data Engineering",
            ),
            SkillRequirement(
                skill_id="skill_cloud",
                skill_name="Cloud Infrastructure & Architecture (AWS/GCP/Azure)",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Cloud & DevOps",
            ),
            SkillRequirement(
                skill_id="skill_docker",
                skill_name="Docker & Containerization",
                importance="essential",
                benchmark_level=70,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Cloud & DevOps",
            ),
        ],
    ),
    "cloud_architect": OccupationProfile(
        occupation_id="cloud_architect",
        title="Cloud Solutions Architect",
        description="Architects resilient, secure, multi-region cloud infrastructures, hybrid environments, high availability, and containerized clusters.",
        category="Cloud & Infrastructure",
        esco_code="2519.2",
        onet_code="15-1244.00",
        required_skills=[
            SkillRequirement(
                skill_id="skill_cloud",
                skill_name="Cloud Infrastructure & Architecture (AWS/GCP/Azure)",
                importance="essential",
                benchmark_level=85,
                difficulty_target="advanced",
                recommended_questions=6,
                category="Cloud & DevOps",
            ),
            SkillRequirement(
                skill_id="skill_kubernetes",
                skill_name="Kubernetes & Container Orchestration",
                importance="essential",
                benchmark_level=80,
                difficulty_target="advanced",
                recommended_questions=5,
                category="Cloud & DevOps",
            ),
            SkillRequirement(
                skill_id="skill_system_design",
                skill_name="Distributed Systems & System Design",
                importance="essential",
                benchmark_level=85,
                difficulty_target="advanced",
                recommended_questions=5,
                category="Backend Architecture",
            ),
            SkillRequirement(
                skill_id="skill_cybersecurity",
                skill_name="Cybersecurity & Application Security (AppSec)",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Security & Compliance",
            ),
            SkillRequirement(
                skill_id="skill_docker",
                skill_name="Docker & Containerization",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Cloud & DevOps",
            ),
        ],
    ),
    "cybersecurity_specialist": OccupationProfile(
        occupation_id="cybersecurity_specialist",
        title="Cybersecurity Specialist & AppSec Analyst",
        description="Guards applications and cloud perimeters, prevents penetration, enforces threat modeling, audits access policies, and hardens APIs.",
        category="Security & Compliance",
        esco_code="2529.1",
        onet_code="15-1212.00",
        required_skills=[
            SkillRequirement(
                skill_id="skill_cybersecurity",
                skill_name="Cybersecurity & Application Security (AppSec)",
                importance="essential",
                benchmark_level=85,
                difficulty_target="advanced",
                recommended_questions=6,
                category="Security & Compliance",
            ),
            SkillRequirement(
                skill_id="skill_cloud",
                skill_name="Cloud Infrastructure & Architecture (AWS/GCP/Azure)",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="Cloud & DevOps",
            ),
            SkillRequirement(
                skill_id="skill_python",
                skill_name="Python Programming",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Backend Architecture",
            ),
            SkillRequirement(
                skill_id="skill_testing",
                skill_name="Software Testing & Quality Assurance",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Testing & QA",
            ),
            SkillRequirement(
                skill_id="skill_git",
                skill_name="Git Version Control & Workflows",
                importance="essential",
                benchmark_level=70,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Engineering Workflow",
            ),
        ],
    ),
    "mobile_developer": OccupationProfile(
        occupation_id="mobile_developer",
        title="Mobile & Cross-Platform App Engineer",
        description="Creates intuitive, reactive mobile applications with Flutter, Dart, React Native, and native mobile platform integrations.",
        category="Mobile Engineering",
        esco_code="2512.5",
        onet_code="15-1254.00",
        required_skills=[
            SkillRequirement(
                skill_id="skill_mobile",
                skill_name="Mobile App Development (Flutter & Native)",
                importance="essential",
                benchmark_level=85,
                difficulty_target="advanced",
                recommended_questions=6,
                category="Mobile Engineering",
            ),
            SkillRequirement(
                skill_id="skill_javascript",
                skill_name="JavaScript & TypeScript Fundamentals",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="Frontend Architecture",
            ),
            SkillRequirement(
                skill_id="skill_rest_apis",
                skill_name="RESTful API Design & HTTP",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="API Engineering",
            ),
            SkillRequirement(
                skill_id="skill_testing",
                skill_name="Software Testing & Quality Assurance",
                importance="essential",
                benchmark_level=70,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Testing & QA",
            ),
            SkillRequirement(
                skill_id="skill_git",
                skill_name="Git Version Control & Workflows",
                importance="essential",
                benchmark_level=70,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Engineering Workflow",
            ),
        ],
    ),
    "sre_engineer": OccupationProfile(
        occupation_id="sre_engineer",
        title="Site Reliability Engineer (SRE)",
        description="Applies software engineering principles to operations, establishing SLOs/SLAs, automated incident response, and distributed reliability.",
        category="Operations & Reliability",
        esco_code="2519.3",
        onet_code="15-1244.00",
        required_skills=[
            SkillRequirement(
                skill_id="skill_system_design",
                skill_name="Distributed Systems & System Design",
                importance="essential",
                benchmark_level=85,
                difficulty_target="advanced",
                recommended_questions=6,
                category="Backend Architecture",
            ),
            SkillRequirement(
                skill_id="skill_kubernetes",
                skill_name="Kubernetes & Container Orchestration",
                importance="essential",
                benchmark_level=80,
                difficulty_target="advanced",
                recommended_questions=5,
                category="Cloud & DevOps",
            ),
            SkillRequirement(
                skill_id="skill_cloud",
                skill_name="Cloud Infrastructure & Architecture (AWS/GCP/Azure)",
                importance="essential",
                benchmark_level=80,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Cloud & DevOps",
            ),
            SkillRequirement(
                skill_id="skill_cicd",
                skill_name="CI/CD Pipelines & Automation",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Cloud & DevOps",
            ),
            SkillRequirement(
                skill_id="skill_python",
                skill_name="Python Programming",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Backend Architecture",
            ),
        ],
    ),
    "qa_automation_engineer": OccupationProfile(
        occupation_id="qa_automation_engineer",
        title="QA Automation Engineer & SDET",
        description="Designs automated end-to-end testing suites, regression harnesses, CI/CD integration gates, and performance benchmarking.",
        category="Quality Assurance",
        esco_code="2519.4",
        onet_code="15-1253.00",
        required_skills=[
            SkillRequirement(
                skill_id="skill_testing",
                skill_name="Software Testing & Quality Assurance",
                importance="essential",
                benchmark_level=85,
                difficulty_target="advanced",
                recommended_questions=6,
                category="Testing & QA",
            ),
            SkillRequirement(
                skill_id="skill_python",
                skill_name="Python Programming",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=5,
                category="Backend Architecture",
            ),
            SkillRequirement(
                skill_id="skill_rest_apis",
                skill_name="RESTful API Design & HTTP",
                importance="essential",
                benchmark_level=75,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="API Engineering",
            ),
            SkillRequirement(
                skill_id="skill_cicd",
                skill_name="CI/CD Pipelines & Automation",
                importance="essential",
                benchmark_level=70,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Cloud & DevOps",
            ),
            SkillRequirement(
                skill_id="skill_git",
                skill_name="Git Version Control & Workflows",
                importance="essential",
                benchmark_level=70,
                difficulty_target="intermediate",
                recommended_questions=4,
                category="Engineering Workflow",
            ),
        ],
    ),
}

# Dynamic registry for user-defined custom roles
DYNAMIC_OCCUPATIONS_REGISTRY: dict[str, OccupationProfile] = {}


def generate_dynamic_occupation_profile(
    role_title: str,
    category: str | None = None,
    experience_level: str | None = None,
) -> OccupationProfile:
    """Dynamically generate a unified occupation benchmark for ANY custom role."""
    clean_id = (
        role_title.lower()
        .strip()
        .replace(" ", "_")
        .replace("-", "_")
        .replace("/", "_")
        .replace("&", "and")
    )

    # Check if already present
    if clean_id in OCCUPATION_PROFILES:
        return OCCUPATION_PROFILES[clean_id]
    if clean_id in DYNAMIC_OCCUPATIONS_REGISTRY:
        return DYNAMIC_OCCUPATIONS_REGISTRY[clean_id]

    # Benchmark calibration by experience level
    exp = (experience_level or "").lower()
    if "senior" in exp or "senior" in clean_id or "lead" in clean_id or "architect" in clean_id:
        target_bench = 85
        target_diff = "advanced"
    elif "junior" in exp or "entry" in exp or "beginner" in clean_id:
        target_bench = 65
        target_diff = "beginner"
    else:
        target_bench = 75
        target_diff = "intermediate"

    # Derive skills based on role title keywords
    t_lower = role_title.lower()
    skills: list[SkillRequirement] = []

    if any(k in t_lower for k in ["frontend", "ui", "react", "web client", "css"]):
        cat = category or "Frontend Engineering"
        skills = [
            SkillRequirement(skill_id="skill_react", skill_name="React & Modern Frontend Architecture", benchmark_level=target_bench, difficulty_target=target_diff, recommended_questions=5, category=cat),
            SkillRequirement(skill_id="skill_javascript", skill_name="JavaScript & TypeScript Fundamentals", benchmark_level=target_bench, difficulty_target="intermediate", recommended_questions=5, category=cat),
            SkillRequirement(skill_id="skill_rest_apis", skill_name="RESTful API Design & HTTP", benchmark_level=75, difficulty_target="intermediate", recommended_questions=4, category="API Engineering"),
            SkillRequirement(skill_id="skill_testing", skill_name="Software Testing & Quality Assurance", benchmark_level=70, difficulty_target="intermediate", recommended_questions=4, category="Testing & QA"),
            SkillRequirement(skill_id="skill_git", skill_name="Git Version Control & Workflows", benchmark_level=75, difficulty_target="intermediate", recommended_questions=4, category="Workflow"),
        ]
    elif any(k in t_lower for k in ["mobile", "flutter", "android", "ios"]):
        cat = category or "Mobile Engineering"
        skills = [
            SkillRequirement(skill_id="skill_mobile", skill_name="Mobile App Development (Flutter & Native)", benchmark_level=target_bench, difficulty_target=target_diff, recommended_questions=5, category=cat),
            SkillRequirement(skill_id="skill_javascript", skill_name="JavaScript & TypeScript Fundamentals", benchmark_level=75, difficulty_target="intermediate", recommended_questions=4, category=cat),
            SkillRequirement(skill_id="skill_rest_apis", skill_name="RESTful API Design & HTTP", benchmark_level=75, difficulty_target="intermediate", recommended_questions=4, category="API Engineering"),
            SkillRequirement(skill_id="skill_testing", skill_name="Software Testing & Quality Assurance", benchmark_level=70, difficulty_target="intermediate", recommended_questions=4, category="Testing & QA"),
            SkillRequirement(skill_id="skill_git", skill_name="Git Version Control & Workflows", benchmark_level=70, difficulty_target="intermediate", recommended_questions=4, category="Workflow"),
        ]
    elif any(k in t_lower for k in ["devops", "cloud", "infra", "sre", "platform", "kubernetes"]):
        cat = category or "Cloud & DevOps"
        skills = [
            SkillRequirement(skill_id="skill_cloud", skill_name="Cloud Infrastructure & Architecture (AWS/GCP/Azure)", benchmark_level=target_bench, difficulty_target=target_diff, recommended_questions=5, category=cat),
            SkillRequirement(skill_id="skill_kubernetes", skill_name="Kubernetes & Container Orchestration", benchmark_level=target_bench, difficulty_target=target_diff, recommended_questions=5, category=cat),
            SkillRequirement(skill_id="skill_docker", skill_name="Docker & Containerization", benchmark_level=80, difficulty_target="intermediate", recommended_questions=4, category=cat),
            SkillRequirement(skill_id="skill_cicd", skill_name="CI/CD Pipelines & Automation", benchmark_level=75, difficulty_target="intermediate", recommended_questions=4, category=cat),
            SkillRequirement(skill_id="skill_system_design", skill_name="Distributed Systems & System Design", benchmark_level=75, difficulty_target=target_diff, recommended_questions=4, category="Architecture"),
        ]
    elif any(k in t_lower for k in ["data", "etl", "analytics", "warehouse", "pipeline"]):
        cat = category or "Data Engineering"
        skills = [
            SkillRequirement(skill_id="skill_sql", skill_name="SQL & Relational Databases", benchmark_level=target_bench, difficulty_target=target_diff, recommended_questions=5, category="Databases"),
            SkillRequirement(skill_id="skill_python", skill_name="Python Programming", benchmark_level=80, difficulty_target=target_diff, recommended_questions=5, category="Programming"),
            SkillRequirement(skill_id="skill_data_engineering", skill_name="Data Engineering & Pipeline Orchestration", benchmark_level=target_bench, difficulty_target="intermediate", recommended_questions=5, category=cat),
            SkillRequirement(skill_id="skill_cloud", skill_name="Cloud Infrastructure & Architecture (AWS/GCP/Azure)", benchmark_level=75, difficulty_target="intermediate", recommended_questions=4, category="Cloud"),
            SkillRequirement(skill_id="skill_docker", skill_name="Docker & Containerization", benchmark_level=70, difficulty_target="intermediate", recommended_questions=4, category="DevOps"),
        ]
    elif any(k in t_lower for k in ["ai", "machine learning", "ml", "deep learning", "nlp", "llm"]):
        cat = category or "AI & Machine Learning"
        skills = [
            SkillRequirement(skill_id="skill_python", skill_name="Python Programming", benchmark_level=85, difficulty_target=target_diff, recommended_questions=5, category="Programming"),
            SkillRequirement(skill_id="skill_machine_learning", skill_name="Machine Learning & Statistical Modeling", benchmark_level=target_bench, difficulty_target=target_diff, recommended_questions=5, category=cat),
            SkillRequirement(skill_id="skill_vector_db", skill_name="Vector Databases & Information Retrieval", benchmark_level=75, difficulty_target="intermediate", recommended_questions=4, category=cat),
            SkillRequirement(skill_id="skill_sql", skill_name="SQL & Relational Databases", benchmark_level=70, difficulty_target="intermediate", recommended_questions=4, category="Databases"),
            SkillRequirement(skill_id="skill_algorithms", skill_name="Algorithms & Computational Complexity", benchmark_level=75, difficulty_target=target_diff, recommended_questions=4, category="Computer Science"),
        ]
    elif any(k in t_lower for k in ["security", "cyber", "infosec", "soc", "appsec"]):
        cat = category or "Security & Compliance"
        skills = [
            SkillRequirement(skill_id="skill_cybersecurity", skill_name="Cybersecurity & Application Security (AppSec)", benchmark_level=target_bench, difficulty_target=target_diff, recommended_questions=6, category=cat),
            SkillRequirement(skill_id="skill_cloud", skill_name="Cloud Infrastructure & Architecture (AWS/GCP/Azure)", benchmark_level=75, difficulty_target="intermediate", recommended_questions=4, category="Cloud"),
            SkillRequirement(skill_id="skill_python", skill_name="Python Programming", benchmark_level=75, difficulty_target="intermediate", recommended_questions=4, category="Programming"),
            SkillRequirement(skill_id="skill_testing", skill_name="Software Testing & Quality Assurance", benchmark_level=75, difficulty_target="intermediate", recommended_questions=4, category="Testing"),
            SkillRequirement(skill_id="skill_git", skill_name="Git Version Control & Workflows", benchmark_level=70, difficulty_target="intermediate", recommended_questions=4, category="Workflow"),
        ]
    else:
        # Standard software engineering profile calibrated for custom role
        cat = category or "Software Engineering"
        skills = [
            SkillRequirement(skill_id="skill_python", skill_name="Python Programming", benchmark_level=target_bench, difficulty_target=target_diff, recommended_questions=5, category="Backend"),
            SkillRequirement(skill_id="skill_sql", skill_name="SQL & Relational Databases", benchmark_level=75, difficulty_target="intermediate", recommended_questions=4, category="Databases"),
            SkillRequirement(skill_id="skill_rest_apis", skill_name="RESTful API Design & HTTP", benchmark_level=75, difficulty_target="intermediate", recommended_questions=4, category="API"),
            SkillRequirement(skill_id="skill_system_design", skill_name="Distributed Systems & System Design", benchmark_level=70, difficulty_target=target_diff, recommended_questions=4, category="Architecture"),
            SkillRequirement(skill_id="skill_git", skill_name="Git Version Control & Workflows", benchmark_level=75, difficulty_target="intermediate", recommended_questions=4, category="Workflow"),
        ]

    profile = OccupationProfile(
        occupation_id=clean_id,
        title=role_title.title(),
        description=f"Industry occupational profile and benchmark competencies for {role_title.title()}.",
        category=cat,
        esco_code="2512.9",
        onet_code="15-1252.00",
        required_skills=skills,
    )

    DYNAMIC_OCCUPATIONS_REGISTRY[clean_id] = profile
    return profile


def get_all_occupations() -> list[OccupationProfile]:
    """Retrieve all supported unified occupation profiles (including dynamically created roles)."""
    return list(OCCUPATION_PROFILES.values()) + list(DYNAMIC_OCCUPATIONS_REGISTRY.values())


def get_occupation(occupation_id: str) -> OccupationProfile | None:
    """Retrieve an occupation by ID, fuzzy match, or dynamically generate on the fly."""
    if occupation_id in OCCUPATION_PROFILES:
        return OCCUPATION_PROFILES[occupation_id]
    if occupation_id in DYNAMIC_OCCUPATIONS_REGISTRY:
        return DYNAMIC_OCCUPATIONS_REGISTRY[occupation_id]

    lower_target = occupation_id.lower().replace("-", " ").replace("_", " ")

    # Fuzzy search in preset and dynamic profiles
    all_profiles = {**OCCUPATION_PROFILES, **DYNAMIC_OCCUPATIONS_REGISTRY}
    for occ_id, occ in all_profiles.items():
        if occ_id in lower_target or occ.title.lower() in lower_target or lower_target in occ.title.lower():
            return occ

    # If role not found, dynamically generate and register it!
    clean_title = occupation_id.replace("_", " ").replace("-", " ").title()
    return generate_dynamic_occupation_profile(clean_title)

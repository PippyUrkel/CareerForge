"""Normalized Internal Skill Taxonomy for CareerForge.

Normalizes skills from ESCO, O*NET, Assessment Providers, and Internal questions
into a single unified taxonomy model.
"""

from __future__ import annotations

from typing import Any
from pydantic import BaseModel, Field


class InternalSkill(BaseModel):
    """Normalized internal skill model.
    
    Provides a standardized representation across ESCO, O*NET, and assessment systems.
    """

    internal_skill_id: str = Field(..., description="Unique internal identifier (e.g. skill_python)")
    name: str = Field(..., description="Human-readable canonical name")
    description: str = Field(..., description="Technical competency definition")
    category: str = Field(..., description="Domain/Technical category")
    source: str = Field(default="INTERNAL", description="Primary source: INTERNAL, ESCO, ONET, or PROVIDER")
    source_skill_id: str | None = Field(default=None, description="External reference ID (URI or SOC element)")
    parent_skill_id: str | None = Field(default=None, description="Parent skill ID for hierarchy")
    metadata: dict[str, Any] = Field(default_factory=dict, description="ESCO/O*NET cross-references, keywords, and tags")


# Core Normalized Skills Registry
SKILLS_REGISTRY: dict[str, InternalSkill] = {
    "skill_python": InternalSkill(
        internal_skill_id="skill_python",
        name="Python Programming",
        description="Core language idioms, object-oriented design, async concurrency, typing, and standard library.",
        category="Backend Architecture",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/4b6a9d70-3948-4389-9fa9-dcb0d9e84b80",
            "onet_element": "2.A.2.a",
            "onet_hot_tech": "Python",
            "keywords": ["Python", "OOP", "AsyncIO", "Decorators", "Generators", "Type Hints"],
        },
    ),
    "skill_sql": InternalSkill(
        internal_skill_id="skill_sql",
        name="SQL & Relational Databases",
        description="Relational database schema modeling, SQL querying, indexing, transaction isolation (ACID), and optimization.",
        category="Databases & Storage",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/96ef4b77-33ee-4573-b68c-7ea0cb1d77cb",
            "onet_element": "2.C.3.a",
            "onet_hot_tech": "PostgreSQL, MySQL, SQLite",
            "keywords": ["SQL", "PostgreSQL", "Indexes", "ACID", "Joins", "Query Optimization"],
        },
    ),
    "skill_docker": InternalSkill(
        internal_skill_id="skill_docker",
        name="Docker & Containerization",
        description="Container lifecycle, multi-stage Dockerfiles, image optimization, volume storage, and bridge networking.",
        category="Cloud & DevOps",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/7cf62b21-4d37-4d7a-8f92-56b09337ff8c",
            "onet_element": "4.A.1.b.2",
            "onet_hot_tech": "Docker",
            "keywords": ["Docker", "Containers", "Images", "Volumes", "Networking", "Multi-stage Builds"],
        },
    ),
    "skill_rest_apis": InternalSkill(
        internal_skill_id="skill_rest_apis",
        name="RESTful API Design & HTTP",
        description="REST architectural constraints, HTTP semantics, idempotent methods, authentication, status codes, and pagination.",
        category="API Engineering",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/46124f92-550a-4716-834c-974d6ee4f828",
            "onet_element": "2.A.2.a",
            "onet_hot_tech": "FastAPI, Express, REST",
            "keywords": ["REST", "HTTP", "FastAPI", "Endpoints", "Authentication", "Status Codes"],
        },
    ),
    "skill_testing": InternalSkill(
        internal_skill_id="skill_testing",
        name="Software Testing & Quality Assurance",
        description="Unit testing, test fixtures, test doubles (mocks/stubs), integration tests, test-driven development, and regression detection.",
        category="Testing & QA",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/a2c26ea6-eeec-4ce7-a9a3-5c05d762e879",
            "onet_element": "2.B.3.e",
            "keywords": ["Testing", "Pytest", "Unit Tests", "Mocks", "Integration Tests", "TDD"],
        },
    ),
    "skill_git": InternalSkill(
        internal_skill_id="skill_git",
        name="Git Version Control & Workflows",
        description="Distributed version control, branch management, merge vs rebase, conflict resolution, cherry-picking, and pull request workflows.",
        category="Engineering Workflow",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/79e19d7a-3be3-4882-9654-e69fcfa2d19f",
            "onet_element": "2.A.2.a",
            "onet_hot_tech": "Git, GitHub, GitLab",
            "keywords": ["Git", "Branching", "Rebase", "Merge", "Version Control", "Cherry-pick"],
        },
    ),
    "skill_system_design": InternalSkill(
        internal_skill_id="skill_system_design",
        name="Distributed Systems & System Design",
        description="High-availability architectures, caching strategies, horizontal scaling, database sharding/replication, and CAP theorem trade-offs.",
        category="Backend Architecture",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/c4e43cf8-0ae1-4876-87ff-4375cb4b711d",
            "onet_element": "15-1299.08",
            "keywords": ["System Design", "Distributed Systems", "Caching", "Sharding", "CAP Theorem", "Load Balancing"],
        },
    ),
    "skill_cicd": InternalSkill(
        internal_skill_id="skill_cicd",
        name="CI/CD Pipelines & Automation",
        description="Continuous integration pipelines, automated linting/testing, build artifacts, blue-green & canary deployment orchestration.",
        category="Cloud & DevOps",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/5034a742-fa33-4355-83aa-8d26aa2783be",
            "onet_element": "4.A.1.b.2",
            "keywords": ["CI/CD", "GitHub Actions", "Automation", "Deployment", "Canary", "Pipelines"],
        },
    ),
    "skill_vector_db": InternalSkill(
        internal_skill_id="skill_vector_db",
        name="Vector Databases & Information Retrieval",
        description="Embedding generation, vector indexing algorithms (HNSW, IVF), cosine & Euclidean distance, and hybrid keyword-vector retrieval.",
        category="AI & Machine Learning",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/bfa81ca4-3990-4e33-8758-e325608b89bb",
            "onet_element": "15-2051.00",
            "keywords": ["Vector DB", "Embeddings", "HNSW", "Cosine Similarity", "Dense Retrieval", "RAG"],
        },
    ),
    "skill_react": InternalSkill(
        internal_skill_id="skill_react",
        name="React & Modern Frontend Architecture",
        description="Component composition, declarative state management, virtual DOM reconciliation, hooks lifecycle, and bundle optimization.",
        category="Frontend Architecture",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/33583da7-f2cf-4b95-aef9-ee3c44243b74",
            "onet_element": "15-1254.00",
            "onet_hot_tech": "React, TypeScript",
            "keywords": ["React", "TypeScript", "Hooks", "State Management", "Component Lifecycle"],
        },
    ),
    "skill_javascript": InternalSkill(
        internal_skill_id="skill_javascript",
        name="JavaScript & TypeScript Fundamentals",
        description="ECMAScript modern standards, closures, event loop, promises, prototype chain, type narrowing, generics, and execution context.",
        category="Frontend Architecture",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/2a2e4c29-3733-40e8-88e9-df7f62e84241",
            "onet_element": "15-1254.00",
            "onet_hot_tech": "JavaScript, TypeScript, Node.js",
            "keywords": ["JavaScript", "TypeScript", "Event Loop", "Promises", "Closures", "Generics"],
        },
    ),
    "skill_cloud": InternalSkill(
        internal_skill_id="skill_cloud",
        name="Cloud Infrastructure & Architecture (AWS/GCP/Azure)",
        description="Cloud compute, VPC networking, IAM role permissions, serverless functions, object storage, and managed cloud databases.",
        category="Cloud & DevOps",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/3831b518-e8cb-4ee4-8eef-ce3df6abff9b",
            "onet_element": "15-1244.00",
            "onet_hot_tech": "AWS, GCP, Azure, Terraform",
            "keywords": ["AWS", "Cloud", "IAM", "Serverless", "S3", "VPC"],
        },
    ),
    "skill_kubernetes": InternalSkill(
        internal_skill_id="skill_kubernetes",
        name="Kubernetes & Container Orchestration",
        description="Pod scheduling, Deployments, Services, Ingress controllers, ConfigMaps, resource limits, and auto-scaling.",
        category="Cloud & DevOps",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/7cf62b21-4d37-4d7a-8f92-56b09337ff8c",
            "onet_element": "15-1244.00",
            "onet_hot_tech": "Kubernetes, Helm, K8s",
            "keywords": ["Kubernetes", "Pods", "Deployments", "Services", "Ingress", "Helm"],
        },
    ),
    "skill_cybersecurity": InternalSkill(
        internal_skill_id="skill_cybersecurity",
        name="Cybersecurity & Application Security (AppSec)",
        description="OWASP Top 10 vulnerabilities, secure authentication (OAuth/JWT), encryption at rest/transit, input validation, and threat modeling.",
        category="Security & Compliance",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/1587b1c3-04ae-43fb-be7c-4a37de2f3be2",
            "onet_element": "15-1212.00",
            "onet_hot_tech": "Cybersecurity, Cryptography, OWASP",
            "keywords": ["Cybersecurity", "OWASP", "Encryption", "JWT", "Threat Modeling", "Penetration Testing"],
        },
    ),
    "skill_data_engineering": InternalSkill(
        internal_skill_id="skill_data_engineering",
        name="Data Engineering & Pipeline Orchestration",
        description="ETL/ELT data pipelines, distributed computing (Spark), stream processing (Kafka), data warehousing, and DAG orchestration (Airflow).",
        category="Data Engineering",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/96ef4b77-33ee-4573-b68c-7ea0cb1d77cb",
            "onet_element": "15-1243.00",
            "onet_hot_tech": "Apache Spark, Kafka, Airflow, Snowflake",
            "keywords": ["Data Pipelines", "ETL", "Kafka", "Spark", "Airflow", "Data Lake"],
        },
    ),
    "skill_machine_learning": InternalSkill(
        internal_skill_id="skill_machine_learning",
        name="Machine Learning & Statistical Modeling",
        description="Supervised and unsupervised algorithms, feature engineering, cross-validation, regularization, evaluation metrics (ROC-AUC, F1), and model training.",
        category="AI & Machine Learning",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/bfa81ca4-3990-4e33-8758-e325608b89bb",
            "onet_element": "15-2051.00",
            "onet_hot_tech": "Scikit-Learn, XGBoost, Pandas, NumPy",
            "keywords": ["Machine Learning", "Scikit-Learn", "Feature Engineering", "ROC-AUC", "Regression", "Classification"],
        },
    ),
    "skill_mobile": InternalSkill(
        internal_skill_id="skill_mobile",
        name="Mobile App Development (Flutter & Native)",
        description="Cross-platform mobile architecture, reactive widget trees, state management, native platform channels, lifecycle, and app store deployment.",
        category="Mobile Engineering",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/4b6a9d70-3948-4389-9fa9-dcb0d9e84b80",
            "onet_element": "15-1254.00",
            "onet_hot_tech": "Flutter, Dart, React Native, Swift, Kotlin",
            "keywords": ["Flutter", "Dart", "Mobile", "State Management", "Platform Channels", "Widgets"],
        },
    ),
    "skill_algorithms": InternalSkill(
        internal_skill_id="skill_algorithms",
        name="Algorithms & Computational Complexity",
        description="Algorithm analysis, time and space Big-O complexity, graphs, dynamic programming, trees, heaps, and algorithmic optimization.",
        category="Computer Science",
        source="INTERNAL",
        metadata={
            "esco_uri": "http://data.europa.eu/esco/skill/4b6a9d70-3948-4389-9fa9-dcb0d9e84b80",
            "onet_element": "15-1252.00",
            "keywords": ["Algorithms", "Data Structures", "Big-O", "Dynamic Programming", "Graphs", "Trees"],
        },
    ),
}


def get_all_skills() -> list[InternalSkill]:
    """Retrieve all normalized internal skills."""
    return list(SKILLS_REGISTRY.values())


def get_skill(skill_id: str) -> InternalSkill | None:
    """Retrieve a normalized internal skill by ID."""
    return SKILLS_REGISTRY.get(skill_id)


def get_skills_by_ids(skill_ids: list[str]) -> list[InternalSkill]:
    """Retrieve multiple skills by their internal IDs."""
    return [SKILLS_REGISTRY[sid] for sid in skill_ids if sid in SKILLS_REGISTRY]


def get_or_create_skill(skill_identifier: str, category: str = "Technical Domain") -> InternalSkill:
    """Retrieve an existing skill or dynamically normalize and register a new one."""
    clean_id = (
        skill_identifier.lower()
        .strip()
        .replace(" ", "_")
        .replace("-", "_")
        .replace("/", "_")
        .replace("&", "and")
    )
    if not clean_id.startswith("skill_"):
        clean_id = f"skill_{clean_id}"

    if clean_id in SKILLS_REGISTRY:
        return SKILLS_REGISTRY[clean_id]

    display_name = skill_identifier.replace("skill_", "").replace("_", " ").title()
    new_skill = InternalSkill(
        internal_skill_id=clean_id,
        name=display_name,
        description=f"Industry competency in {display_name}, evaluated across theory, application, and architectural standards.",
        category=category,
        source="DYNAMIC",
        metadata={"keywords": [display_name, category]},
    )
    SKILLS_REGISTRY[clean_id] = new_skill
    return new_skill

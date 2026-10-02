"""Appwrite Database & Storage Integration Service for CareerForge Backend."""

from __future__ import annotations

import json
import logging
from typing import Any

from appwrite.client import Client
from appwrite.permission import Permission
from appwrite.role import Role
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage

from app.core.config import AppSettings, get_settings

logger = logging.getLogger(__name__)

_appwrite_client: Client | None = None
_databases_service: Databases | None = None
_storage_service: Storage | None = None


def get_appwrite_client(settings: AppSettings | None = None) -> Client:
    """Get or create singleton Appwrite Client."""
    global _appwrite_client
    if _appwrite_client is None:
        if settings is None:
            settings = get_settings()
        client = Client()
        client.set_endpoint(settings.appwrite_endpoint)
        client.set_project(settings.appwrite_project_id)
        if settings.appwrite_api_key:
            client.set_key(settings.appwrite_api_key)
        _appwrite_client = client
    return _appwrite_client


def get_appwrite_databases(settings: AppSettings | None = None) -> Databases:
    """Get or create singleton Appwrite Databases service."""
    global _databases_service
    if _databases_service is None:
        client = get_appwrite_client(settings)
        _databases_service = Databases(client)
    return _databases_service


def get_appwrite_storage(settings: AppSettings | None = None) -> Storage:
    """Get or create singleton Appwrite Storage service."""
    global _storage_service
    if _storage_service is None:
        client = get_appwrite_client(settings)
        _storage_service = Storage(client)
    return _storage_service


async def save_course_to_appwrite(
    generation_id: str,
    course_data: dict[str, Any],
    user_id: str,
    metadata_data: dict[str, Any] | None = None,
    settings: AppSettings | None = None,
) -> dict[str, Any] | None:
    """Persist generated course into Appwrite with user-level security permissions.
    
    Ensures that only the authenticated user can read or modify the course.
    """
    if settings is None:
        settings = get_settings()

    if not settings.appwrite_api_key:
        logger.debug("Appwrite API key not configured; skipping backend Appwrite sync.")
        return None

    try:
        db = get_appwrite_databases(settings)

        # Idempotence: check if course with this generation_id and user_id is already stored
        try:
            from appwrite.query import Query

            existing = db.list_documents(
                database_id=settings.appwrite_database_id,
                collection_id=settings.appwrite_courses_collection_id,
                queries=[
                    Query.equal("courseId", generation_id),
                    Query.equal("userId", user_id),
                    Query.limit(1),
                ],
            )
            existing_docs = getattr(existing, "documents", [])
            if existing_docs:
                first = existing_docs[0]
                doc_dict = first.to_dict() if hasattr(first, "to_dict") else (first if isinstance(first, dict) else {})
                logger.info(
                    "Course already exists in Appwrite: doc_id=%s generation_id=%s",
                    doc_dict.get("$id"),
                    generation_id,
                )
                return doc_dict
        except Exception as check_err:
            logger.debug("Existing course check skipped: %s", check_err)

        # Prepare course payload
        modules_json = json.dumps(course_data.get("modules", []))
        # Ensure modules fits within text bounds
        if len(modules_json) > 65000:
            modules_json = modules_json[:65000]

        learning_objs_json = json.dumps(course_data.get("learning_objectives", []))
        if len(learning_objs_json) > 4000:
            learning_objs_json = learning_objs_json[:4000]

        prereqs_json = json.dumps(course_data.get("prerequisites", []))
        if len(prereqs_json) > 4000:
            prereqs_json = prereqs_json[:4000]

        meta_json = json.dumps(metadata_data or {})
        if len(meta_json) > 2000:
            meta_json = meta_json[:2000]

        doc_data = {
            "courseId": generation_id,
            "userId": user_id,
            "title": course_data.get("course_title", "Custom AI Course")[:255],
            "description": (course_data.get("description") or "")[:4000],
            "difficulty": (course_data.get("difficulty") or "beginner")[:32],
            "topic": (course_data.get("topic") or course_data.get("course_title") or "Technical Topic")[:255],
            "targetAudience": (course_data.get("target_audience") or "general learners")[:255],
            "language": (course_data.get("language") or "en")[:16],
            "learningObjectives": learning_objs_json,
            "prerequisites": prereqs_json,
            "modules": modules_json,
            "metadata": meta_json,
            "status": "completed",
        }

        # Document-level security: only owner has read/write permissions
        permissions = [
            Permission.read(Role.user(user_id)),
            Permission.update(Role.user(user_id)),
            Permission.delete(Role.user(user_id)),
        ]

        document = db.create_document(
            database_id=settings.appwrite_database_id,
            collection_id=settings.appwrite_courses_collection_id,
            document_id="unique()",
            data=doc_data,
            permissions=permissions,
        )

        doc_dict = document.to_dict() if hasattr(document, "to_dict") else (document if isinstance(document, dict) else {})
        doc_id = doc_dict.get("$id") or getattr(document, "id", "created")

        logger.info(
            "Course successfully persisted to Appwrite: doc_id=%s user_id=%s generation_id=%s",
            doc_id,
            user_id,
            generation_id,
        )
        return doc_dict

    except Exception as exc:
        logger.error("Failed to persist course to Appwrite: %s", exc)
        return None


async def save_assessment_to_appwrite(
    assessment_data: dict[str, Any],
    user_id: str,
    settings: AppSettings | None = None,
) -> dict[str, Any] | None:
    """Persist completed skill assessment into Appwrite with user document security."""
    if settings is None:
        settings = get_settings()

    if not settings.appwrite_api_key:
        return None

    try:
        db = get_appwrite_databases(settings)

        # Full JSON serialization with safe length bounds up to 65000 (attribute max: 65535)
        skills_summary = json.dumps(assessment_data.get("skills", []))
        if len(skills_summary) > 65000:
            skills_summary = skills_summary[:65000]

        raw_evidence = json.dumps(assessment_data.get("raw_evidence", {}))
        if len(raw_evidence) > 65000:
            raw_evidence = raw_evidence[:65000]

        gap_analysis = json.dumps(assessment_data.get("gaps", []))
        if len(gap_analysis) > 65000:
            gap_analysis = gap_analysis[:65000]

        doc_data = {
            "assessmentId": assessment_data.get("assessment_id", "")[:64],
            "userId": user_id,
            "targetOccupation": assessment_data.get("target_occupation_title", "")[:128],
            "overallScore": str(assessment_data.get("overall_score", 0))[:16],
            "overallConfidence": str(assessment_data.get("overall_confidence", 0))[:16],
            "skillsSummary": skills_summary,
            "rawEvidence": raw_evidence,
            "gapAnalysis": gap_analysis,
            "createdAt": assessment_data.get("created_at", "")[:64],
        }

        permissions = [
            Permission.read(Role.user(user_id)),
            Permission.update(Role.user(user_id)),
            Permission.delete(Role.user(user_id)),
        ]

        document = db.create_document(
            database_id=settings.appwrite_database_id,
            collection_id=settings.appwrite_assessments_collection_id,
            document_id="unique()",
            data=doc_data,
            permissions=permissions,
        )

        doc_dict = document.to_dict() if hasattr(document, "to_dict") else (document if isinstance(document, dict) else {})
        logger.info(
            "Assessment persisted to Appwrite: doc_id=%s user_id=%s asmt_id=%s",
            doc_dict.get("$id"),
            user_id,
            assessment_data.get("assessment_id"),
        )
        return doc_dict

    except Exception as exc:
        logger.error("Failed to persist assessment to Appwrite: %s", exc)
        return None


async def update_profile_skills_in_appwrite(
    user_id: str,
    strong_skills: list[str],
    weak_skills: list[str],
    developing_skills: list[str],
    insufficient_evidence_skills: list[str],
    skills_map: dict[str, Any],
    settings: AppSettings | None = None,
) -> bool:
    """Update user's profile document with latest evaluated skills and assessment status."""
    if settings is None:
        settings = get_settings()

    if not settings.appwrite_api_key:
        return False

    try:
        from appwrite.query import Query

        db = get_appwrite_databases(settings)
        # Find user's profile document by userId
        res = db.list_documents(
            database_id=settings.appwrite_database_id,
            collection_id=settings.appwrite_profiles_collection_id,
            queries=[Query.equal("userId", user_id)],
        )

        docs = getattr(res, "documents", None) or (res.get("documents") if isinstance(res, dict) else [])
        if not docs:
            logger.warning("No profile document found to update skills for user_id=%s", user_id)
            return False

        doc = docs[0]
        doc_id = doc.id if hasattr(doc, "id") else doc.get("$id")

        update_payload = {
            "strongSkills": json.dumps(strong_skills)[:2000],
            "weakSkills": json.dumps(weak_skills)[:2000],
            "developingSkills": json.dumps(developing_skills)[:2000],
            "insufficientEvidenceSkills": json.dumps(insufficient_evidence_skills)[:2000],
            "skillProfile": json.dumps(skills_map)[:4000],
            "assessmentStatus": "completed",
        }

        db.update_document(
            database_id=settings.appwrite_database_id,
            collection_id=settings.appwrite_profiles_collection_id,
            document_id=doc_id,
            data=update_payload,
        )
        logger.info("Updated profile skills in Appwrite for user_id=%s doc_id=%s", user_id, doc_id)
        return True

    except Exception as exc:
        logger.error("Failed to update profile skills in Appwrite: %s", exc)
        return False

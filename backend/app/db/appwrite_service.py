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

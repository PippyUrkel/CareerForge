"""Appwrite Schema & Storage Initialization for CareerForge."""

import os
import sys
import time
import httpx

APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT", "http://localhost/v1")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID", "6abfe1b1000b09b7c5b6")
APPWRITE_API_KEY = os.getenv(
    "APPWRITE_API_KEY",
    "standard_df6bf4b733cab874331ac869b4ed31bbcba541b711a9084c5b2efbdf571f10450dd9f40cfac1966d85f6a8e27ffdfccfdec8125d7a4a279e62bc753baabfc3b918ba01707409e72c50791a9850e48d1fc64c5ebac00dc63cbe0ef8a10fe4f4f6e7967f8f7af5eb528d3885cc0331c0f019cba768a2b9e30cec1aed36f521336d",
)
DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID", "careerforge_db")
PROFILES_COLLECTION_ID = os.getenv("APPWRITE_PROFILES_COLLECTION_ID", "profiles")
COURSES_COLLECTION_ID = os.getenv("APPWRITE_COURSES_COLLECTION_ID", "courses")
BUCKET_ID = os.getenv("APPWRITE_BUCKET_ID", "resumes")


def get_client() -> httpx.Client:
    return httpx.Client(
        base_url=APPWRITE_ENDPOINT,
        headers={
            "X-Appwrite-Project": APPWRITE_PROJECT_ID,
            "X-Appwrite-Key": APPWRITE_API_KEY,
            "Content-Type": "application/json",
        },
        timeout=30.0,
    )


def ensure_database(client: httpx.Client):
    r = client.get(f"/databases/{DATABASE_ID}")
    if r.status_code == 200:
        print(f"Database '{DATABASE_ID}' exists.")
        return
    print(f"Creating database '{DATABASE_ID}'...")
    r = client.post(
        "/databases",
        json={"databaseId": DATABASE_ID, "name": "CareerForge Database", "enabled": True},
    )
    if r.status_code in (200, 201):
        print(f"Database '{DATABASE_ID}' created successfully.")
    else:
        print(f"Database creation response: {r.status_code} {r.text}")


def ensure_collection(client: httpx.Client, collection_id: str, name: str):
    r = client.get(f"/databases/{DATABASE_ID}/collections/{collection_id}")
    if r.status_code == 200:
        print(f"Collection '{collection_id}' exists.")
        return
    print(f"Creating collection '{collection_id}' ({name})...")
    r = client.post(
        f"/databases/{DATABASE_ID}/collections",
        json={
            "collectionId": collection_id,
            "name": name,
            "permissions": [
                'read("users")',
                'create("users")',
                'update("users")',
                'delete("users")',
            ],
            "documentSecurity": True,
            "enabled": True,
        },
    )
    if r.status_code in (200, 201):
        print(f"Collection '{collection_id}' created successfully.")
    else:
        print(f"Collection creation response: {r.status_code} {r.text}")


def ensure_string_attribute(
    client: httpx.Client,
    collection_id: str,
    key: str,
    size: int,
    required: bool = False,
    default: str | None = None,
):
    r = client.get(f"/databases/{DATABASE_ID}/collections/{collection_id}/attributes/{key}")
    if r.status_code == 200:
        return
    payload = {"key": key, "size": size, "required": required}
    if not required and default is not None:
        payload["default"] = default
    r = client.post(
        f"/databases/{DATABASE_ID}/collections/{collection_id}/attributes/string",
        json=payload,
    )
    if r.status_code in (200, 201, 202):
        print(f"  + Added string attribute '{key}' to '{collection_id}'")
    else:
        print(f"  ! Attribute '{key}' error: {r.status_code} {r.text}")


def ensure_boolean_attribute(
    client: httpx.Client,
    collection_id: str,
    key: str,
    required: bool = False,
    default: bool = False,
):
    r = client.get(f"/databases/{DATABASE_ID}/collections/{collection_id}/attributes/{key}")
    if r.status_code == 200:
        return
    payload = {"key": key, "required": required, "default": default}
    r = client.post(
        f"/databases/{DATABASE_ID}/collections/{collection_id}/attributes/boolean",
        json=payload,
    )
    if r.status_code in (200, 201, 202):
        print(f"  + Added boolean attribute '{key}' to '{collection_id}'")
    else:
        print(f"  ! Attribute '{key}' error: {r.status_code} {r.text}")


def ensure_index(
    client: httpx.Client,
    collection_id: str,
    key: str,
    index_type: str,
    attributes: list[str],
):
    r = client.get(f"/databases/{DATABASE_ID}/collections/{collection_id}/indexes/{key}")
    if r.status_code == 200:
        return
    payload = {"key": key, "type": index_type, "attributes": attributes}
    r = client.post(
        f"/databases/{DATABASE_ID}/collections/{collection_id}/indexes",
        json=payload,
    )
    if r.status_code in (200, 201, 202):
        print(f"  + Added index '{key}' to '{collection_id}'")
    else:
        print(f"  ! Index '{key}' info: {r.status_code} {r.text}")


def ensure_bucket(client: httpx.Client, bucket_id: str, name: str):
    r = client.get(f"/storage/buckets/{bucket_id}")
    if r.status_code == 200:
        print(f"Bucket '{bucket_id}' exists.")
        return
    print(f"Creating storage bucket '{bucket_id}'...")
    r = client.post(
        "/storage/buckets",
        json={
            "bucketId": bucket_id,
            "name": name,
            "permissions": [
                'read("users")',
                'create("users")',
                'update("users")',
                'delete("users")',
            ],
            "fileSecurity": True,
            "enabled": True,
            "maximumFileSize": 10485760,  # 10 MB
            "allowedFileExtensions": ["pdf", "doc", "docx", "txt"],
        },
    )
    if r.status_code in (200, 201):
        print(f"Bucket '{bucket_id}' created successfully.")
    else:
        print(f"Bucket creation response: {r.status_code} {r.text}")


def wait_for_attributes(client: httpx.Client, collection_id: str, max_seconds: int = 15):
    start = time.time()
    while time.time() - start < max_seconds:
        r = client.get(f"/databases/{DATABASE_ID}/collections/{collection_id}/attributes")
        if r.status_code == 200:
            attrs = r.json().get("attributes", [])
            processing = [a["key"] for a in attrs if a.get("status") == "processing"]
            if not processing:
                print(f"All attributes for '{collection_id}' are available.")
                return
            print(f"Waiting for attributes in '{collection_id}': {processing}...")
        time.sleep(1)


def main():
    client = get_client()

    print("=== Initializing Appwrite Schema for CareerForge ===")
    ensure_database(client)

    # 1. Profiles Collection
    ensure_collection(client, PROFILES_COLLECTION_ID, "User Profiles")
    ensure_string_attribute(client, PROFILES_COLLECTION_ID, "userId", size=36, required=True)
    ensure_string_attribute(client, PROFILES_COLLECTION_ID, "name", size=128, required=True)
    ensure_string_attribute(client, PROFILES_COLLECTION_ID, "email", size=256, required=True)
    ensure_boolean_attribute(client, PROFILES_COLLECTION_ID, "onboardingCompleted", required=False, default=False)
    ensure_string_attribute(client, PROFILES_COLLECTION_ID, "targetRole", size=128, required=False, default="")
    ensure_string_attribute(client, PROFILES_COLLECTION_ID, "targetCareer", size=128, required=False, default="")
    ensure_string_attribute(client, PROFILES_COLLECTION_ID, "experienceLevel", size=64, required=False, default="beginner")
    ensure_string_attribute(client, PROFILES_COLLECTION_ID, "strongSkills", size=2000, required=False, default="[]")
    ensure_string_attribute(client, PROFILES_COLLECTION_ID, "weakSkills", size=2000, required=False, default="[]")
    ensure_string_attribute(client, PROFILES_COLLECTION_ID, "skillProfile", size=4000, required=False, default="{}")
    ensure_string_attribute(client, PROFILES_COLLECTION_ID, "assessmentStatus", size=64, required=False, default="pending")
    ensure_string_attribute(client, PROFILES_COLLECTION_ID, "primaryGoals", size=1000, required=False, default="")
    ensure_string_attribute(client, PROFILES_COLLECTION_ID, "resumeFileId", size=64, required=False, default="")

    wait_for_attributes(client, PROFILES_COLLECTION_ID)
    ensure_index(client, PROFILES_COLLECTION_ID, "idx_userId", "key", ["userId"])

    # 2. Courses Collection
    ensure_collection(client, COURSES_COLLECTION_ID, "User Courses")
    ensure_string_attribute(client, COURSES_COLLECTION_ID, "courseId", size=64, required=True)
    ensure_string_attribute(client, COURSES_COLLECTION_ID, "userId", size=36, required=True)
    ensure_string_attribute(client, COURSES_COLLECTION_ID, "title", size=256, required=True)
    ensure_string_attribute(client, COURSES_COLLECTION_ID, "description", size=4000, required=False, default="")
    ensure_string_attribute(client, COURSES_COLLECTION_ID, "difficulty", size=32, required=False, default="beginner")
    ensure_string_attribute(client, COURSES_COLLECTION_ID, "topic", size=256, required=True)
    ensure_string_attribute(client, COURSES_COLLECTION_ID, "targetAudience", size=256, required=False, default="")
    ensure_string_attribute(client, COURSES_COLLECTION_ID, "language", size=16, required=False, default="en")
    ensure_string_attribute(client, COURSES_COLLECTION_ID, "learningObjectives", size=4000, required=False, default="[]")
    ensure_string_attribute(client, COURSES_COLLECTION_ID, "prerequisites", size=4000, required=False, default="[]")
    ensure_string_attribute(client, COURSES_COLLECTION_ID, "modules", size=65535, required=False, default="[]")
    ensure_string_attribute(client, COURSES_COLLECTION_ID, "metadata", size=2000, required=False, default="{}")
    ensure_string_attribute(client, COURSES_COLLECTION_ID, "status", size=32, required=False, default="completed")

    wait_for_attributes(client, COURSES_COLLECTION_ID)
    ensure_index(client, COURSES_COLLECTION_ID, "idx_course_userId", "key", ["userId"])
    ensure_index(client, COURSES_COLLECTION_ID, "idx_course_courseId", "key", ["courseId"])

    # 3. Storage Bucket
    ensure_bucket(client, BUCKET_ID, "User Resumes")

    print("=== Appwrite Schema setup completed successfully! ===")


if __name__ == "__main__":
    main()

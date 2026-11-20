"""API endpoints for the full ESCO occupation and skill catalogue."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.skills.esco_catalog import get_esco_catalog

router = APIRouter(prefix="/api/esco", tags=["ESCO career catalogue"])


class StudentSkillsRequest(BaseModel):
    skills: list[str] = Field(min_length=1, description="Student skill names from their profile/resume")
    limit: int = Field(default=10, ge=1, le=50)


@router.get("/health")
async def esco_health():
    try:
        counts = get_esco_catalog().load()
        return {"status": "loaded", **counts}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))


@router.get("/occupations/search")
async def search_occupations(q: str = Query(min_length=2), limit: int = Query(default=20, ge=1, le=50)):
    try:
        return {"results": get_esco_catalog().search(q, limit)}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))


@router.post("/recommend")
async def recommend_careers(request: StudentSkillsRequest):
    try:
        results = await get_esco_catalog().recommend(request.skills, request.limit)
        return {"recommendations": results, "input_skills": request.skills}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))


@router.post("/skill-gap")
async def analyse_skill_gap(
    occupation_uri: str = Query(min_length=5),
    request: StudentSkillsRequest = ...,
):
    try:
        result = await get_esco_catalog().gap(occupation_uri, request.skills)
        if result is None:
            raise HTTPException(status_code=404, detail="ESCO occupation URI not found or has no linked skills.")
        return result
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

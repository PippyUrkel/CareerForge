"""Taxonomy models for course structure."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, model_validator


class TaxonomyConcept(BaseModel):
    """A single concept within a module."""

    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., description="Concept name")
    description: str | None = Field(default=None, description="Brief concept description")


class TaxonomyModule(BaseModel):
    """A single module in the course taxonomy."""

    model_config = ConfigDict(from_attributes=True)

    title: str = Field(..., description="Module title")
    description: str = Field(..., description="Module description")
    order: int = Field(..., description="Module ordering (1-indexed)")
    keywords: list[str] = Field(default_factory=list, description="Search keywords for this module")
    concepts: list[TaxonomyConcept] = Field(default_factory=list, description="Concepts covered")
    learning_objectives: list[str] = Field(default_factory=list, description="Module-level learning objectives")
    search_queries: list[str] = Field(default_factory=list, description="Generated search queries")


class CourseTaxonomy(BaseModel):
    """The full course taxonomy produced by the LLM."""

    model_config = ConfigDict(from_attributes=True)

    course_title: str = Field(..., description="Course title")
    course_description: str = Field(..., description="Course description")
    difficulty: str = Field(..., description="Difficulty level")
    language: str = Field(..., description="Course language")
    learning_objectives: list[str] = Field(..., description="Course-level learning objectives")
    prerequisites: list[str] = Field(default_factory=list, description="Prerequisites")
    modules: list[TaxonomyModule] = Field(..., description="Course modules")

    @model_validator(mode="after")
    def validate_modules_not_empty(self) -> CourseTaxonomy:
        if not self.modules:
            raise ValueError("Modules list must not be empty")
        return self

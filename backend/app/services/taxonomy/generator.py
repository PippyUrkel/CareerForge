"""Taxonomy generation service using an LLM."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from pydantic import BaseModel, Field

from app.schemas.taxonomy import CourseTaxonomy, TaxonomyConcept, TaxonomyModule
from app.services.llm.base import LLMProvider

if TYPE_CHECKING:
    from app.schemas.course_request import CourseGenerationRequest

logger = logging.getLogger(__name__)


class _LLMTaxonomyOutput(BaseModel):
    """Internal Pydantic model for validating raw LLM taxonomy output."""

    course_title: str = Field(..., description="Generated course title")
    course_description: str = Field(..., description="Generated course description")
    learning_objectives: list[str] = Field(
        default_factory=list, description="Overall course learning objectives"
    )
    modules: list[_LLMModuleOutput] = Field(
        ..., description="List of course modules in order"
    )


class _LLMModuleOutput(BaseModel):
    """Internal model for a single module from the LLM."""

    title: str
    description: str
    keywords: list[str] = Field(default_factory=list)
    concepts: list[_LLMConceptOutput] = Field(default_factory=list)
    learning_objectives: list[str] = Field(default_factory=list)


class _LLMConceptOutput(BaseModel):
    """Internal model for a concept from the LLM."""

    name: str
    description: str | None = None


# Rebuild models to resolve forward references
_LLMTaxonomyOutput.model_rebuild()


class ModuleQueriesOutput(BaseModel):
    """Output model for a single module's search queries."""

    module_title: str
    queries: list[str]

class BatchSearchQueriesOutput(BaseModel):
    """LLM output for batch search query generation."""

    module_queries: list[ModuleQueriesOutput]


class TaxonomyGenerator:
    """Generates course taxonomies using an LLM provider.

    Responsible for:
    - Generating course structure (modules, concepts, objectives)
    - Generating search queries for video retrieval
    - Respecting user-provided constraints (forced titles, objectives, etc.)
    """

    def __init__(self, llm: LLMProvider) -> None:
        self._llm = llm

    async def generate_taxonomy(
        self, request: CourseGenerationRequest
    ) -> CourseTaxonomy:
        """Generate a course taxonomy from the generation request.

        If the user provides a course_title, course_description, or
        learning_objectives, those are passed through to the LLM prompt
        so the generated taxonomy respects them.

        Args:
            request: The full course generation request.

        Returns:
            A validated CourseTaxonomy.
        """
        logger.info(
            "Generating taxonomy for topic=%s, target_modules=%d",
            request.topic,
            request.module_config.target_modules,
        )

        prompt = self._build_taxonomy_prompt(request)
        system_prompt = (
            "You are an expert curriculum designer. You create well-structured "
            "course taxonomies with clear learning progressions. Always respond "
            "with valid JSON matching the required schema."
        )

        llm_output = await self._llm.generate_structured(
            prompt=prompt,
            response_model=_LLMTaxonomyOutput,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=4096,
        )

        # Convert LLM output to our domain model
        taxonomy = self._convert_to_taxonomy(llm_output, request)

        logger.info(
            "Taxonomy generated: title=%s, modules=%d, objectives=%d",
            taxonomy.course_title,
            len(taxonomy.modules),
            len(taxonomy.learning_objectives),
        )

        return taxonomy

    async def generate_search_queries_batch(
        self,
        modules: list[TaxonomyModule],
        request: CourseGenerationRequest,
    ) -> dict[str, list[str]]:
        """Generate search queries for multiple modules in a single LLM call.

        Args:
            modules: The taxonomy modules to generate queries for.
            request: The full generation request for context.

        Returns:
            A dictionary mapping module title to a list of search query strings.
        """
        queries_per_module = request.search_config.queries_per_module

        prompt = (
            f"Generate exactly {queries_per_module} YouTube search queries for EACH of the following course modules "
            f"to find educational videos.\n\n"
            f"Course topic: {request.topic}\n"
            f"Target audience: {request.target_audience}\n"
            f"Difficulty level: {request.difficulty}\n"
            f"Language: {request.language}\n\n"
        )

        for i, module in enumerate(modules):
            prompt += f"Module {i+1}:\n"
            prompt += f"  Title: {module.title}\n"
            prompt += f"  Description: {module.description}\n"
            if module.keywords:
                prompt += f"  Keywords: {', '.join(module.keywords)}\n"
            if module.learning_objectives:
                prompt += f"  Learning objectives: {', '.join(module.learning_objectives)}\n"
            prompt += "\n"

        prompt += (
            "Generate diverse queries that would surface high-quality educational "
            "videos. Include a mix of specific and general queries. "
            "Each query should be a natural YouTube search string."
        )

        system_prompt = (
            "You are an expert at crafting search queries for finding educational "
            "video content. Respond with valid JSON matching the required schema."
        )

        result = await self._llm.generate_structured(
            prompt=prompt,
            response_model=BatchSearchQueriesOutput,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=4096,
        )

        queries_map = {}
        for mq in result.module_queries:
            queries_map[mq.module_title] = mq.queries[:queries_per_module]
            logger.debug(
                "Generated %d search queries for module=%s",
                len(mq.queries),
                mq.module_title,
            )

        return queries_map

    def _build_taxonomy_prompt(self, request: CourseGenerationRequest) -> str:
        """Build the taxonomy generation prompt from the request."""
        parts: list[str] = []

        parts.append(f"Create a structured course taxonomy for the topic: {request.topic}")
        parts.append("")

        # Course identity
        if request.course_title:
            parts.append(f"Course title (use this exactly): {request.course_title}")
        else:
            parts.append("Generate an appropriate course title.")

        if request.course_description:
            parts.append(
                f"Course description (use this as a basis): {request.course_description}"
            )
        else:
            parts.append("Generate a concise course description (2-3 sentences).")

        parts.append("")

        # Audience and difficulty
        parts.append(f"Target audience: {request.target_audience}")
        parts.append(f"Difficulty level: {request.difficulty}")
        parts.append(f"Language: {request.language}")

        if request.tone:
            parts.append(f"Tone: {request.tone}")
        if request.teaching_style:
            parts.append(f"Teaching style: {request.teaching_style}")
        if request.domain:
            parts.append(f"Domain: {request.domain}")
        if request.region:
            parts.append(f"Region: {request.region}")

        parts.append("")

        # Module constraints
        mc = request.module_config
        parts.append(f"Number of modules: exactly {mc.target_modules} modules")
        parts.append(f"  (minimum: {mc.min_modules}, maximum: {mc.max_modules})")
        parts.append(
            f"Concepts per module: {mc.min_concepts_per_module} to {mc.max_concepts_per_module}"
        )

        if mc.force_module_titles:
            parts.append("")
            parts.append("You MUST use the following module titles (in this order):")
            for i, title in enumerate(mc.force_module_titles, 1):
                parts.append(f"  {i}. {title}")

        parts.append("")

        # Learning objectives
        if request.learning_objectives:
            parts.append("The course MUST cover these learning objectives:")
            for obj in request.learning_objectives:
                parts.append(f"  - {obj}")
            parts.append(
                "Ensure every objective is addressed by at least one module."
            )
        else:
            parts.append(
                "Generate 4-8 clear, measurable learning objectives for this course."
            )

        if request.prerequisites:
            parts.append("")
            parts.append("Prerequisites:")
            for prereq in request.prerequisites:
                parts.append(f"  - {prereq}")

        parts.append("")
        parts.append(
            "For each module, provide:\n"
            "  - A clear title\n"
            "  - A description (2-3 sentences)\n"
            "  - 3-6 relevant keywords for video search\n"
            "  - 2-5 key concepts covered\n"
            "  - 1-3 specific learning objectives"
        )

        parts.append("")
        parts.append(
            "Order modules logically from foundational to advanced topics. "
            "Ensure a natural learning progression."
        )

        return "\n".join(parts)

    def _convert_to_taxonomy(
        self,
        llm_output: _LLMTaxonomyOutput,
        request: CourseGenerationRequest,
    ) -> CourseTaxonomy:
        """Convert LLM output to a validated CourseTaxonomy."""
        # Use user-provided values if available, otherwise use LLM output
        course_title = request.course_title or llm_output.course_title
        course_description = (
            request.course_description or llm_output.course_description
        )
        learning_objectives = (
            request.learning_objectives or llm_output.learning_objectives
        )

        modules = [
            TaxonomyModule(
                title=m.title,
                description=m.description,
                order=i + 1,
                keywords=m.keywords,
                concepts=[
                    TaxonomyConcept(name=c.name, description=c.description)
                    for c in m.concepts
                ],
                learning_objectives=m.learning_objectives,
            )
            for i, m in enumerate(llm_output.modules)
        ]

        return CourseTaxonomy(
            course_title=course_title,
            course_description=course_description,
            difficulty=request.difficulty,
            language=request.language,
            learning_objectives=learning_objectives,
            prerequisites=request.prerequisites or [],
            modules=modules,
        )

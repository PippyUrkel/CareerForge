"""Course assembly service — builds the final course response."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from app.schemas.course import (
    Course,
    CourseModule,
    CourseVideo,
)
from app.schemas.taxonomy import CourseTaxonomy
from app.schemas.video import ScoredVideo

if TYPE_CHECKING:
    from app.schemas.course_request import CourseGenerationRequest

logger = logging.getLogger(__name__)


class CourseAssemblyService:
    """Assembles the final course from taxonomy + ranked videos.

    Combines:
    - Course taxonomy (structure, titles, descriptions)
    - Ranked/selected videos (per module)
    - User preferences (difficulty, audience, etc.)

    Into a validated Course response.
    """

    def assemble(
        self,
        taxonomy: CourseTaxonomy,
        module_videos: dict[str, list[ScoredVideo]],
        request: CourseGenerationRequest,
    ) -> Course:
        """Assemble the final course.

        Args:
            taxonomy: The generated course taxonomy.
            module_videos: Mapping of module title → selected scored videos.
            request: The original generation request for user preferences.

        Returns:
            A validated Course object.
        """
        logger.info("Assembling course: %s", taxonomy.course_title)

        modules: list[CourseModule] = []

        for module in taxonomy.modules:
            videos = module_videos.get(module.title, [])
            course_videos = [
                CourseVideo(
                    video_id=v.id,
                    source=v.source,
                    title=v.title,
                    url=v.url,
                    channel_name=v.channel_name,
                    duration_seconds=v.duration_seconds,
                    difficulty=v.detected_difficulty,
                    difficulty_confidence=(
                        round(v.difficulty_confidence, 2)
                        if v.difficulty_confidence > 0
                        else None
                    ),
                    relevance_score=round(v.final_score, 4),
                    order=i + 1,
                )
                for i, v in enumerate(videos)
            ]

            course_module = CourseModule(
                title=module.title,
                description=module.description,
                order=module.order,
                learning_objectives=module.learning_objectives,
                videos=course_videos,
            )
            modules.append(course_module)

        course = Course(
            course_title=taxonomy.course_title,
            description=taxonomy.course_description,
            difficulty=taxonomy.difficulty,
            language=taxonomy.language,
            learning_objectives=taxonomy.learning_objectives,
            prerequisites=taxonomy.prerequisites,
            target_audience=request.target_audience,
            modules=modules,
        )

        total_videos = sum(len(m.videos) for m in modules)
        logger.info(
            "Course assembled: %d modules, %d total videos",
            len(modules),
            total_videos,
        )

        return course

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Route } from "./+types/generator";
import { StudioLayout } from "../components/UdemyLayout";
import { CourseSidebar, type Module, type Video } from "../components/CourseSidebar";
import { VideoPlayer } from "../components/VideoPlayer";
import { CourseOverview } from "../components/CourseOverview";
import { GenerationModal } from "../components/GenerationModal";
import { CourseLibraryModal, type StoredCourseItem } from "../components/CourseLibraryModal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CareerForge | AI Educational Course Studio" },
    { name: "description", content: "AI Powered Course Generation & Interactive Learning Studio" },
  ];
}

// Fallback demo course dataset if the database is initially empty or offline
const DEFAULT_MODULES: Module[] = [
  {
    id: "m-1",
    title: "Getting Started & Course Overview",
    videos: [
      {
        id: "v-1-1",
        title: "1. Welcome & Learning Roadmap",
        thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg",
        duration: "4:15",
        author: "CareerForge Instructor",
        videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8"
      },
      {
        id: "v-1-2",
        title: "2. Core Principles & Environment Setup",
        thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg",
        duration: "8:30",
        author: "CareerForge Instructor",
        videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8"
      },
      {
        id: "v-1-3",
        title: "3. First Practical Code Walkthrough",
        thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg",
        duration: "11:20",
        author: "CareerForge Instructor",
        videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8"
      }
    ]
  },
  {
    id: "m-2",
    title: "Core Language Fundamentals & Syntax",
    videos: [
      {
        id: "v-2-1",
        title: "4. Variables, Data Types & Control Flow",
        thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg",
        duration: "14:45",
        author: "CareerForge Instructor",
        videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8"
      },
      {
        id: "v-2-2",
        title: "5. Working with Functions & Data Collections",
        thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg",
        duration: "9:10",
        author: "CareerForge Instructor",
        videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8"
      }
    ]
  },
  {
    id: "m-3",
    title: "Applied Projects & Industry Best Practices",
    videos: [
      {
        id: "v-3-1",
        title: "6. Building Modular Components & Packages",
        thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg",
        duration: "12:05",
        author: "CareerForge Instructor",
        videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8"
      },
      {
        id: "v-3-2",
        title: "7. Testing, Optimization & Final Review",
        thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg",
        duration: "15:40",
        author: "CareerForge Instructor",
        videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8"
      }
    ]
  }
];

/**
 * Transforms an API course response from the backend into frontend Module and CourseMeta structures.
 */
function formatApiCourse(apiCourse: any) {
  const mappedModules: Module[] = (apiCourse.modules || []).map((m: any, mIndex: number) => ({
    id: `m-${mIndex}`,
    title: m.title,
    videos: (m.videos || []).map((v: any, vIndex: number) => {
      let thumbnail = "https://placehold.co/640x360/dce0e8/4c4f69?text=Lecture";
      if (v.source === 'youtube' && v.url) {
        try {
          const urlObj = new URL(v.url);
          const vid = urlObj.searchParams.get('v');
          if (vid) {
            thumbnail = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
          }
        } catch {
          // Ignore parsing errors
        }
      }
      const durSec = v.duration_seconds || 0;
      const durationStr = `${Math.floor(durSec / 60)}:${(durSec % 60).toString().padStart(2, '0')}`;

      return {
        id: v.video_id || `v-${mIndex}-${vIndex}`,
        title: v.title,
        thumbnail,
        duration: durationStr,
        author: v.channel_name || "Instructor",
        videoUrl: v.url
      };
    })
  }));

  const meta = {
    title: apiCourse.course_title || "Synthesized Curriculum",
    topic: apiCourse.description || "Core Domain Area",
    difficulty: apiCourse.difficulty || "beginner",
    targetAudience: apiCourse.target_audience || "Learners"
  };

  return { mappedModules, meta };
}

export default function GeneratorPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  const [savedCourses, setSavedCourses] = useState<StoredCourseItem[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string>('');

  const [modules, setModules] = useState<Module[]>(DEFAULT_MODULES);
  const [activeVideo, setActiveVideo] = useState<Video | null>(DEFAULT_MODULES[0].videos[0]);
  const [courseMeta, setCourseMeta] = useState({
    title: "Python Fundamentals & Applied Programming",
    topic: "Python Programming",
    difficulty: "beginner",
    targetAudience: "undergraduate students"
  });

  const totalLectures = modules.reduce((acc, m) => acc + m.videos.length, 0);

  // Fetch list of saved courses from careerforge.db on mount
  const fetchSavedCourses = useCallback(async (autoLoadFirst: boolean = false) => {
    setIsLoadingLibrary(true);
    try {
      const response = await fetch('http://localhost:8000/api/courses');
      if (response.ok) {
        const data = await response.json();
        const coursesList: StoredCourseItem[] = data.courses || [];
        setSavedCourses(coursesList);

        if (autoLoadFirst && coursesList.length > 0) {
          const firstCourse = coursesList[0];
          await loadCourseById(firstCourse.id || firstCourse.generation_id);
        }
      }
    } catch (err) {
      console.warn("Could not connect to backend course database:", err);
    } finally {
      setIsLoadingLibrary(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedCourses(true);
  }, [fetchSavedCourses]);

  // Load a specific course from the database by ID
  const loadCourseById = async (courseId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/courses/${courseId}`);
      if (!response.ok) {
        throw new Error(`Failed to load course: ${response.status}`);
      }

      const data = await response.json();
      if (data.course && data.course.modules) {
        const { mappedModules, meta } = formatApiCourse(data.course);
        setModules(mappedModules);
        setCourseMeta(meta);
        setActiveCourseId(courseId);

        if (mappedModules.length > 0 && mappedModules[0].videos.length > 0) {
          setActiveVideo(mappedModules[0].videos[0]);
        }
      }
    } catch (err) {
      console.error("Error loading course from database:", err);
    }
  };

  // Delete a course from the database
  const handleDeleteCourse = async (courseId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        const updated = savedCourses.filter(c => c.id !== courseId && c.generation_id !== courseId);
        setSavedCourses(updated);
        if (activeCourseId === courseId && updated.length > 0) {
          loadCourseById(updated[0].id || updated[0].generation_id);
        }
      }
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  };

  // Flattened video list for sequential Next / Previous navigation
  const allVideos = useMemo(() => {
    return modules.flatMap(m => m.videos);
  }, [modules]);

  const currentVideoIndex = useMemo(() => {
    if (!activeVideo) return -1;
    return allVideos.findIndex(v => v.id === activeVideo.id);
  }, [allVideos, activeVideo]);

  const hasPrevious = currentVideoIndex > 0;
  const hasNext = currentVideoIndex >= 0 && currentVideoIndex < allVideos.length - 1;

  const handlePreviousVideo = () => {
    if (hasPrevious) {
      setActiveVideo(allVideos[currentVideoIndex - 1]);
    }
  };

  const handleNextVideo = () => {
    if (hasNext) {
      setActiveVideo(allVideos[currentVideoIndex + 1]);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsGenerating(true);

    const title = (formData.get('course_title') as string) || 'Custom AI Course';
    const topic = (formData.get('topic') as string) || '';
    const difficulty = (formData.get('difficulty') as string) || 'beginner';
    const targetAudience = (formData.get('target_audience') as string) || 'undergraduate students';

    const payload = {
      course_title: title,
      difficulty,
      module_config: {
        target_modules: Number(formData.get('target_modules')) || 6
      },
      target_audience: targetAudience,
      topic,
      video_config: {
        target_duration_seconds: Number(formData.get('target_duration_seconds')) || 600,
        videos_per_module: Number(formData.get('videos_per_module')) || 3
      }
    };

    try {
      const response = await fetch('http://localhost:8000/api/courses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMsg = `API error: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.detail) {
            errorMsg = Array.isArray(errData.detail)
              ? errData.detail.map((d: any) => `${d.loc?.join('.')}: ${d.msg}`).join(', ')
              : String(errData.detail);
          }
        } catch {
          // ignore json parse error
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      if (data.course && data.course.modules) {
        const { mappedModules, meta } = formatApiCourse(data.course);

        setModules(mappedModules);
        setCourseMeta(meta);
        setActiveCourseId(data.generation_id || '');

        if (mappedModules.length > 0 && mappedModules[0].videos.length > 0) {
          setActiveVideo(mappedModules[0].videos[0]);
        }

        // Close the popup dialog smoothly after generation completes
        setIsModalOpen(false);

        // Refresh database course list
        fetchSavedCourses(false);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Failed to generate modules:", error);
      alert("Failed to generate modules. Check console or verify your backend is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <StudioLayout 
        courseTitle={courseMeta.title}
        onOpenGenerator={() => setIsModalOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        savedCoursesCount={savedCourses.length}
        mainContent={
          <div className="flex-1 flex flex-col w-full">
            {/* Top Video Streaming Canvas */}
            <VideoPlayer 
              video={activeVideo} 
              onOpenGenerator={() => setIsModalOpen(true)} 
              onPrevious={handlePreviousVideo}
              onNext={handleNextVideo}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
            />

            {/* Course Overview & Learning Workspace Below Player (Full Width) */}
            <CourseOverview 
              activeVideo={activeVideo}
              courseMeta={courseMeta}
              totalLectures={totalLectures}
            />
          </div>
        }
        sidebarContent={
          <CourseSidebar 
            modules={modules} 
            activeVideoId={activeVideo?.id}
            onVideoSelect={setActiveVideo}
            onOpenGenerator={() => setIsModalOpen(true)}
            onOpenLibrary={() => setIsLibraryOpen(true)}
          />
        } 
      />

      {/* Generator Popup Dialog */}
      <GenerationModal 
        isOpen={isModalOpen}
        onClose={() => !isGenerating && setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isGenerating={isGenerating}
      />

      {/* Database Stored Course Library Modal */}
      <CourseLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        courses={savedCourses}
        activeCourseId={activeCourseId}
        onSelectCourse={loadCourseById}
        onDeleteCourse={handleDeleteCourse}
        isLoading={isLoadingLibrary}
        onOpenGenerator={() => setIsModalOpen(true)}
      />
    </>
  );
}



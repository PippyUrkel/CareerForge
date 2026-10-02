import { useState, useEffect, useMemo, useCallback } from "react";
import type { Route } from "./+types/generator";
import { useSearchParams } from "react-router";
import { StudioLayout } from "../components/UdemyLayout";
import { CourseSidebar, type Module, type Video } from "../components/CourseSidebar";
import { VideoPlayer } from "../components/VideoPlayer";
import { CourseOverview } from "../components/CourseOverview";
import { GenerationModal } from "../components/GenerationModal";
import { CourseLibraryModal, type StoredCourseItem } from "../components/CourseLibraryModal";
import { useAuth } from "../context/AuthContext";
import {
  listUserCourses,
  saveUserCourse,
  deleteUserCourse,
  type AppwriteCourseDocument,
} from "../services/appwrite";

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
 * Transforms an API course response into frontend Module and CourseMeta structures.
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
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  const [savedCourses, setSavedCourses] = useState<StoredCourseItem[]>([]);
  const [appwriteCourseDocs, setAppwriteCourseDocs] = useState<AppwriteCourseDocument[]>([]);
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

  // Load a specific course from Appwrite documents or backend by ID
  const loadCourseById = useCallback(async (courseIdOrGenId: string | number) => {
    const idStr = String(courseIdOrGenId);

    // 1. Check if course document exists in cached Appwrite documents
    const matchingAppwriteDoc = appwriteCourseDocs.find(
      (c) => c.$id === idStr || c.courseId === idStr
    );

    if (matchingAppwriteDoc) {
      try {
        let parsedModules = [];
        try {
          parsedModules = JSON.parse(matchingAppwriteDoc.modules || "[]");
        } catch {
          parsedModules = [];
        }

        const apiFormat = {
          course_title: matchingAppwriteDoc.title,
          description: matchingAppwriteDoc.description,
          difficulty: matchingAppwriteDoc.difficulty,
          target_audience: matchingAppwriteDoc.targetAudience,
          modules: parsedModules,
        };

        const { mappedModules, meta } = formatApiCourse(apiFormat);
        setModules(mappedModules);
        setCourseMeta(meta);
        setActiveCourseId(matchingAppwriteDoc.courseId || idStr);

        if (mappedModules.length > 0 && mappedModules[0].videos.length > 0) {
          setActiveVideo(mappedModules[0].videos[0]);
        }
        return;
      } catch (err) {
        console.warn("Could not parse Appwrite course doc, falling back to API:", err);
      }
    }

    // 2. Fallback to backend API
    try {
      const response = await fetch(`http://localhost:8000/api/courses/${idStr}`);
      if (!response.ok) {
        throw new Error(`Failed to load course: ${response.status}`);
      }

      const data = await response.json();
      if (data.course && data.course.modules) {
        const { mappedModules, meta } = formatApiCourse(data.course);
        setModules(mappedModules);
        setCourseMeta(meta);
        setActiveCourseId(idStr);

        if (mappedModules.length > 0 && mappedModules[0].videos.length > 0) {
          setActiveVideo(mappedModules[0].videos[0]);
        }
      }
    } catch (err) {
      console.error("Error loading course from database:", err);
    }
  }, [appwriteCourseDocs]);

  // Fetch list of saved courses (from Appwrite if authenticated, or backend API)
  const fetchSavedCourses = useCallback(async (autoLoadId?: string | null) => {
    setIsLoadingLibrary(true);
    try {
      // 1. If user is authenticated, query their own courses in Appwrite
      if (user) {
        const appwriteDocs = await listUserCourses(user.$id);
        setAppwriteCourseDocs(appwriteDocs);

        if (appwriteDocs.length > 0) {
          const mappedCourses: StoredCourseItem[] = appwriteDocs.map((doc) => {
            let mCount = 0;
            let vCount = 0;
            let totalDur = 0;
            try {
              const pMods = JSON.parse(doc.modules || "[]");
              mCount = pMods.length;
              vCount = pMods.reduce((acc: number, m: any) => acc + (m.videos?.length || 0), 0);
              totalDur = pMods.reduce((acc: number, m: any) => 
                acc + (m.videos || []).reduce((vAcc: number, v: any) => vAcc + (v.duration_seconds || 0), 0), 0);
            } catch {
              // ignore
            }

            return {
              id: doc.$id as any,
              generation_id: doc.courseId,
              course_title: doc.title,
              topic: doc.topic,
              difficulty: doc.difficulty,
              target_audience: doc.targetAudience,
              module_count: mCount,
              video_count: vCount,
              total_duration_seconds: totalDur,
              created_at: doc.$createdAt,
              description: doc.description,
            };
          });

          setSavedCourses(mappedCourses);

          if (autoLoadId) {
            await loadCourseById(autoLoadId);
          } else if (mappedCourses.length > 0 && !activeCourseId) {
            await loadCourseById(mappedCourses[0].generation_id || mappedCourses[0].id!);
          }
          return;
        }
      }

      // 2. Fallback to backend database
      const response = await fetch("http://localhost:8000/api/courses");
      if (response.ok) {
        const data = await response.json();
        const coursesList: StoredCourseItem[] = data.courses || [];
        setSavedCourses(coursesList);

        if (autoLoadId) {
          await loadCourseById(autoLoadId);
        } else if (coursesList.length > 0 && !activeCourseId) {
          const firstCourse = coursesList[0];
          await loadCourseById(firstCourse.id ?? firstCourse.generation_id);
        }
      }
    } catch (err) {
      console.warn("Could not connect to course database:", err);
    } finally {
      setIsLoadingLibrary(false);
    }
  }, [user, activeCourseId, loadCourseById]);

  useEffect(() => {
    fetchSavedCourses(initialCourseId);
  }, [user, initialCourseId]); // refetch when auth state or target course changes

  // Delete a course
  const handleDeleteCourse = async (courseIdOrGenId: string | number) => {
    const idStr = String(courseIdOrGenId);

    // If doc exists in Appwrite, delete it from Appwrite
    const matchingAppwriteDoc = appwriteCourseDocs.find(
      (c) => c.$id === idStr || c.courseId === idStr
    );
    if (matchingAppwriteDoc) {
      try {
        await deleteUserCourse(matchingAppwriteDoc.$id);
      } catch (appwriteErr) {
        console.warn("Could not delete from Appwrite:", appwriteErr);
      }
    }

    // Also attempt deleting from backend database
    try {
      await fetch(`http://localhost:8000/api/courses/${idStr}`, { method: "DELETE" });
    } catch {
      // ignore
    }

    const updated = savedCourses.filter(
      (c) => String(c.id) !== idStr && c.generation_id !== idStr
    );
    setSavedCourses(updated);
    if (activeCourseId === idStr && updated.length > 0) {
      loadCourseById(updated[0].id ?? updated[0].generation_id);
    }
  };

  // Flattened video list for sequential Next / Previous navigation
  const allVideos = useMemo(() => {
    return modules.flatMap((m) => m.videos);
  }, [modules]);

  const currentVideoIndex = useMemo(() => {
    if (!activeVideo) return -1;
    return allVideos.findIndex((v) => v.id === activeVideo.id);
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

  // SUBMIT HANDLER: calls the SACRED existing course generation pipeline, then persists to Appwrite
  const handleSubmit = async (formData: FormData) => {
    setIsGenerating(true);

    const title = (formData.get("course_title") as string) || "Custom AI Course";
    const topic = (formData.get("topic") as string) || "";
    const difficulty = (formData.get("difficulty") as string) || "beginner";
    const targetAudience = (formData.get("target_audience") as string) || "undergraduate students";

    const payload = {
      course_title: title,
      difficulty,
      module_config: {
        target_modules: Number(formData.get("target_modules")) || 6,
      },
      target_audience: targetAudience,
      topic,
      user_id: user?.$id, // Associate with Appwrite user if authenticated
      video_config: {
        target_duration_seconds: Number(formData.get("target_duration_seconds")) || 600,
        videos_per_module: Number(formData.get("videos_per_module")) || 3,
      },
    };

    try {
      // 1. Call EXISTING SACRED pipeline
      const response = await fetch("http://localhost:8000/api/courses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = `API error: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.detail) {
            errorMsg = Array.isArray(errData.detail)
              ? errData.detail.map((d: any) => `${d.loc?.join(".")}: ${d.msg}`).join(", ")
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
        setActiveCourseId(data.generation_id || "");

        if (mappedModules.length > 0 && mappedModules[0].videos.length > 0) {
          setActiveVideo(mappedModules[0].videos[0]);
        }

        // 2. Persist to Appwrite if user is authenticated
        if (user) {
          try {
            await saveUserCourse(user.$id, {
              courseId: data.generation_id,
              title: data.course.course_title || title,
              description: data.course.description || topic,
              difficulty: data.course.difficulty || difficulty,
              topic: topic || data.course.course_title,
              targetAudience: data.course.target_audience || targetAudience,
              language: data.course.language || "en",
              learningObjectives: data.course.learning_objectives || [],
              prerequisites: data.course.prerequisites || [],
              modules: data.course.modules || [],
              metadata: data.metadata || {},
            });
          } catch (appwriteErr) {
            console.warn("Could not save to Appwrite:", appwriteErr);
          }
        }

        // Close dialog smoothly after generation completes
        setIsModalOpen(false);

        // Refresh course library
        fetchSavedCourses();
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error: any) {
      console.error("Failed to generate modules:", error);
      alert(`Failed to generate modules: ${error?.message || "Check backend connection."}`);
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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
            {/* Top Video Streaming Canvas */}
            <VideoPlayer 
              video={activeVideo} 
              onOpenGenerator={() => setIsModalOpen(true)} 
              onPrevious={handlePreviousVideo}
              onNext={handleNextVideo}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
            />

            {/* Course Overview & Learning Workspace Below Player */}
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

      {/* Database / Appwrite Stored Course Library Modal */}
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

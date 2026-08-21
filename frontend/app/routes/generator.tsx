import { useState } from "react";
import type { Route } from "./+types/generator";
import { UdemyLayout } from "../components/UdemyLayout";
import { CourseSidebar, type Module, type Video } from "../components/CourseSidebar";
import { VideoPlayer } from "../components/VideoPlayer";
import { CourseOverview } from "../components/CourseOverview";
import { GenerationModal } from "../components/GenerationModal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CareerForge | AI Educational Course Studio" },
    { name: "description", content: "AI Powered Course Generation & Learning Studio" },
  ];
}

// Initial demo course data so page looks clean and educational immediately
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
        title: "2. Core Principles & Setup",
        thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg",
        duration: "8:30",
        author: "CareerForge Instructor",
        videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8"
      },
      {
        id: "v-1-3",
        title: "3. First Practical Walkthrough",
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
        title: "5. Working with Functions & Collections",
        thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg",
        duration: "9:10",
        author: "CareerForge Instructor",
        videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8"
      }
    ]
  },
  {
    id: "m-3",
    title: "Applied Projects & Best Practices",
    videos: [
      {
        id: "v-3-1",
        title: "6. Building Modular Components",
        thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg",
        duration: "12:05",
        author: "CareerForge Instructor",
        videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8"
      },
      {
        id: "v-3-2",
        title: "7. Testing, Optimization & Review",
        thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg",
        duration: "15:40",
        author: "CareerForge Instructor",
        videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8"
      }
    ]
  }
];

export default function GeneratorPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modules, setModules] = useState<Module[]>(DEFAULT_MODULES);
  const [activeVideo, setActiveVideo] = useState<Video | null>(DEFAULT_MODULES[0].videos[0]);
  const [courseMeta, setCourseMeta] = useState({
    title: "Python Fundamentals & Applied Programming",
    topic: "Python Programming",
    difficulty: "beginner",
    targetAudience: "undergraduate students"
  });

  const totalLectures = modules.reduce((acc, m) => acc + m.videos.length, 0);

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
        const mappedModules: Module[] = data.course.modules.map((m: any, mIndex: number) => ({
          id: `m-${mIndex}`,
          title: m.title,
          videos: m.videos.map((v: any, vIndex: number) => {
            let thumbnail = "https://placehold.co/640x360/1c1d1f/ffffff?text=Video";
            if (v.source === 'youtube' && v.url) {
              try {
                const urlObj = new URL(v.url);
                const vid = urlObj.searchParams.get('v');
                if (vid) {
                  thumbnail = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
                }
              } catch (e) {
                // Ignore URL parsing errors
              }
            }
            return {
              id: v.video_id || `v-${mIndex}-${vIndex}`,
              title: v.title,
              thumbnail,
              duration: `${Math.floor(v.duration_seconds / 60)}:${(v.duration_seconds % 60).toString().padStart(2, '0')}`,
              author: v.channel_name || "Instructor",
              videoUrl: v.url
            };
          })
        }));

        setModules(mappedModules);
        setCourseMeta({
          title,
          topic,
          difficulty,
          targetAudience
        });

        if (mappedModules.length > 0 && mappedModules[0].videos.length > 0) {
          setActiveVideo(mappedModules[0].videos[0]);
        }

        // Close the popup dialog smoothly so only the final Udemy view is shown
        setIsModalOpen(false);
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
      <UdemyLayout 
        courseTitle={courseMeta.title}
        onOpenGenerator={() => setIsModalOpen(true)}
        mainContent={
          <>
            {/* Top Video Player */}
            <VideoPlayer 
              video={activeVideo} 
              onOpenGenerator={() => setIsModalOpen(true)} 
            />

            {/* Course Overview & Details Section Below Player */}
            <CourseOverview 
              activeVideo={activeVideo}
              courseMeta={courseMeta}
              totalLectures={totalLectures}
            />
          </>
        }
        sidebarContent={
          <CourseSidebar 
            modules={modules} 
            activeVideoId={activeVideo?.id}
            onVideoSelect={setActiveVideo}
            onOpenGenerator={() => setIsModalOpen(true)}
          />
        } 
      />

      {/* Generator Popup Dialog (Disappears after generation is complete) */}
      <GenerationModal 
        isOpen={isModalOpen}
        onClose={() => !isGenerating && setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isGenerating={isGenerating}
      />
    </>
  );
}

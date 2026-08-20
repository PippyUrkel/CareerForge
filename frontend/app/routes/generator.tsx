import { useState } from "react";
import type { Route } from "./+types/generator";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Course Module Generator" },
    { name: "description", content: "Generate course modules and videos" },
  ];
}

// Mock Types
type Video = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  videoUrl?: string;
};

type Module = {
  id: string;
  title: string;
  videos: Video[];
};

export default function GeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);

    const formData = new FormData(e.currentTarget);
    
    const payload = {
      course_title: formData.get('course_title') || '',
      topic: formData.get('topic') || '',
      difficulty: formData.get('difficulty') || 'beginner',
      target_audience: formData.get('target_audience') || '',
      module_config: {
        target_modules: Number(formData.get('target_modules')) || 3
      },
      video_config: {
        target_duration_seconds: Number(formData.get('target_duration_seconds')) || 600,
        videos_per_module: Number(formData.get('videos_per_module')) || 2
      }
    };

    try {
      const response = await fetch('http://localhost:8000/api/courses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.course && data.course.modules) {
        const mappedModules = data.course.modules.map((m: any, mIndex: number) => ({
          id: `m-${mIndex}`,
          title: m.title,
          videos: m.videos.map((v: any, vIndex: number) => {
            let thumbnail = "https://placehold.co/640x360/1e293b/ffffff?text=Video";
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
              author: v.channel_name,
              videoUrl: v.url
            };
          })
        }));
        setModules(mappedModules);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Failed to generate modules:", error);
      alert("Failed to generate modules. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Course Module Generator
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Enter the details below to generate an AI-powered course curriculum and video modules.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 border-b border-gray-100 pb-2">
              Course Metadata
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title
                </label>
                <input
                  name="course_title"
                  type="text"
                  required
                  placeholder="e.g., Python Fundamentals"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  name="topic"
                  type="text"
                  required
                  placeholder="e.g., Python Programming"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <input
                  name="target_audience"
                  type="text"
                  placeholder="e.g., undergraduate students"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Modules
                  </label>
                  <input
                    name="target_modules"
                    type="number"
                    min="1"
                    max="10"
                    defaultValue="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Videos / Module
                  </label>
                  <input
                    name="videos_per_module"
                    type="number"
                    min="1"
                    max="10"
                    defaultValue="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Video Duration (sec)
                </label>
                <input
                  name="target_duration_seconds"
                  type="number"
                  min="60"
                  defaultValue="600"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full mt-2 bg-gray-900 text-white py-2.5 px-4 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isGenerating ? "Generating Curriculum..." : "Generate Modules"}
              </button>
            </form>
          </div>

          {/* Right Column: Generated Content Layout (Udemy Style) */}
          <div className="lg:col-span-2 space-y-8">
            {modules.length === 0 && !isGenerating && (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-lg p-16 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-center">Submit the form to generate the course curriculum<br/>and video modules.</p>
              </div>
            )}

            {isGenerating && (
              <div className="bg-white rounded-lg p-16 flex flex-col items-center justify-center text-gray-500 border border-gray-100 shadow-sm">
                <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="font-medium text-gray-700">Connecting to AI backend...</p>
                <p className="text-sm mt-1">This might take a moment.</p>
              </div>
            )}

            {modules.map((module) => (
              <div key={module.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-5">
                  {module.title}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {module.videos.map((video) => (
                    <div 
                      key={video.id} 
                      className="group cursor-pointer flex flex-col bg-white rounded-md overflow-hidden hover:shadow-lg transition-all duration-200 border border-transparent hover:border-gray-200"
                    >
                      {/* Video Thumbnail Area */}
                      <div className="relative aspect-video bg-gray-100 overflow-hidden border border-gray-200 rounded-md">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Duration Badge */}
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white font-medium text-xs px-1.5 py-0.5 rounded">
                          {video.duration}
                        </div>
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/95 rounded-full p-2.5 shadow-md transform scale-75 group-hover:scale-100 transition-transform">
                            <svg className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Video Info Area */}
                      <div className="py-3 px-1">
                        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug mb-1 group-hover:text-indigo-600 transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-1">{video.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

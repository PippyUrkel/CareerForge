import React, { useState } from 'react';

export type Video = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  videoUrl?: string;
};

export type Module = {
  id: string;
  title: string;
  videos: Video[];
};

interface CourseSidebarProps {
  modules: Module[];
  activeVideoId?: string;
  onVideoSelect: (video: Video) => void;
  onOpenGenerator: () => void;
}

export function CourseSidebar({ modules, activeVideoId, onVideoSelect, onOpenGenerator }: CourseSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    modules.forEach(m => { initial[m.id] = true; });
    return initial;
  });

  const [completedVideos, setCompletedVideos] = useState<Record<string, boolean>>({});

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const toggleComplete = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedVideos(prev => ({ ...prev, [videoId]: !prev[videoId] }));
  };

  const totalVideos = modules.reduce((acc, m) => acc + m.videos.length, 0);
  const totalCompleted = Object.values(completedVideos).filter(Boolean).length;
  const progressPercent = totalVideos > 0 ? Math.round((totalCompleted / totalVideos) * 100) : 0;

  if (modules.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white text-ctp-text">
        <div className="p-4 border-b border-ctp-surface0 flex items-center justify-between bg-ctp-mantle/40">
          <span className="font-semibold text-sm text-ctp-text">Curriculum Syllabus</span>
        </div>
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-ctp-mantle border border-ctp-surface0 text-ctp-mauve flex items-center justify-center">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm text-ctp-text">No curriculum generated</p>
            <p className="text-xs text-ctp-subtext0 mt-1 max-w-xs leading-relaxed">
              Use the AI course studio to generate structured syllabus modules.
            </p>
          </div>
          <button
            onClick={onOpenGenerator}
            className="mt-2 text-xs font-semibold text-white bg-ctp-mauve hover:bg-[#7a2be2] px-3.5 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Generate Curriculum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white text-ctp-text">
      {/* Header with Curriculum Progress */}
      <div className="p-4 border-b border-ctp-surface0 sticky top-0 bg-white z-10 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-ctp-mauve" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <h2 className="font-semibold text-sm text-ctp-text">Course Content</h2>
          </div>
          <button 
            onClick={() => {
              const allExpanded = Object.values(expandedModules).every(Boolean);
              const next: Record<string, boolean> = {};
              modules.forEach(m => { next[m.id] = !allExpanded; });
              setExpandedModules(next);
            }}
            className="text-xs text-ctp-mauve hover:underline font-medium cursor-pointer"
          >
            {Object.values(expandedModules).every(Boolean) ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        {/* Progress Metric */}
        <div className="space-y-1.5 bg-ctp-mantle/50 p-2.5 rounded-lg border border-ctp-surface0/60">
          <div className="flex justify-between items-center text-[11px] font-medium text-ctp-subtext0">
            <span>{totalCompleted} of {totalVideos} completed</span>
            <span className="font-semibold text-ctp-text">{progressPercent}%</span>
          </div>
          <div className="w-full bg-ctp-surface0 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-ctp-green h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Accordion Module List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-ctp-surface0">
        {modules.map((module, mIndex) => {
          const isExpanded = expandedModules[module.id] ?? true;
          const completedCount = module.videos.filter(v => completedVideos[v.id]).length;

          return (
            <div key={module.id} className="bg-white">
              {/* Section Header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full px-4 py-3 bg-ctp-mantle/60 hover:bg-ctp-surface0/50 flex items-start justify-between text-left transition-colors border-b border-ctp-surface0/60 cursor-pointer"
              >
                <div className="pr-2 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ctp-subtext0">
                    Module {mIndex + 1}
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-ctp-text leading-tight mt-0.5 truncate">
                    {module.title}
                  </h3>
                  <div className="text-[11px] text-ctp-subtext0 mt-1 flex items-center space-x-2">
                    <span>{completedCount}/{module.videos.length} completed</span>
                    <span>•</span>
                    <span>{module.videos.length * 5} min</span>
                  </div>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-ctp-subtext0 transform transition-transform shrink-0 mt-1 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Lecture List */}
              {isExpanded && (
                <div className="divide-y divide-ctp-surface0/40">
                  {module.videos.map((video, vIndex) => {
                    const isActive = activeVideoId === video.id;
                    const isChecked = !!completedVideos[video.id];

                    return (
                      <div
                        key={video.id}
                        onClick={() => onVideoSelect(video)}
                        className={`group px-4 py-2.5 cursor-pointer flex items-start justify-between transition-colors border-l-[3px] ${
                          isActive 
                            ? 'bg-ctp-mauve/10 border-ctp-mauve font-semibold text-ctp-text' 
                            : isChecked
                              ? 'bg-ctp-green/5 border-transparent hover:bg-ctp-mantle/60'
                              : 'bg-white hover:bg-ctp-mantle/60 border-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-2.5 min-w-0 pr-2">
                          <button
                            type="button"
                            onClick={(e) => toggleComplete(video.id, e)}
                            className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors border ${
                              isChecked 
                                ? 'bg-ctp-green border-ctp-green text-white' 
                                : 'border-ctp-surface1 bg-white hover:border-ctp-mauve'
                            }`}
                            aria-label="Toggle completion"
                          >
                            {isChecked && (
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </button>

                          <div className="min-w-0">
                            <p className={`text-xs leading-snug line-clamp-2 ${
                              isActive ? 'text-ctp-text font-bold' : isChecked ? 'text-ctp-subtext1' : 'text-ctp-text'
                            }`}>
                              {vIndex + 1}. {video.title}
                            </p>
                            <div className="flex items-center space-x-2 text-[11px] text-ctp-subtext0 mt-1 font-normal">
                              <span className="flex items-center space-x-1">
                                <svg className="w-3 h-3 shrink-0 text-ctp-overlay1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                                <span>{video.duration}</span>
                              </span>
                              {isActive && (
                                <span className="text-[10px] font-semibold text-ctp-mauve px-1.5 py-0.2 rounded bg-ctp-mauve/15 border border-ctp-mauve/25">
                                  Active
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Lesson Resource Indicator */}
                        <div className="shrink-0 ml-2 mt-0.5">
                          <span className="inline-flex items-center text-[10px] font-medium text-ctp-subtext0 bg-ctp-base border border-ctp-surface0 rounded px-1.5 py-0.5 group-hover:border-ctp-surface1 transition-colors">
                            Lesson
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

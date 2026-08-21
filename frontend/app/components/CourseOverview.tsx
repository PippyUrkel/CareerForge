import React, { useState } from 'react';

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  videoUrl?: string;
};

type CourseMeta = {
  title?: string;
  topic?: string;
  difficulty?: string;
  targetAudience?: string;
};

interface CourseOverviewProps {
  activeVideo: Video | null;
  courseMeta: CourseMeta;
  totalLectures: number;
}

export function CourseOverview({ activeVideo, courseMeta, totalLectures }: CourseOverviewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'qa' | 'resources'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'notes', label: 'Study Notes' },
    { id: 'qa', label: 'Discussion & Q&A' },
    { id: 'resources', label: 'Resources & Links' }
  ];

  const getDifficultyBadge = (difficulty?: string) => {
    const diff = difficulty?.toLowerCase() || 'beginner';
    if (diff === 'intermediate') {
      return 'bg-ctp-sapphire/10 text-ctp-sapphire border-ctp-sapphire/25';
    }
    if (diff === 'advanced') {
      return 'bg-ctp-peach/10 text-ctp-peach border-ctp-peach/25';
    }
    if (diff === 'expert') {
      return 'bg-ctp-maroon/10 text-ctp-maroon border-ctp-maroon/25';
    }
    return 'bg-ctp-teal/10 text-ctp-teal border-ctp-teal/25';
  };

  return (
    <div className="w-full bg-ctp-base text-ctp-text">
      {/* Tab Navigation */}
      <div className="border-b border-ctp-surface0 px-4 sm:px-8 bg-white sticky top-0 z-10">
        <nav className="flex space-x-6 sm:space-x-8 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-ctp-mauve text-ctp-mauve font-semibold'
                  : 'border-transparent text-ctp-subtext0 hover:text-ctp-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-4xl px-4 sm:px-8 py-6 space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Main Course Info Header */}
            <div className="space-y-3 bg-white p-6 rounded-2xl border border-ctp-surface0 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-ctp-mauve bg-ctp-mauve/10 border border-ctp-mauve/25 px-2.5 py-0.5 rounded-md">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>AI Generated Curriculum</span>
                </span>

                {courseMeta.difficulty && (
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${getDifficultyBadge(courseMeta.difficulty)}`}>
                    {courseMeta.difficulty} Level
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-ctp-text leading-tight tracking-tight">
                {courseMeta.title || (activeVideo ? activeVideo.title : "Python Fundamentals")}
              </h1>

              <p className="text-xs sm:text-sm text-ctp-subtext1 font-normal leading-relaxed">
                Structured learning pathway on {courseMeta.topic || "core programming"}. Curated for {courseMeta.targetAudience || "motivated learners"} with multi-signal ranked video lectures and practical breakdown.
              </p>

              {/* Meta stats bar */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-3 border-t border-ctp-surface0/60 text-xs text-ctp-subtext0">
                <div className="flex items-center space-x-1.5">
                  <svg className="w-4 h-4 text-ctp-overlay1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                    <line x1="7" y1="2" x2="7" y2="22"></line>
                    <line x1="17" y1="2" x2="17" y2="22"></line>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <line x1="2" y1="7" x2="7" y2="7"></line>
                    <line x1="2" y1="17" x2="7" y2="17"></line>
                    <line x1="17" y1="17" x2="22" y2="17"></line>
                    <line x1="17" y1="7" x2="22" y2="7"></line>
                  </svg>
                  <span className="font-semibold text-ctp-text">{totalLectures}</span>
                  <span>Lectures</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <svg className="w-4 h-4 text-ctp-overlay1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>Self-Paced Track</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <svg className="w-4 h-4 text-ctp-overlay1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Verified Video Sources</span>
                </div>
              </div>
            </div>

            {/* Currently Playing Card */}
            {activeVideo && (
              <div className="p-4 sm:p-5 rounded-2xl border border-ctp-surface0 bg-white shadow-2xs space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-ctp-mauve">
                  Current Selection
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-ctp-text">
                  {activeVideo.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ctp-subtext0 pt-1">
                  <span>Instructor: <strong className="text-ctp-text font-medium">{activeVideo.author || "Curator"}</strong></span>
                  <span>•</span>
                  <span>Duration: {activeVideo.duration}</span>
                </div>
              </div>
            )}

            {/* Learning Objectives */}
            <div className="p-6 border border-ctp-surface0 bg-white rounded-2xl shadow-2xs space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-ctp-text tracking-tight">
                Curriculum Core Competencies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-ctp-subtext1">
                <div className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-md bg-ctp-green/10 text-ctp-green flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span>Foundational syntax, variables, expressions, and execution models</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-md bg-ctp-green/10 text-ctp-green flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span>Data structures, procedural workflows, and modular design</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-md bg-ctp-green/10 text-ctp-green flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span>Real-world practical examples with step-by-step video instructions</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-md bg-ctp-green/10 text-ctp-green flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span>Testing, code organization, and industry development conventions</span>
                </div>
              </div>
            </div>

            {/* Instructor & Source Bio */}
            <div className="p-5 border border-ctp-surface0 bg-white rounded-2xl shadow-2xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-ctp-mantle border border-ctp-surface0 text-ctp-mauve flex items-center justify-center font-bold text-lg shrink-0">
                {activeVideo?.author ? activeVideo.author.charAt(0).toUpperCase() : 'C'}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-ctp-text truncate">
                  {activeVideo?.author || "Curated Educational Engine"}
                </h4>
                <p className="text-xs text-ctp-subtext0">
                  Synthesized curriculum verified by CareerForge Multi-Signal Ranking
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab !== 'overview' && (
          <div className="text-center py-12 text-ctp-subtext0 space-y-3 bg-white rounded-2xl border border-ctp-surface0 p-8 shadow-2xs">
            <div className="w-10 h-10 mx-auto rounded-xl bg-ctp-mantle text-ctp-subtext0 flex items-center justify-center border border-ctp-surface0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <p className="font-semibold text-sm text-ctp-text">{tabs.find(t => t.id === activeTab)?.label}</p>
            <p className="text-xs text-ctp-subtext0 max-w-sm mx-auto">
              Module resources and notes will populate automatically as you navigate lessons.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

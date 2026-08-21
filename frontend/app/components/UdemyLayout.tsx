import React, { type ReactNode } from 'react';

interface UdemyLayoutProps {
  courseTitle: string;
  onOpenGenerator: () => void;
  mainContent: ReactNode;
  sidebarContent: ReactNode;
}

export function UdemyLayout({ courseTitle, onOpenGenerator, mainContent, sidebarContent }: UdemyLayoutProps) {
  return (
    <div className="min-h-screen bg-ctp-base flex flex-col font-sans text-ctp-text antialiased">
      {/* Top Professional Navigation Header */}
      <header className="h-14 bg-white border-b border-ctp-surface0 text-ctp-text flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
        {/* Left: Branding & Course Title */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Geometric Logo */}
            <div className="w-8 h-8 rounded-lg bg-ctp-mauve flex items-center justify-center text-white shadow-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight text-ctp-text">
              CareerForge
            </span>
            <span className="hidden md:inline-flex text-[11px] font-medium text-ctp-subtext0 px-2 py-0.5 rounded-md bg-ctp-mantle border border-ctp-surface0">
              Studio
            </span>
          </div>

          <div className="hidden md:block h-4 w-px bg-ctp-surface1 shrink-0" />

          <div className="min-w-0 hidden sm:flex items-center space-x-2 text-xs">
            <span className="text-ctp-subtext0 font-medium">Courses</span>
            <span className="text-ctp-surface2">/</span>
            <h1 className="font-medium text-ctp-text truncate max-w-sm lg:max-w-md">
              {courseTitle || "Course Curriculum"}
            </h1>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={onOpenGenerator}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-ctp-mauve hover:bg-[#7a2be2] active:bg-[#6b22c7] text-white transition-colors shadow-xs cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New Course</span>
          </button>

          <button 
            onClick={onOpenGenerator}
            className="hidden sm:flex items-center space-x-1.5 text-xs font-medium text-ctp-subtext1 hover:text-ctp-text px-2.5 py-1.5 border border-ctp-surface0 rounded-lg hover:bg-ctp-mantle transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-ctp-subtext0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Main Content & Sidebar Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-3.5rem)]">
        {/* Main Learning Canvas */}
        <div className="flex-1 overflow-y-auto bg-ctp-base flex flex-col relative custom-scrollbar">
          {mainContent}
        </div>

        {/* Curriculum Playlist Sidebar */}
        <div className="w-full lg:w-[380px] xl:w-[420px] border-l border-ctp-surface0 bg-white flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          {sidebarContent}
        </div>
      </div>
    </div>
  );
}

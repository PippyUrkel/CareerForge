import React, { type ReactNode } from 'react';

export interface StudioLayoutProps {
  courseTitle: string;
  onOpenGenerator: () => void;
  onOpenLibrary?: () => void;
  savedCoursesCount?: number;
  mainContent: ReactNode;
  sidebarContent: ReactNode;
}

/**
 * StudioLayout (also exported as UdemyLayout for compatibility)
 * Provides the responsive two-column application workspace for CareerForge.
 * Left Pane: Video streaming player and full-width course overview & study tabs.
 * Right Pane: Interactive curriculum sidebar with search and progress tracking.
 */
export function StudioLayout({ 
  courseTitle, 
  onOpenGenerator, 
  onOpenLibrary,
  savedCoursesCount = 0,
  mainContent, 
  sidebarContent 
}: StudioLayoutProps) {
  return (
    <div className="min-h-screen bg-ctp-base flex flex-col font-sans text-ctp-text antialiased">
      {/* Top Application Header */}
      <header className="h-14 bg-white border-b border-ctp-surface0 text-ctp-text flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
        {/* Brand & Breadcrumb Navigation */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <div className="flex items-center space-x-2.5 shrink-0">
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

          {/* Active Course Breadcrumb / Clickable Course Switcher */}
          <div className="min-w-0 hidden sm:flex items-center space-x-2 text-xs">
            <span className="text-ctp-subtext0 font-medium">Curriculum</span>
            <span className="text-ctp-surface2">/</span>
            {onOpenLibrary ? (
              <button
                onClick={onOpenLibrary}
                className="font-semibold text-ctp-text hover:text-ctp-mauve truncate max-w-xs lg:max-w-md flex items-center space-x-1.5 transition-colors cursor-pointer group text-left"
                title="Click to switch or browse stored courses"
              >
                <span className="truncate">{courseTitle || "Course Curriculum"}</span>
                <svg className="w-3 h-3 text-ctp-subtext0 group-hover:text-ctp-mauve shrink-0 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            ) : (
              <h1 className="font-semibold text-ctp-text truncate max-w-sm lg:max-w-md">
                {courseTitle || "Course Curriculum"}
              </h1>
            )}
          </div>
        </div>

        {/* Global Header Actions */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
          {/* Library Button */}
          {onOpenLibrary && (
            <button
              onClick={onOpenLibrary}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-ctp-text bg-white hover:bg-ctp-mantle border border-ctp-surface0 hover:border-ctp-surface1 transition-colors cursor-pointer shadow-2xs"
              title="Open database of saved courses"
            >
              <svg className="w-3.5 h-3.5 text-ctp-mauve" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              </svg>
              <span>Library</span>
              {savedCoursesCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-ctp-mauve/15 text-ctp-mauve border border-ctp-mauve/25">
                  {savedCoursesCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenGenerator}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-ctp-mauve hover:bg-[#7a2be2] active:bg-[#6b22c7] text-white transition-colors shadow-xs cursor-pointer"
            title="Generate a new AI curriculum"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New Course</span>
          </button>
        </div>
      </header>

      {/* Main Viewport Split-Pane */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-3.5rem)]">
        {/* Main Learning Stream (Video Player + Overview) */}
        <main className="flex-1 overflow-y-auto bg-ctp-base flex flex-col relative custom-scrollbar">
          {mainContent}
        </main>

        {/* Curriculum Playlist Sidebar */}
        <aside className="w-full lg:w-[380px] xl:w-[420px] border-l border-ctp-surface0 bg-white flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          {sidebarContent}
        </aside>
      </div>
    </div>
  );
}

// Retain UdemyLayout export for backward compatibility
export const UdemyLayout = StudioLayout;
export type UdemyLayoutProps = StudioLayoutProps;


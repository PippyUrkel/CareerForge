import React from 'react';
import { Link, useLocation } from 'react-router';

export interface PlatformHeaderProps {
  onOpenGenerator?: () => void;
  onOpenLibrary?: () => void;
  savedCoursesCount?: number;
}

/**
 * PlatformHeader provides architectural global navigation across all CareerForge modules.
 * Features crisp geometric framing, sharp structural tabs, and technical monospaced metadata.
 */
export function PlatformHeader({ 
  onOpenGenerator, 
  onOpenLibrary, 
  savedCoursesCount 
}: PlatformHeaderProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/generator', label: 'Course Studio', isWip: false },
    { path: '/skills', label: 'Skill Gap Analysis', isWip: true },
    { path: '/careers', label: 'Career Paths', isWip: true },
    { path: '/learning-paths', label: 'Learning Paths', isWip: true },
    { path: '/jobs', label: 'Job Aggregator', isWip: true },
    { path: '/jobs/matching', label: 'Job Matching', isWip: true },
    { path: '/analytics', label: 'Analytics', isWip: true },
  ];

  return (
    <header className="h-14 bg-white border-b border-ctp-surface0 text-ctp-text flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0 z-30 sticky top-0">
      {/* Left: Brand & Navigation */}
      <div className="flex items-center space-x-4 sm:space-x-6 min-w-0 flex-1">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-2.5 shrink-0 group">
          <div className="w-7 h-7 rounded-xs bg-ctp-mauve flex items-center justify-center text-white border border-ctp-mauve shadow-2xs group-hover:bg-[#13382c] transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-bold text-sm sm:text-base tracking-tight text-ctp-text uppercase">
            CareerForge
          </span>
        </Link>

        <div className="hidden lg:block h-4 w-px bg-ctp-surface1 shrink-0" />

        {/* Navigation Items (Sharp Architectural Tabs) */}
        <nav className="hidden md:flex items-center space-x-1 overflow-x-auto custom-scrollbar text-xs h-14">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path) && (item.path !== '/jobs' || currentPath === '/jobs'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`h-full px-3 inline-flex items-center space-x-1.5 whitespace-nowrap font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-ctp-mauve text-ctp-mauve font-bold bg-ctp-base/40'
                    : 'border-transparent text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-base/30'
                }`}
              >
                <span>{item.label}</span>
                {item.isWip && (
                  <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded-none bg-ctp-peach/10 text-ctp-peach border border-ctp-peach/30 uppercase tracking-wider">
                    WIP
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2 shrink-0">
        {onOpenLibrary && (
          <button
            onClick={onOpenLibrary}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xs text-xs font-semibold text-ctp-text bg-white hover:bg-ctp-mantle border border-ctp-surface0 hover:border-ctp-surface1 transition-colors cursor-pointer shadow-2xs"
            title="Open database of saved courses"
          >
            <svg className="w-3.5 h-3.5 text-ctp-mauve" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
            <span className="hidden sm:inline">Library</span>
            {savedCoursesCount !== undefined && savedCoursesCount > 0 && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-none bg-ctp-mauve/15 text-ctp-mauve border border-ctp-mauve/25">
                {savedCoursesCount}
              </span>
            )}
          </button>
        )}

        {onOpenGenerator ? (
          <button
            onClick={onOpenGenerator}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xs text-xs font-semibold bg-ctp-mauve hover:bg-[#13382c] active:bg-[#0c241c] text-white transition-colors shadow-2xs cursor-pointer border border-ctp-mauve"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New Course</span>
          </button>
        ) : (
          <Link
            to="/generator"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xs text-xs font-semibold bg-ctp-mauve hover:bg-[#13382c] active:bg-[#0c241c] text-white transition-colors shadow-2xs border border-ctp-mauve"
          >
            <span>Course Studio</span>
          </Link>
        )}
      </div>
    </header>
  );
}

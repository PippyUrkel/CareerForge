import React, { useState, useMemo } from 'react';

export interface StoredCourseItem {
  id: string;
  generation_id: string;
  course_title: string;
  description?: string;
  difficulty?: string;
  language?: string;
  topic: string;
  target_audience?: string;
  learning_objectives: string[];
  prerequisites: string[];
  created_at?: string;
  module_count: number;
  video_count: number;
  total_duration_seconds: number;
}

export interface CourseLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: StoredCourseItem[];
  activeCourseId?: string;
  onSelectCourse: (courseId: string) => void;
  onDeleteCourse?: (courseId: string) => void;
  isLoading?: boolean;
  onOpenGenerator: () => void;
}

/**
 * CourseLibraryModal provides an elegant Catppuccin Latte modal interface
 * to browse, search, inspect, and switch between saved courses stored in careerforge.db.
 */
export function CourseLibraryModal({
  isOpen,
  onClose,
  courses = [],
  activeCourseId,
  onSelectCourse,
  onDeleteCourse,
  isLoading = false,
  onOpenGenerator
}: CourseLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const safeCourses = courses || [];

  const filteredCourses = useMemo(() => {
    return safeCourses.filter((course) => {
      const matchesSearch =
        course.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.target_audience && course.target_audience.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDifficulty =
        difficultyFilter === 'all' ||
        (course.difficulty && course.difficulty.toLowerCase() === difficultyFilter);

      return matchesSearch && matchesDifficulty;
    });
  }, [safeCourses, searchQuery, difficultyFilter]);

  if (!isOpen) return null;

  const formatDuration = (totalSeconds: number) => {
    if (!totalSeconds) return '0 min';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ctp-text/35 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-ctp-surface0 flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-ctp-surface0 bg-white shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-ctp-mauve/10 text-ctp-mauve border border-ctp-mauve/25 flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-ctp-text">
                  Course Database & Library
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-ctp-mantle border border-ctp-surface0 text-ctp-subtext0">
                  {courses.length} Stored
                </span>
              </div>
              <p className="text-xs text-ctp-subtext0 mt-0.5">
                Load or switch between AI-synthesized curriculums stored in <code className="font-mono text-ctp-mauve">careerforge.db</code>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onOpenGenerator();
              }}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-ctp-mauve hover:bg-[#7a2be2] text-white shadow-xs transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>New Course</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-ctp-subtext0 hover:text-ctp-text p-1.5 rounded-lg hover:bg-ctp-mantle transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="p-4 sm:px-6 border-b border-ctp-surface0 bg-ctp-base/40 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved courses by title, topic, or audience..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-ctp-surface0 rounded-xl focus:outline-none focus:border-ctp-mauve placeholder:text-ctp-overlay0 shadow-2xs"
            />
            <svg className="w-4 h-4 text-ctp-subtext0 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-ctp-subtext0 hover:text-ctp-text"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex space-x-1.5 text-xs shrink-0 overflow-x-auto">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficultyFilter(level)}
                className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-colors cursor-pointer whitespace-nowrap ${
                  difficultyFilter === level
                    ? 'bg-ctp-mauve text-white font-semibold shadow-2xs'
                    : 'bg-white border border-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text'
                }`}
              >
                {level === 'all' ? 'All Tracks' : level}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-4">
          {isLoading ? (
            <div className="py-16 text-center text-ctp-subtext0 space-y-3">
              <div className="w-8 h-8 mx-auto rounded-full border-2 border-ctp-mauve border-t-transparent animate-spin" />
              <p className="text-xs font-medium">Fetching courses from database...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-16 text-center text-ctp-subtext0 space-y-3 bg-ctp-base/30 rounded-2xl border border-ctp-surface0 p-8">
              <div className="w-12 h-12 rounded-xl bg-white border border-ctp-surface0 text-ctp-mauve flex items-center justify-center mx-auto shadow-2xs">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <h4 className="text-sm font-bold text-ctp-text">No courses match your query</h4>
              <p className="text-xs max-w-sm mx-auto">
                {searchQuery || difficultyFilter !== 'all'
                  ? 'Try adjusting your search criteria or resetting difficulty filters.'
                  : 'Generate your first AI curriculum to store it in the database.'}
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenGenerator();
                }}
                className="mt-2 text-xs font-semibold text-white bg-ctp-mauve hover:bg-[#7a2be2] px-4 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Generate New Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((course) => {
                const isActive = course.id === activeCourseId || course.generation_id === activeCourseId;

                return (
                  <div
                    key={course.id || course.generation_id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between group ${
                      isActive
                        ? 'bg-ctp-mauve/5 border-ctp-mauve ring-1 ring-ctp-mauve/30 shadow-2xs'
                        : 'bg-white border-ctp-surface0 hover:border-ctp-surface1 hover:shadow-sm'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Card Header & Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${getDifficultyBadge(course.difficulty)}`}>
                            {course.difficulty || 'beginner'}
                          </span>
                          <span className="text-[10px] font-medium text-ctp-subtext0 bg-ctp-base/80 border border-ctp-surface0 px-2 py-0.5 rounded-md">
                            {course.topic}
                          </span>
                        </div>

                        {isActive && (
                          <span className="text-[10px] font-bold text-ctp-mauve bg-ctp-mauve/15 border border-ctp-mauve/30 px-2 py-0.5 rounded-md shrink-0">
                            Currently Active
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-ctp-text group-hover:text-ctp-mauve transition-colors leading-snug">
                          {course.course_title}
                        </h4>
                        {course.description && (
                          <p className="text-xs text-ctp-subtext1 line-clamp-2 mt-1 leading-relaxed">
                            {course.description}
                          </p>
                        )}
                      </div>

                      {/* Course Metric Pills */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-ctp-surface0/60 text-xs">
                        <div className="p-2 rounded-lg bg-ctp-base/50 text-center">
                          <span className="text-[10px] text-ctp-subtext0 block font-medium">Modules</span>
                          <span className="font-bold text-ctp-text">{course.module_count}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-ctp-base/50 text-center">
                          <span className="text-[10px] text-ctp-subtext0 block font-medium">Lectures</span>
                          <span className="font-bold text-ctp-text">{course.video_count}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-ctp-base/50 text-center">
                          <span className="text-[10px] text-ctp-subtext0 block font-medium">Runtime</span>
                          <span className="font-bold text-ctp-text">{formatDuration(course.total_duration_seconds)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 mt-3 border-t border-ctp-surface0/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-ctp-subtext0">
                        Created {formatDate(course.created_at)}
                      </span>

                      <div className="flex items-center space-x-2">
                        {onDeleteCourse && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete course "${course.course_title}" from database?`)) {
                                onDeleteCourse(course.id || course.generation_id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-ctp-subtext0 hover:text-ctp-red hover:bg-ctp-red/10 transition-colors cursor-pointer"
                            title="Delete course from database"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            onSelectCourse(course.id || course.generation_id);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer flex items-center space-x-1 ${
                            isActive
                              ? 'bg-ctp-mauve/20 text-ctp-mauve border border-ctp-mauve/30'
                              : 'bg-ctp-mauve hover:bg-[#7a2be2] text-white'
                          }`}
                        >
                          <span>{isActive ? 'Loaded' : 'Open Course'}</span>
                          {!isActive && (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-ctp-surface0 bg-ctp-mantle/50 shrink-0 flex items-center justify-between text-xs text-ctp-subtext0">
          <span>Connected to database: <code className="text-ctp-text font-medium">backend/careerforge.db</code></span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-ctp-surface0 bg-white hover:bg-ctp-mantle text-ctp-text font-medium transition-colors cursor-pointer"
          >
            Close Library
          </button>
        </div>
      </div>
    </div>
  );
}

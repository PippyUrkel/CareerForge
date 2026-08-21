import React from 'react';
import { GenerationPipeline } from './GenerationPipeline';

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  isGenerating: boolean;
}

export function GenerationModal({ isOpen, onClose, onSubmit, isGenerating }: GenerationModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ctp-text/35 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-ctp-surface0">
        {/* If generating, display the pipeline view */}
        {isGenerating ? (
          <div className="bg-white">
            <GenerationPipeline />
          </div>
        ) : (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-ctp-surface0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-ctp-mauve/10 text-ctp-mauve border border-ctp-mauve/25 flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-ctp-text">
                    Curriculum Generation Parameters
                  </h3>
                  <p className="text-xs text-ctp-subtext0">
                    Define course taxonomy and video sourcing parameters
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-ctp-subtext0 hover:text-ctp-text p-1.5 rounded-lg hover:bg-ctp-mantle transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-ctp-subtext1 mb-1">
                  Course Title
                </label>
                <input
                  name="course_title"
                  type="text"
                  required
                  placeholder="e.g., Python Fundamentals"
                  defaultValue="Python Fundamentals"
                  className="w-full px-3 py-2 bg-ctp-base/40 text-ctp-text text-xs sm:text-sm border border-ctp-surface0 rounded-lg focus:outline-none focus:border-ctp-mauve focus:ring-1 focus:ring-ctp-mauve transition-colors placeholder:text-ctp-overlay0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ctp-subtext1 mb-1">
                  Topic & Domain Area
                </label>
                <input
                  name="topic"
                  type="text"
                  required
                  placeholder="e.g., Python Programming"
                  defaultValue="Python Programming"
                  className="w-full px-3 py-2 bg-ctp-base/40 text-ctp-text text-xs sm:text-sm border border-ctp-surface0 rounded-lg focus:outline-none focus:border-ctp-mauve focus:ring-1 focus:ring-ctp-mauve transition-colors placeholder:text-ctp-overlay0"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ctp-subtext1 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    name="difficulty"
                    defaultValue="beginner"
                    className="w-full px-3 py-2 bg-ctp-base/40 text-ctp-text text-xs sm:text-sm border border-ctp-surface0 rounded-lg focus:outline-none focus:border-ctp-mauve focus:ring-1 focus:ring-ctp-mauve transition-colors cursor-pointer"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ctp-subtext1 mb-1">
                    Target Audience
                  </label>
                  <input
                    name="target_audience"
                    type="text"
                    required
                    placeholder="e.g., undergraduate students"
                    defaultValue="undergraduate students"
                    className="w-full px-3 py-2 bg-ctp-base/40 text-ctp-text text-xs sm:text-sm border border-ctp-surface0 rounded-lg focus:outline-none focus:border-ctp-mauve focus:ring-1 focus:ring-ctp-mauve transition-colors placeholder:text-ctp-overlay0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ctp-subtext1 mb-1">
                    Modules Count
                  </label>
                  <input
                    name="target_modules"
                    type="number"
                    min="1"
                    max="20"
                    defaultValue="6"
                    className="w-full px-3 py-2 bg-ctp-base/40 text-ctp-text text-xs sm:text-sm border border-ctp-surface0 rounded-lg focus:outline-none focus:border-ctp-mauve focus:ring-1 focus:ring-ctp-mauve transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ctp-subtext1 mb-1">
                    Videos / Module
                  </label>
                  <input
                    name="videos_per_module"
                    type="number"
                    min="1"
                    max="10"
                    defaultValue="3"
                    className="w-full px-3 py-2 bg-ctp-base/40 text-ctp-text text-xs sm:text-sm border border-ctp-surface0 rounded-lg focus:outline-none focus:border-ctp-mauve focus:ring-1 focus:ring-ctp-mauve transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ctp-subtext1 mb-1">
                    Duration (s)
                  </label>
                  <input
                    name="target_duration_seconds"
                    type="number"
                    min="30"
                    defaultValue="600"
                    className="w-full px-3 py-2 bg-ctp-base/40 text-ctp-text text-xs sm:text-sm border border-ctp-surface0 rounded-lg focus:outline-none focus:border-ctp-mauve focus:ring-1 focus:ring-ctp-mauve transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-2.5 border-t border-ctp-surface0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs font-medium text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-mantle rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-ctp-mauve hover:bg-[#7a2be2] active:bg-[#6b22c7] rounded-lg shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <span>Generate Curriculum</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

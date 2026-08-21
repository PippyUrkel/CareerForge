import React, { useState } from 'react';
import { GenerationPipeline } from './GenerationPipeline';

export interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  isGenerating: boolean;
}

/**
 * GenerationModal Component
 * Interactive modal dialog for inputting course taxonomy constraints,
 * difficulty level, target audience, and video count parameters.
 */
export function GenerationModal({ isOpen, onClose, onSubmit, isGenerating }: GenerationModalProps) {
  const [courseTitle, setCourseTitle] = useState('Python Fundamentals');
  const [topic, setTopic] = useState('Python Programming');
  const [difficulty, setDifficulty] = useState('beginner');
  const [targetAudience, setTargetAudience] = useState('undergraduate students');
  const [targetModules, setTargetModules] = useState(6);
  const [videosPerModule, setVideosPerModule] = useState(3);
  const [durationSeconds, setDurationSeconds] = useState(600);

  if (!isOpen) return null;

  const applyPreset = (preset: 'crash' | 'standard' | 'deep') => {
    if (preset === 'crash') {
      setTargetModules(3);
      setVideosPerModule(2);
      setDurationSeconds(480);
    } else if (preset === 'standard') {
      setTargetModules(6);
      setVideosPerModule(3);
      setDurationSeconds(600);
    } else if (preset === 'deep') {
      setTargetModules(9);
      setVideosPerModule(4);
      setDurationSeconds(720);
    }
  };

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
                    AI Curriculum Generator
                  </h3>
                  <p className="text-xs text-ctp-subtext0">
                    Define course taxonomy and video sourcing constraints
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

            {/* Quick Presets */}
            <div className="mb-4 p-2.5 bg-ctp-base/50 rounded-xl border border-ctp-surface0/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ctp-subtext0">Scope Presets:</span>
              <div className="flex space-x-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => applyPreset('crash')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                    targetModules === 3 ? 'bg-ctp-mauve text-white' : 'bg-white border border-ctp-surface0 text-ctp-subtext1 hover:border-ctp-surface1'
                  }`}
                >
                  Quick (3 Mod)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('standard')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                    targetModules === 6 ? 'bg-ctp-mauve text-white' : 'bg-white border border-ctp-surface0 text-ctp-subtext1 hover:border-ctp-surface1'
                  }`}
                >
                  Standard (6 Mod)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('deep')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                    targetModules === 9 ? 'bg-ctp-mauve text-white' : 'bg-white border border-ctp-surface0 text-ctp-subtext1 hover:border-ctp-surface1'
                  }`}
                >
                  Masterclass (9 Mod)
                </button>
              </div>
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
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g., Python Fundamentals"
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
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Python Programming"
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
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
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
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., undergraduate students"
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
                    value={targetModules}
                    onChange={(e) => setTargetModules(Number(e.target.value))}
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
                    value={videosPerModule}
                    onChange={(e) => setVideosPerModule(Number(e.target.value))}
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
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(Number(e.target.value))}
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


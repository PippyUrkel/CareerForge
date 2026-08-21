import React from 'react';

interface GenerationFormProps {
  onSubmit: (formData: FormData) => void;
  isGenerating: boolean;
}

export function GenerationForm({ onSubmit, isGenerating }: GenerationFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  };

  return (
    <div className="bg-white p-6 rounded-none border border-ctp-surface0 shadow-2xs text-ctp-text">
      <h2 className="text-lg font-bold mb-4 text-ctp-text border-b border-ctp-surface0 pb-3 flex items-center space-x-2 uppercase">
        <span className="text-ctp-mauve">✦</span>
        <span>Course Configuration</span>
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono font-bold text-ctp-subtext1 uppercase tracking-wider mb-1">
            Course Title
          </label>
          <input
            name="course_title"
            type="text"
            required
            placeholder="e.g., Python Fundamentals"
            defaultValue="Python Fundamentals"
            className="w-full px-3.5 py-2.5 bg-ctp-base/50 text-ctp-text text-sm border border-ctp-surface0 rounded-none focus:outline-none focus:border-ctp-mauve placeholder:text-ctp-overlay0"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold text-ctp-subtext1 uppercase tracking-wider mb-1">
            Topic & Skills
          </label>
          <input
            name="topic"
            type="text"
            required
            placeholder="e.g., Python Programming"
            defaultValue="Python Programming"
            className="w-full px-3.5 py-2.5 bg-ctp-base/50 text-ctp-text text-sm border border-ctp-surface0 rounded-none focus:outline-none focus:border-ctp-mauve placeholder:text-ctp-overlay0"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold text-ctp-subtext1 uppercase tracking-wider mb-1">
            Difficulty
          </label>
          <select
            name="difficulty"
            defaultValue="beginner"
            className="w-full px-3.5 py-2.5 bg-ctp-base/50 text-ctp-text text-sm border border-ctp-surface0 rounded-none focus:outline-none focus:border-ctp-mauve cursor-pointer"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold text-ctp-subtext1 uppercase tracking-wider mb-1">
            Target Audience
          </label>
          <input
            name="target_audience"
            type="text"
            placeholder="e.g., undergraduate students"
            defaultValue="undergraduate students"
            required
            className="w-full px-3.5 py-2.5 bg-ctp-base/50 text-ctp-text text-sm border border-ctp-surface0 rounded-none focus:outline-none focus:border-ctp-mauve placeholder:text-ctp-overlay0"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold text-ctp-subtext1 uppercase tracking-wider mb-1">
              Target Modules
            </label>
            <input
              name="target_modules"
              type="number"
              min="1"
              max="20"
              defaultValue="6"
              className="w-full px-3.5 py-2.5 bg-ctp-base/50 text-ctp-text text-sm border border-ctp-surface0 rounded-none focus:outline-none focus:border-ctp-mauve font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-bold text-ctp-subtext1 uppercase tracking-wider mb-1">
              Videos / Module
            </label>
            <input
              name="videos_per_module"
              type="number"
              min="1"
              max="10"
              defaultValue="3"
              className="w-full px-3.5 py-2.5 bg-ctp-base/50 text-ctp-text text-sm border border-ctp-surface0 rounded-none focus:outline-none focus:border-ctp-mauve font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold text-ctp-subtext1 uppercase tracking-wider mb-1">
            Target Duration (sec)
          </label>
          <input
            name="target_duration_seconds"
            type="number"
            min="30"
            defaultValue="600"
            className="w-full px-3.5 py-2.5 bg-ctp-base/50 text-ctp-text text-sm border border-ctp-surface0 rounded-none focus:outline-none focus:border-ctp-mauve font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full mt-4 bg-ctp-mauve text-white py-2.5 px-4 rounded-none font-bold uppercase tracking-wider hover:bg-[#13382c] active:bg-[#0c241c] focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-2xs border border-ctp-mauve cursor-pointer"
        >
          {isGenerating ? "Generating Curriculum..." : "Generate AI Course"}
        </button>
      </form>
    </div>
  );
}

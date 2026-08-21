import { Link } from "react-router";

export function Welcome() {
  return (
    <main className="min-h-screen bg-ctp-base flex items-center justify-center p-4 sm:p-8 font-sans text-ctp-text antialiased">
      <div className="max-w-2xl w-full text-center space-y-7 bg-white p-8 sm:p-12 rounded-2xl shadow-xs border border-ctp-surface0">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ctp-mauve text-white shadow-xs">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>

        <div className="space-y-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-ctp-text tracking-tight">
            CareerForge AI Curriculum Studio
          </h1>
          <p className="text-xs sm:text-sm text-ctp-subtext0 max-w-md mx-auto leading-relaxed">
            Generate verified educational video courses with multi-signal candidate ranking, automated syllabus sequencing, and structured progress tracking.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Link
            to="/generator"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg font-semibold text-white bg-ctp-mauve hover:bg-[#7a2be2] active:bg-[#6b22c7] transition-colors shadow-xs text-xs sm:text-sm cursor-pointer"
          >
            <span>Open Course Studio</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-ctp-surface0 text-left">
          <div className="p-3.5 rounded-xl bg-ctp-base/50 border border-ctp-surface0">
            <div className="text-ctp-text font-semibold text-xs mb-1">Taxonomy Synthesizer</div>
            <p className="text-[11px] text-ctp-subtext0 leading-snug">Modular breakdown of topics and prerequisite dependencies.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-ctp-base/50 border border-ctp-surface0">
            <div className="text-ctp-text font-semibold text-xs mb-1">Multi-Signal Ranking</div>
            <p className="text-[11px] text-ctp-subtext0 leading-snug">Dense embeddings, keyword relevance, and duration scoring.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-ctp-base/50 border border-ctp-surface0">
            <div className="text-ctp-text font-semibold text-xs mb-1">Interactive Player</div>
            <p className="text-[11px] text-ctp-subtext0 leading-snug">Curriculum playlist, completion tracking, and study guide.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

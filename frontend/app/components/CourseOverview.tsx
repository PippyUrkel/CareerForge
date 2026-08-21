import React, { useState, useEffect } from 'react';

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  videoUrl?: string;
}

export interface CourseMeta {
  title?: string;
  topic?: string;
  difficulty?: string;
  targetAudience?: string;
}

export interface CourseOverviewProps {
  activeVideo: Video | null;
  courseMeta: CourseMeta;
  totalLectures: number;
}

interface NoteItem {
  id: string;
  timestamp: string;
  text: string;
  lessonTitle: string;
  createdAt: string;
}

interface QuestionItem {
  id: string;
  author: string;
  title: string;
  body: string;
  votes: number;
  replies: number;
  lessonTitle: string;
  hasUpvoted?: boolean;
}

/**
 * CourseOverview Component
 * Renders the full-width information workspace beneath the video stream.
 * Includes interactive tabs for:
 * 1. Overview: Course objectives, curriculum taxonomy, and educator credentials.
 * 2. Study Notes: Interactive note-taking notepad with timestamp indexing.
 * 3. Discussion & Q&A: Interactive question and thread board with upvoting.
 * 4. Resources: Curated documentation, repositories, and cheat sheets.
 */
export function CourseOverview({ activeVideo, courseMeta, totalLectures }: CourseOverviewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'qa' | 'resources'>('overview');

  // Study Notes State with Local Storage persistence
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('careerforge_notes');
      return saved ? JSON.parse(saved) : [
        {
          id: 'note-1',
          timestamp: '02:15',
          text: 'Core architecture overview: separation between data modeling and view logic is crucial.',
          lessonTitle: activeVideo?.title || 'Course Introduction',
          createdAt: 'Just now'
        }
      ];
    } catch {
      return [];
    }
  });
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTimestamp, setNewNoteTimestamp] = useState('01:30');

  useEffect(() => {
    try {
      localStorage.setItem('careerforge_notes', JSON.stringify(notes));
    } catch {
      // Ignore storage errors
    }
  }, [notes]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      timestamp: newNoteTimestamp || '00:00',
      text: newNoteText.trim(),
      lessonTitle: activeVideo?.title || 'General Note',
      createdAt: 'Just now'
    };

    setNotes([newNote, ...notes]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  // Q&A State
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: 'q-1',
      author: 'Alex Morgan',
      title: 'How does parameter passing behave across scope boundaries?',
      body: 'In section 2, the instructor mentions mutable versus immutable arguments. Can someone clarify reference passing?',
      votes: 14,
      replies: 3,
      lessonTitle: 'Variables & Scope'
    },
    {
      id: 'q-2',
      author: 'David Chen',
      title: 'Recommended project structures for large modular applications?',
      body: 'What are the recommended package hierarchies when separating business logic from utility handlers?',
      votes: 9,
      replies: 2,
      lessonTitle: 'Modular Components'
    }
  ]);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionBody, setNewQuestionBody] = useState('');
  const [showAskForm, setShowAskForm] = useState(false);

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionTitle.trim()) return;

    const newQuestion: QuestionItem = {
      id: `q-${Date.now()}`,
      author: 'You',
      title: newQuestionTitle.trim(),
      body: newQuestionBody.trim() || 'No additional details provided.',
      votes: 1,
      replies: 0,
      lessonTitle: activeVideo?.title || 'General Discussion',
      hasUpvoted: true
    };

    setQuestions([newQuestion, ...questions]);
    setNewQuestionTitle('');
    setNewQuestionBody('');
    setShowAskForm(false);
  };

  const handleVote = (id: string) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const hasUpvoted = q.hasUpvoted;
        return {
          ...q,
          votes: hasUpvoted ? q.votes - 1 : q.votes + 1,
          hasUpvoted: !hasUpvoted
        };
      }
      return q;
    }));
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

  const tabs = [
    { id: 'overview', label: 'Curriculum Overview' },
    { id: 'notes', label: `Study Notes (${notes.length})` },
    { id: 'qa', label: `Discussion & Q&A (${questions.length})` },
    { id: 'resources', label: 'Resources & Reference' }
  ];

  return (
    <div className="w-full bg-ctp-base text-ctp-text flex-1 flex flex-col">
      {/* Navigation Tab Bar */}
      <div className="border-b border-ctp-surface0 px-4 sm:px-6 lg:px-8 bg-white sticky top-0 z-10">
        <nav className="flex space-x-6 sm:space-x-8 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
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

      {/* Main Full-Width Content Canvas */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* ========================================================================= */}
        {/* TAB 1: CURRICULUM OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 w-full">
            {/* Top Course Meta Banner (Full Width) */}
            <div className="w-full bg-white p-6 sm:p-7 rounded-2xl border border-ctp-surface0 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-ctp-mauve bg-ctp-mauve/10 border border-ctp-mauve/25 px-2.5 py-0.5 rounded-md">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span>AI Synthesized Curriculum</span>
                  </span>

                  {courseMeta.difficulty && (
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${getDifficultyBadge(courseMeta.difficulty)}`}>
                      {courseMeta.difficulty} Level
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-xs text-ctp-subtext0">
                  <span className="font-semibold text-ctp-text">{totalLectures}</span>
                  <span>Sequential Modules</span>
                </div>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-ctp-text leading-tight tracking-tight">
                  {courseMeta.title || (activeVideo ? activeVideo.title : "Python Fundamentals")}
                </h1>
                <p className="text-xs sm:text-sm text-ctp-subtext1 font-normal leading-relaxed mt-2 max-w-4xl">
                  Comprehensive educational pathway structured around {courseMeta.topic || "modern programming practices"}. Designed specifically for {courseMeta.targetAudience || "developers"} with step-by-step video sequencing and multi-signal ranking.
                </p>
              </div>

              {/* Course Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-ctp-surface0/60 text-xs">
                <div className="p-3 rounded-xl bg-ctp-base/50 border border-ctp-surface0/60">
                  <span className="text-[11px] text-ctp-subtext0 block font-medium">Domain Area</span>
                  <span className="font-semibold text-ctp-text truncate block mt-0.5">{courseMeta.topic || "Programming"}</span>
                </div>
                <div className="p-3 rounded-xl bg-ctp-base/50 border border-ctp-surface0/60">
                  <span className="text-[11px] text-ctp-subtext0 block font-medium">Target Audience</span>
                  <span className="font-semibold text-ctp-text truncate block mt-0.5">{courseMeta.targetAudience || "All Learners"}</span>
                </div>
                <div className="p-3 rounded-xl bg-ctp-base/50 border border-ctp-surface0/60">
                  <span className="text-[11px] text-ctp-subtext0 block font-medium">Delivery Mode</span>
                  <span className="font-semibold text-ctp-text block mt-0.5">Self-Paced Stream</span>
                </div>
                <div className="p-3 rounded-xl bg-ctp-base/50 border border-ctp-surface0/60">
                  <span className="text-[11px] text-ctp-subtext0 block font-medium">Ranking Engine</span>
                  <span className="font-semibold text-ctp-mauve block mt-0.5">Multi-Signal Dense</span>
                </div>
              </div>
            </div>

            {/* Responsive Grid: Left (Objectives & Deep Dive) + Right (Current Selection & Educator) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
              {/* Left Column (8 of 12) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Learning Competencies Card */}
                <div className="p-6 border border-ctp-surface0 bg-white rounded-2xl shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-bold text-ctp-text tracking-tight">
                      Core Learning Competencies
                    </h2>
                    <span className="text-xs text-ctp-subtext0 font-medium">4 Key Modules</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm text-ctp-subtext1">
                    <div className="p-3.5 rounded-xl bg-ctp-base/40 border border-ctp-surface0/60 flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-md bg-ctp-green/10 text-ctp-green flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <div>
                        <strong className="text-ctp-text block font-semibold text-xs mb-0.5">Syntax & Foundations</strong>
                        <span>Variables, types, control structures, and functional patterns.</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-ctp-base/40 border border-ctp-surface0/60 flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-md bg-ctp-green/10 text-ctp-green flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <div>
                        <strong className="text-ctp-text block font-semibold text-xs mb-0.5">Data Collections</strong>
                        <span>Sequences, mappings, comprehensions, and memory optimization.</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-ctp-base/40 border border-ctp-surface0/60 flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-md bg-ctp-green/10 text-ctp-green flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <div>
                        <strong className="text-ctp-text block font-semibold text-xs mb-0.5">Modular Architecture</strong>
                        <span>Package management, reusable components, and API integration.</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-ctp-base/40 border border-ctp-surface0/60 flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-md bg-ctp-green/10 text-ctp-green flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <div>
                        <strong className="text-ctp-text block font-semibold text-xs mb-0.5">Testing & Verification</strong>
                        <span>Unit testing, validation routines, and real-world project deployment.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prerequisite & Requirements Card */}
                <div className="p-6 border border-ctp-surface0 bg-white rounded-2xl shadow-2xs space-y-3">
                  <h3 className="text-sm font-bold text-ctp-text">Requirements & Target Environment</h3>
                  <ul className="text-xs text-ctp-subtext1 space-y-2 list-disc list-inside">
                    <li>Basic familiarity with general computing concepts and terminal navigation.</li>
                    <li>No prior specialized domain knowledge required for beginner track modules.</li>
                    <li>Code editor or web browser equipped to execute interactive code walk-throughs.</li>
                  </ul>
                </div>
              </div>

              {/* Right Column (4 of 12) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Active Selection Card */}
                {activeVideo && (
                  <div className="p-5 rounded-2xl border border-ctp-surface0 bg-white shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ctp-mauve px-2 py-0.5 rounded bg-ctp-mauve/10 border border-ctp-mauve/20">
                        Active Lesson
                      </span>
                      <span className="text-xs text-ctp-subtext0 font-medium">{activeVideo.duration}</span>
                    </div>
                    <h3 className="text-sm font-bold text-ctp-text leading-snug">
                      {activeVideo.title}
                    </h3>
                    <div className="pt-2 border-t border-ctp-surface0/60 text-xs text-ctp-subtext0 space-y-1">
                      <p>Instructor: <strong className="text-ctp-text font-semibold">{activeVideo.author || "Curated Educator"}</strong></p>
                      <p>Status: <span className="text-ctp-green font-medium">Ready to Stream</span></p>
                    </div>
                  </div>
                )}

                {/* Educator & Sourcing Profile */}
                <div className="p-5 border border-ctp-surface0 bg-white rounded-2xl shadow-2xs space-y-3">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-xl bg-ctp-mauve text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                      {activeVideo?.author ? activeVideo.author.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-ctp-text truncate">
                        {activeVideo?.author || "CareerForge Curated Instructor"}
                      </h4>
                      <p className="text-[11px] text-ctp-subtext0">Educational Content Lead</p>
                    </div>
                  </div>
                  <p className="text-xs text-ctp-subtext1 leading-relaxed">
                    Lectures are sourced from verified high-ranking educational repositories and structured by AI taxonomy analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STUDY NOTES (Full Width Interactive Workspace) */}
        {/* ========================================================================= */}
        {activeTab === 'notes' && (
          <div className="space-y-6 w-full">
            {/* Note Creator Box */}
            <div className="p-6 bg-white rounded-2xl border border-ctp-surface0 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-ctp-text">Interactive Lesson Notepad</h3>
                  <p className="text-xs text-ctp-subtext0 mt-0.5">Take notes timestamped to the active video lesson.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-ctp-subtext0 font-medium">Timestamp:</span>
                  <input
                    type="text"
                    value={newNoteTimestamp}
                    onChange={(e) => setNewNoteTimestamp(e.target.value)}
                    placeholder="01:30"
                    className="w-16 px-2 py-1 text-xs border border-ctp-surface0 rounded bg-ctp-base/50 font-mono text-center focus:outline-none focus:border-ctp-mauve"
                  />
                </div>
              </div>

              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder={`Write your key insights, code snippets, or thoughts for "${activeVideo?.title || 'this lesson'}"...`}
                  rows={3}
                  className="w-full p-3.5 bg-ctp-base/40 text-ctp-text text-xs sm:text-sm border border-ctp-surface0 rounded-xl focus:outline-none focus:border-ctp-mauve focus:ring-1 focus:ring-ctp-mauve transition-colors resize-none placeholder:text-ctp-overlay0"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-ctp-subtext0">Notes are saved locally in your browser workspace.</span>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-ctp-mauve hover:bg-[#7a2be2] rounded-lg shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Save Note</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Saved Notes Feed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ctp-subtext0">Saved Notes ({notes.length})</h4>
                {notes.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Clear all notes?')) setNotes([]);
                    }}
                    className="text-xs text-ctp-red hover:underline font-medium cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {notes.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-ctp-surface0 text-ctp-subtext0 space-y-2">
                  <p className="font-semibold text-sm text-ctp-text">No notes recorded yet</p>
                  <p className="text-xs">Type your observations above to keep a personal study journal.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {notes.map((note) => (
                    <div key={note.id} className="p-4 bg-white rounded-xl border border-ctp-surface0 shadow-2xs space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-semibold text-ctp-mauve bg-ctp-mauve/10 border border-ctp-mauve/20 px-2 py-0.5 rounded">
                            {note.timestamp}
                          </span>
                          <span className="text-[11px] text-ctp-subtext0">{note.createdAt}</span>
                        </div>
                        <p className="text-xs text-ctp-text font-normal leading-relaxed whitespace-pre-wrap">
                          {note.text}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-ctp-surface0/50 flex items-center justify-between text-[11px] text-ctp-subtext0">
                        <span className="truncate max-w-[200px] font-medium">{note.lessonTitle}</span>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-ctp-red hover:underline font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DISCUSSION & Q&A */}
        {/* ========================================================================= */}
        {activeTab === 'qa' && (
          <div className="space-y-6 w-full">
            {/* Q&A Top Control Bar */}
            <div className="p-5 bg-white rounded-2xl border border-ctp-surface0 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search course discussion and student questions..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-ctp-base/50 border border-ctp-surface0 rounded-lg focus:outline-none focus:border-ctp-mauve"
                />
                <svg className="w-4 h-4 text-ctp-subtext0 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>

              <button
                onClick={() => setShowAskForm(!showAskForm)}
                className="px-4 py-2 text-xs font-semibold text-white bg-ctp-mauve hover:bg-[#7a2be2] rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Ask a Question</span>
              </button>
            </div>

            {/* Optional Ask Question Form */}
            {showAskForm && (
              <form onSubmit={handlePostQuestion} className="p-6 bg-white rounded-2xl border border-ctp-mauve/30 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-ctp-text">Post a Question for this Curriculum</h4>
                <input
                  type="text"
                  value={newQuestionTitle}
                  onChange={(e) => setNewQuestionTitle(e.target.value)}
                  placeholder="Summarize your question or technical blocker..."
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-ctp-base/40 border border-ctp-surface0 rounded-lg focus:outline-none focus:border-ctp-mauve"
                />
                <textarea
                  value={newQuestionBody}
                  onChange={(e) => setNewQuestionBody(e.target.value)}
                  placeholder="Provide context, code snippets, or what you've tried..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-ctp-base/40 border border-ctp-surface0 rounded-lg focus:outline-none focus:border-ctp-mauve resize-none"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAskForm(false)}
                    className="px-3 py-1.5 text-xs text-ctp-subtext0 hover:bg-ctp-mantle rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-ctp-mauve hover:bg-[#7a2be2] rounded-lg"
                  >
                    Publish Question
                  </button>
                </div>
              </form>
            )}

            {/* Questions Thread Feed */}
            <div className="space-y-3">
              {questions
                .filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.body.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((q) => (
                  <div key={q.id} className="p-5 bg-white rounded-2xl border border-ctp-surface0 shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2 text-xs text-ctp-subtext0">
                          <span className="font-semibold text-ctp-text">{q.author}</span>
                          <span>•</span>
                          <span className="text-ctp-mauve font-medium">{q.lessonTitle}</span>
                        </div>
                        <h4 className="text-sm font-bold text-ctp-text leading-snug">{q.title}</h4>
                        <p className="text-xs text-ctp-subtext1 leading-relaxed">{q.body}</p>
                      </div>

                      {/* Vote Button */}
                      <button
                        onClick={() => handleVote(q.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                          q.hasUpvoted 
                            ? 'bg-ctp-mauve/15 border-ctp-mauve text-ctp-mauve' 
                            : 'bg-ctp-base/50 border-ctp-surface0 text-ctp-subtext0 hover:border-ctp-surface1'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                        <span>{q.votes}</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-ctp-surface0/60 flex items-center justify-between text-xs text-ctp-subtext0">
                      <span className="flex items-center space-x-1.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>{q.replies} Community Responses</span>
                      </span>
                      <button className="text-ctp-mauve hover:underline font-medium cursor-pointer">
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: RESOURCES & REFERENCE LINKS */}
        {/* ========================================================================= */}
        {activeTab === 'resources' && (
          <div className="space-y-6 w-full">
            <div className="p-6 bg-white rounded-2xl border border-ctp-surface0 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-ctp-text">Verified Course References</h3>
                <p className="text-xs text-ctp-subtext0 mt-0.5">Download syllabus cheatsheets, starter code repositories, and documentation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <a
                  href="https://docs.python.org/3/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-xl bg-ctp-base/40 border border-ctp-surface0 hover:border-ctp-mauve transition-colors flex items-start justify-between group cursor-pointer"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-ctp-text group-hover:text-ctp-mauve transition-colors block">
                      Official Language Documentation & Standard Library
                    </span>
                    <p className="text-[11px] text-ctp-subtext0 leading-relaxed">
                      Comprehensive syntax references, built-in functions, and official runtime specs.
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-ctp-subtext0 group-hover:text-ctp-mauve shrink-0 ml-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>

                <div className="p-4 rounded-xl bg-ctp-base/40 border border-ctp-surface0 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-ctp-text block">
                      Curriculum Cheatsheet & Code Starter
                    </span>
                    <p className="text-[11px] text-ctp-subtext0 leading-relaxed">
                      Bundled Markdown summary containing code recipes and module exercises.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-ctp-teal bg-ctp-teal/10 border border-ctp-teal/20 px-2 py-0.5 rounded shrink-0 ml-2">
                    Included
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


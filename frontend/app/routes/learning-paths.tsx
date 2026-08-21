import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { PlatformHeader } from '../components/PlatformHeader';
import { WipFeatureBanner } from '../components/WipFeatureBanner';

export interface MilestoneItem {
  id: string;
  title: string;
  duration: string;
  moduleCount: number;
  status: 'completed' | 'in_progress' | 'upcoming';
  description: string;
  skillsAcquired: string[];
}

export default function LearningPathsRoute() {
  const navigate = useNavigate();
  const [weeklyHours, setWeeklyHours] = useState(8);

  const milestones: MilestoneItem[] = [
    {
      id: 'm1',
      title: 'Phase 1: Advanced Python Asynchronous Architecture',
      duration: '3 Weeks',
      moduleCount: 4,
      status: 'completed',
      description: 'Master async/await event loops, concurrency primitives, thread pools, and high-performance FastAPI backends.',
      skillsAcquired: ['Asyncio', 'FastAPI', 'Pydantic v2', 'Concurrency']
    },
    {
      id: 'm2',
      title: 'Phase 2: Vector Databases & Dense Embeddings',
      duration: '4 Weeks',
      moduleCount: 5,
      status: 'in_progress',
      description: 'Implement semantic vector search, HNSW indexing, cross-encoder re-ranking, and ChromaDB/Milvus clusters.',
      skillsAcquired: ['ChromaDB', 'HNSW', 'Cosine Cosine', 'Dense Retrieval']
    },
    {
      id: 'm3',
      title: 'Phase 3: LLM Multi-Agent Orchestration & Tool Calling',
      duration: '5 Weeks',
      moduleCount: 5,
      status: 'upcoming',
      description: 'Architect deterministic state machines, subagent delegation, memory compaction, and structured JSON outputs.',
      skillsAcquired: ['LangGraph', 'Agentic Patterns', 'Tool Calling', 'Token Optimization']
    },
    {
      id: 'm4',
      title: 'Phase 4: Production Evaluation, Tracing & MLOps',
      duration: '4 Weeks',
      moduleCount: 3,
      status: 'upcoming',
      description: 'Deploy LangSmith tracing, automated hallucination benchmarks, red-teaming harnesses, and Dockerized inference.',
      skillsAcquired: ['LangSmith', 'RAG Triad', 'MLOps', 'Docker Deployment']
    }
  ];

  return (
    <div className="min-h-screen bg-ctp-base flex flex-col font-sans text-ctp-text antialiased">
      <PlatformHeader />

      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-10 space-y-6">
        <WipFeatureBanner
          title="Personalized Learning Paths & Roadmaps"
          category="Curriculum Roadmaps"
          description="Builds goal-driven, multi-course learning roadmaps scheduled across your weekly availability. Seamlessly combines AI-synthesized course tracks into sequential mastery milestones."
          plannedServices={[
            "Curriculum Multi-Track Planner",
            "Weekly Study Pacing Engine",
            "Milestone Dependency Resolver",
            "Mastery Assessment Evaluator"
          ]}
        />

        {/* Pathway Header & Pacing Control Bar */}
        <div className="bg-white p-6 rounded-none border border-ctp-surface0 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ctp-surface0 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-ctp-mauve uppercase tracking-wider block">
                Active Pathway Roadmap
              </span>
              <h2 className="text-base sm:text-xl font-bold text-ctp-text mt-0.5 uppercase">
                Production AI & Distributed LLM Systems Masterpath
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-none bg-ctp-green/10 text-ctp-green border border-ctp-green/20 uppercase">
                42% Overall Pathway Completion
              </span>
            </div>
          </div>

          {/* Schedule Pacing & Time-to-Goal Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
            <div className="p-3 bg-ctp-base/50 rounded-none border border-ctp-surface0 space-y-1">
              <span className="text-ctp-subtext0 block uppercase font-bold text-[10px]">Weekly Study Commitment</span>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="4"
                  max="20"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full accent-ctp-mauve cursor-pointer"
                />
                <span className="font-bold text-ctp-text shrink-0">{weeklyHours}h / wk</span>
              </div>
            </div>

            <div className="p-3 bg-ctp-base/50 rounded-none border border-ctp-surface0 space-y-1">
              <span className="text-ctp-subtext0 block uppercase font-bold text-[10px]">Target Completion Date</span>
              <span className="font-bold text-ctp-text block text-xs sm:text-sm">
                Nov 14, 2026 (~{Math.round(96 / weeklyHours)} weeks)
              </span>
            </div>

            <div className="p-3 bg-ctp-base/50 rounded-none border border-ctp-surface0 space-y-1">
              <span className="text-ctp-subtext0 block uppercase font-bold text-[10px]">Total Curriculum Depth</span>
              <span className="font-bold text-ctp-text block text-xs sm:text-sm">
                4 Phases • 17 Modules • 51 Streams
              </span>
            </div>
          </div>
        </div>

        {/* Milestone Sequence Roadmap */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-ctp-surface0 pb-2">
            <h3 className="text-sm sm:text-base font-bold text-ctp-text uppercase">Sequential Pathway Milestones</h3>
            <span className="text-[11px] font-mono text-ctp-subtext0 uppercase">Step-by-step progression</span>
          </div>

          <div className="space-y-3">
            {milestones.map((ms, index) => (
              <div
                key={ms.id}
                className={`p-5 sm:p-6 rounded-none border transition-all bg-white shadow-2xs ${
                  ms.status === 'in_progress'
                    ? 'border-l-4 border-l-ctp-mauve border-y border-r border-ctp-surface0'
                    : ms.status === 'completed'
                      ? 'border-l-4 border-l-ctp-green border-y border-r border-ctp-surface0'
                      : 'border border-ctp-surface0'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4 min-w-0">
                    <div className={`w-8 h-8 rounded-none flex items-center justify-center font-bold font-mono text-xs shrink-0 shadow-2xs ${
                      ms.status === 'completed'
                        ? 'bg-ctp-green text-white'
                        : ms.status === 'in_progress'
                          ? 'bg-ctp-mauve text-white'
                          : 'bg-ctp-base border border-ctp-surface1 text-ctp-subtext0'
                    }`}>
                      {ms.status === 'completed' ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-ctp-text uppercase">{ms.title}</h4>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-none border uppercase tracking-wider ${
                          ms.status === 'completed'
                            ? 'bg-ctp-green/10 text-ctp-green border-ctp-green/25'
                            : ms.status === 'in_progress'
                              ? 'bg-ctp-mauve/15 text-ctp-mauve border-ctp-mauve/30'
                              : 'bg-ctp-base text-ctp-subtext0 border-ctp-surface0'
                        }`}>
                          {ms.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-mono text-ctp-subtext0">({ms.duration})</span>
                      </div>

                      <p className="text-xs text-ctp-subtext1 leading-relaxed max-w-3xl">
                        {ms.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1 font-mono">
                        {ms.skillsAcquired.map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] font-bold uppercase text-ctp-subtext0 bg-ctp-base border border-ctp-surface0 px-1.5 py-0.5 rounded-none"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={() => navigate('/generator')}
                      className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none transition-colors shadow-2xs cursor-pointer flex items-center space-x-1.5 border ${
                        ms.status === 'in_progress'
                          ? 'bg-ctp-mauve hover:bg-[#13382c] text-white border-ctp-mauve'
                          : 'bg-ctp-base hover:bg-ctp-mantle border-ctp-surface0 text-ctp-text'
                      }`}
                    >
                      <span>{ms.status === 'in_progress' ? 'Resume in Studio' : 'Open in Studio'}</span>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

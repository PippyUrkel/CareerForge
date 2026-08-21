import React, { useState } from 'react';
import { Link } from 'react-router';
import { PlatformHeader } from '../components/PlatformHeader';
import { WipFeatureBanner } from '../components/WipFeatureBanner';

export interface CareerTrack {
  id: string;
  title: string;
  category: string;
  timeline: string;
  salaryRange: string;
  demandGrowth: string;
  difficulty: 'Moderate' | 'High' | 'Aggressive';
  milestones: string[];
  keyCompetencies: string[];
}

export default function CareerPathsRoute() {
  const [activeTrackId, setActiveTrackId] = useState<string>('ai-architect');

  const tracks: CareerTrack[] = [
    {
      id: 'ai-architect',
      title: 'Principal AI Systems Architect',
      category: 'Individual Contributor Track',
      timeline: '18 – 24 Months',
      salaryRange: '$220k – $310k',
      demandGrowth: '+42% YoY Market Demand',
      difficulty: 'Aggressive',
      milestones: [
        "Master distributed vector index clustering & high-throughput inference serving.",
        "Author end-to-end evaluation harnesses (RAG Triad & automated red-teaming).",
        "Lead production deployment of multi-agent LLM systems with latency budgets."
      ],
      keyCompetencies: [
        "Vector Architecture",
        "MLOps & Tracing",
        "Cost/Token Optimization",
        "System Reliability"
      ]
    },
    {
      id: 'staff-eng',
      title: 'Staff Backend Infrastructure Engineer',
      category: 'System Architecture Track',
      timeline: '12 – 18 Months',
      salaryRange: '$190k – $260k',
      demandGrowth: '+28% YoY Market Demand',
      difficulty: 'High',
      milestones: [
        "Migrate monolith micro-services into event-driven streaming pipelines.",
        "Implement zero-trust OAuth2 / OIDC authentication fabric across services.",
        "Establish automated chaos engineering & high-availability benchmarks."
      ],
      keyCompetencies: [
        "Distributed Systems",
        "Kafka / Event Streams",
        "PostgreSQL Internals",
        "Kubernetes & Terraform"
      ]
    },
    {
      id: 'ai-product-lead',
      title: 'AI Engineering Team Lead',
      category: 'Leadership & Management Track',
      timeline: '24 – 36 Months',
      salaryRange: '$210k – $280k',
      demandGrowth: '+35% YoY Market Demand',
      difficulty: 'Moderate',
      milestones: [
        "Lead cross-functional agile sprints bridging ML research and product engineering.",
        "Establish AI safety, compliance, and hallucination reduction roadmaps.",
        "Architect technical hiring rubrics and mentor senior IC engineers."
      ],
      keyCompetencies: [
        "Technical Strategy",
        "AI Governance",
        "Sprint Velocity",
        "Cross-Team Execution"
      ]
    }
  ];

  const activeTrack = tracks.find(t => t.id === activeTrackId) || tracks[0];

  return (
    <div className="min-h-screen bg-ctp-base flex flex-col font-sans text-ctp-text antialiased">
      <PlatformHeader />

      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-10 space-y-6">
        <WipFeatureBanner
          title="Career Path & Trajectory Recommendations"
          category="Career Forecasting"
          description="Synthesizes market compensation benchmarks, career transition patterns, and milestone progression ladders tailored to your current technical foundation."
          plannedServices={[
            "Career Horizon Model",
            "Compensation Aggregator",
            "Transition Milestone Planner",
            "Adjacent Role Recommender"
          ]}
        />

        {/* Current State vs Horizon Summary */}
        <div className="p-6 bg-white rounded-none border border-ctp-surface0 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ctp-surface0 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-ctp-mauve uppercase tracking-wider block">
                Current Career Benchmark
              </span>
              <h2 className="text-base sm:text-lg font-bold text-ctp-text mt-0.5 uppercase">
                Software Engineer (AI / Backend Focus)
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-ctp-subtext0 uppercase">Estimated Market Horizon:</span>
              <span className="font-bold text-ctp-mauve bg-ctp-mauve/10 border border-ctp-mauve/25 px-2.5 py-0.5 rounded-none uppercase">
                12 to 36 Months
              </span>
            </div>
          </div>

          {/* Track Selection Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {tracks.map((track) => {
              const isSelected = track.id === activeTrackId;
              return (
                <button
                  key={track.id}
                  onClick={() => setActiveTrackId(track.id)}
                  className={`p-4 rounded-none border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-ctp-mauve/10 border-ctp-mauve shadow-2xs'
                      : 'bg-ctp-base/40 border-ctp-surface0 hover:border-ctp-surface1'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-ctp-subtext0 uppercase tracking-wider block">
                      {track.category}
                    </span>
                    <h3 className="text-sm font-bold text-ctp-text leading-snug uppercase">
                      {track.title}
                    </h3>
                  </div>

                  <div className="pt-3 mt-3 border-t border-ctp-surface0 flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-ctp-text">{track.timeline}</span>
                    <span className="text-[11px] text-ctp-green font-bold">{track.demandGrowth}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Track Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Progression Ladder & Milestones */}
          <div className="lg:col-span-8 p-6 bg-white rounded-none border border-ctp-surface0 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-ctp-surface0 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-ctp-text uppercase">
                  Milestone Progression Ladder
                </h3>
                <p className="text-xs text-ctp-subtext0 mt-0.5">
                  Actionable stepping stones for reaching {activeTrack.title}.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-none bg-ctp-mantle border border-ctp-surface0 text-ctp-subtext0 uppercase">
                3 Key Phases
              </span>
            </div>

            <div className="space-y-3">
              {activeTrack.milestones.map((milestone, idx) => (
                <div key={idx} className="p-4 rounded-none bg-ctp-base/40 border-l-2 border-l-ctp-mauve border-y border-r border-ctp-surface0 flex items-start space-x-3.5">
                  <div className="w-6 h-6 rounded-none bg-ctp-mauve text-white flex items-center justify-center font-bold font-mono text-xs shrink-0 mt-0.5 shadow-2xs">
                    {idx + 1}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-ctp-text uppercase">
                        Phase {idx + 1} Milestone
                      </h4>
                      <span className="text-[10px] font-mono text-ctp-subtext0 font-bold uppercase">
                        Month {idx * 6} – {(idx + 1) * 6}
                      </span>
                    </div>
                    <p className="text-xs text-ctp-subtext1 leading-relaxed">
                      {milestone}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Core Competencies Tagged */}
            <div className="pt-4 border-t border-ctp-surface0 space-y-2">
              <span className="text-xs font-mono font-bold text-ctp-text block uppercase">Core Architectural Competencies</span>
              <div className="flex flex-wrap gap-2">
                {activeTrack.keyCompetencies.map((comp) => (
                  <span
                    key={comp}
                    className="text-[11px] font-mono font-bold text-ctp-mauve bg-ctp-mauve/10 border border-ctp-mauve/25 px-2 py-0.5 rounded-none uppercase"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Market Compensation & Next Steps */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 bg-white rounded-none border border-ctp-surface0 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-ctp-text uppercase">Market Compensation Index</h3>

              <div className="space-y-2 p-4 bg-ctp-base/50 rounded-none border border-ctp-surface0">
                <span className="text-[10px] font-mono uppercase font-bold text-ctp-subtext0 block">Salary Range (Target Band)</span>
                <span className="text-lg font-bold font-mono text-ctp-text block">{activeTrack.salaryRange}</span>
                <span className="text-[10px] font-mono font-bold text-ctp-green uppercase block">Top 15th percentile benchmark</span>
              </div>

              <div className="space-y-2 pt-2 border-t border-ctp-surface0 text-xs font-mono">
                <div className="flex justify-between text-ctp-subtext0">
                  <span className="uppercase">Role Transition Difficulty</span>
                  <span className="font-bold text-ctp-text uppercase">{activeTrack.difficulty}</span>
                </div>
                <div className="flex justify-between text-ctp-subtext0">
                  <span className="uppercase">Target Time to Transition</span>
                  <span className="font-bold text-ctp-text uppercase">{activeTrack.timeline}</span>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  to="/skills"
                  className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-ctp-mauve hover:bg-[#13382c] rounded-none shadow-2xs transition-colors text-center block border border-ctp-mauve"
                >
                  Analyze Skill Gaps for this Role
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

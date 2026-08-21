import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { PlatformHeader } from '../components/PlatformHeader';
import { WipFeatureBanner } from '../components/WipFeatureBanner';

export interface RankedJobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  source: string;
  matchScore: number; // 0-100
  cosineSimilarity: number;
  keywordScore: number;
  experienceScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}

export default function JobMatchingRoute() {
  const navigate = useNavigate();
  const [selectedJobId, setSelectedJobId] = useState('m1');

  const rankedJobs: RankedJobMatch[] = [
    {
      id: 'm1',
      title: 'Senior LLM Infrastructure Engineer',
      company: 'Anthropic Ecosystem Partner',
      location: 'San Francisco, CA / Remote',
      salary: '$190k – $250k',
      source: 'YCombinator',
      matchScore: 94,
      cosineSimilarity: 0.96,
      keywordScore: 0.91,
      experienceScore: 0.95,
      matchedKeywords: ['Python', 'FastAPI', 'Docker', 'PostgreSQL', 'Concurrency'],
      missingKeywords: ['vLLM Distributed Serving']
    },
    {
      id: 'm2',
      title: 'AI Systems Architect (RAG & Agentic Workflows)',
      company: 'Enterprise AI Labs',
      location: 'New York, NY',
      salary: '$210k – $280k',
      source: 'LinkedIn',
      matchScore: 88,
      cosineSimilarity: 0.89,
      keywordScore: 0.85,
      experienceScore: 0.90,
      matchedKeywords: ['FastAPI', 'ChromaDB', 'SQL', 'System Architecture'],
      missingKeywords: ['LangGraph State Machines', 'LangSmith Evaluation']
    },
    {
      id: 'm3',
      title: 'Distributed Systems & ML Platform Engineer',
      company: 'Autonomous Data Systems',
      location: 'Remote (US/EU)',
      salary: '$180k – $230k',
      source: 'RemoteOK',
      matchScore: 82,
      cosineSimilarity: 0.83,
      keywordScore: 0.79,
      experienceScore: 0.84,
      matchedKeywords: ['Python', 'Docker', 'Kafka', 'REST APIs'],
      missingKeywords: ['Rust Interop', 'Milvus Cluster Deployment']
    }
  ];

  const activeJob = rankedJobs.find(j => j.id === selectedJobId) || rankedJobs[0];

  return (
    <div className="min-h-screen bg-ctp-base flex flex-col font-sans text-ctp-text antialiased">
      <PlatformHeader />

      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-10 space-y-6">
        <WipFeatureBanner
          title="AI Job Matching & Multi-Signal Ranking"
          category="Semantic Matching"
          description="Performs dense vector cosine matching, cross-encoder re-ranking, and qualification overlap analysis between your verified competencies and aggregated job postings."
          plannedServices={[
            "Candidate Vector Projector",
            "Multi-Signal Job Ranker",
            "Cross-Encoder Re-scoring Model",
            "Targeted Course Bridge"
          ]}
        />

        {/* Top Summary Bar */}
        <div className="bg-white p-5 rounded-none border border-ctp-surface0 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-none bg-ctp-mauve text-white flex items-center justify-center font-mono font-bold text-sm shadow-2xs border border-ctp-mauve">
              94%
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-ctp-text uppercase">
                Top Candidate Match Score
              </h3>
              <p className="text-xs text-ctp-subtext0">
                Calculated against 1,240 live tech job descriptions across 4 aggregated sources.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/skills"
              className="px-3.5 py-1.5 text-xs font-mono font-bold uppercase text-ctp-text bg-ctp-base hover:bg-ctp-mantle border border-ctp-surface0 rounded-none transition-colors"
            >
              View Skill Gap Matrix
            </Link>
          </div>
        </div>

        {/* Two-Column Layout: Left (Ranked Job Cards) + Right (Score Breakdown & Gap Closer) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Ranked Job Cards */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between text-xs text-ctp-subtext0 font-mono border-b border-ctp-surface0 pb-2">
              <span className="font-bold text-ctp-text uppercase">Ranked Listings ({rankedJobs.length})</span>
              <span className="uppercase">Sorted by Dense Cosine Fit</span>
            </div>

            {rankedJobs.map((job) => {
              const isSelected = job.id === selectedJobId;
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-5 rounded-none border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white border-l-4 border-l-ctp-mauve border-y border-r border-ctp-mauve shadow-2xs'
                      : 'bg-white border border-ctp-surface0 hover:border-ctp-surface1 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-ctp-mauve uppercase">{job.company}</span>
                      <h4 className="text-sm sm:text-base font-bold text-ctp-text mt-0.5 uppercase">
                        {job.title}
                      </h4>
                      <p className="text-xs font-mono text-ctp-subtext0 mt-0.5">{job.location} • {job.source}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base sm:text-lg font-extrabold font-mono text-ctp-mauve block">
                        {job.matchScore}%
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ctp-green block">
                        Strong Fit
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-ctp-surface0 flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-ctp-green">{job.salary}</span>
                    <span className="text-[10px] text-ctp-subtext0 uppercase">
                      {job.missingKeywords.length === 0 ? 'All skills matched' : `${job.missingKeywords.length} gap identified`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Match Deconstruction & Course Bridge */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-white rounded-none border border-ctp-surface0 shadow-2xs space-y-4 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-ctp-surface0">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ctp-subtext0 block">
                    Match Decomposition
                  </span>
                  <h3 className="text-sm font-bold text-ctp-text uppercase">
                    {activeJob.title}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-none bg-ctp-mauve/15 text-ctp-mauve border border-ctp-mauve/25 uppercase">
                  {activeJob.matchScore}% Fit
                </span>
              </div>

              {/* Multi-Signal Breakdown Metrics */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-ctp-subtext0">
                  <span className="uppercase">Dense Semantic Cosine Similarity</span>
                  <strong className="text-ctp-text">{Math.round(activeJob.cosineSimilarity * 100)}%</strong>
                </div>
                <div className="flex justify-between items-center text-ctp-subtext0">
                  <span className="uppercase">Keyword & Skill Intersect</span>
                  <strong className="text-ctp-text">{Math.round(activeJob.keywordScore * 100)}%</strong>
                </div>
                <div className="flex justify-between items-center text-ctp-subtext0">
                  <span className="uppercase">Seniority & Domain Experience</span>
                  <strong className="text-ctp-text">{Math.round(activeJob.experienceScore * 100)}%</strong>
                </div>
              </div>

              {/* Matched Skills */}
              <div className="space-y-1.5 pt-2 border-t border-ctp-surface0">
                <span className="text-[10px] font-mono uppercase font-bold text-ctp-subtext0 block">Verified Qualifications</span>
                <div className="flex flex-wrap gap-1.5 font-mono">
                  {activeJob.matchedKeywords.map((kw) => (
                    <span key={kw} className="text-[10px] font-bold uppercase text-ctp-green bg-ctp-green/10 border border-ctp-green/20 px-1.5 py-0.5 rounded-none">
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills with 1-Click Course Generator Bridge */}
              {activeJob.missingKeywords.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-ctp-surface0">
                  <span className="text-[10px] font-mono uppercase font-bold text-ctp-red block">Missing Competencies</span>
                  <div className="space-y-2">
                    {activeJob.missingKeywords.map((kw) => (
                      <div key={kw} className="p-3 rounded-none bg-ctp-red/5 border border-ctp-red/20 flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-ctp-red uppercase">{kw}</span>
                        <button
                          onClick={() => navigate('/generator')}
                          className="px-2.5 py-1 rounded-none text-[10px] font-mono font-bold uppercase bg-ctp-mauve hover:bg-[#13382c] text-white shadow-2xs transition-colors cursor-pointer border border-ctp-mauve"
                        >
                          Generate Course
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Apply Button */}
              <div className="pt-2">
                <button className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-ctp-mauve hover:bg-[#13382c] rounded-none shadow-2xs transition-colors cursor-pointer border border-ctp-mauve">
                  Submit Direct Application
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

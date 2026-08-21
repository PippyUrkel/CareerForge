import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { PlatformHeader } from '../components/PlatformHeader';
import { WipFeatureBanner } from '../components/WipFeatureBanner';

export interface AggregatedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  source: 'LinkedIn' | 'Indeed' | 'RemoteOK' | 'YCombinator';
  postedAt: string;
  techStack: string[];
  isRemote: boolean;
}

export default function JobAggregatorRoute() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'All' | 'LinkedIn' | 'Indeed' | 'RemoteOK' | 'YCombinator'>('All');
  const [remoteOnly, setRemoteOnly] = useState(false);

  const rawJobs: AggregatedJob[] = [
    {
      id: 'j1',
      title: 'Senior LLM Infrastructure Engineer',
      company: 'Anthropic Ecosystem Partner',
      location: 'San Francisco, CA / Remote',
      salary: '$190k – $250k • Equity',
      source: 'YCombinator',
      postedAt: '2 hours ago',
      techStack: ['Python', 'FastAPI', 'vLLM', 'Triton', 'Kubernetes'],
      isRemote: true
    },
    {
      id: 'j2',
      title: 'AI Systems Architect (RAG & Agentic Workflows)',
      company: 'Enterprise AI Labs',
      location: 'New York, NY',
      salary: '$210k – $280k • Equity',
      source: 'LinkedIn',
      postedAt: '5 hours ago',
      techStack: ['LangGraph', 'ChromaDB', 'PostgreSQL', 'FastAPI'],
      isRemote: false
    },
    {
      id: 'j3',
      title: 'Distributed Systems & ML Platform Engineer',
      company: 'Autonomous Data Systems',
      location: 'Remote (US/EU)',
      salary: '$180k – $230k',
      source: 'RemoteOK',
      postedAt: '1 day ago',
      techStack: ['Rust', 'Python', 'Kafka', 'Docker', 'Milvus'],
      isRemote: true
    },
    {
      id: 'j4',
      title: 'Backend Python Engineer (AI Services)',
      company: 'CloudScale Intelligence',
      location: 'Austin, TX / Remote',
      salary: '$160k – $210k',
      source: 'Indeed',
      postedAt: '2 days ago',
      techStack: ['Python', 'FastAPI', 'Redis', 'AWS Lambda', 'OpenAI API'],
      isRemote: true
    }
  ];

  const filteredJobs = useMemo(() => {
    return rawJobs.filter((job) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.techStack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSource = sourceFilter === 'All' || job.source === sourceFilter;
      const matchRemote = !remoteOnly || job.isRemote;

      return matchSearch && matchSource && matchRemote;
    });
  }, [rawJobs, searchQuery, sourceFilter, remoteOnly]);

  return (
    <div className="min-h-screen bg-ctp-base flex flex-col font-sans text-ctp-text antialiased">
      <PlatformHeader />

      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-10 space-y-6">
        {/* WIP Feature Banner */}
        <WipFeatureBanner
          title="Multi-Source Job Aggregator & Real-Time Index"
          category="Market Intelligence"
          description="Continuously ingests and normalizes technical job listings across global developer boards, API partners, and ATS feeds into a structured search index."
          plannedServices={[
            "Multi-Platform Ingestion Worker",
            "Job Taxonomy Normalizer",
            "Salary Benchmarking Model",
            "ATS Direct Feed Connector"
          ]}
        />

        {/* Search & Ingestion Filter Bar */}
        <div className="bg-white p-5 rounded-none border border-ctp-surface0 shadow-2xs space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search aggregated jobs by role, company, or technology (e.g., PyTorch, Kubernetes, vLLM)..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-ctp-base/40 border border-ctp-surface0 rounded-none focus:outline-none focus:border-ctp-mauve font-mono"
            />
            <svg className="w-4 h-4 text-ctp-subtext0 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-ctp-subtext0 font-bold mr-1 text-[10px] uppercase">Aggregated Source:</span>
              {(['All', 'LinkedIn', 'Indeed', 'RemoteOK', 'YCombinator'] as const).map((src) => (
                <button
                  key={src}
                  onClick={() => setSourceFilter(src)}
                  className={`px-2.5 py-0.5 rounded-none font-bold uppercase transition-colors cursor-pointer border ${
                    sourceFilter === src
                      ? 'bg-ctp-mauve text-white border-ctp-mauve shadow-2xs'
                      : 'bg-ctp-base/80 border border-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text'
                  }`}
                >
                  {src}
                </button>
              ))}
            </div>

            <label className="flex items-center space-x-2 text-xs text-ctp-text font-bold uppercase cursor-pointer">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="rounded-none text-ctp-mauve focus:ring-ctp-mauve"
              />
              <span>Remote Postings Only</span>
            </label>
          </div>
        </div>

        {/* Job Listings Stream */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-ctp-subtext0 font-mono border-b border-ctp-surface0 pb-2">
            <span className="uppercase font-bold">Showing {filteredJobs.length} Aggregated Postings</span>
            <Link to="/jobs/matching" className="font-bold text-ctp-mauve hover:underline uppercase">
              Rank by My AI Match Score →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 bg-white rounded-none border border-ctp-surface0 hover:border-ctp-mauve shadow-2xs transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap font-mono">
                      <span className="text-xs font-bold text-ctp-mauve uppercase">{job.company}</span>
                      <span className="text-ctp-subtext0 text-xs">•</span>
                      <span className="text-xs text-ctp-subtext0">{job.location}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-none bg-ctp-base border border-ctp-surface0 text-ctp-subtext0 uppercase">
                        {job.source}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-ctp-text leading-snug uppercase">
                      {job.title}
                    </h4>

                    <span className="text-xs font-mono font-bold text-ctp-green block">
                      {job.salary}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <Link
                      to="/jobs/matching"
                      className="px-3 py-1.5 text-xs font-mono font-bold uppercase text-ctp-mauve bg-ctp-mauve/10 border border-ctp-mauve/25 rounded-none hover:bg-ctp-mauve/20 transition-colors"
                    >
                      Analyze Match
                    </Link>
                    <button className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-ctp-mauve hover:bg-[#13382c] rounded-none shadow-2xs transition-colors cursor-pointer border border-ctp-mauve">
                      Apply Direct
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-ctp-surface0 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex flex-wrap gap-1.5">
                    {job.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-bold uppercase text-ctp-subtext0 bg-ctp-base border border-ctp-surface0 px-1.5 py-0.5 rounded-none"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-ctp-subtext0 uppercase">
                    Indexed {job.postedAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

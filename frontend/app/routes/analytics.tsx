import React from 'react';
import { Link } from 'react-router';
import { PlatformHeader } from '../components/PlatformHeader';
import { WipFeatureBanner } from '../components/WipFeatureBanner';

export default function AnalyticsRoute() {
  const weeklyStudyHours = [
    { day: 'Mon', hours: 3.5 },
    { day: 'Tue', hours: 4.0 },
    { day: 'Wed', hours: 2.5 },
    { day: 'Thu', hours: 5.0 },
    { day: 'Fri', hours: 3.0 },
    { day: 'Sat', hours: 2.0 },
    { day: 'Sun', hours: 2.0 }
  ];

  const maxHours = Math.max(...weeklyStudyHours.map(d => d.hours));

  const skillDomains = [
    { domain: 'AI & LLM Architecture', percentage: 78, color: 'bg-ctp-mauve' },
    { domain: 'Backend Engineering & Systems', percentage: 92, color: 'bg-ctp-green' },
    { domain: 'Vector Databases & Storage', percentage: 65, color: 'bg-ctp-teal' },
    { domain: 'MLOps & Tracing', percentage: 48, color: 'bg-ctp-peach' }
  ];

  const recentMilestones = [
    { title: 'Completed Module: Asynchronous FastApi Internals', date: 'Yesterday', category: 'Backend' },
    { title: 'Synthesized Course: Vector Search with HNSW', date: '3 days ago', category: 'Curriculum' },
    { title: 'Matched Top Job: Senior LLM Infrastructure Engineer (94%)', date: '5 days ago', category: 'Career' },
    { title: 'Passed Assessment: Python Memory Profiling', date: '1 week ago', category: 'Verification' }
  ];

  return (
    <div className="min-h-screen bg-ctp-base flex flex-col font-sans text-ctp-text antialiased">
      <PlatformHeader />

      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-10 space-y-6">
        <WipFeatureBanner
          title="Talent Analytics & Telemetry Dashboard"
          category="Telemetry & Growth"
          description="Real-time telemetry tracking your educational velocity, competency acquisition curves, market readiness indices, and verified assessment milestones."
          plannedServices={[
            "Learning Velocity Aggregator",
            "Skill Graph Vectorizer",
            "Market Readiness Predictor",
            "Telemetry Time-Series Service"
          ]}
        />

        {/* Top 4 KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-none border border-ctp-surface0 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-ctp-subtext0 block">Learning Velocity</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-ctp-mauve">22.0h</span>
              <span className="text-xs font-mono font-bold text-ctp-green">+18% vs last week</span>
            </div>
            <span className="text-[10px] font-mono text-ctp-subtext0 block uppercase">7 study sessions recorded</span>
          </div>

          <div className="p-5 bg-white rounded-none border border-ctp-surface0 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-ctp-subtext0 block">Acquired Skills</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-ctp-sapphire">18 Skills</span>
              <span className="text-xs font-mono font-bold text-ctp-green">+4 new this month</span>
            </div>
            <span className="text-[10px] font-mono text-ctp-subtext0 block uppercase">100% verified by benchmarks</span>
          </div>

          <div className="p-5 bg-white rounded-none border border-ctp-surface0 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-ctp-subtext0 block">Market Readiness Index</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-ctp-teal">92%</span>
              <span className="text-xs font-mono font-bold text-ctp-green">Top Tier Fit</span>
            </div>
            <span className="text-[10px] font-mono text-ctp-subtext0 block uppercase">Target: Senior AI Systems Eng</span>
          </div>

          <div className="p-5 bg-white rounded-none border border-ctp-surface0 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-ctp-subtext0 block">Courses Synthesized</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-ctp-peach">10 Tracks</span>
              <span className="text-xs font-mono text-ctp-subtext0">in database</span>
            </div>
            <span className="text-[10px] font-mono text-ctp-subtext0 block uppercase">Saved in careerforge.db</span>
          </div>
        </div>

        {/* Charts & Analytics Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Weekly Study Distribution (Visual Chart) */}
          <div className="lg:col-span-7 p-6 bg-white rounded-none border border-ctp-surface0 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-ctp-surface0 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-ctp-text uppercase">Weekly Study Hours Distribution</h3>
                <p className="text-xs text-ctp-subtext0 mt-0.5">Hours spent watching synthesized lectures and completing modules.</p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-none bg-ctp-mantle border border-ctp-surface0 text-ctp-subtext0 uppercase">
                Last 7 Days
              </span>
            </div>

            {/* Custom Bar Graph */}
            <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-ctp-surface0 pb-2">
              {weeklyStudyHours.map((item) => {
                const heightPercent = Math.round((item.hours / maxHours) * 100);
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono font-bold text-ctp-subtext0 group-hover:text-ctp-mauve transition-colors">
                      {item.hours}h
                    </span>
                    <div className="w-full bg-ctp-base/80 rounded-none h-36 flex items-end p-1 border border-ctp-surface0">
                      <div
                        className="w-full bg-ctp-mauve rounded-none transition-all duration-500 group-hover:bg-[#13382c]"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-ctp-subtext0 uppercase">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Domain Distribution & Skill Balance */}
          <div className="lg:col-span-5 p-6 bg-white rounded-none border border-ctp-surface0 shadow-2xs space-y-5">
            <div className="border-b border-ctp-surface0 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-ctp-text uppercase">Domain Competency Balance</h3>
              <p className="text-xs text-ctp-subtext0 mt-0.5">Knowledge distribution across technical disciplines.</p>
            </div>

            <div className="space-y-4">
              {skillDomains.map((domain) => (
                <div key={domain.domain} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-bold text-ctp-text uppercase">{domain.domain}</span>
                    <span className="font-bold text-ctp-subtext0">{domain.percentage}%</span>
                  </div>
                  <div className="w-full bg-ctp-surface0 rounded-none h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-none ${domain.color}`}
                      style={{ width: `${domain.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Platform Milestones Feed */}
        <div className="p-6 bg-white rounded-none border border-ctp-surface0 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-ctp-surface0 pb-3">
            <h3 className="text-sm sm:text-base font-bold text-ctp-text uppercase">Recent Milestone Timeline</h3>
            <Link to="/generator" className="text-xs font-bold text-ctp-mauve hover:underline uppercase">
              Synthesize New Module →
            </Link>
          </div>

          <div className="divide-y divide-ctp-surface0">
            {recentMilestones.map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-2 h-2 rounded-none bg-ctp-mauve shrink-0" />
                  <span className="font-bold text-ctp-text truncate uppercase">{item.title}</span>
                </div>
                <div className="flex items-center space-x-3 shrink-0 text-ctp-subtext0">
                  <span className="px-1.5 py-0.2 rounded-none bg-ctp-base border border-ctp-surface0 text-[10px] font-bold uppercase">
                    {item.category}
                  </span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

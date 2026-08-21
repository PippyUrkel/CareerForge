import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { PlatformHeader } from '../components/PlatformHeader';
import { WipFeatureBanner } from '../components/WipFeatureBanner';

export interface SkillGapItem {
  name: string;
  category: string;
  currentLevel: number; // 0-100%
  requiredLevel: number; // 0-100%
  status: 'matched' | 'developing' | 'missing';
  marketDemand: 'High' | 'Very High' | 'Critical';
}

export default function SkillsGapAnalysisRoute() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('Senior AI Systems Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level (3-5 yrs)');

  const skills: SkillGapItem[] = [
    {
      name: "Vector Databases & Dense Retrieval",
      category: "AI Infrastructure",
      currentLevel: 35,
      requiredLevel: 85,
      status: 'missing',
      marketDemand: 'Critical'
    },
    {
      name: "LLM Orchestration (LangChain / LlamaIndex)",
      category: "AI Engineering",
      currentLevel: 55,
      requiredLevel: 90,
      status: 'developing',
      marketDemand: 'Very High'
    },
    {
      name: "Python Asynchronous Systems (FastAPI)",
      category: "Backend Architecture",
      currentLevel: 92,
      requiredLevel: 80,
      status: 'matched',
      marketDemand: 'High'
    },
    {
      name: "Distributed Tracing & Evaluation (LangSmith)",
      category: "MLOps",
      currentLevel: 20,
      requiredLevel: 75,
      status: 'missing',
      marketDemand: 'Very High'
    },
    {
      name: "SQL & Relational Schema Design",
      category: "Data Engineering",
      currentLevel: 88,
      requiredLevel: 70,
      status: 'matched',
      marketDemand: 'High'
    },
    {
      name: "Fine-Tuning & Quantization (LoRA / QLoRA)",
      category: "Model Optimization",
      currentLevel: 45,
      requiredLevel: 80,
      status: 'developing',
      marketDemand: 'Critical'
    }
  ];

  const overallFitPercent = 64;
  const matchedCount = skills.filter(s => s.status === 'matched').length;
  const developingCount = skills.filter(s => s.status === 'developing').length;
  const missingCount = skills.filter(s => s.status === 'missing').length;

  const handleGenerateForSkill = (skillName: string) => {
    navigate(`/generator?topic=${encodeURIComponent(skillName)}&title=${encodeURIComponent(`Mastering ${skillName}`)}`);
  };

  return (
    <div className="min-h-screen bg-ctp-base flex flex-col font-sans text-ctp-text antialiased">
      <PlatformHeader />

      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-10 space-y-6">
        <WipFeatureBanner
          title="AI Skill Gap Analysis & Matrix"
          category="Talent Intelligence Engine"
          description="Deconstruct your technical competency profile against real-time market role benchmarks. CareerForge isolates competency deltas and automatically synthesizes targeted curriculum bridges."
          plannedServices={[
            "Semantic Resume Parser",
            "Market Skill Vector Extractor",
            "Competency Delta Scorer",
            "Auto-Course Generator Bridge"
          ]}
        />

        {/* Role & Profile Selector Bar */}
        <div className="bg-white p-5 rounded-none border border-ctp-surface0 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-ctp-subtext0 mb-1">
                Target Role Benchmark
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-ctp-base/50 border border-ctp-surface0 rounded-none focus:outline-none focus:border-ctp-mauve font-mono"
              >
                <option value="Senior AI Systems Engineer">Senior AI Systems Engineer</option>
                <option value="Full-Stack Python Architect">Full-Stack Python Architect</option>
                <option value="Cloud Infrastructure Lead">Cloud Infrastructure Lead</option>
                <option value="Data Science & ML Specialist">Data Science & ML Specialist</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-ctp-subtext0 mb-1">
                Current Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-ctp-base/50 border border-ctp-surface0 rounded-none focus:outline-none focus:border-ctp-mauve font-mono"
              >
                <option value="Junior (1-2 yrs)">Junior (1-2 yrs)</option>
                <option value="Mid-Level (3-5 yrs)">Mid-Level (3-5 yrs)</option>
                <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 pt-2 md:pt-0">
            <button className="px-4 py-2 text-xs font-mono font-bold uppercase text-ctp-text bg-ctp-base hover:bg-ctp-mantle border border-ctp-surface0 rounded-none transition-colors cursor-pointer flex items-center space-x-1.5">
              <svg className="w-3.5 h-3.5 text-ctp-mauve" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>Upload Resume (PDF)</span>
            </button>
          </div>
        </div>

        {/* Competency Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-none border border-ctp-surface0 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-ctp-subtext0 block">Market Role Alignment</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-ctp-mauve">{overallFitPercent}%</span>
              <span className="text-xs text-ctp-green font-mono font-bold">+8% this month</span>
            </div>
            <div className="w-full bg-ctp-surface0 rounded-none h-1 mt-2 overflow-hidden">
              <div className="bg-ctp-mauve h-1 rounded-none" style={{ width: `${overallFitPercent}%` }} />
            </div>
          </div>

          <div className="p-5 bg-white rounded-none border border-ctp-surface0 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-ctp-subtext0 block">Verified Proficiencies</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-ctp-green">{matchedCount}</span>
              <span className="text-xs font-mono text-ctp-subtext0">of {skills.length} skills</span>
            </div>
            <span className="text-[11px] font-mono text-ctp-green font-bold uppercase">Ready for deployment</span>
          </div>

          <div className="p-5 bg-white rounded-none border border-ctp-surface0 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-ctp-subtext0 block">Developing Skills</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-ctp-peach">{developingCount}</span>
              <span className="text-xs font-mono text-ctp-subtext0">in progress</span>
            </div>
            <span className="text-[11px] font-mono text-ctp-peach font-bold uppercase">~2 weeks to mastery</span>
          </div>

          <div className="p-5 bg-white rounded-none border border-ctp-surface0 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-ctp-subtext0 block">Critical Skill Gaps</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-ctp-red">{missingCount}</span>
              <span className="text-xs font-mono text-ctp-subtext0">unacquired</span>
            </div>
            <span className="text-[11px] font-mono text-ctp-red font-bold uppercase">High priority for target role</span>
          </div>
        </div>

        {/* Detailed Competency Matrix Table */}
        <div className="bg-white rounded-none border border-ctp-surface0 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-ctp-surface0 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-ctp-text uppercase">
                Competency Delta Breakdown
              </h3>
              <p className="text-xs text-ctp-subtext0 mt-0.5">
                Comparison of your current proficiency vs market requirements for {selectedRole}.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-none bg-ctp-mantle border border-ctp-surface0 text-ctp-subtext0 uppercase">
              {skills.length} Tracked Competencies
            </span>
          </div>

          <div className="divide-y divide-ctp-surface0 overflow-x-auto">
            {skills.map((skill) => (
              <div key={skill.name} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-ctp-base/30 transition-colors">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs sm:text-sm font-bold text-ctp-text uppercase">{skill.name}</h4>
                    <span className="text-[10px] font-mono text-ctp-subtext0 font-bold px-1.5 py-0.2 rounded-none bg-ctp-base border border-ctp-surface0 uppercase">
                      {skill.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-none border uppercase tracking-wider ${
                      skill.status === 'matched'
                        ? 'bg-ctp-green/10 text-ctp-green border-ctp-green/25'
                        : skill.status === 'developing'
                          ? 'bg-ctp-peach/10 text-ctp-peach border-ctp-peach/25'
                          : 'bg-ctp-red/10 text-ctp-red border-ctp-red/25'
                    }`}>
                      {skill.status}
                    </span>
                  </div>

                  {/* Skill Progress Bar comparison */}
                  <div className="space-y-1 max-w-md">
                    <div className="flex justify-between text-[10px] font-mono text-ctp-subtext0">
                      <span>Current: <strong className="text-ctp-text">{skill.currentLevel}%</strong></span>
                      <span>Target: <strong className="text-ctp-text">{skill.requiredLevel}%</strong></span>
                    </div>
                    <div className="w-full bg-ctp-surface0 rounded-none h-1 overflow-hidden flex">
                      <div
                        className={`h-1 rounded-none ${
                          skill.status === 'matched' ? 'bg-ctp-green' : skill.status === 'developing' ? 'bg-ctp-peach' : 'bg-ctp-red'
                        }`}
                        style={{ width: `${skill.currentLevel}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right hidden md:block">
                    <span className="text-[10px] font-mono text-ctp-subtext0 block uppercase font-bold">Market Demand</span>
                    <span className="text-xs font-mono font-bold text-ctp-text">{skill.marketDemand}</span>
                  </div>

                  {skill.status !== 'matched' ? (
                    <button
                      onClick={() => handleGenerateForSkill(skill.name)}
                      className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-ctp-mauve hover:bg-[#13382c] rounded-none shadow-2xs transition-colors cursor-pointer flex items-center space-x-1 border border-ctp-mauve"
                    >
                      <span>Synthesize Course</span>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase text-ctp-green bg-ctp-green/10 border border-ctp-green/20 rounded-none">
                      Competency Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

import React from 'react';
import { Link } from "react-router";
import { PlatformHeader } from "../components/PlatformHeader";
import ParticleText from "../components/ParticleText";
import LiquidEther from "../components/LiquidEther";

export function Welcome() {
  const platformFeatures = [
    {
      title: "AI Course Generator & Studio",
      path: "/generator",
      category: "Core Engine",
      description: "Synthesize structured multi-module courses with multi-signal video ranking, taxonomy generation, and database persistence.",
      status: "Active Engine",
      isWip: false,
      badgeColor: "bg-ctp-green/10 text-ctp-green border-ctp-green/30",
      ctaText: "Launch Studio"
    },
    {
      title: "AI Skill Gap Analysis",
      path: "/skills",
      category: "Talent Intelligence",
      description: "Deconstruct your competency profile against live industry job taxonomies and generate targeted modules to bridge deficiencies.",
      status: "Spec Preview",
      isWip: true,
      badgeColor: "bg-ctp-peach/10 text-ctp-peach border-ctp-peach/30",
      ctaText: "Explore Matrix"
    },
    {
      title: "Career Path Recommendations",
      path: "/careers",
      category: "Career Forecasting",
      description: "Explore progression ladders, salary benchmarks, and milestone roadmaps for IC, management, and executive technical tracks.",
      status: "Spec Preview",
      isWip: true,
      badgeColor: "bg-ctp-peach/10 text-ctp-peach border-ctp-peach/30",
      ctaText: "View Trajectories"
    },
    {
      title: "Personalized Learning Paths",
      path: "/learning-paths",
      category: "Curriculum Roadmaps",
      description: "Multi-course milestone roadmaps scheduled around your weekly hours commitment with dynamic completion estimation.",
      status: "Spec Preview",
      isWip: true,
      badgeColor: "bg-ctp-peach/10 text-ctp-peach border-ctp-peach/30",
      ctaText: "View Roadmaps"
    },
    {
      title: "AI Job Matching & Ranking",
      path: "/jobs/matching",
      category: "Semantic Matching",
      description: "Dense vector cosine similarity and cross-encoder re-ranking matching your verified skills against global postings.",
      status: "Spec Preview",
      isWip: true,
      badgeColor: "bg-ctp-peach/10 text-ctp-peach border-ctp-peach/30",
      ctaText: "View Matches"
    },
    {
      title: "Job Aggregator & Multi-Source Feed",
      path: "/jobs",
      category: "Market Ingestion",
      description: "Unified aggregator collecting live tech job opportunities from LinkedIn, Indeed, RemoteOK, and developer boards.",
      status: "Spec Preview",
      isWip: true,
      badgeColor: "bg-ctp-peach/10 text-ctp-peach border-ctp-peach/30",
      ctaText: "Browse Index"
    },
    {
      title: "Analytics & Talent Dashboard",
      path: "/analytics",
      category: "Telemetry & Growth",
      description: "Track study velocity, competency acquisition curves, market readiness indices, and verified assessment milestones.",
      status: "Spec Preview",
      isWip: true,
      badgeColor: "bg-ctp-peach/10 text-ctp-peach border-ctp-peach/30",
      ctaText: "Open Telemetry"
    }
  ];

  return (
    <div className="min-h-screen bg-ctp-base flex flex-col font-sans text-ctp-text antialiased relative overflow-hidden">
      {/* Ambient Interactive Liquid Ether Background Canvas */}
      {/* <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-35">
        <LiquidEther
          colors={['#13382c', '#1b4d3e', '#2d6a4f', '#40916c', '#52b788', '#95d5b2']}
          mouseForce={25}
          cursorSize={110}
          isViscous={false}
          resolution={0.45}
          autoDemo={true}
          autoSpeed={0.35}
          autoIntensity={1.8}
        />
      </div> */}

      <div className="relative z-10 flex flex-col min-h-screen">
        <PlatformHeader />

        <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-10 space-y-6">
          {/* Integrated Hero Frame with Sharp Corners and Light Mode ParticleText */}
          <div className="p-6 sm:p-8 lg:p-10 bg-white/95 backdrop-blur-xs border border-ctp-surface0 shadow-2xs space-y-6 rounded-none">
            {/* Top Technical Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ctp-surface0 pb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-ctp-green" />
                <span className="font-mono text-xs font-bold text-ctp-text tracking-wider uppercase">
                  CAREERFORGE // AUTONOMOUS TALENT & LEARNING ECOSYSTEM
                </span>
              </div>

              <span className="font-mono text-[11px] text-ctp-subtext0 font-semibold uppercase">
                STATUS: PRODUCTION SPEC • 7 SUBSYSTEMS
              </span>
            </div>

            {/* Light-Mode Particle Canvas Showcase in Crisp Rectangular Frame */}
            <div className="w-full h-44 sm:h-56 lg:h-64 bg-ctp-mantle/40 border border-ctp-surface0 relative flex items-center justify-center overflow-hidden group rounded-none">
              <ParticleText
                text="CareerForge"
                particleSize={2.2}
                density={4}
                color="#1b4d3e"
                highlightColor="#2d6a4f"
                scatter={160}
                gatherDuration={1500}
                stagger={380}
                pointerRepel={45}
                repelRadius={125}
                idleDrift={0.6}
                trigger="hover"
                fontSize="clamp(5rem, 12vw, 10rem)"
                fontWeight={900}
                fontFamily="inherit"
                glow
              />
            </div>

            {/* Hero Headline & Summary */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-ctp-text tracking-tight uppercase">
                YOUR AI-POWERED CAREER COMPASS
              </h1>

              <p className="text-xs sm:text-sm text-ctp-subtext1 leading-relaxed max-w-4xl">
                An architectural talent platform combining automated video course generation, real-time competency gap analysis, dense vector job matching, and career trajectory forecasting.
              </p>
            </div>

            {/* Sharp Action Buttons */}
            <div className="flex flex-wrap items-center justify-start gap-2.5 pt-2 border-t border-ctp-surface0">
              <Link
                to="/generator"
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-ctp-mauve hover:bg-[#13382c] active:bg-[#0c241c] transition-colors shadow-2xs border border-ctp-mauve flex items-center space-x-2 cursor-pointer rounded-none"
              >
                <span>Launch Course Studio</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>

              <Link
                to="/skills"
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-ctp-text bg-white hover:bg-ctp-base border border-ctp-surface0 transition-colors rounded-none"
              >
                Skill Gap Matrix
              </Link>

              <Link
                to="/jobs/matching"
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-ctp-subtext1 hover:text-ctp-text bg-white hover:bg-ctp-base border border-ctp-surface0 transition-colors rounded-none"
              >
                AI Job Matches
              </Link>
            </div>
          </div>

          {/* Feature Grid Section - Sharp Geometric Panels */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-ctp-surface0 pb-2">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-ctp-text tracking-tight uppercase">
                  Platform Architecture & Modules
                </h2>
              </div>
              <span className="text-[11px] font-mono font-bold text-ctp-subtext0 uppercase">
                7 Core Subsystems
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {platformFeatures.map((feat) => (
                <Link
                  key={feat.path}
                  to={feat.path}
                  className="p-5 bg-white/95 backdrop-blur-xs border border-ctp-surface0 hover:border-ctp-mauve shadow-2xs transition-all flex flex-col justify-between group space-y-4 rounded-none"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-ctp-subtext0 uppercase tracking-wider">
                        {feat.category}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 border uppercase tracking-wider rounded-none ${feat.badgeColor}`}>
                        {feat.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-ctp-text group-hover:text-ctp-mauve transition-colors uppercase">
                      {feat.title}
                    </h3>

                    <p className="text-xs text-ctp-subtext1 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-ctp-surface0 flex items-center justify-between text-xs font-mono font-semibold text-ctp-mauve group-hover:text-[#13382c]">
                    <span>{feat.ctaText} →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

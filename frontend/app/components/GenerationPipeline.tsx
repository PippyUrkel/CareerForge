import React, { useEffect, useState } from 'react';

const PIPELINE_STEPS = [
  { id: 'init', label: 'Initializing AI Curriculum Agent', description: 'Setting up model parameters and parsing constraints' },
  { id: 'curriculum', label: 'Synthesizing Course Structure', description: 'Generating comprehensive modules and topic breakdown' },
  { id: 'sourcing', label: 'Curating & Ranking Video Content', description: 'Matching high-relevance educational lectures from library' },
  { id: 'assembling', label: 'Finalizing Course Experience', description: 'Formatting timestamps, metadata, and lecture sequencing' }
];

interface GenerationPipelineProps {
  onComplete?: () => void;
}

export function GenerationPipeline({ onComplete }: GenerationPipelineProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const totalSteps = PIPELINE_STEPS.length;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < totalSteps - 1) {
          const next = prev + 1;
          setProgress(Math.round(((next + 1) / totalSteps) * 90));
          return next;
        }
        setProgress(98);
        return prev;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white text-ctp-text p-6">
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-ctp-mauve/10 text-ctp-mauve mb-2.5 border border-ctp-mauve/25">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
        </div>
        <h3 className="text-base font-bold text-ctp-text tracking-tight">
          Synthesizing Curriculum Pipeline
        </h3>
        <p className="text-xs text-ctp-subtext0 mt-0.5">
          Ranking video candidates and sequencing course lectures
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-ctp-surface0 rounded-full h-1.5 mt-4 overflow-hidden">
          <div 
            className="bg-ctp-mauve h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {PIPELINE_STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div 
              key={step.id} 
              className={`flex items-start p-3 rounded-xl transition-colors border ${
                isActive 
                  ? 'bg-ctp-mauve/5 border-ctp-mauve/30' 
                  : isCompleted 
                    ? 'bg-ctp-green/5 border-ctp-green/20' 
                    : 'bg-ctp-base/30 border-ctp-surface0/50 opacity-60'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isCompleted ? (
                  <div className="w-5 h-5 rounded-md bg-ctp-green flex items-center justify-center text-white">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-md border-2 border-ctp-mauve border-t-transparent animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-md border border-ctp-surface1 bg-white flex items-center justify-center text-[10px] text-ctp-subtext0 font-semibold">
                    {index + 1}
                  </div>
                )}
              </div>

              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-semibold ${
                    isCompleted ? 'text-ctp-text' : isActive ? 'text-ctp-mauve' : 'text-ctp-subtext0'
                  }`}>
                    {step.label}
                  </p>
                  {isActive && (
                    <span className="text-[10px] font-medium text-ctp-mauve">
                      Processing...
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[10px] font-medium text-ctp-green">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-ctp-subtext0 mt-0.5 leading-snug">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

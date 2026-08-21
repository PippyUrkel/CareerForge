import React from 'react';
import { Link } from 'react-router';

export interface WipFeatureBannerProps {
  title: string;
  category: string;
  description: string;
  badgeLabel?: string;
  plannedServices?: string[];
}

/**
 * WipFeatureBanner renders a crisp architectural notice on sketched feature pages,
 * with sharp geometric framing and clear technical indicators.
 */
export function WipFeatureBanner({
  title,
  category,
  description,
  badgeLabel = "WIP // SPECIFICATION PREVIEW",
  plannedServices = []
}: WipFeatureBannerProps) {
  return (
    <div className="w-full bg-white p-5 sm:p-6 border-l-4 border-l-ctp-peach border-y border-r border-ctp-surface0 rounded-none shadow-2xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 text-[10px] font-mono font-bold text-ctp-peach bg-ctp-peach/10 border border-ctp-peach/30 px-2 py-0.5 rounded-none uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-ctp-peach" />
            <span>{badgeLabel}</span>
          </span>
          <span className="text-[10px] font-mono uppercase text-ctp-subtext0 font-semibold px-2 py-0.5 rounded-none bg-ctp-base border border-ctp-surface0">
            {category}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/generator"
            className="text-xs font-semibold text-ctp-mauve hover:text-[#13382c] hover:underline flex items-center space-x-1"
          >
            <span>Active Course Studio →</span>
          </Link>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-lg sm:text-xl font-bold text-ctp-text tracking-tight uppercase">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-ctp-subtext1 leading-relaxed max-w-3xl">
          {description}
        </p>
      </div>

      {plannedServices.length > 0 && (
        <div className="pt-3 border-t border-ctp-surface0 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-mono text-ctp-subtext0 font-bold uppercase">Subsystems:</span>
          {plannedServices.map((svc) => (
            <span
              key={svc}
              className="text-[11px] font-mono text-ctp-subtext1 bg-ctp-base border border-ctp-surface0 px-2 py-0.5 rounded-none"
            >
              {svc}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

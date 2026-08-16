"use client";

import { Spring } from "@/components/animation/springs/spring";

interface ProgressBarProps {
  label: string;
  pct: number;
  gold?: boolean;
}

/** A single labelled progress track that fills in once on mount. Client leaf (spring). */
export const ProgressBar = ({ label, pct, gold }: ProgressBarProps) => {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-between">
        <span className="font-label text-sm font-semibold text-on-surface">{label}</span>
        <span className={`font-display font-bold ${gold ? "text-brand-accent" : "text-on-surface"}`}>{Math.round(clamped)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-surface-container-high">
        <Spring
          tag="div"
          mode="once"
          from={{ width: "0%" }}
          to={{ width: `${clamped}%` }}
          config={{ tension: 120, friction: 26 }}
          className={`h-full rounded-full ${gold ? "bg-brand-accent" : "bg-primary-container"}`}
        />
      </div>
    </div>
  );
};

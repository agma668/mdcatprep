"use client";

import { InteractiveParticles } from "./InteractiveParticles";

export function CadetCrest() {
  return (
    <div className="relative h-[280px] w-full rounded-[var(--r-3)] border border-[var(--line-2)] bg-[var(--srf-1)] overflow-hidden shadow-2xl" role="region" aria-label="Interactive particle field">
      <InteractiveParticles />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center px-4">
          <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold uppercase tracking-wider rounded-full border border-[var(--line-signal)] bg-[var(--tint-signal)] text-[var(--signal-300)]">
            Interactive Physics
          </span>
          <p className="font-display text-sm font-bold text-[var(--steel-100)] sm:text-base">
            MDCAT & NUMS Prep Network
          </p>
        </div>
      </div>
    </div>
  );
}

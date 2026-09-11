"use client";

import { InteractiveParticles } from "./InteractiveParticles";

export function CadetCrest() {
  return (
    <div
      className="relative w-full rounded-[var(--r-3)] border border-[var(--line-2)] bg-[var(--srf-1)] overflow-hidden shadow-2xl"
      role="region"
      aria-label="Interactive particle network"
    >
      {/* The rotating network sphere gets the whole upper zone to itself —
          nothing overlays the canvas, so the web never sits under text. */}
      <div className="relative h-[210px]">
        <InteractiveParticles />
      </div>
      {/* Caption strip below the sphere: outside the canvas, its own row. */}
      <div className="border-t border-[var(--line-2)] px-4 py-3 text-center">
        <p className="font-display text-sm font-bold text-[var(--steel-100)] sm:text-base">
          MDCAT &amp; NUMS Prep Network
        </p>
      </div>
    </div>
  );
}

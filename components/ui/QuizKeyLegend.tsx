"use client";

// Compact desktop-only keyboard legend used by every question surface
// (practice session, mock test, daily quiz). Hidden on touch/small screens —
// keys are a laptop/web affordance. Each surface passes the keys it actually
// binds, so the legend never advertises a dead key.

import { Keyboard } from "lucide-react";

export interface QuizKeyItem {
  keys: string;
  label: string;
}

function KeyCap({ item }: { item: QuizKeyItem }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-white/15 bg-white/[0.06] px-1.5 font-sans text-[10px] font-bold text-[var(--color-primary-light)] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]">
        {item.keys}
      </kbd>
      <span className="text-[10px] text-[var(--color-text-muted)]">{item.label}</span>
    </span>
  );
}

export function QuizKeyLegend({ items, className = "" }: { items: QuizKeyItem[]; className?: string }) {
  return (
    <div
      className={`hidden items-center gap-4 rounded-[var(--radius-md)] border border-white/[0.06] bg-white/[0.02] px-4 py-2 md:flex ${className}`}
    >
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
        <Keyboard className="h-3.5 w-3.5 text-[var(--color-primary)]" aria-hidden="true" />
        Keys
      </span>
      {items.map((item, i) => (
        <KeyCap key={i} item={item} />
      ))}
    </div>
  );
}

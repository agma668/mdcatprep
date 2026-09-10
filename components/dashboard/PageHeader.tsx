import type { ReactNode } from "react";

/**
 * Shared dashboard page header — the interior counterpart to the landing's
 * hero typography: a gold kicker with a signal dot, a liquid-gold gradient
 * title, a short gold hairline, and an optional description / action slot.
 * Server-safe (no hooks); client components passed to `actions` render fine.
 */
export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 ${className}`}>
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? (
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[var(--signal-400)]"
            />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gradient-brand md:text-3xl">
          {title}
        </h1>
        <div
          aria-hidden="true"
          className="mt-3 h-px w-28 bg-gradient-to-r from-[var(--color-primary)]/70 via-[var(--color-primary)]/20 to-transparent"
        />
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}

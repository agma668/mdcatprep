import { BarChart } from "lucide-react";
import type { MCQBreakdown } from "@/types/analytics";

export function MCQBreakdownChart({ data }: { data: MCQBreakdown[] }) {
  if (data.length === 0) {
    return (
      <div
        className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-6"
        role="region"
        aria-labelledby="mcq-breakdown-title"
      >
        <h2
          id="mcq-breakdown-title"
          className="text-base font-bold text-[var(--color-text-primary)] mb-1"
        >
          MCQ Accuracy Breakdown
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] mb-5">
          Correct / Incorrect per subject
        </p>
        <div className="py-10 text-center">
          <BarChart
            className="w-8 h-8 mx-auto mb-2 block text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Nothing to break down yet
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
            Your correct and incorrect counts per subject will show here after your first practice session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-6"
      role="region"
      aria-labelledby="mcq-breakdown-title"
    >
      <h2
        id="mcq-breakdown-title"
        className="text-base font-bold text-[var(--color-text-primary)] mb-1"
      >
        MCQ Accuracy Breakdown
      </h2>
      <p className="text-xs text-[var(--color-text-muted)] mb-5">
        Correct / Incorrect per subject
      </p>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)] mb-5">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[var(--color-success)] inline-block" />
          Correct
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[var(--color-error)] inline-block" />
          Incorrect
        </span>
      </div>

      <div className="flex flex-col gap-5" role="list" aria-label="MCQ breakdown per subject">
        {data.map((row) => {
          const total = row.totalAttempted > 0 ? row.totalAttempted : 1;
          const correctPct = (row.correct / total) * 100;
          const incorrectPct = (row.incorrect / total) * 100;

          return (
            <div key={row.subject} role="listitem">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {row.subject}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {row.totalAttempted} attempted
                </span>
              </div>

              {/* Stacked bar */}
              <div
                className="h-5 w-full flex rounded-[var(--radius-sm)] overflow-hidden"
                role="progressbar"
                aria-label={`${row.subject}: ${row.correct} correct, ${row.incorrect} incorrect`}
                aria-valuenow={Math.round(correctPct)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  style={{ width: `${correctPct}%`, backgroundColor: "var(--color-success)" }}
                  title={`Correct: ${row.correct}`}
                />
                <div
                  style={{ width: `${incorrectPct}%`, backgroundColor: "var(--color-error)" }}
                  title={`Incorrect: ${row.incorrect}`}
                />
              </div>

              {/* Counts */}
              <div className="flex items-center gap-4 mt-1 text-xs text-[var(--color-text-muted)]">
                <span className="text-[var(--color-success)] font-semibold">✓ {row.correct}</span>
                <span className="text-[var(--color-error)] font-semibold">✗ {row.incorrect}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

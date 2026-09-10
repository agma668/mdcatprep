import { BookOpen } from "lucide-react";
import type { SubjectPerformance } from "@/types/analytics";

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics:     "#c9a84c",
  English:         "#818cf8",
  "General Science": "#34d399",
  Urdu:            "#38bdf8",
  Islamiat:        "#a78bfa",
};

export function SubjectPerformanceChart({ data }: { data: SubjectPerformance[] }) {
  if (data.length === 0) {
    return (
      <div
        className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-6"
        role="region"
        aria-labelledby="subject-chart-title"
      >
        <h2
          id="subject-chart-title"
          className="text-base font-bold text-[var(--color-text-primary)] mb-1"
        >
          Subject-wise Accuracy
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] mb-6">
          Percentage of correct answers per subject
        </p>
        <div className="py-10 text-center">
          <BookOpen
            className="w-8 h-8 mx-auto mb-2 block text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            No subject data yet
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
            Once you answer questions in practice, your accuracy per subject will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-6"
      role="region"
      aria-labelledby="subject-chart-title"
    >
      <h2
        id="subject-chart-title"
        className="text-base font-bold text-[var(--color-text-primary)] mb-1"
      >
        Subject-wise Accuracy
      </h2>
      <p className="text-xs text-[var(--color-text-muted)] mb-6">
        Percentage of correct answers per subject
      </p>

      {/* Bars */}
      <div className="flex flex-col gap-4" role="list" aria-label="Subject accuracy bars">
        {data.map((s) => {
          const color = SUBJECT_COLORS[s.subject] ?? "var(--color-primary)";
          const trendColor =
            s.trend === "up"
              ? "text-[var(--color-success)]"
              : s.trend === "down"
                ? "text-[var(--color-error)]"
                : "text-[var(--color-text-muted)]";
          const trendArrow = s.trend === "up" ? "↑" : s.trend === "down" ? "↓" : "→";

          return (
            <div key={s.subject} role="listitem">
              {/* Label row */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {s.subject}
                </span>
                <div className="flex items-center gap-3">
                  {s.trendDelta > 0 && (
                    <span
                      className={`text-xs font-semibold ${trendColor}`}
                      aria-label={`Trend ${s.trend}, ${s.trendDelta}%`}
                    >
                      {trendArrow} {s.trendDelta}%
                    </span>
                  )}
                  <span className="text-sm font-bold" style={{ color }}>
                    {s.accuracy}%
                  </span>
                </div>
              </div>

              {/* Bar track */}
              <div
                className="h-3 w-full bg-white/[0.06] rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={s.accuracy}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${s.subject} accuracy ${s.accuracy}%`}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${s.accuracy}%`, backgroundColor: color }}
                />
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-[var(--color-text-muted)]">
                  {s.correct}/{s.totalQuestions} correct
                </span>
                {s.timeSpentMinutes > 0 && (
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {Math.floor(s.timeSpentMinutes / 60)}h {s.timeSpentMinutes % 60}m
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

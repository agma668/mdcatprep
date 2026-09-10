import { CalendarDays } from "lucide-react";
import type { WeeklyProgress } from "@/types/analytics";

export function WeeklyProgressChart({ data }: { data: WeeklyProgress[] }) {
  const hasData = data.some((w) => w.questionsAttempted > 0);
  const showStudyTime = data.some((w) => w.studyMinutes > 0);

  const maxQs = Math.max(...data.map((w) => w.questionsAttempted), 1);
  const maxMins = Math.max(...data.map((w) => w.studyMinutes), 1);

  const BAR_H = 160;
  const BAR_W = 32;
  const GAP = 14;
  const LABEL_H = 24;
  const colW = (showStudyTime ? BAR_W * 2 + 4 : BAR_W) + GAP;
  const totalW = data.length * colW;

  return (
    <div
      className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-6"
      role="region"
      aria-labelledby="weekly-progress-title"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2
            id="weekly-progress-title"
            className="text-base font-bold text-[var(--color-text-primary)]"
          >
            Weekly Progress
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            {showStudyTime
              ? "Questions attempted vs study time (8 weeks)"
              : "Questions attempted per week (8 weeks)"}
          </p>
        </div>
        {showStudyTime && (
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[var(--color-primary)] inline-block" />
              Questions
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[var(--color-accent)] inline-block" />
              Study time
            </span>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="py-10 text-center">
          <CalendarDays
            className="w-8 h-8 mx-auto mb-2 block text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            No practice this month yet
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
            Your weekly question counts will appear here once you start practicing.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${totalW} ${BAR_H + LABEL_H + 8}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full min-w-[340px]"
            role="img"
            aria-label="Grouped bar chart showing weekly questions and study time"
          >
            {data.map((week, i) => {
              const x = i * colW;
              const qsH = (week.questionsAttempted / maxQs) * BAR_H;
              const qsY = BAR_H - qsH;
              const hasMock = week.mockTestScore !== null;

              return (
                <g key={week.week}>
                  <rect
                    x={x}
                    y={qsY}
                    width={BAR_W}
                    height={qsH}
                    rx="4"
                    fill="var(--color-primary)"
                    fillOpacity="0.85"
                    role="presentation"
                  />
                  {showStudyTime && (
                    <rect
                      x={x + BAR_W + 4}
                      y={BAR_H - (week.studyMinutes / maxMins) * BAR_H}
                      width={BAR_W}
                      height={(week.studyMinutes / maxMins) * BAR_H}
                      rx="4"
                      fill="var(--color-accent)"
                      fillOpacity="0.85"
                      role="presentation"
                    />
                  )}
                  <text
                    x={x + (showStudyTime ? BAR_W + 2 : BAR_W / 2)}
                    y={BAR_H + 16}
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--color-text-muted)"
                  >
                    {week.week}
                  </text>
                  {hasMock && (
                    <circle
                      cx={x + (showStudyTime ? BAR_W + 2 : BAR_W / 2)}
                      cy={qsY - 8}
                      r="4"
                      fill="var(--color-error)"
                      role="presentation"
                    />
                  )}
                </g>
              );
            })}
            <line
              x1={0}
              y1={BAR_H}
              x2={totalW}
              y2={BAR_H}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

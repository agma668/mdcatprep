import { Clock } from "lucide-react";
import type { TimeSpentData } from "@/lib/analytics/index";

const COLORS = ["#c9a84c", "#818cf8", "#34d399", "#38bdf8", "#a78bfa"];
const R = 60;
const CX = 80;
const CY = 80;
const STROKE = 22;
const CIRC = 2 * Math.PI * R;

export function TimeSpentPanel({ timeSpent }: { timeSpent: TimeSpentData }) {
  const totalMins = timeSpent.totalMinutes;
  const weekly = timeSpent.weeklyMinutes;
  const weeklyGoal = timeSpent.weeklyGoalMinutes;
  const weeklyPct = weeklyGoal > 0 ? Math.min((weekly / weeklyGoal) * 100, 100) : 0;

  const subjectData = timeSpent.subjects.map((s, i) => ({
    ...s,
    color: COLORS[i % COLORS.length],
    pct: totalMins > 0 ? (s.minutes / totalMins) * 100 : 0,
  }));

  const hasData = totalMins > 0 && subjectData.length > 0;

  // Build donut segments — pure reduce so no render-time mutation is needed
  // (each segment's offset is the running sum of the previous dashes + gaps).
  const segments = subjectData.reduce<
    Array<{
      subject: string;
      minutes: number;
      color: string;
      pct: number;
      dash: number;
      gap: number;
      offset: number;
    }>
  >((acc, s) => {
    const dash = (s.pct / 100) * CIRC;
    const gap = CIRC - dash;
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.dash + 1.5 : 0; // tiny gap between segments
    acc.push({ ...s, dash, gap, offset });
    return acc;
  }, []);

  return (
    <div
      className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-6"
      role="region"
      aria-labelledby="time-spent-title"
    >
      <h2
        id="time-spent-title"
        className="text-base font-bold text-[var(--color-text-primary)] mb-1"
      >
        Time Spent Studying
      </h2>
      <p className="text-xs text-[var(--color-text-muted)] mb-5">
        {hasData
          ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m total across all subjects`
          : "Timed study tracking is coming soon"}
      </p>

      {!hasData ? (
        <div className="py-10 text-center">
          <Clock
            className="w-8 h-8 mx-auto mb-2 block text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            No time data tracked yet
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
            We don&apos;t track study minutes yet. Your practice question counts are shown in the other panels.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Donut */}
            <div className="relative shrink-0">
              <svg
                width="160"
                height="160"
                viewBox="0 0 160 160"
                role="img"
                aria-label="Donut chart showing time distribution across subjects"
              >
                {/* Background circle */}
                <circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={STROKE}
                />
                {segments.map((seg) => (
                  <circle
                    key={seg.subject}
                    cx={CX}
                    cy={CY}
                    r={R}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={STROKE - 2}
                    strokeDasharray={`${seg.dash} ${seg.gap}`}
                    strokeDashoffset={-seg.offset}
                    strokeLinecap="butt"
                    transform={`rotate(-90 ${CX} ${CY})`}
                  />
                ))}
                {/* Centre label */}
                <text
                  x={CX}
                  y={CY - 6}
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="800"
                  fill="var(--color-text-primary)"
                >
                  {Math.floor(totalMins / 60)}h
                </text>
                <text
                  x={CX}
                  y={CY + 12}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--color-text-muted)"
                >
                  total
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2 w-full" role="list" aria-label="Time per subject">
              {subjectData.map((s) => (
                <div
                  key={s.subject}
                  role="listitem"
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {s.subject}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                    {Math.floor(s.minutes / 60)}h{" "}
                    {s.minutes % 60}m
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly goal progress */}
          {weeklyGoal > 0 && (
            <div className="mt-5 pt-5 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  This Week&#39;s Goal
                </p>
                <p className="text-xs font-bold text-[var(--color-primary)]">
                  {weekly}m / {weeklyGoal}m
                </p>
              </div>
              <div
                className="h-2.5 w-full bg-white/[0.06] rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={weekly}
                aria-valuemin={0}
                aria-valuemax={weeklyGoal}
                aria-label={`Weekly study goal: ${weekly} of ${weeklyGoal} minutes`}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${weeklyPct}%`,
                    backgroundColor:
                      weeklyPct >= 100
                        ? "var(--color-success)"
                        : "var(--color-primary)",
                  }}
                />
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {weeklyPct >= 100 ? "Goal achieved!" : `${Math.round(weeklyPct)}% of weekly target`}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

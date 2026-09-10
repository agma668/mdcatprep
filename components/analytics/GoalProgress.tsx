"use client";

import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import type { GoalProgress } from "@/types/analytics";

const CIRCUMFERENCE = 2 * Math.PI * 22; // radius=22

function MiniRing({
  value,
  max,
  color,
  achieved,
}: {
  value: number;
  max: number;
  color: string;
  achieved: boolean;
}) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = CIRCUMFERENCE * (1 - pct);

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
      {/* Track */}
      <circle
        cx="26"
        cy="26"
        r="22"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="5"
      />
      {/* Progress */}
      <circle
        cx="26"
        cy="26"
        r="22"
        fill="none"
        stroke={achieved ? "var(--color-success)" : color}
        strokeWidth="5"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      {/* Check / value */}
      <text
        x="26"
        y="30"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill={achieved ? "var(--color-success)" : color}
      >
        {achieved ? "✓" : `${value}%`}
      </text>
    </svg>
  );
}

export function GoalProgressPanel({ goal }: { goal: GoalProgress | null }) {
  // The clock lives in state (refreshed once a minute by an interval
  // callback) so Date.now() never runs during render — the days-left count
  // stays honest across a midnight boundary. Declared before the early
  // return so hooks stay unconditional.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  if (!goal) {
    return (
      <div
        className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-6"
        role="region"
        aria-labelledby="goal-progress-title"
      >
        <h2
          id="goal-progress-title"
          className="text-base font-bold text-[var(--color-text-primary)] mb-1"
        >
          Goal Progress
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] mb-5">
          Track progress toward your exam target
        </p>
        <div className="py-10 text-center">
          <Target
            className="w-8 h-8 mx-auto mb-2 block text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            No goal set yet
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
            Set an exam target in your profile and your progress toward it will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Days remaining — only when a target date is set.
  let daysLeft: number | null = null;
  if (goal.targetDate) {
    const target = new Date(goal.targetDate);
    if (!Number.isNaN(target.getTime())) {
      daysLeft = Math.max(
        0,
        Math.ceil((target.getTime() - now) / (1000 * 60 * 60 * 24))
      );
    }
  }

  const achieved = goal.subjectGoals.filter((g) => g.achieved).length;
  const total = goal.subjectGoals.length;

  return (
    <div
      className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-6"
      role="region"
      aria-labelledby="goal-progress-title"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2
            id="goal-progress-title"
            className="text-base font-bold text-[var(--color-text-primary)]"
          >
            Goal Progress
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {goal.title} · {goal.targetCollege}
          </p>
        </div>
        {goal.overallProgress > 0 && (
          <div className="text-right shrink-0">
            <p className="text-2xl font-extrabold text-[var(--color-primary)]">
              {goal.overallProgress}%
            </p>
            {daysLeft !== null && (
              <p className="text-xs text-[var(--color-text-muted)]">
                {daysLeft} days left
              </p>
            )}
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            No subject targets yet
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
            Answer questions in different subjects and progress toward your target will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Overall bar */}
          <div className="mb-5">
            <div
              className="h-3 w-full bg-white/[0.06] rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={goal.overallProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Overall goal progress ${goal.overallProgress}%`}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${goal.overallProgress}%`,
                  background: `linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)`,
                }}
              />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {achieved}/{total} subject targets achieved
            </p>
          </div>

          {/* Per-subject rings */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            role="list"
            aria-label="Subject goal progress"
          >
            {goal.subjectGoals.map((sg) => (
              <div
                key={sg.subject}
                role="listitem"
                className="flex flex-col items-center gap-1 p-3 rounded-[var(--radius-md)] bg-white/[0.04]"
              >
                <MiniRing
                  value={sg.current}
                  max={sg.target}
                  color="var(--color-primary)"
                  achieved={sg.achieved}
                />
                <p className="text-xs font-semibold text-[var(--color-text-primary)] text-center">
                  {sg.subject}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  Target: {sg.target}%
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

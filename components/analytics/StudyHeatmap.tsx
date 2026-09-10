"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import type { StudyHeatmapDay } from "@/types/analytics";

const INTENSITY_COLORS = [
  "rgba(255,255,255,0.04)",  // 0 — none
  "rgba(16,185,129,0.2)",    // 1 — light
  "rgba(16,185,129,0.4)",    // 2 — medium
  "rgba(16,185,129,0.6)",    // 3 — good
  "rgba(16,185,129,0.85)",   // 4 — excellent
];

const CELL = 14;
const GAP = 3;
const COLS = 13; // ~13 weeks = 91 days
const DAYS_PER_COL = 7;

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

interface TooltipState {
  day: StudyHeatmapDay;
  x: number;
  y: number;
}

export function StudyHeatmap({ days }: { days: StudyHeatmapDay[] }) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const activeDays = days.filter((d) => d.questionsAttempted > 0 || d.minutesStudied > 0);
  const totalQuestions = days.reduce((s, d) => s + d.questionsAttempted, 0);

  // Pad to fill full grid
  const padded: (StudyHeatmapDay | null)[] = [...days];
  while (padded.length < COLS * DAYS_PER_COL) {
    padded.unshift(null);
  }

  const hasData = activeDays.length > 0;

  return (
    <div
      className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-6"
      role="region"
      aria-labelledby="heatmap-title"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h2
            id="heatmap-title"
            className="text-base font-bold text-[var(--color-text-primary)]"
          >
            Study Calendar
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Last 90 days ·{" "}
            {hasData
              ? `${activeDays.length} active days · ${totalQuestions} questions`
              : "No practice recorded yet"}
          </p>
        </div>
        {/* Intensity legend */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
          <span>Less</span>
          {INTENSITY_COLORS.map((c, i) => (
            <div
              key={i}
              className="w-3.5 h-3.5 rounded-sm"
              style={{ backgroundColor: c }}
              aria-hidden="true"
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {!hasData ? (
        <div className="py-10 text-center">
          <CalendarDays
            className="w-8 h-8 mx-auto mb-2 block text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Your study calendar is empty
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
            Days you practice will light up here — build a streak by answering a few questions each day.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto relative" data-heatmap-container>
          {/* Tooltip */}
          {tooltip && (
            <div
              role="tooltip"
              className="absolute z-10 pointer-events-none bg-[#1a1a2e] text-white text-xs rounded-[var(--radius-md)] px-3 py-2 shadow-[var(--shadow-lg)] whitespace-nowrap"
              style={{ left: tooltip.x + 8, top: tooltip.y - 44 }}
            >
              <p className="font-semibold">{tooltip.day.date}</p>
              <p>
                {tooltip.day.questionsAttempted > 0
                  ? `${tooltip.day.questionsAttempted} questions`
                  : "No study session"}
              </p>
            </div>
          )}

          <div className="flex gap-1">
            {/* Day-of-week labels */}
            <div
              className="flex flex-col gap-0 mr-1"
              aria-hidden="true"
              style={{ gap: `${GAP}px` }}
            >
              {DAY_LABELS.map((d, i) => (
                <div
                  key={i}
                  className="text-[10px] text-[var(--color-text-muted)] flex items-center justify-end pr-1"
                  style={{ height: `${CELL}px`, marginBottom: i < 6 ? `${GAP}px` : 0 }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div
              className="flex"
              style={{ gap: `${GAP}px` }}
              role="grid"
              aria-label="Study activity calendar"
            >
              {Array.from({ length: COLS }).map((_, colIdx) => (
                <div
                  key={colIdx}
                  role="row"
                  className="flex flex-col"
                  style={{ gap: `${GAP}px` }}
                >
                  {Array.from({ length: DAYS_PER_COL }).map((_, rowIdx) => {
                    const idx = colIdx * DAYS_PER_COL + rowIdx;
                    const day = padded[idx];

                    if (!day) {
                      return (
                        <div
                          key={rowIdx}
                          role="gridcell"
                          aria-label="No data"
                          className="rounded-sm"
                          style={{
                            width: CELL,
                            height: CELL,
                            backgroundColor: "transparent",
                          }}
                        />
                      );
                    }

                    return (
                      <button
                        key={rowIdx}
                        role="gridcell"
                        type="button"
                        aria-label={
                          day.questionsAttempted > 0
                            ? `${day.date}: ${day.questionsAttempted} questions`
                            : `${day.date}: no study`
                        }
                        className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] cursor-default"
                        style={{
                          width: CELL,
                          height: CELL,
                          backgroundColor: INTENSITY_COLORS[day.intensity],
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const container = e.currentTarget.closest("[data-heatmap-container]");
                          const containerRect = container?.getBoundingClientRect();
                          if (containerRect) {
                            setTooltip({
                              day,
                              x: rect.left - containerRect.left,
                              y: rect.top - containerRect.top,
                            });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onFocus={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            day,
                            x: rect.left,
                            y: rect.top,
                          });
                        }}
                        onBlur={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

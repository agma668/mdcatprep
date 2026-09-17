"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Flame } from "lucide-react";
import type { CommunityActivityDay } from "@/lib/public-stats";

/**
 * The community streak wall — a GitHub-style activity calendar of every real
 * student's attempts, scrolling left to right through the last year.
 *
 * Public-honesty rules (same contract as lib/public-stats.ts): every cell is a
 * real attempt from a real student, demo accounts never enter a bucket, and an
 * empty period renders as an honest quiet grid rather than a fake pattern.
 * Nothing here is estimated, and the section only mounts when the server could
 * verify the calendar (the parent guards on `stats.activityCalendar`).
 *
 * Colour: the ramp is built on `--signal-*`, which this site's palette engine
 * drives, so the wall follows whichever of the four themes the student picked.
 * The cadet original hardcoded its emerald hue; this site has no `--hue-emerald`
 * token, and a hardcoded green here would ignore the theme engine.
 */

const INTENSITY_COLORS = [
  "rgba(255,255,255,0.04)", // 0 — a bare track, not a level of activity
  "color-mix(in srgb, var(--signal-400) 22%, transparent)",
  "color-mix(in srgb, var(--signal-400) 45%, transparent)",
  "color-mix(in srgb, var(--signal-400) 68%, transparent)",
  "color-mix(in srgb, var(--signal-400) 92%, transparent)",
] as const;

const CELL = 13;
const GAP = 3;
const DAYS_PER_COL = 7;

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

interface TooltipState {
  date: string;
  attempts: number;
  x: number;
  y: number;
}

function formatDay(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Floor-scaled intensity: log-ish weighting so a single burst doesn't flatten
 * every other day to level 1. Level 4 needs a genuinely big day. */
function intensityFor(attempts: number, peak: number): number {
  if (attempts <= 0) return 0;
  if (peak <= 1) return 4;
  const ratio = attempts / peak;
  if (ratio >= 0.66) return 4;
  if (ratio >= 0.4) return 3;
  if (ratio >= 0.18) return 2;
  return 1;
}

export function CommunityStreakWall({ days }: { days: CommunityActivityDay[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [atEnd, setAtEnd] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const left = el.scrollLeft > 10;
    const right = el.scrollLeft < el.scrollWidth - el.clientWidth - 10;
    const end = el.scrollWidth - el.scrollLeft - el.clientWidth < 40;
    // Same-value bail-outs: without these, the ResizeObserver fires on every
    // layout tick and re-renders in a loop (the "ResizeObserver loop" console
    // flood). Bail before scheduling any state work.
    setCanScrollLeft((prev) => (prev === left ? prev : left));
    setCanScrollRight((prev) => (prev === right ? prev : right));
    setAtEnd((prev) => (prev === end ? prev : end));
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(checkScroll) : null;
    // Observe only the scroller itself — document.body changes on EVERY
    // dynamic-content mutation, re-triggering the callback each frame.
    if (el) ro?.observe(el);
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      ro?.disconnect();
    };
  }, [checkScroll]);

  // Newest day at the right edge (GitHub convention), fully visible on load —
  // the wall reveals its history by scrolling back in time.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  // Columns of 7 days (Sun-first to match the grid fill), month labels above
  // the first column that starts a new month.
  const columns = useMemo(() => {
    const cols: (CommunityActivityDay | null)[][] = [];
    for (let i = 0; i < days.length; i += DAYS_PER_COL) {
      const chunk: (CommunityActivityDay | null)[] = days.slice(i, i + DAYS_PER_COL);
      while (chunk.length < DAYS_PER_COL) chunk.push(null);
      cols.push(chunk);
    }
    return cols;
  }, [days]);

  const monthLabels = useMemo(() => {
    return columns.map((col, idx) => {
      const first = col.find((d): d is CommunityActivityDay => d !== null);
      if (!first) return null;
      if (idx === 0) return null; // clipped half-month at the left edge
      const d = new Date(first.date + "T00:00:00Z");
      const prev = columns[idx - 1]?.find((x): x is CommunityActivityDay => x !== null);
      if (!prev) return null;
      const prevMonth = new Date(prev.date + "T00:00:00Z").getUTCMonth();
      return d.getUTCMonth() !== prevMonth
        ? d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })
        : "";
    });
  }, [columns]);

  const peak = useMemo(
    () => days.reduce((m, d) => Math.max(m, d.attempts), 0),
    [days]
  );
  const total = useMemo(() => days.reduce((s, d) => s + d.attempts, 0), [days]);
  const activeDays = useMemo(
    () => days.filter((d) => d.attempts > 0).length,
    [days]
  );
  const gridHeight = DAYS_PER_COL * CELL + (DAYS_PER_COL - 1) * GAP;

  return (
    <div className="glass-tile-glow border border-white/10 rounded-[var(--r-3)] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-extrabold text-[var(--steel-100)]">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-[var(--r-2)] bg-[color-mix(in_srgb,var(--signal-400)_15%,transparent)] text-[var(--signal-300)]"
            >
              <Flame className="h-4 w-4" />
            </span>
            Community Streak Wall
          </h3>
          <p className="mt-1 text-sm text-[var(--steel-300)]">
            Every question answered by real students — the last year, day by day.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--steel-300)]">
          <span className="rounded-full border border-[var(--line-2)] bg-[var(--srf-2)] px-3 py-1 font-semibold text-[var(--signal-300)]">
            {total.toLocaleString()} attempts
          </span>
          <span className="rounded-full border border-[var(--line-2)] bg-[var(--srf-2)] px-3 py-1 font-semibold">
            {activeDays} active days
          </span>
        </div>
      </div>

      {/* Scroller with fixed arrow gutters (the college-carousel pattern:
          arrows never float over the grid) and edge fades on the track. */}
      <div className="flex items-stretch gap-2">
        <div className="hidden sm:flex w-8 shrink-0 items-center justify-center">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll("left")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#0a0a0a]/85 text-white/60 backdrop-blur transition-all hover:border-white/25 hover:text-white"
              aria-label="Scroll to older weeks"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        <div
          className="relative min-w-0 flex-1"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%)",
          }}
        >
          <div
            ref={scrollRef}
            className="overflow-x-auto pb-1 flex"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* margin-inline auto centres the grid when the track is wider
                than the year (big desktops) and costs nothing when it is
                narrower — unlike justify-content, it never clips the left
                edge of an overflowing scroller. */}
            <div className="relative inline-block" style={{ paddingRight: 4, marginInline: "auto" }} data-wall-frame>
              {tooltip && (
                <div
                  role="tooltip"
                  className="pointer-events-none absolute z-10 whitespace-nowrap rounded-[var(--r-2)] border border-[var(--line-3)] bg-[var(--srf-3)] px-3 py-1.5 text-xs shadow-[var(--shadow-lg)]"
                  style={{ left: tooltip.x + 10, top: tooltip.y - 36 }}
                >
                  <span className="font-semibold text-[var(--steel-100)]">{formatDay(tooltip.date)}</span>
                  <span className="ml-2 text-[var(--signal-300)]">
                    {tooltip.attempts > 0
                      ? `${tooltip.attempts.toLocaleString()} attempt${tooltip.attempts === 1 ? "" : "s"}`
                      : "no attempts"}
                  </span>
                </div>
              )}

              {/* Month labels */}
              <div className="flex" style={{ gap: GAP, marginLeft: 28, marginBottom: 4 }}>
                {columns.map((_, idx) => (
                  <div
                    key={idx}
                    className="text-[10px] text-[var(--steel-300)]"
                    style={{ width: CELL }}
                    aria-hidden="true"
                  >
                    {monthLabels[idx] || ""}
                  </div>
                ))}
              </div>

              <div className="flex">
                {/* Weekday labels */}
                <div className="mr-1 flex flex-col" style={{ gap: GAP }} aria-hidden="true">
                  {WEEKDAY_LABELS.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-end pr-1 text-[10px] text-[var(--steel-300)]"
                      style={{ height: CELL, marginBottom: i < DAYS_PER_COL - 1 ? GAP : 0, width: 24 }}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Grid */}
                <div className="flex" style={{ gap: GAP }} role="grid" aria-label="Community practice activity calendar">
                  {columns.map((col, colIdx) => (
                    <div key={colIdx} role="row" className="flex flex-col" style={{ gap: GAP }}>
                      {col.map((day, rowIdx) => {
                        if (!day) {
                          return (
                            <div
                              key={rowIdx}
                              aria-hidden="true"
                              className="rounded-[3px]"
                              style={{ width: CELL, height: CELL, backgroundColor: "transparent" }}
                            />
                          );
                        }
                        const level = intensityFor(day.attempts, peak);
                        return (
                          <button
                            key={rowIdx}
                            type="button"
                            role="gridcell"
                            aria-label={`${formatDay(day.date)}: ${day.attempts} attempts`}
                            className="rounded-[3px] cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
                            style={{ width: CELL, height: CELL, backgroundColor: INTENSITY_COLORS[level] }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const frame = e.currentTarget.closest("[data-wall-frame]");
                              const fRect = frame?.getBoundingClientRect();
                              if (fRect) {
                                setTooltip({
                                  date: day.date,
                                  attempts: day.attempts,
                                  x: rect.left - fRect.left,
                                  y: rect.top - fRect.top,
                                });
                              }
                            }}
                            onMouseLeave={() => setTooltip(null)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-[var(--steel-300)]">
                <span>Less</span>
                {INTENSITY_COLORS.map((c, i) => (
                  <span key={i} className="h-3 w-3 rounded-[3px]" style={{ backgroundColor: c }} aria-hidden="true" />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex w-8 shrink-0 items-center justify-center">
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll("right")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#0a0a0a]/85 text-white/60 backdrop-blur transition-all hover:border-white/25 hover:text-white"
              aria-label="Scroll to recent weeks"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {atEnd && (
        <p className="mt-4 text-center text-xs text-[var(--steel-300)]">
          You are looking at the most recent week — scroll left to travel back through the community&apos;s history.
        </p>
      )}
      {/* gridHeight keeps the tile from collapsing while images/fonts load */}
      <span aria-hidden="true" className="hidden" style={{ height: gridHeight }} />
    </div>
  );
}

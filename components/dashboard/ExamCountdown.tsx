"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Clock, Zap } from "lucide-react";

/**
 * Time remaining until each medical entry test (MDCAT / NUMS).
 *
 * The four cards used to be four different hues — amber, sky, emerald, violet —
 * and the hue encoded nothing. They now share one steel surface and the single
 * accent goes to the test that is actually nearest. The tests are told apart
 * by an emoji mark and their name, and the nearest one also says "next up" in
 * words, so the ranking does not rest on colour alone.
 *
 * DATE PROVENANCE (the honesty rule — every date here is sourced):
 *   - NUMS MDCAT 2026 — Sunday 13 September 2026. Official announcement:
 *     numspak.edu.pk/news ("NUMS MDCAT-2026 shall be held on Sunday, 13th
 *     September 2026"), corroborated by national press.
 *   - MDCAT 2026 (PMDC) — Sunday 20 September 2026. Official rescheduling
 *     notice on pmdc.pk (originally 16 August 2026, moved to 20 September by
 *     PMDC press release, corroborated by Dawn, 2026-08-06).
 * If a date changes, update it here with its source. Nothing in this
 * component is derived from student data, and nothing is estimated.
 */

interface Exam {
  name: string;
  date: string;
  mark: string;
}

const EXAMS: Exam[] = [
  { name: "NUMS MDCAT 2026", date: "2026-09-13", mark: "🎖️" },
  { name: "PMDC MDCAT 2026", date: "2026-09-20", mark: "🩺" },
];

// The gauge under each countdown fills across the last quarter-year before a
// test. It measures the calendar, not the student — hence the wording of its
// accessible name.
const WINDOW_DAYS = 90;

// A test within a fortnight gets the urgency chip.
const URGENT_DAYS = 14;

// The published date, spelled out. Fixed to en-GB so the string is stable
// regardless of the visitor's locale; this whole component renders nothing on
// the server, so there is no markup to mismatch on hydration.
function formatExamDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, passed: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    mins: Math.floor((diff / (1000 * 60)) % 60),
    secs: Math.floor((diff / 1000) % 60),
    passed: false,
  };
}
function DigitBlock({ value, label, near }: { value: number; label: string; near: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <div
        className={`flex aspect-square w-full max-w-[52px] items-center justify-center rounded-[var(--r-1)] border bg-[var(--srf-3)] sm:max-w-[60px] ${
          near ? "border-[var(--line-beacon)]" : "border-[var(--line-2)]"
        }`}
      >
        <span
          className={`text-lg font-bold tabular-nums sm:text-xl ${
            near ? "text-[var(--beacon-300)]" : "text-[var(--steel-100)]"
          }`}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-1.5 text-[10px] font-medium tracking-wide text-[var(--steel-400)]">
        {label}
      </span>
    </div>
  );
}

function ExamMark({ name, mark }: { name: string; mark: string }) {
  return (
    <span
      aria-hidden="true"
      title={name}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[var(--srf-3)] text-sm"
    >
      {mark}
    </span>
  );
}

const subscribeNothing = () => () => {};

// SSR-safe hydration gate: false on the server (renders null), true on the
// client after hydration — the countdown is the first thing to show.
function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNothing, () => true, () => false);
}
export function ExamCountdown() {
  const mounted = useHydrated();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;

  const upcoming = EXAMS.map((e) => ({ ...e, ...getTimeLeft(e.date) }))
    .filter((e) => !e.passed)
    .sort((a, b) => a.days - b.days);

  if (upcoming.length === 0) return null;

  const urgent = upcoming[0].days <= URGENT_DAYS;

  return (
    <section aria-label="Exam countdown">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[var(--r-1)] border border-[var(--line-signal)] bg-[var(--srf-2)]">
          <Clock className="h-4 w-4 text-[var(--signal-300)]" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-[var(--steel-100)]">Upcoming Medical Entry Tests</h2>
          <p className="text-[11px] text-[var(--steel-400)]">Countdown to test day</p>
        </div>
        {urgent && (
          <span className="ml-auto flex items-center gap-1 rounded-[var(--r-pill)] border border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.1)] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[var(--warn)]">
            <Zap className="h-3 w-3" aria-hidden="true" />
            Test soon
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {upcoming.map((exam, i) => {
          const near = i === 0;
          const elapsed = Math.min(100, Math.max(4, 100 - (exam.days / WINDOW_DAYS) * 100));
          return (
            <div
              key={exam.name}
              className={`rounded-[var(--r-2)] border p-4 transition-colors duration-[var(--dur-2)] ${
                near
                  ? "border-[var(--line-beacon)] bg-[var(--srf-2)]"
                  : "border-[var(--line-2)] bg-[var(--srf-1)] hover:border-[var(--line-3)] hover:bg-[var(--srf-2)]"
              }`}
            >
              {/* One line, always. The "next up" chip used to live here, and at
                  360px in a 2-up grid it wrapped onto a second line — which
                  pushed the nearest test's digits 27px below its neighbour's,
                  so two adjacent cards read as misaligned. The chip moved to
                  the caption row under the gauge, where anything that wraps
                  wraps below the digits instead of above them. The name may
                  still wrap on its own: at 360 the header has about 118px and
                  `truncate` turned "CCH Entry Test" into "CCH …" — the college
                  name is the one label on this card that has to survive. */}
              <div className="mb-3 flex items-center gap-2">
                <ExamMark name={exam.name} mark={exam.mark} />
                <p className="text-xs font-semibold leading-tight text-[var(--steel-200)]">{exam.name}</p>
              </div>

              <div className="flex items-start gap-1.5">
                <DigitBlock value={exam.days} label="days" near={near} />
                <DigitBlock value={exam.hours} label="hrs" near={near} />
                <DigitBlock value={exam.mins} label="min" near={near} />
                <DigitBlock value={exam.secs} label="sec" near={near} />
              </div>

              <div
                className="mt-3.5 h-1 overflow-hidden rounded-[var(--r-pill)] bg-[var(--srf-4)]"
                role="progressbar"
                aria-valuenow={Math.round(elapsed)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Calendar progress through the last ${WINDOW_DAYS} days before the ${exam.name}`}
              >
                <div
                  className={`h-full rounded-[var(--r-pill)] ${
                    near ? "bg-[var(--beacon-600)]" : "bg-[var(--steel-600)]"
                  }`}
                  style={{ width: `${elapsed}%` }}
                />
              </div>

              {/* The gauge on its own says nothing about which day it is
                  counting to, and the published date was already sitting in the
                  fixture unused. It reads here, under the bar, with "next up"
                  beside it on the nearest test — last row of the card, so if a
                  narrow viewport wraps it, it wraps below the digits. */}
              <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                <span className="text-[10px] tabular-nums text-[var(--steel-400)]">
                  {formatExamDate(exam.date)}
                </span>
                {near && (
                  <span className="text-[10px] font-semibold tracking-wide text-[var(--beacon-300)]">
                    next up
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}



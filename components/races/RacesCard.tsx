"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag, Trophy, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatRaceCountdown } from "./time";
import { RACE_MIN_ACCURACY_ATTEMPTS } from "@/lib/races-repo";
import type { RaceInboxEntry } from "@/app/actions/races";

const METRIC_LABEL: Record<string, string> = {
  questions: "Most questions in 7 days",
  accuracy: "Highest accuracy in 7 days",
};

/** One row: live race (scoreboard + countdown) or finished race (result). */
function RaceRow({ entry, now }: { entry: RaceInboxEntry; now: number }) {
  const msLeft = Math.max(0, entry.endsAt - now);
  const won = entry.winner === entry.role;
  const draw = entry.winner === "draw";
  const other = entry.otherName;

  // ── Finished: honest result with the real window numbers. ──
  if (entry.finished) {
    const result =
      draw
        ? `Draw — you ${entry.mine.questions}, ${other} ${entry.theirs.questions}`
        : entry.winner
          ? won
            ? `You won ${entry.mine.questions}–${entry.theirs.questions}`
            : `${other} won ${entry.theirs.questions}–${entry.mine.questions}`
          : "";
    return (
      <div className="flex flex-wrap items-center gap-3 px-5 py-3.5">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            draw
              ? "bg-white/[0.06] text-white/50"
              : won
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-rose-500/15 text-rose-400"
          }`}
        >
          <Trophy className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">
            Race vs {other} <span className="font-normal text-[var(--color-text-muted)]">· {METRIC_LABEL[entry.metric]}</span>
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-[var(--color-text-muted)]">
            {result || (entry.winner === null ? "Race finished — no winner." : "")}
            {entry.metric === "accuracy" && (
              <span className="ml-1">
                · {entry.mine.accuracy ?? "—"}% vs {entry.theirs.accuracy ?? "—"}% accuracy
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  // ── Live: who's ahead right now, from the real window totals. ──
  const mineAhead =
    entry.metric === "questions"
      ? entry.mine.questions > entry.theirs.questions
      : (entry.mine.accuracy ?? 0) > (entry.theirs.accuracy ?? 0);
  const ahead = entry.mine.questions === entry.theirs.questions ? null : mineAhead;

  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]/30">
        <Flag className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-white">
          {entry.role === "challenger" ? "You raced" : "Race from"} {other}{" "}
          <span className="font-normal text-[var(--color-text-muted)]">· {METRIC_LABEL[entry.metric]}</span>
        </p>
        <p className="mt-0.5 text-xs tabular-nums text-[var(--color-text-muted)]">
          You {entry.mine.questions} · {other} {entry.theirs.questions}
          {entry.metric === "accuracy" && (
            <span> ({entry.mine.accuracy ?? "—"}% vs {entry.theirs.accuracy ?? "—"}%)</span>
          )}{" "}
          · {ahead === null ? "tied" : ahead ? "you're ahead" : `${other} is ahead`} ·{" "}
          {formatRaceCountdown(msLeft)}
        </p>
      </div>
    </div>
  );
}

/**
 * The race inbox card on the dashboard — every week-long race the student is
 * part of, with live window totals for both sides and the derived winner once
 * the window passes. Fails OPEN: an empty or unavailable list renders the
 * honest "no races yet" state, never an error or a crash.
 */
export function RacesCard({ entries }: { entries: RaceInboxEntry[] }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ordered = [...entries].sort(
    (a, b) => Number(a.finished) - Number(b.finished) || b.endsAt - a.endsAt
  );
  const liveCount = entries.filter((e) => !e.finished).length;

  return (
    <section aria-label="Races" className="glass-tile-glow overflow-hidden rounded-[var(--radius-xl)] border border-white/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/15 text-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]/25">
            <Flag className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-extrabold text-white">Races</h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              {liveCount > 0
                ? `${liveCount} race${liveCount === 1 ? "" : "s"} running`
                : "A 7-day practice race against a classmate"}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/leaderboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors"
        >
          Start a race <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {ordered.length === 0 ? (
        <div className="p-8 text-center">
          <Flag className="mx-auto h-8 w-8 text-[var(--color-primary)]/60" aria-hidden="true" />
          <p className="mt-3 text-sm font-bold text-white">No races yet</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--color-text-muted)]">
            Challenge a classmate to a 7-day race — whoever answers more questions (or holds
            higher accuracy, needing {RACE_MIN_ACCURACY_ATTEMPTS}+ questions) wins. You just
            keep practising normally.
          </p>
          <Link href="/dashboard/leaderboard" className="mt-4 inline-flex">
            <Button size="sm" variant="outline">
              <Flag className="h-3.5 w-3.5" /> Find a rival
            </Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.05]">
          {ordered.map((e) => (
            <RaceRow key={e.raceId} entry={e} now={now} />
          ))}
          {entries.length >= 20 && (
            <p className="flex items-center justify-center gap-2 px-5 py-3 text-xs text-[var(--color-text-muted)]">
              <RefreshCw className="h-3 w-3" aria-hidden="true" /> Showing your 20 most recent races
            </p>
          )}
        </div>
      )}
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swords, Hourglass, ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCountdown } from "./time";
import type { DuelInboxEntry } from "@/app/actions/duels";

/** One inbox row: status line + action, honest about every state. */
function DuelRow({ entry, now }: { entry: DuelInboxEntry; now: number }) {
  const href = `/dashboard/duels/${entry.duelId}`;
  const msLeft = Math.max(0, entry.expiresAt - now);

  // ── Completed: result line (score/time derived server-side, never stored).
  //    A forfeit (one side finished, the other lapsed past 48h) is a terminal
  //    result too — the marker is explicit, never a silent head-to-head. ──
  if (entry.status === "completed" && entry.result) {
    const r = entry.result;
    const mine = entry.role === "challenger" ? r.challenger : r.opponent;
    const theirs = entry.role === "challenger" ? r.opponent : r.challenger;
    const won = entry.winner === entry.role;
    const draw = entry.winner === "draw";
    const forfeit = r.forfeit;
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
            {entry.role === "challenger" ? "vs" : "from"} {entry.otherName}{" "}
            <span className="font-normal text-[var(--color-text-muted)]">· {entry.subject}</span>
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-[var(--color-text-muted)]">
            {forfeit
              ? won
                ? `You won by forfeit ${mine.score}–${theirs.score} — ${entry.otherName} didn't finish in time`
                : `You lost by forfeit ${mine.score}–${theirs.score} — you didn't finish in time`
              : draw
                ? `Draw ${mine.score}–${theirs.score}`
                : won
                  ? `You won ${mine.score}–${theirs.score}`
                  : `You lost ${mine.score}–${theirs.score}`}
          </p>
        </div>
        <Link href={href}>
          <Button size="sm" variant="ghost">
            Result <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    );
  }

  // ── Expired: nothing to play, nothing to score — honest. ──
  if (entry.status === "expired") {
    return (
      <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 opacity-70">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/40">
          <Hourglass className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white/70">
            {entry.role === "challenger" ? "You challenged" : "Challenge from"} {entry.otherName}{" "}
            <span className="font-normal text-[var(--color-text-muted)]">· {entry.subject}</span>
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Expired — {entry.role === "challenger" ? "they never played" : "it wasn't played"} within 48 hours.
          </p>
        </div>
      </div>
    );
  }

  // ── Pending: incoming (actionable) vs waiting (already played / outgoing). ──
  const incoming = entry.role === "opponent" && !entry.myFinished;
  const iPlayed = entry.myFinished;
  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-3.5">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          incoming
            ? "bg-[var(--color-primary)]/15 text-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]/30"
            : "bg-white/[0.06] text-white/50"
        }`}
      >
        <Swords className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-white">
          {entry.role === "challenger" ? "vs" : "from"} {entry.otherName}{" "}
          <span className="font-normal text-[var(--color-text-muted)]">· {entry.subject}</span>
          {incoming && (
            <span className="ml-2 rounded-full bg-[var(--color-primary)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary-light)]">
              New
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs tabular-nums text-[var(--color-text-muted)]">
          {incoming
            ? `${msLeft > 0 ? `Expires in ${formatCountdown(msLeft)}` : "Expiring now"} — same 10 questions for both of you`
            : iPlayed
              ? `You've answered — waiting for ${entry.otherName}${msLeft > 0 ? ` (${formatCountdown(msLeft)} left)` : ""}`
              : `Waiting for ${entry.otherName} to play${msLeft > 0 ? ` — ${formatCountdown(msLeft)} left` : ""}`}
        </p>
      </div>
      {incoming ? (
        <Link href={href}>
          <Button size="sm" variant="primary">
            <Swords className="h-3.5 w-3.5" /> Play
          </Button>
        </Link>
      ) : (
        <Link href={href}>
          <Button size="sm" variant="ghost">
            View <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      )}
    </div>
  );
}

/**
 * The duel inbox card on the dashboard — pending incoming challenges (with a
 * live expiry countdown and Play), waiting/outgoing rows, expired duels, and
 * completed results. Fails OPEN: an empty or unavailable list renders the
 * honest "no challenges yet" state, never an error.
 */
export function DuelsCard({ entries }: { entries: DuelInboxEntry[] }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Actionable incoming first, then the rest newest-first (already ordered).
  const ordered = [...entries].sort((a, b) => {
    const aLive = a.role === "opponent" && a.status === "pending" && !a.myFinished ? 0 : 1;
    const bLive = b.role === "opponent" && b.status === "pending" && !b.myFinished ? 0 : 1;
    if (aLive !== bLive) return aLive - bLive;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const pendingCount = entries.filter(
    (e) => e.role === "opponent" && e.status === "pending" && !e.myFinished
  ).length;

  return (
    <section aria-label="Duels" className="glass-tile-glow overflow-hidden rounded-[var(--radius-xl)] border border-white/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/15 text-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]/25">
            <Swords className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-extrabold text-white">Duels</h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              {pendingCount > 0
                ? `${pendingCount} challenge${pendingCount === 1 ? "" : "s"} waiting for you`
                : "Challenge a classmate to the same 10 questions"}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/leaderboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors"
        >
          Challenge someone <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {ordered.length === 0 ? (
        <div className="p-8 text-center">
          <Swords className="mx-auto h-8 w-8 text-[var(--color-primary)]/60" aria-hidden="true" />
          <p className="mt-3 text-sm font-bold text-white">No duels yet</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--color-text-muted)]">
            Find a classmate on the leaderboard and challenge them — you both answer the same 10
            questions, and whoever scores more (time breaks ties) wins.
          </p>
          <Link href="/dashboard/leaderboard" className="mt-4 inline-flex">
            <Button size="sm" variant="outline">
              <Swords className="h-3.5 w-3.5" /> Find an opponent
            </Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.05]">
          {ordered.map((e) => (
            <DuelRow key={e.duelId} entry={e} now={now} />
          ))}
        </div>
      )}
    </section>
  );
}
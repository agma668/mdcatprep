"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag, CheckCircle2, AlertTriangle, Swords } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createDuel, getChallengeableSubjects } from "@/app/actions/duels";
import { createRace } from "@/app/actions/races";

/**
 * The challenge affordance on a real approved student's row. The picker
 * expands in place under the row (flex-wrap) — never clipped by the table's
 * rounded overflow — and only offers subjects the question bank can actually
 * fill. The server re-validates every challenge; this is presentation.
 */
export function ChallengeButton({ opponentId, opponentName }: { opponentId: string; opponentName: string }) {
  const [open, setOpen] = useState(false);
  // 'race' = the 7-day analytics race (the founder's challenge model); 'duel'
  // = the same-10-questions quick duel. Both live under one affordance.
  const [mode, setMode] = useState<'race' | 'duel'>('race');
  const [subjects, setSubjects] = useState<{ name: string; count: number }[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setError(null);
    setCreated(null);
    setOpen(true);
    setMode('race');
    if (subjects === null) {
      const res = await getChallengeableSubjects();
      if ('error' in res) setError(res.error);
      else setSubjects(res.subjects);
    }
  };

  const race = async (metric: string) => {
    setBusy(metric);
    setError(null);
    const res = await createRace(opponentId, metric);
    setBusy(null);
    if ('error' in res) {
      setError(res.error);
      return;
    }
    setCreated(res.raceId ?? '');
  };

  const duel = async (subject: string) => {
    setBusy(subject);
    setError(null);
    const res = await createDuel(opponentId, subject);
    setBusy(null);
    if ('error' in res) {
      setError(res.error);
      return;
    }
    setCreated(res.duelId ?? '');
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={toggle} disabled={busy !== null}>
        <Swords className="h-3.5 w-3.5" />
        {open ? 'Close' : 'Challenge'}
      </Button>

      {open && (
        <div className="w-full rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] p-4">
          {/* Mode switch: the race is the default challenge; the quick duel is one tap away. */}
          <div className="flex gap-2">
            <button
              onClick={() => { setMode('race'); setError(null); setCreated(null); }}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${mode === 'race' ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]/40' : 'text-[var(--color-text-muted)] hover:text-white'}`}
            >
              🏁 7-day race
            </button>
            <button
              onClick={() => { setMode('duel'); setError(null); setCreated(null); }}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${mode === 'duel' ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]/40' : 'text-[var(--color-text-muted)] hover:text-white'}`}
            >
              ⚔️ Quick duel
            </button>
          </div>

          {created ? (
            <div className="mt-3 rounded-[var(--radius-md)] border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              <p className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> Challenge sent!
              </p>
              <p className="mt-1 text-emerald-300/80">
                {mode === 'race'
                  ? "The 7-day race with " + opponentName + " is on — just keep practising. It appears on your dashboard."
                  : opponentName + " has 48 hours to play the same questions. Your duel appears on the dashboard."}
              </p>
              {mode === 'duel' && created && (
                <Link href={`/dashboard/duels/${created}`} className="mt-2 inline-flex items-center gap-1.5 font-bold text-emerald-300 underline underline-offset-2 hover:text-emerald-200">
                  Open your duel →
                </Link>
              )}
            </div>
          ) : (
            <>
              {error && (
                <p className="mt-3 flex items-center gap-2 rounded-[var(--radius-md)] border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
                </p>
              )}
              {mode === 'race' && (
                <div className="mt-3">
                  <p className="text-xs font-bold text-[var(--color-text-secondary)]">
                    Race <span className="text-white">{opponentName}</span> for 7 days — whoever does better wins
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(['questions', 'accuracy'] as const).map((metric) => (
                      <button
                        key={metric}
                        onClick={() => race(metric)}
                        disabled={busy !== null}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-bold text-[var(--color-primary-light)] transition-colors hover:bg-[var(--color-primary)]/20 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <Flag className="h-3 w-3" />
                        {busy === metric
                          ? 'Starting…'
                          : metric === 'questions'
                            ? 'Most questions'
                            : 'Best accuracy'}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">
                    Most questions: count this week. Best accuracy: your accuracy over the week (20+ questions to count).
                  </p>
                </div>
              )}
              {mode === 'duel' && (
                <>
                  <p className="mt-3 text-xs font-bold text-[var(--color-text-secondary)]">
                    Challenge <span className="text-white">{opponentName}</span> — you both answer the same 10 questions
                  </p>
                  {!subjects && !error && (
                    <p className="mt-3 text-xs text-[var(--color-text-muted)]">Loading subjects…</p>
                  )}
                  {subjects && subjects.length === 0 && (
                    <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                      Not enough published questions in any subject yet to draw a 10-question set.
                    </p>
                  )}
                  {subjects && subjects.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {subjects.map((s) => (
                        <button
                          key={s.name}
                          onClick={() => duel(s.name)}
                          disabled={busy !== null}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-bold text-[var(--color-primary-light)] transition-colors hover:bg-[var(--color-primary)]/20 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          <Swords className="h-3 w-3" />
                          {busy === s.name ? 'Creating…' : `${s.name} (${s.count} Qs)`}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}


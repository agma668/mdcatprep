"use client";

// Trap Reasons — the distractor rationale the practice reveal shows under the
// question once you've answered (and especially when you got it wrong).
//
// Where a plain explanation only tells you the right answer, Trap Reasons
// shows you WHY each wrong option was tempting and how to neutralise it. That
// is the highest-yield exam skill alone: recognising the trap, not just
// knowing the fact. Data lives in lib/distractor-autopsies.ts, keyed by the
// question's stable `key`, authored by FOUNDER.
//
// HONESTY RULE: if no autopsy exists for a question, this renders NOTHING.
// We never invent a trap. `autopsyFor` returns undefined → we render null.

import { AlertTriangle, Ruler } from "lucide-react";
import { optionText, type OptionLetter, type QuizQuestion } from "@/lib/questions";
import {
  autopsyFor,
  type DistractorAutopsy,
} from "@/lib/distractor-autopsies";

/**
 * Renders the authored distractor autopsy for a question, in the small space
 * under the reveal. Shows the answered wrong option's trap (if any) plus a
 * compact list of every other wrong option's why/counter, when we have them.
 */
export function TrapReasons({
  question,
  picked,
}: {
  question: QuizQuestion;
  picked?: OptionLetter | null;
}) {
  const autopsy = autopsyFor(question.key ?? question.id ?? "");
  // Never render an invented explanation — we only show what was authored.
  if (!autopsy) return null;

  const trapEntries = Object.entries(autopsy.trapPerOption).filter(
    ([letter]) => optionText(question, letter as OptionLetter) !== null
  );

  // Focus first on the option the student actually picked (the trap they
  // fell for), then the rest.
  const pickedTrap = picked ? autopsy.trapPerOption[picked] : undefined;
  const others = trapEntries.filter(([letter]) => letter !== picked);

  return (
    <div className="mt-5 space-y-3 rounded-[var(--radius-md)] border border-[var(--signal-400)]/25 bg-[var(--signal-500)]/[0.07] p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--signal-300)]">
        <AlertTriangle className="h-3.5 w-3.5" />
        Trap Reasons
      </p>

      {picked && pickedTrap ? (
        <div className="rounded-[var(--radius-sm)] border border-[var(--danger)]/25 bg-[var(--danger)]/[0.06] p-3">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[var(--danger)]">
            You picked {picked}
          </p>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {pickedTrap.why}
          </p>
          {pickedTrap.counter && (
            <p className="mt-1.5 text-sm font-semibold text-[var(--color-text-primary)]">
              {pickedTrap.counter}
            </p>
          )}
        </div>
      ) : null}

      {(picked ? others : trapEntries).length > 0 && (
        <ul className="space-y-2">
          {(picked ? others : trapEntries).map(([letter, trap]) => (
            <li key={letter} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--line-signal)] text-[10px] font-bold text-[var(--signal-200)]">
                {letter}
              </span>
              <span className="leading-relaxed text-[var(--color-text-secondary)]">
                {trap.why}{" "}
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {trap.counter}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {autopsy.rule && (
        <p className="flex items-start gap-2 border-t border-[var(--signal-400)]/15 pt-2 text-sm leading-relaxed text-[var(--color-text-primary)]">
          <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal-300)]" />
          <span>
            <span className="font-bold text-[var(--signal-200)]">The rule: </span>
            {autopsy.rule}
          </span>
        </p>
      )}
    </div>
  );
}
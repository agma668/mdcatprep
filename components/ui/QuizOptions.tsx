"use client";

// Shared multiple-choice option list, used by every question surface. A
// surface's own state machine stays in its player component — this owns only
// the row presentation: the letter chip, hover/selected/revealed styling,
// and the trailing verdict marks. `reveal` tells it a verdict is showing
// (the surface owns *when* that is — locked on pick in practice, at submit
// in the mock, after check in the daily quiz); `status` then decides the
// colouring per letter.

import { Check, X } from "lucide-react";
import {
  OPTION_LETTERS,
  optionText,
  type OptionLetter,
  type QuizQuestion,
} from "@/lib/questions";

export type OptionStatus = "idle" | "selected" | "correct" | "wrong";

/**
 * One verdict language, not two.
 *
 * This component used to carry two `tone` dialects and they disagreed about
 * the most important fact on the screen: in `primary` (practice, mock,
 * academy) a CORRECT answer was the accent colour, and in `accent` (daily
 * quiz, diagnostic) a correct answer was emerald. Same event, two
 * appearances, in one product — a student who learned the practice page had
 * to relearn the daily quiz.
 *
 * The worse half of it: in `primary`, `correct` and `selected` rendered
 * identically — the same filled accent chip, the same glow, and row washes of
 * 0.12 vs 0.10 alpha that nobody can tell apart. So after the reveal, "the
 * one I picked" and "the one that is right" looked the same, which is the one
 * distinction the reveal exists to draw.
 *
 * Now: green is right, red is wrong, signal blue is your pick, everywhere.
 * Green and red here are the semantic tokens, so this is not decoration by
 * hue — the mark beside the row says the same thing in a glyph, and
 * `aria-pressed` says it to a screen reader.
 */
const ROW: Record<OptionStatus, string> = {
  correct: "border-[var(--ok)]/55 bg-[var(--ok)]/[0.09]",
  wrong: "border-[var(--danger)]/50 bg-[var(--danger)]/[0.07]",
  selected: "border-[var(--signal-400)]/70 bg-[var(--signal-500)]/[0.10]",
  idle: "border-[var(--line-2)] bg-[var(--srf-1)] hover:border-[var(--line-signal)] hover:bg-[var(--srf-2)]",
};

// Dark ink on the filled chips, not white: white on --ok is about 1.9:1 and on
// --danger about 2.4:1, while --color-text-inverse clears 8:1 on both.
// Only the correct chip glows. A wrong answer should not emit more light than
// the right one sitting two rows above it.
const CHIP: Record<OptionStatus, string> = {
  correct:
    "bg-[var(--ok)] text-[var(--color-text-inverse)] shadow-[var(--glow-ok)]",
  wrong: "bg-[var(--danger)]/20 text-[var(--danger)] ring-1 ring-[var(--danger)]/40",
  selected:
    "bg-[var(--signal-300)] text-[var(--color-text-inverse)] shadow-[var(--glow-signal-sm)]",
  idle: "border border-[var(--line-3)] bg-[var(--srf-2)] text-[var(--steel-400)] group-hover:border-[var(--signal-400)] group-hover:text-[var(--signal-200)]",
};

export function QuizOptions({
  question,
  reveal,
  status,
  onChoose,
  disabled,
}: {
  question: QuizQuestion;
  /** Whether a verdict is showing (rows colour + verdict marks appear). */
  reveal?: boolean;
  /** Row state for each option letter. */
  status: (letter: OptionLetter) => OptionStatus;
  onChoose: (letter: OptionLetter) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      {OPTION_LETTERS.map((letter) => {
        const text = optionText(question, letter);
        if (text === null) return null;
        const s = status(letter);
        return (
          <button
            key={letter}
            type="button"
            disabled={disabled}
            onClick={() => onChoose(letter)}
            aria-pressed={s === "selected"}
            className={`group flex w-full items-center gap-3.5 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-all duration-[var(--transition-fast)] disabled:cursor-default ${ROW[s]}`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-[var(--transition-fast)] ${CHIP[s]}`}
            >
              {letter}
            </span>
            <span className="text-sm leading-relaxed text-[var(--color-text-primary)]">
              {text}
            </span>
            {reveal ? (
              s === "correct" ? (
                <Check className="ml-auto h-5 w-5 shrink-0 text-[var(--ok)]" />
              ) : s === "wrong" ? (
                <X className="ml-auto h-5 w-5 shrink-0 text-[var(--danger)]" />
              ) : null
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

"use client";

// The /topicals drill player for guests. Deliberately SEPARATE from
// PracticeSession: that player records attempts (Supabase / offline queue),
// which needs an account to make sense of. Topicals are a public SEO surface —
// progress is device-local state for the run, nothing is recorded, and the
// honest note says so. Rendering follows the same option-grid vocabulary as
// QuizOptions so the look matches the rest of the platform.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import type { TopicalsQuestion } from "@/lib/topicals";

const LETTERS = ["A", "B", "C", "D"] as const;

function optionText(q: TopicalsQuestion, letter: (typeof LETTERS)[number]): string {
  switch (letter) {
    case "A":
      return q.option_a;
    case "B":
      return q.option_b;
    case "C":
      return q.option_c;
    case "D":
      return q.option_d;
  }
}

export function TopicalDrill({
  questions,
  subjectName,
  chapterTitle,
}: {
  questions: TopicalsQuestion[];
  subjectName: string;
  chapterTitle: string;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<(typeof LETTERS)[number] | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[index];
  const total = questions.length;
  const letters = useMemo(() => LETTERS.slice(0, 4), []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [index]);

  if (!q) return null;

  if (finished) {
    const pct = answered ? Math.round((correctCount / answered) * 100) : 0;
    return (
      <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--line-2)] p-8 text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-extrabold mb-2">Chapter done</h2>
        <p className="text-sm text-[var(--steel-300)] mb-1">
          {subjectName} · {chapterTitle}
        </p>
        <p className="text-4xl font-extrabold text-[var(--color-accent-light)] my-4">
          {correctCount}/{answered}
        </p>
        <p className="text-sm text-[var(--steel-300)] mb-6">
          {pct >= 80
            ? "Strong — this chapter is in good shape."
            : pct >= 50
              ? "Solid — reread the explanations and run it again."
              : "Read every explanation below your answers and go again."}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setPicked(null);
              setCorrectCount(0);
              setAnswered(0);
              setFinished(false);
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--cta-from)] to-[var(--cta-to)] text-[var(--on-cta)] font-bold hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" /> Run it again
          </button>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[var(--radius-md)] bg-white/10 ring-1 ring-[var(--line-3)] text-[var(--steel-100)] font-bold hover:bg-white/[0.14] transition-colors"
          >
            Track progress — free account
          </Link>
        </div>
      </div>
    );
  }

  const isCorrect = picked !== null && picked === q.correct_answer;
  const revealed = picked !== null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Command bar */}
      <div className="flex items-center justify-between gap-3 mb-4 text-xs text-[var(--steel-400)]">
        <span>
          {subjectName} · {chapterTitle}
        </span>
        <span>
          Question {index + 1} of {total} · {correctCount}/{answered} correct
        </span>
      </div>

      <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--line-2)] p-5 md:p-6">
        <p className="text-sm md:text-base font-semibold text-[var(--steel-100)] mb-5 leading-relaxed">
          {q.question_text}
        </p>

        <div className="space-y-2.5">
          {letters.map((letter) => {
            const text = optionText(q, letter);
            const isPicked = picked === letter;
            const isAnswer = letter === q.correct_answer;
            let cls =
              "border-[var(--line-2)] bg-white/[0.04] hover:bg-white/[0.08] hover:border-[var(--signal-500)]/40";
            if (revealed && isAnswer)
              cls = "border-[var(--ok)]/60 bg-[var(--ok)]/10";
            else if (revealed && isPicked)
              cls = "border-[var(--danger)]/60 bg-[var(--danger)]/10";
            else if (revealed) cls = "border-[var(--line-1)] opacity-60";
            return (
              <button
                key={letter}
                type="button"
                disabled={revealed}
                onClick={() => {
                  setPicked(letter);
                  setAnswered((n) => n + 1);
                  if (letter === q.correct_answer) setCorrectCount((n) => n + 1);
                }}
                className={`w-full flex items-start gap-3 text-left rounded-[var(--radius-md)] border px-4 py-3 transition-colors ${cls}`}
              >
                <span className="w-6 h-6 shrink-0 flex items-center justify-center rounded-md bg-white/[0.08] text-xs font-bold text-[var(--steel-200)]">
                  {letter}
                </span>
                <span className="text-sm text-[var(--steel-200)] flex-1">{text}</span>
                {revealed && isAnswer && (
                  <CheckCircle2 className="w-4 h-4 text-[var(--ok)] shrink-0 mt-0.5" aria-hidden="true" />
                )}
                {revealed && isPicked && !isCorrect && (
                  <XCircle className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="mt-5 rounded-[var(--radius-md)] bg-[var(--signal-500)]/10 border border-[var(--signal-500)]/25 px-4 py-3">
            <p className="text-sm text-[var(--steel-200)]">
              <span className="font-semibold text-[var(--signal-300)]">
                {isCorrect ? "Correct. " : "Why this is the answer: "}
              </span>
              The answer is {q.correct_answer} — {optionText(q, q.correct_answer)}.
            </p>
          </div>
        )}
      </div>

      {revealed && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (index + 1 >= total) {
                setFinished(true);
              } else {
                setIndex((i) => i + 1);
                setPicked(null);
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--cta-from)] to-[var(--cta-to)] text-[var(--on-cta)] font-bold hover:opacity-90 transition-opacity"
          >
            {index + 1 >= total ? "See results" : "Next question"}
          </button>
        </div>
      )}

      <p className="mt-6 text-xs text-[var(--steel-500)] text-center">
        Guest run — progress stays on this device.{" "}
        <Link href="/signup" className="text-[var(--signal-300)] hover:underline">
          Free account
        </Link>{" "}
        adds streaks, analytics and the mistake notebook.
      </p>
    </div>
  );
}

"use client";

// Dedicated, distraction-free practice surface (rendered outside the dashboard
// chrome at /practice/session). One question, four options, nothing else —
// built for fast laptop/web drilling:
//
//   Keys 1–4        choose A–D
//   ←  / →          previous / next question
//   Enter / Space   next question (after answering)
//   Esc             back to practice home
//
// A slim key-legend strip sits above the card on desktop. All run state —
// position, answers, the navigation debounce, the keyboard bindings — lives
// in the shared useQuizSession hook; this component only renders the surface
// and records attempts (once per question, at the moment of answering).

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LogOut } from "lucide-react";
import { recordAttemptByQuestionKey } from "@/app/actions/practice";
import { recordAnswer } from "@/lib/offline-sync";
import { ScoreRing, AnimatedNumber } from "@/components/ui/ScoreRing";
import { QuizKeyLegend } from "@/components/ui/QuizKeyLegend";
import { QuizOptions } from "@/components/ui/QuizOptions";
import { BookmarkFlag } from "@/components/practice/BookmarkFlag";
import { TrapReasons } from "@/components/practice/TrapReasons";
import { useQuizSession } from "@/lib/quiz-session";
import { pastPaperTag, type OptionLetter, type QuizQuestion } from "@/lib/questions";

export function PracticeSession({
  questions,
  sessionKey,
  subjectLabel,
  homeHref = "/dashboard/practice",
}: {
  questions: QuizQuestion[];
  sessionKey: string;
  subjectLabel?: string;
  homeHref?: string;
}) {
  const router = useRouter();
  const total = questions.length;

  const session = useQuizSession({
    questions,
    mode: "instant",
    resumeKey: sessionKey,
    escHref: homeHref,
    escOnResults: true,
    onReveal: (i, letter) => {
      const q = questions[i];
      if (!q) return;
      // Bundled questions always carry a key; bank rows always an id — this
      // fires at most once per question (the hook locks answers in). The id
      // path is the queue-aware seam: online it records through the shared
      // server action exactly as before, and offline a signed-in answer
      // queues for sync instead of being dropped (guests stay purely local).
      if (q.id) void recordAnswer(q.id, letter).catch(() => {});
      else if (q.key) void recordAttemptByQuestionKey(q.key, letter, q.question_text).catch(() => {});
    },
  });
  const { index, current: q, answers, finished, revealed, pick, next, prev, restart, statusFor } = session;

  const answeredCount = Object.keys(answers).length;
  const correctCount = session.correctCount;

  // Jump back to the top on question change (short page, but mobile panels
  // can still leave the verdict scrolled out of view).
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [index]);

  if (!q) return null;

  if (finished) {
    const pct = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;
    const verdict =
      pct >= 90
        ? "Outstanding — you are entry-test ready."
        : pct >= 70
          ? "Strong work — keep drilling your weaker topics."
          : pct >= 50
            ? "Solid effort — read the explanations and go again."
            : "Every attempt counts — run it once more and watch it climb.";
    return (
      <div className="glass-tile-glow relative overflow-hidden rounded-[var(--radius-xl)] border border-white/10 p-8 text-center sm:p-10">
        <div className="mx-auto">
          <ScoreRing value={pct} size={168} stroke={12}>
            <span className="text-[2.75rem] font-extrabold leading-none tabular-nums text-gradient-brand">
              <AnimatedNumber value={pct} />
            </span>
            <span className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              accuracy
            </span>
          </ScoreRing>
        </div>
        <h3 className="mt-7 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Practice complete
        </h3>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          <span className="font-bold tabular-nums text-[var(--color-primary-light)]">
            <AnimatedNumber value={correctCount} />
          </span>{" "}
          of{" "}
          <span className="font-bold tabular-nums text-white">{answeredCount}</span>{" "}
          questions correct
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{verdict}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-8 py-3 text-sm font-bold text-[var(--color-text-inverse)] shadow-[var(--shadow-cta)] transition-all duration-[var(--transition-fast)] hover:-translate-y-px hover:bg-[var(--color-primary-light)]"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push(homeHref)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-white/10 bg-white/[0.06] px-8 py-3 text-sm font-bold text-white transition-all duration-[var(--transition-fast)] hover:bg-white/[0.1]"
          >
            Back to Practice
          </button>
        </div>
        <p className="mt-6 text-[11px] text-[var(--color-text-muted)]">
          <kbd className="rounded-[4px] border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-sans text-[10px] text-[var(--color-primary-light)]">Esc</kbd>{" "}
          to exit anytime · answering every question improves your weak-area plan
        </p>
      </div>
    );
  }

  const answered = !!answers[index];
  const correct = answers[index] === q.correct_answer;
  const progressPct = ((index + 1) / total) * 100;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
      {/* Slim session header: exit · subject · position · running score */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => router.push(homeHref)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/70 transition-colors hover:border-white/25 hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          Exit
        </button>
        <div className="flex min-w-0 items-center gap-2">
          {subjectLabel ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary-light)]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"
              />
              {subjectLabel}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary-light)]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"
              />
              Entry Test
            </span>
          )}
          <span className="whitespace-nowrap text-xs tabular-nums text-[var(--color-text-muted)]">
            Question {index + 1} <span className="text-white/35">/ {total}</span>
          </span>
        </div>
        {answeredCount > 0 && (
          <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-bold tabular-nums text-[var(--color-primary-light)]">
            {correctCount}
            <span className="text-[var(--color-text-muted)]">/{answeredCount}</span>
          </span>
        )}
      </div>

      {/* Progress hairline */}
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progressPct}%`,
            background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-light))",
            boxShadow: "0 0 10px rgba(61, 126, 219, 0.5)",
          }}
        />
      </div>

      {/* Key-role legend — desktop only (keys are a laptop/web surface) */}
      <QuizKeyLegend
        className="mb-5"
        items={[
          { keys: "1–4", label: "choose answer" },
          { keys: "← →", label: "move between questions" },
          { keys: "Enter", label: "next question" },
          { keys: "Space", label: "or" },
          { keys: "Esc", label: "exit" },
        ]}
      />

      <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
              {q.subject}
              {q.topic ? ` · ${q.topic}` : ""}
            </span>
            {/* Only shows for questions genuinely taken from a real paper —
                original exam-style questions carry no year. */}
            {pastPaperTag(q) && (
              <span className="rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/[0.08] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary-light)]">
                {pastPaperTag(q)}
              </span>
            )}
          </div>
          {q.id && <BookmarkFlag questionId={q.id} />}
        </div>
        <p className="text-sm font-semibold leading-relaxed text-[var(--color-text-primary)] sm:text-base">
          {q.question_text}
        </p>

        <QuizOptions
          question={q}
          reveal={revealed}
          onChoose={pick}
          disabled={answered}
          status={statusFor}
        />

        {answered && (
          <div
            className={`mt-5 rounded-[var(--radius-md)] border p-4 text-sm ${
              correct
                ? "border-[var(--color-primary)]/25 bg-[var(--color-primary)]/[0.07]"
                : "border-amber-500/20 bg-amber-500/10"
            }`}
          >
            {correct ? (
              <p className="mb-1 font-bold text-[var(--color-primary-light)]">✓ Correct</p>
            ) : (
              <p className="mb-1 font-bold text-amber-300">
                ✗ Not quite — the answer is{" "}
                <span className="text-[var(--color-primary-light)]">{q.correct_answer}</span>
              </p>
            )}
            {q.explanation && (
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {q.explanation}
              </p>
            )}
          </div>
        )}

        {/* Trap Reasons — why each wrong option was tempting. Renders
            nothing when no authored autopsy exists yet (never invented). */}
        {answered && (
          <TrapReasons question={q} picked={(answers[index] as OptionLetter) ?? null} />
        )}

        {answered && (
          <div className="mt-5 flex items-center gap-3">
            {index > 0 && (
              <button
                onClick={prev}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white/80 transition-all duration-[var(--transition-fast)] hover:bg-white/[0.09]"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>
            )}
            <button
              onClick={next}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-[var(--color-text-inverse)] shadow-[var(--shadow-cta)] transition-all duration-[var(--transition-fast)] hover:bg-[var(--color-primary-light)] sm:flex-none"
            >
              {index < total - 1 ? "Next Question" : "See Results"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {!answered && index > 0 && (
          <button
            onClick={prev}
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Previous question
          </button>
        )}
      </div>
    </div>
  );
}
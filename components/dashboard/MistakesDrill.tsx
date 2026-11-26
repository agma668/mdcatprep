"use client";

// Today's review: the missed questions the 1/3/7-day ladder says are due, one
// card at a time.
//
// This used to be a local-only flip: pick an answer, see the verdict, done. The
// header comment claimed "the server already recorded the attempt" and nothing
// did, which made the notebook's retry ladder and mastery gate decorative — the
// two things they count are correct re-attempts in `question_attempts`, and no
// attempt was ever written. Every choice here now goes through the shared
// recording seam (`recordAnswer`, the same path the drills and the daily quiz
// use), so:
//
//   correct  → the question stops being due and comes back at 3 days, or at 7
//              once one correct answer is already banked;
//   wrong    → the notebook's own writer re-dates the mistake, so it comes back
//              tomorrow and any mastery progress resets;
//   two in a row → mastery unlocks, and only then does the confirm button work,
//              because the server re-counts the attempts before accepting it.

import { useCallback, useState } from "react";
import { CheckCircle2, Flame } from "lucide-react";
import { QuizOptions } from "@/components/ui/QuizOptions";
import type { OptionStatus } from "@/components/ui/QuizOptions";
import type { OptionLetter, QuizQuestion } from "@/lib/questions";
import { recordAnswer } from "@/lib/offline-sync";
import { updateMistakeReview } from "@/app/actions/mistakes";
import { MASTERY_REQUIRED_CORRECT_STREAK } from "@/lib/mistakes/classification";

export type DrillQuestion = QuizQuestion & {
  id: string;
  subject: string;
  /** The mistake_reviews row this answer progresses. */
  reviewId: string;
  /** Correct re-answers already banked since the last miss. */
  correctStreak: number;
  /** Ladder label, e.g. "Due today". */
  dueLabel: string;
};

export function MistakesDrill({
  questions,
  onExit,
}: {
  questions: DrillQuestion[];
  onExit?: () => void;
}) {
  const [cleared, setCleared] = useState<Set<string>>(new Set());
  const remaining = questions.filter((q) => !cleared.has(q.id));

  const settle = useCallback((id: string) => {
    setCleared((prev) => new Set(prev).add(id));
  }, []);

  if (questions.length === 0) {
    return (
      <div className="glass-tile rounded-[var(--radius-lg)] border border-white/10 p-8 text-center">
        <p className="text-sm font-bold text-white">Nothing is due right now.</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          A missed question comes back a day later, then three, then seven. The notebook
          shows the date on each card.
        </p>
        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            className="mt-4 text-xs font-bold text-[var(--color-primary-light)] hover:underline"
          >
            Back to the notebook
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
          {remaining.length} question{remaining.length === 1 ? "" : "s"} due
        </p>
        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            className="text-xs font-bold text-[var(--color-text-secondary)] hover:text-white"
          >
            Back to the notebook
          </button>
        ) : null}
      </div>

      {remaining.map((q) => (
        <DrillCard key={q.id} question={q} onSettled={() => settle(q.id)} />
      ))}

      {remaining.length === 0 && (
        <div className="glass-tile rounded-[var(--radius-lg)] border border-emerald-400/20 p-8 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300" />
          <p className="mt-3 text-sm font-bold text-emerald-300">That&apos;s today&apos;s list.</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Everything you answered correctly is done until its next step. Anything you got
            wrong again is already back on tomorrow&apos;s list.
          </p>
          {onExit ? (
            <button
              type="button"
              onClick={onExit}
              className="mt-4 rounded-[var(--radius-md)] border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white hover:bg-white/[0.09]"
            >
              Back to the notebook
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function DrillCard({
  question,
  onSettled,
}: {
  question: DrillQuestion;
  onSettled: () => void;
}) {
  const [picked, setPicked] = useState<OptionLetter | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The card's own count of consecutive correct answers, seeded from what the
  // server has already banked. A wrong pick sets it to **zero**, not "unchanged":
  // the server counts the trailing streak, so a miss in the middle resets it. The
  // earlier version added the current pick's credit and never subtracted a miss,
  // which let a card hold 2/2 after a wrong answer and offer a confirm the server
  // then refused — the button promising what the gate would not honour.
  const [streak, setStreak] = useState(question.correctStreak);
  const correct = picked === question.correct_answer;
  const masteryEarned = streak >= MASTERY_REQUIRED_CORRECT_STREAK;

  const choose = (letter: OptionLetter) => {
    if (picked === letter) return;
    setPicked(letter);
    setStreak((previous) =>
      letter === question.correct_answer
        ? Math.min(previous + 1, MASTERY_REQUIRED_CORRECT_STREAK)
        : 0
    );
    // Every pick is an attempt, through the same seam every player uses — a
    // wrong-then-right pair in one card is one wrong and one right, which is the
    // truth and keeps the streak honest. A failure is not worth blocking the run
    // for: the answer stays on screen, and offline queuing is the seam's job.
    void recordAnswer(question.id, letter);
  };

  async function confirmMastery() {
    setConfirming(true);
    const result = await updateMistakeReview(question.reviewId, { mastered: true });
    setConfirming(false);
    if (!result.success) {
      setError(result.error ?? "Could not confirm mastery.");
      return;
    }
    setConfirmed(true);
    onSettled();
  }

  return (
    <div className="glass-tile rounded-[var(--radius-lg)] border border-white/10 p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary-light)]">
          {question.subject}
          {question.topic ? ` · ${question.topic}` : ""}
        </span>
        <span className="rounded-full border border-rose-400/25 bg-rose-400/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-300">
          {question.dueLabel}
        </span>
        {streak > 0 && (
          <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
            <Flame aria-hidden="true" className="mr-1 inline h-3 w-3" />
            {streak}/{MASTERY_REQUIRED_CORRECT_STREAK} toward mastery
          </span>
        )}
      </div>

      <p className="text-sm font-semibold leading-relaxed text-[var(--color-text-primary)]">
        {question.question_text}
      </p>

      <div className="mt-4">
        <QuizOptions
          question={question}
          reveal={!!picked}
          onChoose={choose}
          disabled={confirmed || (!!picked && correct)}
          status={(letter: OptionLetter): OptionStatus => {
            if (!picked) return "idle";
            if (letter === question.correct_answer) return "correct";
            return picked === letter ? "wrong" : "idle";
          }}
        />
      </div>

      {picked && (
        <div
          className={`mt-4 rounded-[var(--radius-md)] border p-4 text-sm ${
            correct
              ? "border-emerald-400/25 bg-emerald-400/[0.07]"
              : "border-amber-500/20 bg-amber-500/10"
          }`}
        >
          <p className="mb-1 font-bold">
            {correct ? (
              <span className="text-emerald-300">✓ Correct</span>
            ) : (
              <span className="text-amber-300">
                ✗ Still not it — answer is{" "}
                <span className="text-[var(--color-primary-light)]">
                  {question.correct_answer}
                </span>
              </span>
            )}
          </p>
          {question.explanation && (
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {question.explanation}
            </p>
          )}

          {correct && (
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              {masteryEarned
                ? "That is two in a row — mastery is yours to confirm."
                : `Banked ${streak} of ${MASTERY_REQUIRED_CORRECT_STREAK}. It returns in 3 days, and answering it right once more then is what takes it out of the notebook.`}
            </p>
          )}

          {correct && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {masteryEarned && !confirmed ? (
                <button
                  type="button"
                  onClick={() => void confirmMastery()}
                  disabled={confirming}
                  className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300 disabled:opacity-50"
                >
                  {confirming ? "Checking…" : "Confirm mastery"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onSettled}
                className="text-xs font-bold text-emerald-300 hover:underline"
              >
                {confirmed ? "Done" : "Next"}
              </button>
            </div>
          )}

          {!correct && (
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              This one goes back to tomorrow and its mastery count resets. Try another
              option if you want to leave it answered correctly today.
            </p>
          )}

          {error ? <p className="mt-2 text-xs font-semibold text-rose-300">{error}</p> : null}
        </div>
      )}
    </div>
  );
}

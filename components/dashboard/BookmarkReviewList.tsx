"use client";

// Review surface for flagged questions: show the question, reveal the answer
// with the explanation, then unflag (mastered) or keep (still shaky). Local
// state only — the server is updated through the same toggle action the
// practice flag uses.

import { useState, useTransition } from "react";
import { BookmarkCheck } from "lucide-react";
import { QuizOptions } from "@/components/ui/QuizOptions";
import type { OptionStatus } from "@/components/ui/QuizOptions";
import type { OptionLetter } from "@/lib/questions";
import { toggleBookmark, type BookmarkedQuestion } from "@/app/actions/bookmarks";

export function BookmarkReviewList({ questions }: { questions: BookmarkedQuestion[] }) {
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();
  const visible = questions.filter((q) => !removed.has(q.id));

  const unflag = (id: string) => {
    setRemoved((prev) => new Set(prev).add(id));
    startTransition(async () => {
      await toggleBookmark(id);
    });
  };

  return (
    <ul className="space-y-4">
      {visible.map((q) => (
        <ReviewCard key={q.id} question={q} onMastered={() => unflag(q.id)} />
      ))}
      {visible.length === 0 && (
        <li className="glass-tile rounded-[var(--radius-lg)] border border-white/10 p-8 text-center text-sm text-[var(--color-text-secondary)]">
          All flagged questions mastered. Flag more during practice anytime.
        </li>
      )}
    </ul>
  );
}

function ReviewCard({
  question,
  onMastered,
}: {
  question: BookmarkedQuestion;
  onMastered: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === question.correct_answer;

  return (
    <li className="glass-tile rounded-[var(--radius-lg)] border border-white/10 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary-light)]">
          {question.subject}
          {question.topic ? ` · ${question.topic}` : ""}
        </span>
        <button
          type="button"
          onClick={onMastered}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-white/60 transition-all hover:border-emerald-400/40 hover:text-emerald-300"
          title="I know this now — remove from bookmarks"
        >
          <BookmarkCheck className="h-3.5 w-3.5" />
          Mastered
        </button>
      </div>

      <p className="text-sm font-semibold leading-relaxed text-[var(--color-text-primary)]">
        {question.question_text}
      </p>

      <div className="mt-4">
        <QuizOptions
          question={question}
          reveal={revealed}
          onChoose={(letter) => {
            setPicked(letter);
            setRevealed(true);
          }}
          disabled={revealed}
          status={(letter: OptionLetter): OptionStatus => {
            if (!picked || !revealed) return letter === picked ? "selected" : "idle";
            if (letter === question.correct_answer) return "correct";
            return picked === letter ? "wrong" : "idle";
          }}
        />
      </div>

      {revealed && (
        <div
          className={`mt-4 rounded-[var(--radius-md)] border p-4 text-sm ${
            correct
              ? "border-[var(--color-primary)]/25 bg-[var(--color-primary)]/[0.07]"
              : "border-amber-500/20 bg-amber-500/10"
          }`}
        >
          <p className="mb-1 font-bold text-[var(--color-primary-light)]">
            {correct ? "✓ Correct" : `✗ The answer is ${question.correct_answer}`}
          </p>
          {question.explanation && (
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {question.explanation}
            </p>
          )}
        </div>
      )}

      {!revealed && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-4 text-xs font-semibold text-[var(--color-text-muted)] transition-colors hover:text-white"
        >
          Reveal answer
        </button>
      )}
    </li>
  );
}

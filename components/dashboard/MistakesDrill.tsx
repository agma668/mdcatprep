"use client";

// Interactive redo surface for wrong answers: one card per missed question,
// pick an answer, get the verdict + explanation instantly. Answering right
// collapses the card to a "fixed ✓" stub (the server already recorded the
// attempt through the normal practice path, so the queue self-retires on the
// next visit — the local collapse is immediate feedback, not the source of
// truth).

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { QuizOptions } from "@/components/ui/QuizOptions";
import type { OptionStatus } from "@/components/ui/QuizOptions";
import type { OptionLetter } from "@/lib/questions";
import type { MistakeQuestion } from "@/app/actions/mistakes";

export type DrillQuestion = MistakeQuestion;

export function MistakesDrill({ questions }: { questions: MistakeQuestion[] }) {
  const [fixed, setFixed] = useState<Set<string>>(new Set());
  const remaining = questions.filter((q) => !fixed.has(q.id));

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
        {remaining.length} question{remaining.length === 1 ? "" : "s"} to fix
      </p>
      {remaining.map((q) => (
        <DrillCard
          key={q.id}
          question={q}
          onFixed={() => setFixed((prev) => new Set(prev).add(q.id))}
        />
      ))}
      {remaining.length === 0 && (
        <div className="glass-tile rounded-[var(--radius-lg)] border border-emerald-400/20 p-8 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300" />
          <p className="mt-3 text-sm font-bold text-emerald-300">Queue cleared.</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Every missed question re-answered correctly. New mistakes land here automatically.
          </p>
        </div>
      )}
    </div>
  );
}

function DrillCard({
  question,
  onFixed,
}: {
  question: MistakeQuestion;
  onFixed: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === question.correct_answer;

  return (
    <div className="glass-tile rounded-[var(--radius-lg)] border border-white/10 p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary-light)]">
          {question.subject}
          {question.topic ? ` · ${question.topic}` : ""}
        </span>
        <span className="rounded-full border border-rose-400/25 bg-rose-400/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-300">
          missed {question.wrongCount}×
        </span>
      </div>

      <p className="text-sm font-semibold leading-relaxed text-[var(--color-text-primary)]">
        {question.question_text}
      </p>

      <div className="mt-4">
        <QuizOptions
          question={question}
          reveal={!!picked}
          onChoose={(letter) => setPicked(letter)}
          disabled={!!picked && correct}
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
              <span className="text-emerald-300">✓ Fixed — this leaves your queue</span>
            ) : (
              <span className="text-amber-300">
                ✗ Still not it — answer is{" "}
                <span className="text-[var(--color-primary-light)]">{question.correct_answer}</span>
              </span>
            )}
          </p>
          {question.explanation && (
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {question.explanation}
            </p>
          )}
          {correct && (
            <button
              type="button"
              onClick={onFixed}
              className="mt-3 text-xs font-bold text-emerald-300 hover:underline"
            >
              Collapse card
            </button>
          )}
        </div>
      )}
    </div>
  );
}

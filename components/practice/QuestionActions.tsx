"use client";

// The two actions every question needs and this player did not have:
//
//   Save to card   one tap turns the question in front of you into a review card
//                  — front: the stem, back: the keyed answer plus the written
//                  rationale. Works on a right answer and a wrong one, because
//                  "I guessed it" is the mistake a correct answer hides.
//   Report         a wrong key or a broken stem goes to a human, with a receipt.
//
// Keys: F saves a card, R opens the report. Both are ignored while typing.

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Check, Flag, Layers, Send, X } from "lucide-react";
import { REPORT_REASONS, type ReportReason } from "@/lib/question-reports";
import { reportQuestion, saveQuestionAsCard } from "@/app/actions/practice-cards";
import type { QuizQuestion } from "@/lib/questions";

const LETTERS = ["A", "B", "C", "D"] as const;

function answerLine(question: QuizQuestion): string | null {
  const letter = question.correct_answer?.trim().toUpperCase().slice(0, 1);
  if (!LETTERS.includes(letter as (typeof LETTERS)[number])) return null;
  const option = {
    A: question.option_a,
    B: question.option_b,
    C: question.option_c,
    D: question.option_d,
  }[letter as (typeof LETTERS)[number]];
  return option ? `${letter}. ${option}` : letter;
}

export function QuestionActions({
  question,
  signedIn = true,
  signupHref = "/signup",
  page,
}: {
  question: QuizQuestion;
  signedIn?: boolean;
  signupHref?: string;
  /** Recorded with a report so an admin knows where it was served. */
  page?: string;
}) {
  const [cardState, setCardState] = useState<"idle" | "saved" | "exists" | "needsAuth">("idle");
  const [cardError, setCardError] = useState<string | null>(null);
  const [savingCard, startSavingCard] = useTransition();

  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState("");
  const [reportState, setReportState] = useState<"idle" | "sent">("idle");
  const [reportError, setReportError] = useState<string | null>(null);
  const [sendingReport, startSendingReport] = useTransition();

  const saveCard = useCallback(() => {
    if (cardState === "saved" || cardState === "exists" || savingCard) return;
    setCardError(null);

    const answer = answerLine(question);
    if (!answer) {
      setCardError("This question has no keyed answer to put on the back.");
      return;
    }
    const back = question.explanation
      ? `Answer: ${answer}\n\n${question.explanation}`
      : `Answer: ${answer}`;

    startSavingCard(async () => {
      const result = await saveQuestionAsCard({
        questionId: question.id ?? null,
        front: question.question_text,
        back,
        subject: question.subject,
        topic: question.topic,
      });
      if ("error" in result) {
        if (result.needsAuth) setCardState("needsAuth");
        else setCardError(result.error);
        return;
      }
      setCardState(result.alreadyExisted ? "exists" : "saved");
    });
  }, [cardState, savingCard, question]);

  const sendReport = useCallback(() => {
    if (!reason) {
      setReportError("Pick a reason first.");
      return;
    }
    setReportError(null);
    startSendingReport(async () => {
      const result = await reportQuestion({
        questionId: question.id ?? null,
        prompt: question.question_text,
        subject: question.subject,
        page: page ?? (typeof window !== "undefined" ? window.location.pathname : null),
        reason,
        detail,
      });
      if ("error" in result) {
        setReportError(result.error);
        return;
      }
      setReportState("sent");
    });
  }, [reason, detail, question, page]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const el = event.target as HTMLElement | null;
      if (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)) return;
      const key = event.key.toLowerCase();
      if (key === "f") {
        event.preventDefault();
        saveCard();
      }
      if (key === "r") {
        event.preventDefault();
        setReportOpen(true);
      }
      if (key === "escape") setReportOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveCard]);

  const cardLabel =
    cardState === "saved"
      ? "Card saved"
      : cardState === "exists"
        ? "Already in cards"
        : savingCard
          ? "Saving…"
          : "Save to card";

  return (
    <div className="relative flex flex-wrap items-center gap-1.5">
      {cardState === "needsAuth" ? (
        <Link
          href={signupHref}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-primary-light)] hover:bg-[var(--color-primary)]/20"
          title="Nothing is saved for guests — a free account keeps the card"
        >
          <Layers className="h-3.5 w-3.5" />
          Sign in to keep this card
        </Link>
      ) : (
        <button
          type="button"
          onClick={saveCard}
          aria-label="Save this question as a flashcard"
          title="Make a flashcard from this question (F)"
          disabled={savingCard || cardState === "saved" || cardState === "exists"}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            cardState === "saved" || cardState === "exists"
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
              : "border-white/10 bg-white/[0.04] text-white/60 hover:border-white/25 hover:text-white"
          } ${savingCard ? "opacity-70" : ""}`}
        >
          {cardState === "saved" || cardState === "exists" ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Layers className="h-3.5 w-3.5" />
          )}
          {cardLabel}
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          setReportOpen((open) => !open);
          setReportState("idle");
          setReportError(null);
        }}
        aria-expanded={reportOpen}
        aria-label="Report a problem with this question"
        title="Report a wrong key or a broken question (R)"
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
          reportState === "sent"
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
            : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/25 hover:text-white"
        }`}
      >
        <Flag className="h-3.5 w-3.5" />
        {reportState === "sent" ? "Reported" : "Report"}
      </button>

      {cardError && (
        <span role="status" className="text-[11px] text-amber-300">
          {cardError}
        </span>
      )}

      {reportOpen && (
        <div
          role="dialog"
          aria-label="Report this question"
          className="absolute left-0 top-full z-30 mt-2 w-[min(21rem,calc(100vw-2rem))] rounded-[14px] border border-white/12 bg-[#101a15] p-3 text-left shadow-2xl"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-xs font-bold text-white">What is wrong with this question?</p>
            <button
              type="button"
              onClick={() => setReportOpen(false)}
              aria-label="Close report"
              className="rounded-full border border-white/12 p-1 text-white/60 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {reportState === "sent" ? (
            <p role="status" className="text-xs leading-relaxed text-emerald-300">
              Received — a human will check it against the source. Thank you for the catch.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {REPORT_REASONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setReason(option)}
                    aria-pressed={reason === option}
                    className={`rounded-full border px-2 py-1 text-[11px] font-semibold transition-colors ${
                      reason === option
                        ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/20 text-white"
                        : "border-white/12 bg-white/[0.04] text-white/60 hover:bg-white/[0.09]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <textarea
                value={detail}
                onChange={(event) => setDetail(event.target.value.slice(0, 400))}
                rows={2}
                placeholder="Anything else? (optional)"
                aria-label="Details"
                className="mt-2 w-full resize-none rounded-[8px] border border-white/12 bg-black/25 px-2 py-1.5 text-xs text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
              />

              {reportError && (
                <p role="alert" className="mt-1.5 text-[11px] text-rose-300">
                  {reportError}
                </p>
              )}

              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={sendReport}
                  disabled={sendingReport}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/20 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[var(--color-primary)]/30 disabled:opacity-60"
                >
                  <Send className="h-3 w-3" />
                  {sendingReport ? "Sending…" : "Send report"}
                </button>
                {!signedIn && (
                  <span className="text-[10px] leading-tight text-white/40">
                    Sent anonymously
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

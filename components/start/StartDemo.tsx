"use client";

// The interactive half of a test's start page: the same questions, cards and
// clock the account unlocks, runnable before signing up. Nothing is capped to
// look generous — five questions and one deck are what the demo is, and the
// copy says so.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Layers, Pause, Play, RotateCcw, Timer, X } from "lucide-react";
import { FOCUS_PRESETS, formatClock, useFocusTimer } from "@/lib/use-focus-timer";

export type DemoQuestion = {
  key: string;
  subject: string;
  topic: string | null;
  prompt: string;
  options: [string, string, string, string];
  /** Index into options. */
  answer: number;
  explanation: string;
  /** True when the option labels are figures rather than text (not used by the demo). */
};

export type DemoDeck = {
  id: string;
  title: string;
  subject: string;
  cards: { front: string; back: string }[];
};

type Tab = "questions" | "cards" | "focus";

const LETTERS = ["A", "B", "C", "D"] as const;

export function StartDemo({
  label,
  bankLabel,
  totalQuestions,
  questions,
  decks,
  decksNote,
  drillHref,
  drillLabel,
}: {
  label: string;
  bankLabel: string;
  totalQuestions: number;
  questions: DemoQuestion[];
  decks: DemoDeck[];
  decksNote: string;
  drillHref: string;
  drillLabel: string;
}) {
  const [tab, setTab] = useState<Tab>("questions");

  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div
        role="tablist"
        aria-label={`${label} demo`}
        className="flex flex-wrap gap-2"
      >
        {(
          [
            { id: "questions", label: `Demo questions (${questions.length})`, Icon: Check },
            { id: "cards", label: `Flashcards (${decks.reduce((n, d) => n + d.cards.length, 0)})`, Icon: Layers },
            { id: "focus", label: "Focus block", Icon: Timer },
          ] as const
        ).map(({ id, label: tabLabel, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`start-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`start-panel-${id}`}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors sm:text-[13px] ${
              tab === id
                ? "border-[var(--line-signal)] bg-[var(--tint-signal)] text-[var(--signal-300)]"
                : "border-white/12 bg-white/[0.04] text-white/65 hover:bg-white/[0.09] hover:text-white"
            }`}
          >
            <Icon aria-hidden="true" className="h-3.5 w-3.5" />
            {tabLabel}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "questions" && (
          <div role="tabpanel" id="start-panel-questions" aria-labelledby="start-tab-questions">
            <DemoQuestions
              label={label}
              bankLabel={bankLabel}
              totalQuestions={totalQuestions}
              questions={questions}
            />
          </div>
        )}
        {tab === "cards" && (
          <div role="tabpanel" id="start-panel-cards" aria-labelledby="start-tab-cards">
            <DemoCards decks={decks} note={decksNote} />
          </div>
        )}
        {tab === "focus" && (
          <div role="tabpanel" id="start-panel-focus" aria-labelledby="start-tab-focus">
            <DemoFocus />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-xs text-white/55">
        <span>
          {totalQuestions.toLocaleString()} questions in the {bankLabel}, free during the beta.
        </span>
        <Link href={drillHref} className="inline-flex items-center gap-1 font-semibold text-white/85 hover:text-white">
          {drillLabel}
          <ArrowRight aria-hidden="true" className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function DemoQuestions({
  label,
  bankLabel,
  totalQuestions,
  questions,
}: {
  label: string;
  bankLabel: string;
  totalQuestions: number;
  questions: DemoQuestion[];
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const question = questions[index];
  const done = index === questions.length - 1 && picked !== null;

  const choose = useCallback(
    (option: number) => {
      setPicked((current) => (current === null ? option : current));
    },
    []
  );

  const go = useCallback(
    (delta: number) => {
      setIndex((current) => {
        const next = current + delta;
        if (next < 0 || next >= questions.length) return current;
        setPicked(null);
        return next;
      });
    },
    [questions.length]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const el = event.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (/^[1-4]$/.test(event.key) && question) {
        event.preventDefault();
        choose(Number(event.key) - 1);
      }
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, go, question]);

  if (!question) {
    return (
      <p className="text-sm text-white/60">
        This test&apos;s demo is being written. {totalQuestions.toLocaleString()} questions are
        already in the bank.
      </p>
    );
  }

  const correct = picked !== null && picked === question.answer;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
          {label} demo · question {index + 1} of {questions.length}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="Previous question"
            className="rounded-full border border-white/12 bg-white/[0.04] p-1.5 text-white/70 transition-colors hover:bg-white/[0.1] disabled:opacity-35"
          >
            <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={index === questions.length - 1}
            aria-label="Next question"
            className="rounded-full border border-white/12 bg-white/[0.04] p-1.5 text-white/70 transition-colors hover:bg-white/[0.1] disabled:opacity-35"
          >
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p className="mb-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-white/45">
        <span className="rounded-full border border-white/12 px-2 py-0.5">{question.subject}</span>
        {question.topic && (
          <span className="rounded-full border border-white/12 px-2 py-0.5">{question.topic}</span>
        )}
      </p>

      <p className="mt-2 text-base font-semibold leading-snug text-white sm:text-lg">
        {question.prompt}
      </p>

      <ul className="mt-3 space-y-1.5">
        {question.options.map((option, optionIndex) => {
          const isAnswer = optionIndex === question.answer;
          const isPicked = optionIndex === picked;
          const state =
            picked === null
              ? "idle"
              : isAnswer
                ? "correct"
                : isPicked
                  ? "wrong"
                  : "muted";
          return (
            <li key={optionIndex}>
              <button
                type="button"
                onClick={() => choose(optionIndex)}
                disabled={picked !== null}
                aria-pressed={isPicked}
                className={`flex w-full items-start gap-2.5 rounded-[12px] border px-3 py-2.5 text-left text-sm transition-colors ${
                  state === "correct"
                    ? "border-emerald-400/45 bg-emerald-400/10 text-white"
                    : state === "wrong"
                      ? "border-rose-400/45 bg-rose-400/10 text-white"
                      : state === "muted"
                        ? "border-white/8 bg-transparent text-white/45"
                        : "border-white/12 bg-white/[0.04] text-white/85 hover:border-white/25 hover:bg-white/[0.08]"
                }`}
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 text-[11px] font-bold">
                  {LETTERS[optionIndex]}
                </span>
                <span className="min-w-0 flex-1">{option}</span>
                {state === "correct" && <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />}
                {state === "wrong" && <X aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />}
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="mt-3 min-h-[2.5rem]">
        {picked === null ? (
          <p className="text-xs text-white/40">Tap an option, or press 1–4.</p>
        ) : (
          <div
            className={`rounded-[12px] border px-3 py-2.5 text-xs leading-relaxed ${
              correct
                ? "border-emerald-400/30 bg-emerald-400/5 text-white/80"
                : "border-rose-400/30 bg-rose-400/5 text-white/80"
            }`}
          >
            <span className="font-bold text-white">{correct ? "Correct. " : "Not this one. "}</span>
            {question.explanation}
          </div>
        )}
      </div>

      {done && (
        <p className="mt-3 text-xs text-white/55">
          That&apos;s the demo. The account is what keeps the rest —{" "}
          <Link href="#signup" className="font-semibold text-[var(--signal-300)] hover:underline">
            create one
          </Link>{" "}
          and the {bankLabel} opens in full.
        </p>
      )}
    </div>
  );
}

function DemoCards({ decks, note }: { decks: DemoDeck[]; note: string }) {
  const [deckIndex, setDeckIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const deck = decks[deckIndex];
  const card = deck?.cards[cardIndex];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const el = event.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName)) return;
      if (event.key === " ") {
        event.preventDefault();
        setFlipped((prev) => !prev);
      }
      if (event.key === "ArrowRight") {
        setCardIndex((i) => Math.min(i + 1, (deck?.cards.length ?? 1) - 1));
        setFlipped(false);
      }
      if (event.key === "ArrowLeft") {
        setCardIndex((i) => Math.max(i - 1, 0));
        setFlipped(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deck?.cards.length]);

  if (!deck || !card) {
    return (
      <div className="rounded-[14px] border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-center">
        <Layers aria-hidden="true" className="mx-auto h-5 w-5 text-white/40" />
        <p className="mt-2 text-sm font-semibold text-white">No deck written yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-white/55">{note}</p>
      </div>
    );
  }

  const last = cardIndex === deck.cards.length - 1;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {decks.map((option, optionIndex) => (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              setDeckIndex(optionIndex);
              setCardIndex(0);
              setFlipped(false);
            }}
            aria-pressed={optionIndex === deckIndex}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              optionIndex === deckIndex
                ? "border-[var(--line-signal)] bg-[var(--tint-signal)] text-[var(--signal-300)]"
                : "border-white/12 bg-white/[0.04] text-white/60 hover:bg-white/[0.09]"
            }`}
          >
            {option.title}
          </button>
        ))}
      </div>

      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
          {deck.subject} · card {cardIndex + 1} of {deck.cards.length}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setCardIndex((i) => Math.max(i - 1, 0));
              setFlipped(false);
            }}
            disabled={cardIndex === 0}
            aria-label="Previous card"
            className="rounded-full border border-white/12 bg-white/[0.04] p-1.5 text-white/70 transition-colors hover:bg-white/[0.1] disabled:opacity-35"
          >
            <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setCardIndex((i) => Math.min(i + 1, deck.cards.length - 1));
              setFlipped(false);
            }}
            disabled={last}
            aria-label="Next card"
            className="rounded-full border border-white/12 bg-white/[0.04] p-1.5 text-white/70 transition-colors hover:bg-white/[0.1] disabled:opacity-35"
          >
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((prev) => !prev)}
        aria-label={flipped ? "Show question" : "Show answer"}
        className="flex min-h-[11rem] w-full flex-col items-center justify-center gap-2 rounded-[16px] border border-white/12 bg-[#0d1512] px-4 py-6 text-center transition-colors hover:border-white/22"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
          {flipped ? "Answer" : "Question"}
        </span>
        <span className="text-sm font-semibold leading-relaxed text-white sm:text-base">
          {flipped ? card.back : card.front}
        </span>
        {!flipped && (
          <span className="mt-1 text-[11px] text-white/40">Click, or press Space, to flip</span>
        )}
      </button>

      <p className="mt-2 text-[11px] leading-relaxed text-white/45">{note}</p>
    </div>
  );
}

function DemoFocus() {
  const { preset, phase, remaining, running, notice, start, pause, reset, choosePreset } =
    useFocusTimer();

  return (
    <div className="rounded-[16px] border border-white/12 bg-[#0d1512] px-4 py-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-4xl font-bold tabular-nums text-white">
          {formatClock(remaining)}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
          {phase === "focus" ? "Focus" : "Break"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {FOCUS_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => choosePreset(p.id)}
            aria-pressed={preset === p.id}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              preset === p.id
                ? "border-[var(--line-signal)] bg-[var(--tint-signal)] text-[var(--signal-300)]"
                : "border-white/12 bg-white/[0.04] text-white/60 hover:bg-white/[0.09]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={running ? pause : start}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--line-signal)] bg-[var(--tint-signal)] px-4 py-2 text-xs font-bold text-[var(--signal-300)] transition-[filter] hover:brightness-125"
        >
          {running ? (
            <>
              <Pause aria-hidden="true" className="h-3.5 w-3.5" /> Pause
            </>
          ) : (
            <>
              <Play aria-hidden="true" className="h-3.5 w-3.5" /> Start
            </>
          )}
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset timer"
          className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-3 py-2 text-white/70 transition-colors hover:bg-white/[0.1]"
        >
          <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>

      <p aria-live="polite" className="mt-3 text-[11px] leading-relaxed text-white/45">
        {notice ??
          "Same clock as the drill. It keeps running while you work, and survives a reload in this browser."}
      </p>
    </div>
  );
}

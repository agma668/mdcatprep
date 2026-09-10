"use client";

/**
 * The one owner of quiz-run state, shared by every question surface.
 *
 * Before this module, each player (PracticeSession, MockTestPlayer,
 * DailyQuizClient, McqPlayer, DiagnosticPlayer) declared its own copy of the
 * same machine — index, answers, selected, revealed, score, finished, the
 * 250 ms navigation guard, and the keyboard bindings — and the copies drifted
 * (DiagnosticPlayer had no nav guard; the daily quiz bound only existing
 * options while practice/mock could phantom-pick missing C/D). A behavior fix
 * landed in one player had to be re-proven in four others.
 *
 * Players keep only rendering + surface-specific concerns (timers, results
 * screens, attempt-recording shape); this hook owns the state and the
 * transitions between questions.
 *
 *   mode "instant"  — picking reveals the verdict immediately (practice)
 *   mode "submit"   — pick, then reveal() shows the verdict (mcq, diagnostic,
 *                     daily quiz)
 *   mode "exam"     — picking never reveals; verdicts appear at the finish
 *                     (mock test)
 *
 * The keyboard bindings are the same on every surface that opts in:
 *   1–4 choose (only letters that exist), ← previous, →/Enter/Space continue,
 *   Esc exit. `enterRevealsFirst` gives the daily quiz its two-step
 *   check-then-advance Enter behaviour.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { OptionStatus } from "@/components/ui/QuizOptions";
import {
  OPTION_LETTERS,
  availableOptionLetters,
  type OptionLetter,
  type QuizQuestion,
} from "@/lib/questions";

const NAV_LOCK_MS = 250;

export type QuizMode = "instant" | "submit" | "exam";

export interface QuizSessionOptions {
  questions: QuizQuestion[];
  mode: QuizMode;
  /** sessionStorage key — when set, position + answers resume across reloads. */
  resumeKey?: string;
  /** Fires once per question, the moment its answer locks in (instant: at
   *  pick; submit: at reveal; exam: never — use onFinish). */
  onReveal?: (index: number, letter: OptionLetter) => void;
  /** Fires once when the run finishes. */
  onFinish?: (answers: Record<number, OptionLetter>) => void;
  /** Bind the global keys (default true). */
  bindKeys?: boolean;
  /** Esc navigates here; null disables Esc. */
  escHref?: string | null;
  /** Daily-quiz semantics: Enter/Space/→ reveals a picked answer first,
   *  then advances once revealed. */
  enterRevealsFirst?: boolean;
  /** Practice semantics: Esc keeps working on the results screen. */
  escOnResults?: boolean;
}

function saveSession(key: string, idx: number, answers: Record<number, string>) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ idx, answers }));
  } catch {
    /* storage unavailable */
  }
}

function loadSession(key: string, total: number): { idx: number; answers: Record<number, OptionLetter> } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const s = JSON.parse(raw) as { idx?: number; answers?: Record<string, string> };
    if (typeof s.idx !== "number" || s.idx < 0 || s.idx >= total) return null;
    const answers: Record<number, OptionLetter> = {};
    for (const [k, v] of Object.entries(s.answers ?? {})) {
      const i = Number(k);
      if (
        Number.isInteger(i) &&
        i >= 0 &&
        i < total &&
        (OPTION_LETTERS as readonly string[]).includes(v)
      ) {
        answers[i] = v as OptionLetter;
      }
    }
    return { idx: s.idx, answers };
  } catch {
    return null;
  }
}

export function useQuizSession({
  questions,
  mode,
  resumeKey,
  onReveal,
  onFinish,
  bindKeys = true,
  escHref = null,
  enterRevealsFirst = false,
  escOnResults = false,
}: QuizSessionOptions) {
  const router = useRouter();
  const total = questions.length;

  const restored = useMemo(
    () => (resumeKey ? loadSession(resumeKey, total) : null),
    [resumeKey, total]
  );

  const [index, setIndex] = useState(restored?.idx ?? 0);
  const [answers, setAnswers] = useState<Record<number, OptionLetter>>(restored?.answers ?? {});
  const [selected, setSelected] = useState<OptionLetter | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const lastNavAtRef = useRef(0);
  const finishedRef = useRef(false);
  // Latest callbacks without re-creating every stable handler (finish is
  // called from timers, so it must never capture a stale answers map).
  const answersRef = useRef(answers);
  const onRevealRef = useRef(onReveal);
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    answersRef.current = answers;
    onRevealRef.current = onReveal;
    onFinishRef.current = onFinish;
  });

  const current = questions[index];

  // Persist the run when a resume key is configured (practice sessions).
  useEffect(() => {
    if (!resumeKey) return;
    saveSession(resumeKey, index, answers);
  }, [resumeKey, index, answers]);

  /** Lock an answer in: fires onReveal exactly once per question. */
  const commit = useCallback(
    (i: number, letter: OptionLetter) => {
      setAnswers((a) => ({ ...a, [i]: letter }));
      if (questions[i] && letter === questions[i].correct_answer) setScore((s) => s + 1);
      onRevealRef.current?.(i, letter);
    },
    [questions]
  );

  const pick = useCallback(
    (letter: OptionLetter) => {
      if (finished) return;
      if (mode === "instant") {
        if (answers[index] !== undefined) return; // locked — answered stays answered
        commit(index, letter);
      } else if (mode === "exam") {
        // Exam mode: re-picking replaces the working answer; nothing locks
        // until submit.
        setAnswers((a) => ({ ...a, [index]: letter }));
      } else {
        if (answers[index] !== undefined) return;
        setSelected(letter);
      }
    },
    [answers, commit, finished, index, mode]
  );

  /** Submit mode only: reveal the verdict for the current pick. */
  const reveal = useCallback(() => {
    if (mode !== "submit" || finished) return;
    if (!selected || answers[index] !== undefined) return;
    commit(index, selected);
    setSelected(null);
  }, [answers, commit, finished, index, mode, selected]);

  const navLocked = useCallback(() => {
    const now = Date.now();
    if (now - lastNavAtRef.current < NAV_LOCK_MS) return true;
    lastNavAtRef.current = now;
    return false;
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    onFinishRef.current?.(answersRef.current);
  }, []);

  const next = useCallback(() => {
    if (finished) return;
    // Every mode except exam requires the current question answered first
    // (practice can't skip, mcq/diagnostic/daily reveal before advancing);
    // exam mode lets the student skip freely, like a real test.
    if (mode !== "exam" && answers[index] === undefined) return;
    if (navLocked()) return;
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
    } else {
      finish();
    }
  }, [answers, finished, finish, index, mode, navLocked, total]);

  const prev = useCallback(() => {
    if (finished || index === 0) return;
    if (navLocked()) return;
    setIndex((i) => Math.max(0, i - 1));
    setSelected(null);
  }, [finished, index, navLocked]);

  const restart = useCallback(() => {
    if (resumeKey) {
      try {
        sessionStorage.removeItem(resumeKey);
      } catch {
        /* ignore */
      }
    }
    finishedRef.current = false;
    lastNavAtRef.current = 0;
    setAnswers({});
    setSelected(null);
    setScore(0);
    setIndex(0);
    setFinished(false);
  }, [resumeKey]);

  /** Verdict colouring per option letter, from the single answers map. */
  const statusFor = useCallback(
    (letter: OptionLetter): OptionStatus => {
      const locked = answers[index];
      if (mode === "exam") return locked === letter ? "selected" : "idle";
      if (locked !== undefined) {
        const q = questions[index];
        if (q && letter === q.correct_answer) return "correct";
        return locked === letter ? "wrong" : "idle";
      }
      return selected === letter ? "selected" : "idle";
    },
    [answers, index, mode, questions, selected]
  );

  // Global key handling. Only acts outside inputs, never hijacks browser
  // shortcuts. The handler is a fresh closure every render so it always sees
  // the current state, but the window subscription itself is created ONCE and
  // dispatches through a ref: re-subscribing on every render churns
  // add/removeEventListener on every keystroke AND on every countdown tick
  // (the mock and timed drills re-render once per second), which is pure
  // waste on the question surface.
  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === "Escape") {
      if (escHref && (!finished || escOnResults)) router.push(escHref);
      return;
    }
    if (finished) return;

    const q = questions[index];
    if (!q) return;

    // Only bind letters that actually have an option (a missing C/D must
    // not be phantom-picked).
    const letter = OPTION_LETTERS[Number(e.key) - 1];
    if (letter && availableOptionLetters(q).includes(letter)) {
      e.preventDefault();
      pick(letter);
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
      return;
    }
    // → / Enter / Space = continue: check-then-next for the daily quiz,
    // plain next everywhere else.
    if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
      if (enterRevealsFirst && mode === "submit" && !answers[index] && selected) {
        e.preventDefault();
        reveal();
        return;
      }
      if (mode !== "exam" && answers[index] === undefined) return;
      e.preventDefault();
      next();
    }
  };

  const keyHandlerRef = useRef(onKey);
  // Keep the ref on the latest closure (runs after every render, before the
  // next keydown can be dispatched).
  useEffect(() => {
    keyHandlerRef.current = onKey;
  });
  // Subscribe once per mount; every later render only swaps the ref.
  useEffect(() => {
    if (!bindKeys) return;
    const listener = (e: KeyboardEvent) => keyHandlerRef.current(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [bindKeys]);

  const revealed = mode === "exam" ? false : answers[index] !== undefined;
  const correctCount = useMemo(
    () => questions.reduce((n, q, i) => n + (answers[i] === q.correct_answer ? 1 : 0), 0),
    [answers, questions]
  );


  return {
    total,
    index,
    current,
    answers,
    selected,
    score,
    correctCount,
    finished,
    revealed,
    pick,
    reveal,
    next,
    prev,
    restart,
    finish,
    statusFor,
  };
}
"use client";

// Study tools that sit beside the question on every practice surface:
//
//   Focus   a pomodoro block (25/5, 15/3 or 50/10) that keeps running while you
//           drill and survives a reload in the same browser
//   Calc    a real calculator — four operations, brackets, percent — used to
//           check arithmetic, never presented as an exam allowance
//   Decks   a link to the flashcard decks for this exam, or an honest note when
//           none exist yet instead of a link that goes nowhere
//
// The timer lives in lib/use-focus-timer.ts so the per-test start page runs the
// exact same clock. The rail is a right-edge column from `sm` up (it clears the
// question card) and a centred dock on phones.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Calculator, Layers, Pause, Play, RotateCcw, Timer, X } from "lucide-react";
import { calculatorStatusLabel, EXAM_TOOLKITS, type ExamToolsId } from "@/lib/exam-tools";
import { FOCUS_PRESETS, formatClock, useFocusTimer } from "@/lib/use-focus-timer";

type Tab = "focus" | "calc";

/**
 * Arithmetic with no eval: a tiny recursive-descent parser over the string the
 * display shows. Supports + - × ÷ brackets, decimals and a postfix percent.
 * Throws on anything it cannot read, which the caller renders as "Error".
 */
function evaluateExpression(input: string): number {
  const src = input
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/\s+/g, "");
  let i = 0;

  const expression = (): number => {
    let value = term();
    while (src[i] === "+" || src[i] === "-") {
      const op = src[i++];
      const rhs = term();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  };

  const term = (): number => {
    let value = factor();
    while (src[i] === "*" || src[i] === "/") {
      const op = src[i++];
      const rhs = factor();
      value = op === "*" ? value * rhs : value / rhs;
    }
    return value;
  };

  const factor = (): number => {
    let sign = 1;
    while (src[i] === "+" || src[i] === "-") {
      if (src[i] === "-") sign = -sign;
      i += 1;
    }
    let value: number;
    if (src[i] === "(") {
      i += 1;
      value = expression();
      if (src[i] !== ")") throw new Error("Unclosed bracket");
      i += 1;
    } else {
      const start = i;
      while (i < src.length && /[0-9.]/.test(src[i])) i += 1;
      if (start === i) throw new Error("Expected a number");
      value = Number(src.slice(start, i));
      if (!Number.isFinite(value)) throw new Error("Not a number");
    }
    while (src[i] === "%") {
      value /= 100;
      i += 1;
    }
    return sign * value;
  };

  const result = expression();
  if (i !== src.length) throw new Error("Could not read the whole expression");
  if (!Number.isFinite(result)) throw new Error("Out of range");
  return result;
}

function formatResult(value: number): string {
  const rounded = Number(value.toPrecision(12));
  if (Object.is(rounded, -0)) return "0";
  const text = String(rounded);
  return text.length > 14 ? rounded.toExponential(6) : text;
}

const CALC_KEYS = [
  "C",
  "(",
  ")",
  "÷",
  "7",
  "8",
  "9",
  "×",
  "4",
  "5",
  "6",
  "−",
  "1",
  "2",
  "3",
  "+",
  "0",
  ".",
  "%",
  "⌫",
] as const;

export function StudyTools({
  exam,
  tone = "surface",
}: {
  exam: ExamToolsId;
  /** "dark" for the full-focus player, which renders on a fixed dark field. */
  tone?: "surface" | "dark";
}) {
  const toolkit = EXAM_TOOLKITS[exam];
  const [open, setOpen] = useState<Tab | null>(null);

  const { preset, phase, remaining, running, notice, start, pause, reset, choosePreset } =
    useFocusTimer();

  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [calcError, setCalcError] = useState(false);

  const press = useCallback((key: string) => {
    setCalcError(false);
    if (key === "C") {
      setExpr("");
      setResult(null);
      return;
    }
    if (key === "⌫") {
      setExpr((prev) => prev.slice(0, -1));
      setResult(null);
      return;
    }
    if (key === "=") {
      setExpr((current) => {
        if (!current.trim()) return current;
        try {
          setResult(formatResult(evaluateExpression(current)));
        } catch {
          setResult("Error");
          setCalcError(true);
        }
        return current;
      });
      return;
    }
    setResult(null);
    setExpr((prev) => prev + key);
  }, []);

  // Escape closes whichever panel is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const surface =
    tone === "dark"
      ? {
          panel: "border-white/12 bg-[#101a15] text-white",
          muted: "text-white/55",
          rule: "border-white/10",
          chip: "border-white/15 bg-white/[0.06] text-white/80 hover:bg-white/[0.12]",
          chipOn: "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/20 text-white",
          key: "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.1]",
          keyFn: "border-white/10 bg-white/[0.08] text-white/70 hover:bg-white/[0.14]",
          dock: "border-white/12 bg-[#101a15] text-white",
          accent: "text-[var(--color-primary-light)]",
        }
      : {
          panel: "border-[var(--line-2)] bg-[var(--srf-1)] text-[var(--steel-100)] shadow-xl",
          muted: "text-[var(--steel-400)]",
          rule: "border-[var(--line-2)]",
          chip: "border-[var(--line-2)] bg-[var(--srf-3)] text-[var(--steel-300)] hover:bg-[var(--srf-2)]",
          chipOn: "border-[var(--line-signal)] bg-[var(--tint-signal)] text-[var(--signal-300)]",
          key: "border-[var(--line-2)] bg-[var(--field-1)] text-[var(--steel-100)] hover:bg-[var(--srf-3)]",
          keyFn: "border-[var(--line-2)] bg-[var(--srf-3)] text-[var(--steel-300)] hover:bg-[var(--srf-2)]",
          dock: "border-[var(--line-2)] bg-[var(--srf-1)] text-[var(--steel-100)] shadow-lg",
          accent: "text-[var(--signal-300)]",
        };

  const railButton = (tab: Tab, label: string, Icon: typeof Timer) => (
    <button
      type="button"
      onClick={() => setOpen((prev) => (prev === tab ? null : tab))}
      aria-pressed={open === tab}
      aria-expanded={open === tab}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
        open === tab ? surface.chipOn : surface.chip
      }`}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
    </button>
  );

  return (
    <div className="pointer-events-none fixed bottom-3 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-36 sm:left-auto sm:right-4 sm:translate-x-0 sm:items-end">
      {open && (
        <div
          role="dialog"
          aria-label={open === "focus" ? "Focus timer" : "Calculator"}
          className={`pointer-events-auto w-[min(20rem,calc(100vw-1rem))] rounded-[14px] border p-3.5 ${surface.panel}`}
        >
          <div className="mb-2.5 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${surface.muted}`}>
                {toolkit.label}
              </p>
              <p className="text-sm font-extrabold">
                {open === "focus" ? "Focus block" : "Arithmetic aid"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close tools"
              className={`rounded-full border p-1 transition-colors ${surface.chip}`}
            >
              <X aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>

          {open === "focus" && (
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-3xl font-bold tabular-nums">
                  {formatClock(remaining)}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-[0.14em] ${surface.muted}`}>
                  {phase === "focus" ? "Focus" : "Break"}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {FOCUS_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => choosePreset(p.id)}
                    aria-pressed={preset === p.id}
                    className={`rounded-full border px-2 py-1 text-[11px] font-semibold transition-colors ${
                      preset === p.id ? surface.chipOn : surface.chip
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={running ? pause : start}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${surface.chipOn}`}
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
                  className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1.5 transition-colors ${surface.chip}`}
                >
                  <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              </div>
              <p aria-live="polite" className={`mt-2 text-[11px] leading-relaxed ${surface.muted}`}>
                {notice ??
                  "25 minutes on, 5 off. The clock keeps running while you drill, and stays in this browser."}
              </p>
            </div>
          )}

          {open === "calc" && (
            <div>
              <div
                className={`rounded-[10px] border px-2.5 py-2 text-right ${surface.rule} ${
                  tone === "dark" ? "bg-black/30" : "bg-[var(--field-1)]"
                }`}
              >
                <p className={`truncate text-xs tabular-nums ${surface.muted}`} aria-hidden="true">
                  {expr || "0"}
                </p>
                <p
                  aria-live="polite"
                  className={`truncate text-xl font-bold tabular-nums ${calcError ? "text-rose-400" : ""}`}
                >
                  {result ?? "\u00a0"}
                </p>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {CALC_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => press(key)}
                    aria-label={key === "⌫" ? "Backspace" : key}
                    className={`rounded-[8px] border py-2 text-sm font-semibold transition-colors ${
                      /[0-9.]/.test(key) ? surface.key : surface.keyFn
                    }`}
                  >
                    {key}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => press("=")}
                  className={`col-span-4 rounded-[8px] border py-2 text-sm font-bold transition-colors ${surface.chipOn}`}
                >
                  =
                </button>
              </div>
              <p className={`mt-2 text-[11px] leading-relaxed ${surface.muted}`}>
                <span className={`font-bold ${surface.accent}`}>
                  {calculatorStatusLabel(toolkit.calculator.status)}.
                </span>{" "}
                {toolkit.calculator.note}
              </p>
            </div>
          )}
        </div>
      )}

      <div className={`pointer-events-auto flex flex-row gap-1 rounded-full border p-1 sm:flex-col ${surface.dock}`}>
        {railButton("focus", "Focus timer (pomodoro)", Timer)}
        {railButton("calc", "Calculator (practice aid)", Calculator)}
        {toolkit.flashcards.href ? (
          <Link
            href={toolkit.flashcards.href}
            title={toolkit.flashcards.note}
            aria-label={`Flashcards: ${toolkit.flashcards.note}`}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${surface.chip}`}
          >
            <Layers aria-hidden="true" className="h-4 w-4" />
          </Link>
        ) : (
          <span
            title={toolkit.flashcards.note}
            aria-label={`No flashcards yet: ${toolkit.flashcards.note}`}
            className={`inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full border border-dashed opacity-50 ${surface.chip}`}
          >
            <Layers aria-hidden="true" className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}

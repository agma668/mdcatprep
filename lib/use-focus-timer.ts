"use client";

// One pomodoro implementation, shared by the floating study rail and the
// per-test start page. The deadline is what is stored, not a counter: reload in
// the middle of a block and it resumes at the real remaining time, and a block
// that already expired is not silently restarted.
//
// Two rules this file exists to keep:
//   1. Nothing here calls Date.now() while rendering — the stored snapshot is
//      resolved once, at module load, so a render cannot produce a value that
//      changes between React's render and commit.
//   2. Nothing writes state from an effect body just to restore a value the
//      first paint does not show yet.

import { useCallback, useEffect, useRef, useState } from "react";

export type FocusPresetId = "25" | "15" | "50";
export type FocusPhase = "focus" | "rest";

export const FOCUS_PRESETS = [
  { id: "25", label: "25 / 5", focus: 25 * 60, rest: 5 * 60 },
  { id: "15", label: "15 / 3", focus: 15 * 60, rest: 3 * 60 },
  { id: "50", label: "50 / 10", focus: 50 * 60, rest: 10 * 60 },
] as const;

const STORAGE_KEY = "apex.practice.focus";

type StoredTimer = {
  preset: FocusPresetId;
  phase: FocusPhase;
  remaining: number;
  endsAt: number | null;
};

export type ResolvedTimer = StoredTimer & { running: boolean };

export function presetLength(preset: FocusPresetId, phase: FocusPhase): number {
  const found = FOCUS_PRESETS.find((p) => p.id === preset) ?? FOCUS_PRESETS[0];
  return phase === "focus" ? found.focus : found.rest;
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

let cached: ResolvedTimer | undefined;

const DEFAULT_TIMER: ResolvedTimer = {
  preset: "25",
  phase: "focus",
  remaining: 25 * 60,
  endsAt: null,
  running: false,
};

function readStoredTimer(): ResolvedTimer {
  if (typeof window === "undefined") return DEFAULT_TIMER;
  if (cached !== undefined) return cached;
  cached = DEFAULT_TIMER;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cached;
    const saved = JSON.parse(raw) as StoredTimer;
    if (!FOCUS_PRESETS.some((p) => p.id === saved.preset)) return cached;
    if (saved.phase !== "focus" && saved.phase !== "rest") return cached;
    if (saved.endsAt) {
      const left = Math.round((saved.endsAt - Date.now()) / 1000);
      if (left > 0) {
        cached = { ...saved, remaining: left, running: true };
        return cached;
      }
    }
    cached = {
      preset: saved.preset,
      phase: saved.phase,
      remaining:
        Number.isFinite(saved.remaining) && saved.remaining > 0
          ? saved.remaining
          : presetLength(saved.preset, saved.phase),
      endsAt: null,
      running: false,
    };
  } catch {
    /* a corrupt or unreadable value is ignored, never repaired by guessing */
  }
  return cached;
}

export function useFocusTimer() {
  const initial = readStoredTimer();

  const [preset, setPreset] = useState<FocusPresetId>(initial.preset);
  const [phase, setPhase] = useState<FocusPhase>(initial.phase);
  const [remaining, setRemaining] = useState(initial.remaining);
  const [running, setRunning] = useState(initial.running);
  const [notice, setNotice] = useState<string | null>(null);
  const endsAt = useRef<number | null>(initial.running ? initial.endsAt : null);

  const persist = useCallback((next: StoredTimer) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage may be unavailable; the timer still works for this tab */
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const end = endsAt.current;
      if (!end) return;
      const left = Math.round((end - Date.now()) / 1000);
      if (left > 0) {
        setRemaining(left);
        return;
      }
      // Block finished: flip the phase, stop, and say so without a sound.
      const nextPhase: FocusPhase = phase === "focus" ? "rest" : "focus";
      const nextLength = presetLength(preset, nextPhase);
      endsAt.current = null;
      setRunning(false);
      setPhase(nextPhase);
      setRemaining(nextLength);
      setNotice(
        nextPhase === "rest" ? "Focus block done — take the break." : "Break over — back to the paper."
      );
      persist({ preset, phase: nextPhase, remaining: nextLength, endsAt: null });
    }, 500);
    return () => window.clearInterval(id);
  }, [running, phase, preset, persist]);

  const start = useCallback(() => {
    const end = Date.now() + remaining * 1000;
    endsAt.current = end;
    setRunning(true);
    setNotice(null);
    persist({ preset, phase, remaining, endsAt: end });
  }, [remaining, preset, phase, persist]);

  const pause = useCallback(() => {
    endsAt.current = null;
    setRunning(false);
    persist({ preset, phase, remaining, endsAt: null });
  }, [preset, phase, remaining, persist]);

  const reset = useCallback(() => {
    const length = presetLength(preset, phase);
    endsAt.current = null;
    setRunning(false);
    setRemaining(length);
    setNotice(null);
    persist({ preset, phase, remaining: length, endsAt: null });
  }, [preset, phase, persist]);

  const choosePreset = useCallback(
    (id: FocusPresetId) => {
      const length = presetLength(id, phase);
      setPreset(id);
      endsAt.current = null;
      setRunning(false);
      setRemaining(length);
      setNotice(null);
      persist({ preset: id, phase, remaining: length, endsAt: null });
    },
    [phase, persist]
  );

  return { preset, phase, remaining, running, notice, start, pause, reset, choosePreset };
}

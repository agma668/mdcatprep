// Client hook for the shared "Preparing for" choice (lib/prep-tests.ts).
// useSyncExternalStore keeps localStorage as the single source of truth —
// every consumer re-renders on the PREP_CHANGE_EVENT broadcast with no
// setState-in-effect cascades, and hydration is safe via the server snapshot.
"use client";

import { useCallback, useSyncExternalStore } from "react";
import { PREP_CHANGE_EVENT, readPrepChoice, type PrepFamily } from "./prep-tests";

/** The saved choice id for the family, or null when nothing valid is stored. */
export function usePrepChoice(family: PrepFamily): string | null {
  const getSnapshot = useCallback(() => readPrepChoice(family), [family]);
  const getServerSnapshot = useCallback(() => null, []); // SSR-safe: nothing stored on the server

  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener(PREP_CHANGE_EVENT, onChange);
    window.addEventListener("focus", onChange);
    return () => {
      window.removeEventListener(PREP_CHANGE_EVENT, onChange);
      window.removeEventListener("focus", onChange);
    };
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

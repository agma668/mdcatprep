"use client";

// Appearance engine.
//
// Two modes, not four palettes: `dark` (default) and `light`. The attribute
// lives on <html> as data-mode="dark" | "light"; every colour comes from the
// token blocks in globals.css, so nothing in a component carries a hex.
//
// The old four-theme picker (midnight/emerald/crimson/violet) was removed
// because four dark variants of the same palette is a preference menu, not a
// feature, and it made the light mode people actually use impossible to ship.
//
// First visit follows the OS (`prefers-color-scheme`); after that the choice is
// remembered. layout.tsx writes the attribute inline before paint so there is
// no flash of the wrong mode.

import { useEffect, type ReactNode } from "react";

export type Mode = "dark" | "light";

const STORAGE_KEY = "med-prep-mode";

function getInitialMode(): Mode {
  if (typeof window === "undefined") return "dark";
  const stored = window.__MED_PREP_MODE__;
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The inline script in layout.tsx has already set the attribute before paint;
  // this only reconciles React's view and seeds the global for the toggle. No
  // state lives here — the button owns the only mutable copy of the mode.
  useEffect(() => {
    const initial = getInitialMode();
    document.documentElement.dataset.mode = initial;
    document.documentElement.style.colorScheme = initial;
    window.__MED_PREP_MODE__ = initial;
  }, []);

  return <>{children}</>;
}

export function applyMode(mode: Mode) {
  document.documentElement.dataset.mode = mode;
  document.documentElement.style.colorScheme = mode;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
  window.__MED_PREP_MODE__ = mode;
  window.dispatchEvent(new CustomEvent<Mode>("med-prep:mode", { detail: mode }));
}

export function getMode(): Mode {
  if (typeof window === "undefined") return "dark";
  return document.documentElement.dataset.mode === "light" ? "light" : "dark";
}

declare global {
  interface Window {
    __MED_PREP_MODE__?: Mode;
  }
}

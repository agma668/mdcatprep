"use client";

// Theme engine for Cadet College Prep.
//
// Applies a `data-theme` attribute on <html> (midnight | emerald | crimson |
// violet). All recolouring happens in CSS via [data-theme="..."] blocks in
// app/globals.css — this component only sets the attribute, persists the choice
// in localStorage, and avoids a flash of the wrong theme on reload (FOUC) by
// honouring an inline <script> written into <head> by layout.tsx.
//
// `midnight` is the default and needs no attribute (it IS :root); the others
// override the tokens. The three named palettes are ACCENT-ONLY: they keep the
// same near-black field and swap the gold accent for green, wine or iris, which
// is why every swatch below starts with the same dark ground and differs only
// in its two accents.

import { useEffect, useState, type ReactNode } from "react";

export type ThemeId = "midnight" | "emerald" | "crimson" | "violet";

export const THEMES: { id: ThemeId; label: string; dots: [string, string, string] }[] = [
  { id: "midnight", label: "Midnight Gold", dots: ["#0A0A0A", "#C9A24B", "#F3E0AE"] },
  { id: "emerald", label: "Forest", dots: ["#0A0A0A", "#3FAE8B", "#C9A24B"] },
  { id: "crimson", label: "Wine", dots: ["#0A0A0A", "#BC5267", "#D9AE54"] },
  { id: "violet", label: "Iris", dots: ["#0A0A0A", "#7260C0", "#C9A24B"] },
];

const STORAGE_KEY = "cadet-prep-theme";

function getInitialTheme(): ThemeId {
  if (typeof window === "undefined") return "midnight";
  return (window.__CADET_PREP_THEME__ as ThemeId) || "midnight";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* private mode — ignore */
    }
  }, [theme]);

  // Keep the global live so any future component can read it without a round trip.
  useEffect(() => {
    window.__CADET_PREP_THEME__ = theme;
  }, [theme]);

  return <>{children}</>;
}

/** Getter/setter exposed as a tiny module for the switcher and any deep reader. */
export function applyTheme(theme: ThemeId) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  window.__CADET_PREP_THEME__ = theme;
}

export function getTheme(): ThemeId {
  return (window.__CADET_PREP_THEME__ as ThemeId) || "midnight";
}

// Type augmentation
declare global {
  interface Window {
    __CADET_PREP_THEME__?: ThemeId;
  }
}
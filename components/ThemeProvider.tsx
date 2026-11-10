"use client";

// Theme engine for MED Prep.
//
// Applies a `data-theme` attribute on <html> (midnight | emerald | crimson |
// violet). All recolouring happens in CSS via [data-theme="..."] blocks in
// globals.css — this component only sets the attribute, persists the choice in
// localStorage, and avoids a flash of the wrong theme on reload (FOUC) by
// honouring an inline <script> written into <head> by layout.tsx.
//
// `midnight` is the default and needs no attribute (it IS :root); the others
// override the tokens.

import { useEffect, useState, type ReactNode } from "react";

export type ThemeId = "midnight" | "emerald" | "crimson" | "violet" | "paper";

export const THEMES: { id: ThemeId; label: string; dots: [string, string, string] }[] = [
  { id: "midnight", label: "Midnight", dots: ["#05080F", "#3D7EDB", "#C9A24B"] },
  { id: "emerald", label: "Forest", dots: ["#04100C", "#3FAE8B", "#C9A24B"] },
  { id: "crimson", label: "Wine", dots: ["#0F0508", "#BC5267", "#C9A24B"] },
  { id: "violet", label: "Iris", dots: ["#0E0814", "#7260C0", "#C9A24B"] },
  { id: "paper", label: "Paper", dots: ["#F8F7F3", "#285A87", "#A47B36"] },
];

const STORAGE_KEY = "med-prep-theme";

function getInitialTheme(): ThemeId {
  if (typeof window === "undefined") return "midnight";
  return (window.__MED_PREP_THEME__ as ThemeId) || "midnight";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme === "midnight" ? "midnight" : theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* private mode — ignore */
    }
  }, [theme]);

  // Keep the global live so any future component can read it without a round trip.
  useEffect(() => {
    window.__MED_PREP_THEME__ = theme;
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
  window.__MED_PREP_THEME__ = theme;
}

export function getTheme(): ThemeId {
  return (window.__MED_PREP_THEME__ as ThemeId) || "midnight";
}

// Type augmentation
declare global {
  interface Window {
    __MED_PREP_THEME__?: ThemeId;
  }
}
"use client";

// Theme engine for MED Prep.
//
// Applies a `data-theme` attribute on <html> (paper | midnight). All recolouring happens in CSS via [data-theme="..."] blocks in
// globals.css — this component only sets the attribute, persists the choice in
// localStorage, and avoids a flash of the wrong theme on reload (FOUC) by
// honouring an inline <script> written into <head> by layout.tsx.
//
// Paper is the default light appearance; Midnight is the matching dark mode.

import { useEffect, useState, type ReactNode } from "react";

export type ThemeId = "midnight" | "paper";

export const THEMES: { id: ThemeId; label: string; dots: [string, string, string] }[] = [
  { id: "paper", label: "Paper · Light", dots: ["#EEEAE1", "#526548", "#A47B36"] },
  { id: "midnight", label: "Midnight · Dark", dots: ["#090F1B", "#93BCF6", "#C9A24B"] },
];

const STORAGE_KEY = "med-prep-theme";

function getInitialTheme(): ThemeId {
  if (typeof window === "undefined") return "paper";
  const current = window.__MED_PREP_THEME__;
  return current === "midnight" || current === "paper" ? current : "paper";
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
  return window.__MED_PREP_THEME__ === "midnight" ? "midnight" : "paper";
}

// Type augmentation
declare global {
  interface Window {
    __MED_PREP_THEME__?: ThemeId;
  }
}
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, getTheme, type ThemeId } from "./ThemeProvider";

/** One-click day/night control: the icon previews the mode it will switch to. */
export function ThemeSwitcher() {
  const [current, setCurrent] = useState<ThemeId>("paper");

  useEffect(() => {
    setCurrent(getTheme());
  }, []);

  const next: ThemeId = current === "paper" ? "midnight" : "paper";
  const label = current === "paper" ? "Switch to dark mode" : "Switch to light mode";
  const Icon = current === "paper" ? Moon : Sun;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        applyTheme(next);
        setCurrent(next);
      }}
      className="tap-44 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-2)] bg-[var(--srf-1)] text-[var(--steel-200)] transition-colors hover:border-[var(--line-3)] hover:bg-[var(--srf-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]"
    >
      <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
    </button>
  );
}

"use client";

// Sun / moon appearance toggle.
//
// One button, two icons stacked in the same 20px box: the sun rotates out and
// the moon rotates in. The movement is the affordance — it says "this changes
// light" before the label is read. Reduced-motion users get the crossfade
// without the rotation (see .mode-icon in globals.css).

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyMode, getMode, type Mode } from "./ThemeProvider";

export function ThemeSwitcher() {
  const [mode, setMode] = useState<Mode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setMode(getMode());
      setMounted(true);
    }, 0);
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<Mode>).detail;
      if (next === "dark" || next === "light") setMode(next);
    };
    window.addEventListener("med-prep:mode", onChange);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("med-prep:mode", onChange);
    };
  }, []);

  const next: Mode = mode === "dark" ? "light" : "dark";
  const label = `Switch to ${next} mode`;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      // applyMode writes the attribute and emits the event the listener above
      // already consumes — setting state here too was a second source of truth.
      onClick={() => applyMode(next)}
      className="mode-toggle tap-44 relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-2)] bg-[var(--srf-1)] text-[var(--steel-200)] transition-colors duration-300 hover:border-[var(--line-signal)] hover:text-[var(--signal-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal-400)]"
    >
      <span className="mode-icon relative block h-5 w-5">
        <Sun
          aria-hidden="true"
          size={20}
          strokeWidth={1.7}
          className="mode-icon-sun absolute inset-0"
          data-on={mounted && mode === "light" ? "true" : "false"}
        />
        <Moon
          aria-hidden="true"
          size={20}
          strokeWidth={1.7}
          className="mode-icon-moon absolute inset-0"
          data-on={mounted && mode === "dark" ? "true" : "false"}
        />
      </span>
    </button>
  );
}

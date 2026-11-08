"use client";

// Theme switcher — a compact row of colour dots in the nav. Click a dot to
// switch the whole-site palette. The choice persists in localStorage and is
// applied live via data-theme; there is no reload.
//
// The dots show the three "signature" tones of each theme (field, signal,
// brass) so the student can tell them apart at a glance.

import { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { THEMES, applyTheme, getTheme, type ThemeId } from "./ThemeProvider";

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ThemeId>("midnight");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setCurrent(getTheme()), 0);
    return () => window.clearTimeout(id);
  }, []);

  // Close the popover on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = THEMES.find((t) => t.id === current) ?? THEMES[0];

  return (
    <div ref={ref} className="relative">
      {/* Trigger: a single dot showing the current theme's signal colour. */}
      <button
        type="button"
        aria-label={`Theme: ${active.label}. Change theme.`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="tap-44 flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--line-2)] bg-[var(--field-0)] transition-colors hover:border-[var(--line-signal)] hover:bg-[var(--srf-2)]"
      >
        <span
          aria-hidden="true"
          className="h-4 w-4 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${active.dots[1]}, ${active.dots[2]})`,
            boxShadow: `0 0 12px ${active.dots[1]}55`,
          }}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Theme picker"
          className="menu-in absolute right-0 top-11 w-56 rounded-[var(--radius-lg)] border border-[var(--line-2)] bg-[var(--field-0)] p-1.5 shadow-[var(--shadow-xl)]"
        >
          <p className="px-2 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--steel-400)]">
            Colour — whole site
          </p>
          {THEMES.map((t) => {
            const selected = t.id === current;
            return (
              <button
                key={t.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  applyTheme(t.id);
                  setCurrent(t.id);
                  setOpen(false);
                }}
                className={[
                  "flex w-full items-center gap-3 rounded-[var(--radius-2)] px-2 py-2 text-left",
                  "transition-colors hover:bg-[var(--srf-2)]",
                  selected ? "bg-[var(--srf-2)]" : "",
                ].join(" ")}
              >
                {/* three-dot swatch */}
                <span aria-hidden="true" className="flex -space-x-1">
                  {t.dots.map((c, i) => (
                    <span
                      key={i}
                      className="h-4 w-4 rounded-full border border-[var(--line-2)]"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                <span className="flex-1 text-sm font-medium text-[var(--steel-200)]">
                  {t.label}
                </span>
                {selected && (
                  <Check aria-hidden="true" size={15} className="text-[var(--signal-300)]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
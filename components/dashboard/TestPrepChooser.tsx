"use client";

// The "Preparing for …" chooser that sits top-left in a portal's sidebar.
// One select per portal; the choice is written to the shared prep store
// (lib/prep-tests.ts) and broadcast, so practice, notes and flashcards
// re-thread to the chosen test without navigation. Rendered compact when the
// sidebar is collapsed (icon tile only, still a working select).

import { useEffect, useState } from "react";
import { GraduationCap, Layers } from "lucide-react";
import {
  PREP_TESTS,
  PREP_CHANGE_EVENT,
  readPrepChoice,
  writePrepChoice,
  type PrepFamily,
} from "@/lib/prep-tests";

const ALL_ID = "__all__";

export function TestPrepChooser({
  family,
  collapsed = false,
}: {
  family: PrepFamily;
  collapsed?: boolean;
}) {
  const tests = PREP_TESTS[family];
  const [choice, setChoice] = useState<string | null>(null);

  // Read the saved choice after mount and follow every later change — the
  // practice page's own chooser writes the same store, so the sidebar and
  // the surfaces never disagree.
  useEffect(() => {
    const sync = () => setChoice(readPrepChoice(family));
    sync();
    window.addEventListener(PREP_CHANGE_EVENT, sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener(PREP_CHANGE_EVENT, sync);
      window.removeEventListener("focus", sync);
    };
  }, [family]);

  const select = (value: string) => {
    const next = value === ALL_ID ? null : value;
    setChoice(next);
    writePrepChoice(family, next);
  };

  if (collapsed) {
    return (
      <span
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--srf-2)] text-[var(--steel-400)]"
        title={choice ? `Preparing for ${choice}` : "Preparing for — all tests"}
      >
        <GraduationCap className="w-4 h-4" />
      </span>
    );
  }

  const selected = tests.find((t) => t.id === choice);

  return (
    <div className="rounded-[var(--radius-md)] bg-white/[0.04] p-3 ring-1 ring-white/[0.08]">
      <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
        Preparing for
      </label>
      <div className="relative mt-1.5">
        <span aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm">
          {selected?.mark ?? "🎯"}
        </span>
        <select
          aria-label={`Choose the test you are preparing for in the ${family} portal`}
          value={choice ?? ALL_ID}
          onChange={(e) => select(e.target.value)}
          className="w-full appearance-none truncate text-ellipsis rounded-[var(--radius-sm)] bg-[var(--srf-2)] py-2 pl-8 pr-7 text-xs font-bold text-white ring-1 ring-white/10 transition-colors hover:ring-white/25 focus:outline-none focus:ring-2 focus:ring-[var(--signal-500)]/60 cursor-pointer"
        >
          <option value={ALL_ID}>All tests in this portal</option>
          {tests.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <Layers
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-1/2 w-3.5 h-3.5 -translate-y-1/2 text-white/40"
        />
      </div>
      <p className="mt-2 text-[10.5px] leading-snug text-white/50 truncate" title={selected?.note}>
        {selected ? selected.note : "Pick your paper — subjects, notes and cards follow it."}
      </p>
    </div>
  );
}

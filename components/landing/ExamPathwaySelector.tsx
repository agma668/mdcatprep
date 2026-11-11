"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calculator, GraduationCap, ShieldCheck, Stethoscope } from "lucide-react";
import { PREP_SPACES, type PrepSpaceCapability, type PrepSpaceDefinition } from "@/lib/prep-space-registry";

const STORAGE_KEY = "edweb:selected-prep-space:v1";
const SELECTION_EVENT = "edweb:prep-space-selected";
const CATEGORY_LABELS: Record<PrepSpaceDefinition["category"], string> = { medical: "Medical", engineering: "Engineering", scholarship: "Scholarship", defence: "Defence" };
const CATEGORY_ICONS = { medical: Stethoscope, engineering: Calculator, scholarship: GraduationCap, defence: ShieldCheck };
const CATEGORY_ORDER: PrepSpaceDefinition["category"][] = ["medical", "engineering", "defence", "scholarship"];
const READINESS_LABELS = { beta: "Available", content_in_progress: "In progress", coming_soon: "Coming soon" } as const;
const CAPABILITY_LABELS: Record<PrepSpaceCapability, string> = { mcq_practice: "MCQ practice", scaled_timed_mock: "Timed practice", flashcards: "Flashcards", concept_notes: "Concept notes", released_past_papers: "Past papers", verbal_nonverbal_drills: "Verbal & non-verbal drills" };

function rememberPath(slug: string) {
  try { window.sessionStorage.setItem(STORAGE_KEY, slug); } catch { /* Storage is optional. */ }
}

export function ExamPathwaySelector() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved && PREP_SPACES.some((space) => space.slug === saved)) setSelectedSlug(saved);
    } catch { /* Selector remains usable without storage. */ }
  }, []);

  const selected = PREP_SPACES.find((space) => space.slug === selectedSlug) ?? null;
  const canEnter = Boolean(selected && selected.readiness === "beta" && selected.legacyRoute);

  function selectPath(space: (typeof PREP_SPACES)[number]) {
    setSelectedSlug(space.slug);
    rememberPath(space.slug);
    window.dispatchEvent(new CustomEvent(SELECTION_EVENT, { detail: space.slug }));
  }

  return (
    <section id="choose-path" aria-labelledby="choose-path-heading" className="exam-selector-showcase w-full">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--signal-300)]">Find your route</p>
        <h2 id="choose-path-heading" className="landing-display mt-2 text-3xl leading-tight text-[var(--steel-100)] sm:text-4xl">Every test. One place.</h2>
        <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-[var(--steel-400)]">Medical, engineering, defence and scholarship pathways are all visible from the start. Choose the one you are preparing for.</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5" aria-label="All preparation categories">
        {CATEGORY_ORDER.map((category) => {
          const Icon = CATEGORY_ICONS[category];
          const spaces = PREP_SPACES.filter((space) => space.category === category);
          return (
            <section key={category} aria-labelledby={"category-" + category} className="rounded-2xl border border-[var(--line-2)] bg-[var(--srf-1)] p-3 sm:p-3.5">
              <div className="mb-2.5 flex items-center gap-2 border-b border-[var(--line-1)] pb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--tint-signal)] text-[var(--signal-300)]"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                <h3 id={"category-" + category} className="text-xs font-semibold tracking-wide text-[var(--steel-100)]">{CATEGORY_LABELS[category]}</h3>
                <span className="ml-auto text-[10px] tabular-nums text-[var(--steel-400)]">{spaces.length}</span>
              </div>
              <div className="grid gap-1.5">
                {spaces.map((space) => {
                  const isSelected = selectedSlug === space.slug;
                  return (
                    <button key={space.id} type="button" onClick={() => selectPath(space)} aria-pressed={isSelected} className={"flex min-h-[48px] w-full items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors " + (isSelected ? "border-[var(--signal-400)] bg-[var(--tint-signal)]" : "border-transparent bg-[var(--field-1)] hover:border-[var(--line-3)]")}>
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-semibold leading-snug text-[var(--steel-100)] sm:text-xs">{space.name}</span>
                        <span className="mt-0.5 block text-[9px] leading-tight text-[var(--steel-400)]">{READINESS_LABELS[space.readiness]}</span>
                      </span>
                      <span aria-hidden="true" className={"shrink-0 text-sm " + (isSelected ? "text-[var(--signal-300)]" : "text-[var(--steel-400)]")}>{isSelected ? "✓" : "↗"}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div aria-live="polite" aria-atomic="true" className="exam-selector-detail mt-3 rounded-[1rem] border border-[var(--line-2)] bg-[var(--srf-1)] p-4 sm:p-5">
        {selected ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--signal-300)]">Selected preparation path</span>
              <span className="rounded-full border border-[var(--line-2)] px-2 py-1 text-[9px] font-semibold text-[var(--steel-300)]">{READINESS_LABELS[selected.readiness]}</span>
            </div>
            <h3 className="mt-2 text-base font-semibold text-[var(--steel-100)]">{selected.name}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--steel-300)]">{selected.summary}</p>
            {selected.capabilities.length > 0 && <ul aria-label="Available tools" className="mt-3 flex flex-wrap gap-1.5">{selected.capabilities.map((capability) => <li key={capability} className="rounded-full border border-[var(--line-2)] bg-[var(--field-1)] px-2 py-1 text-[10px] text-[var(--steel-300)]">{CAPABILITY_LABELS[capability]}</li>)}</ul>}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link href={"/signup?exam=" + encodeURIComponent(selected.slug)} className="btn-primary inline-flex min-h-10 items-center justify-center px-4 text-xs">Continue with this test</Link>
              <Link href={canEnter ? selected.legacyRoute! : "/exams"} className="btn-secondary inline-flex min-h-10 items-center justify-center px-4 text-xs">{canEnter ? "Open practice" : "View preparation details"}</Link>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs leading-relaxed text-[var(--steel-400)]">Select any test above to see its preparation tools, resources and current availability.</p>
            <Link href="/exams" className="shrink-0 text-xs font-semibold text-[var(--signal-300)] underline-offset-4 hover:underline">All paths →</Link>
          </div>
        )}
      </div>
    </section>
  );
}

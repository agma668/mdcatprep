"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calculator, GraduationCap, ShieldCheck, Stethoscope } from "lucide-react";
import {
  PREP_SPACES,
  type PrepSpaceCapability,
  type PrepSpaceDefinition,
} from "@/lib/prep-space-registry";

const STORAGE_KEY = "edweb:selected-prep-space:v1";

const CATEGORY_LABELS: Record<PrepSpaceDefinition["category"], string> = {
  medical: "Medical",
  engineering: "Engineering",
  scholarship: "Scholarship",
  defence: "Defence",
};

const CATEGORY_ICONS = {
  medical: Stethoscope,
  engineering: Calculator,
  scholarship: GraduationCap,
  defence: ShieldCheck,
};

const READINESS_LABELS = {
  beta: "Available in beta",
  content_in_progress: "In development",
  coming_soon: "Coming soon",
} as const;

const CAPABILITY_LABELS: Record<PrepSpaceCapability, string> = {
  mcq_practice: "MCQ practice",
  scaled_timed_mock: "Timed practice",
  flashcards: "Flashcards",
  concept_notes: "Concept notes",
  released_past_papers: "Past papers",
  verbal_nonverbal_drills: "Verbal & non-verbal drills",
};

function rememberPath(slug: string) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, slug);
  } catch {
    // The selector remains fully usable when browser storage is unavailable.
  }
}

export function ExamPathwaySelector() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved && PREP_SPACES.some((space) => space.slug === saved)) {
        setSelectedSlug(saved);
      }
    } catch {
      // Storage is an enhancement, not a requirement.
    }
  }, []);

  const selected = PREP_SPACES.find((space) => space.slug === selectedSlug) ?? null;
  const canEnter = Boolean(selected && selected.readiness === "beta" && selected.legacyRoute);

  function selectPath(space: (typeof PREP_SPACES)[number]) {
    setSelectedSlug(space.slug);
    rememberPath(space.slug);
  }

  return (
    <section id="choose-path" aria-labelledby="choose-path-heading" className="mt-8">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--signal-300)]">
            Find your preparation space
          </p>
          <h2 id="choose-path-heading" className="mt-1 text-xl font-bold tracking-tight text-[var(--steel-100)] sm:text-2xl">
            Which test are you preparing for?
          </h2>
          <p className="mt-1 text-sm text-[var(--steel-400)]">
            Choose a path to see the tools and preparation status for that exam.
          </p>
        </div>
        <Link href="/exams" className="mt-2 inline-flex min-h-10 items-center text-sm font-semibold text-[var(--signal-300)] underline-offset-4 hover:underline sm:mt-0">
          View all preparation spaces
        </Link>
      </div>

      <div
        role="group"
        aria-label="Choose an exam preparation path"
        className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3"
      >
        {PREP_SPACES.map((space) => {
          const Icon = CATEGORY_ICONS[space.category];
          const active = selectedSlug === space.slug;
          return (
            <button
              key={space.id}
              type="button"
              aria-pressed={active}
              onClick={() => selectPath(space)}
              className={[
                "group min-w-[205px] max-w-[225px] flex-1 snap-start rounded-[var(--r-3)] border p-4 text-left transition-[border-color,background-color,transform] duration-[var(--dur-1)] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]",
                active
                  ? "border-[var(--signal-400)] bg-[var(--tint-signal)] shadow-[var(--shadow-md)]"
                  : "border-[var(--line-2)] bg-[var(--srf-1)] hover:border-[var(--line-3)] hover:bg-[var(--srf-2)]",
              ].join(" ")}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[var(--r-2)] border border-[var(--line-2)] bg-[var(--field-1)] text-[var(--signal-300)]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--steel-400)]">
                  {CATEGORY_LABELS[space.category]}
                </span>
              </span>
              <span className="mt-4 block text-sm font-bold leading-snug text-[var(--steel-100)]">
                {space.name}
              </span>
              <span className="mt-2 block text-xs leading-relaxed text-[var(--steel-400)]">
                {READINESS_LABELS[space.readiness]}
              </span>
              <span className="mt-3 block text-xs font-semibold text-[var(--signal-300)]">
                {active ? "Selected" : "Explore path"} <span aria-hidden="true">→</span>
              </span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite" aria-atomic="true" className="mt-3">
        {selected ? (
          <div className="grid gap-5 rounded-[var(--r-3)] border border-[var(--line-2)] bg-[var(--srf-2)] p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--signal-300)]">
                  Your selected path
                </span>
                <span className="rounded-full border border-[var(--line-2)] bg-[var(--field-1)] px-2.5 py-1 text-[11px] font-semibold text-[var(--steel-300)]">
                  {READINESS_LABELS[selected.readiness]}
                </span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-[var(--steel-100)]">{selected.name}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--steel-300)]">{selected.summary}</p>
              {selected.capabilities.length > 0 ? (
                <ul aria-label="Tools currently listed for this path" className="mt-4 flex flex-wrap gap-2">
                  {selected.capabilities.map((capability) => (
                    <li key={capability} className="rounded-full border border-[var(--line-2)] bg-[var(--field-1)] px-3 py-1.5 text-xs text-[var(--steel-300)]">
                      {CAPABILITY_LABELS[capability]}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-xs text-[var(--steel-400)]">
                  This space is not open for practice yet. Its readiness is shown here so you know what to expect.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:min-w-[210px] lg:flex-col">
              <Link
                href={`/signup?exam=${encodeURIComponent(selected.slug)}`}
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--r-2)] bg-[linear-gradient(180deg,var(--cta-from)_0%,var(--cta-to)_100%)] px-5 py-2.5 text-sm font-semibold text-[var(--on-cta)] shadow-[var(--shadow-cta)] transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]"
              >
                Create account for this path
              </Link>
              <Link
                href={canEnter ? selected.legacyRoute! : "/exams"}
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--r-2)] border border-[var(--line-2)] bg-[var(--field-1)] px-5 py-2.5 text-sm font-semibold text-[var(--steel-200)] transition-colors hover:bg-[var(--srf-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]"
              >
                {canEnter ? "Explore available practice" : "View preparation details"}
              </Link>
            </div>
          </div>
        ) : (
          <p className="rounded-[var(--r-2)] border border-dashed border-[var(--line-2)] px-4 py-3 text-sm text-[var(--steel-400)]">
            Your homepage stays general until you choose a path. Select any tile to see its preparation details.
          </p>
        )}
      </div>
    </section>
  );
}

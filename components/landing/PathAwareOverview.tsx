"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PREP_SPACES,
  type PrepSpaceCapability,
  type PrepSpaceDefinition,
} from "@/lib/prep-space-registry";

const STORAGE_KEY = "edweb:selected-prep-space:v1";
const EVENT_NAME = "edweb:prep-space-selected";

const CAPABILITY_DETAILS: Record<PrepSpaceCapability, { title: string; detail: string }> = {
  mcq_practice: { title: "Question practice", detail: "Work through focused questions where the bank is available." },
  scaled_timed_mock: { title: "Timed practice", detail: "Build familiarity with timed question sets; check the listed format before treating it as a full mock." },
  flashcards: { title: "Flashcard revision", detail: "Revisit key facts with spaced-repetition study tools." },
  concept_notes: { title: "Concept notes", detail: "Review concise topic notes alongside your practice." },
  released_past_papers: { title: "Released papers", detail: "Explore released papers and their stated answer-key status." },
  verbal_nonverbal_drills: { title: "Reasoning drills", detail: "Practise verbal and non-verbal reasoning where available." },
};

const READINESS: Record<PrepSpaceDefinition["readiness"], string> = {
  beta: "Available in beta",
  content_in_progress: "Content in progress",
  coming_soon: "Coming soon",
};

function getSavedSpace() {
  try {
    const slug = window.sessionStorage.getItem(STORAGE_KEY);
    return PREP_SPACES.find((space) => space.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export function PathAwareOverview() {
  const [selected, setSelected] = useState<(typeof PREP_SPACES)[number] | null>(null);

  useEffect(() => {
    setSelected(getSavedSpace());
    const handleSelection = (event: Event) => {
      const custom = event as CustomEvent<string>;
      setSelected(PREP_SPACES.find((space) => space.slug === custom.detail) ?? null);
    };
    window.addEventListener(EVENT_NAME, handleSelection);
    return () => window.removeEventListener(EVENT_NAME, handleSelection);
  }, []);

  if (!selected) {
    return (
      <section id="features" className="landing-band py-16 sm:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--signal-300)]">A considered way to prepare</p>
            <h2 className="landing-section-heading max-w-[14ch]">The right tools for the path ahead.</h2>
            <p className="mt-4 max-w-[44ch] text-[var(--steel-300)]">Different exams call for different preparation. Choose a path above to see the tools and resources currently listed for it.</p>
          </div>
          <div className="grid gap-0 border-y border-[var(--line-2)] sm:grid-cols-2 sm:divide-x sm:divide-[var(--line-2)]">
            <div className="py-5 sm:px-5"><span className="text-sm font-semibold text-[var(--steel-100)]">Exam-specific spaces</span><p className="mt-2 text-sm leading-relaxed text-[var(--steel-300)]">Separate preparation routes, with availability shown clearly.</p></div>
            <div className="border-t border-[var(--line-2)] py-5 sm:border-0 sm:px-5"><span className="text-sm font-semibold text-[var(--steel-100)]">A clear view of what’s ready</span><p className="mt-2 text-sm leading-relaxed text-[var(--steel-300)]">See which practice formats and study resources are currently available.</p></div>
            <div className="border-t border-[var(--line-2)] py-5 sm:px-5"><span className="text-sm font-semibold text-[var(--steel-100)]">One account</span><p className="mt-2 text-sm leading-relaxed text-[var(--steel-300)]">Keep your preparation identity together as the platform grows.</p></div>
            <div className="border-t border-[var(--line-2)] py-5 sm:px-5"><span className="text-sm font-semibold text-[var(--steel-100)]">Progress at your pace</span><p className="mt-2 text-sm leading-relaxed text-[var(--steel-300)]">Use supported tools to practise, review and return to difficult areas.</p></div>
          </div>
        </div>
      </section>
    );
  }

  const availableTools = selected.capabilities.map((capability) => CAPABILITY_DETAILS[capability]);
  const canEnter = selected.readiness === "beta" && Boolean(selected.legacyRoute);

  return (
    <section id="features" className="landing-band py-16 sm:py-24" aria-live="polite">
      <div className="container-page">
        <div className="flex flex-col gap-4 border-b border-[var(--line-2)] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--signal-300)]">Your preparation space</p>
            <h2 className="landing-section-heading max-w-[15ch]">{selected.name}</h2>
            <p className="mt-3 max-w-[58ch] text-[var(--steel-300)]">{selected.summary}</p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-[var(--line-2)] bg-[var(--srf-1)] px-3 py-1.5 text-xs font-semibold text-[var(--steel-300)]">{READINESS[selected.readiness]}</span>
        </div>

        {availableTools.length ? (
          <div className="mt-8 grid gap-0 border-b border-[var(--line-2)] sm:grid-cols-2 lg:grid-cols-3">
            {availableTools.map((tool, index) => (
              <article key={tool.title} className="border-t border-[var(--line-2)] py-6 sm:px-5">
                <span className="text-xs tabular-nums text-[var(--signal-300)]">0{index + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-[var(--steel-100)]">{tool.title}</h3>
                <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-[var(--steel-300)]">{tool.detail}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-8 max-w-2xl rounded-lg border border-dashed border-[var(--line-2)] p-5 text-sm leading-relaxed text-[var(--steel-300)]">Dedicated tools for this exam are still being prepared. We’ll show the available resources here as they are verified and released.</p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/signup?exam=${encodeURIComponent(selected.slug)}`} className="btn-primary inline-flex min-h-11 items-center justify-center px-5">Create account for this path</Link>
          <Link href={canEnter ? selected.legacyRoute! : "/exams"} className="btn-secondary inline-flex min-h-11 items-center justify-center px-5">{canEnter ? "Explore available practice" : "View preparation details"}</Link>
        </div>
      </div>
    </section>
  );
}

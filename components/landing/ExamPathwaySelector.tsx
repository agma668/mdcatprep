"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Calculator, GraduationCap, ShieldCheck, Stethoscope } from "lucide-react";
import { PREP_SPACES, type PrepSpaceCapability, type PrepSpaceDefinition } from "@/lib/prep-space-registry";

const STORAGE_KEY = "edweb:selected-prep-space:v1";
const SELECTION_EVENT = "edweb:prep-space-selected";
const CATEGORY_LABELS: Record<PrepSpaceDefinition["category"], string> = { medical: "Medical", engineering: "Engineering", scholarship: "Scholarship", defence: "Defence" };
const CATEGORY_ICONS = { medical: Stethoscope, engineering: Calculator, scholarship: GraduationCap, defence: ShieldCheck };
const READINESS_LABELS = { beta: "Available in beta", content_in_progress: "In development", coming_soon: "Coming soon" } as const;
const CAPABILITY_LABELS: Record<PrepSpaceCapability, string> = { mcq_practice: "MCQ practice", scaled_timed_mock: "Timed practice", flashcards: "Flashcards", concept_notes: "Concept notes", released_past_papers: "Past papers", verbal_nonverbal_drills: "Verbal & non-verbal drills" };

function rememberPath(slug: string) {
  try { window.sessionStorage.setItem(STORAGE_KEY, slug); } catch { /* Storage is optional. */ }
}

export function ExamPathwaySelector() {
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      const index = PREP_SPACES.findIndex((space) => space.slug === saved);
      if (index >= 0) {
        setSelectedSlug(PREP_SPACES[index].slug);
        setActiveIndex(index);
        requestAnimationFrame(() => cardRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }));
      }
    } catch { /* Selector remains usable without storage. */ }
  }, []);

  const selected = PREP_SPACES.find((space) => space.slug === selectedSlug) ?? null;
  const canEnter = Boolean(selected && selected.readiness === "beta" && selected.legacyRoute);

  const updateActiveFromScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const center = rail.getBoundingClientRect().left + rail.clientWidth / 2;
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const nextDistance = Math.abs(rect.left + rect.width / 2 - center);
      if (nextDistance < distance) { distance = nextDistance; nearest = index; }
    });
    setActiveIndex(nearest);
  }, []);

  function selectPath(space: (typeof PREP_SPACES)[number], index: number) {
    setSelectedSlug(space.slug);
    setActiveIndex(index);
    rememberPath(space.slug);
    window.dispatchEvent(new CustomEvent(SELECTION_EVENT, { detail: space.slug }));
    cardRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  function move(direction: -1 | 1) {
    const next = Math.min(PREP_SPACES.length - 1, Math.max(0, activeIndex + direction));
    cardRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setActiveIndex(next);
  }

  const activeSpace = PREP_SPACES[activeIndex];
  const ActiveIcon = CATEGORY_ICONS[activeSpace.category];

  return (
    <section id="choose-path" aria-labelledby="choose-path-heading" className="exam-selector-showcase w-full">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--signal-300)]">Your next chapter</p>
          <h2 id="choose-path-heading" className="landing-display mt-2 text-3xl leading-tight text-[var(--steel-100)] sm:text-4xl">Choose your test.</h2>
          <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-[var(--steel-400)]">Scroll through the preparation paths. Select one to see its tools and current readiness.</p>
        </div>
        <div className="mb-1 hidden shrink-0 gap-2 sm:flex">
          <button type="button" onClick={() => move(-1)} aria-label="Previous test" className="exam-selector-arrow"><ArrowLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => move(1)} aria-label="Next test" className="exam-selector-arrow"><ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div ref={railRef} onScroll={updateActiveFromScroll} onKeyUp={updateActiveFromScroll} role="group" aria-label="Scroll to choose an exam preparation path" className="exam-selector-rail mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[12%] pb-5 pt-2">
        {PREP_SPACES.map((space, index) => {
          const Icon = CATEGORY_ICONS[space.category];
          const active = activeIndex === index;
          const selectedCard = selectedSlug === space.slug;
          return (
            <button key={space.id} ref={(node) => { cardRefs.current[index] = node; }} type="button" aria-pressed={selectedCard} onClick={() => selectPath(space, index)} data-path-tile="" className={["exam-selector-card group w-[76%] max-w-[260px] min-w-[220px] shrink-0 snap-center rounded-[1rem] border p-5 text-left", active ? "is-active" : "", selectedCard ? "is-selected" : ""].join(" ")}>
              <span className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-2)] bg-[var(--field-1)] text-[var(--signal-300)]"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--steel-400)]">{CATEGORY_LABELS[space.category]}</span>
              </span>
              <span className="mt-9 block text-xl font-semibold leading-snug text-[var(--steel-100)]">{space.name}</span>
              <span className="mt-3 block text-xs text-[var(--steel-400)]">{READINESS_LABELS[space.readiness]}</span>
              <span className="mt-7 flex items-center justify-between border-t border-[var(--line-2)] pt-3 text-xs font-semibold text-[var(--signal-300)]">{selectedCard ? "Selected path" : "Select this test"}<span aria-hidden="true" className="text-base">↗</span></span>
            </button>
          );
        })}
      </div>

      <div className="mb-5 flex items-center justify-between px-1">
        <div className="flex gap-1.5" aria-label={"Test " + (activeIndex + 1) + " of " + PREP_SPACES.length}>
          {PREP_SPACES.map((space, index) => <span key={space.id} className={"h-1 rounded-full transition-all duration-300 " + (index === activeIndex ? "w-7 bg-[var(--signal-400)]" : "w-2 bg-[var(--line-3)]")} />)}
        </div>
        <span className="text-xs tabular-nums text-[var(--steel-400)]">{String(activeIndex + 1).padStart(2, "0")} / {String(PREP_SPACES.length).padStart(2, "0")}</span>
      </div>

      <div aria-live="polite" aria-atomic="true" className="exam-selector-detail rounded-[1rem] border border-[var(--line-2)] bg-[var(--srf-1)] p-5 sm:p-6">
        {selected ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--signal-300)]">Selected preparation path</span>
              <span className="rounded-full border border-[var(--line-2)] px-2.5 py-1 text-[10px] font-semibold text-[var(--steel-300)]">{READINESS_LABELS[selected.readiness]}</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold text-[var(--steel-100)]">{selected.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--steel-300)]">{selected.summary}</p>
            {selected.capabilities.length > 0 && <ul aria-label="Available tools" className="mt-4 flex flex-wrap gap-2">{selected.capabilities.map((capability) => <li key={capability} className="rounded-full border border-[var(--line-2)] bg-[var(--field-1)] px-2.5 py-1.5 text-[11px] text-[var(--steel-300)]">{CAPABILITY_LABELS[capability]}</li>)}</ul>}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link href={"/signup?exam=" + encodeURIComponent(selected.slug)} className="btn-primary inline-flex min-h-11 items-center justify-center px-5 text-sm">Continue with this test</Link>
              <Link href={canEnter ? selected.legacyRoute! : "/exams"} className="btn-secondary inline-flex min-h-11 items-center justify-center px-5 text-sm">{canEnter ? "Open practice" : "View preparation details"}</Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tint-signal)] text-[var(--signal-300)]"><ActiveIcon className="h-5 w-5" /></span>
              <div><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--signal-300)]">Explore the pathways</p><p className="mt-0.5 text-sm text-[var(--steel-300)]">{activeSpace.name} · {READINESS_LABELS[activeSpace.readiness]}</p></div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[var(--steel-400)]">Choose the card to see the exact tools, resources and preparation status available for this test.</p>
          </>
        )}
      </div>
      <Link href="/exams" className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-[var(--signal-300)] underline-offset-4 hover:underline">View all preparation spaces <span aria-hidden="true" className="ml-2">→</span></Link>
    </section>
  );
}

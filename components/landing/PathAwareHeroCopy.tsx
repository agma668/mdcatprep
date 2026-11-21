"use client";

import { useEffect, useState } from "react";
import { PREP_SPACES } from "@/lib/prep-space-registry";

const STORAGE_KEY = "edweb:selected-prep-space:v1";
const EVENT_NAME = "edweb:prep-space-selected";

export function PathAwareHeroCopy() {
  const [selected, setSelected] = useState<(typeof PREP_SPACES)[number] | null>(null);

  useEffect(() => {
    try {
      const slug = window.sessionStorage.getItem(STORAGE_KEY);
      setSelected(PREP_SPACES.find((space) => space.slug === slug) ?? null);
    } catch {
      setSelected(null);
    }

    const handleSelection = (event: Event) => {
      const custom = event as CustomEvent<string>;
      setSelected(PREP_SPACES.find((space) => space.slug === custom.detail) ?? null);
    };
    window.addEventListener(EVENT_NAME, handleSelection);
    return () => window.removeEventListener(EVENT_NAME, handleSelection);
  }, []);

  return (
    <>
      <h1 className="mt-5 max-w-[22ch] text-[2.25rem] leading-[1.06] tracking-tight text-[var(--steel-100)] sm:text-5xl lg:text-[3.4rem]">
        {selected ? `Prepare for ${selected.name}.` : "Choose your path. Prepare for what’s next."}
      </h1>
      <p className="hero-intro mt-5 max-w-[52ch] text-base leading-relaxed text-[var(--steel-300)] sm:text-lg">
        {selected
          ? selected.summary
          : "Explore preparation spaces built around different entry tests. Choose your path to see the tools, practice and resources currently available for that exam."}
      </p>
    </>
  );
}

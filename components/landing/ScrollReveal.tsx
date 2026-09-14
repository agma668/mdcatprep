"use client";

import { useEffect } from "react";

/**
 * The landing page's single appearance controller — the only thing that
 * decides WHEN something appears.
 *
 * Three jobs:
 *
 * 1. Arm the document. The hidden state in globals.css is scoped to
 *    `html.reveals-armed`, which is added here and nowhere else. A page whose
 *    JS never runs is therefore never armed and every section renders at rest,
 *    instead of a column of invisible blocks.
 * 2. Reveal. ONE IntersectionObserver serves every [data-reveal] on the page —
 *    previously each <Reveal> ran its own observer and its own React state.
 *    Elements already in the viewport are revealed synchronously in the same
 *    task that arms the document, so they never paint at opacity 0 waiting for
 *    a callback that has not fired yet; only the ones still below the fold go
 *    to the observer.
 * 3. Keep up with late arrivals. Sections below the fold are code-split
 *    (next/dynamic in app/page.tsx) and can mount after the first scan, so a
 *    MutationObserver re-scans. The previous one-shot querySelectorAll meant a
 *    late section was never observed — and so never revealed.
 *
 * Reduced motion: nothing is armed and nothing is observed, so the page is
 * static and fully visible. The CSS carries a second release for the same
 * reason (see the REVEAL VOCABULARY block in globals.css).
 *
 * Scroll-linked appearance is not this component's business: the page's one
 * scroll writer is ScrollEffects (it owns --rail, --section-* and --hero-exit).
 * This one owns entry, that one owns travel.
 */
export function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );

    // One pass for both cases: in the viewport now → animate from this task;
    // anywhere else → hand to the observer and unhand it once revealed.
    const scan = () => {
      document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const onScreen = rect.top < window.innerHeight && rect.bottom > 0;
        if (onScreen) {
          el.classList.add("is-revealed");
        } else {
          observer.observe(el);
        }
      });
    };

    root.classList.add("reveals-armed");
    scan();

    // childList only: reveal attributes never change, elements only arrive.
    const arrivals = new MutationObserver(scan);
    arrivals.observe(document.body, { childList: true, subtree: true });

    return () => {
      arrivals.disconnect();
      observer.disconnect();
      root.classList.remove("reveals-armed");
    };
  }, []);

  return null;
}

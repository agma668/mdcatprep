"use client";

import { useEffect } from "react";

/**
 * ScrollReveal — activates scroll-triggered animations by adding .is-visible
 * when elements enter the viewport. Reads --section-progress for fine-grained
 * control. Respects prefers-reduced-motion.
 */
export function ScrollReveal() {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const revealElements = document.querySelectorAll<HTMLElement>("[data-scroll-reveal], [data-scroll-reveal-stagger], [data-scroll-count], [data-scroll-draw]");
    const sectionDividers = document.querySelectorAll<HTMLElement>(".section-glow-divider");

    if (revealElements.length === 0 && sectionDividers.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            // Optional: unobserve after reveal for performance
            // observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.1,
      }
    );

    revealElements.forEach((el) => observer.observe(el));
    sectionDividers.forEach((el) => observer.observe(el));

    // Also handle section divider activation based on --section-index
    const root = document.documentElement;
    let lastSection = -1;

    const checkSection = () => {
      const sectionIndex = parseInt(root.style.getPropertyValue("--section-index") || "-1", 10);
      if (sectionIndex !== lastSection && sectionIndex >= 0) {
        sectionDividers.forEach((divider, i) => {
          if (i === sectionIndex) {
            divider.classList.add("is-active");
          } else {
            divider.classList.remove("is-active");
          }
        });
        lastSection = sectionIndex;
      }
    };

    const scrollHandler = () => {
      checkSection();
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });
    checkSection(); // Initial check

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scrollHandler);
    };
  }, []);

  return null;
}
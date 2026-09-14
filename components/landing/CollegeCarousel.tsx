'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Reveal, usePrefersReducedMotion } from '@/components/ui/Motion';
import { COLLEGES, COLLEGES_WITH_PAGES } from '@/lib/college-list';

const HAS_PAGE = COLLEGES_WITH_PAGES;
const WHATSAPP = 'https://chat.whatsapp.com/GbhjI1A6FvBBtAd4PZR2NU';

// Only the active card and three neighbours either side are on stage. Fanning
// all thirteen colleges across the arc pushed the far ones to a 0.1 scale and a
// negative opacity — which browsers drop as invalid, so they rendered at full
// strength behind the deck. Anything past the span is parked: invisible,
// unclickable and out of the tab order until it rotates in.
const SPAN = 3;
const RADIUS_X = 420;
const AUTOPLAY_MS = 3500;

export function CollegeCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const deckRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const total = COLLEGES.length;

  const next = useCallback(() => setActive((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setActive((i) => (i - 1 + total) % total), [total]);

  // Autoplay runs only while the deck is on screen, nothing inside it is
  // hovered or focused, and the visitor hasn't asked for reduced motion.
  useEffect(() => {
    if (reduced || paused || !onScreen) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [next, paused, onScreen, reduced]);

  useEffect(() => {
    const el = deckRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setOnScreen(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function getItemState(index: number) {
    const offset = (((index - active) % total) + total) % total;
    const norm = offset > total / 2 ? offset - total : offset;
    const abs = Math.abs(norm);
    const parked = abs > SPAN;
    const angle = (norm / (SPAN + 1)) * (Math.PI / 2);
    return {
      parked,
      isActive: abs === 0,
      style: {
        transform: `translateX(${Math.round(Math.sin(angle) * RADIUS_X)}px) scale(${(1 - abs * 0.12).toFixed(3)}) perspective(1000px) rotateY(${norm * -7}deg)`,
        opacity: parked ? 0 : Number((1 - abs * 0.2).toFixed(3)),
        zIndex: 20 - abs,
      },
    };
  }

  return (
    <section
      id="cadet-colleges"
      aria-labelledby="colleges-heading"
      className="section-padding relative overflow-hidden"
    >
      {/* Two contour ellipses on the floor under the deck — the topo motif read
          in perspective, so the cards look like they're standing on ground. */}
      <div
        aria-hidden="true"
        className="absolute top-[60%] left-1/2 h-[180px] w-[750px] rounded-[50%] border border-[var(--line-1)]"
        style={{ transform: 'translate(-50%, -50%) perspective(800px) rotateX(75deg)' }}
      />
      <div
        aria-hidden="true"
        className="absolute top-[60%] left-1/2 h-[120px] w-[500px] rounded-[50%] border border-[var(--line-2)]"
        style={{ transform: 'translate(-50%, -50%) perspective(800px) rotateX(75deg)' }}
      />
      <div
        aria-hidden="true"
        className="absolute top-[45%] left-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(ellipse, var(--tint-signal), transparent 60%)' }}
      />

      <div className="container-page relative">
        <Reveal distance={20} duration={520}>
          <div className="mb-10 text-center">
            <h2
              id="colleges-heading"
              className="mb-3 text-3xl text-[var(--steel-100)] sm:text-4xl"
            >
              Medical Universities We <span className="text-[var(--signal-200)]">Prepare You For</span>
            </h2>
            <p className="mx-auto max-w-lg text-base text-[var(--steel-300)]">
              Exam-style practice tailored for MDCAT, NUMS, and top medical entrance tests.
            </p>
          </div>
        </Reveal>

        <div
          ref={deckRef}
          className="relative mx-auto flex h-[320px] max-w-5xl items-center justify-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <button
            type="button"
            onClick={prev}
            aria-label="Previous college"
            className="tap-44 absolute left-2 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-3)] bg-[var(--srf-2)] text-[var(--steel-300)] transition-colors duration-[var(--dur-1)] hover:border-[var(--line-signal)] hover:bg-[var(--srf-3)] hover:text-[var(--steel-100)] sm:left-4"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next college"
            className="tap-44 absolute right-2 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-3)] bg-[var(--srf-2)] text-[var(--steel-300)] transition-colors duration-[var(--dur-1)] hover:border-[var(--line-signal)] hover:bg-[var(--srf-3)] hover:text-[var(--steel-100)] sm:right-4"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          {COLLEGES.map((college, i) => {
            const { parked, isActive, style } = getItemState(i);
            const external = !HAS_PAGE.has(college.slug);
            return (
              <Link
                key={college.slug}
                href={external ? WHATSAPP : `/colleges/${college.slug}`}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                aria-hidden={parked ? 'true' : undefined}
                tabIndex={parked ? -1 : undefined}
                className="absolute rounded-[var(--r-3)] transition-all duration-[700ms] ease-[var(--ease-out-expo)]"
                style={{ ...style, pointerEvents: parked ? 'none' : undefined }}
              >
                <div className="relative flex w-[170px] flex-col items-center justify-center px-2 py-4 sm:w-[190px]">
                  <div
                    className={`relative mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-[var(--r-2)] ring-1 transition-colors duration-[var(--dur-2)] ${
                      isActive
                        ? 'bg-[var(--srf-3)] ring-[var(--line-signal)]'
                        : 'bg-[var(--srf-1)] ring-[var(--line-1)]'
                    }`}
                  >
                    {college.logo ? (
                      <Image
                        src={college.logo}
                        alt={college.name}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    ) : (
                      <span className="font-display text-lg font-bold text-[var(--signal-200)]">
                        {(college as { initials?: string }).initials}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-center text-sm font-semibold leading-tight ${
                      isActive ? 'text-[var(--steel-100)]' : 'text-[var(--steel-300)]'
                    }`}
                  >
                    {college.name}
                  </p>
                  {isActive && (
                    <p className="mt-1 text-center text-[11px] text-[var(--steel-400)]">
                      {college.city}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Position markers double as the control: the wide one is where you
            are, and each is a 44px tap target around a 6px bar. */}
        <div role="group" aria-label="Choose a college" className="mt-8 flex items-center justify-center gap-2">
          {COLLEGES.map((college, i) => (
            <button
              key={college.slug}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View ${college.name}`}
              aria-current={i === active ? 'true' : undefined}
              className={`tap-44 h-1.5 rounded-full transition-all duration-[var(--dur-2)] ease-[var(--ease-out-quart)] ${
                i === active
                  ? 'w-6 bg-[var(--signal-300)]'
                  : 'w-1.5 bg-[var(--steel-700)] hover:bg-[var(--steel-500)]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

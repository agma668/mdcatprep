import Link from "next/link";
import { BarChart3, BookOpenCheck, GraduationCap, MessageCircle, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Reveal, Stagger } from "@/components/ui/Motion";
import { Magnetic } from "@/components/landing/Magnetic";
import { InteractiveTile } from "@/components/landing/InteractiveTile";
import { CadetCrest } from "@/components/landing/CadetCrest";
import { HeroWireframe } from "@/components/landing/HeroWireframe";
import { BrainBookHero } from "@/components/landing/BrainBookHero";
import { StatsAsOf } from "@/components/shared/StatsAsOf";
import { Rocket } from "lucide-react";

export function Hero({
  stats,
}: {
  // Real counts fetched from the live database by the page (lib/public-stats.ts) —
  // colleges, distinct subjects with questions, published MCQs. Rendered as
  // plain server markup so the page never shows a placeholder zero.
  stats: { colleges: number; subjects: number; mcqs: number; asOf: string };
}) {
  // "Online Access" is a service fact (the platform is up round the clock), not
  // a count, so it renders statically like the rest — no animation can leave
  // it at a misleading value.
  const statTiles = [
    { value: stats.colleges.toLocaleString(), label: "Colleges Covered" },
    { value: stats.subjects.toLocaleString(), label: "Subjects" },
    { value: "24/7", label: "Online Access" },
    { value: stats.mcqs.toLocaleString(), label: "Practice MCQs" },
  ] as const;
  return (
    <section
      aria-label="Hero"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-16"
    >
      {/* Aurora field — cold signal and beacon light, drifting only with the
          scroll parallax writer (no infinite keyframe loop). */}
      <div aria-hidden="true" className="hero-aurora">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
      </div>

      {/* Faint topographic contour wash over the whole field. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-10 50L50-10M-10 30L30-10M10 50L50 10M-10 10L10-10M30 50L50 30' stroke='rgba(255,255,255,0.025)' stroke-width='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Cadet crest emblem — static SVG on the server, upgraded to a lit
          canvas emblem after hydration (CadetCrest gates that itself and falls
          back to the SVG under reduced motion or data saver). Centered above
          the copy on mobile, floating top-right behind the text on lg+.
          Decorative: the text column sits at z-10 above it.

          On a 360×780 screen the crest used to run to 176px wide under a 48px
          top margin, which pushed the headline off the first screen; it is
          smaller and tighter there now. On lg it hangs outside the content
          column on purpose, but at 4% rather than 1% so it stops short of
          kissing the viewport edge. */}
      <div className="relative z-[1] mx-auto mt-6 w-36 sm:mt-10 sm:w-48 lg:absolute lg:right-[4%] lg:top-[5%] lg:mt-0 lg:w-[min(28vw,320px)]">
        <CadetCrest />
      </div>

      {/* One light pass across the hero on load — the page's single
          non-user-triggered flourish. Removed under reduced motion. */}
      <div aria-hidden="true" className="load-sweep" />

      {/* Film grain over everything — cheap SVG turbulence. */}
      <div aria-hidden="true" className="film-grain z-[20]" />

      <div className="container-page relative z-10 py-20 md:py-28">
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
          <div className="max-w-3xl text-center lg:text-left">
            {/* Single reveal for the entire hero text block */}
            <Reveal direction="up" delay={0}>
              {/* Active MDCAT & NUMS Prep platform announcement */}
              <div className="mb-6 flex items-start justify-center gap-2.5 lg:justify-start">
                <Rocket aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--signal-300)]" />
                <p className="text-base font-bold leading-snug text-[var(--steel-100)] sm:text-lg">
                  <span className="text-liquid-gold">Free MDCAT, NUMS & Medical Exam Prep Platform</span>
                  {" "}&mdash; Access resources & entire platform 100% free.
                </p>
              </div>

              {/* The one brass chip in the interface: brass is reserved for the
                  insignia and for the word "free". */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line-brass)] bg-[var(--tint-brass)] px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brass)]" />
                <span className="text-sm font-semibold text-[var(--champagne)]">100% Free — No hidden charges</span>
              </div>

              <div className="mb-6 flex justify-center lg:justify-start">
                <Badge variant="accent">
                  <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                  Pakistan&apos;s Premier MDCAT & NUMS Medical Entrance Prep Platform
                </Badge>
              </div>

              <h1 className="mb-6 text-4xl text-[var(--steel-100)] sm:text-5xl md:text-6xl" data-scroll-reveal>
                Your Path to{" "}
                <span className="text-gradient">MDCAT & NUMS</span>{" "}
                Success Starts Here.
              </h1>

              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[var(--steel-300)] sm:text-xl" data-scroll-reveal>
                Free medical entrance exam preparation for MDCAT, NUMS, UHS, SZABMU, KMU, and all medical universities.
                Take a quick diagnostic to find your level, then practice{" "}
                {stats.mcqs.toLocaleString()} exam-style MCQs with instant explanations
                across Biology, Chemistry, Physics, and English.
              </p>

              {/* px-8, not px-10, and both labels are nowrap. On lg the text
                  column is 1.1fr of a 1104px grid = 572px, and at px-10 the two
                  buttons needed 574px — so flex-shrink squeezed the second one
                  and "Join WhatsApp Group" silently wrapped onto two lines
                  inside a fixed-height button. nowrap makes any future copy
                  change overflow visibly instead of wrapping quietly. */}
              <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start" data-scroll-reveal>
                <Magnetic strength={0.2}>
                  <Link href="/diagnostic">
                    <Button variant="primary" size="lg" className="whitespace-nowrap px-8 text-base">
                      Take Free Diagnostic Quiz
                    </Button>
                  </Link>
                </Magnetic>
                <Magnetic strength={0.18}>
                  <a
                    href="https://chat.whatsapp.com/GbhjI1A6FvBBtAd4PZR2NU"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-13 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--line-3)] bg-[var(--srf-1)] px-8 text-base font-semibold text-[var(--steel-100)] transition-colors duration-[var(--transition-fast)] hover:border-[var(--line-signal)] hover:bg-[var(--srf-2)]"
                  >
                    <MessageCircle className="h-5 w-5" aria-hidden="true" /> Join WhatsApp Group
                  </a>
                </Magnetic>
              </div>

              <p className="mt-6 flex items-center justify-center gap-1.5 text-sm text-[var(--steel-400)] lg:justify-start" data-scroll-reveal>
                <GraduationCap
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--signal-300)]"
                />
                An initiative for accessible education — by <Link href="/founder" className="font-semibold text-[var(--signal-200)] hover:underline">Muhammad Haziq Khan</Link>
              </p>
            </Reveal>
          </div>

          {/* Right visual: brain-and-book motif and wireframe */}
          <div className="relative mt-2 hidden lg:block">
            <div className="relative flex items-center justify-center min-h-[380px]">
              <HeroWireframe />
              <div className="brain-book-wrap">
                <BrainBookHero />
              </div>
            </div>
          </div>
        </div>

        {/* Stats — real numbers from the live bank, server-rendered (no
            client count-up, so they can never sit at zero) */}
        <Stagger stagger={60} className="mt-16 lg:mt-20">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4" data-scroll-reveal-stagger>
            {statTiles.map(({ value, label }) => (
              <InteractiveTile key={label} className="feature-tile glass-tile glass-shine px-6 py-6">
                <div className="text-center">
                  <p className="font-display mb-1 text-3xl font-bold tabular-nums text-[var(--steel-100)] sm:text-4xl" data-scroll-count>
                    {value}
                  </p>
                  <p className="label text-xs sm:text-[0.8125rem]">
                    {label}
                  </p>
                </div>
              </InteractiveTile>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <StatsAsOf asOf={stats.asOf} />
          </div>
        </Stagger>
      </div>

      {/* Contour-line ground divider — the topo motif, echoed small. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] opacity-60">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="h-10 w-full md:h-14">
          <path d="M0 72 C160 38 300 88 520 60 C760 26 920 88 1160 56 C1300 36 1380 66 1440 48" stroke="var(--line-signal)" strokeWidth="1" />
          <path d="M0 80 C160 46 300 96 520 68 C760 34 920 96 1160 64 C1300 44 1380 74 1440 56" stroke="var(--line-2)" strokeWidth="1" />
          <path d="M0 64 C160 30 300 80 520 52 C760 18 920 80 1160 48 C1300 28 1380 58 1440 40" stroke="var(--line-1)" strokeWidth="1" />
        </svg>
      </div>
    </section>
  );
}
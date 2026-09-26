# 02 — LANDING PAGE & NAVIGATION (composition + copy-paste code)

The cadet landing (`app/page.tsx` + `components/landing/*`, 37 components) is a
server component that fetches live stats, then composes sections. Copy the
composition, the Hero, and the Navbar; the MED site already owns most effect
components (HeroParticleField, FluidCursor, ScrollEffects, Magnetic, etc.).

## 1. Page composition (the order matters — it's a conversion narrative)

```
Navbar (fixed, fades in material on scroll)
Hero            — headline, outcome-first CTA, live stat tiles, ThemeWheel
SocialProofBar  — compact reassurance directly under the first CTA
TrustStrip      — "what this is / isn't" strip
WhatsApp banner — community door (green card, WhatsApp's own green)
Features        — id="features"
HowItWorks      — id="how-it-works"
MCQDemoSection  — an interactive sample question, lazy-loaded
AnalyticsPreview— real (gated) analytics screenshots if DB reachable
CommunityStreakWall — 26-week activity heatmap of REAL attempts; hidden if
                      DB unreachable (never fabricated)
ParentTransparencyTile — "parents can ask to see the practice log"
ExamCountdown   — days to the next entry test, on its own band
LeaderboardHub  — three boards behind tabs: all-time, duel wins, race wins
CollegeCarousel — target-institution cards
FAQ             — with FAQPage JSON-LD (see 05-SEO)
RegisterSection — the signup form band
CTA             — final close
Footer
```

Key discipline:
- **Lazy-load everything below the fold** with `next/dynamic` + `loading: () => null`
  so the hero paints on static HTML.
- `export const revalidate = 60` — stats are ISR-cached 60s; never a stale
  fabricated number, never a per-request DB hit.
- Sections only render gated content when the data actually exists.

## 2. Hero skeleton (copy, rebrand copy)

The full source is `components/landing/Hero.tsx`. The load-bearing pieces:

```tsx
<section aria-label="Hero" className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-16">
  <div aria-hidden="true" className="absolute inset-0 z-0"><HeroParticleField /></div>
  <div aria-hidden="true" className="hero-aurora">
    <div className="hero-blob hero-blob-1" />
    <div className="hero-blob hero-blob-2" />
    <div className="hero-blob hero-blob-3" />
  </div>
  {/* Faint topo contour wash */}
  <div aria-hidden="true" className="absolute inset-0 opacity-[0.04]"
    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-10 50L50-10M-10 30L30-10M10 50L50 10M-10 10L10-10M30 50L50 30' stroke='rgba(255,255,255,0.025)' stroke-width='1'/%3E%3C/svg%3E")` }} />
  <div aria-hidden="true" className="load-sweep" />   {/* one light pass on load */}
  <div aria-hidden="true" className="film-grain z-[20]" />

  <div className="container-page relative z-10 py-20 md:py-28">
    <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
      <div className="max-w-3xl text-center lg:text-left">
        <Reveal direction="up">
          {/* Brass chip: brass is reserved for insignia + the word "free" */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line-brass)] bg-[var(--tint-brass)] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brass)]" />
            <span className="text-sm font-semibold text-[var(--champagne)]">100% Free — No hidden charges</span>
          </div>
          <h1 className="mb-6 text-4xl text-[var(--steel-100)] sm:text-5xl md:text-6xl">
            Your MDCAT <span className="text-gradient">Preparation</span> Starts Here.
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--steel-300)] sm:text-xl">
            Free entry-test preparation… practice {fmtInt(stats.mcqs)} exam-style MCQs
            with instant explanations across Biology, Chemistry, Physics, English…
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Magnetic strength={0.2}>
              <TrackedLink to="/signup" label="hero_primary" prefetch>
                <Button variant="primary" size="lg" className="whitespace-nowrap px-8">
                  Start your journey to a medical seat
                </Button>
              </TrackedLink>
            </Magnetic>
            <Magnetic strength={0.18}>{/* secondary: WhatsApp community button */}</Magnetic>
          </div>
        </Reveal>
      </div>
      <div className="relative flex flex-col items-center gap-6">
        <ThemeWheel />
        {/* BrainBookHero / wireframe visual on lg */}
      </div>
    </div>
    {/* Stat tiles — server-rendered real numbers, never client count-up */}
    <Stagger stagger={60}>
      <div className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-4">
        {statTiles.map(({ value, label }) => (
          <InteractiveTile key={label} className="feature-tile glass-tile glass-shine px-6 py-6">
            <p className="font-display text-3xl font-bold tabular-nums text-[var(--steel-100)]">{value}</p>
            <p className="label text-xs">{label}</p>
          </InteractiveTile>
        ))}
      </div>
      <div className="mt-4 flex justify-center"><StatsAsOf asOf={stats.asOf} /></div>
    </Stagger>
  </div>
</section>
```

Hero rules learned the hard way:
- **Buttons `whitespace-nowrap` + `px-8` not `px-10`**: at 1.1fr of a 1104px
  grid the two CTAs needed 574px in a 572px column and "Join WhatsApp Group"
  silently wrapped inside a fixed-height button. Nowrap makes future copy
  overflow visibly instead of wrapping quietly.
- **Stats are server-rendered.** A client count-up animation can sit at 0 on a
  slow device and read as a lie; the "as of" timestamp under the tiles tells
  the truth about freshness instead.
- Crest/visual is `position:absolute top-right` on lg+ and centered+small on
  mobile so the headline never leaves the first screen (176px crest once pushed
  the H1 off a 360×780 phone).
- Contour-line SVG divider closes the hero (the motif echoed small).

## 3. Navbar (complete behavior spec)

Source: `components/landing/Navbar.tsx`. Behaviors to copy:

```tsx
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Colleges", href: "#cadet-colleges" },   // MED: "MDCAT", "#mdcat"
  { label: "Daily Quiz", href: "/daily-quiz" },
  { label: "Founder", href: "/founder" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
] as const;
```

- **Scroll material fade**: a `.nav-material` layer sits behind the bar with
  `opacity: isScrolled ? 1 : 0` (transition 340ms) — the nav is transparent at
  the top of the page and gains blur+hairline after 16px of scroll. Never pop.
- **Plain `<a href="#…">` anchors, no JS scroll handler.** `html` carries
  `scroll-behavior: smooth` + `scroll-padding-top`. A JS handler that calls
  `scrollIntoView` after `preventDefault` fights Lenis's anchor animation and
  strips the URL hash (breaks back-button and shareable section links).
- **Router prefetch of /login and /signup** during idle: buttons using
  `router.push` never prefetch, so the click used to start from zero. One
  `useEffect` with `router.prefetch()` makes auth navigation instant.
- **Escape + resize close the mobile menu** (a `role="dialog"` that ignores
  Escape is a keyboard trap). Hamburger is three animated bars.
- **Logo**: compass-rose SVG in a bordered tile with `--glow-brass`, lifts 1px
  on hover. Wordmark "CCP" → rebrand to MED.
- Desktop right side: `ThemeSwitcher`, ghost "Sign In", primary "Get Started Free"
  with `trackEvent("cta_click", { to: "/signup", label: "navbar_desktop" })`.
- Mobile: `.tap-44` hit areas on everything.

## 4. Landing effects inventory (what each is for)

| Component | Job | Rules |
|---|---|---|
| `HeroParticleField` | Cursor-reactive dashes around a breathing ring | Canvas, DPR-capped, pauses when tab hidden |
| `FluidCursor` | Landing-only custom cursor | Landing only; dashboards keep the native cursor; `display:none` under reduced motion |
| `ScrollEffects` | One rAF writer for parallax/blobs | No infinite CSS loops — a page that moves untouched reads as a screensaver |
| `SmoothScroll` | Lenis, fine-pointer only | Never on touch |
| `ScrollReveal` | `[data-scroll-reveal]` attribute observer | IntersectionObserver, once, unobserve after |
| `Magnetic` | CTA magnet hover | Desktop-only by nature; see 03 |
| `MCQDemoSection` | Playable sample MCQ | Lazy `next/dynamic`; the single best conversion piece — ship it |
| `CollegeCarousel` | Target cards | Pauses under reduced motion |
| `CommunityStreakWall` | Real activity heatmap | Hidden when DB unreachable, never faked |
| `EntryTestCountdown` | Days to exam | Reads a dates file; MED can target MDCAT date |
| `LeaderboardHub` | Tabs: all-time / duels / races | Rank 1 wears the crown |

## 5. Footer

Complete source: `components/landing/Footer.tsx`. Four columns (Product,
Colleges→MED subjects, Company, Legal), WhatsApp + call rows via
`getWhatsAppLink()`/`getTelLink()` from `lib/site.ts`, social links declared
only if the accounts really exist (see 05 for the sameAs honesty rule), and a
`.footer-link` mobile rule: above 767px nothing, below it links become 44px-tall
full-width rows for thumbs.

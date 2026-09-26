# 09 — INTEGRATION CHECKLIST (do these in order)

Work top to bottom. After every step: `npx tsc --noEmit` passes, `npm run build`
passes, and the affected page still renders correctly at 360px width.

## Step 0 — Read everything
Read `00` through `08`. Do not start editing before that. The cadet repo lives
alongside this project's sibling checkout (ask the user for its path if you
need a source file not excerpted here — every file referenced by name exists).

## Step 1 — Design tokens & theme engine (file 01)
- [ ] Replace/merge the `:root` token block in `app/globals.css`.
- [ ] Add the surfaces/effects block (glass tiles, aurora, grain, sheen, seam, tap-44, reduced-motion kill switch).
- [ ] Copy `components/ThemeProvider.tsx` (rename storage key to `med-prep-theme`).
- [ ] Add the FOUC inline script to `app/layout.tsx` `<head>`.
- [ ] Copy `components/ThemeSwitcher.tsx` into the navbar; `components/ThemeWheel.tsx` into the hero.
- [ ] Add the three `[data-theme]` palette blocks (emerald/crimson/violet).
- [ ] Verify: switching themes recolours the whole site with no reload and no
      flash on reload; toggling reduced-motion in devtools freezes all motion.

## Step 2 — UI kit (file 03)
- [ ] `Button`, `Badge`, `Motion` (Reveal/Stagger/ScaleIn/Float), `Magnetic`,
      `TrackedLink`, compass/brand mark.
- [ ] Replace ad-hoc buttons/chips with the kit on one surface (dashboard home)
      as the pattern, then propagate.
- [ ] Verify: focus rings visible by keyboard; tap targets ≥44px on mobile.

## Step 3 — Landing upgrades (file 02)
- [ ] Adopt the section order; lazy-load below-fold sections with `next/dynamic`.
- [ ] `revalidate = 60` + live stats with "as of" stamp (no fabricated numbers).
- [ ] Hero copy rebranded; CTAs nowrap; `Magnetic` on both.
- [ ] Add `MCQDemoSection` (playable sample question) — highest-value landing
      addition.
- [ ] Navbar: scroll-material fade, plain anchors, `router.prefetch("/login"|"signup")`,
      Escape/resize closes the mobile menu.
- [ ] Verify: Lighthouse mobile ≥ 90 performance on the landing; hero paints
      without JS.

## Step 4 — Analytics stack (file 04)
- [ ] Migration: `client_telemetry` table (SQL in file 04 §1).
- [ ] `lib/telemetry.ts` + `components/Telemetry.tsx` mounted in layout.
- [ ] `app/api/telemetry/route.ts`.
- [ ] `lib/admin-analytics.ts` + `components/admin/charts.tsx` + `/admin/analytics`
      page (KPIs, daily chart, top pages, click events, client errors, honesty footer).
- [ ] Swap CTAs to `TrackedLink` with dotted labels; add product `trackEvent`s.
- [ ] Verify: click 5 CTAs → rows appear within ~40s → admin analytics shows them.

## Step 5 — SEO stack (file 05)
- [ ] `lib/site.ts` URL helper + honest `SITE_NAME`/`SITE_DESCRIPTION`.
- [ ] `lib/seo-pages.ts` as the one list; `app/sitemap.ts` + `app/robots.ts` from it.
- [ ] IndexNow route + `public/<KEY>.txt` + vercel.json cron + `INDEXNOW_KEY` note.
- [ ] `app/llms.txt/route.ts` + `app/llms-full.txt/route.ts` rendered from
      `lib/content-catalog.ts`.
- [ ] JSON-LD: EducationalOrganization + WebSite (layout), FAQPage + LearningResource
      (home), Article (blog).
- [ ] Verify: `curl https://<host>/robots.txt`, `/sitemap.xml`, `/llms.txt`,
      `/api/seo/indexnow?key=<key>` all answer correctly; canonical tags point
      at the serving host.

## Step 6 — Content systems (file 06)
- [ ] Confirm every bank question carries a uuid v5 key (run the key script;
      it's idempotent).
- [ ] Answer distribution check — rebalance if one letter dominates.
- [ ] Notes in the NoteBlock/NoteTopic/NoteSection format + renderer page +
      access gate (admin / referral-5 / leaderboard top-3).
- [ ] Formula deck → flashcards for MDCAT formulas.
- [ ] Admin question manager wired to draft/publish.

## Step 7 — Competitor features (file 07)
- [ ] `/mdcat-test-dates-2027` table page (+ SEO_PAGES + catalog + ping).
- [ ] Toolkit grid (six pillars) on the landing.
- [ ] Per-registry pages (UHS/KMU/SZABMU/DUHS/BUMHS/NUMS/ETEA) with FAQ schema.
- [ ] Aggregate calculator tool.
- [ ] Answer-block format on every existing guide.

## Step 8 — Final sweep
- [ ] `npm run build` green; no console errors on home/dashboard/admin.
- [ ] All honesty rules hold: no fake counts, `—` on failures, no "past papers"
      as an offering, no fabricated success rates.
- [ ] Mobile pass at 360px: nav, hero, practice, notes, admin all usable.
- [ ] Deploy to Vercel; run the founder actions in file 05 §9 (GSC + Bing).

## Things to NEVER do
- Never hardcode a domain in metadata that doesn't serve.
- Never show a zero or a made-up stat where a query failed — show `—`.
- Never auto-publish AI-generated questions (`source='ai'` starts as draft).
- Never stack translucent (backdrop-filter) surfaces.
- Never leave an infinite CSS animation running under
  `prefers-reduced-motion: reduce` — durations AND delays must collapse.
- Never port cadet-college questions/notes into MED (and never import cadet
  college names into MED copy) — the sites share an engine, not an audience.

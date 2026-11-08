# SEO Agent Board — Apex Pakistan / MED Prep

> Owner: SEO agent. Source of truth for search visibility work. Last baseline: 2026-11-08. Statuses: `[ ]` todo · `[~]` in progress · `[x]` verified shipped · `[?]` needs evidence/decision. Never mark shipped from code presence alone: verify the live response and record the check.

## Academy and portal architecture

Apex Pakistan is one academy with distinct exam-focused destinations—not one blended exam dashboard and not a collection of disconnected websites.

- The academy-level homepage helps a student identify their goal and enter the correct track quickly.
- Each category/exam portal owns its own search intent, syllabus, eligibility/process guidance, subject taxonomy, question bank, practice modes, mock rules, notes and progress context.
- Shared platform services (identity, account, accessibility system, question delivery engine, mock engine, progress storage and admin tooling) may be reused underneath; exam content and rules must remain explicitly scoped.
- Initial taxonomy from the product spec: Medical (MDCAT, NUMS and relevant provincial pathways); Engineering & Computing (NUST NET, GIKI, ECAT and other verified tracks); University Admissions & Aptitude (HEC USAT and institution-specific tests such as LUMS); Defence (PMA initial tests and ISSB preparation); MBBS clinical learning as a separate post-admission learning product, not an entrance-test portal.
- Do not imply every listed exam is fully supported until its content, rules and student workflow are audited. Maintain a per-exam readiness status.
- Avoid doorway SEO pages: each exam landing page must provide genuinely distinct, verified value and link into a working portal.

## Mission

Earn qualified, sustainable organic discovery for Pakistani students preparing for MDCAT, NUMS, NUST NET, GIKI, LUMS, HEC USAT and PMA. Search pages must be useful, accurate, fast, accessible and genuinely distinct. No keyword stuffing, doorway pages, invented dates, fake authority, fake reviews, or unsupported exam claims.

## Current verified baseline

- Next.js App Router; 61 `page.tsx` routes in the current `main` tree (656 tracked files total).
- `app/robots.ts` exists, allows public routes and blocks admin/dashboard/auth utility paths; explicitly lists selected AI crawlers and blocks CCBot/Bytespider.
- `app/sitemap.ts` is generated from `lib/seo-pages.ts` plus `topicalDrillPaths()`; noindex utility pages should stay excluded.
- `lib/site.ts` currently hardcodes fallback canonical origin `https://mdcatprep-eight.vercel.app`.
- Vercel project `edweb` currently reports aliases `edweb-nine.vercel.app`, `edweb-acma-32c6.vercel.app`, and `edweb-git-main-acma-32c6.vercel.app`. The hardcoded fallback does not match those reported aliases. Resolve canonical-host ownership before any indexing push.
- `vercel.json` already schedules `/api/seo/indexnow` daily at 04:30 UTC. Verify endpoint auth, key proof, cron execution and provider response; don't assume cron success from config.
- Homepage has FAQPage and LearningResource JSON-LD. Inspect layout, FAQ, blog and route metadata for coverage, duplication and validity.
- Homepage title/description exist in `app/page.tsx`; central site description is in `lib/site.ts`.
- A blog surface exists at `/blog` and one guide route `/blog/mdcat-guide`; build a genuine cluster only when each page has original value.
- Current Vercel production deployment is READY, but project SSO protection is enabled for all deployments except custom domains. Verify public accessibility in a clean unauthenticated browser before treating the site as launch-ready.
- Current Supabase project connected to this deployment is `edweb` (active, ap-northeast-1). Public telemetry has 53 rows at baseline. Do not expose user-level data in public SEO reports.

## Non-negotiable SEO rules

1. One accurate canonical host everywhere: metadataBase, canonical tags, sitemap, robots sitemap URL, Open Graph, JSON-LD, IndexNow and internal absolute links.
2. Do not purchase or attach a domain until the website release gate in `ROADMAP-AGENT-BOARD.md` passes. Until then use one confirmed Vercel alias as temporary canonical, after checking the actual serving host.
3. Index only useful public pages. Login, signup, dashboard, admin, pending/rejected/suspended, account recovery, offline utilities and other thin/private utility pages must be noindex and excluded from sitemap.
4. Every indexable URL returns 200, has a self-consistent canonical, unique title/H1, useful original content, working internal links and no accidental noindex.
5. Do not publish fabricated exam dates, marks, seats, merit cutoffs, success rates, testimonials or question counts. Date claims must cite the relevant official authority and show an updated/checked date.
6. Past-paper provenance must remain explicit (official / reconstructed / memory-based). Never call original exam-style questions actual past-paper questions.
7. Never create pages that merely swap city/board keywords. Each registry/exam page needs distinct verified facts and helpful material.
8. Respect the repository exclusion rules and copyright rules in `TODO.md`; do not create or import prohibited content.
9. Keep student personal data, account paths and private notes out of crawlable output.
10. Run build, typecheck, lint on touched files, URL smoke checks and schema validation before closing tasks.

## Board

### P0 — Fix the canonical and crawl foundation

- [ ] Inspect `app/layout.tsx`, all route metadata, `lib/site.ts`, `lib/seo-pages.ts`, sitemap, robots and IndexNow route as one system.
- [ ] Confirm the exact public temporary Vercel hostname that serves without SSO. Vercel currently reports the three aliases above; test each anonymously and select one, or fix deployment protection. Do not guess.
- [ ] Replace the stale `mdcatprep-eight.vercel.app` fallback with the verified temporary canonical host (or make the env var mandatory with a safe, tested fallback).
- [ ] Ensure canonical URLs, metadataBase, OG URL, Twitter URL, JSON-LD URL, sitemap URLs and IndexNow host all derive from the same helper.
- [ ] Verify no production route emits `localhost`, preview hostname, stale `mdcatprep-eight` hostname or mixed hosts.
- [ ] Fetch and inspect live `/robots.txt`, `/sitemap.xml`, homepage HTML, canonical tags and response headers without an authenticated session.
- [ ] Confirm robots rules don't accidentally block CSS/JS or public learning resources needed for rendering.
- [ ] Confirm every sitemap URL is unique, absolute, canonical, indexable and returns 200; exclude redirects, noindex pages, auth pages and query-string URLs.
- [ ] Check whether dynamic topical pages have substantial unique content and stable metadata before including them in sitemap.
- [ ] Validate IndexNow endpoint: correct key file, key proof response, cron auth, bounded request, no secret leakage, and a successful provider response in logs.
- [ ] Confirm Vercel cron execution is visible and not silently failing.

### P1 — On-page SEO and structured data

- [ ] Audit all 61 route pages and shared layouts for title, description, canonical, robots, OG and Twitter metadata.
- [ ] Create a route metadata matrix (route, intent, title, description, H1, canonical, index/noindex, schema, internal links).
- [ ] Ensure one clear H1 per page and semantic heading order.
- [ ] Remove duplicate titles/descriptions and generic copy shared across pages.
- [ ] Validate homepage FAQPage and LearningResource JSON-LD against visible content.
- [ ] Add Organization/EducationalOrganization and WebSite schema only with accurate brand, contact and location facts.
- [ ] Add Article/BlogPosting schema to editorial content with real author/editor and real publication/update dates.
- [ ] Add BreadcrumbList only where visible breadcrumbs exist.
- [ ] Avoid review/rating schema unless authentic, policy-compliant reviews exist.
- [ ] Validate all JSON-LD for syntax and consistency with rendered page copy.
- [ ] Add Open Graph image metadata that points to an existing, correctly branded asset.

### P2 — Information architecture and content

- [ ] Publish the academy-level exam/goal selector as the clear entry point, with category pages and dedicated exam destinations beneath it.
- [ ] Define a portal registry (stable exam ID, category, display name, route, syllabus version, official source, readiness state, metadata and content owner) as the source of truth; inspect the existing `lib/exams-config.ts` before designing a duplicate.
- [ ] Give each exam portal a distinct route/search intent and accurate, exam-specific syllabus, pattern, practice and mock guidance; share templates/components without copying generic content.
- [ ] Define one canonical topic map across MDCAT, NUMS, NUST, GIKI, LUMS, USAT and PMA.
- [ ] Build a pillar guide for MDCAT preparation, then supporting topic guides with non-overlapping search intent.
- [ ] Prioritize high-intent pages: exam pattern, syllabus, subject/topic practice, official application guidance, released past-paper index and merit/aggregate explainers.
- [ ] Create registry-specific pages (UHS, KMU, SZABMU, DUHS, BUMHS, NUMS) only where the page has independently verified, useful differences.
- [ ] Build comparisons only when factual and decision-helpful (e.g. MDCAT vs NUMS; UHS vs KMU process differences).
- [ ] Add direct-answer blocks near the top of guides (40–60 words where appropriate), then explain with evidence and examples.
- [ ] Add clear content ownership, last-reviewed date and primary-source links to time-sensitive guidance.
- [ ] Improve internal links: guide → relevant practice → notes → mock/diagnostic; sibling guides → pillar; no orphan pages.
- [ ] Ensure every page in the content catalog has an accurate title, short description and indexability decision.
- [ ] Avoid mass-generating thin pages from topic labels. Consolidate overlapping or empty routes.
- [ ] Review every public claim for the honesty and copyright rules in `TODO.md`.

### P3 — Performance, accessibility and crawl quality

- [ ] Measure mobile Core Web Vitals on the temporary public host: LCP, INP, CLS, TTFB.
- [ ] Audit image sizing, modern formats, priority hints and below-fold lazy loading.
- [ ] Reduce client JavaScript on content pages; use server components by default.
- [ ] Check canonical pagination/filter handling and query parameter indexing.
- [ ] Ensure 404s return real 404 status; redirects are intentional and single-hop.
- [ ] Check broken internal/external links and image alt text.
- [ ] Verify keyboard access, contrast and mobile readability; SEO pages must also be usable.
- [ ] Check page rendering with JS disabled where practical and confirm essential content is server-rendered.

### P4 — Measurement and iteration

- [ ] Connect Search Console after canonical host is stable; verify property ownership and submit sitemap.
- [ ] Establish baseline by query, page, country, device, impressions, clicks, CTR and average position.
- [ ] Connect GA4 only with a documented privacy notice and consent/measurement approach appropriate to the audience.
- [ ] Use existing first-party telemetry for product funnel diagnostics; do not equate it with Search Console.
- [ ] Build a monthly content refresh queue from queries with impressions but weak CTR/rank.
- [ ] Review indexing coverage, crawl stats, manual actions and Core Web Vitals.
- [ ] Report only measured numbers with date range and source; display em dash when unavailable.

## Definition of done

- Canonical host is verified and consistent across all public outputs.
- Every sitemap URL is checked and has a clear indexability decision.
- All public pages have unique, accurate metadata and useful content.
- Structured data validates and matches visible content.
- No accidental indexing of private, thin or utility routes.
- Mobile performance/accessibility and crawl checks pass.
- Search Console baseline is recorded after the domain decision; no domain purchase is required to finish the pre-domain technical SEO work.

## Agent handoff

Before editing: read `AGENTS.md`, `TODO.md`, this board and the relevant route/component. Coordinate through `ROADMAP-AGENT-BOARD.md`; one agent per tree. Stage explicit paths only. After changes run `npx tsc --noEmit`, `npm run lint -- <touched files>` (or the repo's supported targeted lint invocation), `npm run build`, route smoke checks, and append a concise entry to `IMPROVEMENT_LOG.md`. Never claim a check ran unless its output was observed.


## Multi-portal SEO acceptance checks

- [ ] Academy homepage targets broad discovery and routes students to a relevant category/exam without trying to rank for every exam keyword.
- [ ] Category hubs explain which exams belong there and help students choose; exam pages target that exam's own intent and contain unique verified information.
- [ ] Distinguish exam names and variants accurately (for example MDCAT vs NUMS; USAT-M vs USAT-E vs USAT-CS; NUST NET vs GIKI vs ECAT). Never collapse distinct patterns into a generic “entry test” page.
- [ ] Portal pages link to their own syllabus, topic practice, mock guidance and relevant resources; cross-link only where the student decision genuinely benefits.
- [ ] Use stable, human-readable URLs and canonical IDs; avoid multiple URLs for the same exam or thin programmatic variants.
- [ ] MBBS clinical learning is clearly labelled as a separate post-admission learning area, not confused with medical entrance preparation.
- [ ] Maintain a portal readiness matrix. Do not index a portal as a fully supported preparation destination until its content and core workflow pass review.

# SEO Agent Board — Apex Pakistan / MED Prep

> Owner: SEO agent. Source of truth for search visibility work. Last baseline: 2026-11-08. Last engine check: 2026-11-27 (weekly review). Statuses: `[ ]` todo · `[~]` in progress · `[x]` verified shipped · `[?]` needs evidence/decision. Never mark shipped from code presence alone: verify the live response and record the check.

## Academy and portal architecture

Apex Pakistan is one academy with distinct exam-focused destinations—not one blended exam dashboard and not a collection of disconnected websites.

- The academy-level homepage helps a student identify a goal, resume an active Prep Space and discover other tracks.
- Each public exam information page owns its own search intent and verified exam guidance. The authenticated Prep Space owns its syllabus, subject taxonomy, question bank, practice modes, mock rules, notes and progress context.
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
- `lib/site.ts` currently hardcodes fallback canonical origin `https://mdcatprep-eight.vercel.app`. **Superseded 2026-11-26:** `getSiteUrl()` now defaults to `https://edweb-nine.vercel.app` and no live route emits the old host. See the engine baseline at the end of this file.
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
- [x] Confirm the exact public temporary Vercel hostname that serves without SSO. **Verified 2026-11-26:** `https://edweb-nine.vercel.app/` returns 200 anonymously (0.84s) with no SSO challenge; robots.txt and sitemap.xml both serve publicly.
- [x] Replace the stale `mdcatprep-eight.vercel.app` fallback with the verified temporary canonical host. **Verified 2026-11-26:** `lib/site.ts` `getSiteUrl()` returns `https://edweb-nine.vercel.app`; homepage canonical, `og:url` and JSON-LD `url` all match; 0 `mdcatprep-eight` references on `/`, `/exams`, `/past-papers`, `/blog/mdcat-guide`.
- [ ] Ensure canonical URLs, metadataBase, OG URL, Twitter URL, JSON-LD URL, sitemap URLs and IndexNow host all derive from the same helper.
- [x] Verify no production route emits `localhost`, preview hostname, stale `mdcatprep-eight` hostname or mixed hosts. **Verified 2026-11-27:** full sweep of all 96 sitemap URLs — canonical, `og:url` and JSON-LD `url` all emit `https://edweb-nine.vercel.app`; zero `localhost`, preview or `mdcatprep-eight` hosts. **Partial 2026-11-26:** 4 routes sampled clean.
- [x] Fetch and inspect live `/robots.txt`, `/sitemap.xml`, homepage HTML, canonical tags and response headers without an authenticated session. **Verified 2026-11-26, re-checked 2026-11-27:** robots.txt, sitemap.xml (96 URLs) and homepage HTML all serve anonymously; canonical and host recorded in the snapshot below.
- [ ] Confirm robots rules don't accidentally block CSS/JS or public learning resources needed for rendering.
- [x] Confirm every sitemap URL is unique, absolute, canonical, indexable and returns 200; exclude redirects, noindex pages, auth pages and query-string URLs. **Verified 2026-11-27:** 96/96 return 200, 96/96 self-canonical, 96/96 `index, follow`, zero duplicate titles, zero duplicate descriptions, zero missing descriptions, zero redirects or soft errors.
- [ ] Check whether dynamic topical pages have substantial unique content and stable metadata before including them in sitemap.
- [ ] Validate IndexNow endpoint: correct key file, key proof response, cron auth, bounded request, no secret leakage, and a successful provider response in logs.
- [ ] Confirm Vercel cron execution is visible and not silently failing.

### P1 — On-page SEO and structured data

- [ ] Audit all 61 route pages and shared layouts for title, description, canonical, robots, OG and Twitter metadata.
- [ ] Create a route metadata matrix (route, intent, title, description, H1, canonical, index/noindex, schema, internal links).
- [~] Ensure one clear H1 per page and semantic heading order. **Partial 2026-11-27:** exactly one `<h1>` on all 8 pages sampled (`/`, `/exams`, `/past-papers`, `/topicals`, `/blog/mdcat-guide`, `/notes`, `/faq`, `/pricing`); heading *order* not audited. An earlier automated count of "many H1s" was the Next.js RSC payload inside `<script>` tags, not real headings — do not re-open on that evidence.
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


## Product architecture decision — Prep Spaces (supersedes earlier portal wording)

**Decision, 2026-11-08:** Apex Pakistan is one academy and one application, with dedicated, exam-specific **Prep Spaces** inside it. Do not build a separate website/domain for every exam, and do not force every student into one generic dashboard. A Prep Space is a distinct student experience, not necessarily a separate deployment or codebase.

### Student-facing structure

1. **Academy home:** discover preparation goals and continue active goals.
2. **Category hub:** orient students across a broad family (Medical & Health, Engineering & Computing, School & College, University Admissions, Careers & Recruitment, Defence, Law, International & Graduate, etc.).
3. **Public exam information page:** explain the exact exam, authority, eligibility, verified pattern/syllabus, available preparation and readiness status; provide search-friendly discovery.
4. **Authenticated Prep Space:** focused dashboard and navigation for that exam, with its own syllabus, content, tools, mock rules and progress. The active exam context stays visible. Switching goals is deliberate and simple.

Use stable exam IDs and exam-specific routes within the same product (for example, public `/exams/mdcat` and student `/learn/mdcat`; route names are illustrative and must be mapped against existing routes before implementation). Closely related exams may share a category page or reusable engine, but must not silently share content, scoring rules or progress.

### Preparation Blueprints and reusable capabilities

Each exam receives a data-driven **Preparation Blueprint** defining its audience, official authority/source, syllabus version, navigation, enabled capabilities, assessment types, mock configuration, progress metrics, readiness state and content owner. Build reusable engines/capabilities (MCQ, timed assessment, flashcards, short/long written answers, essays, speaking/listening, interview practice, study planner, past-paper library, mistake review and analytics). A blueprint activates only what genuinely serves that exam. Do not expose irrelevant tools merely because the platform supports them.

Examples (illustrative, subject to official exam research):
- **MDCAT:** subject/topic learning, MCQ bank, explanations, flashcards/spaced revision, timed practice, exam-specific mocks, mistakes and mastery analytics.
- **PMA/Defence:** verified selection-stage guide, reasoning practice, academic screening where applicable, interview/communication preparation and stage readiness. No forced medical-style flashcard or generic MCQ-first UI.
- **CSS/PMS:** compulsory/optional syllabus, current-affairs workflow, essay, precis, comprehension, descriptive answer writing, timed submissions and feedback.
- **IELTS/PTE:** distinct reading, listening, writing and speaking workflows, task feedback and full simulations; do not reduce language tests to MCQs.
- **Matric/FSc/O/A Levels:** class/board/curriculum-specific subjects, chapters, lessons, MCQs, short/long answers, numericals and board-style papers as applicable.
- **Engineering/university aptitude:** shared question-delivery components where useful, but exam-specific topic maps, question pools, timing, scoring, mock patterns and progress.

### One account, multiple goals, strict entitlements

One student account may hold multiple preparation goals. Each goal has isolated attempts, bookmarks, notes, feedback, plans, scores and progress. A student must not see another exam's private content or progress through a shared engine.

**Commercial model must be pricing-ready from the beginning.** The initial launch may offer free access or a free acquisition period to build trust and student adoption, but the product must not promise that every exam remains free forever. When monetization is enabled:
- access is controlled by explicit, server-enforced entitlements scoped to a specific exam/Prep Space and product tier;
- purchasing MDCAT unlocks MDCAT only, not every Apex exam; a student preparing for PMA or CSS needs the corresponding entitlement unless an explicitly described bundle grants it;
- bundles, trials, scholarships, sponsored access and free samples are explicit products/policies, never accidental cross-access;
- public exam pages and account creation remain discoverable; the student sees clear included/locked states and pricing before purchase;
- authorization is checked server-side for content, APIs, downloads, attempts and progress writes—not merely hidden in the UI;
- retain an auditable entitlement model with start/end dates, status, source/order reference and revocation/refund handling. Never expose payment secrets or sensitive billing data.

Do not implement payment processing or change billing in this architecture-documentation task. Monetization details, local payment providers, tax/refund terms and pricing require separate research and explicit approval.

### Architecture principles and non-goals

- Share accounts, design system, infrastructure, content tooling and reusable engines; separate student experience and data by exam.
- Do not create dozens of independent sites/domains or duplicate application infrastructure by default.
- Do not create one universal feature menu for all students.
- Do not merge exams merely because they share subjects or an MCQ engine.
- Do not promise support for an exam until its Blueprint, content, rules and core journey pass readiness review.
- Use honest states: Available, Beta, Content in progress, Coming soon, or unavailable; never market an unbuilt Prep Space as complete.
- Keep the master national exam-demand inventory broad. Portal/Prep Space grouping is a later product decision based on syllabus, exam format, candidate journey, audience overlap and content readiness—not popularity alone.
- Keep Balochistan and smaller-city coverage first-class: local-board accuracy, regional admissions guidance, low-bandwidth/mobile performance and accessible pricing/access options.

### Delivery sequence

1. Inventory current routes, exam IDs, question banks, topic maps, mock settings, progress storage, feature availability and existing user access rules.
2. Define the Exam Registry and Blueprint schema, plus server-side exam-scoped data/access boundaries. Do not migrate production data until reviewed and approved.
3. Design academy home, category discovery, public exam pages, multi-goal student home and the active Prep Space shell.
4. Build and validate MDCAT as the first complete MCQ-heavy Prep Space against the existing product.
5. Build PMA as the contrasting selection-oriented Prep Space to prove the blueprint can support a different workflow.
6. Add CSS/PMS writing workflows, then engineering/university tests, school/college and remaining categories in evidence-based waves.
7. Add pricing/entitlements only after access boundaries and product value are proven; support the launch-free phase without hardcoding a forever-free promise.

### Acceptance criteria

- A student can enter their active Prep Space without repeatedly selecting an exam.
- Each Prep Space shows only relevant navigation and capabilities.
- Exam-specific content, mock rules, attempts and progress cannot bleed across exams.
- Multiple goals work under one account with clear switching and independent progress.
- Paid entitlements can grant exactly one exam or a named bundle; unauthorized API/content access is denied server-side.
- A free launch can transition to paid access without redesigning the account or data model.
- The exam readiness matrix and public claims accurately distinguish implemented, beta and planned experiences.

**Implementation status:** this is an approved product/architecture direction recorded in planning only. It does not mean the application, database, payment system, entitlements, routes or Prep Spaces have been implemented. No code, database, deployment, billing or domain settings are changed by this decision.


## 2026-11-08 codebase audit findings

See `EXAM-READINESS-AUDIT.md` for the first-pass route and content audit. The current public `/portal/[exam]` route is a four-entry dynamic portal overview, not yet a distinct verified public exam-information page for every exam. It contains explicit “Free forever” and “100% free … Ever” promises that conflict with the approved pricing-ready product direction; these must not remain in indexable public copy if the business model may later charge by exam. USAT-M/USAT-E and other grouped variants need truthful exam-specific search intent and readiness labels before generating additional SEO pages. Do not create doorway pages for tests without unique verified content and a real Prep Space.


Additional copy audit: permanent-free and no-expiry claims remain in the homepage, signup, FAQ, notes/resources, portal and `/llms.txt`; the pricing page advertises Rs. 0 passes and an all-access lifetime bundle whose activation is not backed by a server grant. These are not approved long-term claims. Align indexable copy with the explicit launch policy, avoid “free forever”, and describe only public samples/discovery as open where the product policy confirms that access.


The public/private boundary is being formalized in `EXAM-DATA-BOUNDARY-DESIGN.md`: only intentionally mapped public samples should be open for discovery; full exam preparation can be protected by a goal-specific entitlement. Public exam pages must accurately distinguish sample content, full preparation availability, beta status and locked spaces without promising lifetime free access.


Official-source verification (2026-11-08) confirms standard HEC USAT has six categories and a different 75-MCQ + essay structure from the Balochistan/FATA scholarship test's 100-MCQ format. The existing bank must not be marketed as standard USAT-M. HEC also says universities decide whether to accept USAT; avoid universal-mandatory claims. NUST NET has five official paper types, and the current product only supports NET-Engineering. Public pages must use those distinctions and only index variants with unique, verified information.


The code audit confirms full USAT/NUST/PMA banks are currently imported by public client routes. Before the paid model is enabled, move full question content behind server-side exam/variant entitlement checks and leave only deliberate sample subsets public. Public search pages may describe the exam and link to sample practice, but must not expose full paid banks or claim durable progress when the attempt store is not recording bundled questions.


PMDC-2026's official notice confirms 180 MCQs with 81 Biology / 45 Chemistry / 36 Physics / 9 English / 9 Logical Reasoning, 3 hours and no negative marking. Public exam pages should use this current-year pattern and link to PMDC's official notice. The repository's current 100-question “full mock” does not match this structure; do not claim a full official-pattern mock is available until corrected and backed by a populated, verified question source.

## Autonomous SEO engine baseline (2026-11-26)

The SEO agent now runs a weekday research shift: Monday to Friday 07:00 PKT, with the Friday run producing the weekly strategic review instead of the daily brief.

Scope of that shift: research, prioritise and write tasks. It never changes application code. Documentation commits to `main` are authorised. Findings land here, competitor history lands in `COMPETITOR-BENCHMARK-ROADMAP.md`, and ready work lands in `NEXT-WAVE-BUILD-QUEUE.md`.

### Measurement availability (blocking limitation)

No analytics or webmaster connector is authorised. Google Search Console, Google Analytics and Bing Webmaster Tools are all unavailable. Until at least Search Console and Bing Webmaster Tools are connected, this board must not report impressions, clicks, average position, CTR or indexed-page counts, and must not infer them from anything else.

What verification is currently possible: live HTTP inspection of public pages, `robots.txt`, `sitemap.xml`, rendered metadata, canonical tags, structured data and response headers. Connecting Search Console and Bing Webmaster Tools is the single highest-value measurement unlock and is a P1 dependency for every traffic or ranking claim.

### Verified live snapshot (2026-11-26)

- Deployment identity: `https://edweb-nine.vercel.app` serves the public site anonymously; homepage returns 200 in about 0.84s. The repo's linked Vercel project still needs independent confirmation before repo and host are treated as one deployment.
- `robots.txt`: allows public routes; disallows `/admin`, `/dashboard`, `/api/`, `/login`, `/signup`, `/pending`, `/rejected`, `/suspended`, `/forgot-password`, `/reset-password`, `/account-deleted`. Allows GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, anthropic-ai and Google-Extended; blocks CCBot and Bytespider. Sitemap line points to `https://edweb-nine.vercel.app/sitemap.xml`.
- `sitemap.xml`: 96 URLs, `lastmod` 2026-11-25T21:29Z.
- Canonical host is consistent: homepage canonical, `og:url` and JSON-LD `url` all emit `https://edweb-nine.vercel.app`.
- Category coverage counted from the sitemap: MDCAT topicals for biology, chemistry, physics and english plus a mathematics mixed bank; 10 registry past-paper pages (UHS, KMU, SZABMU, SZABMU reconducted, DUHS, BUMHS, ETEA, NUMS, SIBA, Sindh); subject notes; flashcards; daily quiz; diagnostic; resources; exams; pricing; faq; 2 blog pages; legal pages. No dedicated landing page appears for NUST NET, GIKI, HEC USAT, LUMS, PMA or ISSB, and no engineering, mathematics or defence subject content is indexed. Confirm against the route tree before writing this up as a task.

### Board reconciliation (2026-11-26)

- P0 hostname confirmation and stale fallback replacement are verified shipped; evidence is recorded on the task lines above.
- Brand drift candidate: `lib/site.ts` sets `SITE_NAME` to `MED Prep` while the product is now Apex Academy. Check titles, OG tags, JSON-LD and visible copy for drift and raise a task with exact locations.
- The 2026-11-08 baseline claim that `lib/site.ts` hardcodes `mdcatprep-eight` is superseded.

### Weekly review (2026-11-27) — findings and the five

Weekly review applied to this board on 2026-11-28 from the SEO agent's 2026-11-27
report. Everything marked **live** was checked against `https://edweb-nine.vercel.app`
on 2026-11-27 by that run; everything marked **code** was re-checked in this
tree on 2026-11-28. Throughput in the window 2026-11-22 → 2026-11-26: 40
commits, all product and UI, **zero SEO code commits** (only the 2026-11-26
documentation baseline, `182d05d`). That is why this section is a shortlist of
five rather than an eighth list of forty ideas.

**Closed above by this run (live evidence):** the 96-URL sweep, the anonymous
fetch of robots/sitemap/homepage, the unique-and-canonical sitemap audit, and
the one-H1 sample. These were the largest block of open P0 work.

**Findings recorded, not scheduled** — real, but behind the five:
- **F6 — DONE (2026-11-28):** `/nust/practice` no longer collapses three tests.
  It is NUST NET-Engineering only (maths 50 / physics 30 / English 20, no
  chemistry), with `/giki/practice` for GIKI's own physics-maths-English test and
  `/lums/practice` stating that LUMS sets no subject paper (SAT/ACT/LCAT). GIKI's
  MCQ count and duration are marked "not published" on the page rather than
  invented.
- **F8 (live):** `/start/[test]` is `noindex, nofollow` and canonicalises home;
  `789dab6` now routes internal links into it. Acceptable as a demo gate, but
  `/nust/practice` must not depend on it for discovery.
- **P3 metadata polish (live):** 55 of 96 titles exceed 65 characters and 16
  descriptions exceed 165. Google truncates by pixel width — display polish, not
  an indexing problem.

**Snapshot 2026-11-27 (live), for the record:** sitemap still 96 URLs; the four
routes below are live, indexable and self-canonical but absent from it.

**Correction (2026-11-28, live + code).** The review said nine `/portal/[exam]`
pages were live and indexable. They answered 200, but only **four** are real
portals — `EXAMS_CONFIG` in this tree holds exactly `mdcat`, `nust`, `pma` and
`usat`. The other five (`nums`, `giki`, `lums`, `issb`, `ecat`) and any invented
slug will render the not-found shell, which inherited the root layout: homepage
title, homepage canonical, `index, follow`. Measured directly: `/portal/zzz`
returned **200** with no `<h1>`, while `/definitely-not-a-page` returned a real
404. So the defect was larger than nine URLs — it was an unbounded soft-404 farm
off `/portal/` — and the five "portals" were never pages that needed content.

### P1 — the 2026-11-27 shortlist (build these, nothing else)

**Status: DONE 2026-11-28.** Sitemap is 106 URLs; all four routes are in it and
still return 200 with a self-canonical.

#### APX-TECH-20261127-01 — Sitemap the four built exam routes
- **Category:** Technical · **Priority:** P1 · **Effort:** Low · **Dependencies:** none · **Research:** 2026-11-27
- **Problem:** `/nust/practice`, `/pma/practice`, `/usat/practice` and `/notes/usat-m` are live, unique, `index, follow` and self-canonical, but are not submitted.
- **Evidence (live 2026-11-27 + code 2026-11-28):** all four return 200 with one H1 and self-canonical; `/exams` links to the three practice routes so they are crawlable; `sitemap.xml` has 96 URLs and 0 matches. Locally, `lib/seo-pages.ts` holds 30 `path:` entries and none of the four — the omission is in the source, not in the generator.
- **Implementation:** add the four paths to `lib/seo-pages.ts`, following the existing entry shape (`lastmod`, `changefreq`, `priority`). Do not hand-write XML.
- **Acceptance:** `sitemap.xml` contains all four URLs; each returns 200 and self-canonical; sitemap count becomes 100.

#### APX-TECH-20261127-02 — Stop nine `/portal/[exam]` pages impersonating the homepage
- **Category:** Technical · **Priority:** P1 · **Effort:** Medium · **Dependencies:** APX-CONTENT-20261127-04 · **Research:** 2026-11-27
- **Problem:** nine `/portal/` URLs answered 200 `index, follow` with the homepage canonical and title. Two separate defects: the four real portals inherited the root metadata, and every unknown slug rendered a 200 soft-404 instead of a 404.
- **Evidence (code 2026-11-28):** `app/portal/[exam]/page.tsx` exported no `metadata`; `generateStaticParams` covers four keys only; `notFound()` inside that statically generated segment answered 200 at the edge; `/portal/zzz` returned 200 with no `<h1>` while `/definitely-not-a-page` returned 404.
- **Implementation:** `dynamicParams = false` on the segment so only real portals render (unknown slugs are a true 404), plus per-portal `generateMetadata` with a unique ≤60-character title, unique description and self-canonical. Index is kept because each portal has its own bank, subjects, subtests and CTAs.
- **Acceptance:** no `/portal/` route emits the homepage canonical or title; every indexable portal has a unique title, description and one H1; unknown portal slugs return 404.
- **Status: DONE 2026-11-28.** `/portal/{mdcat,nust,pma,usat}` → 200, unique title, self-canonical. `/portal/{zzz,nums}` → **404**. All four are now in the sitemap (106 URLs). The not-found body still carries the root canonical, which is harmless at 404 but worth a `noindex` if a segment-level not-found is ever added.

#### APX-CONTENT-20261127-03 — Public aggregate and merit calculator
- **Category:** Content · **Priority:** P1 · **Effort:** Medium · **Dependencies:** none · **Research:** 2026-11-27
- **Problem:** the calculator exists only at `/dashboard/merit-estimator`, behind sign-in and inside a path `robots.txt` disallows (`app/robots.ts` line 13), so it can never be crawled. Competitors publish the same tool openly.
- **Evidence (live + code 2026-11-28):** the dashboard route returns a sign-in screen; `robots.ts` disallows `/dashboard`; autocomplete (gl=pk, 2026-11-27) shows `mdcat merit calculator 2026`, `mdcat aggregate calculator 2026 sindh`, `mdcat aggregate formula`; `prepmdcat.com/mdcat-merit-calculator` is public.
- **Implementation:** a public `/merit-calculator` reusing `lib/merit.ts`, province/board selectable because the formula differs. Every formula shown cites its official source and a last-checked date. Link from `/exams`, `/past-papers` and the MDCAT guide.
- **Acceptance:** returns 200, indexable, in the sitemap, works with no account, and shows a source citation plus last-checked date per formula variant.
- **Status: DONE 2026-11-28.** `/merit-calculator` is static, in the sitemap, needs no account, cites the PM&DC Admissions, Curriculum and Conduct Policy and Regulations 2026 (notified 12 October 2026) with a last-checked date, and adds a reverse "what MDCAT score do I need" mode plus the 60% HSSC / 55% MBBS / 50% BDS eligibility gates. The college closing-merit table was deliberately **not** published: its sources are community-tracked, not official, so it stays in the signed-in dashboard as historical. The dashboard estimator's hardcoded "90%+ for King Edward / AKU" benchmark was removed and replaced with a link here.

#### APX-CONTENT-20261127-04 — One verified syllabus page per exam
- **Category:** Content · **Priority:** P1 · **Effort:** Medium · **Dependencies:** official source verification per exam · **Research:** 2026-11-27
- **Problem:** the site has no syllabus page for any exam, while the autocomplete cluster is entirely information intent: `mdcat syllabus 2026`, `… pdf download`, `… sindh`, `… kpk`, `… kmu`.
- **Evidence (live 2026-11-27):** no syllabus route in the app tree or the 96-URL sitemap; `prepmdcat.com` runs `/mdcat-syllabus` and `/nums-syllabus` as separate pages.
- **Implementation:** start with `/syllabus/mdcat` from the current PM&DC curriculum — the 24-page PDF is already downloaded and verified in `data/papers/pmdc/2025-2026-curriculum.pdf` (see `docs/PAPERS-INVENTORY.md`) — then NUMS, NUST NET, GIKI, USAT, LUMS, PMA. Each page: subject weightings, question count, time allowed, negative-marking rule, official source link, last-checked date. Where a body has published nothing current, say so rather than reusing last year's.
- **Acceptance:** each page cites its official source, shows a last-checked date, appears in the sitemap, and is linked from its exam's portal and practice page.
- **Status: PARTIAL 2026-11-28.** `/syllabus/mdcat` is live, static, in the sitemap, linked from the MDCAT portal, `/exams` and `/merit-calculator`. It carries the verified 180 MCQs / 180 minutes / 81-45-36-9-9 / 15-70-15 / 55-50 / no-negative-marking structure, transcribed from the PM&DC curriculum the repo now holds at `data/papers/pmdc/2025-2026-curriculum.pdf`, and states what it will not claim (no topic-level weightage exists in the official document). Remaining: NUMS, NUST NET, GIKI, USAT, LUMS and PMA pages, each needing its own official source. The unit-by-unit topic tree is a separate transcription job — the PDF's two-column table does not survive text extraction cleanly and must be checked by hand.

#### APX-SEO-20261127-05 — Settle the brand entity and align every signal
- **Category:** SEO · **Priority:** P1 · **Effort:** Medium · **Dependencies:** founder decision on the name · **Research:** 2026-11-27
- **Problem:** three names are in play. Every `<title>`, `lib/site.ts` and `/llms.txt` say **MED Prep**; strategy documents in this repo say **Apex Academy**; the repository is named `mdcatprep`, which is a live unrelated competitor (`mdcatprep.com`, claims 16,800+ MCQs and papers 2008–2026). No search engine can resolve one entity from that, and a student searching the strategy name will not find the site.
- **Evidence (live 2026-11-27):** titles on every page checked, `/llms.txt` opening line, `SITE_NAME` in `lib/site.ts`; the competitor site is live and separate.
- **Implementation:** after the name is chosen, align `SITE_NAME`, every title template, Open Graph, `Organization` and `WebSite` JSON-LD, `/llms.txt`, and add a public `/about` stating what the product is, who runs it and what it covers. Then register Search Console under that name.
- **Acceptance:** one name in `SITE_NAME`, every title, OG tags, JSON-LD, `/llms.txt` and `/about`; zero occurrences of the other name in public output.

### Blocked on the owner (2026-11-27)

- **GitHub connector dropped mid-run**, so the review itself landed nowhere: no SHA exists for it. That is the reason this section is being applied by hand rather than arriving as a commit.
- **Search Console, Analytics and Bing Webmaster Tools are all unauthorised.** No impression, click, position or indexation data exists, and no claim in this review depends on any. Connecting Search Console is the single highest-value measurement unlock and blocks every traffic claim on the board.
- **Brand decision** (APX-SEO-20261127-05) is the owner's call and gates any further brand work.
- **Do not publish exam dates or results yet.** One competitor page asserts "MDCAT 2026 rescheduled to 20 September, PM&DC notice updated 10 Aug 2026". That claim was not verified against the PM&DC notice and must not be copied. If a `/dates` or `/result` surface is built, every date cites the official body (PM&DC, NUMS, NUST, HEC, GIKI, LUMS, Pakistan Army) with a visible last-checked date.

### Task ID convention

New tasks carry an ID in the form `APX-CATEGORY-YYYYMMDD-NN`, for example `APX-SEO-20261127-01`. Categories: `SEO`, `TECH`, `CONTENT`, `COMP`, `GROWTH`, `PRODUCT`, `OUTREACH`. Every new task states its problem, evidence, recommended implementation, expected outcome, priority, effort, dependencies, acceptance criteria and research date. Existing unlabelled checkbox items keep their place and are not renumbered.

Every task must also satisfy the standing rule above: never mark shipped from code presence alone, and record the live check that proved it.

## 2026-11-28 — Medical competitor audit SEO queue

### P0 — Domain/canonical incident
- [ ] Investigate audit observation that `https://apexpakistan.com` redirected to a GoDaddy domain-for-sale page on 2026-11-28. Re-test apex and www independently; capture status and full redirect chain. Treat as critical until explained.
- [ ] Confirm the approved public Vercel deployment alias still serves the real app anonymously; do not assume the custom domain is attached or healthy.
- [ ] Once domain routing is fixed with founder approval, align canonical origin, metadataBase, sitemap, robots, OG/Twitter, JSON-LD, IndexNow and Search Console to one verified host.
- [ ] Add recurring checks for domain parking/sale redirects, unexpected canonical host changes and public availability.

### P1 — MDCAT search-intent coverage
- [ ] Audit existing medical SEO routes before creating new ones; map URL → target intent → unique content → live product destination.
- [ ] Prioritize genuinely useful pages for MDCAT preparation, MDCAT MCQs, Biology/Chemistry/Physics/English MCQs, past papers, mock tests and syllabus.
- [ ] Ensure each page includes accurate exam guidance, real usable practice or substantive learning value, clear provenance and relevant internal links.
- [ ] Verify PM&DC exam facts and dates against official sources; show checked/updated dates and never invent cutoffs, dates, seats or success claims.
- [ ] Benchmark ePrepare, TestPrep Smart and MDCAT.pk search snippets, page structure, content depth and conversion paths; record dated evidence, not assumptions.
- [ ] Avoid thin keyword-swapped pages, duplicate topical pages, unsupported question-count claims and fabricated testimonials.
- [ ] Measure Search Console impressions, clicks, CTR and query/page growth before and after changes.

### P1 — Trust and E-E-A-T evidence
- [ ] Document question sourcing and editorial review; distinguish official, reconstructed and memory-based past-paper content.
- [ ] Add verifiable author/reviewer credentials and transparent correction/contact paths where appropriate.
- [ ] Publish student outcomes only with permission and verifiable records; label methodology and cohort/date.

## 2026-11-28 — Homepage positioning and search-intent follow-up

**Input quality:** Founder-supplied homepage desk review of Apex, Maqsad and MDCAT Mentor; no Search Console/ranking data, logged-in competitor tests or performance testing was included. Competitor scale, feature and partnership claims are unverified vendor statements. Use them to generate research questions, not as facts or copy to reproduce.

### P0 — Brand and claim consistency
- [ ] Inventory titles, descriptions, OG/Twitter metadata, canonical URLs, JSON-LD, footer, FAQ and llms.txt; reconcile product/vertical naming after the founder confirms the public brand. Do not bulk-replace names before that decision.
- [ ] Ensure page title and social-share title describe the same page and use the approved brand consistently.
- [ ] Audit public question-count, student-count, download, result, feature and free claims. Distinguish bank inventory from users/activity; remove unsupported or misleading numbers and feature promises.
- [ ] Verify the homepage subject/stream count against actual signup and exam registry options; use the actual supported list.
- [ ] Verify that GIKI/LUMS/ISSB pages represent distinct content and exam rules before creating/indexing them. Do not create pages implying separate banks when content is currently shared with NUST/PMA.
- [ ] Check raw HTML, hydration and loading output for a stuck Loading shell or missing primary content; ensure crawlers and users receive substantive server-rendered content.
- [ ] Review meta keywords and remove keyword stuffing; prioritize useful titles, descriptions, headings, internal links and unique page value.

### P1 — High-intent information pages (activation gated by launch model)
- [ ] Audit current routes and existing /merit-calculator and /syllabus/mdcat before proposing duplicates. Map each target query to one canonical URL, unique content and a working preparation destination.
- [ ] Expand verified syllabus coverage beyond MDCAT in sequence: NUMS, NUST NET, GIKI, USAT and PMA only when the exact exam/variant has an official or clearly attributed source and a dated review.
- [ ] Research exam-date, registration, eligibility, result and admission-deadline search intent. Publish a page only when every date/status is sourced from the responsible official authority, linked, and visibly last-checked; otherwise provide a transparent not-announced/verify-with-authority state.
- [ ] Audit aggregate/merit calculator coverage by exam and province/board. Reuse the existing public calculator where applicable; do not duplicate it. Any additional formula (including competitor-advertised 10/40/50 weightings) must be independently verified against the currently applicable official policy before publication. Cite source, effective year and last-checked date.
- [ ] Build genuinely useful exam-specific resources (syllabus, paper pattern, past papers, eligibility, preparation guides and calculators) rather than thin keyword-swapped doorway pages.
- [ ] Validate search demand and competitor SERPs with dated evidence; separate organic visibility from brand awareness and paid promotion.
- [ ] Connect Search Console/Analytics/Bing Webmaster Tools only with founder authorization; until then mark traffic, ranking and indexing outcomes not measured, not successful.

### P1 — Trust signals and conversion (activation gated by launch model)
- [ ] Add a substantive About/editorial standards/corrections/contact page with verifiable ownership and reviewer credentials.
- [ ] Add testimonials, student photos, school partnerships, downloads or outcome claims only with written permission and auditable evidence; never imitate competitor proof bars or copy their figures.
- [ ] Explain question provenance (original exam-style, official released paper, reconstructed or memory-based) and link to the relevant source where possible.
- [ ] Make every search landing page state what preparation is actually available now, what is beta/planned, and the next useful action.

### Launch-model dependency
- [ ] Await founder confirmation: public, private/invite-only, or staged. Until then, continue essential technical SEO, canonical correctness, metadata integrity and removal of misleading claims; hold net-new acquisition content, public outreach and conversion campaigns.
- [ ] If public or staged is approved, prioritize the information-page queue and measure indexation/impressions/clicks. If private is approved, park acquisition SEO and keep only access-appropriate technical hygiene.

**Acceptance:** No date, formula, result, count, testimonial, ranking or competitor capability is published as fact without a dated primary source or reproducible evidence. This queue does not supersede existing domain, brand-decision or official-source blockers.


# SEO Agent Board — Apex Pakistan / MED Prep

> Owner: SEO agent. Source of truth for search visibility work. Last baseline: 2026-11-08. Statuses: `[ ]` todo · `[~]` in progress · `[x]` verified shipped · `[?]` needs evidence/decision. Never mark shipped from code presence alone: verify the live response and record the check.

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

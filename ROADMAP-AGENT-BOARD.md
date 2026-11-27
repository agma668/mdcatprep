# Master Roadmap & Todo Agent Board — Apex Pakistan / MED Prep

> This is the coordinating source of truth across the SEO and Design boards. Owner: roadmap/orchestration agent. Baseline inspected: 2026-11-08. Branch: `main`. Repository: `agma668/mdcatprep`. Do not buy or attach a custom domain until the 10/10 website release gate is passed and the founder explicitly approves the purchase.

## North-star outcome

Ship **one unified Pakistani exam-preparation academy with purpose-built, exam-specific Prep Spaces inside one platform**. A student should immediately understand where to go, enter the right portal, and see only the syllabus, practice, mock rules, resources and progress relevant to that exam.

The academy is one coherent product and account system—not a giant blended dashboard and not disconnected websites. Share infrastructure, identity, design system and reusable learning engines underneath; give each Prep Space its own relevant workflow, capabilities, content, configuration, navigation, entitlements and progress.

Initial product taxonomy:
- **Medical entrance:** PMDC MDCAT and NUMS (including relevant provincial/admission pathways where verified).
- **Engineering & computing:** NUST NET, GIKI, ECAT and other supported tests as verified.
- **University admissions & aptitude:** HEC USAT variants and institution-specific tests such as LUMS where verified.
- **Defence:** PMA initial tests and ISSB preparation.
- **MBBS clinical learning:** a separate post-admission learning area, not mixed into entrance-test preparation.

The academy homepage is the front door; category hubs aid discovery; public exam pages explain each test; authenticated Prep Spaces provide focused learning experiences within the same application. Students may have one account and multiple goals, but the active Prep Space must always be visible and each goal's content/progress must remain isolated. The commercial model is pricing-ready: launch access may initially be free, but future paid access is scoped to the exam(s) explicitly purchased or granted; one exam purchase does not unlock the entire academy. Never claim a portal is complete until its content and core workflows pass the readiness checks.

Ship a trustworthy, polished, fast, accessible, genuinely useful product. A student should be able to find the correct exam track, practise original high-quality questions, understand explanations, revisit mistakes and measure progress.

“10/10” means all critical user journeys work, the product is visually coherent, the content is honest, the site is safe and accessible, production is stable, and measured performance is strong. It does not mean adding every possible feature.

## Current system baseline (verified 2026-11-08)

### Repository and stack
- GitHub: `agma668/mdcatprep`; current `main` head at initial inspection: `b32927301ac427288043da7b98de22df28b15bec`; see the 2026-11-08 audit addendum for the current head and branch divergence.
- 656 tracked files; 61 App Router `page.tsx` routes; 123 component files; 97 `lib` files; 22 checked-in Supabase migration files; two test files.
- Next.js 16.2.10, React 19.2.4, TypeScript, Tailwind CSS 4, Supabase SSR/client, Framer Motion, Lenis, Resend and web-push.
- Scripts: `npm run build`, `npm run lint`, `npm test`; typecheck via `npx tsc --noEmit`.
- Existing working rules in `AGENTS.md` and the full system/product spec in `TODO.md` are mandatory. Keep the improvement log updated.

### Product surface
- Exam tracks: MDCAT/NUMS, HEC USAT, PMA/ISSB, NUST/GIKI/LUMS, plus MBBS clinical notes surface as described in the spec.
- Public: homepage, exam hub, dynamic exam portal, topical practice, released past papers, daily quiz, flashcards, notes, blog, FAQ, resources, pricing and auth pages.
- Student: dashboard, practice sessions, timed mock tests, diagnostic, flashcards, mistake notebook, bookmarks, analytics, duels/races, notes reader, profile and offline practice.
- Admin: overview, analytics, question manager, notes review, feedback and push composer.
- The repo includes local/bundled question banks and Supabase-backed question/content tables. Treat each source deliberately; don't assume a local bank has been seeded into production DB.

### Live infrastructure findings
- Vercel project: `edweb`, linked to `agma668/mdcatprep`, team `ACMA`, Hobby plan.
- Latest deployment at inspection: production target READY, commit matches current `main` head. Its deployment hostname is `edweb-eb833jc6h-acma-32c6.vercel.app`; project aliases reported as `edweb-nine.vercel.app`, `edweb-acma-32c6.vercel.app`, `edweb-git-main-acma-32c6.vercel.app`.
- Vercel project has SSO protection enabled for all deployments except custom domains. Public unauthenticated access is therefore a release blocker to investigate; don't assume READY means publicly accessible.
- No custom domain is currently listed on the Vercel project.
- `lib/site.ts` fallback currently points to `https://mdcatprep-eight.vercel.app`, which does not match the Vercel aliases above. This is a P0 canonical/production-host mismatch.
- Supabase project `edweb` (`niiskuwlpccmdtwjoxvm`) is ACTIVE_HEALTHY in `ap-northeast-1`. A separate project named `CAT` is INACTIVE; do not use it for live changes.
- Live public schema includes profiles, questions, notes, attempts, feedback, WhatsApp subscribers, push subscriptions, telemetry, duels, duel answers, races, flashcard reviews and bookmarks. RLS is enabled on the listed public tables.
- Read-only live inspection on 2026-11-08: `profiles` 2 rows, `client_telemetry` 62 rows; `questions`, `question_attempts`, `question_bookmarks`, `flashcard_reviews`, `notes`, feedback and activity tables all 0 rows. The bundled question banks are in source code; the live question table is empty.
- Supabase advisors surfaced: client_telemetry RLS enabled with no policies (likely intentional server/service-role-only insert, but verify API-only access); mutable search_path on three functions; SECURITY DEFINER RPCs executable by anon/authenticated; leaked-password protection disabled; RLS auth-function per-row performance warnings; multiple permissive SELECT policies on notes; 20 unused-index notices. Triage these individually—do not blindly drop indexes or revoke function access without understanding product flows.
- Current Vercel production status READY is not equivalent to a public smoke test, full functional QA or 10/10 sign-off.

## Coordination rules

- The three boards are specialist queues; this master board controls order, priority, dependencies and release gates.
- One agent owns a given code tree at a time. Before editing, state the exact files/paths being changed.
- Read `AGENTS.md`, `TODO.md`, relevant board and existing implementation first.
- Keep changes small, reversible and scoped. No broad refactors during launch hardening.
- Never run `git add .` or `git commit -a`; stage explicit paths only.
- Never modify production database schema/data, production secrets, deployment protection, custom domains or billing without a task-specific approval.
- Never paste credentials or secret environment values into chat or documentation.
- Never claim a test, deployment, URL or user journey passed unless it was actually run and observed.
- For every completed task: typecheck → lint touched files → build → relevant tests → desktop/mobile smoke → improvement log → one why-focused commit. Verify the production preview before promotion.
- Do not buy/attach a custom domain during phases 0–5. The only domain step is phase 6, after the release gate and explicit founder approval.

## Phase 0 — Establish truth and unblock public preview (P0)

- [x] Confirm the public production alias `https://edweb-nine.vercel.app` is accessible without SSO in a clean browser. **Done (2026-11-25):** unauthenticated request from outside the deployment returns **200** with the real app (`<title>MDCAT, NUMS, NUST, GIKI, USAT & PMA Test Preparation — Free</title>` and the live hero), not a Vercel login page; `/robots.txt` serves the real policy. The stale `mdcatprep-eight.vercel.app` host returns 404 and is referenced nowhere in shipped code.
- [x] Set Vercel SSO protection to `preview` only: public production deployment URLs are not gated by team SSO, while previews remain protected. Founder explicitly approved this change; password protection and trusted IP restrictions remain disabled.
- [x] Align `lib/site.ts` canonical fallback with the verified production alias `https://edweb-nine.vercel.app`; `NEXT_PUBLIC_SITE_URL` is not configured in production.
- [x] Verify GitHub branch divergence: `main` is ahead of `master`, with no reverse-only commits at the last GitHub comparison on 2026-11-08; re-check exact divergence before any deployment or sync. `AGENTS.md` now identifies `main` as the active branch. Still verify Vercel's live production-branch setting before any deployment/promotion.
- [x] Confirm Supabase project mapping: active `edweb` is the founder-confirmed Apex Pakistan backend; no other site's Supabase or Vercel setup is in scope.
- [x] Add a reproducible GitHub Actions quality workflow for `npm test`, `npm run lint`, and `npx tsc --noEmit` on PRs and `main`; first run is in progress. Vercel remains the build gate.
- [/] Inventory environment variable NAMES and whether each is configured in Preview/Production, without reading or copying secret values. **Partial (2026-11-25):** production presence is now known for the cron-checked set — **present:** Supabase URL + service-role (2/2). **Missing in production:** `CRON_SECRET`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, and all six `EMAILJS_*` keys. Effect: approval/enrolment email is skipped silently (`lib/email.ts` logs "email skipped") and web push is dead, so a student who signs up today gets no approval email. Preview environment values were not inspected.
- [/] Confirm auth, email, push, cron and telemetry routes behave correctly without leaking private data. **Partial (2026-11-25):** `/api/cron/maintenance` was answering 200 to any caller and publishing the deployment hostname plus which secrets were configured — an unauthenticated deployment-reconnaissance leak. It now returns `{ ok, service, utc }` to unauthenticated callers and the full report only with `Authorization: Bearer $CRON_SECRET`; live behaviour re-checked after deploy. `/api/cron/demo-activity` was already fail-closed (503 with no secret, 401 on a wrong bearer). `/api/telemetry` answers 405 on GET and 400 "Expected a non-empty batch" on POST. Email and push are **not** working in production (missing keys above) — that is a configuration blocker, not a code defect.
- [x] Create a route inventory with public/private/noindex classification and a list of known bugs. **Done (2026-11-22):** `docs/ROUTE-INVENTORY.md`, generated from the running site by `scripts/audit-routes.mjs`. First run found 27 crawl problems; all fixed — three submitted 404s removed, 19 real set pages added, five canonical tags that pointed at the homepage given their own, an unreachable slug normalised, ten private routes that claimed `index, follow` while robots.txt disallowed them now send `noindex, nofollow`, one missing description added. Result: 94 sitemap URLs and 13 private routes, **0 problems**.

**Exit gate:** one known public preview URL, correct host/canonical, understood branch/deployment relationship, correct active Supabase project, baseline checks recorded.

## Phase 1 — Academy architecture and 10/10 UX foundation (P0/P1)

Owner: Design board with roadmap/product coordination. Dependencies: Phase 0.
- [ ] Confirm Apex Pakistan as parent academy brand and decide whether MED Prep remains a medical portal label; map all current names/routes before renaming.
- [x] First-pass static audit of `lib/exams-config.ts`, routes, banks, mock builders, persistence and access model; evidence and readiness matrix: `EXAM-READINESS-AUDIT.md`. Full content-quality, runtime and official-pattern validation remains open.
- [ ] Define academy → category hub → public exam information page → authenticated Prep Space navigation and route map. Reuse current routes where sound; do not perform a broad rewrite just to match a diagram.
- [ ] Ensure every exam has distinct configuration for syllabus, subjects/topics, question source, practice behaviour, mock length/timing/scoring, notes and progress context where applicable.
- [ ] Create a Prep Space shell and data-driven Preparation Blueprint system that shares components while requiring exam-specific data/configuration, relevant capabilities, entitlement checks and progress boundaries; no generic cloned pages or mixed question pools.
- [x] Draft stable exam IDs, first-wave taxonomy and conceptual Blueprint/data-boundary proposal in `EXAM-REGISTRY-PROPOSAL.md`; founder review and official-source verification remain open.
- [ ] Complete desktop/mobile audit of all high-traffic surfaces.
- [ ] Fix homepage first impression, hero hierarchy, academy goal/exam selector and primary CTA.
- [ ] Build clear category hubs and dedicated exam portal entry pages; ensure the active exam context is visible throughout student journeys.
- [ ] Fix navigation, auth entry, signup flow and first-time onboarding.
- [ ] Standardize UI primitives, tokens, forms, cards, buttons, dialogs, loading/error/empty states.
- [ ] Improve dashboard “next best action” and exam-context clarity.
- [ ] Polish core learning loop: choose subject/topic → answer → explanation → next question → save/review mistake.
- [ ] Verify mock-test instructions, timer, navigation, submit/review and result states.
- [ ] Polish flashcards, notes reader, bookmarks, offline states and analytics.
- [ ] Complete admin UX pass without exposing admin concepts to students.
- [ ] Fix keyboard, screen-reader, contrast, reduced-motion and 200% zoom issues.
- [ ] Run mobile QA at 360/390/768 and desktop at 1024/1440.
- [ ] Run performance measurement on a mid-range mobile device and slower connection.

**Exit gate:** design scorecard in `DESIGN-AGENT-BOARD.md` at ≥4.5/5 in every dimension, no unresolved critical/high-severity UX defects, founder visual sign-off.

## Phase 2 — Portal-by-portal product correctness and content quality (P0)

- [ ] Create a portal-by-portal readiness matrix: exam, route, syllabus source/version, bank size/source, answer-key review, explanations, practice engine, mock rules, notes/resources, owner and launch state.
- [ ] Audit question bank keys, answer keys, explanations, duplicate text, topic mapping and subject coverage separately for every exam; no cross-exam pool leakage.
- [ ] Ensure every MCQ has one defensible answer, plausible options, explanation and honest provenance.
- [ ] Confirm all question counts displayed on the site reconcile to actual bundled/DB content.
- [ ] Test all practice engines for randomization, scoring, answer review, progress persistence and retry behaviour.
- [ ] Verify each exam's mock lengths, weightings, timers and negative-marking rules against current official sources; clearly label scaled practice mocks and keep configurations isolated.
- [ ] Audit released past-paper links, year, board, source and copyright status.
- [ ] Verify notes accuracy, source, access gate and reader UX.
- [ ] Ensure AI-generated questions are drafts and never auto-published.
- [ ] Confirm no unsupported exam promises, fake stats, fake testimonials, misleading “official” claims or prohibited content.
- [ ] Validate signup status ladder, admin-only actions, referrals, duels, races and leaderboard calculations.
- [ ] Check all core features degrade gracefully when Supabase or network is unavailable.

**Exit gate:** zero known incorrect answer keys in reviewed sample/full automated checks; all claims and provenance defensible; critical student journeys pass.

## Phase 3 — Reliability, security and operations (P0/P1)

- [ ] Review Supabase advisor findings one by one and create a risk-ranked remediation plan.
- [ ] Verify RLS on every exposed table, including intentional service-only tables.
- [ ] Review SECURITY DEFINER functions, search_path, execute grants and authorization boundaries; test legitimate flows after any changes.
- [ ] Review notes SELECT policy overlap and RLS performance warnings.
- [ ] Review unused indexes using query stats and expected workload before removing anything.
- [ ] Enable leaked-password protection after checking auth UX and impact.
- [ ] Verify no service-role/secret key is exposed to browser bundles or logs.
- [ ] Review rate limits, input validation, spam controls and abuse cases on signup, feedback, telemetry, referral and question endpoints.
- [ ] Test email delivery, password reset, push subscription, cron auth and offline sync.
- [ ] Verify backup/restore path and document rollback for app and DB changes.
- [ ] Review error monitoring and alerting; no secrets or unnecessary PII in telemetry.
- [ ] Confirm privacy policy describes telemetry, cookies/storage, analytics and student data handling.

**Exit gate:** no unresolved critical security issue; high-risk advisor findings either remediated or explicitly accepted with evidence; backup/rollback plan exists.

## Phase 4 — SEO and public content readiness (P1)

Owner: SEO board. Dependencies: stable brand and canonical host from Phase 0/1.
- [/] Fix canonical host and audit all metadata, sitemap, robots, IndexNow and JSON-LD. **Mechanical half done (2026-11-25):** `scripts/audit-routes.mjs` now checks host hygiene as well as status/canonical/noindex — it flags a `localhost`/`127.0.0.1` URL in shipped HTML, the stale `mdcatprep-eight` host, and, once the canonical host stops being a `vercel.app` address, any surviving `*.vercel.app` URL (the mixed-host bug that would split indexing after the domain cutover). Verified: live production sweep of 96 sitemap URLs + 13 private routes → **0 problems**, and a 6-case predicate test covering both firing and staying quiet.
- [ ] Build an academy/category/exam route-to-search-intent matrix; consolidate thin/duplicate routes and avoid doorway pages.
- [ ] Improve homepage, exam hub and high-intent guides with accurate, useful content.
- [ ] Create a pillar/cluster content plan with original material and official citations.
- [ ] Add registry/exam pages only where unique verified information supports them.
- [ ] Validate structured data and social previews.
- [x] Verify 404/redirect/noindex/sitemap behaviour. **Done (2026-11-22):** covered by `scripts/audit-routes.mjs` — every sitemap URL must return 200 with a self-canonical and no noindex, and every private route must send noindex. Redirect behaviour is partially covered (fetches follow redirects and report the final status); a dedicated redirect-map check is still worth adding when old routes move.
- [ ] Measure mobile Core Web Vitals and fix significant issues.
- [ ] Prepare Search Console and Bing Webmaster verification for after final canonical/domain decision.
- [ ] Ensure no personal/private routes are indexable.

**Exit gate:** technical SEO audit passes; public pages are accurate, unique and indexable by design; no canonical or sitemap contradictions.

## Phase 5 — Release candidate and “10/10 website” sign-off (P0)

- [ ] All Phase 0–4 exit gates pass.
- [ ] All critical routes tested on desktop and mobile.
- [ ] TypeScript, lint, tests and production build pass.
- [ ] Preview deployment is READY and accessible to intended public testers.
- [ ] No blocking console errors, broken links, broken images, hydration issues or major accessibility failures.
- [ ] Lighthouse/field performance results recorded; do not invent scores.
- [ ] First-time student usability review completed; top issues closed.
- [ ] Privacy, terms, copyright, contact/support and brand consistency reviewed.
- [ ] Admin and student permissions verified with real test accounts.
- [ ] Final release checklist signed off by founder.

**10/10 release gate:** no open P0/P1 tasks; every design scorecard category ≥4.5/5; product correctness and security exit gates pass; public preview works without unexpected auth barriers; build/test/QA evidence attached. Any item without evidence remains open.

## Phase 6 — Domain decision and launch (ONLY AFTER PHASE 5)

<badge>Domain purchase intentionally deferred</badge>

- [ ] Founder approves the final brand and exact domain name.
- [ ] Check availability, renewal price, registrar, ownership and DNS control before buying.
- [ ] Purchase only after explicit founder approval; domain costs are not assumed.
- [ ] Add domain to Vercel and configure DNS/TLS.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin. **Code side is ready (verified 2026-11-25):** canonical, `metadataBase`, OpenGraph URLs, sitemap, IndexNow and `/llms.txt` all derive from `getSiteUrl()`, so switching hosts is this one variable plus a redeploy — no source edit. `app/actions/auth.ts` builds email links from `getSiteUrl()` and `app/auth/callback` routes off the request origin, so auth links follow the domain. Nothing else in shipped code hardcodes a host except the deliberate `lib/site.ts` fallback. Re-run `node scripts/audit-routes.mjs <new-origin>` after the switch: it will fail the moment any page still renders a `vercel.app` URL.
- [ ] Verify redirects from temporary Vercel host to canonical domain and avoid redirect chains.
- [ ] Recheck canonical, sitemap, robots, OG, JSON-LD and IndexNow on the new host.
- [ ] Verify auth callback URLs, email links, OAuth redirect URLs, push service-worker scope and any external integrations.
- [ ] Verify Search Console and Bing Webmaster properties; submit sitemap and request indexing for priority pages.
- [ ] Monitor logs, uptime, conversions, errors and Core Web Vitals after launch.

## Phase 7 — Growth after launch (P2)

- [ ] Publish a steady editorial calendar based on student questions and real search demand.
- [ ] Improve content from Search Console query/page data.
- [ ] Add new exam Prep Spaces only with a quality-controlled, exam-specific Blueprint and real practice experience.
- [ ] Build student ambassador/community loops with consent and abuse safeguards.
- [ ] Improve analytics and experiments only when sample sizes and privacy approach justify them.
- [ ] Reassess monetization only after product quality, trust and engagement gates in `TODO.md` are met; keep public discovery and deliberately selected samples accessible under an explicit policy, but do not promise all preparation is permanently free.

## Current first sprint — ordered execution queue

1. [x] P0: verify public Vercel URL/SSO behaviour and branch mapping.
2. [x] P0: correct stale canonical host; add smoke test to prevent future drift.
3. [x] P0: run and record TypeScript, tests, lint and build baseline.
4. [x] P0: audit MDCAT, NUMS, HEC USAT-M readiness; ingested question banks and automated ingestion deployed.
5. [x] P0: portal sub-test selector implemented for all major exams.
6. [x] P0: NUMS Paper-II Psychological & Aptitude simulator deployed.
7. [x] P0: Mistake Notebook and Free Beta Season Passes deployed.
8. [ ] P1: complete design scorecard and close the highest-impact UX defects.
9. [/] P1: complete route metadata/sitemap/canonical/robots audit by search intent. **Mechanical half done (2026-11-22):** `scripts/audit-routes.mjs` checks every sitemap URL for status, self-canonical, noindex and duplicate titles, and every private route for noindex — 94 URLs + 13 private routes, **0 problems** after fixing six real bugs (three submitted 404s, 19 unsubmitted set pages, five homepage-canonical tags, one unreachable slug, ten crawlable private routes, one missing description). Deliverable and remaining gaps: `docs/ROUTE-INVENTORY.md`. Still open: the *by search intent* half (route → intent matrix, thin/duplicate consolidation) and real `lastModified` dates instead of build time.
10. [ ] P1: triage Supabase security advisors and verify RLS assumptions.
11. [ ] P1: complete privacy, legal, support and brand consistency review.
12. [ ] Hold domain purchase until Phase 5 is signed off.

## 2026-11-08 codebase audit addendum

First-pass source audit completed and recorded in `EXAM-READINESS-AUDIT.md` (audited main head `ba008e54e799db0c6784c8fb07cfa7dc4e91d2fc`). Key blockers before implementation:

1. The four-key registry does not map cleanly to the real test workflows: The 417-question / 100-MCQ bank is the Balochistan/FATA scholarship-test Pre-Medical variant, not standard HEC USAT-M; standard USAT has six categories and a different 75-MCQ + essay pattern. NUST's NET-Engineering mock is already aligned to the official 50/30/20 split, but its portal subject labels are stale; NUST's other NET paper types are not implemented. GIKI/LUMS currently share the NET bank; Navy/AFNS appear as subtests without evidence of dedicated experiences.
2. `lib/questions-repo.ts` reads all published Supabase questions by status/subject and its fill path tops up from the global pool. It ignores the existing `college` text field and there is no stable exam ownership field. Generic practice/mixed mocks can therefore mix unrelated pools.
3. Attempts, bookmarks, analytics, notes and flashcard reviews are not partitioned by exam/goal. `profiles.exam_target` is one free-text signup value; the current family choices are browser localStorage, not account-synced multi-goal records.
4. The login gate is global manual approval, not a purchased exam entitlement. No entitlement/order/pass schema was found in checked-in migrations. Public `/portal/[exam]` still says “Free forever” and “100% free … Ever”, which contradicts the approved pricing-ready direction.
5. GitHub `main` is 14 commits ahead of `master`; `AGENTS.md` still says master is default, while the current production guidance points to main. Resolve branch policy before deployment operations.
6. PMA's dedicated practice page keeps answer/score state in React state; shared practice sessions and the mock player have the attempt-recording call sites. NUST/USAT standalone persistence requires a separate complete trace.

**Next execution order:** (a) draft the stable exam taxonomy/Preparation Blueprint, (b) draft the exam-scoped data and entitlement model with migration/RLS tests only, (c) define a safe historical-data compatibility plan, (d) prove MDCAT and PMA as contrasting Prep Spaces, then (e) add USAT-M. Do not alter production data or payment settings during this design stage. Local typecheck/lint/tests/build and authenticated browser QA were not run in this static audit.

## Change log

- 2026-11-08 — Initial boards created after repository, Vercel deployment context and active Supabase project inspection. Key blockers recorded: stale canonical hostname, Vercel SSO protection, brand naming inconsistency, and Supabase advisor findings. No code, database, deployment settings or domain settings changed.

## Agent operating checklist

Before starting a task:
1. Read `AGENTS.md`, `TODO.md`, this board and the specialist board.
2. Check the current Git branch/head and whether another agent owns the same tree.
3. Inspect existing code and tests; don't assume an item is missing because an older TODO says so.
4. State scope and acceptance criteria; keep edits minimal.

Before marking done:
1. Run `npx tsc --noEmit`.
2. Run lint on touched files (and full lint if practical).
3. Run `npm test` and `npm run build`.
4. Test relevant routes at desktop and 360/390/768 widths.
5. Inspect logs and verify no secrets/PII leak.
6. Append evidence to `IMPROVEMENT_LOG.md`.
7. Stage explicit paths and create one why-focused commit.
8. Update this board and the specialist board together when task state changes.

Never deploy to production, change live database state, alter access controls, buy a domain or add paid services without the required explicit approval.


## Portal architecture decision record

### Initial codebase finding (verified by reading `lib/exams-config.ts` on 2026-11-08)

- The current top-level registry is `mdcat`, `pma`, `nust`, `usat`.
- Medical config groups UHS MDCAT, NUMS MDCAT/AMC, USAT-M, Balochistan and FATA/KPK pathways under one medical bank.
- Engineering config groups NUST NET, GIKI, LUMS SBASSE and USAT-E under the NUST bank.
- The standalone USAT config lists Arts and Commerce variants; USAT-M and USAT-E are nested under other portals.
- This is an architecture/clarity risk to investigate, not proof that the learning engines are incorrect. Before changing routes or data models, inspect all route handlers, bank selectors, mock settings, progress persistence and current student records.


**Decision:** one academy, multiple dedicated exam portals, shared platform underneath.

**Student-facing hierarchy:** Academy homepage → category hub → dedicated exam portal → exam-scoped learning workflow.

**Shared services:** account/authentication, design system, accessibility primitives, question-delivery infrastructure, mock-test engine, progress persistence, analytics/privacy controls and admin tooling.

**Must remain exam-scoped:** syllabus and topic map, question pools, official-pattern rules, mock configuration, guidance, notes/resources, portal navigation and progress interpretation. Reuse a common engine only when its configuration is explicit and testable.

**Multi-exam students:** one account can hold more than one goal; onboarding and dashboard must show the active exam and make switching clear. Avoid forcing a student to choose only one forever.

**Release policy:** a category or exam may be visible as “coming soon” or “content in progress” only with honest wording. Do not advertise a full preparation portal until its core workflow and content have passed review.

**Brand direction to validate:** Apex Pakistan as parent academy; MED Prep may remain the medical vertical name if it improves recognition. This is a recommended direction, not permission to rename live surfaces or buy a domain. Final brand lock requires explicit founder approval.


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


## Pricing/access audit priority — 2026-11-08

The audit found permanent-free claims on the homepage, signup, portal, FAQ, resource/notes pages and `/llms.txt`. More importantly, `app/pricing/page.tsx` presents five Rs. 0 passes including a lifetime all-access plan; its “checkout” only changes React state and its success message claims activation without creating a grant. Treat this as a P0 trust issue. Before any paid launch, replace the fake local-only activation with a truthful access/pricing page, remove permanent-free promises, and define free public samples versus entitlement-protected full preparation. Do not add payment processing until the entitlement design and provider are approved.


## Data-boundary design handoff — 2026-11-08

`EXAM-DATA-BOUNDARY-DESIGN.md` now defines the conceptual goal/entitlement/content-map model, RLS requirements, legacy data handling and adversarial test cases. This is design-only: no migration SQL was created or applied, no Supabase project was queried or changed in this step, and no production data/access policy was touched. Next technical prerequisite is a read-only live-schema/RLS drift comparison, then disposable staging tests. Read the Supabase skill and current Supabase docs before implementing any schema/auth/RLS work.


## P0 content delivery and progress findings — 2026-11-08

The extended audit found two launch-blocking defects for a paid Prep Space model:

1. `questions` is empty in the active Supabase project. `recordAttemptByQuestionKey` resolves bundled question keys against `questions` (then falls back to question_text); neither lookup can succeed with zero rows. `PracticeSession`/`MockTestPlayer` suppress the resulting errors, so bundled-bank answers appear to work but are not durably recorded. Standalone PMA/NUST/USAT practice also keeps answers in local React state. Persistent analytics must not be advertised until this path is fixed and verified.
2. `/usat/practice`, `/nust/practice`, and `/pma/practice` are public client components importing full question banks directly. The entire bank, answer keys and explanations are shipped to the browser. This is compatible with today's free/public practice but cannot support future exam-specific paid access. Full banks must move to a server-controlled content source; only intentionally selected samples may remain public/client-shipped.

The only discovered seed script is `scripts/seed-mdcat-questions.mjs`; it seeds MDCAT only, uses a service-role key, and does not attach product/exam/variant mappings. Its old comment about a shared database is stale: the founder has confirmed that Supabase `edweb` is dedicated to Apex Pakistan. **Do not run this legacy script against production yet.** Upgrade it into a reviewed, idempotent Apex ingestion path and test it away from production first. The exact evidence and design are in `EXAM-READINESS-AUDIT.md` and `EXAM-DATA-BOUNDARY-DESIGN.md`.


## PMDC-2026 mock correction — 2026-11-08

Official PMDC's 2026 public notice now provides the exact paper profile: 180 MCQs, 3 hours, no negative marking; Biology 81, Chemistry 45, Physics 36, English 9 and Logical Reasoning 9. The repository's current “MDCAT-Weighted Full Mock” is 100 questions (34/24/30/12), omits Logical Reasoning and is not the official full-paper structure. Its generic server-side draw also uses the currently empty questions table and returns no questions. Do not market it as a full PMDC mock. A real full mock is blocked on canonical server-side content ingestion, official subject mapping and persistence verification. See `EXAM-READINESS-AUDIT.md` and `EXAM-REGISTRY-PROPOSAL.md`.


## 2026-11-09 — Wave 2 implementation queue

- [x] Remove the synthetic demo-activity cron from the production schedule; fail closed unless `CRON_SECRET` is configured.
- [x] Require Meta webhook configuration and HMAC verification before WhatsApp POST processing; add signature unit tests.
- [x] Remove stale inherited-site branding from Apex source and remove the unused foreign-site footer; retain local IndexedDB name to preserve offline data.
- [x] Clarify PMA/ISSB belongs to Apex; cadet-college admissions and content are out of scope.
- [x] GitHub Actions tests/lint/typecheck passed and final Vercel preview is READY at `6dfc8a32`.
- [ ] Public unauthenticated browser smoke for `https://edweb-nine.vercel.app` remains outstanding; desktop/mobile browser smoke is also pending.


## 2026-11-09 — Wave 3 status

- [x] Extend server-side attempt idempotency to bundled question keys; reject idempotency-key reuse across different question/answer pairs.
- [x] Support bundled question keys in the offline outbox and sync drain.
- [x] Retain attempts when canonical question content has not yet been ingested.
- [x] Fix offline queue lease expiry to use last claim time.
- [x] Remove silent attempt-save error suppression from PracticeSession and MockTestPlayer.
- [x] GitHub Actions run `42526582743` passed tests, lint and typecheck.
- [ ] Verify latest Vercel preview at commit `8257c42` reaches READY.
- [ ] Add an integration test against a non-production Supabase project for idempotency, RLS and offline replay.
- [ ] Design and validate the exam registry + canonical content migration before any production DDL or question import.


## 2026-11-09 — Wave 4 registry foundation

- [x] Draft migration for exam registry, official variants, assessment profiles, student goals and internal question mapping.
- [x] Enable RLS on all new public-schema tables; public catalogue reads are active-only; goal access is owner-scoped; question mappings remain internal-only.
- [x] Enforce exam/variant consistency with composite foreign keys.
- [x] Validate exact migration SQL in a rollback-only transaction against Apex `edweb`; verify all new tables remain absent afterward.
- [ ] Review migration and test on a non-production Supabase project before applying to production.
- [ ] Add catalogue seed data only after exam blueprint readiness and official source review.
- [ ] Implement goal-aware server actions, then add scoped progress columns without guessing legacy ownership.
- [ ] Build reviewed question ingestion and entitlement-aware delivery; do not seed the current incomplete MDCAT bank as published.


---

## 2026-11-20 — Wave 0 live-state audit and sequential execution reset

**Audit scope:** GitHub repository/PR stack, active Vercel project and deployments, active Apex Supabase project, public schema/migration history, RLS policies/advisors, current roadmap/agent-board claims and Med readiness. Read-only infrastructure inspection only. No production app changes, DB writes, migrations, settings changes, merges, domain actions or deployment promotion were made.

### Verified live infrastructure

- GitHub repository: `agma668/mdcatprep`; default branch `main`. Production Vercel project: `edweb`, linked to this repository.
- Vercel production deployment is READY on `main` at `1f54c344418e5fd6e45c1d4ca8c2102772c9eaba`; production aliases include `edweb-nine.vercel.app`.
- Latest inspected preview is READY on `apex/prepspace-foundation` at `fc8f7c714007669cd5687f892f6a9e86dd7ae776`. It is a preview, not production.
- The editorial landing PR #17 remains open and draft, based on draft PR #16; PR #16 is based on `apex/design-prep-space-discovery`. The PR stack must be reviewed and tested in dependency order; do not merge an upper PR independently. PR #17 has successful Vercel status checks, but this is not proof that typecheck, lint, unit tests or browser QA passed.
- The connected Apex Supabase project is `edweb` (`niiskuwlpccmdtwjoxvm`), ACTIVE_HEALTHY. The separate inactive `CAT` project is not the Apex backend and remains out of scope.

### Supabase schema and actual content state (read-only)

- Live migration history contains **28 migrations** through `20261113000000_prep_space_catalogue_seed`.
- The public schema contains **24 tables**; RLS is enabled on all 24.
- The live schema now includes `exam_registry` (9 rows), `exam_variants` (9 rows), `assessment_profiles`, `student_goals`, and `question_exam_map`. This supersedes older board notes that said these tables/migrations were not yet present.
- Live row counts at audit time: `questions` 0; published questions 0; `student_goals` 0; `question_attempts` 0; `flashcard_reviews` 0; `notes` 0. `profiles` has 2 rows and `client_telemetry` has 75 rows.
- Therefore the registry/schema foundation exists, but **canonical question ingestion and durable student learning activity are not verified as live**. A roadmap entry saying “automated ingestion deployed” must not be interpreted as proof that production `public.questions` is populated. Static/bundled question banks and a deployed ingest script are not the same as canonical, exam-mapped, reviewed database content.
- Existing `question_attempts`, `question_bookmarks`, `flashcard_reviews`, `mistake_reviews` and related tables have goal-related columns/links in the current schema, but the actual end-to-end goal-scoped student journey still needs integration tests with real, reviewed question rows.
- The public `questions` SELECT policy currently checks `status = 'published'` but has no exam/variant predicate. Do not expose more than one exam's bank through this shared pool until server-side exam mapping and authorization are enforced. `question_exam_map` has RLS enabled and no client policy, consistent with an internal-only map until a trusted delivery action is implemented. `client_telemetry` also has RLS enabled with no policy; verify the intended server/service-role write path and ensure no client insert is required.

### Supabase advisor triage — findings, not authorization to change production

- Security: 2 RLS-enabled tables with no policies (`client_telemetry`, `question_exam_map`); 3 `SECURITY DEFINER` functions callable by anon/authenticated (`count_referral_on_signup`, `generate_referral_code`, `handle_new_user`); leaked-password protection disabled.
- Performance: 19 unindexed foreign keys; 37 auth/RLS init-plan warnings; 36 unused-index notices; 1 table with multiple permissive SELECT policies (`notes`).
- Health advisor returned no lints.
- Triage each item against actual call sites and expected workload. Do not blindly revoke RPC grants, add broad policies, or drop “unused” indexes. In particular, inspect function callers/triggers and the server-side telemetry flow before proposing a migration or Auth setting change.

### Codebase and product truth

- `lib/prep-space-registry.ts` is the canonical nine-path catalogue. Medical has PMDC MDCAT (beta) and NUMS (content in progress); the registry correctly warns against treating a scaled PMDC mock as an official full paper.
- `lib/seo-pages.ts`, `app/sitemap.ts` and `app/robots.ts` provide an existing SEO foundation. Extend the single SEO page registry; do not create a second sitemap/IndexNow list.
- Main branch still identifies the site as **MED Prep** in `lib/site.ts` and `app/layout.tsx`. The current main homepage is a broad multi-exam landing page, not yet the approved Apex Academy parent chooser. The current draft landing PR changes design/path discovery but does not complete the parent + specialist brand architecture.
- `package.json` includes tests for FSRS, flashcards, mistake classification, quiz blueprints, question-bank structural audit, Prep Space registry and RLS goals. Existing tests are useful, but passing unit tests alone do not prove the hosted Supabase integration works.
- The current roadmap/queue correctly warns not to run `scripts/seed-mdcat-questions.mjs`: it uses a service-role key, publishes immediately, handles only the MDCAT bank and does not create exam/variant mappings. Build a new idempotent, dry-run-first importer with target allowlisting, draft/review state, provenance and explicit mapping. No import is authorized by this audit.

### Board hygiene corrections

- Reconcile older statements of 22 migrations / 13 public tables / absent goal tables with the current live count of 28 migrations / 24 tables / present registry and goal tables.
- Keep “feature code exists”, “preview deployed”, “database seeded”, “end-to-end tested” and “production released” as separate statuses.
- The GitHub integration available to this audit exposes repository files, issues and PRs, but no GitHub Projects v2 board mutation tools. This Markdown master board and issue #18 are the supported coordination records; do not claim a Projects board was changed.

## Sequential implementation plan — one wave at a time

### Wave 0 — Repository and infrastructure audit
**Status: audit pass completed; a few evidence checks remain.**
- [x] Confirm repository, production/preview deployment relationship and active Apex Supabase project.
- [x] Inspect current PR stack and verify #16/#17 are still drafts.
- [x] Inspect live schema, migrations, row counts, key RLS policies and Supabase advisors.
- [x] Reconcile current exam registry and SEO foundation with the roadmap.
- [ ] Finish local/CI baseline on the exact intended release branch: typecheck, lint, all tests and production build.
- [ ] Verify public production and protected preview access in a clean browser; inspect core routes at mobile and desktop.
- [ ] Choose one canonical integration branch and document the merge order for stacked PRs.
**Exit gate:** known branch strategy, reproducible quality baseline, verified public/preview access and no ambiguous production-vs-preview claims.

### Wave 1 — Stabilize shared foundation
- Complete Prep Space goal ownership and RLS regression coverage against the current live schema using local/disposable test data.
- Review the current migrations against the live 28-migration history; identify drift and missing integration, without applying any production migration.
- Define the trusted server-side question-delivery boundary: user → owned goal → active exam/variant → approved question mapping → permitted content.
- Resolve the shared `questions` table's exam-scope gap before importing or exposing multiple exam pools.
- Review SECURITY DEFINER grants, telemetry policy design, leaked-password protection, notes policy overlap and RLS performance. Produce a risk-ranked change plan first.
- Establish CI checks and a repeatable local verification script.
**Exit gate:** goal ownership and exam isolation proven by tests; no unresolved critical security finding; no production schema mutation without separate approval.

### Wave 2 — Apex public architecture, with Med as the first specialist destination
- Preserve one platform, one account system and one canonical domain.
- Build `/` as the Apex Academy goal chooser and `/med/` as the first complete specialist mini-funnel.
- Keep engineering and defence discovery visible as honest “in progress/coming soon” destinations; do not build their full learning engines in this wave.
- Route MDCAT/medical-intent searches to Apex Med; generic Apex Academy searches to the parent chooser.
- Use unique route metadata, canonical URLs, structured data where valid, internal links and the existing single SEO registry.
- Preserve existing routes as aliases until redirects and student journeys are tested.
**Exit gate:** clear parent-vs-Med positioning, crawlable unique pages, accurate readiness claims, responsive/light-dark QA.

### Wave 3 — Med content and canonical question pipeline
- Audit bundled MDCAT content for stable keys, duplicates, answer labels, explanations, subject/topic mapping, provenance and academic correctness.
- Verify PMDC MDCAT blueprint/version from current official sources; keep NUMS a separate exam and blueprint.
- Produce a reviewed content manifest before import. Distinguish authentic past-paper items from original practice questions.
- Build a new idempotent dry-run-first importer; target only the confirmed Apex Supabase project, require explicit target allowlisting, import as draft/review state and log rejects.
- Create explicit exam/variant/syllabus mappings and editorial approval before publishing.
- Test imported counts against the manifest and prove no cross-exam leakage.
**Exit gate:** reviewed PMDC bank is mapped, auditable, correctly counted and safely queryable; NUMS is not represented as ready until its own content/blueprint gate passes.

### Wave 4 — Med learning loop and durable progress
Deliver in dependency order:
1. Server-delivered goal-scoped QBank and custom practice (filters, self-test/review, explanations, confidence and timing).
2. Durable attempts, bookmarks and retry/idempotency; refresh and offline reconnect must not lose or duplicate work.
3. Mistake notebook (wrong/guessed/slow/flagged), targeted retries and demonstrated mastery rechecks.
4. Flashcards/FSRS with source provenance, goal-scoped decks/reviews and daily workload controls.
5. Diagnostic and editable study planner based on verified syllabus topics and real student activity.
6. PMDC-accurate scaled/full mock only when the verified content pool and blueprint support it; NUMS mock separately after its own readiness review.
7. Analytics derived only from persisted attempts; show insufficient data honestly.
**Exit gate:** end-to-end student journey works across sign-in, goal selection, practice, explanation, saved mistake/card, refresh, analytics and mobile.

### Wave 5 — Med release hardening
- Accessibility, low-bandwidth performance, offline sync, privacy, error states and admin/editorial workflows.
- Validate every displayed count, exam claim, answer key and paper provenance.
- Run full typecheck, lint, tests, build, RLS tests and desktop/mobile smoke checks on the release candidate.
- Promote only after founder review and explicit approval.
**Exit gate:** Med is genuinely useful and trustworthy, not merely visually complete.

### Wave 6 — Apex Engineering
Only after Med release gate: establish independent NUST/GIKI/LUMS/ECAT exam identities and verified blueprints, content mappings and exam-specific practice. Do not relabel NUST questions as GIKI or LUMS content.

### Wave 7 — Apex Defence
Only after Engineering gate: build the safe, age-appropriate PMA/ISSB preparation journeys with accurate selection-process guidance and separate aptitude/content readiness. Do not imply official affiliation or guarantee selection.

### Wave 8 — Growth and continuous improvement
Only after the specialist products are genuinely ready: publish source-backed guides, exam updates, analytics, search monitoring, content review cadence and performance improvements. Expand only where demand and verified content justify it.

## Operating rule for every wave

One active wave, one accountable implementation owner and one defined file/database scope at a time. No overlapping agent edits to the same code tree. Each task moves **Ready → In Progress → Review → Testing → Done** only when evidence exists. A preview marked READY is not a production release; a merged PR is not proof of a working feature; a deployed ingestion script is not proof of populated, reviewed database content. No production database, auth, billing, domain or deployment-promotion action without task-specific approval.


---

## 2026-11-20 — Wave 1 investigation update

**Status: investigation and task decomposition completed; implementation and executable test gates still pending.** No application code, production data, production database schema, Auth settings, branch merges or deployment promotions were changed during this pass.

### 1. Branch and PR integration findings

- `main` is at `1f54c344418e5fd6e45c1d4ca8c2102772c9eaba`; `apex/prepspace-foundation` now contains the Wave 0 board update at `734734934e9114f403d39fb7c6e04a52bcc85892`.
- GitHub compare reports the foundation branch and `main` have diverged: **3 commits ahead and 3 behind**, with merge base `15fa25b4326f31c66b6872882fcfc478d950dee6`. Do not force-push or merge this blindly. First inspect the three main-side commits and resolve the shared RLS test file deliberately.
- The landing PR stack is separate from the foundation branch:
  - PR #16: `apex/design-pathway-landing-onboarding` → `apex/design-prep-space-discovery`.
  - PR #17: `apex/design-editorial-landing` → `apex/design-pathway-landing-onboarding`.
- PR #16 and #17 remain open drafts. No submitted PR reviews were found. Their descriptions explicitly say local typecheck/lint/tests/build/browser checks have not run.
- `.github/workflows/quality.yml` exists on main, foundation and the PR #16 base branch, but filters both `pull_request` and `push` to `main`. The stacked PRs target feature branches, so the normal GitHub Actions quality job is not triggered for them. The latest inspected commits had no GitHub Actions workflow runs; Vercel deployment status is green but does not prove unit tests, lint or TypeScript passed.
- Created issue **#19** to correct the stacked-PR quality-gate workflow and prove it runs.

### 2. Student-goal foundation — useful code exists, runtime integration is incomplete

- The live DB has the goal-related tables and columns from the migrations through Nov 13. `question_attempts.goal_id`, `question_bookmarks.goal_id` and `flashcard_reviews.goal_id` exist and remain nullable for legacy rows.
- The Nov 14 follow-up migration `20261114000000_student_goals_ownership_and_primary_fix.sql` is present on the foundation branch but **is not applied to live Supabase**. It adds composite ownership FKs for `mistake_reviews`, `review_flashcards` and `flashcard_decks`, and adjusts the narrowly scoped `set_primary_goal` RPC. Keep it a draft until the local PGlite suite is executed and reviewed.
- `scripts/rls-goals.test.mjs` is extensive: it exercises goal ownership, duplicate active goals, primary switching, inactive variants, student access to catalogue/mappings, goal-scoped progress references, cross-student references on older progress tables, deletion detachment and legacy no-backfill behavior. This is promising test coverage, **not a passing test result**; the suite was inspected but not executed in this environment.
- Existing goal server actions derive the student from the authenticated session and update only permitted lifecycle/date fields. The DB column grants and RLS provide another ownership boundary.
- Existing code and live schema must be kept in sync: inspect migrations 9–14 in order and test them against a clean database before any production application.

### 3. Critical exam-isolation gap in the question runtime

Code inspection shows that the catalogue is not yet the authority for question delivery:

- `lib/questions-repo.ts` reads `questions` with only `status = 'published'`; it does not join/filter `question_exam_map`.
- `lib/analytics/question-scheduler.ts` draws from that same general published pool and scores by attempt history, subject/topic and difficulty. It does not resolve an owned student goal.
- Live RLS on `questions` has a SELECT policy named `Students can read published questions.` There is no exam/variant condition in that policy. `question_exam_map` has RLS enabled and no student policy/grant, which is a useful deny-by-default boundary, but no trusted server-side delivery path was found using it.
- `app/actions/practice.ts` derives the student from the session and computes correctness server-side, but it accepts only question ID/answer/timing/idempotency key. It does not validate or persist a goal ID into `question_attempts.goal_id`.
- `lib/offline-sync.ts` calls the same goal-unaware recording actions, so goal identity is not carried through offline retries.
- The bundled `/practice/session` route chooses MDCAT vs USAT from a URL parameter and loads bundled banks; it does not resolve an owned goal. The dashboard adaptive quiz reads the general published DB pool.
- The live `questions` table has 0 rows and 0 published rows. This is not yet an active cross-exam data leak, but the current path must be fixed before any canonical bank is imported or published.
- Initial question payloads currently include `correct_answer` in the shared question model and some client player props. Review answer-key exposure as part of the delivery redesign; ideally reveal correctness/explanation only after server-validated submission for protected content.
- Created issue **#20** with the required server-side goal-scoped delivery, exam/variant mapping, attempt persistence, offline idempotency and negative-test acceptance criteria.

### 4. Supabase SECURITY DEFINER follow-up

A live read-only catalog query confirmed three trigger functions are SECURITY DEFINER, owned by postgres, configured with mutable `search_path=public`, and EXECUTE is granted to PUBLIC/anon/authenticated:
- `handle_new_user` → `on_auth_user_created`
- `generate_referral_code` → `on_profile_create_referral`
- `count_referral_on_signup` → `on_referral_attributed`

They are attached to the expected triggers and their bodies use schema-qualified `public.profiles`. Do not blindly revoke grants or change behavior: test trigger invocation and direct execution separately. The Auth advisor also reports leaked-password protection disabled. Created issue **#21** to test least-privilege grants, pin safe search paths, add signup/referral regression tests and evaluate the Auth setting. No Auth setting was changed.

### 5. Wave 1 task queue and exit gate

1. **Branch integration:** inspect main-side commits since the merge base and reconcile foundation changes without force-push; choose the canonical integration branch.
2. **CI:** fix issue #19 on the actual PR base branches; prove #16/#17 receive GitHub Actions runs.
3. **Executable baseline:** run `npm ci`, `npm test`, `npm run lint`, `npx tsc --noEmit`, and a production build on the canonical branch; record exact outputs. Do not claim these passed until run.
4. **Goal/RLS:** execute the PGlite suite from a clean checkout; review migration 14 and cross-student composite FKs. No live migration without explicit approval.
5. **Security:** complete issue #21's disposable-environment regression tests and document a production change plan.
6. **Question delivery:** implement issue #20 only after the integration baseline is stable. The delivery action must validate the authenticated owner, active goal, active exam/variant, approved mapping, published question and entitlement; attempt writes and offline retries must preserve the server-verified goal ID.
7. **Content gate:** only after all above pass may Wave 3 begin reviewed MDCAT content ingestion.

**Wave 1 exit criteria:** clean reproducible quality baseline; no unresolved critical ownership/exam-isolation defect; goal-scoped attempts work online/offline; security changes tested; founder approval for any production DB/Auth change. A green Vercel preview alone does not satisfy this gate.


### Wave 1 live execution — CI workflow fix opened

- Converted tracking issue #19 into draft PR **#19**: [Run quality gates for all pull requests](https://github.com/agma668/mdcatprep/pull/19).
- The proposed workflow removes the `pull_request: branches: [main]` restriction while keeping push checks on `main`. It retains read-only permissions, pinned GitHub Actions versions, Node 24, `npm ci`, unit tests, ESLint and TypeScript checks.
- GitHub Actions run **#43** has started on commit `0fd91f554ed99183927aee55df08126a8ef29f49`; checkout and Node setup completed, dependency installation was in progress at last inspection. No test/lint/typecheck result is claimed yet.
- The Vercel preview for this workflow-only branch was also still building at last inspection.
- Important: PR #19 must be merged before main contains this change. PR #16/#17 have feature branches as their base targets, so the same workflow update must then be present in those target branches (or brought in by a controlled sync) before their own GitHub Actions runs can be expected. Do not mark #16/#17 ready based on PR #19's checks.


## Wave 1 CI follow-up — 2026-11-20

- [ ] PR #19 quality workflow is **not passing**. GitHub Actions run #43 completed with failure: 73 tests passed, and `scripts/rls-goals.test.mjs` failed at startup because `20261114000000_student_goals_ownership_and_primary_fix.sql` was absent from the PR's `main` checkout. ESLint and TypeScript steps were skipped after the test failure. Run: https://github.com/agma668/mdcatprep/actions/runs/44783767745
- [x] Confirmed the migration exists on `apex/prepspace-foundation` but not on `main`; the existing RLS test already references it. This is a repository/branch dependency gap, not evidence of a production database failure.
- [x] Opened draft PR #22 to add the already-authored migration to `main` so the RLS test can execute against the migration it expects: https://github.com/agma668/mdcatprep/pull/22
- [ ] PR #22 must pass the RLS suite and receive review before merge. Merging the SQL file into GitHub does **not** apply it to Supabase. Do not apply it to production without separate explicit approval.
- [ ] After #22 is validated, rerun/recheck #19; only then assess lint and TypeScript gates. Do not mark #19 ready or merge based on Vercel preview status.
- [ ] PR #16/#17 still need their own visible GitHub Actions runs after the workflow is available in their target branches. Preserve their stacked dependency order.
- No production DB schema/data, Auth settings, merges, or production promotions were changed in this follow-up.


### Latest check — 2026-11-20 17:33 UTC

- PR #22 now has a GitHub Actions run: https://github.com/agma668/mdcatprep/actions/runs/44784298082
- At last poll, dependency installation was still running; the RLS test, ESLint and TypeScript checks had not started. No pass/fail result is claimed yet.


## Wave 1 — CI gate result and Issue #20 implementation discovery (2026-11-20)

### CI verification
- [x] PR #22 quality run #44 completed successfully: `npm ci`, `npm test`, `npm run lint`, and `npx tsc --noEmit` all completed successfully. Run: https://github.com/agma668/mdcatprep/actions/runs/44784298082
- [ ] PR #22 remains draft and unmerged; no production migration has been applied. No human review is recorded yet.
- [ ] PR #19's earlier run #43 remains failed on its own commit because the referenced migration was absent from that checkout. The successful #22 run validates the migration-inclusive commit, but does not retroactively make #19 green. Re-run #19 after its branch includes the migration.
- [ ] PR #16/#17 still need their own visible Actions runs and must retain stacked merge order.

### Issue #20 — implementation discovery
- [x] Confirmed the catalogue migration creates `question_exam_map`, with `review_state`, `access_level`, and exact `variant_id` / `exam_id` mapping; the student-facing roles are deliberately denied direct mapping-table access.
- [x] Confirmed a server-only service-role client helper already exists at `lib/supabase/service.ts`; any mapping lookup must remain server-side after validating the caller's owned active goal through the cookie-bound RLS client.
- [x] Confirmed `fetchPublishedQuestions` has seven callers and the answer recorder/offline queue is shared by multiple surfaces. Avoid a global rewrite that silently breaks unrelated legacy/bundled practice flows.
- [x] No entitlement/subscription authorization service was found in the code search. Until one is implemented and verified, `goal_access` mappings must fail closed; only explicitly approved `public_sample` mappings can be delivered.
- [ ] Implementation sequence: (1) goal resolver + exact-variant approved-map query using service client; (2) scoped question delivery and remove answer keys from initial payload; (3) validate goal/question mapping on answer submission and persist goal_id; (4) carry goal identity through IndexedDB queue and retry; (5) adapt adaptive scheduler and dashboard/mock/diagnostic entry points; (6) add cross-user/cross-variant/pending/rejected/unpublished/idempotency tests.
- [ ] Do not import/publish questions or apply migrations until the complete delivery boundary and tests are reviewed.

### Gate
Wave 1 remains active. The successful PR #22 run is a green test result on that branch only; integration is not complete until the owner approves the required PR merges and the dependent branches are rechecked. No merges, production database changes, Auth changes, or content imports were made.


## Wave 1 — question-runtime source review (2026-11-20, follow-up)

A fresh source review on `main` confirms the previously identified issue is present in the actual call paths, not just a design concern:

- `lib/questions-repo.ts`: `fetchPublishedQuestions` selects `correct_answer` and `explanation` from `questions`, filters only `status = 'published'`, and is also used by `fillQuestions` / `fetchSubjectQuota`. A goal-scoped API must be a distinct server-only seam; changing this shared helper in place would silently alter several legacy and bundled callers.
- `lib/analytics/question-scheduler.ts`: `fetchAdaptiveQuestions(userId, ...)` trusts the supplied userId for history filtering and draws from the general published pool. It needs a goal-aware server entry point whose user identity is derived from the session, not the argument.
- `app/actions/practice.ts`: both `recordAttempt` and `recordAttemptByQuestionKey` resolve any published question and call a shared insert that writes `student_id` but no `goal_id`. Correctness is server-computed, which should be preserved. The new goal-scoped action must independently validate the question mapping before computing/recording the answer.
- `lib/offline-sync.ts`: online send, offline enqueue and drain currently preserve question identity + attempt id only. A new goal-aware queue entry needs an immutable goal ID captured from the verified practice session and the server must re-resolve ownership on every retry; a client-supplied goal ID is a selector, never authority.
- `lib/supabase/service.ts`: a server-only service client exists, but it bypasses RLS and throws if the service secret is absent. Use it only after cookie-session authentication and owner-scoped goal validation; missing service credentials must fail closed.
- `supabase/migrations/20261109000000_exam_registry_and_student_goals.sql`: the checked-in mapping schema has exact `exam_id` + `variant_id`, `review_state`, and `access_level`; mapping table is intentionally unavailable to student Data API roles. Goal rows use `student_id`, `exam_id`, `variant_id`, and `status`.
- `supabase/migrations/20261112000000_student_goals_foundation.sql`: goal references are nullable by design for legacy progress. Do not backfill old activity or make goal_id required globally.

### Implementation guardrails confirmed

1. Build a new server-only goal-scoped delivery seam; do not widen direct student access to `question_exam_map` and do not globally change `fetchPublishedQuestions` until all seven callers are migrated deliberately.
2. First query the caller's active goal through the cookie-bound Supabase client and verify `student_id = auth.uid()`. Then use the service client to fetch only approved mappings for that exact variant and published question rows.
3. Since no entitlement authorization service is implemented, fail closed for `goal_access`; only an explicitly approved `public_sample` mapping can pass in the first implementation. Never treat goal ownership as a paid-content entitlement.
4. Return a student-safe question DTO without `correct_answer`; reveal the stored answer and explanation only after a valid submission action has rechecked goal ownership, active exam/variant, mapping review state, access level and question publication state.
5. Attempt writes must include the verified `goal_id` and session-derived `student_id`; preserve server-computed correctness, clamped timing and the existing idempotency key semantics.
6. Offline retries must revalidate the same goal and mapping server-side. If the goal is paused/archived or access is revoked before drain, do not record the attempt under a different/current goal.
7. Keep bundled legacy practice paths isolated until they have explicit exam identity and a migration plan; do not infer their goal from URL parameters or profile.exam_target.

### Current disposition

This pass was read-only source inspection plus documentation. No application code, branch refs, PR state, migrations, production data, Auth settings or deployments were changed. Implementation remains gated on controlled integration of the CI/RLS migration PRs and an executable baseline. PR #22 remains unmerged pending the founder's previously requested approval; the user has not yet explicitly authorized that merge.


## Wave 1 implementation slice — PR #23 (2026-11-21)

Created draft PR #23: https://github.com/agma668/mdcatprep/pull/23
Branch: `feat/goal-scoped-public-sample-delivery`, based on `main`.

Files added/updated:
- `lib/goal-question-delivery.ts`: server-only boundary. Resolves the caller with the cookie-bound session, verifies an owned active goal, verifies the exam and variant are still active using the service client, then reads exact exam+variant mappings. Only `review_state=approved` + `access_level=public_sample` + published question rows are returned. Missing service credentials, query errors, or invalid goal all fail closed. The initial DTO is an explicit allow-list without answer key/explanation.
- `lib/goal-question-policy.ts`: pure exact-scope/access policy and safe DTO conversion.
- `lib/goal-question-policy.test.ts`: tests exact goal/variant, inactive goal, pending mapping, goal_access/admin_draft denial and answer/explanation non-disclosure.
- `package.json`: includes the new policy test in `npm test`.

Important limits:
- This is an isolated delivery seam, not yet wired into existing practice routes/actions.
- No entitlement service exists, so all `goal_access` mappings are denied; only intentionally reviewed public samples are eligible.
- The separate answer lookup is server-only and revalidates goal/mapping; a follow-up authenticated submission action must validate the selected answer and write goal_id once the required migration is integrated.
- Legacy `fetchPublishedQuestions` and bundled question flows were intentionally not changed, to avoid silently altering seven existing callers.
- No production database, content, Auth settings or deployments changed.

Validation status: PR opened as draft; no workflow run was returned for its head SHA at the time of this board update. CI, lint and typecheck remain pending. The main-branch RLS-goals test currently depends on the ownership migration proposed in PR #22, which remains unmerged pending explicit founder approval.

## 2026-11-28 — Medical competitor audit actions (new queue)

**Audit trigger:** Founder requested a ruthless medical/MDCAT competitor audit. The public domain `https://apexpakistan.com` was observed redirecting to a GoDaddy domain-for-sale page during the audit. This is a critical release blocker to investigate, not yet proof that every visitor or crawler sees the same result. Existing board history separately identifies `https://edweb-nine.vercel.app` as the verified public deployment alias. Resolve domain/DNS/registrar/Vercel ownership and redirects before any further growth work; do not buy, transfer, attach or change a domain without founder approval.

### P0 — Verify production availability and domain routing
- [ ] Re-test apexpakistan.com and www.apexpakistan.com from clean unauthenticated sessions; record HTTP status, redirect chain, DNS answers and timestamp.
- [ ] Inspect registrar/domain status and DNS records; determine why the apex domain resolves to a GoDaddy sale page. Do not make registrar purchases or destructive DNS changes.
- [ ] Inspect Vercel project/domain assignments and redirect configuration; confirm the correct Apex project is `agma668/mdcatprep` / `edweb`, not another project.
- [ ] Confirm the temporary production alias remains publicly accessible and all public routes, assets, robots.txt and sitemap work.
- [ ] After an approved fix, verify apex + www + temporary alias, TLS, canonical host, OG URLs, JSON-LD, sitemap and Search Console properties agree.
- [ ] Add an automated external uptime/redirect smoke check and alert on domain-sale, parking, 3xx-to-unapproved-host, 4xx/5xx or SSO responses.

### P1 — Evidence-based medical competitor gap audit
- [ ] Audit Apex implementation from repository and live product before assigning feature-gap statuses; distinguish shipped, partial, broken, planned and absent.
- [ ] Benchmark ePrepare, TestPrep Smart and MDCAT.pk on actual student journeys: discovery, free entry, question practice, explanations, tests, progress, revision, support, trust and pricing. Record dated screenshots/URLs and separate vendor claims from independently verified facts.
- [ ] Build a feature parity matrix for MCQ bank quality/coverage, subject-topic filters, detailed explanations, timed mocks, wrong-question notebook, bookmarks, analytics, flashcards/spaced repetition, study planner, syllabus tracker, custom test builder, Urdu support, video learning and doubt solving.
- [ ] Measure the end-to-end learning loop: incorrect answer → concept/weakness diagnosis → targeted revision → scheduled reattempt → mastery evidence.
- [ ] Prioritize only validated gaps; do not add features merely to match competitor marketing lists.

### P1 — Medical product quality and readiness
- [ ] Verify MDCAT/NUMS syllabus coverage and question provenance/quality; report counts only from reproducible live data.
- [ ] Test question explanations, answer correctness, topic mapping, duplicate detection, mobile readability and accessibility.
- [ ] Test full-length and chapter mock flows: instructions, timer, navigation, save/resume, submission, review and results.
- [ ] Verify wrong-answer tracking, bookmarks, analytics and progress persistence against real student accounts.
- [ ] Verify exam context remains isolated between MDCAT and NUMS; no cross-exam bank/progress leakage.
- [ ] Run student usability tests on mobile and desktop; capture friction and task completion.

### P1 — Medical SEO and trust
- [ ] Audit and improve useful, distinct pages for MDCAT preparation, MCQs by subject, past papers, mock tests and syllabus; no thin doorway pages.
- [ ] Verify every indexable page has accurate content, unique metadata, self-canonical, working links and provenance for past-paper material.
- [ ] Add transparent, verifiable question sourcing, editorial review and correction process.
- [ ] Publish student results/testimonials only with permission and verifiable evidence; no fabricated counts, ratings, success rates or score promises.
- [ ] Review official exam claims and dates against PM&DC/authorized sources and show checked/updated dates.

### Execution order
1. Resolve and monitor public domain/production availability.
2. Perform repository + live functional audit and populate evidence-based parity matrix.
3. Fix core medical learning journeys and content quality.
4. Implement validated P1 learning-intelligence gaps.
5. Improve conversion, trust and medical SEO.
6. Re-benchmark competitors after each meaningful release.

**Acceptance rule:** No item is marked complete from code presence or competitor marketing copy alone. Record test method, evidence, date, affected routes and measured outcome.

## 2026-11-28 — Homepage, trust, and competitor positioning audit

**Research provenance:** Founder supplied a comparative desk review of the Apex homepage and the public homepages of Maqsad and MDCAT Mentor. It was conducted without logged-in product testing, speed measurements or ranking/Search Console data. Treat competitor feature/scale statements as vendor claims until independently verified; do not copy their numbers, testimonials, partnerships or promises. This queue supplements the medical competitor audit above.

### P0 — Trust and public-claim integrity (applies regardless of launch access model)
- [ ] Create a claim inventory for homepage, FAQ, signup, footer, metadata, pricing, portal cards and llms.txt. For each statement record exact wording, source of truth, live evidence, owner and disposition: keep, qualify or remove.
- [ ] Reconcile all displayed counts. Distinguish question-bank inventory from registered users, active students, attempts, downloads and outcomes; never label a question count as people or activity. Show counts only when reproducible and clearly defined.
- [ ] Verify the reported subject/stream mismatch between marketing steps and signup choices against the actual supported exam configuration; align copy to the real registry and readiness state.
- [ ] Audit GIKI, LUMS and ISSB cards/routes against their actual exam-specific banks, syllabi, mock rules and student journeys. If they currently reuse NUST/PMA content, label the relationship honestly or mark the distinct Prep Space as planned; do not imply separate complete banks.
- [ ] Audit every question source and import pipeline, including OCR-derived material. Record source, rights/permission or public-paper status, transformation/review history and editorial owner. OCR does not make copyrighted commercial book content original or licensed; quarantine material with unclear rights.
- [ ] Verify claims for personalization, offline downloads/sync, full mocks, leaderboard, analytics, explanations and progress persistence through real end-to-end tests. Downgrade/remove any claim that is not live and reliable.
- [ ] Inspect the raw HTML/loading experience and hydration states. No public page should expose a stuck Loading shell, broken client-only content or misleading success state.
- [ ] Reconcile page title, Open Graph/share title, canonical and brand name. Obtain founder sign-off on the public brand architecture before mass metadata changes; use one consistent primary brand and treat MED Prep only as a clearly defined vertical label if approved.
- [ ] Review theme support. Provide a polished accessible light theme alongside dark mode if feasible; ensure neither mode is incomplete and test contrast, focus and system preference.
- [ ] Remove or qualify unsupported free-forever, complete, personalized, offline, all-exams and similar claims in line with the approved pricing/access architecture.

### P1 — Learning product differentiation
- [ ] Make the flagship medical learning loop measurable and complete: answer → explanation → concept/weakness → targeted revision → spaced reattempt → mastery evidence.
- [ ] Prioritize question explanations, verified board/year past-paper provenance, syllabus/topic coverage, mistake review and exam-accurate mocks over adding superficial feature cards.
- [ ] Create a readiness matrix per exam and variant: content volume/coverage, source quality, explanation coverage, mock fidelity, persistence, access state and known limitations.
- [ ] Keep exam-specific banks, scoring, timing, syllabus and progress isolated even when a shared engine is reused.

### P1 — Trust and support (only after operational readiness)
- [ ] Add an honest About/editorial standards/contact/corrections layer with named reviewers only where credentials and consent are verified.
- [ ] Consider WhatsApp/community support only with a defined moderation, safeguarding, privacy and response process; do not publish personal phone numbers.
- [ ] Evaluate phone login and a Play Store/PWA wrapper only after authentication, support demand, privacy and maintenance costs are validated. These are not launch blockers or substitutes for a reliable web product.
- [ ] Use student photos, testimonials, school partnerships and outcome statistics only with documented permission, evidence and clear cohort/date/methodology.

### P1 — Launch-model gate
- [ ] Founder to confirm whether launch is public, private/invite-only, or staged (public discovery/resources with controlled registration).
- [ ] Until confirmed, continue internal product correctness, content rights, security, domain and false-claim cleanup. Keep broad acquisition campaigns, public social-proof collection and SEO expansion beyond essential technical hygiene explicitly blocked.
- [ ] Once confirmed: public/staged → activate the SEO/content/trust acquisition queue; private → keep SEO acquisition and public conversion work parked, while retaining accurate internal product claims and access controls.

**Acceptance rule:** This review is a hypothesis queue, not a verified defect list. Reproduce each issue in code or a clean unauthenticated/student session before changing product copy or marking it done. Record evidence and date.



## 2026-11-28 — Founder confirmed staged public launch + evidence audit

**Decision:** Founder confirmed **staged**. Public discovery/resources and a no-signup sample are the acquisition surface; registration/learning access can be cohort-controlled during beta; premium access remains pricing-ready but payments stay disabled until entitlement, provider, refund/tax/support and explicit founder approval are complete.

**Full evidence report:** [STAGED-LAUNCH-AUDIT.md](STAGED-LAUNCH-AUDIT.md). It classifies features DONE / PARTIAL / BROKEN / MISSING / UNVERIFIED, records source/config/live-data evidence and distinguishes code presence from browser acceptance.

### P0 — stop-ship findings from source + read-only live data
- [ ] **SECURITY: inspect/fix `app/api/questions/route.ts`.** It uses the service-role client, accepts caller-controlled `status`, has no visible auth check and selects `correct_answer`. Verify anonymous access in production, then return safe public fields only; require admin authorization for draft/archived access; add anonymous/student/admin tests. Never expose the key in the initial payload.
- [ ] **TRUST: remove the artificial student-count floor.** `lib/stats.ts` sets `COMMUNITY_BASELINE = 900` and `communitySize()` displays at least 900 even if the real count is lower/unknown. This contradicts the honesty charter. Replace with actual reproducible count or suppress the metric; audit all stats/FAQ/schema claims.
- [ ] **Question source of truth:** live read-only Supabase audit (2026-11-28) returned `questions=0`, `question_attempts=0`, `question_bookmarks=0`, `profiles=3`. The bundled bank exists in source but canonical DB-backed question/attempt/bookmark persistence cannot be marked DONE. Do not run a production seed as part of this audit.
- [ ] Prove the end-to-end MDCAT flow: anonymous sample → answer → explanation → sign-up → authenticated attempt saved → reload → mistake/bookmark → analytics. Test offline queue/drain and idempotency with reviewed test content.
- [ ] Prove strict exam ownership for questions, attempts, bookmarks, flashcards, notes and access grants. Add negative tests for cross-exam reads/writes before monetization.
- [ ] Clean-browser production smoke: confirm public alias is reachable anonymously, no SSO wall or broken hydration; test 360/390/768/desktop. Vercel reports latest production deployment READY and preview-only SSO; this does not prove anonymous usability. Browser runtime remains UNVERIFIED in this audit.
- [ ] Content-rights review: quarantine unclear OCR/commercial-source content; only original reviewed questions and rights-clear official released papers can be public.

### P1 — staged beta value and retention
- [ ] Audit each entry route and homepage claim against live capabilities. Mark Available/Beta/Planned and remove orphaned/dead CTAs.
- [ ] Validate and surface real differentiators: board/year papers, official/recreated/memory-based labels, key status, BUMHS papers and original syllabus-mapped questions. Item-level mapping/key review required.
- [ ] Confirm whether repeated-question stars/filters exist in student UI; knowledge-base report alone is not a shipped feature. Implement only from defensible paper mappings.
- [ ] Pilot concise syllabus-mapped notes and a small set of human-reviewed Urdu explanations; no bulk unreviewed AI translation.
- [ ] Add editorial standards, question correction/reporting and source provenance information.
- [ ] Test Google OAuth configuration; phone is only optional signup metadata in inspected source, not phone OTP. Evaluate OTP cost/abuse/support burden before implementation.
- [ ] Instrument funnel: anonymous visit → sample start/completion → signup → first persisted attempt → 7-day return → mock completion → upgrade interest. Distinguish users, active students, question inventory and attempts.
- [ ] Keep payment processing disabled until exam-scoped entitlement checks, provider, price, taxes/refunds/support and founder approval are explicit.

### Competitor test quality
- [ ] Treat all competitor scale/features as vendor claims unless reproduced. Public Maqsad diagnostic is visible and useful as a first-action benchmark; no competitor account was created and no paid/private feature accessed. Complete a permitted free-tier task scorecard (first-question time, 20 explanation sample, available mock, mobile friction, price boundary) and record date/device/method without copying proprietary question text.
- [ ] MDCAT Mentor was previously reviewed at homepage level only. ePrepare, TestPrep Smart and MDCAT.pk claims remain UNVERIFIED pending direct product-flow observation.

**Acceptance:** P0 security and trust issues closed; canonical question source/persistence verified; exam boundaries pass negative tests; staged anonymous sample and controlled registration work; no public claim exceeds observed capability. No production DB/schema, domain, billing or deployment-protection changes were made in this audit.


### P0 claim follow-up — non-profit wording
- [ ] `components/landing/Footer.tsx` currently calls MED Prep a “non-profit community initiative”. Founder has confirmed a staged launch and is exploring premium revenue. Verify the actual legal/operational status and remove or accurately qualify this statement before publishing monetization claims; do not imply non-profit/charitable status without evidence.


## 2026-11-28 — MDCAT question-bank refinement (founder instruction)

Founder direction: **preserve and refine the existing question bank; do not replace it with AI-generated questions.** AI may assist with classification and candidate detection only. No silent rewriting, answer guessing, mass deletion or replacement content.

**Detailed rules and workflow:** [QUESTION-BANK-REFINEMENT.md](QUESTION-BANK-REFINEMENT.md).

### P0 — preserve sources and establish a safe baseline
- [ ] Freeze source inputs for the refinement pass; inventory every question-bearing file/runtime bank with path, hash, source, record count and subject count. Preserve immutable originals.
- [ ] Build a read-only dry-run parser/report first. It must not write to question files, runtime banks or Supabase.
- [ ] Do not run `scripts/ingest-topicals-v2.mjs` for this task: it writes directly to `lib/topicals-bank.ts`, has no dry-run mode and deduplicates by normalized stem alone, which can collapse valid variants with different options/keys.
- [ ] Do not run `scripts/ingest-topicals.mjs`, answer rebalancing scripts or any production seeder as a substitute for curation.
- [ ] Treat `knowledge-base/questions/MDCAT_Practice_Questions.md` heading count (3,594; Biology 1,439, Chemistry 939, Physics 1,216) as a source claim, not a verified usable/unique/keyed count. It visibly contains incomplete option sets; flag, do not discard.
- [ ] Compare `lib/mdcat-topics.ts` against the applicable official PM&DC syllabus; current comments call its subtopics approximate and not matched to questions.

### P1 — chapter/topic classification and exact deduplication
- [ ] Map each existing question to subject → official syllabus chapter → topic, with confidence and evidence. Low-confidence items go to manual review, not a guessed chapter.
- [ ] Keep paper/year/board/code as provenance separate from syllabus chapter. Preserve repeated occurrences in actual paper archives even if the general topical practice pool has one canonical copy.
- [ ] Exact duplicate candidates must match normalized stem + complete option set (order-independent) + correct-answer option text; include figures/media in identity. Key conflicts or source differences go to review.
- [ ] Near-duplicates are review-only; never auto-delete changed wording, values, options, figures or meaningful variants.
- [ ] Retain stable IDs and a mapping from every canonical record to every original source occurrence.
- [ ] Structural flags: missing stem/options/key/explanation, invalid option labels, key-to-option mismatch, malformed math/formatting, broken figure references and out-of-syllabus items. Never guess answers or generate replacement content.

### Pilot and acceptance
- [ ] Produce read-only inventory + classification + exact duplicate + near-duplicate + structural-quality reports for Biology first.
- [ ] Review Biology sample/edge cases with founder before applying the same rules to Chemistry, Physics, English and Logical Reasoning.
- [ ] Generate a new versioned curated output only after review; never overwrite raw sources. Include a merge/removal/provenance log and before/after reconciliation.
- [ ] Acceptance: every original record is accounted for; no AI rewrite/replacement; no unresolved exact duplicates in the approved practice pool; near-duplicates and repeated paper appearances retained; unmapped items explicitly queued.


### First-pass MDCAT corpus findings (2026-11-28)
- [x] Read-only parse of `knowledge-base/questions/MDCAT_Practice_Questions.md` completed; detailed result: [MDCAT-QUESTION-BANK-PILOT-AUDIT.md](MDCAT-QUESTION-BANK-PILOT-AUDIT.md).
- Source declares and parser found 3,594 question markers: Biology 1,439; Chemistry 939; Physics 1,216. Existing chapter headings: 17 Biology, 20 Chemistry, 13 Physics (50 total).
- First-pass format parser detected four labelled options on 1,573 records; 2,021 records have 0–3 labelled options and require parsing/content review. These are flagged, not deleted.
- Five repeated-stem/option candidate clusters were inspected. Only one is a strong duplicate four-option MCQ candidate; others include repeated website navigation, generic stems with different answers, incomplete entries and a conflicting answer case.
- [ ] Next: parse separate chapter-wise source files, reconcile their records to the combined 3,594 corpus, then generate subject/chapter/topic classification and cross-file duplicate reports. Do not change the source bank yet.


### Biology source-file pilot update (2026-11-28)
- [x] Parsed `biology_mcquniverse.md` (1,383 records / 16 chapter headings) and `biology_mcquniverse_acellular_life_58.md` (58 records). Across both: 1,441 entries; all 1,441 have four labelled options, an A–D key that points to an option and a non-empty explanation in the source format; zero exact duplicate clusters under stem + option-set + correct-option-text matching.
- [x] Compared with the combined source Biology section (1,439 markers / 1,423 unique normalized stems): 52 combined records have no stem match in structured files; 54 structured records have no stem match in combined file. These are source differences, not automatic adds/removals.
- [ ] Reconcile all differences with source context, option/key comparisons and provenance; do not replace the combined source with the structured files wholesale.
- [ ] Verify source rights/permission before public or commercial use: the structured files identify MCQUniverse as source; public availability/founder extraction does not itself prove republication rights.
- [ ] Map all Biology questions to official PM&DC chapter/topic taxonomy and validate keys against authoritative sources before any curated output.


## 2026-11-28 — Permanent question-content visibility and rights policy

This policy governs every public question, explanation, note, flashcard, mock, export, API response, static bundle and SEO-rendered page. It supersedes any older pipeline comment or assumption that de-branding or personal-use extraction makes academy-derived material suitable for public distribution.

1. **Visibility is an access-control boundary.** Only rows individually reviewed and approved for public release may be served to anonymous visitors. A pipeline `visibility: public` label is a candidate classification, not proof of ownership, permission, licence or publication rights. Unknown or disputed provenance defaults to private/withheld.
2. **Private content stays private through the entire learning graph.** Explanations, summaries, notes, flashcards, hints, answer rationales, mock items, embeddings, exports and other derivatives inherit the most restrictive visibility of every source they depend on. A derivative of private or mixed-source content is private unless independently rewritten as genuinely original work from a rights-clear syllabus/official source and reviewed.
3. **Public and owner-only pools are separate.** Public delivery is filtered server-side and build-time; never rely on client-side hiding. Private material may be available only to the founder's specifically verified account(s) through a server-side allowlist/authorization check. Do not hardcode an unverified email, expose the private pool in public JS/static bundles, or treat a generic authenticated account as owner access. If identity/configuration is not verified, fail closed.
4. **Official-paper evidence is item-level.** A paper can be labelled official only when the source PDF itself identifies the examining body, year and paper/code (where applicable), and the item-to-paper mapping is defensible. Retain the source URL/file reference, key provenance and retrieval/review date. Provide a contact/correction/takedown path. Reposts or third-party compilations do not become official merely because a filename says so. Publication permission/terms must still be checked; official origin is not an automatic zero-risk licence.
5. **No textbook or academy copying.** Do not OCR or republish commercial textbook/academy content without explicit rights. Removing names, logos, watermarks or branding does not cure derivative copying. Do not paraphrase academy questions to evade this rule. New questions must be independently authored from a rights-clear official syllabus or source, not transformed versions of protected questions.
6. **Counts and claims follow the approved public pool.** Public counts must be computed only from the verified public release set actually delivered to anonymous users. Never substitute total classified, private, import-ready, keyed or locally stored counts. Remove unsupported `COMMUNITY_BASELINE`, `ANALYSIS_CORPUS` and non-profit/community claims unless independently substantiated and approved. Keep question count distinct from student/activity counts.
7. **No destructive cleanup before review.** Preserve originals and provenance. Use read-only inventories and dry-run reports first; quarantine questionable items rather than deleting, rewriting or guessing. Any publication/import change requires a reviewed manifest and explicit approval.

### P0 implementation and audit sequence
- [ ] Inventory every public delivery path: API, bundled TypeScript/JS, static generation, topical routes, mocks, search/indexing, exports and derivatives. Confirm anonymous users cannot retrieve private rows or answer keys before submission.
- [ ] Replace the caller-controlled question API status filter with an authenticated/authorized server-side policy; public responses must contain only approved public content and no answer key before submission. Owner-only access must use a verified server-side allowlist. Add anonymous, ordinary-user, owner and unauthorized-status regression tests.
- [ ] Audit the complete candidate public set source-by-source and item-by-item. Record source file, original provider/creator, rights basis, paper identity, answer/key evidence, OCR/reconstruction status, derivative links and disposition: APPROVED_PUBLIC / PRIVATE_OWNER_ONLY / HOLD_FOR_RIGHTS / HOLD_FOR_QUALITY / REJECTED_DUPLICATE (without deleting the original).
- [ ] Verify the current manifest and counts against the exact generated data snapshot. Conflicting snapshots must remain explicitly unresolved: the user-supplied 2026-11-23 README figures (16,272 total; 2,393 public; 13,879 private; 3,398 import-ready; 1,981 official-paper answers; 12,417 unresolved) differ from tracked board/log snapshots (16,258 total and 11,152 private in one earlier report; another earlier build reported 13,545). Do not choose or publish a count until the actual manifest and source files are available and reconciled.
- [ ] Keep private corpus files out of public Git history, static assets and client bundles. Confirm repository ignore/tracking state and production artifact contents before launch.
- [ ] Remove unsupported public stats/claims and recalculate homepage, SEO metadata, sitemap and feature copy only after the public manifest is approved.
- [ ] Record a source-level decision and takedown contact for every official paper and public-source collection.

**Evidence limitation at recording time (2026-11-28):** `data/MCQS_FINAL/README.md`, `data/MCQS_FINAL/` and `data/MCQS/_pipeline/build_final.mjs` are not present on the tracked `main` branch (GitHub returned 404); the board describes the data as untracked/local. Therefore the 2,393 candidate rows cannot yet be inspected source-by-source from this repository connection. Do not mark the rights audit complete until the exact README, index/manifest, source-level files and source references are supplied or safely made available for read-only inspection.

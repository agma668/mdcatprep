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
- At inspection, `profiles` showed 2 rows, `client_telemetry` 53 rows, and most content/activity tables reported 0 rows. Verify which content is intentionally bundled locally versus expected in Supabase; do not seed, migrate or delete data without an explicit task and backup/review.
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

- [ ] Confirm the public temporary Vercel hostname and whether it is accessible without SSO in a clean browser.
- [ ] Resolve the Vercel SSO/deployment-protection mismatch for the intended public preview. Keep preview/admin protections safe; do not weaken access controls blindly.
- [ ] Resolve canonical host mismatch: `lib/site.ts` points at `mdcatprep-eight.vercel.app`, while Vercel currently reports `edweb-*.vercel.app` aliases.
- [ ] Confirm actual production branch and Git integration. Current deployment metadata points to `main`; older `AGENTS.md` says default branch is `master`, so update stale instructions only after verifying GitHub default branch and Vercel production branch.
- [ ] Confirm Supabase project mapping: use active `edweb`; leave inactive `CAT` untouched.
- [ ] Establish reproducible local checks and baseline logs. Run `npx tsc --noEmit`, `npm test`, `npm run lint`, `npm run build` and record exact outcomes.
- [ ] Inventory environment variable NAMES and whether each is configured in Preview/Production, without reading or copying secret values.
- [ ] Confirm auth, email, push, cron and telemetry routes behave correctly without leaking private data.
- [ ] Create a route inventory with public/private/noindex classification and a list of known bugs.

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
- [ ] Fix canonical host and audit all metadata, sitemap, robots, IndexNow and JSON-LD.
- [ ] Build an academy/category/exam route-to-search-intent matrix; consolidate thin/duplicate routes and avoid doorway pages.
- [ ] Improve homepage, exam hub and high-intent guides with accurate, useful content.
- [ ] Create a pillar/cluster content plan with original material and official citations.
- [ ] Add registry/exam pages only where unique verified information supports them.
- [ ] Validate structured data and social previews.
- [ ] Verify 404/redirect/noindex/sitemap behaviour.
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
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin.
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

1. [ ] P0: verify public Vercel URL/SSO behaviour and branch mapping.
2. [ ] P0: correct stale canonical host; add smoke test to prevent future drift.
3. [ ] P0: run and record TypeScript, tests, lint and build baseline.
4. [ ] P0: inspect `lib/exams-config.ts`, all portal routes and current exam-specific data; create the portal readiness matrix.
5. [ ] P0: define and document the academy → category → exam portal route/navigation model, reusing sound existing routes.
6. [ ] P0: audit homepage/category/portal UX at mobile and desktop; remove student confusion before adding features.
7. [ ] P0: audit exam question quality/provenance and all displayed counts independently per portal.
8. [ ] P1: complete design scorecard and close the highest-impact UX defects.
9. [ ] P1: complete route metadata/sitemap/canonical/robots audit by search intent.
10. [ ] P1: triage Supabase security advisors and verify RLS assumptions.
11. [ ] P1: complete privacy, legal, support and brand consistency review.
12. [ ] Hold domain purchase until Phase 5 is signed off.

## 2026-11-08 codebase audit addendum

First-pass source audit completed and recorded in `EXAM-READINESS-AUDIT.md` (audited main head `ba008e54e799db0c6784c8fb07cfa7dc4e91d2fc`). Key blockers before implementation:

1. The four-key registry does not map cleanly to the real test workflows: USAT-M is nested under MDCAT while its own 417-question bank/mock exists; the standalone USAT config says Arts/Commerce but points at the USAT-M bank; USAT-E is grouped under NUST without a dedicated matching workflow; Navy/AFNS appear as subtests without evidence of dedicated experiences.
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

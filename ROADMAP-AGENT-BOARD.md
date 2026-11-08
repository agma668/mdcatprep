# Master Roadmap & Todo Agent Board — Apex Pakistan / MED Prep

> This is the coordinating source of truth across the SEO and Design boards. Owner: roadmap/orchestration agent. Baseline inspected: 2026-11-08. Branch: `main`. Repository: `agma668/mdcatprep`. Do not buy or attach a custom domain until the 10/10 website release gate is passed and the founder explicitly approves the purchase.

## North-star outcome

Ship a trustworthy, polished, fast, accessible, genuinely useful exam-preparation website for Pakistani students. The site should make it easy to find the correct exam track, practise original high-quality questions, understand explanations, revisit mistakes and measure progress.

“10/10” means all critical user journeys work, the product is visually coherent, the content is honest, the site is safe and accessible, production is stable, and measured performance is strong. It does not mean adding every possible feature.

## Current system baseline (verified 2026-11-08)

### Repository and stack
- GitHub: `agma668/mdcatprep`; current `main` head: `b32927301ac427288043da7b98de22df28b15bec`.
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

## Phase 1 — 10/10 visual and UX foundation (P0/P1)

Owner: Design board. Dependencies: Phase 0.
- [ ] Resolve brand architecture: Apex Pakistan parent brand vs MED Prep product brand; settle logo, naming, tone and exam taxonomy.
- [ ] Complete desktop/mobile audit of all high-traffic surfaces.
- [ ] Fix homepage first impression, hero hierarchy, exam selector and primary CTA.
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

## Phase 2 — Product correctness and content quality (P0)

- [ ] Audit question bank keys, answer keys, explanations, duplicate text, topic mapping and subject coverage.
- [ ] Ensure every MCQ has one defensible answer, plausible options, explanation and honest provenance.
- [ ] Confirm all question counts displayed on the site reconcile to actual bundled/DB content.
- [ ] Test all practice engines for randomization, scoring, answer review, progress persistence and retry behaviour.
- [ ] Verify exam mock lengths, weightings, timers and negative-marking rules against current official sources; clearly label scaled practice mocks.
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
- [ ] Build a route-to-search-intent matrix and consolidate thin/duplicate routes.
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
- [ ] Add new exam tracks only with a quality-controlled bank and real practice experience.
- [ ] Build student ambassador/community loops with consent and abuse safeguards.
- [ ] Improve analytics and experiments only when sample sizes and privacy approach justify them.
- [ ] Reassess monetization only after product quality, trust and engagement gates in `TODO.md` are met; preserve the free core.

## Current first sprint — ordered execution queue

1. [ ] P0: verify public Vercel URL/SSO behaviour and branch mapping.
2. [ ] P0: correct stale canonical host; add smoke test to prevent future drift.
3. [ ] P0: run and record TypeScript, tests, lint and build baseline.
4. [ ] P0: perform homepage + signup + dashboard + practice + mock + notes mobile/desktop audit.
5. [ ] P0: audit exam question quality/provenance and all displayed counts.
6. [ ] P1: complete design scorecard and close the highest-impact UX defects.
7. [ ] P1: complete route metadata/sitemap/canonical/robots audit.
8. [ ] P1: triage Supabase security advisors and verify RLS assumptions.
9. [ ] P1: complete privacy, legal, support and brand consistency review.
10. [ ] Hold domain purchase until Phase 5 is signed off.

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

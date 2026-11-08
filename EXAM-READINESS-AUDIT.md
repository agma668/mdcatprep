# Exam & Prep Space Codebase Audit — First Pass

**Date:** 2026-11-08  
**Repository:** agma668/mdcatprep  
**Audited branch:** main  
**Audited head:** ba008e54e799db0c6784c8fb07cfa7dc4e91d2fc  
**Scope:** route/registry inventory, question-bank routing, mock assembly, progress persistence, student access model and pricing/entitlement readiness.  
**Status:** static source audit only. No application code, database, deployment, payment or account settings changed.

## Executive conclusion

The repository has several useful exam-specific learning assets already. However, it is not yet a multi-Prep-Space platform with exam-isolated progress or purchase-based access. The implementation is a mixture of four broad portal keys, separate bundled question banks and practice pages, a shared Supabase question table and attempt history, some exam-specific mock builders, client-side exam-choice preferences, and one signup exam_target string with one global approval status.

The safest next step is to define stable exam IDs and a server-enforced exam boundary before changing student routes or adding paid access. Do not perform a broad route rewrite or production migration yet.

## Repository and branch facts

- GitHub main is at ba008e54e799db0c6784c8fb07cfa7dc4e91d2fc.
- GitHub master is at b97ff37ac2161844b6280e5364d37f9e6aa65431.
- GitHub compare reports main is 14 commits ahead of master, with no commits in the reverse direction. The 14 commits include product work and current architecture/agent-board documentation.
- The production branch was previously recorded as main. AGENTS.md still says the default branch is master, while TODO.md describes main as production and says both branches are synced. This is stale/conflicting operator guidance. Treat main as the active source for this audit; resolve branch policy explicitly before deployment work.

## 1. Exam registry and route inventory

### Current registry

lib/exams-config.ts exposes four top-level IDs: mdcat, nust, pma and usat. Each config has one bank ID, one route/practice route, feature flags and a list of subtests.

| Registry ID | Current grouping | Config bank | Important mismatch/risk |
|---|---|---|---|
| mdcat | MDCAT, NUMS, USAT-M, Balochistan and FATA/KPK variants | mdcat | The dedicated 100-MCQ bank is actually the Balochistan / ex-FATA scholarship-test Pre-Medical variant, not standard HEC USAT-M; it is incorrectly labelled as USAT-M in several student-facing surfaces. |
| nust | NUST NET, GIKI, LUMS SBASSE, USAT-E | nust | GIKI/LUMS share the NET bank by explicit disclosure; USAT-E is listed here but has no matching engineering chooser/bank established in lib/prep-tests.ts. |
| pma | PMA initial, ISSB, Navy/AFNS | pma | The actual military chooser supports PMA and ISSB only; Navy/AFNS are not evidenced as separate workflows. |
| usat | USAT Arts and Commerce | usat | The bundled bank and dedicated mock are specifically USAT-M scholarship content; the config's Arts/Commerce variants do not match that bank's described scope. |

### Routes observed

- Public discovery: /, /exams, /portal/[exam], plus topic, past-paper, notes, resources, blog, FAQ and pricing pages.
- Main student area: /dashboard and its practice, mock, notes, flashcards, mistakes, bookmarks, analytics and profile routes.
- Dedicated practice pages: /nust/practice, /usat/practice and /pma/practice.
- Shared exam session: /practice/session.
- Dynamic /portal/[exam] renders one of the four config entries. Its subtest cards append ?subtest=<id> to the configured route; the current practice-choice system instead reads/writes a localStorage value. End-to-end handling of every subtest query needs route-level verification.

Current /portal/[exam] is a public portal overview, not a dedicated authenticated Prep Space. The config route often points directly to a dashboard/practice route. The dashboard switcher receives the raw free-text profile exam_target (for example, “MDCAT” or “PMA Long Course”) but its option values are lowercase registry keys (mdcat, pma, nust, usat); there is no visible normalization seam in the switcher. This can leave the displayed active portal out of sync with the profile target. There is not yet a consistent public-exam-page → authenticated-Prep-Space pair per stable exam ID.

## 2. Question banks and mock assembly

### Bundled banks

The source contains distinct data arrays for MDCAT (lib/mdcat.ts), USAT-M (lib/usat-comprehensive-bank.ts), NUST (lib/nust-questions.ts) and PMA (lib/pma-questions.ts). The latest project records describe USAT-M at 417 questions, NUST at 81 and PMA at 41; MDCAT totals are derived by lib/stats.ts from the actual array and should continue to be displayed dynamically.

Dedicated builders exist:
- lib/usat-mock.ts: USAT-M scholarship split and 100-minute mock.
- lib/nust-mock.ts: NET-Engineering weighting, clamped to the actual subject bank.
- lib/pma-mock.ts: original PMA/ISSB-style simulations with explicit non-official timing/count caveats.
- MDCAT-weighted generic mocks are assembled from the shared published Supabase question pool.

### High-risk shared-pool behaviour

lib/questions-repo.ts filters the Supabase questions table by status = published and optionally by subject. It does not filter by a stable exam ID or even by the existing college column. Its fillQuestions() fallback fetches from the entire published pool.

Consequences:
- /dashboard/practice builds its general subject list/counts from every published Supabase question.
- Generic mixed mock assembly can draw from the general published pool.
- A thin subject quota can be topped up by unrelated published questions.
- The current schema has no exam_id/Prep Space ownership field on questions.

This is the most important content-isolation risk to resolve before expanding the shared question table. The college text column is not a substitute for a stable exam taxonomy and is currently not used by the canonical question repository. In addition, lib/subjects.ts deliberately falls back to all database subjects when the free-text exam_target has no mapping; that is a second fail-open path for exam discovery and should become an explicit unknown/unsupported state.

### Practice persistence is inconsistent

- Shared /practice/session and MockTestPlayer call server actions to record attempts (DB questions by row ID; bundled questions by stable question key).
- The standalone PMA practice page visibly maintains answers, revealed questions and score in React state. Search of current attempt-action call sites found the shared session and mock player, not the standalone PMA/NUST/USAT practice components.
- The dedicated practice pages therefore must not be assumed to produce durable student analytics until individually verified.

## 3. Progress, bookmarks, notes and flashcards

Current persistence is student-scoped, but not exam-scoped:

- question_attempts stores student_id and question_id; it has no exam/goal identifier.
- question_bookmarks stores student_id and question_id; it has no exam/goal identifier.
- Mistake review reads the student's latest attempts across their whole history, then resolves question bodies; no Prep Space filter is present.
- lib/analytics/index.ts aggregates the student's attempts globally. profiles.exam_target informs goal wording, not the query boundary.
- Notes use subject/college metadata rather than a stable Prep Space ID.
- Flashcard review rows are keyed by student_id and card_id; the choice of medical subtest is a client-side display/filter preference, not a durable multi-goal progress partition.
- lib/prep-tests.ts stores one choice per family in browser localStorage (medical, engineering, military). This is not account-synced and does not model multiple active goals with independent progress.

The existing system can keep one student's data private from other students, but it cannot reliably represent the same student's independent MDCAT, PMA, USAT or future CSS progress. Exam context must become part of the data model and every relevant query/write path.

## 4. Identity, authorization and commercial readiness

- Signup writes one free-text profiles.exam_target value.
- Login routes students according to one global profile status (pending/approved/rejected/suspended); admin approval currently controls access to the student area.
- The current portal switcher exposes all four broad portals, independent of the student's signup target.
- The checked-in migrations contain no exam entitlement, order, subscription, pass or purchase-grant table. No exam_id field was found on attempts.
- app/portal/[exam]/page.tsx explicitly renders “Free forever” and a second “100% free … Ever” statement. These claims conflict with the approved pricing-ready Prep Space decision and must be replaced with truthful launch/access language before public rollout.
- The current approval state is not a purchase entitlement. It cannot safely be repurposed as one.

Required future model: one account → multiple preparation goals → each goal references a stable exam ID → server-side entitlement grants access to a named exam or explicit bundle → attempts/bookmarks/notes/flashcard state are exam-scoped. Free launch access should be represented as an explicit grant/policy with a transition plan, not as a permanent promise.

No payment provider, price, checkout or billing workflow is approved or implemented by this audit.

## 5. First-pass readiness matrix

| Exam / family | Content and practice evidence | Mock evidence | Progress isolation | Readiness |
|---|---|---|---|---|
| MDCAT / PMDC boards | Large bundled medical bank, topic drills, shared practice session; multiple board labels share a core bank | MDCAT-weighted mock exists; verify current official pattern and actual pool filtering | No exam ID on attempts; shared DB pool | Existing foundation; not an isolated Prep Space |
| NUMS | Shares PMDC core; separate Paper-II/psychological bank/experience is referenced in code and portal flags | Verify Paper-I/Paper-II assembly and exact current pattern independently | Same global attempt model | Partial; needs distinct blueprint and rules |
| HEC BFAP Scholarship Test — Pre-Medical variant | Dedicated bundled bank, topic/category drill and chooser; repository docs distinguish it from mainstream USAT-M | Dedicated 100-MCQ / 100-minute scholarship-variant mock | The shared action resolves question_key or question_text against public.questions; live table has zero rows, so bundled attempts return Question not found and the caller suppresses the error | Content foundation only; current durable progress path is broken for this bank |
| HEC USAT standard — all six variants, including Pre-Medical | HEC lists six standard categories; no complete standard-USAT bank/essay workflow established by this pass | Standard USAT needs its own 75-MCQ + essay workflow; no verified complete mock established | No goal partition | Not ready; do not advertise as complete |
| NUST NET | Dedicated 81-question bank and dedicated practice page | Current NET-Engineering mock correctly uses NUST's official 50% Mathematics / 30% Physics / 20% English weighting, 200 MCQs / 180 minutes, no negative marking; scaled to available bank | Bundled question attempts cannot resolve to DB rows; standalone practice persistence also needs verification; no goal partition | Working Engineering variant foundation; other NET variants missing; portal subject labels inaccurate; no isolation |
| GIKI / LUMS | Explicitly share the NET bank; current chooser labels this honestly, but the bank is not a verified substitute for either exam's own pattern | No distinct GIKI/LUMS pattern-specific mock established | No goal partition | Shared-content beta only; not independent full Prep Spaces |
| PMA Long Course | Dedicated 41-question bank; Verbal/Non-Verbal/Academic workflow | Original scaled mock with explicit non-official caveat | Standalone practice appears local-state; bundled mock attempt lookup cannot resolve a DB row; no goal partition | Distinct workflow foundation; progress gap |
| ISSB | Shares PMA intelligence content; selection-specific workflow is partial | Intelligence-only original simulation | Same PMA question/attempt model | Partial; requires broader stage-specific blueprint |
| Navy / AFNS | Mentioned as config subtests/signup options, no dedicated workflow evidenced | Not established | Not established | Not ready |
| MBBS clinical notes | Separate notes surface exists, not a top-level exam registry entry | Not applicable | Notes are not clearly tied to a clinical learning goal | Separate product area; audit independently |
| CSS/PMS, IELTS/PTE, Matric/FSc/O/A Levels, other admissions/careers | No implemented Prep Space identified in current registry/routes during this pass | Not established | Not established | Planned inventory only; do not market as live |

Readiness labels describe evidence in the current repository, not a claim that every question has been content-reviewed or that the live production database matches migrations.

## 6. Recommended implementation sequence

1. Freeze the taxonomy proposal before coding: define stable exam IDs and variants. Separate the standard six-variant HEC USAT from the Balochistan/FATA scholarship test; keep NUST's five NET paper types under explicit variants; keep GIKI and LUMS separate.
2. Build an Exam Registry + Preparation Blueprint proposal in code-independent documentation first. Include official authority/source/version, eligibility, syllabus, bank/source IDs, practice mode, mock rules, features, readiness and content owner.
3. Define the data boundary: questions/content ownership, preparation goals, entitlements, and exam-scoped attempts/bookmarks/notes/flashcard state. Draft migrations and RLS tests only; do not apply to production yet.
4. Design compatibility/backfill: existing single exam_target values and historical attempts must be mapped cautiously. Do not guess ambiguous history; preserve legacy data and mark unknown scope honestly.
5. Prove the boundary with two contrasting spaces: PMDC MDCAT first (MCQ-heavy) and PMA second (selection-oriented). Then build the Balochistan/FATA scholarship-test space as a separate aptitude variant; build standard HEC USAT only after its six categories and essay workflow are ready.
6. Only after access boundaries are tested: replace “Free forever” public claims with explicit launch policy and add server-enforced entitlements. Payment rails and prices require separate research/approval.
7. Then expand additional exam families based on content quality and actual workflows, not the breadth of the signup dropdown.

## 6. Official exam-pattern verification (2026-11-08)

The following official-source checks refine the first-pass matrix:

- HEC/ETC lists six standard USAT categories: Pre-Medical, Pre-Engineering, Arts & Humanities, Commerce, Computer Science and General Science. Standard USAT Part I is 75 MCQs in 100 minutes, followed by Part II essay writing (40 minutes; argument and narrative tasks, 25 marks total). HEC also clarifies that USAT is recommended but universities decide whether to accept it; it is not mandatory at every institution. Sources: HEC [sample papers](https://www.hec.gov.pk/english/services/students/etc/Pages/HAT-Sample-Papers.aspx), [USAT content weightages](https://www.hec.gov.pk/english/services/students/etc/Documents/Content%20Weightages%20for%20%28USAT%29.pdf), [USAT optionality clarification](https://www.hec.gov.pk/english/news/news/Pages/USAT-HEC.aspx).
- HEC's Balochistan / ex-FATA scholarship test has a distinct 100-MCQ / 100-minute pattern. Its Pre-Medical split is Verbal 26, Quantitative 32, Physics 11, Chemistry 11, Biology 20. This matches the repository's current 100-question bank/mock, and the repository's own docs/HEC-USAT-M-ANALYSIS.md already distinguishes these two exams. The student-facing label “HEC USAT-M Scholarship Mock” is misleading; it should be renamed to the scholarship-test identity after a safe content/route plan. Source: [HEC Balochistan / Ex-FATA test weightages](https://www.hec.gov.pk/english/scholarshipsgrants/BF-III/Documents/CW-BAL-FATA.pdf). Verify the applicable batch before treating the old PDF as the current cycle's rules.
- NUST officially lists five NET paper types: Engineering, Applied Sciences, Business & Social Sciences, Architecture and Natural Sciences. NET-Engineering is Mathematics 50%, Physics 30%, English 20% and is used for Engineering and Computing programmes. Its current FAQ states 200 MCQs in 180 minutes and no negative marking. The repository's lib/nust-mock.ts already follows the Engineering split and duration correctly; however, lib/exams-config.ts still advertises Chemistry/Computer Science and English/Intelligence in its NUST subject list. Sources: [NUST NET subject weightings](https://nust.edu.pk/admissions/undergraduates/subjects-included-in-net-with-weightings/), [NUST admission FAQs](https://nust.edu.pk/faqs/).
- GIKI has its own undergraduate admission test with Physics, Mathematics and English, so it must not be treated as the NUST NET. LUMS SBASSE applicants may use SAT, ACT or LCAT; an LCAT prep experience is only one route. Sources: [GIKI admission selection](https://giki.edu.pk/admissions/admissions-undergraduates/admission-selection/), [LUMS admission FAQs](https://admission.lums.edu.pk/admission-faqs).
- NUMS 2026 official syllabus confirms Paper-I (Biology, Chemistry, Physics, English) and Paper-II (Psychological Test), supporting its separate exam identity. Source: [NUMS MDCAT 2026](https://numspak.edu.pk/news-detail/nums-mdcat-2026-for-admissions-in-mbbs-bds-session-2026-27).

## 7. Public access and pricing copy audit

A second targeted copy/flow search found more public promises and a misleading pricing interaction that must be treated as P0 before the public launch:

- “Free forever” appears in app/signup/page.tsx, components/landing/RegisterSection.tsx and app/portal/[exam]/page.tsx.
- “100% free”, “nothing locked” or no-expiry language appears in app/page.tsx, components/landing/Hero.tsx, app/signup/page.tsx, app/faq/page.tsx, app/resources/page.tsx, app/notes/[subject]/page.tsx and the generated /llms.txt response. Some of these are legacy claims and need a careful page-by-page copy decision; do not silently promise a permanent free tier.
- app/pricing/page.tsx presents five Rs. 0 plans, including an “Apex All-Access Lifetime Pass” with future exam additions included. Its “checkout” handler only calls setSubmitted(true) in client state. It does not call a server action, payment provider, entitlement service or database write. The success state says the pass was activated, but no grant is created. This is not a functioning checkout or entitlement system and must not be represented as one.
- The same pricing page claims future updates, full access across all tracks, AI support and other capabilities that have not been verified in the current product. Its plan names and inclusions also contradict the new rule that an exam-specific purchase grants only that exam unless a named bundle explicitly includes more.
- /practice/session currently checks authentication but has no exam entitlement check. This is expected in the current manual-approval/free-launch model, but it is a required server-side gate before paid access is enabled.
- Public notes and some practice/discovery surfaces are explicitly described as free/no-signup. The future product must decide which are genuinely open samples/discovery and which belong behind an exam entitlement; do not accidentally leave a full paid exam bank public merely because its route predates the new model.

**Recommendation:** before charging students, replace the fake local-only pricing activation with a truthful pricing/access-information page, remove all permanent-free claims, and clearly distinguish free public samples from protected full preparation. Do not implement checkout until the entitlement model and actual provider are approved.

## 8. Live Supabase schema, data and RLS snapshot

**Read-only inspection of active Supabase project edweb (project ref niiskuwlpccmdtwjoxvm) on 2026-11-08. No SQL writes or settings changes were made.**

### Live row counts

| Table | Live rows | Observation |
|---|---:|---|
| profiles | 2 | Profile table exists with one free-text exam_target and one global status. No user details were queried. |
| questions | 0 | No database question records exist in the live table at inspection time. |
| question_attempts | 0 | No persisted question attempts exist. |
| question_bookmarks | 0 | No persisted bookmarks exist. |
| flashcard_reviews | 0 | No persisted flashcard review rows exist. |
| notes | 0 | No live note rows exist. |
| client_telemetry | 62 | Telemetry is being written. |
| feedback, duels, duel_answers, races, push_subscriptions, whatsapp_subscribers | 0 | No rows at inspection time. |

The live migration history contains 22 applied versions, matching the 22 checked-in migration files inspected. The live schema includes the question_key column, so the key migration is applied; this is not a missing-column problem.

### Confirmed bundled-attempt persistence defect

- lib/questions.ts explicitly distinguishes DB row IDs from bundled stable keys.
- PracticeSession and MockTestPlayer send bundled keys to recordAttemptByQuestionKey.
- app/actions/practice.ts tries to resolve question_key, then falls back to exact question_text in public.questions. With zero question rows, neither lookup can succeed; the action returns “Question not found.”
- The callers use .catch(() => {}) and do not surface the error. The bundled answer can therefore appear accepted in the UI while no durable attempt is stored.
- lib/offline-sync.ts only accepts a DB questionId and routes through recordAttempt; the bundled key path does not use that offline queue.
- Because question_attempts is empty, the analytics dashboard has no real attempt history to display. This must be fixed and verified before claiming persistent analytics, streaks or cross-device progress work.

This is a higher-priority defect than simply adding exam_id to attempts: first establish a reliable canonical content identity and successful persistence for bundled questions, then scope each write to a student goal and exam variant.

### Live RLS policy observations

- RLS is enabled on the inspected public tables.
- public.questions has an authenticated SELECT policy based only on status = published. It has no exam or entitlement predicate.
- public.notes has a published-notes SELECT policy for all authenticated users plus an own-student-note policy; no exam/goal scope is present.
- question_attempts SELECT/INSERT and question_bookmarks ALL policies check student_id = auth.uid(), which protects between students but not between exam goals.
- flashcard_reviews policies likewise check only student_id = auth.uid().
- client_telemetry has RLS enabled with no table policies. The repository's /api/telemetry route writes through a server-side service-role client, so this appears intentional; keep it server-only and do not add broad client policies.

### Supabase advisor snapshot

Security advisor (2026-11-08):
- One INFO: client_telemetry has RLS enabled with no policies (consistent with the server-only writer above).
- Three WARNs: public.duels_guard_update, public.races_guard_insert and public.leaderboard have mutable search_path configuration.
- Three WARNs: count_referral_on_signup, generate_referral_code and handle_new_user are SECURITY DEFINER trigger functions with EXECUTE grants visible to anon/authenticated roles. They return trigger and are used as triggers; inspect trigger-only semantics and grants before changing anything. Do not blindly revoke or rewrite them.
- One WARN: leaked-password protection is disabled in Supabase Auth.

Performance advisor:
- Six unindexed foreign keys.
- Twenty-four auth-function RLS init-plan notices.
- One multiple-permissive-SELECT-policy notice on notes.
- Twenty unused-index notices (likely influenced by the very small live dataset; do not drop indexes on this basis alone).

These are triage items, not authorization to change the live database. Resolve security findings individually with a reviewed migration/settings plan and regression tests.

## 9. Not yet tested

This pass did not run local commands or live authenticated browser tests. The following remain open:
- TypeScript, lint, unit tests and production build baseline on current main.
- Authenticated student journey and actual production Supabase schema parity with checked-in migrations.
- Exact runtime question counts for every bank and all public count surfaces.
- Full NUST and USAT standalone-practice persistence trace.
- Mock-pattern verification against current official sources.
- RLS/security review and any live entitlement/access checks.
- Mobile/desktop visual audit and Vercel public access.

Do not mark any of these as passed without observed evidence.

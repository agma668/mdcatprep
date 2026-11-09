# Apex Pakistan — Next-Wave Build Queue

**Prepared:** 2026-11-09  
**Repository:** `agma668/mdcatprep`  
**Working branch:** `apex/free-beta-truth-and-content-readiness`  
**Base:** `apex/confirm-edweb-boundary` at `bff93fbaf3d25f78292f73c923d80078fa749a7e`  
**Purpose:** Build a focused, verifiable work queue before using the founder's limited Freebuff session.

This document is planning and source-code inspection only. It does not authorize production database writes, schema changes, deployment promotion, billing changes, or paid services.

## 1. Product direction (confirmed)

Apex is one academy, one account system and one application, with multiple exam-specific Prep Spaces. A student can hold multiple goals; each Prep Space gets only the tools, content, mock rules and progress relevant to that exam.

Do not build a separate website/account for every exam. Do not put every exam's tools into one undifferentiated dashboard. Reuse infrastructure and learning engines underneath, but keep exam content, assessment rules, access and progress explicitly scoped.

Project boundary:
- Repository: `agma668/mdcatprep`
- Supabase: founder-confirmed Apex project `edweb`
- Vercel: founder-confirmed Apex project `edweb`
- Credit College Prep and Cadet College projects are separate and out of scope.
- Agent Board work is owned by Freebuff and is out of scope for this queue.

## 2. Verified current blockers

### P0 — Practice attempts cannot become reliable server-side progress yet

The live `questions` table was verified empty during the preceding read-only audit. The source banks are bundled in the repository. `recordAttemptByQuestionKey()` in `app/actions/practice.ts` looks up a stable question key (then exact question text) in `public.questions` before inserting `question_attempts`. With no canonical row, it returns `Question not found.`.

The offline queue can preserve a signed-in student's pending answer locally, but it cannot create the canonical database attempt until the matching question row exists. A held queue item is not the same as a durable analytics record.

Relevant files:
- `app/actions/practice.ts`
- `lib/offline-sync.ts`
- `lib/offline.ts`
- `components/practice/PracticeSession.tsx`
- `app/dashboard/mock-test/test/MockTestPlayer.tsx`
- `scripts/seed-mdcat-questions.mjs`

**Do not run the legacy seed script.** It uses the service-role key, publishes rows immediately, only handles the MDCAT bank, and creates no exam/variant mappings. Its default invocation writes to whichever Supabase URL is in `.env.local`. It is not a safe multi-exam ingestion pipeline.

Required safe sequence:
1. Audit and normalize each bundled bank locally without contacting Supabase.
2. Establish the approved exam/variant IDs and mapping rules.
3. Add a new idempotent importer with dry-run as the default and explicit allowlisted target checks.
4. Test importer and RLS on an isolated, genuinely free environment or a local disposable database. Do not create a paid Supabase branch.
5. Import only reviewed content as draft/review state first; publish only after explicit content QA.
6. Verify server-side exam mapping and student-goal authorization before enabling persistent student practice.
7. Test answer → database row → refresh → progress query → goal-specific analytics, including retry/idempotency and offline sync.

### P0 — Exam taxonomy and content labels are not yet trustworthy

The source audit found several mismatches that must be resolved before publicly advertising all current portals as complete:

| Current surface / bank | Verified concern | Safe next action |
|---|---|---|
| `lib/usat-comprehensive-bank.ts` and `/usat/practice` | The 100-MCQ bank is described in the audit as the Balochistan / Ex-FATA scholarship Pre-Medical bank, not a complete standard HEC USAT-M paper. | Verify the current official scholarship pattern and rename the Prep Space accurately. Keep standard HEC USAT as a separate exam with variants. |
| `lib/nust-questions.ts` and engineering chooser | NUST, GIKI and LUMS are grouped together, but the current bank is NET-pattern content. No independent GIKI or LUMS LCAT bank is established. | Label shared NET-pattern content honestly; do not imply independent GIKI/LUMS coverage. |
| `lib/exams-config.ts` | Four broad portal keys combine distinct exams and variants. | Move toward stable exam IDs plus variant IDs from `EXAM-REGISTRY-PROPOSAL.md`. |
| `lib/prep-tests.ts` | Current choices live in localStorage and do not model multiple account-owned goals. | Keep it as a temporary UI preference only; do not use it for authorization or analytics boundaries. |
| `lib/questions-repo.ts` | Published-question queries and fallback filling are not scoped by stable exam mappings. | Do not add more shared-pool content until server queries filter through explicit exam mappings. |

Official exam names, eligibility, patterns, dates, marks and section weightings must be sourced and dated before being presented as official. Do not invent a paper pattern to make a portal look complete.

### P0 — Progress is student-scoped but not goal-scoped

The existing audit found:
- `question_attempts` is tied to the student and question, not a `student_goal_id`.
- Bookmarks and flashcard review state are not independently scoped per preparation goal.
- Analytics and mistake review aggregate across the student's overall attempt history.
- One free-text `profiles.exam_target` is not a multi-goal model.

The intended model is already documented in `EXAM-DATA-BOUNDARY-DESIGN.md`: identity, student goal, content mapping, entitlement and progress are separate concepts. The active goal is a navigation preference, never a security boundary. Every server request must validate the goal belongs to the authenticated user.

Do not add a client-only exam filter and call that data isolation.

### P1 — Readiness claims and pricing need to match reality

The existing readiness audit records that several exam-specific tools are partial or local-only. The public exam pages and pricing page must distinguish implemented, beta, in-progress and coming-soon functionality.

On this branch, `app/pricing/page.tsx` has been changed to remove the fake enrollment form and false success message. The new page says account creation is free during beta, does not claim a pass was activated, and links to signup and exam discovery. This code change is committed but still requires lint/build/preview verification.

Do not add a payment provider, paid API, paid integration, paid Supabase branch, paid Vercel feature, trial or billing setting. No monetization implementation is part of this work queue.

### Fresh official-source verification — 2026-11-09

These are source-backed checks for the next blueprint review. They do not authorize a content import or a public claim that an entire Prep Space is complete.

| Exam / process | Official-source finding | Product implication |
|---|---|---|
| PMDC MDCAT 2026 | PM&DC's 19 May 2026 notice says the MDCAT-2025 curriculum applies to MDCAT-2026. The official pattern is 180 paper-based MCQs, 3 hours, no negative marking, with 81 Biology / 45 Chemistry / 36 Physics / 9 English / 9 Logical Reasoning. | The generic mock in `app/dashboard/mock-test/page.tsx` currently has a 100-mark custom split (34/24/30/12) and no Logical Reasoning section. It must be labelled as a scaled practice mock, not an official-format full mock, until its content pool and assessment profile match the current official blueprint. |
| HEC Balochistan & Ex-FATA scholarship test | The latest official content-weightage PDF located is Batch-IV (HEC page references 2025): 100 MCQs / 100 minutes. Pre-Medical split is Verbal 26, Quantitative 32, Physics 11, Chemistry 11, Biology 20. This exactly matches the current scholarship mock split. No newer 2026 batch-specific pattern was located in this search. | Preserve the bank as scholarship-specific preparation, not standard HEC USAT-M. Store the batch/version and source date in the assessment profile; re-check the next HEC batch before presenting it as current. |
| NUST NET | NUST's current admissions weightings page lists NET-Engineering as Mathematics 50%, Physics 30%, English 20%; Applied Sciences as Biology 50%, Chemistry 30%, English 20%; Business/Social Sciences as Quantitative Mathematics 50%, English 50%; Architecture as Design Aptitude 50%, Mathematics 30%, English 20%; Natural Sciences as Mathematics 50%, English 50%. An older 2025 prospectus shows a different Engineering weighting. | Keep NET paper variants separate. The current NET-Engineering mock uses the current 50/30/20 weighting and scales down to the 81-question bank; do not reuse it for Applied Sciences, Business/Social Sciences, Architecture or Natural Sciences. Record source retrieval/version dates. |
| NUMS MDCAT 2026 | NUMS's official 2026 admissions page links a dedicated NUMS MDCAT-2026 syllabus and identifies the test as mandatory for the listed NUMS/affiliated/armed-forces-administered colleges. The linked PDF could not be fetched during this review, so exact sections and weightings remain unverified here. | Do not assume NUMS is identical to the PMDC MDCAT, and do not advertise a separate Paper-II psychological test without an official source. This branch now labels NUMS as a separate syllabus and hides the unverified psychology feature until the syllabus is reviewed. |
| ISSB selection | ISSB's official page describes a four-day, three-dimensional selection process: psychologist, GTO and Deputy President/interview dimensions. | The current Verbal/Non-Verbal question set is only a focused reasoning drill. It must not be named or presented as a complete ISSB mock or full ISSB preparation workflow. This branch updates the labels accordingly. |

Official sources reviewed:
- PM&DC, Public Notice Regarding MDCAT-2026: https://pmdc.pk/Documents/Others/Public%20Notice%20Regarding%20MDCAT-2026%20Date%20Announcement.pdf
- PM&DC, MDCAT syllabus publication page: https://pmdc.pk/Publication/Syllabus
- HEC, Balochistan/Ex-FATA Batch-IV content weightages: https://www.hec.gov.pk/english/scholarshipsgrants/BF-III/Documents/Content-Weightages-BAL-FATA.pdf
- HEC, Batch-IV programme page: https://www.hec.gov.pk/english/scholarshipsgrants/BF-III/Pages/default.aspx
- NUST, Subjects Included in NET with Weightings: https://nust.edu.pk/admissions/undergraduates/subjects-included-in-net-with-weightings
- NUST, 2025 prospectus (older conflicting weighting reference): https://nust.edu.pk/wp-content/uploads/2020/03/MARCOMS-PROSPECTUS-2025-V.5.0-04032025_compressed.pdf
- NUMS, MDCAT 2026 official admissions/syllabus page: https://numspak.edu.pk/news-detail/nums-mdcat-2026-for-admissions-in-mbbs-bds-session-2026-27\n- ISSB, Selection System: https://www.issb.gov.pk/selection-system

## 3. Recommended architecture

Use the approved Prep Space model:

- `exam_registry`: stable exam identity, category and readiness.
- `exam_variants`: official stream/paper variants under an exam.
- `exam_blueprints` / `assessment_profiles`: versioned syllabus, assessment rules and sources.
- `student_goals`: one account can own multiple exam/variant goals.
- `question_exam_map`: explicit question-to-exam/variant relationship and review state.
- `question_attempts.goal_id` (or a reviewed equivalent): durable progress belongs to a goal.
- Equivalent goal scoping for bookmarks, flashcard reviews and student-created notes.
- Future entitlement products/grants are exam-scoped and server-enforced; do not repurpose global profile approval as a purchase entitlement.

A question may map to multiple exams only through explicit reviewed mapping rows. A shared subject is not evidence that a question belongs to two exams.

The current migration proposal is a foundation, not a complete entitlement or goal-scoped progress implementation. Review the proposal against the existing schema before writing any production migration.

## 4. Work to do before the next Freebuff session

### Our preparation work

- [x] Inspect the current PR and verify that Freebuff's local commit is not yet on GitHub.
- [x] Create a separate working branch so new work does not overwrite his local workspace.
- [x] Remove the fake pricing activation flow and unnecessary phone-number collection.
- [x] Record the content-ingestion and exam-isolation blockers in this build queue.
- [x] Add structural bank audit coverage for MDCAT, scholarship, NUST-pattern and PMA banks; the new test still needs to be executed.
- [ ] Review academic correctness, official syllabus alignment, source provenance and answer distributions with human QA.
- [x] Produce a read-only structural bank audit/validation tool; no network access and no database writes.
- [x] Pricing-only commit reached Vercel READY; latest combined head still needs a READY build and preview smoke.
- [x] Prepare an exact file-level implementation and QA plan for the question-ingestion pipeline.
- [x] Record current exam-pattern/readiness risks and next steps in this queue; a student-facing readiness matrix remains open.

### Freebuff's later one-hour session

Use his time for implementation and independent verification, not open-ended discovery:

1. Push his existing local changes to the intended branch and report the exact commit SHA.
2. Rebase/compare carefully; do not overwrite the new branch or force-push.
3. Run `npm test`, `npm run lint`, `npx tsc --noEmit` and `npm run build` on the combined head.
4. Verify the pricing page at desktop and mobile widths; confirm no fake activation, no phone collection, and signup/exam links work.
5. Review the static-bank validator and add missing test coverage.
6. Review the exam/variant taxonomy and flag any unsupported or misleading public label.
7. Inspect the practice save path and prove the exact failure mode with tests; do not write to production Supabase.
8. Review RLS/data-boundary assumptions and produce a migration plan only; no production SQL.
9. Return a concise report with commit SHA, changed files, exact command results, preview URL/status, unresolved blockers and zero-cost confirmation.

## 5. Release gates

Do not merge or promote this work until all of the following are true:

- Final feature-branch head passes tests, lint, typecheck and production build.
- Vercel preview for the exact final head reaches READY.
- Public access and responsive smoke are verified in a clean browser.
- Pricing and exam readiness claims are accurate.
- Question banks pass structural validation and content review.
- Every student attempt is associated with a validated exam goal and explicit question mapping.
- Online, offline, retry, duplicate submission and refresh flows are verified.
- RLS and server actions prevent cross-student and cross-exam reads/writes.
- No production data/schema, billing or paid infrastructure has been changed without explicit approval.

**Current status:** not student-launch-ready. The immediate priority is trustworthy content identity and goal-scoped persistence, not adding more features or more portals.

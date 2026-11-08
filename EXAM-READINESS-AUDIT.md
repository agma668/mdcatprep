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
| mdcat | MDCAT, NUMS, USAT-M, Balochistan and FATA/KPK variants | mdcat | USAT-M is also implemented as a distinct bundled bank and practice mode, so it is not simply another MDCAT subtest. |
| nust | NUST NET, GIKI, LUMS SBASSE, USAT-E | nust | GIKI/LUMS share the NET bank by explicit disclosure; USAT-E is listed here but has no matching engineering chooser/bank established in lib/prep-tests.ts. |
| pma | PMA initial, ISSB, Navy/AFNS | pma | The actual military chooser supports PMA and ISSB only; Navy/AFNS are not evidenced as separate workflows. |
| usat | USAT Arts and Commerce | usat | The bundled bank and dedicated mock are specifically USAT-M scholarship content; the config's Arts/Commerce variants do not match that bank's described scope. |

### Routes observed

- Public discovery: /, /exams, /portal/[exam], plus topic, past-paper, notes, resources, blog, FAQ and pricing pages.
- Main student area: /dashboard and its practice, mock, notes, flashcards, mistakes, bookmarks, analytics and profile routes.
- Dedicated practice pages: /nust/practice, /usat/practice and /pma/practice.
- Shared exam session: /practice/session.
- Dynamic /portal/[exam] renders one of the four config entries. Its subtest cards append ?subtest=<id> to the configured route; the current practice-choice system instead reads/writes a localStorage value. End-to-end handling of every subtest query needs route-level verification.

Current /portal/[exam] is a public portal overview, not a dedicated authenticated Prep Space. The config route often points directly to a dashboard/practice route. There is not yet a consistent public-exam-page → authenticated-Prep-Space pair per stable exam ID.

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

This is the most important content-isolation risk to resolve before expanding the shared question table. The college text column is not a substitute for a stable exam taxonomy and is currently not used by the canonical question repository.

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
| HEC USAT-M | Dedicated 417-question bank, chapter/category drill and chooser | Dedicated 100-question/100-minute scholarship mock | Stable question-key recording through shared session/mock path; no goal partition | Strong distinct non-MDCAT bank; still not isolated |
| HEC USAT-E / CS | Listed in old config/signup language; no dedicated matching engineering chooser/bank established by this pass | No verified dedicated USAT-E mock established | No goal partition | Not ready; do not advertise as complete |
| USAT Arts / Commerce | Listed in standalone USAT config; bank scope mismatch with USAT-M | No dedicated Arts/Commerce mock established | No goal partition | Not ready; registry needs correction |
| NUST NET | Dedicated 81-question bank and dedicated practice page | NET-Engineering mock uses official weighting, scaled to available bank | Mock player records answers; standalone practice persistence needs verification; no goal partition | Working foundation, small bank and no isolation |
| GIKI / LUMS | Explicitly share the NET bank; current chooser labels this honestly | No distinct GIKI/LUMS pattern-specific mock established | No goal partition | Shared-content beta only; not independent full Prep Spaces |
| PMA Long Course | Dedicated 41-question bank; Verbal/Non-Verbal/Academic workflow | Original scaled mock with explicit non-official caveat | Standalone practice appears local-state; mock records attempts; no goal partition | Distinct workflow foundation; progress gap |
| ISSB | Shares PMA intelligence content; selection-specific workflow is partial | Intelligence-only original simulation | Same PMA question/attempt model | Partial; requires broader stage-specific blueprint |
| Navy / AFNS | Mentioned as config subtests/signup options, no dedicated workflow evidenced | Not established | Not established | Not ready |
| MBBS clinical notes | Separate notes surface exists, not a top-level exam registry entry | Not applicable | Notes are not clearly tied to a clinical learning goal | Separate product area; audit independently |
| CSS/PMS, IELTS/PTE, Matric/FSc/O/A Levels, other admissions/careers | No implemented Prep Space identified in current registry/routes during this pass | Not established | Not established | Planned inventory only; do not market as live |

Readiness labels describe evidence in the current repository, not a claim that every question has been content-reviewed or that the live production database matches migrations.

## 6. Recommended implementation sequence

1. Freeze the taxonomy proposal before coding: define stable exam IDs and decide which tests genuinely share a syllabus/bank versus only a reusable engine. Explicitly separate USAT-M from MDCAT; decide how USAT-E/CS and Arts/Commerce are represented; do not silently map them to NUST or USAT-M.
2. Build an Exam Registry + Preparation Blueprint proposal in code-independent documentation first. Include official authority/source/version, eligibility, syllabus, bank/source IDs, practice mode, mock rules, features, readiness and content owner.
3. Define the data boundary: questions/content ownership, preparation goals, entitlements, and exam-scoped attempts/bookmarks/notes/flashcard state. Draft migrations and RLS tests only; do not apply to production yet.
4. Design compatibility/backfill: existing single exam_target values and historical attempts must be mapped cautiously. Do not guess ambiguous history; preserve legacy data and mark unknown scope honestly.
5. Prove the boundary with two contrasting spaces: MDCAT first (MCQ-heavy) and PMA second (selection-oriented). Then add USAT-M as a separately configured aptitude paper.
6. Only after access boundaries are tested: replace “Free forever” public claims with explicit launch policy and add server-enforced entitlements. Payment rails and prices require separate research/approval.
7. Then expand additional exam families based on content quality and actual workflows, not the breadth of the signup dropdown.

## 7. Not yet tested

This pass did not run local commands or live authenticated browser tests. The following remain open:
- TypeScript, lint, unit tests and production build baseline on current main.
- Authenticated student journey and actual production Supabase schema parity with checked-in migrations.
- Exact runtime question counts for every bank and all public count surfaces.
- Full NUST and USAT standalone-practice persistence trace.
- Mock-pattern verification against current official sources.
- RLS/security review and any live entitlement/access checks.
- Mobile/desktop visual audit and Vercel public access.

Do not mark any of these as passed without observed evidence.

# Exam Registry & Preparation Blueprint Proposal

**Status:** Draft for founder/product review — not implemented  
**Date:** 2026-11-08  
**Depends on:** PRODUCT-ARCHITECTURE-DECISION.md and EXAM-READINESS-AUDIT.md

## Purpose

Replace the current four broad portal keys with a stable, explicit registry of actual preparation goals. The registry should describe the exam a student is preparing for; a Preparation Blueprint should configure the learning experience for that exam. The same reusable engine may serve several exams, but content, rules, saved progress and access must remain explicitly scoped.

This is a proposal, not a final claim that every listed exam is supported. IDs are stable technical identifiers; display names and official exam patterns may change by year.

## 1. Registry rules

1. Give each genuinely distinct exam or preparation goal a stable ID.
2. Do not create a separate exam ID just because a province, university or conducting body delivers the same nationally defined exam pattern. Store that as an authority/region/administration variant when the official pattern is genuinely shared.
3. Create a separate ID when the syllabus, paper structure, scoring, eligibility or candidate journey materially differs.
4. Reuse an assessment engine only through an explicit exam blueprint and versioned assessment profile.
5. Never infer that two exams share a question pool merely because they share a subject.
6. A question can be intentionally mapped to more than one exam, but that relationship must be explicit and reviewable.
7. A student account may hold multiple preparation goals. A goal is not just a single profile text field or a browser preference.
8. Readiness must be visible and evidence-based: Available, Beta, Content in progress, Coming soon or Not offered.
9. All IDs and proposed groupings below remain subject to official-source verification before the relevant exam is advertised as available.

## 2. Proposed first-wave exam IDs

### Medical and health

| Proposed ID | Student-facing name | Relationship / notes | Current repository evidence |
|---|---|---|---|
| pmdc-mdcat | PMDC MDCAT | One core exam. UHS, SZABMU, KMU, DUHS and BUMHS should initially be authority/region metadata, not five separate Prep Spaces, unless official rules differ for a particular sitting. | Large MDCAT bank and shared practice/mock infrastructure exist; exam-scoped data boundary is missing. |
| nums-mdcat | NUMS MDCAT | Separate exam configuration because NUMS has its own paper/rules and the repository references a separate Paper-II/psychological component. | Medical core and NUMS-specific content are present in some surfaces; complete pattern and progress audit remains open. |
| hec-usat-m | HEC USAT-M (Pre-Medical) | Separate aptitude/scholarship exam; must not be treated as a PMDC MDCAT subtest. | Dedicated bundled bank, topic/category drill and timed mock exist. |
| mbbs-clinical | MBBS Clinical Learning | Not an entrance exam. Keep as a separate post-admission learning product area, with year/subject curriculum configuration. | Clinical notes surface exists; broader learning workflow requires separate audit. |

### Engineering and university admissions

| Proposed ID | Student-facing name | Relationship / notes | Current repository evidence |
|---|---|---|---|
| nust-net-engineering | NUST NET Engineering | Own versioned pattern and weighting. | Dedicated bank and scaled mock exist; current bank is small relative to the full paper. |
| nust-net-computing | NUST NET Computing | Separate blueprint if official subject distribution or scoring differs from Engineering. Do not assume the same pattern without current official verification. | No independently verified computing blueprint in this pass. |
| giki-ug | GIKI Undergraduate Admission Test | Separate exam ID; may reuse question-player components but needs its own content map and mock rules. | Current chooser explicitly shares the NET bank; treat as shared-content beta, not a complete GIKI Prep Space. |
| lums-sbasse | LUMS SBASSE Admission | Separate exam ID and official pattern. | Current chooser explicitly shares the NET bank; distinct pattern/content not established in this pass. |
| uet-ecat | UET ECAT | Separate exam ID with province/institution variants represented as metadata where justified. | No complete dedicated Prep Space established in this pass. |
| hec-usat-e | HEC USAT-E (Pre-Engineering) | Separate from NUST/GIKI/LUMS and from USAT-M. | Appears in old config/signup text, but no dedicated matching bank/chooser/mock established in this pass. |
| hec-usat-cs | HEC USAT-CS (Computer Science) | Separate blueprint if confirmed by the current HEC test catalogue and official syllabus. | Signup/config mentions it; a distinct implementation was not established in this pass. |

### Defence and selection

| Proposed ID | Student-facing name | Relationship / notes | Current repository evidence |
|---|---|---|---|
| pma-long-course | PMA Long Course | A full candidate journey: eligibility, initial screening, physical/medical guidance where appropriate, interview and selection stages. | Dedicated Verbal/Non-Verbal/Academic bank and original scaled mock exist; standalone practice progress appears local-state. |
| issb-selection | ISSB Selection Preparation | Could be a standalone goal or a stage attached to a PMA/armed-forces goal. Keep the relationship explicit; do not equate ISSB with only an intelligence MCQ test. | Intelligence-only mock and partial practice exist; full selection-oriented workflow is not established. |
| navy-initial | Pakistan Navy Initial Test | Separate only after official process, role and test formats are verified. | Mentioned in old config/signup text; no dedicated workflow established. |
| paf-initial | Pakistan Air Force Initial Test | Separate only after official process, role and test formats are verified. | Not established in current registry. |
| afns-entry | AFNS Entry | Separate nursing-entry journey with its own verified eligibility, syllabus and assessment configuration. | Mentioned in old config; no dedicated workflow established. |

### Other future categories — inventory only, not launch commitments

| Proposed ID pattern | Category | Required configuration |
|---|---|---|
| css | CSS Competitive Examination | FPSC syllabus/version, compulsory and optional subjects, essay/precis/descriptive writing, current affairs, timed submissions and feedback. |
| pms-{province} | Provincial Management Service | Province-specific commission, syllabus/version, compulsory/optional papers and writing workflow. |
| ielts-academic / ielts-general | IELTS | Distinct reading/listening/writing/speaking tasks and full simulations. |
| pte-academic | PTE Academic | Current task types, speaking/listening/writing/reading scoring and simulations. |
| matric-{board}-{class} | Matriculation | Board, class, subject, textbook/syllabus edition and board-style assessment. |
| fsc-{board}-{group} | FSc / Intermediate | Board, pre-medical/pre-engineering/ICS/commerce group, year and syllabus version. |
| o-level / a-level | Cambridge qualifications | Subject, syllabus code, examination series and assessment objectives. |

The future category inventory is deliberately broad, but these entries must remain unlisted or Coming soon until a verified blueprint and actual learning workflow exist.

## 3. Preparation Blueprint shape

Each registry entry should resolve to a versioned blueprint with these conceptual fields:

| Field | Purpose |
|---|---|
| exam_id | Stable immutable ID. |
| blueprint_version | Version of this product's exam configuration. |
| display_name / short_name | Student-facing names. |
| category_id | Academy category. |
| readiness_status | Available, Beta, Content in progress, Coming soon, Not offered. |
| audience | Who the preparation is for. |
| examining_authority | Official authority/commission/university. |
| official_sources | URLs and retrieval/verification date; never invent authority claims. |
| syllabus_version | Official syllabus/pattern version or year. |
| syllabus_map | Subjects, topics, learning outcomes and their source. |
| content_sources | Bundled bank, curated DB content, official public papers, original content; with provenance. |
| question_pool_ids | Explicit mapping to approved exam question pools. |
| practice_mode | MCQ, written response, essay, listening, speaking, interview, etc. |
| assessment_profiles | Versioned duration, sections, weightings, marks, negative marking and any scaling disclosure. |
| enabled_capabilities | Only the tools appropriate to this exam. |
| navigation | Exam-specific student navigation. |
| progress_metrics | What “progress” means for this exam. |
| entitlement_product_ids | Products/grants that can unlock this exam. |
| content_owner / review_state | Responsible reviewer and content QA state. |

Do not place large question arrays or counts inside the client-side registry. The registry is configuration; actual counts must be derived from the approved question source.

## 4. Student goal and access model

Conceptual model (table names are illustrative; no migrations have been written):

- **exam_registry** — canonical stable exam IDs and category metadata.
- **exam_blueprints** — versioned exam configuration and readiness state.
- **student_goals** — user_id, exam_id, goal status (active/paused/completed), optional target date and preferences. One account can hold multiple goals.
- **questions** — stable content records with provenance and publication state.
- **question_exam_map** — explicit many-to-many mapping from question to exam, with mapping rationale/reviewer and syllabus alignment. Shared questions must be mapped deliberately, never by subject-name coincidence.
- **assessment_profiles** — exam_id + versioned paper rules and scaling disclosure.
- **question_attempts** — goal_id (or another verified exam-scoped context) plus question_id, answer, correctness and timing.
- **question_bookmarks** — goal_id + question_id.
- **notes/content_exam_map** — content can be mapped to one or more exam IDs explicitly.
- **flashcard_reviews** — goal_id + card_id, so the same student can retain independent review histories for different goals.
- **entitlement_products** — named exam pass or bundle definition.
- **product_exam_access** — explicit list of exam IDs granted by each product.
- **entitlement_grants** — user_id, product_id, status, valid_from, valid_until, source/order reference and revocation/refund state.

A single exam purchase must not grant another exam unless product_exam_access explicitly includes it. A launch-free policy can create an explicit grant or a clearly defined launch entitlement; do not hardcode permanent free access.

## 5. Security and historical-data rules

- All student access decisions happen server-side. A client-side chooser is navigation state, never authorization.
- Student reads/writes must be scoped through the authenticated user and their goal/entitlement.
- RLS policies must prevent cross-user and cross-exam access. Service-role actions must still validate the current user's goal and entitlement before returning protected content or writing progress.
- Avoid relying on a mutable profile.exam_target value as the authorization source.
- Existing question_attempts have no exam identifier. Do not blindly backfill every historical attempt from the student's current profile target; students may have changed targets or used several exams. Preserve unknown scope as legacy/unknown unless a deterministic question-to-exam mapping and reliable historical context exist.
- Existing bookmarks, flashcard reviews and notes need the same cautious migration strategy.
- Draft and test migrations/RLS on a disposable or staging database first. Do not apply production schema changes until the founder approves a reviewed migration and backup/rollback plan.

## 6. Route proposal

Use one application and stable exam slugs:

- Public information: /exams/{exam-slug}
- Authenticated Prep Space: /learn/{exam-slug}
- Optional category discovery: /exams/category/{category-slug}

These are proposed routes only. Existing routes should be mapped as aliases/redirects after the registry and access model are accepted. Do not rename all routes in one pass. Every authenticated Prep Space must show its active exam, readiness state and included/locked capabilities.

## 7. Recommended product defaults (unless official-source research disproves them)

These are the proposed decisions to carry forward so implementation does not stall on avoidable taxonomy questions:

1. **NUMS is separate from PMDC MDCAT.** It can reuse verified common science content through explicit question-to-exam mappings, but it keeps its own Paper-I/Paper-II rules, readiness and progress.
2. **Provincial PMDC MDCAT conducting bodies are metadata variants** under one PMDC MDCAT blueprint where the official syllabus/pattern is the same. If a particular year or sitting has a materially different pattern, version that assessment profile rather than inventing a new permanent exam identity.
3. **ISSB is both a linked selection stage and an optional standalone goal.** A PMA candidate can see it as the next stage in their journey; someone preparing specifically for ISSB can hold an ISSB goal. Access is still granted explicitly to the relevant goal(s).
4. **USAT-M is separate.** USAT-E and USAT-CS should receive separate IDs only after the current HEC catalogue and official test structure are verified. Arts/Commerce remain unlisted until the official variant names and a real content workflow are confirmed. Never map them to the USAT-M bank just to fill a card.
5. **NUST, GIKI and LUMS have separate exam IDs and blueprints.** They may temporarily share selected question content only through explicit mappings and honest beta labels. A shared MCQ engine does not make their exams the same.
6. **Early access is complimentary per selected exam goal, not blanket all-access.** During a free launch period, a student chooses a Prep Space and receives a clearly defined launch grant for that exam. Other Prep Spaces remain separately selected and granted. Later, a paid purchase unlocks only the named exam unless a bundle explicitly lists more exams. No dates or prices are set here.
7. **No universal lifetime bundle by default.** Bundles can be considered later when there is a clear product and support reason; every included exam must be listed explicitly. No prices or payment providers are approved in this proposal.

### Official-source verification still required

- Verify current HEC USAT variants and current-year patterns before publishing USAT-E/CS/A/C pages.
- Verify current NUST NET Engineering vs Computing formats, GIKI, LUMS LCAT/SBASSE and UET ECAT independently.
- Verify PMDC/NUMS current-year syllabus and paper rules before setting assessment-profile versions.
- Verify the PMA/ISSB stages from official recruiting/selection guidance before advertising a full selection journey.
- Verify board/curriculum-specific requirements before opening Matric/FSc/O/A-Level spaces.

## Acceptance test

A student with MDCAT and PMA goals can switch between two distinct Prep Spaces under one account. Each space shows the correct content and assessment rules; attempts, bookmarks, notes and flashcard review remain separate; a grant for MDCAT alone cannot retrieve PMA-protected content or write PMA progress. A student with only one goal sees no confusing unrelated tools. The system can transition from a free launch grant to a paid exam-specific grant without changing the account identity model.

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
| hec-usat | HEC Undergraduate Studies Admission Test (USAT) | One HEC exam with six distinct stream variants: Pre-Medical, Pre-Engineering, Arts & Humanities, Commerce, Computer Science and General Science. Each goal selects one official variant. Standard USAT is not the same as the Balochistan/FATA scholarship test. | No complete standard-USAT workflow established. Current bank/mock is not the standard 75-MCQ + essay format. |
| hec-bfap-scholarship | HEC Balochistan & Ex-FATA Undergraduate Scholarship Test | Separate scholarship assessment with its own batch/version and stream variant. Current bundled 100-MCQ bank matches the Pre-Medical scholarship variant, not mainstream USAT-M. | Dedicated 100-question bank/mock exists for the Pre-Medical scholarship variant; official current-batch pattern needs re-verification before public claims. |
| mbbs-clinical | MBBS Clinical Learning | Not an entrance exam. Keep as a separate post-admission learning product area, with year/subject curriculum configuration. | Clinical notes surface exists; broader learning workflow requires separate audit. |

### Engineering and university admissions

| Proposed ID | Student-facing name | Relationship / notes | Current repository evidence |
|---|---|---|---|
| nust-net | NUST Entry Test (NET) | One NUST exam with distinct official paper variants: Engineering, Applied Sciences, Business & Social Sciences, Architecture and Natural Sciences. NET-Engineering is also used for Computing programmes; do not invent a separate Computing paper. | Dedicated 81-question bank and scaled NET-Engineering mock exist. Other NET variants are not established. |
| uet-ecat | UET ECAT | Separate exam ID with province/institution variants represented as metadata where justified. | No complete dedicated Prep Space established in this pass. |
| giki-ug | GIKI Undergraduate Admission Test | Distinct from NUST NET and LUMS. Own verified subject blueprint and mock rules required. | Existing engineering chooser shares NET bank; no independent GIKI bank/mock established. |
| lums-sbasse | LUMS SBASSE Admission Route | LUMS applicants may use SAT, ACT or LCAT; the Prep Space should focus on LCAT only if that is the student's selected route. Do not call it a universal LUMS test. | Current chooser shares NET bank; no distinct LCAT workflow established. |


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

Each registry entry should resolve to a versioned blueprint with these conceptual fields. Where an exam has official stream/paper variants, model them as child assessment variants rather than pretending they are separate exams unless access/content truly needs separate products:

| Field | Purpose |
|---|---|
| exam_id | Stable immutable ID. |
| variant_id | Optional official paper/stream variant ID (e.g. HEC USAT Pre-Medical or NUST NET Engineering). Required where the official exam has materially different papers. |
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
- **exam_variants / assessment_profiles** — versioned official paper variants under an exam, with their own syllabus, sections, timing and scoring.
- **student_goals** — user_id, exam_id, optional variant_id, goal status (active/paused/completed), optional target date and preferences. One account can hold multiple goals.
- **questions** — stable content records with provenance and publication state.
- **question_exam_map** — explicit mapping from question to exam and optional variant, with mapping rationale/reviewer and syllabus alignment. Shared questions must be mapped deliberately, never by subject-name coincidence.
- **assessment_profiles** — exam_id + versioned paper rules and scaling disclosure.
- **question_attempts** — goal_id (or another verified exam-scoped context) plus question_id, answer, correctness and timing.
- **question_bookmarks** — goal_id + question_id.
- **notes/content_exam_map** — content can be mapped to one or more exam IDs explicitly.
- **flashcard_reviews** — goal_id + card_id, so the same student can retain independent review histories for different goals.
- **entitlement_products** — named exam pass or bundle definition.
- **product_exam_access** — explicit list of exam IDs and optional variant IDs granted by each product. A null variant means all variants only when the product explicitly intends that.
- **entitlement_grants** — user_id, product_id, status, valid_from, valid_until, source/order reference and revocation/refund state.

A single exam purchase must not grant another exam unless product_exam_access explicitly includes it. If the product is limited to one variant within an exam, the grant must include that variant; do not silently unlock every stream. A launch-free policy can create an explicit grant or a clearly defined launch entitlement; do not hardcode permanent free access.

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
4. **HEC USAT is one exam with six official stream variants**, represented by one exam ID plus a selected variant ID: Pre-Medical, Pre-Engineering, Arts & Humanities, Commerce, Computer Science and General Science. HEC's standard USAT has Part I (75 MCQs / 100 minutes) plus Part II (40 minutes for two essay tasks, 25 marks total). HEC says USAT is recommended but universities decide whether to accept it; never say it is mandatory for every university. The current repository's 100-MCQ / 100-minute bank is the **Balochistan / ex-FATA undergraduate scholarship-test Pre-Medical variant**, not standard HEC USAT-M. Give it a separate exam ID (hec-bfap-scholarship) and a versioned stream variant. Do not relabel the existing bank as standard USAT-M.
5. **NUST NET is one exam with five official paper variants**: Engineering, Applied Sciences, Business & Social Sciences, Architecture and Natural Sciences. Engineering NET is used for Engineering and Computing programmes. The repository's NET-Engineering mock currently matches NUST's official 50% Mathematics / 30% Physics / 20% English split; the broader portal subject labels still need correction. GIKI and LUMS are separate exam goals with separate blueprints. LUMS SBASSE applicants may use SAT, ACT or LCAT; offer an LCAT Prep Space only when that is the chosen route. GIKI/LUMS may temporarily share selected content only through explicit mappings and honest beta labels.
6. **Early access is complimentary per selected exam goal, not blanket all-access.** During a free launch period, a student chooses a Prep Space and receives a clearly defined launch grant for that exam. Other Prep Spaces remain separately selected and granted. Later, a paid purchase unlocks only the named exam unless a bundle explicitly lists more exams. No dates or prices are set here.
7. **No universal lifetime bundle by default.** Bundles can be considered later when there is a clear product and support reason; every included exam must be listed explicitly. No prices or payment providers are approved in this proposal.

### Official-source verification still required

- HEC official-source snapshot (2026-11-08): USAT has six categories (Pre-Medical, Pre-Engineering, Arts & Humanities, Commerce, Computer Science, General Science); standard USAT Part I is 75 MCQs / 100 minutes plus Part II essay writing (40 minutes, 25 marks). HEC states USAT is optional for universities; each institution decides whether to accept it. See official HEC FAQ, sample-paper page and content-weightage PDFs.
- HEC's Balochistan / ex-FATA scholarship test has a distinct 100-MCQ / 100-minute paper; the current bundled 100-question bank matches the Pre-Medical scholarship variant. The exact applicable batch/version must be verified before marketing it as current.
- NUST's official NET page lists five paper types. NET-Engineering is Mathematics 50%, Physics 30%, English 20% and serves Engineering and Computing programmes. The current mock builder already follows this split; the portal config's Chemistry/Intelligence subject labels are stale.
- LUMS SBASSE accepts SAT, ACT or LCAT as alternative admission-test routes; the LCAT workflow should not be presented as the only route.
- NUMS 2026 official syllabus confirms Paper-I (Biology, Chemistry, Physics, English) and Paper-II (Psychological Test).
- Verify current NUST NET Engineering vs Computing formats, GIKI, LUMS LCAT/SBASSE and UET ECAT independently.
- Verify PMDC/NUMS current-year syllabus and paper rules before setting assessment-profile versions.
- Verify the PMA/ISSB stages from official recruiting/selection guidance before advertising a full selection journey.
- Verify board/curriculum-specific requirements before opening Matric/FSc/O/A-Level spaces.


## 8. Official-source verification snapshot (2026-11-08)

These sources correct the taxonomy and must be stored with retrieval/verification dates in the eventual registry:

| Authority | Verified finding | Product consequence | Official source |
|---|---|---|---|
| HEC / ETC | USAT has six categories: Pre-Medical, Pre-Engineering, Arts & Humanities, Commerce, Computer Science and General Science. | Model one HEC USAT exam with six variant profiles. | [HEC USAT sample papers](https://www.hec.gov.pk/english/services/students/etc/Pages/HAT-Sample-Papers.aspx) and [HEC FAQ](https://www.hec.gov.pk/english/services/students/etc/Pages/FAQ%27s.aspx) |
| HEC / ETC | Standard USAT has 75 MCQs in 100 minutes, followed by Part II essay-writing (40 minutes; argument and narrative tasks, 25 marks total). | Current 100-MCQ / 100-minute repo bank is not the standard USAT-M paper. | [HEC USAT content weightages PDF](https://www.hec.gov.pk/english/services/students/etc/Documents/Content%20Weightages%20for%20%28USAT%29.pdf) |
| HEC / ETC | USAT is recommended, but universities decide whether to accept USAT or run their own admission tests. | Do not claim USAT is mandatory for all universities. | [HEC clarification](https://www.hec.gov.pk/english/news/news/Pages/USAT-HEC.aspx) |
| HEC scholarship programme | The Balochistan / ex-FATA undergraduate scholarship test has a separate 100-MCQ / 100-minute structure. Its Pre-Medical split is Verbal 26, Quantitative 32, Physics 11, Chemistry 11, Biology 20. | Current bundled bank/mock aligns to this scholarship-test variant; keep it separate from standard HEC USAT and verify the applicable batch before publication. | [HEC Balochistan / Ex-FATA test weightages PDF](https://www.hec.gov.pk/english/scholarshipsgrants/BF-III/Documents/CW-BAL-FATA.pdf) |
| NUST | NET has five paper types: Engineering, Applied Sciences, Business & Social Sciences, Architecture and Natural Sciences. NET-Engineering is 50% Mathematics, 30% Physics, 20% English and serves Engineering and Computing programmes. | One NUST NET exam with variant profiles. Current mock builder follows the Engineering split; portal subject labels need correction. | [NUST subjects and NET weightings](https://nust.edu.pk/admissions/undergraduates/subjects-included-in-net-with-weightings) |
| GIKI | GIKI's undergraduate admission test is distinct and its official page describes Physics, Mathematics and English. | Keep GIKI separate from NUST; build its own blueprint and bank before advertising a full Prep Space. | [GIKI admission selection](https://giki.edu.pk/admissions/admissions-undergraduates/admission-selection/) |
| LUMS | SBASSE applicants can use SAT, ACT or LCAT as alternative admission-test routes. | An LCAT Prep Space is one selected route, not a universal LUMS test. | [LUMS admission FAQs](https://admission.lums.edu.pk/admission-faqs) |
| NUMS | The 2026 NUMS MDCAT syllabus separates Paper-I (Biology, Chemistry, Physics, English) and Paper-II (Psychological Test). | NUMS remains distinct from PMDC MDCAT and needs explicit paper profiles. | [NUMS MDCAT 2026](https://numspak.edu.pk/news-detail/nums-mdcat-2026-for-admissions-in-mbbs-bds-session-2026-27) |

**Important naming correction:** the repository's own docs/HEC-USAT-M-ANALYSIS.md already distinguishes mainstream HEC USAT-M from the Balochistan / ex-FATA scholarship test. The current lib/usat-mock.ts and student-facing labels still call the 100-MCQ scholarship mock “HEC USAT-M”. This is misleading and should be renamed to the scholarship-test identity after content/route migration is planned. Do not relabel the current bank as mainstream HEC USAT-M.

## Acceptance test

A student with MDCAT and PMA goals can switch between two distinct Prep Spaces under one account. Each space shows the correct content and assessment rules; attempts, bookmarks, notes and flashcard review remain separate; a grant for MDCAT alone cannot retrieve PMA-protected content or write PMA progress. A student with only one goal sees no confusing unrelated tools. The system can transition from a free launch grant to a paid exam-specific grant without changing the account identity model.

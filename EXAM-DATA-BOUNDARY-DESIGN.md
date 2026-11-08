# Exam-Scoped Data & Entitlement Boundary Design

**Status:** Design draft only — no SQL migration or database changes  
**Date:** 2026-11-08  
**Inputs:** EXAM-READINESS-AUDIT.md, EXAM-REGISTRY-PROPOSAL.md, PRODUCT-ARCHITECTURE-DECISION.md

## 1. Goal

A student account may hold multiple exam preparation goals. Every protected content read, practice attempt, bookmark, note and review state must be associated with the relevant goal/exam. A student who has access to one exam must not gain access to another exam because a question shares a subject name, a page is hidden in the UI, or a service-role query forgot a filter.

This design intentionally separates:
- **Identity:** who the student is.
- **Goal:** which exam they are preparing for.
- **Content mapping:** which exam(s) a question/resource is valid for.
- **Entitlement:** which exam(s) the student is allowed to prepare for.
- **Progress:** what the student has done inside one goal.

## 2. Conceptual entity model

| Entity | Key fields (conceptual) | Responsibility |
|---|---|---|
| site_products | site_product_id, title, status | Namespaces this academy separately from any other site/product sharing the same Supabase project. |
| exam_registry | exam_id, site_product_id, category_id, slug, title, status | Stable exam identity and discoverability inside one product. |
| exam_variants | exam_id, variant_id, title, status | Official stream/paper variants under one exam (e.g. HEC USAT Pre-Medical or NUST NET Engineering). |
| exam_blueprints | exam_id, version, readiness, syllabus_version, config | Versioned exam-specific experience. |
| student_goals | id, user_id, exam_id, variant_id, status, target_date, preferences | One student's chosen exam/variant goal. One user can have many goals. |
| question_exam_map | question_id, site_product_id, exam_id, variant_id, syllabus_topic_id, access_level, review_state | Explicitly maps shared question content to one or more exams/variants and product namespace. |
| assessment_profiles | id, exam_id, variant_id, version, rules, source_url, verified_at | Exact mock/practice rules and provenance for each paper variant. |
| entitlement_products | entitlement_product_id, name, product_type, status | A named exam pass or bundle. Not a payment provider. |
| product_exam_access | entitlement_product_id, exam_id, variant_id nullable | Exact exams and optional variants a pass/bundle unlocks. Null variant means all variants only when explicitly intended. |
| entitlement_grants | id, user_id, entitlement_product_id, status, valid_from, valid_until, source_type, source_ref | Auditable user grant (launch, purchase, scholarship, sponsored, staff, trial). |
| question_attempts | existing fields + goal_id, exam_id, variant_id | Student answer history in one preparation goal/variant. |
| question_bookmarks | existing fields + goal_id, exam_id | Review flags in one preparation goal. |
| flashcard_reviews | existing fields + goal_id, exam_id | Spaced-repetition state per goal. |
| note_exam_map | note_id, exam_id, access_level | Explicitly maps reusable notes/resources to exam spaces. |
| student_notes | existing note fields + goal_id or exam_id | Student-created notes retain their originating context. |

A question can be shared across multiple exams only by multiple explicit question_exam_map rows. Sharing a subject (e.g. Biology) is never sufficient evidence to share a question. Content must also be scoped to the correct product/site namespace; a shared Supabase project is not permission to mix unrelated academy sites.

## 2A. Canonical question identity and content delivery (P0 prerequisite)

The live Supabase questions table is currently empty, while the question banks live in source files. The existing attempt action expects a database question row:

- Bundled questions have a stable key (question_key) but no database row ID in the client model.
- recordAttemptByQuestionKey resolves that key (or exact question_text) against public.questions before inserting question_attempts.
- With zero question rows, the action returns “Question not found”; the current UI call sites suppress the failure. This is why current bundled-bank practice does not create reliable durable analytics.

**Recommended direction:** make the server-side content store the canonical source for protected questions. Ingest approved banks into the database with stable question_key values, explicit product_id + exam_id + variant_id mappings, provenance and publication/review status. Keep any static client-side content limited to deliberately selected public samples. Server components/actions fetch the selected exam's questions only after validating the student's goal and entitlement; do not import full paid banks into client components.

The current scripts/seed-mdcat-questions.mjs is not a safe general ingestion path:
- It only seeds the MDCAT bank.
- It marks inserted rows published and sets college = 'MDCAT', but does not create exam/variant mappings or a product/site namespace.
- Its historical comments described a shared database; the founder has confirmed that Apex's `edweb` project is dedicated to Apex Pakistan, so that statement is stale and must not guide future work.
- It uses the service-role key and can write directly to the live questions table.

Do not run this legacy script against production yet. Apex Pakistan has its own confirmed Supabase project (`edweb`); no separate project or cross-site namespace is needed for this Apex-only deployment. The script still lacks exam/variant mappings and must be replaced or upgraded into a reviewed, idempotent Apex ingestion path, tested away from production first. Only after canonical rows exist, the official PMDC-2026 paper profile is represented (180 questions with 81/45/36/9/9 distribution), and query filters are verified should the existing question-key attempt action be re-enabled for production students.

This also prevents a later monetization failure: a full question bank imported directly into a 'use client' component is delivered to the browser and cannot be made private by hiding its page or checking an entitlement after delivery.

## 3. Goal and entitlement semantics

### Student goals

- A student may create multiple goals under one account, e.g. pmdc-mdcat and pma-long-course.
- A goal has an independent status: active, paused, completed or archived.
- The active goal is a navigation preference, not a security boundary. For multi-variant exams, the goal also records the selected official variant. Every request must still validate the goal belongs to the authenticated user.
- A user may hold more than one goal for the same exam across different cycles if there is a real product reason; otherwise enforce one active goal per user/exam and preserve historical completed goals.
- The legacy profiles.exam_target field remains a display/onboarding hint only after migration. It must not decide authorization.

### Entitlement products and grants

- An exam pass maps to exactly one exam in product_exam_access.
- A bundle maps only to the exams explicitly listed in product_exam_access.
- A launch grant is scoped to the exam/variant goal the student selected; do not issue blanket all-access simply because the platform starts free.
- Scholarship/sponsored/staff/trial grants are explicit and auditable, with clear valid_from/valid_until or an explicit non-expiring policy.
- A purchase order is not itself the authorization record. The entitlement grant is the access decision; payment provider callbacks may create/revoke grants only after verified server-side confirmation.
- Refunds, chargebacks, expiry and manual revocation update the grant state and are checked on every protected operation.
- No price, payment provider, checkout or tax/refund rule is selected here.

## 4. Content access levels

Proposed access levels on question/resource mappings:

- **public_sample:** intentionally exposed on public exam pages or sample practice. Must be a deliberately selected subset, not the whole question bank.
- **goal_access:** available only to a student with a valid grant for that exam.
- **admin_draft:** unpublished/review content, never student-readable.
- **retired:** removed from current preparation while preserving historical attempts/review references.

The UI can display locked states, but the data API must enforce these levels. Downloads, notes files, mock assembly, attempts, offline packs and answer explanations must obey the same policy.

## 5. Read/write authorization contract

For every authenticated student request:

1. Resolve the Supabase user from the verified server session.
2. Resolve the requested goal and confirm goal.user_id equals the authenticated user.
3. Resolve goal.exam_id from the registry; never trust a client-supplied exam_id without checking the goal.
4. Confirm a currently valid entitlement grant includes that exact exam and selected variant (or an explicit all-variants grant), unless the requested content is explicitly public_sample.
5. Confirm the requested question/resource has an explicit mapping to that exam and is published/released for the student's access level.
6. For writes, persist goal_id and exam_id with the attempt/bookmark/review so later analytics cannot mix goals.
7. Reject mismatched goal/question mappings server-side, even if the browser sent a valid question UUID/key.

All new server actions should call one shared server-only authorization seam rather than implementing slightly different access rules on each page.

The service-role client bypasses RLS. Any service-role read/write used for student requests must perform the same user/goal/entitlement checks before returning content or writing progress. Do not assume service-role use is safe merely because the action runs on the server.

## 6. RLS design requirements

The final migration must be designed against the actual live schema and tested on staging before production:

- Enable RLS on every new table in the exposed public schema.
- student_goals: students can select/insert/update only rows whose user_id is auth.uid(); updates must have both USING and WITH CHECK.
- entitlement_grants: students can read only their own grants; only trusted server/admin flows can create, revoke or modify grants.
- question_exam_map: prevent students from reading mappings that reveal protected content availability if that is commercially sensitive; at minimum, the related question row must enforce access.
- questions: published status alone is not sufficient. Student SELECT must require an explicit mapping to a goal-access exam for which the caller has a valid grant, or a public_sample mapping.
- question_attempts and question_bookmarks: each row must belong to the authenticated student and a goal owned by that same student; the goal's exam and variant must match the question mapping. Do not permit a client to change goal_id or exam_id to another exam on UPDATE.
- flashcard_reviews: student_id and goal_id must match; the card must be mapped to the goal's exam.
- notes/resources: official content must be mapped to allowed exam(s); student notes must be owned by the uploader and tied to their goal or explicitly shared exam context.
- Never authorize using user-editable user_metadata claims.
- Avoid SECURITY DEFINER helpers in public. If a privileged helper is genuinely needed, isolate it in a non-exposed schema, pin search_path, validate auth.uid(), restrict EXECUTE grants and review with Supabase advisors.

This is a requirements document, not ready-to-run SQL. Exact RLS expressions must be tested with real authenticated roles and adversarial cases.

## 7. Legacy data migration policy

Current historical attempts, bookmarks and flashcard reviews have no exam_id/goal_id. Do not guess their scope from the student's current profile target.

Recommended migration sequence:
1. Add nullable goal_id/exam_id columns first. Do not drop or rewrite legacy fields.
2. Create registry, blueprints, student_goals, content mapping and entitlement structures.
3. Create new goals from the current profiles.exam_target only when the mapping is unambiguous; store the original text and a migration provenance/status. Unknown or ambiguous values remain unmapped for review.
4. Backfill historical attempts only when the question's exam mapping and a trustworthy historical context make the goal deterministic. Otherwise keep them as legacy/unscoped and show them separately or as historical aggregate, never silently attribute them to today's exam.
5. Preserve historical bookmarks/reviews as legacy records; do not duplicate them into multiple goals automatically.
6. Deploy dual-write only after all new reads/writes and RLS policies are ready.
7. Verify row counts, ownership, mappings, and rollback before making goal_id required for new writes.
8. Retire old global pathways only after the new paths have passed production-like tests and the founder approves.

## 8. Required adversarial tests

| Test | Expected result |
|---|---|
| Student A has a PMDC grant and requests a PMA-only question | Denied server-side; no question body or explanation returned. |
| Student A has PMDC and PMA grants and switches between goals | Each goal returns only its mapped content and separate progress. |
| Student A changes a request's goal_id to Student B's goal | Denied; no read/write. |
| Student A changes exam_id but keeps a PMDC goal | Denied because goal.exam_id and request/question mapping do not match. |
| Student A attempts a question mapped only to another exam | Denied; no attempt row is created. |
| Student A bookmarks one shared question in two separate goals | Two independent goal-scoped bookmarks are allowed if the question is explicitly mapped to both exams. |
| Student A loses/has an expired grant during a session | Next protected read/write is denied; public samples remain available if policy allows. |
| Student A opens an offline pack after grant expiry | Protected content is not newly downloadable/syncable; offline expiry policy must be explicit. |
| Admin publishes a draft question without an exam mapping | It remains unavailable to students. |
| An unknown legacy exam_target is migrated | No broad fallback to all subjects; it is flagged for review. |
| A historical attempt cannot be tied to one exam | It remains legacy/unscoped, not falsely assigned to the current target. |
| Service-role server action receives a forged question key | It independently verifies user, goal, grant, mapping and published state before writing. |

## 9. Implementation order

1. Approve stable exam IDs and first-wave blueprints from EXAM-REGISTRY-PROPOSAL.md.
2. Inspect live Supabase schema and RLS against checked-in migrations; record drift without changing production.
3. Build local/staging migration and RLS tests using disposable test accounts.
4. Implement read-only goal/entitlement resolution and one exam-scoped question query.
5. Convert MDCAT first and prove content/progress isolation.
6. Convert PMA as the contrasting selection workflow.
7. Convert USAT-M, NUST and other spaces only after their own blueprints and persistence paths pass.
8. Replace public pricing/launch copy only after the access policy is finalized.
9. Add payment processing only after a separate approved provider/terms decision.

**No database change is authorized by this document.** Do not apply migrations, seed production data, alter RLS or change billing until the schema, tests, backup and rollout plan are reviewed and explicitly approved.

# APEX PAKISTAN / MED PREP — COMPLETE SYSTEM SPECIFICATION & ONBOARDING GUIDE

> **MANDATORY READING FOR ANY AI AGENT OR DEVELOPER JOINING THIS REPO.**  
> Read this file at the start of your session before touching code or content. It contains the exact business mission, exam taxonomies, code architecture, data repositories, hard rules, and ongoing roadmap for the platform.

---

## 1. Executive Summary & Brand Mission

* **Platform Name:** Apex Pakistan (formerly MED Prep / mdcatprep)
* **Live Deployment:** Deployed to Vercel via GitHub `main` branch (`https://mdcatprep-eight.vercel.app` / custom domain pending).
* **Primary Mission:** Build the undisputed national monopoly education and entrance-exam prep platform in Pakistan across medical, military, engineering, and undergraduate admissions.
* **Launch Access Model (current decision):** The launch may initially be free to build student adoption, but access must be pricing-ready and must not be promised free forever. Future access is granted per exam Prep Space or an explicitly named bundle. See `PRODUCT-ARCHITECTURE-DECISION.md`; it supersedes older commercial assumptions in this file.
* **Core Value Proposition:**
  1. Replaces expensive physical academies (KIPS, STEP, Stars charging Rs. 30k–70k).
  2. Complete, honest, exam-accurate question banks with pedagogical rationales.
  3. Tailored student portals per exam track so students never get confused.
  4. Active recall flashcards, protected master concept notes, mistake notebooks, and timed national mock tests.

---

## 2. Competitive Exam Verticals Covered

The platform is divided into 5 core academic and competitive tracks, coordinated by `lib/exams-config.ts`:

### A. Medical Entrance (The Flagship)
* **Exams:** PMDC MDCAT (UHS Punjab, SZABMU Islamabad, KMU KP, DUHS Sindh, BUMHS Balochistan), NUMS MDCAT & Army Medical College.
* **Subjects:** Biology (Cell, Bioenergetics, Genetics, Physiology), Chemistry (Physical, Inorganic, Organic), Physics, English, and Logical Reasoning.
* **Differentiator:** NUMS Paper-II (50-MCQ Psychological Test & Aptitude Bank).

### B. HEC USAT (Undergraduate Studies Admission Test)
* **Exams:** Mandatory HEC USAT-M (Pre-Medical), USAT-E (Pre-Engineering), and USAT-CS (Computer Science).
* **Subjects:** Quantitative Reasoning (Arithmetic, Algebra, Geometry, Probabilities), Verbal Reasoning (Analogies, Antonyms, Synonyms, Sentence Completion), and Pre-Medical/Pre-Engineering Sciences.
* **Routes:** Dedicated interactive practice engine at `/usat/practice` and portal at `/portal/usat`.

### C. Military & Armed Forces (PMA Long Course & ISSB)
* **Exams:** Pakistan Military Academy (PMA) Long Course Computerized Initial Test & ISSB Intelligence screening.
* **Subjects:**
  - **Verbal Intelligence:** Number series, letter series, coding/decoding, analogies, blood relations, direction sense.
  - **Non-Verbal Intelligence:** Visual matrix patterns, abstract reasoning.
  - **Academic Section:** Basic Math, English Grammar, General Knowledge, Pakistan Affairs, Islamic Studies.
* **Portal:** `/portal/pma`.

### D. Engineering & IT (NUST, GIKI, LUMS)
* **Exams:** NUST NET (Engineering & Computing), GIKI Entrance Exam, LUMS (SBASSE & SDSB).
* **Subjects:** Advanced Calculus & Algebra, Engineering Physics, Chemistry / Computer Science, English & Intelligence.
* **Portal:** `/portal/nust`.

### E. MBBS MedSchool Clinical Notes
* **Target Audience:** 1st through 5th-year MBBS medical students in Pakistan.
* **Subjects:** Gross Anatomy & Neuroanatomy, Medical Physiology, Biochemistry, General & Special Pathology, Pharmacology.
* **Portal:** `/portal/mbbs`.

---

## 3. Technology Stack & Technical Architecture

* **Framework:** Next.js 16.2.10 (App Router) running with Turbopack.
* **Language & Typing:** TypeScript (Strict mode, zero TypeScript errors permitted).
* **Styling & UI:** Tailwind CSS, Lucide React icons, dark-navy medical glassmorphism aesthetic (`app/globals.css`).
* **Database & Auth:** Supabase (PostgreSQL with Row Level Security, Edge Auth, service-role admin utilities).
* **Build & Deploy Pipeline:**
  - **Production Branch:** `main` (auto-deploys to Vercel on push).
  - Note: `master` and `main` are kept in sync; production deploys track `origin/main`.
* **State & Caching:** Next.js Incremental Static Regeneration (ISR) and Server-Side Generation (`SSG`) with dynamic parameters for portals, topicals, and past papers.

---

## 4. Codebase Navigation & Key Files Directory

### A. Central Exam Config & Global Switcher
* `lib/exams-config.ts`: Single source of truth defining all 5 exam categories, syllabi, color tokens, and feature flags.
* `components/exams/ExamHubSelector.tsx`: Grid component showing all exam tracks. Mounted on `/` (landing) and `/exams`.
* `components/dashboard/ExamPortalSwitcher.tsx`: Interactive dropdown mounted in the dashboard header allowing logged-in students to toggle between exam portals.
* `components/exams/ApexGlobalSearch.tsx`: Instant topic/exam search bar.

### B. Question Banks & Data Stores (Current Ground Truth)
* `lib/biology-questions.ts`, `lib/chemistry-questions.ts`, `lib/physics-questions.ts`, `lib/english-questions.ts`: MDCAT science and English repositories (894 bank questions + 3,722 topicals).
* `lib/usat-questions.ts` & `lib/usat-comprehensive-bank.ts`: HEC USAT-M elite bank (417 questions: Quantitative, Verbal, Biology, Chemistry, Physics) with Bloom's taxonomy rationales.
* `lib/pma-questions.ts`: PMA Verbal Intelligence & Initial Academic bank (41 questions).
* `lib/nust-questions.ts`: NUST NET Mathematics, Physics, Chemistry, and English bank (40 questions, scaling for November NET-1).
* `lib/past-papers.ts`: Registry of official Pakistani past papers (25 papers across UHS, NUMS, SZABMU, KMU, DUHS, BUMHS).

### C. Public & Student Portal Routes
* `app/page.tsx`: Main landing page with Hero, Social Proof Bar, Features, Exam Hub Selector, and FAQ.
* `app/exams/page.tsx`: Unified All-Exams Portal Hub.
* `app/portal/[exam]/page.tsx`: Dynamic exam track overview with syllabus modules, resource links, and mock test triggers.
* `app/usat/practice/page.tsx`: Interactive USAT-M practice drill app with instant feedback and pedagogical explanations.
* `app/nust/practice/page.tsx`: Interactive NUST NET/GIKI/LUMS practice drill app.
* `app/pma/practice/page.tsx`: Interactive PMA Verbal Intelligence & Academic practice drill.
* `app/signup/SignupForm.tsx`: Sign-up form with grouped target exam selection (`exam_target`).
* `app/dashboard/page.tsx`: Student dashboard overview displaying accuracy, streaks, daily goals, and `ExamPortalSwitcher`.
* `app/dashboard/practice/`: Chapter-wise topic drill navigation.
* `app/dashboard/notes/master-reader/`: Protected medical master notes white-paper reader with watermark and anti-print deterrence.

---

## 5. Non-Negotiable Operating Rules (The Founders' Charter)

1. **Honesty is the Product:**
   - NEVER fabricate mock stats, student counts, test dates, or marks.
   - Sourced past papers must carry honest provenance badges (`official`, `reconstructed`, `memory-based`).
   - If a feature is not live yet, state "not live yet".
2. **Strict Exclusion Rule:**
   - **NO Aga Khan University (AKU) material anywhere, ever.** No AKU names, question sets, past papers, or references. All other universities (UHS, NUMS, NUST, GIKI, LUMS, HEC) are fully permitted.
3. **Copyright & Original Content:**
   - Question banks must be original PMDC/HEC-aligned exam-style writing or sourced from public official papers.
   - Do NOT re-host commercial pirated academy book scans (KIPS, Prep Titans).
4. **Git Hygiene in Shared Working Tree:**
   - Multiple agents work on this repository. **NEVER use `git add .` or `git commit -a`.**
   - Stage explicit file paths only (`git add path/to/file.ts`).
   - Verify every change using the Gate Ladder before pushing.

---

## 6. Commercial Architecture & Monetization Blueprint (UPDATED 2026-11-08)

**This section supersedes the older free-forever, freemium-feature and fixed-price package proposals previously recorded here.** The authoritative decision is in `PRODUCT-ARCHITECTURE-DECISION.md`.

### A. Launch and future access

- The initial launch may be free, including a time-limited or policy-defined acquisition period.
- Do not promise that every exam, feature or Prep Space will remain free forever.
- Do not hardcode access as permanently free. Model explicit access grants so the launch policy can change without redesigning accounts.
- Public academy discovery, exam information and account creation should remain available. Clearly disclose what preparation content is included, locked, in beta or coming soon.

### B. Exam-scoped entitlements

- Access is enforced server-side and scoped to a stable exam/Prep Space ID and product tier.
- Purchasing MDCAT unlocks MDCAT only. It does not automatically unlock PMA, CSS, IELTS, NUST or every other exam.
- A named bundle may grant several exams only when those exams are explicitly listed in the bundle.
- Trials, free samples, scholarships, sponsored access, staff/test access and launch grants must be explicit policies or grant types.
- Store entitlement status, start/end dates, source/order reference, and revocation/refund state in an auditable model.
- Enforce access on server-rendered content, server actions, APIs, downloads, attempts and progress writes. Hiding a card in the UI is not authorization.
- The current profile approval status is a global account-access gate; it is not a purchase entitlement and must not be repurposed as one.

### C. Payment decisions are not approved yet

- No payment provider, final price, payment schedule, tax treatment, refund terms or checkout flow is approved by this specification.
- Research Pakistani payment options and compliance requirements separately when the entitlement boundary is designed and the founder explicitly authorizes payment planning.
- Do not implement payment processing or change billing settings as part of the architecture audit.

### D. Required engineering order

1. Stable Exam Registry and Preparation Blueprints.
2. Server-enforced exam ownership for content and exam-scoped student progress.
3. Compatibility plan for existing single exam_target profiles and historical attempts.
4. Tests proving one exam grant cannot access another exam's protected content or write cross-exam progress.
5. Only then implement the approved launch policy and any future paid entitlements.

## 7. The Developer Gate Ladder

Before marking any task complete or committing:
1. **Type Check:** `npx tsc --noEmit` must pass with 0 errors.
2. **Lint Check:** Ensure no syntax or import regressions on touched files.
3. **Build Verification:** `npm run build` must compile 100% of routes (84+ static & dynamic routes).
4. **Git Deploy:** Push verified commits to `origin/main` (and sync `master`).

---

## 8. Phased Roadmap & Step Checklist

- [x] **USAT Question Bank Volume:** Scaled `lib/usat-comprehensive-bank.ts` to 152 questions with Bloom's rationales.
- [x] **NUST Practice Engine:** Shipped interactive test player at `/nust/practice` with subject filtering.
- [x] **NUST NET-1 Bank Expansion:** Bank at 81 high-yield questions (Math 28 · Physics 24 · Chemistry 17 · English 12), plus the NET-Engineering timed mock at NUST's official Math 50% · Physics 30% · English 20% weighting (200 MCQs / 180 min paper, scaled to the bank at 0.9 min per MCQ; no negative marking) — next wave grows the bank toward the real paper's 200 MCQs.
- [ ] **PMA Non-Verbal Matrix:** Add visual pattern recognition items to `lib/pma-questions.ts`.
- [x] **HEC Balochistan/FATA Aptitude Bank:** Dedicated scholarship bank shipped at 212 questions (V78/Q62/B30/C21/P21) from the phase-2/3 papers, with the 100-MCQ / 100-min USAT-M mock and chapter-style drill navigation.
- [ ] **Medical Repeater Funnel:** Aggregate calculator (10/40/50 formula) + post-result diagnostic path.
- [ ] **Local Payment Gateway Integration:** Implement Raast QR / EasyPaisa / JazzCash manual verification flow behind admin flag.


## Commercial architecture supersession note — 2026-11-08

Older statements in this document describing “100% Free”, “Free forever”, a permanent free-feature split, or fixed pass prices are historical proposals only. They are not current policy and must not be copied into public product copy. The approved model is one account with multiple exam-specific Prep Spaces and explicit server-enforced entitlements scoped to each exam or named bundle. The current public code still contains free-forever/no-expiry claims across homepage, signup, portal, FAQ, notes/resources and /llms.txt; the pricing page also presents Rs. 0 lifetime/all-access passes with a client-only fake activation state. These are identified audit issues, not approved policy.


## 2026-11-28 — Question-bank refinement preservation rule

Founder instruction: refine and sort the existing question banks; do **not** replace them with AI-generated questions. Preserve raw sources and original wording/options/keys. First produce read-only inventories and dry-run reports; map each question to official subject/chapter/topic; detect exact duplicates using normalized stem + full option set + correct-answer option text; keep near-duplicates for human review; preserve repeated paper occurrences and provenance. Flag malformed/incomplete items rather than deleting them or guessing answers. No bulk writes, ingestion, deduplication deletion or production seeding before founder review. See [QUESTION-BANK-REFINEMENT.md](QUESTION-BANK-REFINEMENT.md).

Important existing-script warning: `scripts/ingest-topicals-v2.mjs` writes directly to `lib/topicals-bank.ts`, has no dry-run mode and deduplicates by stem alone. Do not run it for this preservation-first task.


First-pass source inspection: [MDCAT-QUESTION-BANK-PILOT-AUDIT.md](MDCAT-QUESTION-BANK-PILOT-AUDIT.md). The combined source contains 3,594 parsed markers (Biology 1,439; Chemistry 939; Physics 1,216), with 50 existing chapter headings. Only 1,573 records currently parse with four labelled options; 2,021 require format/content review. No questions were deleted or rewritten. Continue with chapter-file reconciliation and taxonomy mapping.


Biology pilot update: structured MCQUniverse Biology files contain 1,441 records; all parse with four options, a valid answer letter and explanation, and no exact duplicate clusters within those two files. Compared with combined Biology source, 52/54 stem differences remain to reconcile. Rights/permission for MCQUniverse-sourced material is unverified; do not publish commercially until cleared. Full detail: [MDCAT-QUESTION-BANK-PILOT-AUDIT.md](MDCAT-QUESTION-BANK-PILOT-AUDIT.md).


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


## 2026-11-28 — Founder directive: refine the full 13K+ corpus into topicals

- [ ] Reconcile the full 13K+ source corpus into the public topical bank using the preservation-first pipeline in [docs/TOPICALS-13K-REFINEMENT.md](docs/TOPICALS-13K-REFINEMENT.md).
- [ ] Freeze and inventory every source; parse every question occurrence losslessly; assign stable source IDs and preserve provenance.
- [ ] Map every question to subject → PM&DC chapter → topic; quarantine uncertain mappings instead of guessing.
- [ ] Detect exact duplicates using normalized stem + full option set + correct-answer evidence; retain every occurrence/provenance. Flag near-duplicates and conflicting keys for review.
- [ ] Audit structure, explanations, diagrams, OCR and answer-key integrity; never silently repair or discard malformed items.
- [ ] Apply item/source rights and public/private visibility separately. Do not move the private 13,879-row candidate corpus into public topicals without source-level rights clearance and an approved public manifest.
- [ ] Replace the unsafe stem-only ingest path only after the read-only reports and release manifest are reviewed. Do not run ingest-topicals-v2.mjs as-is.

**Current blocker:** the tracked repository records conflicting corpus totals (including 16,272 total / 13,879 private in a 2026-11-23 snapshot), while the underlying data/MCQS_FINAL corpus and its manifest are not present on tracked main. The exact 13K+ records therefore cannot yet be inspected or classified through the connected repository. Do not claim the full corpus is sorted until the actual source files are available and every occurrence is reconciled.

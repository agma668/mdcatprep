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

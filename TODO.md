# APEX PAKISTAN / MED PREP — COMPLETE SYSTEM SPECIFICATION & ONBOARDING GUIDE

> **MANDATORY READING FOR ANY AI AGENT OR DEVELOPER JOINING THIS REPO.**  
> Read this file at the start of your session before touching code or content. It contains the exact business mission, exam taxonomies, code architecture, data repositories, hard rules, and ongoing roadmap for the platform.

---

## 1. Executive Summary & Brand Mission

* **Platform Name:** Apex Pakistan (formerly MED Prep / mdcatprep)
* **Live Deployment:** Deployed to Vercel via GitHub `main` branch (`https://mdcatprep-eight.vercel.app` / custom domain pending).
* **Primary Mission:** Build the undisputed national monopoly education and entrance-exam prep platform in Pakistan across medical, military, engineering, and undergraduate admissions.
* **Current Access Model:** **100% Free** for all students across Pakistan to drive viral student adoption, word-of-mouth growth, and national dominance before monetizing premium passes.
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

### B. Question Banks & Data Stores
* `lib/biology-questions.ts`: MDCAT Biology question repository.
* `lib/chemistry-questions.ts`: MDCAT Chemistry question repository.
* `lib/physics-questions.ts`: MDCAT Physics question repository.
* `lib/english-questions.ts`: MDCAT English grammar, vocabulary & comprehension.
* `lib/usat-questions.ts` & `lib/usat-comprehensive-bank.ts`: HEC USAT-M bank (Quantitative, Verbal, Sciences) with Bloom's taxonomy rationales.
* `lib/pma-questions.ts`: PMA Verbal Intelligence & Initial Academic bank.
* `lib/nust-questions.ts`: NUST NET Mathematics, Physics, Chemistry, and English bank.
* `lib/mbbs-questions.ts`: MBBS Professional Anatomy, Physiology, Pathology, and Biochemistry bank.
* `lib/past-papers.ts`: Registry of official Pakistani past papers (UHS, NUMS, SZABMU, KMU, DUHS, BUMHS).

### C. Public & Student Portal Routes
* `app/page.tsx`: Main landing page with Hero, Social Proof Bar, Features, Exam Hub Selector, and FAQ.
* `app/exams/page.tsx`: Unified All-Exams Portal Hub.
* `app/portal/[exam]/page.tsx`: Dynamic exam track overview with syllabus modules, resource links, and mock test triggers.
* `app/usat/practice/page.tsx`: Interactive USAT-M practice drill app with instant feedback and pedagogical explanations.
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

## 6. The Developer Gate Ladder

Before marking any task complete or committing:
1. **Type Check:** `npx tsc --noEmit` must pass with 0 errors.
2. **Lint Check:** Ensure no syntax or import regressions on touched files.
3. **Build Verification:** `npm run build` must compile 100% of routes (84+ static & dynamic routes).
4. **Git Deploy:** Push verified commits to `origin/main` (and sync `master`).

---

## 7. Ongoing Roadmap & Next Tasks (TODO for Incoming AI)

- [ ] **USAT Question Bank Volume:** Continue scaling `lib/usat-comprehensive-bank.ts` to 200+ questions.
- [ ] **PMA Non-Verbal Engine:** Add SVG or canvas-based visual matrix questions to `lib/pma-questions.ts`.
- [ ] **NET / GIKI Topical Drills:** Build a dedicated `/nust/practice` interactive test player mirroring `/usat/practice`.
- [ ] **MBBS Anatomy High-Yield Notes:** Expand clinical case vignettes and anatomical nerve-lesion summary tables.
- [ ] **Automated Local Payments (Future Phase):** Integrate EasyPaisa / JazzCash / Raast QR instant verification for Pro membership upgrades.

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

### B. Question Banks & Data Stores (Current Ground Truth)
* `lib/biology-questions.ts`, `lib/chemistry-questions.ts`, `lib/physics-questions.ts`, `lib/english-questions.ts`: MDCAT science and English repositories (894 bank questions + 3,722 topicals).
* `lib/usat-questions.ts` & `lib/usat-comprehensive-bank.ts`: HEC USAT-M elite bank (152 questions: Quantitative, Verbal, Biology, Chemistry, Physics) with Bloom's taxonomy rationales.
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

## 6. Commercial Architecture & Monetization Blueprint

### A. Strategic Transition: From 100% Free to Paid Pro
* **Phase 0–2 (Free Domination):** Free practice drives national adoption, college ambassador referrals, and replaces physical academies charging Rs. 30k–70k.
* **Exit Gates Before Charging:**
  1. Bank quality: Zero incorrect answer keys, full pedagogical rationales.
  2. Verified patterns: CBT timed simulators strictly matching real test rules (PMDC 180 MCQs / 3 hrs; NET 200 MCQs / 180 min).
  3. Proven engagement: 200+ active weekly users with verified Day-7 return rate.
  4. Pakistani payment rails configured (EasyPaisa, JazzCash, Raast QR, Safepay).

### B. Freemium Split
* **Always Free:** Daily chapter drills, basic syllabus maps, past papers index, merit aggregate calculators, basic community access.
* **Paid Pro Features:**
  - Full-length timed mock exams with All-Pakistan percentile and provincial merit rank predictor.
  - Adaptive Mistake Notebook (re-tests specific cognitive weaknesses).
  - High-Yield Master Concept Notes Reader (whitepaper format).
  - Offline PWA practice packs (for weak connectivity in Balochistan, KPK, rural Punjab/Sindh).

### C. Pricing Packages (One-Time Season Passes, No Confusing Monthly Subs)
1. **Medical Full Season Pass (Rs. 2,500 – 3,500):** PMDC MDCAT + NUMS complete mocks, past-paper rationales, and master notes.
2. **Medical Repeater Cohort (Rs. 4,500):** Diagnostic gap analysis + tailored 20-week schedule + psychological bank.
3. **Engineering NET 4-Series Master Pass (Rs. 2,500):** NUST NET CBT simulator, FAST-NU, GIKI, and UET ECAT drills.
4. **HEC USAT & Balochistan/FATA Scholarship Pack (Rs. 1,500):** ETC aptitude test verbal/quantitative drills and quota calculators.
5. **PMA & Defense Initial Pass (Rs. 1,500):** Verbal & Non-verbal intelligence matrix tests.
6. **Apex All-Access Lifetime Pass (Rs. 5,000 – 7,000):** Universal access to all 5 tracks for multi-exam candidates.

---

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

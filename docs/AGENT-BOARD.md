# MED Prep (Apex Pakistan) — Official Project Agent Board & Roadmap

> **Agent Communication Log & Master Roadmap**  
> Maintained collaboratively by AI agents (AKUMA/Hermes, Stalin, Nima) for the Apex Pakistan Medical, Engineering, and Defence Entrance Test platform (`miankhail/mdcatprep`).

---

## 🤖 Agent Collaboration Log (Notes & Suggestions)

- **[AKUMA / Hermes - 2026-09-26]**: Initialized master portal architecture. Unified MDCAT, NUMS, HEC USAT-M, Balochistan, and FATA medical tests under the **Medical Super-Portal** (`/portal/mdcat`), with dynamic sub-test filtering.
- **[STALIN - 2026-09-26]**: Verified build integrity (`tsc` 0 errors, 85/85 Next.js routes successfully compiled and deployed to Vercel). Added Exam Portal Switcher and Merit Estimator.
- **[NIMA - 2026-09-27]**: Audited official HEC USAT samples and regional medical exam patterns. Confirmed alignment with November exam requirements.
- **[AGENTS DIRECTIVE]**: Focus shifts strictly to finalising all specialized portal requirements for the November exam cycle (NUMS, MDCAT, Balochistan, FATA, NUST, GIKI, LUMS) without marketing distractions.

---

## 🗺️ Master Roadmap: November 2026 & Beyond (Exams, Workflow & UI/UX)

### 1. Target Exam Scope & Deadlines (November 2026 Focus)
* **Medical Entrance (November Cycle):**
  * **NUMS MDCAT & AMC:** Requires high-yield Biology/Chemistry/Physics + Psychology / Aptitude section.
  * **UHS MDCAT (Punjab):** Standard 200-question PMDC format (68 Bio, 54 Chem, 54 Phys, 14 Eng, 10 Logical).
  * **HEC USAT-M (Pre-Medical):** Mandatory undergraduate admissions test (Quantitative Reasoning, Verbal Reasoning, Biology, Chemistry, Physics).
  * **Balochistan Medical Entry Test (BUMHS):** Regional Quetta pattern with high emphasis on core FSc textbooks.
  * **FATA / KPK Medical Entry Test (KMU):** Special regional quota exam pattern.
* **Engineering & Computing (Fall/Spring Cycle):**
  * **NUST NET (Series 1-4):** Computer-based adaptive test (Math 80, Physics 60, Chemistry/CS 30, English 20, IQ 10).
  * **GIKI Engineering:** Advanced calculus & mechanics problem sets.
  * **LUMS SBASSE:** Quantitative & analytical reasoning assessment.

---

### 2. Portal & Workflow Architecture (UI/UX & Requirements)

| Portal / Module | Target Audience | Key UI/UX Features Required | Status |
| :--- | :--- | :--- | :--- |
| **Medical Super-Portal** (`/portal/mdcat`) | MDCAT, NUMS, USAT-M, Balochistan, FATA aspirants | • Sub-test selector dropdown/grid<br>• Chapter-wise practice drills<br>• NUMS Psychology section<br>• Master clinical notes reader | **Live & Built** |
| **Engineering Portal** (`/portal/nust`) | NUST NET, GIKI, LUMS aspirants | • Advanced Math formula sheets<br>• Computer-based mock test simulator<br>• Time-management timer per section | **Live & Built** |
| **Defence Portal** (`/portal/pma`) | PMA Long Course & ISSB candidates | • Verbal & Non-verbal IQ test simulator<br>• Academic test bank (GK, English, Maths)<br>• Psychological test guidance | **Live & Built** |
| **Student Dashboard** (`/dashboard`) | All active students | • Instant Exam Portal Switcher<br>• Merit & Aggregate Calculator<br>• Active Recall Flashcards (SRS)<br>• Mistake Notebook & Bookmarks | **Live & Built** |

---

### 3. Immediate Action Items & Execution Checklist

1. **Sub-Test Practice Filtering**: Ensure every question in `lib/usat-comprehensive-bank.ts`, `lib/biology-questions.ts`, etc., can be filtered by specific board (UHS, NUMS, Balochistan, FATA) via query parameter (`?subtest=`).
2. **Mock Test Timers**: Fine-tune the timed mock test engine (`/dashboard/mock-test`) to mirror exact official exam durations (e.g. 3.5 hours for MDCAT 200 MCQs, 3 hours for NUST NET 200 MCQs).
3. **Master Notes Watermarking**: Protect proprietary study notes against unauthorized copying while providing seamless reading for legitimate students.
4. **Offline-First Resilience**: Ensure students in remote regions (Balochistan, FATA) can utilize cached practice sessions offline via service workers.

---
*Signed, Apex AI Agent Swarm (AKUMA, Stalin, Nima).*

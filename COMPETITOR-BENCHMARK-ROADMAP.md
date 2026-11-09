# Competitor Benchmark & Product Roadmap

**Status:** Working product-research document  
**Reviewed:** 2026-11-09  
**Scope:** Apex Pakistan / medical preparation website in `agma668/mdcatprep`. This does not cover the separate Apex Pakistan cadet-college website or any other project.

## Executive direction

Build one student account with multiple exam-specific Prep Spaces. Reuse the platform infrastructure, but configure the learning journey, content, assessment rules and progress model per exam. The goal is not to copy a competitor's feature count. The goal is to deliver a more coherent, trustworthy, exam-aligned and accessible learning experience.

Public competitor pages are marketing and product descriptions, not independent audits. Feature claims below are attributed to the provider and should not be treated as proof of educational effectiveness, content accuracy or score improvement.

## Public competitor scan

| Platform | Publicly described strengths | Transferable product lesson | Caution |
|---|---|---|---|
| BeambePrep | Exam-specific Pakistani medical question banks; provincial past-paper suites; timed mocks; answer-choice explanations; wrong/guessed-question recovery; flashcards with FSRS-style spaced repetition; offline apps and sync; topic/past-paper filters; study timers and aggregate calculators. | Connect questions, explanations, mistake review and flashcard recall into one loop. Offer exam-specific paper modes and low-connectivity study. | Counts, coverage percentages, retention claims and exam-match claims are provider statements. Independently verify every source, answer key and paper before adopting similar claims. |
| Khan Academy MCAT | Structured units and skills; video/article lessons; discrete practice; passage-based questions; content organized by exam foundations; advice for pairing lessons with practice passages. | Teach a concept, then immediately apply it in a question or passage. Organize content as a clear syllabus map rather than a pile of resources. | MCAT is not MDCAT. Use its learning architecture, not its US-specific syllabus or exam format. |
| AAMC MCAT resources | Official content outline, free planning guidance, diagnostic/sample test and score breakdown by section/content skill; links to Khan Academy and open resources. | Provide a baseline diagnostic, transparent syllabus coverage, and a study plan based on strengths and gaps. | AAMC's official MCAT resources do not define Pakistani exam rules. |
| Maqsad | Daily live classes, recorded lectures, chapter-wise MCQs, weekly timed mocks, doubt-solving, counselling and exam updates. | Students benefit from structure, consistent practice, timely exam information and a route to ask for help. | Live classes and human counselling require staffing and recurring operational capacity; do not promise them before they exist. |
| UWorld MCAT | Detailed rationales and visual explanations, custom practice, full-length exams, study planner, performance analytics, flashcards, notebook and mobile access. | Make every answer explanation teach the reasoning; provide topic-level analytics and let students turn difficult questions into revision material. | Premium MCAT question content is proprietary. Do not copy questions, visuals or explanations. |
| Quizlet Learn | Flashcards converted into multiple-choice, true/false and written practice; adaptive sessions focus on difficult material; progress sync across devices. | Reuse a student's own saved facts/cards to create varied active-recall practice, not just flip cards. | Keep generated questions grounded in reviewed content; avoid hallucinated answers. |

## Recommended Edweb feature set

### P0 — Trust and exam correctness (before feature expansion)

1. **Official exam blueprint per Prep Space**
   - Record authority, source URL, verification date, exam year/version, subjects, topic weights, timing, question count, scoring and negative marking only when verified.
   - Keep separate variants where the official paper materially differs (e.g. PMDC MDCAT vs NUMS; standard HEC USAT vs Balochistan/Ex-FATA scholarship test).
   - Display readiness honestly: Beta, Content in progress, Coming soon.
2. **Question provenance and editorial review**
   - Each question records source type, paper/exam/year where applicable, source reference, answer-key status, explanation status and reviewer state.
   - Separate authentic past-paper questions from original exam-style questions.
   - Provide a student report button for suspected incorrect questions.
   - Never invent past-paper provenance or claim an unofficial question is an exact past-paper question.
3. **Reliable canonical question storage**
   - Avoid relying on large client-bundled question arrays for protected banks or durable progress.
   - Use stable question keys and explicit exam/variant mappings.
   - Do not release a bank until answer keys, duplicate detection, syllabus mapping and sample paper assembly are checked.
4. **Secure, goal-scoped progress**
   - Multiple goals per student account.
   - Each attempt, bookmark and review belongs to the selected goal/variant.
   - Enforce ownership and content access in the database/server, not only by hiding UI.
5. **Clear explanations**
   - Explain why the correct option is correct and why each distractor is wrong.
   - Add a short concept reminder and source reference where available.
   - Do not publish AI-generated explanations without review.

### P1 — Core learning loop

1. **Diagnostic assessment:** short baseline test; report subject/topic strengths and gaps, not just one total score.
2. **Syllabus map:** subject → chapter → topic → learning objective, with completion and mastery indicators.
3. **Smart practice:** custom sessions by subject, chapter, difficulty, unseen questions, incorrect questions, flagged questions and past-paper mode.
4. **Mistake recovery:** separate wrong, guessed, slow and flagged questions; schedule a retry; ask for demonstrated mastery before marking a weak concept recovered.
5. **Flashcards + spaced repetition:** generate a draft card from a reviewed explanation; let students edit it; schedule due cards using a well-maintained algorithm. Avoid copying BeambePrep's branding or proprietary terminology.
6. **Mock exams:** accurate exam timing, section order, navigation, flagging, pause/submit rules and scoring only when the official blueprint is verified. Provide a detailed post-mock review.
7. **Personal study planner:** target date, available study days, syllabus coverage, review workload and flexible daily tasks. Re-plan when a student misses a day without shaming them.
8. **Analytics:** accuracy by subject/topic/difficulty, time per question, trend over time, attempted vs unseen coverage, confidence vs correctness and mock history.

### P2 — Differentiators

1. **Passage and data interpretation practice:** where the target exam tests it; include charts, tables, experimental setups and multi-question passages.
2. **Visual concept library:** original diagrams, labelled processes, formula sheets and interactive mini-explanations.
3. **Offline-first mode:** cache a student's permitted study pack and queue progress safely for sync when connection returns. Start with text/questions before large video downloads.
4. **Low-bandwidth mode:** fast pages, compressed assets, no autoplay, resumable downloads and clear data-use choices.
5. **Exam updates centre:** dated official notices, application deadlines, syllabus changes and source links; show last-verified date.
6. **Accessibility and language support:** readable layouts, keyboard support, screen-reader labels, adjustable text and plain-language explanations. Consider Urdu support where educationally useful and carefully reviewed.
7. **Study groups / peer accountability:** optional private cohorts and shared goals; protect student privacy and avoid making public rank the primary measure of progress.

### P3 — Later, only when there is capacity

- Human doubt-solving and scheduled live classes.
- Teacher dashboards and moderated classroom assignments.
- AI tutor grounded only in the reviewed Edweb content library, with citations to the lesson/question and a clear uncertainty fallback.
- Adaptive question selection after sufficient high-quality tagged question data exists.
- Native mobile apps only if the responsive/offline web experience proves insufficient.

## Exam-specific product rules

- **MDCAT:** syllabus map, chapter-wise MCQs, conceptual explanations, past-paper practice, timed mocks, flashcards, weak-topic review and exam updates.
- **NUMS:** its own official blueprint, section-specific practice and mock engine; never silently reuse PMDC scoring or question rules.
- **HEC scholarship Pre-Medical:** its own verified scholarship-test content and workflow; do not merge it with standard HEC USAT.
- **HEC USAT:** model each official stream variant separately and include the applicable Part I / Part II workflow only after verification.
- **NUST NET Engineering / GIKI / LCAT:** separate verified question pools and paper profiles. Do not relabel a NUST bank as GIKI or LCAT content.
- **PMA / ISSB:** use a selection-journey design: eligibility and official process guidance, reasoning practice, communication/interview preparation and stage tracking. Do not force a medical-style flashcard/MCQ interface onto the whole selection process.

## Current Edweb baseline from repository and live schema review

- The product registry and Prep Space selector exist in the feature branch; readiness is deliberately conservative.
- The dashboard currently links to the Prep Space catalogue. It does not yet persist a student's selected goal.
- The feature branch contains an additive draft migration for `exam_registry`, `exam_variants`, `assessment_profiles`, `student_goals` and `question_exam_map`.
- The connected Supabase project named `edweb` is the Apex Pakistan medical site's project. Its live migration history currently stops at `20260912000000_question_provenance`; the exam-registry/student-goals migration is **not applied**. The live schema has no `student_goals`, `exam_registry`, `exam_variants`, `assessment_profiles` or `question_exam_map` tables.
- The live `questions` table currently reports zero rows. Existing attempts/bookmarks/flashcard review tables are present, but the durable goal-scoped progress model is not yet in place.
- The Supabase security advisor currently reports: one RLS-enabled table without policies (`client_telemetry`); three mutable-search-path function warnings; three SECURITY DEFINER functions executable by anon/authenticated; and leaked-password protection disabled. These are existing project findings, not caused by the un-applied goal migration.
- No production schema changes were made during this review.

## Required design review before applying the draft goal migration

1. Add a server-owned `updated_at` strategy for mutable registry and goal rows.
2. Review goal update policy so inactive/archived goals cannot be repointed to arbitrary inactive variants, and decide whether a student may create duplicate active goals for the same variant.
3. Decide whether students can update only `target_date`, `status` and `is_primary`, rather than every column. A column-level grant or narrowly scoped server action may be safer.
4. Add automated RLS tests for cross-user reads/updates, active catalogue visibility, inactive exam rejection, primary-goal uniqueness and archived-goal behavior.
5. Design a separate migration for goal-scoped attempts/bookmarks/flashcard reviews. Do not retroactively assign old activity to a goal without reliable evidence.
6. Keep `question_exam_map` inaccessible to student roles; expose only approved questions through a server-controlled, goal-aware read path.
7. Seed the catalogue only after official paper profiles and sources are reviewed.
8. Run Supabase security advisors after any approved schema changes and fix relevant findings.

## Suggested delivery waves

| Wave | Deliverable | Exit condition |
|---|---|---|
| 1 | Blueprint and content-quality foundation | Every launched Prep Space has a source-backed blueprint and honest readiness state. |
| 2 | Goal and data-security foundation | Student can save multiple goals; RLS tests prove no cross-user access; no live migration until approved. |
| 3 | Reliable question bank and practice loop | Canonical approved questions, detailed rationales, durable attempts and custom practice all work. |
| 4 | Mistake recovery, flashcards and planner | Weak concepts feed a coherent review schedule and independent goal progress. |
| 5 | Full mocks and analytics | Verified paper simulation and meaningful post-test insights. |
| 6 | Offline, passage tools and guided support | Performance and reliability proven on low-bandwidth/mobile use before adding expensive services. |

## Public sources reviewed

- BeambePrep features: https://www.beambeprep.com/features/
- BeambePrep main platform: https://www.beambeprep.com/
- BeambePrep FAQ: https://www.beambeprep.com/faq/
- Khan Academy MCAT course: https://www.khanacademy.org/test-prep/mcat
- Khan Academy guidance on combining content review and passages: https://www.khanacademy.org/test-prep/mcat/x04f6bc56%3Awelcome-to-the-mcat-course/x04f6bc56%3Aabout-the-mcat-and-how-to-use-this-course/a/how-to-use-our-mcat-course-as-our-main-study-resource
- AAMC free planning and study resources: https://students-residents.aamc.org/prepare-mcat-exam/free-planning-and-study-resources
- AAMC study-plan guidance: https://students-residents.aamc.org/prepare-mcat-exam/creating-your-mcat-exam-study-plan
- Maqsad MDCAT: https://maqsad.io/mdcat
- Maqsad comparison of Pakistan MDCAT preparation options: https://maqsad.io/best-mdcat-preparation-pakistan
- UWorld MCAT QBank: https://gradschool.uworld.com/mcat/question-bank/
- Quizlet Learn: https://quizlet.com/features/learn

**Research boundary:** This is a public-web feature benchmark, not exhaustive access to logged-in products, paid course content, mobile apps or private student dashboards. Revisit competitors periodically and validate features directly before making product decisions.

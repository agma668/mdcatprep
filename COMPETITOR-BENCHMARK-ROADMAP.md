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
- Khan Academy guidance on combining content review and passages: https://www.khanacademy.org/test-prep/mcat/x04f6bc56%3Awelcome-to-the-mcat-course/x04f6bc56%3Aabout-the-mcat-and-how-to-use-this-course/a/how-to-use-our-mcat-course-as-main-study-resource
- AAMC free planning and study resources: https://students-residents.aamc.org/prepare-mcat-exam/free-planning-and-study-resources
- AAMC study-plan guidance: https://students-residents.aamc.org/prepare-mcat-exam/creating-your-mcat-exam-study-plan
- Maqsad MDCAT: https://maqsad.io/mdcat
- Maqsad comparison of Pakistan MDCAT preparation options: https://maqsad.io/best-mdcat-preparation-pakistan
- UWorld MCAT QBank: https://gradschool.uworld.com/mcat/question-bank/
- Quizlet Learn: https://quizlet.com/features/learn

**Research boundary:** This is a public-web feature benchmark, not exhaustive access to logged-in products, paid course content, mobile apps or private student dashboards. Revisit competitors periodically and validate features directly before making product decisions.


---

# Deep Competitor Feature Audit — 9 November 2026

This section expands the first scan into a feature-by-feature review of publicly accessible product pages, feature explainers, FAQs and course catalogues. It is not a claim that every logged-in screen, paid feature or native app has been inspected. Public feature descriptions are attributed to the provider; marketing metrics and performance claims are not independently verified.

## 1. BeambePrep — strongest reference for the integrated question + recall engines

Public sources: [main site](https://www.beambeprep.com/), [features](https://www.beambeprep.com/features/), [Pulse Manual](https://www.beambeprep.com/how-it-works/), [FAQ](https://www.beambeprep.com/faq/), [past-paper archive](https://www.beambeprep.com/past-papers/), [downloads](https://www.beambeprep.com/downloads/).

### Pulse / flashcard engine — feature inventory

- Four recall grades: Again, Hard, Good, Easy, with keyboard shortcuts.
- Short learning/relearning steps and due-review scheduling; visible New, Learning and Due states.
- FSRS-style personalized scheduling based on card difficulty and memory stability.
- Per-deck new-card and due-review controls; parent deck and sub-deck limits.
- Auto Pace Setter to distribute a deck over a chosen deadline or cards-per-day target.
- Card queue actions: end-of-queue, bury until tomorrow, suspend, unbury and unsuspend.
- Card Manager for deck-level control.
- Starred cards and fast-review/blitz mode for difficult/high-friction facts.
- Trouble-card/“leech” isolation after repeated failures, with graduation back to the deck after recovery.
- Streak tracking and earned streak freezes.
- Floating Pomodoro focus timer.
- Front-side recall time and back-side explanation-reading time tracking, with privacy/settings control.
- QBank-to-flashcard conversion for missed or saved MCQs, retaining review history.
- Mobile swipe grading and haptic feedback; keyboard-first controls on desktop.
- Offline deck preloading and later sync across supported native clients.
- Per-card error/typo reporting and central correction workflow.

**Edweb adoption:** Build a standards-based FSRS implementation (or use a maintained compatible library after technical review), not a proprietary clone. Include four honest recall grades, due/new/learning queues, daily new-card limits, deck/subdeck organization, suspend/bury/star, weak-card recovery, focus timer, and question-to-card conversion. Track time only as optional, transparent learning analytics. Start with online web persistence; add offline sync after conflict handling and data integrity are proven.

### Autopsy / question-bank engine — feature inventory

- Distinct question pool modes: unseen, authentic past papers, mistakes, flagged and all.
- Exam-specific timed full-length papers and generated mocks using configured quotas.
- Past-paper archive organized by authority, year, subject and chapter.
- Review mode with solutions vs self-test mode without answer spoilers.
- Detailed option-by-option rationales and analysis of why distractors are tempting.
- Question-level latency measurement and adaptive visual pacing cues.
- Mark/flag questions and isolate guessed answers as well as incorrect answers.
- Mistake/“Amber” remediation runs and repeat attempts until mastery.
- Peer answer distribution / crowd telemetry to show common distractor choices.
- Distractor strikeout and an optional scratchpad for calculations.
- Convert a missed or saved question into a flashcard.
- Offline question-bank access in native clients.

**Edweb adoption:** Build a transparent practice engine with custom filters, question flags, confidence/guess capture, wrong/slow/guessed review pools, option-level reviewed explanations, scratchpad, and a goal-aware retry loop. Add peer distribution only after sufficient consented, anonymized sample sizes; suppress small cohorts and never expose identifiable student activity. Use a deterministic blueprint-driven mock generator. Never invent a past paper or claim an original question is authentic.

### Other BeambePrep tools and ecosystem

- Free public past-paper archive and downloadable solved booklets.
- Printable OMR sheets for paper-based simulation.
- Topic-wise booklet/download library and browser PDF reading.
- Provincial textbook library across Pakistani boards.
- Aggregate/merit calculators for admissions pathways.
- Exam countdown / grind clocks.
- Public leaderboards and study telemetry.
- Public exam-match audit pages with question-to-card mapping and documented gaps.
- User review/debrief area.

**Edweb adoption:** Prioritize a verified paper archive, source-linked textbook references, printable OMR sheets, accurate admission calculators and exam countdowns. Public scoreboards/telemetry are optional and should be privacy-safe, opt-in and secondary to personal progress. Publish coverage audits only with reproducible methodology, official papers/keys and explicit gaps.

## 2. ePrepare Academy — strongest local workflow and study-planning reference

Public sources: [home](https://eprepare.org/), [packages and feature list](https://eprepare.org/packages), [Quiz Builder](https://eprepare.org/learn/quiz-builder).

Publicly described features include:
- Bookline, exercise, past-paper, revision and topic-wise question pools.
- Hints on questions and detailed explanations.
- Urdu and English explanation options.
- MCQ video discussions and recorded subject lectures.
- Handwritten notes, quick-revision notes, slides and chapter flashcards.
- Save MCQs, organize saved questions into folders, and turn MCQs into flashcards.
- Wrong-MCQ review and tags for why an answer was missed.
- Quiz Builder with subject/chapter selection, custom question count and timer.
- Full-length papers under exam timing with score, rank and percentile.
- Daily study plan with tasks across lectures, bookline MCQs, flashcards and QBank.
- Syllabus map, smart revision, schedule, progress analytics and previous-attempt history.
- Score predictor, leaderboard, community, doubt solving and mentors.
- Feature walkthrough/demo so a learner can understand the platform before enrolling.

**Edweb adoption:** Custom quiz builder, save folders, hint-first learning, bilingual explanations where reviewed, study task checklist, wrong-answer reason tags, score prediction with transparent assumptions, attempt history, and interactive feature demos. Keep teacher/mentor promises out of the product until staffing exists.

## 3. PrepMDCAT — emerging AI and personalization reference

Public source: [PrepMDCAT](https://prepmdcat.com/).

Its public page describes:
- Separate PMDC and NUMS preparation coverage and paper profiles.
- AI tutor and voice assistant in English and Urdu.
- AI visual explanations for diagrams, formulas and questions.
- Weak-topic drills that target low-performing topics.
- Personalized test generation by chapter or topic.
- Syllabus filters across national/provincial exam tracks.
- Large chapter-wise MCQ, mock, past-paper, formula and concise-note catalogue.
- Offline mode and free access tier.

**Edweb adoption:** The valuable product pattern is grounded tutoring + targeted practice + visual explanation. Any Edweb AI should cite approved lessons/questions, clearly distinguish source facts from generated explanation, refuse to guess when the library lacks support, and offer an ordinary textbook/teacher fallback. AI-generated questions must be draft-only until reviewed. Voice and diagram generation are later enhancements, not launch dependencies.

## 4. Khan Academy — strongest lesson progression and passage pedagogy reference

Public sources: [MCAT course](https://www.khanacademy.org/test-prep/mcat), [course units](https://en.khanacademy.org/test-prep/mcat).

The public course is organized into:
- Introductory course guidance and how-to-study material.
- Passage practice grouped by exam section.
- Foundational content units and skills.
- Lessons in video/article/question formats.
- Discrete practice alongside passage-based application.
- Guidance for using content lessons as the main or supplemental study resource.

**Edweb adoption:** Build each Prep Space as a structured syllabus-to-lesson-to-practice progression. Teach a concept, ask a retrieval question, then use it in a new application or passage. For MDCAT, use passage practice only where the actual exam blueprint and pedagogy justify it; do not import MCAT-specific subject areas or section assumptions.

## 5. AAMC — strongest official diagnostic and exam-readiness reference

Public source: [free planning and study resources](https://students-residents.aamc.org/prepare-mcat-exam/free-planning-and-study-resources).

Public resources include:
- Official content outline and content-outline course.
- Free full-length practice exam and unscored sample test.
- Practice interface tool to learn navigation and keyboard features.
- Sample question guide.
- Study-plan creation guidance.
- Khan Academy collection with videos and review questions.
- Score/percentile reporting for the scored practice exam.
- Student preparation experiences and webinars.

**Edweb adoption:** A diagnostic that maps to the official blueprint, a test-interface familiarization mode, official-style sample tests where permitted, clear score interpretation, and a transparent readiness report. Always label Edweb mock scores as estimates, not official predicted scores.

## 6. UWorld — strongest explanation quality, notes and adaptive planning reference

Public sources: [MCAT QBank](https://gradschool.uworld.com/mcat/question-bank/), [AI tutor](https://gradschool.uworld.com/mcat/uask/), [flashcards](https://gradschool.uworld.com/mcat/flashcards/), [digital notebook](https://gradschool.uworld.com/mcat/digital-notebook/), [study planner](https://gradschool.uworld.com/mcat/study-planner/).

Publicly described features include:
- Large exam-style QBank with visual, step-by-step rationales.
- Passage-linked multi-question practice.
- Full-length practice exams.
- Expert-authored concept-check questions and video lessons.
- AI tutor grounded in the provider's own course content.
- Flashcards linked to trusted content and spaced repetition.
- Digital notebook with unlimited tabs/pages, rich notes, search across titles and text, custom tags, and copy-to-notebook from questions/illustrations.
- Personalized or self-built study planner with dynamic schedule changes based on progress and balanced subject coverage.
- Detailed analytics for weak subjects/topics, trends and peer comparison.
- Mobile access for short practice and review sessions.

**Edweb adoption:** Question explanations with diagrams and stepwise reasoning; passage sets; personal searchable notebook; linked notes from question/lesson; dynamic study plan; and content-grounded tutor. Peer comparison remains optional and should not create pressure or expose small cohorts.

## 7. Quizlet — strongest conversion of static cards into active practice

Public sources: [Learn](https://quizlet.com/features/learn), [spaced repetition](https://quizlet.com/in/features/spaced-repetition), [help guide](https://help.quizlet.com/hc/en-ca/articles/48324742264077-Studying-with-Spaced-Repetition).

Publicly described features include:
- Multiple-choice, true/false and written response practice generated from card sets.
- Adaptive sessions that target difficult items.
- Spaced repetition based on student recall ratings.
- Adjustable new-card-per-day volume.
- New, learning and due card states.
- Keyboard shortcuts for flipping and grading.
- Cross-device progress synchronization (feature availability can differ by mode/device).
- Short focused sessions and progress feedback.

**Edweb adoption:** Convert reviewed flashcards into multiple study modes, not just flip cards. Offer typed recall and distractor-based MCQs generated from approved card content. Keep the student able to choose a mode and daily workload.

## Cross-platform feature synthesis — proposed Edweb engines

### Engine A: Recall and flashcards
1. FSRS scheduling with Again / Hard / Good / Easy.
2. New, learning, due and relearning queues.
3. Decks, subdecks, topic tags and exam-goal isolation.
4. New-card daily limit, due workload forecast and deadline pace setter.
5. Bury, suspend, star, custom folders and card manager.
6. Leech/struggle-card quarantine and targeted re-learning.
7. Fast review, keyboard controls and accessible mobile gestures.
8. QBank/lesson-to-card creation with preserved source and review history.
9. Optional focus timer, streaks and gentle recovery from missed days.
10. Offline review and conflict-safe sync in a later wave.

### Engine B: Question bank and assessment
1. Question pool filters: unseen, topic, difficulty, authentic past paper, saved, flagged, wrong, guessed, slow and all.
2. Custom quiz builder with subject/chapter/count/difficulty/time settings.
3. Exam blueprint-driven mock generator and full-length simulation.
4. Self-test and review modes; no accidental answer spoilers.
5. Per-option explanations, hints and worked calculations.
6. Confidence/guess capture and reason-for-error tags.
7. Wrong/guessed/slow remediation sessions with mastery rechecks.
8. Optional scratchpad, calculator (only if permitted by exam rules), option elimination and question flagging.
9. Time-per-question and section pacing analysis.
10. Post-test report with subject/topic gaps, trend and recommended next actions.

### Engine C: Learning content and notes
1. Syllabus map with learning objectives and completion state.
2. Lesson pages with original text, diagrams, short videos/audio only when available.
3. Passage-based application sets where relevant.
4. Personal notebook with tabs, rich text, search and tags.
5. Save/highlight a question explanation or lesson fragment into notebook.
6. Formula sheets, quick revision notes, printable topic sheets and OMR templates.
7. Source/provenance links and student error reporting on every content item.
8. Urdu/English presentation options only for content that has been properly translated and reviewed.

### Engine D: Planning and analytics
1. Baseline diagnostic and topic-level readiness profile.
2. Dynamic study calendar based on target date, available days, weak topics and due reviews.
3. Daily task list with adjustable workload and missed-day recovery.
4. Progress analytics by exam goal, subject, topic, difficulty and time.
5. Attempt history, saved sessions, mock history and trend lines.
6. Score/merit calculators with dated formula sources and transparent inputs.
7. Exam countdown and official notices with last-verified dates.
8. Optional focus timer and private streak indicators.

### Engine E: Guided help and community
1. AI tutor grounded in reviewed Edweb content with citations and uncertainty fallback.
2. Hint-first help and step-by-step explanation requests.
3. Student report/correction workflow and editorial moderation queue.
4. Human doubt support only when a real support team is available.
5. Opt-in cohorts and anonymized peer distributions only after sufficient sample sizes.
6. Public leaderboards are not a launch priority; personal mastery and wellbeing come first.

## Implementation priority and acceptance gates

| Priority | Build | Acceptance gate |
|---|---|---|
| P0 | Content provenance, official exam blueprint, canonical question model, student goal/RLS foundation | No unverified past-paper labels; no cross-user access; exam rules sourced and dated. |
| P1 | QBank filters, custom quiz builder, hints, option-level explanations, flags, wrong/guessed review | Durable attempts, accurate scoring, useful explanations and tests for every filter. |
| P1 | Flashcard engine + FSRS + QBank bridge | Scheduling is deterministic/tested; cards retain source links; progress is goal-scoped. |
| P1 | Diagnostic, syllabus map, planner and progress analytics | Recommendations trace to actual performance; plan can be edited and recalculated. |
| P2 | Personal notebook, passage practice, visual explanations, printable OMR | Content is original/licensed; accessible and mobile-usable. |
| P2 | Offline-first web experience and sync | No lost or duplicated reviews after disconnect/reconnect; explicit sync status. |
| P3 | Grounded AI tutor/voice/visuals, peer telemetry and human support | Safe source-grounding, privacy, moderation, costs and support capacity are validated first. |

## Agent backlog / task-board structure

The following work packages should be tracked as separate actionable tasks rather than a vague mega-task:
- **A1 — Student goal and data security:** complete schema review, narrowly scoped RLS policies and automated cross-user tests.
- **A2 — QBank engine:** question pools, custom quiz builder, flags, confidence/guess tags, hints and option-level rationales.
- **A3 — Mistake recovery:** wrong/guessed/slow queues, reason tags, retry scheduling and mastery checks.
- **A4 — Flashcard/FSRS engine:** recall grades, scheduler, daily limits, deck manager, leech handling, source-preserving QBank bridge.
- **A5 — Study planner and diagnostics:** baseline test, syllabus map, adaptive daily tasks, progress-based replanning.
- **A6 — Analytics and exam readiness:** subject/topic trends, time analysis, mock reports and clearly labelled score estimates.
- **A7 — Notebook and content library:** searchable personal notes, linked source excerpts, formula/quick-revision sheets.
- **A8 — Exam simulation and archives:** blueprint-based mocks, authentic past papers, review/self-test modes and printable OMR.
- **A9 — Offline and low-bandwidth:** cache, sync queue, conflict handling, resumable assets and data-saving controls.
- **A10 — Guided support and quality loop:** grounded AI tutor design, report-question workflow, editor review queue and optional cohort tools.

**Build discipline:** No paid APIs, paid infrastructure or subscription dependencies are required for the first waves. Prefer simple, maintainable, open standards and existing infrastructure. Do not clone competitor names, proprietary UI, text, questions, illustrations, algorithms or branding. Adopt product patterns and implement original Edweb experiences.

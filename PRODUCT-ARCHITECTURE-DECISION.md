# Apex Pakistan — Product Architecture Decision: Exam-Specific Prep Spaces

**Decision date:** 2026-11-08  
**Status:** Approved product direction; planning/documentation only  
**Applies to:** Academy UX, exam registry, learning engines, data isolation, access control and future monetization



## Product architecture decision — Prep Spaces (supersedes earlier portal wording)

**Decision, 2026-11-08:** Apex Pakistan is one academy and one application, with dedicated, exam-specific **Prep Spaces** inside it. Do not build a separate website/domain for every exam, and do not force every student into one generic dashboard. A Prep Space is a distinct student experience, not necessarily a separate deployment or codebase.

### Student-facing structure

1. **Academy home:** discover preparation goals and continue active goals.
2. **Category hub:** orient students across a broad family (Medical & Health, Engineering & Computing, School & College, University Admissions, Careers & Recruitment, Defence, Law, International & Graduate, etc.).
3. **Public exam information page:** explain the exact exam, authority, eligibility, verified pattern/syllabus, available preparation and readiness status; provide search-friendly discovery.
4. **Authenticated Prep Space:** focused dashboard and navigation for that exam, with its own syllabus, content, tools, mock rules and progress. The active exam context stays visible. Switching goals is deliberate and simple.

Use stable exam IDs and exam-specific routes within the same product (for example, public `/exams/mdcat` and student `/learn/mdcat`; route names are illustrative and must be mapped against existing routes before implementation). Closely related exams may share a category page or reusable engine, but must not silently share content, scoring rules or progress.

### Preparation Blueprints and reusable capabilities

Each exam receives a data-driven **Preparation Blueprint** defining its audience, official authority/source, syllabus version, navigation, enabled capabilities, assessment types, mock configuration, progress metrics, readiness state and content owner. Build reusable engines/capabilities (MCQ, timed assessment, flashcards, short/long written answers, essays, speaking/listening, interview practice, study planner, past-paper library, mistake review and analytics). A blueprint activates only what genuinely serves that exam. Do not expose irrelevant tools merely because the platform supports them.

Examples (illustrative, subject to official exam research):
- **MDCAT:** subject/topic learning, MCQ bank, explanations, flashcards/spaced revision, timed practice, exam-specific mocks, mistakes and mastery analytics.
- **PMA/Defence:** verified selection-stage guide, reasoning practice, academic screening where applicable, interview/communication preparation and stage readiness. No forced medical-style flashcard or generic MCQ-first UI.
- **CSS/PMS:** compulsory/optional syllabus, current-affairs workflow, essay, precis, comprehension, descriptive answer writing, timed submissions and feedback.
- **IELTS/PTE:** distinct reading, listening, writing and speaking workflows, task feedback and full simulations; do not reduce language tests to MCQs.
- **Matric/FSc/O/A Levels:** class/board/curriculum-specific subjects, chapters, lessons, MCQs, short/long answers, numericals and board-style papers as applicable.
- **Engineering/university aptitude:** shared question-delivery components where useful, but exam-specific topic maps, question pools, timing, scoring, mock patterns and progress.

### One account, multiple goals, strict entitlements

One student account may hold multiple preparation goals. Each goal has isolated attempts, bookmarks, notes, feedback, plans, scores and progress. A student must not see another exam's private content or progress through a shared engine.

**Commercial model must be pricing-ready from the beginning.** The initial launch may offer free access or a free acquisition period to build trust and student adoption, but the product must not promise that every exam remains free forever. When monetization is enabled:
- access is controlled by explicit, server-enforced entitlements scoped to a specific exam/Prep Space and product tier;
- purchasing MDCAT unlocks MDCAT only, not every Apex exam; a student preparing for PMA or CSS needs the corresponding entitlement unless an explicitly described bundle grants it;
- bundles, trials, scholarships, sponsored access and free samples are explicit products/policies, never accidental cross-access;
- public exam pages and account creation remain discoverable; the student sees clear included/locked states and pricing before purchase;
- authorization is checked server-side for content, APIs, downloads, attempts and progress writes—not merely hidden in the UI;
- retain an auditable entitlement model with start/end dates, status, source/order reference and revocation/refund handling. Never expose payment secrets or sensitive billing data.

Do not implement payment processing or change billing in this architecture-documentation task. Monetization details, local payment providers, tax/refund terms and pricing require separate research and explicit approval.

### Architecture principles and non-goals

- Share accounts, design system, infrastructure, content tooling and reusable engines; separate student experience and data by exam.
- Do not create dozens of independent sites/domains or duplicate application infrastructure by default.
- Do not create one universal feature menu for all students.
- Do not merge exams merely because they share subjects or an MCQ engine.
- Do not promise support for an exam until its Blueprint, content, rules and core journey pass readiness review.
- Use honest states: Available, Beta, Content in progress, Coming soon, or unavailable; never market an unbuilt Prep Space as complete.
- Keep the master national exam-demand inventory broad. Portal/Prep Space grouping is a later product decision based on syllabus, exam format, candidate journey, audience overlap and content readiness—not popularity alone.
- Keep Balochistan and smaller-city coverage first-class: local-board accuracy, regional admissions guidance, low-bandwidth/mobile performance and accessible pricing/access options.

### Delivery sequence

1. Inventory current routes, exam IDs, question banks, topic maps, mock settings, progress storage, feature availability and existing user access rules.
2. Define the Exam Registry and Blueprint schema, plus server-side exam-scoped data/access boundaries. Do not migrate production data until reviewed and approved.
3. Design academy home, category discovery, public exam pages, multi-goal student home and the active Prep Space shell.
4. Build and validate MDCAT as the first complete MCQ-heavy Prep Space against the existing product.
5. Build PMA as the contrasting selection-oriented Prep Space to prove the blueprint can support a different workflow.
6. Add CSS/PMS writing workflows, then engineering/university tests, school/college and remaining categories in evidence-based waves.
7. Add pricing/entitlements only after access boundaries and product value are proven; support the launch-free phase without hardcoding a forever-free promise.

### Acceptance criteria

- A student can enter their active Prep Space without repeatedly selecting an exam.
- Each Prep Space shows only relevant navigation and capabilities.
- Exam-specific content, mock rules, attempts and progress cannot bleed across exams.
- Multiple goals work under one account with clear switching and independent progress.
- Paid entitlements can grant exactly one exam or a named bundle; unauthorized API/content access is denied server-side.
- A free launch can transition to paid access without redesigning the account or data model.
- The exam readiness matrix and public claims accurately distinguish implemented, beta and planned experiences.

**Implementation status:** this is an approved product/architecture direction recorded in planning only. It does not mean the application, database, payment system, entitlements, routes or Prep Spaces have been implemented. No code, database, deployment, billing or domain settings are changed by this decision.


## Related agent boards

- [Master roadmap](ROADMAP-AGENT-BOARD.md)
- [Design & UX board](DESIGN-AGENT-BOARD.md)
- [SEO board](SEO-AGENT-BOARD.md)


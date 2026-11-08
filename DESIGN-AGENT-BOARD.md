# Design & Website Improvement Agent Board — Apex Pakistan / MED Prep

> Owner: design/product UX agent. Last baseline: 2026-11-08. This board governs visual quality, interaction design, accessibility, responsive behaviour and perceived performance. A design task is not done because a screenshot looks attractive: it must work at real breakpoints and with real content.

## Mission and product promise

Make the website feel like a polished, trustworthy, fast Pakistani learning product—not a generic template or a decorative landing page. The product should help a student answer three questions immediately:

1. Is this the right exam track for me?
2. What can I do here for free, right now?
3. What is my next useful study action?

The initial launch may use free access to build adoption, but the product must be pricing-ready and must not promise that every exam remains free forever. When monetization is enabled, access is exam-scoped: students unlock only the Prep Space(s) they purchase or receive through an explicit bundle, trial, scholarship or sponsored entitlement. Do not imply guaranteed admission, official affiliation or unsupported outcomes.

## Current verified baseline

- The public homepage is implemented in `app/page.tsx` with a fixed navigation, hero, stats, practice surfaces, steps, exam family links, past papers and FAQ.
- Shared landing components live in `components/landing/`; the nav uses tracked links, auth-route prefetching, theme switching and an Escape/resize-aware mobile menu.
- `app/globals.css` contains a detailed dark-navy “Instrument” token system: steel for structure, signal blue for actions, brass reserved for insignia, semantic states, reduced-motion/accessibility intent and a single translucent nav layer.
- The homepage currently brands itself “MED Prep”; `TODO.md` describes the broader platform as “Apex Pakistan (formerly MED Prep / mdcatprep)”. This is a brand decision that must be resolved before domain purchase and then applied consistently.
- The repo has 123 component files, 97 `lib` files and 61 route page files. The design audit must cover the public funnel and logged-in student experience, not just the homepage.
- The current Vercel project is named `edweb`; reported aliases are `edweb-nine.vercel.app`, `edweb-acma-32c6.vercel.app`, `edweb-git-main-acma-32c6.vercel.app`. SSO protection is enabled except for custom domains. Verify anonymous usability before visual sign-off.
- No custom domain is currently listed on the Vercel project. Domain purchase is deliberately deferred until the release gate in the master roadmap passes.

## Current architecture gap discovered

The existing `lib/exams-config.ts` has four top-level categories (`mdcat`, `pma`, `nust`, `usat`) and groups several distinct exams as subtests. For example, MDCAT's super-portal currently includes NUMS and USAT-M; the engineering portal groups NUST, GIKI, LUMS and USAT-E. This is a useful inventory starting point, but it does not yet prove that each exam has a distinct enough student experience, independent question/configuration rules or a clearly scoped progress context. The USAT portal currently represents Arts/Commerce variants while other USAT variants are nested elsewhere.

**First implementation task:** map each existing route, exam ID, bank, syllabus, mock configuration and feature to the actual exam it serves. Then decide which exams need their own portal route versus an exam-specific sub-workspace inside a category portal. Do not split routes or duplicate banks until this map is complete.

## Academy and portal experience model

Use this discovery-to-learning information architecture:

1. **Apex Pakistan Academy** — the public front door. Ask what the student is preparing for and make the next step obvious. Group options by broad goal, use plain-language labels and show the exact exam names under each group.
2. **Category hub** — a short chooser and orientation page (Medical, Engineering & Computing, University Admissions & Aptitude, Defence, and a clearly separate MBBS clinical-learning area). It helps a student compare related exams without mixing their content.
3. **Public exam information page** — an indexable, exam-specific explanation of the test, verified syllabus/pattern, eligibility and available preparation.
4. **Authenticated Prep Space** — the student's focused workspace inside the same application. Its navigation, syllabus, practice, mock settings, notes, guidance, entitlement and progress are scoped to the selected exam. Keep the exam name/context visible and make switching goals intentional and easy.

**Critical UX rule:** share infrastructure and design components, not the student's cognitive context. Never mix MDCAT questions into NUMS practice, NUST mock rules into GIKI, or defence preparation into university-admission navigation. Where exams overlap, explain the overlap and keep separate exam-specific modes.

- Preserve one account and shared accessibility/design language across the academy.
- Remember the student's selected exam when useful, but always show the active context and provide a clear switch path.
- Ask for an exam goal during onboarding only when needed; allow multiple goals for students preparing for more than one test.
- Every public exam page and Prep Space must show a clear “what's included”, access/entitlement and readiness state. Do not present incomplete tracks as fully operational.
- Keep MBBS clinical notes visibly separate from pre-admission medical entrance preparation.

## Design principles

1. **Clarity before decoration.** Every screen has one dominant task and an obvious hierarchy.
2. **One design language.** Reuse tokens and components; no local random colours, radii, shadows or motion.
3. **Accessible by default.** WCAG 2.2 AA target for text, controls, focus, keyboard, labels and status messaging.
4. **Mobile-first.** The critical experience must work at 360px, 390px and 768px, then scale elegantly to desktop.
5. **Performance is design.** Avoid heavy client bundles, layout shifts, expensive blur, large autoplay media and motion that blocks content.
6. **Honest states.** Loading, empty, error, locked, offline and unavailable states must be explicit; never display guessed zeroes.
7. **Real product, not mockup.** Use actual question data, real routes and authentic user states. No fake counters or placeholder testimonials.
8. **Motion with purpose.** Respect `prefers-reduced-motion`; all animation durations and delays must collapse.
9. **Touch targets.** Aim for at least 44×44 CSS px for primary interactive controls.
10. **Consistent language.** Product naming, exam names, button labels and terminology must match across marketing and app surfaces.

## Board

### P0 — Brand and experience audit

- [ ] Confirm the brand system: Apex Pakistan as the parent academy, with MED Prep considered a medical-portal/product label only if the founder approves. Do not rename production surfaces until the decision and migration map are recorded.
- [ ] Audit homepage as the academy front door: value proposition, plain-language goal selector, exam names, free promise, first action, proof and FAQ.
- [ ] Design category hubs and a repeatable dedicated-exam-portal template; test that students can tell which exam they are in at every step.
- [ ] Create an exam/portal content matrix showing separate syllabus, question bank, practice, mock rules, notes, guidance and completion/readiness state for each exam.
- [ ] Audit navbar on desktop, tablet and mobile: hierarchy, tap targets, active state, focus, Escape, resize and scroll behaviour.
- [ ] Audit all public routes: `/`, `/exams`, `/portal/[exam]`, `/topicals`, `/past-papers`, `/daily-quiz`, `/flashcards`, `/notes`, `/blog`, `/faq`, `/pricing`, `/resources`, `/login`, `/signup`.
- [ ] Audit the complete student journey: signup → pending/approval state → dashboard → choose exam → practice → explanation → mistake notebook → flashcards/notes → mock test → progress.
- [ ] Record screenshots and issues at 360px, 390px, 768px, 1024px and 1440px. Use a consistent page/viewport checklist.
- [ ] Identify any confusing or dead CTAs, duplicate navigation, dead ends, inconsistent terminology and pages that look like separate products.
- [ ] Confirm every visible feature is actually available; label future features honestly.

### P1 — Design system and components

- [ ] Review token naming, contrast notes, spacing scale, typography scale, radius, shadows, elevation and semantic colour roles in `app/globals.css`.
- [ ] Check whether the current dark navy visual system serves the full audience and long study sessions; evaluate a light theme only as a real usability option, not novelty.
- [ ] Consolidate buttons, badges, cards, form controls, tabs, dialogs, toasts, empty states and skeletons into reusable accessible primitives.
- [ ] Remove one-off styles that conflict with the shared token system.
- [ ] Ensure visible focus rings on every keyboard-operable element.
- [ ] Ensure all inputs have persistent labels, useful validation and clear error recovery.
- [ ] Verify contrast at actual rendered states (default, hover, focus, disabled, success, warning, error).
- [ ] Ensure theme changes recolour all app surfaces without reload or flash, and persist safely.
- [ ] Audit icons for consistent size, stroke and accessible naming.
- [ ] Check motion settings and reduced-motion kill switch across every animation library and CSS animation.

### P2 — Homepage conversion and content hierarchy

- [ ] Make the hero answer: who it is for, what is free, which exams are supported, and what to click first.
- [ ] Choose one primary CTA and one secondary CTA; avoid equal-weight CTA overload.
- [ ] Make exam selection clear and fast; avoid sending students to a generic route when a specific practice route exists.
- [ ] Show only defensible live/product stats with an “as of” timestamp or remove the tile when unavailable.
- [ ] Add a playable MCQ sample on the landing page only after it is accurate, keyboard-accessible, mobile-friendly and instrumented.
- [ ] Improve social proof only with verified activity and transparent methodology; no fabricated testimonials or user counts.
- [ ] Clarify the difference between practice, topicals, mock tests, released past papers, notes and flashcards.
- [ ] Add a simple “how it works” path with concrete screenshots/real product moments.
- [ ] Reduce long-page repetition; ensure each section earns its place.
- [ ] Make footer useful: support/contact, privacy, terms, copyright and exam navigation.

### P3 — Student application UX

- [ ] Make the active exam context persistent and unmistakable across dashboard, practice, mock tests, notes and progress; provide a deliberate switcher and support multiple goals.
- [ ] Keep each portal's content and navigation scoped to its own exam; shared UI components must not silently blend exam rules or question banks.
- [ ] Simplify dashboard hierarchy: next best action, today's work, progress and navigation.
- [ ] Make practice sessions excellent: readable question, distinct options, clear selected/correct states, explanation, progress, timing and next question.
- [ ] Make mock-test flow exam-accurate and calm: instructions, timer, navigation, review, submit confirmation and results.
- [ ] Make the mistake notebook actionable: group by subject/topic and provide a one-click re-practice path.
- [ ] Make flashcards comfortable for repeated use: keyboard controls, interval labels, due/empty states and accessible flip behaviour.
- [ ] Make notes reader legible for long sessions: typography, line length, section navigation, progress and accessible print/download policy.
- [ ] Improve analytics so students understand trends without shame, misleading rankings or unsupported comparisons.
- [ ] Ensure offline mode explains what is cached, what needs a connection and how sync conflicts/errors resolve.
- [ ] Audit admin workflows separately; admin density must not leak into student UI.

### P4 — Quality, responsiveness and performance

- [ ] Run visual QA at 360, 390, 768, 1024 and 1440 widths for homepage, exam hub, login/signup, dashboard, practice, mock, notes and admin.
- [ ] Check horizontal overflow, clipped dialogs, sticky/fixed collisions, safe-area insets and keyboard overlap.
- [ ] Check touch targets and thumb reach on primary actions.
- [ ] Check loading, empty, error, offline, locked and success states for every key workflow.
- [ ] Test keyboard-only navigation and screen-reader names on critical journeys.
- [ ] Test zoom to 200% and text scaling without loss of content/functionality.
- [ ] Measure LCP, INP and CLS on mobile; set budgets before polishing micro-interactions.
- [ ] Lazy-load non-critical below-fold sections and heavy visualizations; avoid shipping large animation code to simple content routes.
- [ ] Optimize images/fonts and prevent layout shifts.
- [ ] Verify reduced motion, high contrast/forced-colours and browser fallback behaviour.

### P5 — Brand and launch polish

- [ ] Resolve brand architecture and write a one-page voice/style guide.
- [ ] Ensure favicon, app icons, OG image, PWA manifest, email templates and UI wordmark match the approved brand.
- [ ] Ensure page titles, footer, legal pages and contact details use the same public brand.
- [ ] Prepare a product walkthrough using real, non-sensitive demo content.
- [ ] Run a first-time-student usability pass with a small group; capture issues without collecting unnecessary personal data.
- [ ] Close all P0/P1 issues and all severity-1/2 bugs before the 10/10 release review.

## Design QA scorecard

Score each dimension 0–5 with evidence; a 10/10 launch target is not a subjective thumbs-up.

| Dimension | Weight | Pass condition |
|---|---:|---|
| First impression & clarity | 15% | Student understands value and next action in 5 seconds |
| Visual consistency | 15% | Shared tokens/components; no obvious one-off styling |
| Mobile usability | 20% | Core flows work at 360/390/768 with no blocking defects |
| Learning workflow UX | 20% | Practice/mock/notes/flashcards are clear and reliable |
| Accessibility | 15% | Keyboard, focus, labels, contrast and reduced motion pass |
| Performance & stability | 15% | Core Web Vitals measured; no major layout shifts or blocking JS |

Release gate: weighted score at least 4.5/5 in each category, zero unresolved critical/high-severity defects, and founder sign-off. If a dimension lacks evidence, mark it “not assessed”, not 5/5.

## Definition of done

- Visual system is consistent across marketing, student and admin surfaces.
- All critical journeys work at desktop and mobile widths.
- Accessibility and reduced-motion checks pass.
- No fake data, dead CTA, broken layout, or confusing brand mismatch.
- Performance is measured and acceptable on a mid-range mobile device and slower connection.
- Screenshots, test notes and any remaining known limitations are recorded in `IMPROVEMENT_LOG.md`.

## Agent handoff

Read `AGENTS.md`, `TODO.md`, this board and the relevant component before editing. Coordinate ownership in `ROADMAP-AGENT-BOARD.md`; one agent per tree. Stage explicit file paths. Run typecheck, targeted lint, build and visual smoke tests at the required breakpoints. Append a concise why-focused entry to `IMPROVEMENT_LOG.md`. Do not deploy to production merely because a local screenshot looks good.


## Portal clarity acceptance test

Ask a first-time student to find their exam, start relevant practice, locate its syllabus and identify the mock-test rules. They should not need staff guidance, should never encounter another exam's questions/rules by accident, and should be able to identify the active exam on every learning screen. Test both a single-exam student and a multi-exam student. Record observed confusion and fix the navigation/content model rather than adding more labels.


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


## 2026-11-08 codebase audit findings

The first-pass implementation audit is recorded in `EXAM-READINESS-AUDIT.md`. Design must treat the current `/portal/[exam]` pages as public category/portal overviews, not as completed authenticated Prep Spaces. The current portal page also promises “Free forever” / “100% free … Ever”; replace those claims with the approved honest launch/access policy before public release. Subtest cards currently append a `subtest` query parameter while the active family choice is stored separately in browser localStorage; verify that the chosen exam is actually preserved through the full student journey. The shared dashboard currently exposes broad exam switching, while progress is not partitioned by exam. The next visual model must make the active Prep Space explicit and must not imply that GIKI/LUMS/HEC USAT standard/AFNS have distinct content workflows where the code does not yet support them.


The extended audit also found permanent-free claims across the signup and portal surfaces, plus a pricing page whose “pass activated” success state is client-only and does not create an access grant. Treat the pricing/access screen as a trust-critical design defect: do not show false success, lifetime access or future inclusions. Redesign it as an honest access-information page until real entitlement and payment systems exist. Public samples versus protected full preparation need an explicit product rule.


The next data model is documented in `EXAM-DATA-BOUNDARY-DESIGN.md`: one student can have multiple goals, but attempts/bookmarks/notes/flashcard reviews are scoped to a goal; the active exam selector is not an authorization boundary. UX should display locked/available states from server-authorized goal access and keep progress separate when the same student switches exams. The design is not implemented yet.


Official pattern verification also changes the UX taxonomy: standard HEC USAT has six stream variants and an essay-writing component; the existing 100-MCQ bank is the Balochistan/FATA scholarship-test variant and must be labelled separately. NUST NET has five paper types, while the current mock is specifically NET-Engineering. The design must show the selected variant and its exact readiness state, not just the parent exam name.

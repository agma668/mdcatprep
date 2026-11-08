# Design & Website Improvement Agent Board — Apex Pakistan / MED Prep

> Owner: design/product UX agent. Last baseline: 2026-11-08. This board governs visual quality, interaction design, accessibility, responsive behaviour and perceived performance. A design task is not done because a screenshot looks attractive: it must work at real breakpoints and with real content.

## Mission and product promise

Make the website feel like a polished, trustworthy, fast Pakistani learning product—not a generic template or a decorative landing page. The product should help a student answer three questions immediately:

1. Is this the right exam track for me?
2. What can I do here for free, right now?
3. What is my next useful study action?

The primary product remains free. Do not imply locked paid features, guaranteed admission, official affiliation or unsupported outcomes.

## Current verified baseline

- The public homepage is implemented in `app/page.tsx` with a fixed navigation, hero, stats, practice surfaces, steps, exam family links, past papers and FAQ.
- Shared landing components live in `components/landing/`; the nav uses tracked links, auth-route prefetching, theme switching and an Escape/resize-aware mobile menu.
- `app/globals.css` contains a detailed dark-navy “Instrument” token system: steel for structure, signal blue for actions, brass reserved for insignia, semantic states, reduced-motion/accessibility intent and a single translucent nav layer.
- The homepage currently brands itself “MED Prep”; `TODO.md` describes the broader platform as “Apex Pakistan (formerly MED Prep / mdcatprep)”. This is a brand decision that must be resolved before domain purchase and then applied consistently.
- The repo has 123 component files, 97 `lib` files and 61 route page files. The design audit must cover the public funnel and logged-in student experience, not just the homepage.
- The current Vercel project is named `edweb`; reported aliases are `edweb-nine.vercel.app`, `edweb-acma-32c6.vercel.app`, `edweb-git-main-acma-32c6.vercel.app`. SSO protection is enabled except for custom domains. Verify anonymous usability before visual sign-off.
- No custom domain is currently listed on the Vercel project. Domain purchase is deliberately deferred until the release gate in the master roadmap passes.

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

- [ ] Decide the public brand system: “Apex Pakistan”, “MED Prep”, or a clear parent-brand/product relationship. Record the decision before changing names.
- [ ] Audit homepage from a first-time student's perspective: value proposition, exam selector, free promise, first action, proof and FAQ.
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

- [ ] Make exam-track selection persist and remain visible; students should always know which exam context they are in.
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

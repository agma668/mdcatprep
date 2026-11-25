# Edweb / Apex Pakistan — Design Refresh Implementation Brief

**Status:** Proposal for review; no application code or production settings changed  
**Prepared:** 2026-11-10  
**Base inspected:** `apex/prepspace-foundation` at `15fa25b4326f31c66b6872882fcfc478d950dee6`

## 1. Design decision

Move the public academy and student application toward a **quiet, editorial academic design**: clear typography, warm light surfaces, deep ink/navy text, one restrained blue action colour, generous whitespace, precise dividers, and calm data visualizations.

The goal is not to imitate BeambePrep's brand. Borrow useful product patterns—exam-specific hubs, interactive product demonstrations, visible feature explanations, and transparent evidence pages—while keeping Apex's own identity and a simpler visual voice.

### Visual principles

- Academic, composed, trustworthy; not a gaming dashboard or generic SaaS template.
- Content first: one main task per screen, readable line lengths, clear hierarchy.
- Use colour to communicate action and state, not decoration.
- Prefer borders and spacing over stacks of glass cards and heavy shadows.
- Use restrained motion only where it improves feedback; respect reduced-motion.
- Design mobile-first for 360px and 390px, then 768px, 1024px and 1440px.
- Maintain accessible contrast, visible focus, labels, keyboard operation and 44px touch targets.

## 2. What the current code tells us

The current homepage in `app/page.tsx` already has a promising editorial foundation: a direct headline, a real interactive sample question (`components/landing/ExamPaper.tsx`), exam links, feature list, past-paper archive, three-step explanation and FAQ.

The main issues are consistency and product truth, not a need to replace everything:

1. The public brand is still labelled **MED Prep** across `app/layout.tsx`, `lib/site.ts`, `components/landing/Navbar.tsx` and metadata, while the approved architecture describes **Apex Pakistan** as the academy with exam-specific Prep Spaces. The brand decision needs a single approved mapping before broad renaming.
2. Homepage and FAQ copy still promises “100% free”, “nothing locked”, and “free forever” in places, while `PRODUCT-ARCHITECTURE-DECISION.md` and `TODO.md` explicitly say launch access may be free but must not promise permanent free access. Correct this before a visual refresh.
3. The public homepage uses the newer “Instrument” token system in `app/globals.css`, but the dashboard still contains a separate visual language (glass tiles, multiple gradient tints, different card treatments). The student application needs a consistent component/token pass.
4. The four current themes (Midnight, Forest, Wine, Iris) are all dark palettes. There is no calm light/paper theme for long reading sessions.
5. Some homepage sections are intentionally text-led and clean. Preserve that restraint; do not add extra sections just to make the page longer.
6. `app/exams/page.tsx` uses a separate header and different component styling from the homepage. Public routes should share one masthead and footer system.

This is a code-based audit, not a claim that every route has been visually tested in a browser. Live deployment access was not available to this review.

## 3. Useful patterns observed in BeambePrep

Public pages reviewed: [homepage](https://www.beambeprep.com/), [features](https://www.beambeprep.com/features/), [Pulse Manual](https://www.beambeprep.com/how-it-works/), [downloads](https://www.beambeprep.com/downloads/) and [FAQ](https://www.beambeprep.com/faq/).

Patterns worth learning from:

- **Exam-specific discovery:** each preparation track has its own clearly described purpose and entry point.
- **Try-before-signup:** interactive sample question and flashcard experiences let a student understand the product before creating an account.
- **Feature explainers:** the site explains how its recall and question engines work instead of relying only on a list of claims.
- **Evidence pages:** exam coverage audits are presented with a method, individual matches and acknowledged gaps. Edweb should publish comparable audits only when it has verified source papers, keys and reproducible mappings.
- **Resource organization:** downloads and past papers are grouped into useful collections rather than buried in a generic resource list.
- **Connected learning loop:** missed questions, recall practice and revision are presented as parts of one workflow.

Patterns not to copy:

- Overly dense feature inventories, invented-sounding product jargon, oversized numerical claims, aggressive superlatives, and decorative mascots.
- Any competitor-specific brand, copy, visual assets, proprietary names or unverified performance claims.
- Exam or institution coverage that conflicts with the project's explicit content boundaries.

## 4. Proposed visual system

### Palette direction

Introduce a light “Paper” theme as an additional option, keeping Midnight as the existing dark option. Do not remove the existing themes until usage and accessibility are evaluated.

Suggested starting tokens (validate contrast before shipping):

| Role | Starting value | Use |
|---|---|---|
| Page | `#F6F5F1` | Warm neutral page background |
| Surface | `#FFFFFF` | Main content panels |
| Raised surface | `#F0F2F5` | Subtle grouping and hover |
| Ink | `#172536` | Primary text |
| Secondary ink | `#536273` | Supporting text |
| Primary | `#285A87` | Links and primary actions |
| Primary hover | `#1E466D` | Hover/pressed action |
| Accent | `#B58A4A` | Small highlights only |
| Border | `#DDE2E7` | Dividers and card outlines |
| Success / warning / error | Semantic, tested values | Status only |

### Type and layout

- Keep the self-hosted Inter body font initially to avoid unnecessary font requests.
- Test a restrained serif display face using a system stack for selected editorial headings; do not load another remote font before measuring.
- Use a consistent spacing scale and 8–12px corner radii for most controls and panels.
- Reserve larger radii for a small number of hero/demo surfaces.
- Limit content width for reading; keep data tables and question options aligned.
- Remove decorative grid/noise/blur from content-heavy pages where they reduce legibility.

### Component rules

- One primary button style, one secondary style, one quiet text action.
- One card treatment for standard content; use border and whitespace rather than multiple shadows.
- Consistent badges for Available, Beta, In progress and Coming soon.
- Standard empty, loading, error, locked and success states.
- Reusable section headings, page headers, breadcrumbs, exam-context header and mobile navigation.
- Lucide icons already in the project are sufficient; do not add another icon package.

## 5. Page-by-page experience

### Public academy home

1. Shared masthead: approved Apex identity, Exams, Resources, How it works, Sign in, one primary action.
2. Hero: concise promise, supported-exam selector, one primary CTA and one secondary CTA.
3. Interactive sample: keep the working sample question; improve its spacing and answer feedback.
4. Exam families: Medical, Engineering & Computing, University Admissions, Defence, and separate Clinical Learning only when its readiness is clear.
5. Learning loop: Practice → Understand → Review mistakes → Retain.
6. Verified resources: past papers, syllabus notes and calculators with source/provenance labels.
7. FAQ and a compact, useful footer.

Avoid fake testimonials, unsupported counts, invented success rates and permanent-free claims.

### Exam discovery and public exam pages

- Reuse the same masthead/footer across all public pages.
- Group exams by category, not a wall of equally weighted tiles.
- Each exam page states the authority, verified pattern/syllabus version, available tools, content readiness and access status.
- Distinguish Available, Beta, In progress and Coming soon honestly.
- Make the next action specific to that exam.

### Student dashboard

- Persistent active Prep Space name and deliberate goal switcher.
- First block: next useful action, not social proof or a leaderboard.
- Compact “today” panel for due work and a clear continue-practice action.
- Subject/topic progress only when there is real attempt data; never render guessed zeroes.
- Move secondary community, referral and achievement content below core study actions.
- Standardize cards, buttons, labels and charts with the public design tokens.

### Practice and mock player

- Give the question the largest visual priority.
- Keep exam, subject, progress and timer in a quiet top bar.
- Options have large hit areas and clear selected/correct/incorrect states.
- Explanations are readable and separated from the answer state.
- Keep flag, confidence/guess and next-question actions consistent.
- Mock mode must remain calm and exam-accurate; no decorative animations during timed work.

### Flashcards and notes

- Flashcards: clear New / Learning / Due counts, readable card face, four accessible review controls and keyboard shortcuts where implemented.
- Notes: paper-like reading surface, comfortable line length, section navigation, clear source attribution and print/download policy.
- Keep the light theme particularly legible for long-form study.

## 6. Implementation order

### Design Wave A — foundations (no product logic changes)

- Approve brand architecture and map current MED Prep labels to the approved product naming.
- Add a Paper theme using existing CSS variables and theme engine.
- Unify public masthead/footer and shared page typography.
- Correct outdated access/free wording to match the approved launch policy.
- Capture before/after screenshots at 360, 390, 768, 1024 and 1440px.

### Design Wave B — academy discovery

- Refine homepage hierarchy and exam-family chooser.
- Improve exam hub and public exam page template.
- Add clear availability/readiness labels.
- Keep the interactive sample and make sure it works by keyboard and touch.

### Design Wave C — student workspace

- Align dashboard with the public tokens and reduce competing cards.
- Make active Prep Space and next best action dominant.
- Standardize practice, mock, flashcard and notes UI.

### Design Wave D — verification

- Keyboard-only walkthrough and visible focus check.
- Contrast checks for every theme and state.
- Reduced-motion and 200% zoom checks.
- Mobile overflow and touch-target checks.
- Build, typecheck, targeted lint and route smoke tests.
- Record screenshots and remaining limitations in `IMPROVEMENT_LOG.md`.

## 7. Technical constraints and ownership

- This is a design-only workstream. Do not change Supabase schema/data, auth, exam rules, question mappings, scoring, attempts, flashcard scheduling or entitlements.
- Do not deploy or change Vercel settings.
- Do not install new UI, animation, icon or chart dependencies without a concrete gap and approval.
- Reuse the existing Next.js, Tailwind CSS, CSS-variable theme engine and Lucide components.
- Coordinate with the agent working on `apex/prepspace-foundation`; do not edit the same branch or overlap his files.
- Build the visual refresh on an isolated branch and open a reviewable PR. Merge only after the active foundation work is stable.
- A design task is not complete based on a mockup alone: test real routes and content at the required breakpoints.

## 8. Acceptance checklist

- [ ] Brand naming is consistent and approved.
- [ ] No permanent-free or unsupported outcome claims remain.
- [ ] Paper theme is readable and passes contrast checks.
- [ ] Public masthead/footer are consistent.
- [ ] Exam readiness and access states are truthful.
- [ ] Dashboard prioritizes the student's next useful action.
- [ ] Practice, mock, flashcards and notes share a coherent component language.
- [ ] No dead controls, horizontal overflow or clipped dialogs at required widths.
- [ ] Keyboard, focus, reduced motion and 200% zoom checks pass.
- [ ] Typecheck, lint, build and smoke tests pass.
- [ ] Screenshots and improvement-log entry are included.

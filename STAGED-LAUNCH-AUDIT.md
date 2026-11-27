# Staged Public Launch — Live Site + Repository Audit

**Audit date:** 2026-11-28  
**Repository:** `agma668/mdcatprep` · branch `main`  
**Launch model:** Staged public launch (founder-confirmed in this session)  
**Scope:** Public discovery and free sample surfaces first; controlled/gradual registration and learning access; premium monetization only after core reliability and entitlement controls pass.

## How to read this audit

- **DONE** — implementation is present and code-level evidence is clear; runtime acceptance may still be separate.
- **PARTIAL** — a useful implementation exists, but the complete user journey or coverage is incomplete.
- **BROKEN** — source evidence reveals a defect or a critical path cannot work under the verified current data state.
- **MISSING** — the requested capability is not implemented in the inspected source.
- **UNVERIFIED** — code suggests a capability, but production configuration, clean-session runtime, account journey, or content rights cannot be established from available evidence.

Do not interpret code presence as proof of production functionality. This is a source/configuration/data audit, not a completed browser-based QA sign-off.

## Executive result

The repository contains substantially more product work than a simple MCQ bank: public topical practice, bundled question arrays, released-paper registry, bookmarks, mistake capture, flashcard/FSRS modules, mock flows, offline queueing, analytics, Google OAuth UI, public merit calculator and official-syllabus pages. Several features are real implementations, but the canonical database currently has **zero question rows and zero attempt rows**, so the database-backed student practice/persistence path cannot be called production-ready.

**Critical security finding:** `app/api/questions/route.ts` uses the service-role client, accepts a caller-controlled `status` query parameter, has no visible authentication/authorization check, and selects `correct_answer`. A public request can therefore ask for non-published statuses and retrieve answer keys if the deployed route matches source. Treat as **P0 / release blocker**; verify and fix before inviting students. Do not expose answer keys in initial question-delivery payloads.

**Second critical trust finding:** `lib/stats.ts` sets `COMMUNITY_BASELINE = 900` and `communitySize()` floors the displayed student count at 900 even when the real count is lower or unknown. This conflicts with the repo's honesty rule and with the public-stats comments claiming counts are real. Remove the artificial floor or label the figure as something other than students; do not publish an inferred user count.

**Public-site limitation:** repository and Vercel configuration were inspected, but a fresh anonymous browser session and end-to-end interaction could not be completed in this audit environment. DNS/HTTP probes were unavailable here. Consequently, visible navigation, live CTA outcomes, mobile layout, exact page status and actual signup/login/attempt journeys remain **UNVERIFIED** unless source/config/data evidence below proves otherwise.

## Evidence reviewed

- `AGENTS.md`, `TODO.md`, `ROADMAP-AGENT-BOARD.md`, `SEO-AGENT-BOARD.md`, `DESIGN-AGENT-BOARD.md`, `APEX-PROJECT-BOUNDARY.md`, `EXAM-READINESS-MATRIX.md`.
- GitHub tree for `main`: 924 entries; Vercel latest production deployment reports READY at commit `45e8b70807daeeba08695fde4dd9611c720176c7`.
- Vercel project `edweb`: production deployment READY; preview SSO protection enabled; no custom domain listed in project aliases; project aliases include `edweb-nine.vercel.app`, `edweb-acma-32c6.vercel.app`, `edweb-git-main-acma-32c6.vercel.app`. A READY deployment is not a public-access or product QA pass.
- Read-only Supabase query on project `edweb` (`niiskuwlpccmdtwjoxvm`): `questions=0`, `question_attempts=0`, `question_bookmarks=0`, `profiles=3`. No rows or personal profile details are reproduced here.
- Source files inspected include homepage, navbar/footer, past-paper index and registry, question repository/actions/API, bookmark actions, attempt recorder, offline sync, quiz-session state, mock setup/player, auth/signup/Google OAuth, public stats, merit calculator, MDCAT/NUMS syllabus, sitemap and site constants.

## Feature-by-feature status

| Capability | Status | Evidence / limitation |
|---|---|---|
| Public academy homepage | PARTIAL | `app/page.tsx` contains exam tiles, practice surfaces, FAQ and CTAs. Live anonymous rendering, current CTA destinations and mobile behaviour were not observed in a clean browser. |
| Visible brand architecture | PARTIAL | Navbar/footer and `SITE_NAME` use **MED Prep**; repo/roadmap use Apex Pakistan as parent academy. Founder has not approved a final visible naming architecture. Do not bulk rename. |
| Public topical question bank | PARTIAL | `app/topicals` and `lib/topicals.ts` provide a large bundled topical bank; homepage describes 16k+ class of questions in prior improvement log. Audit content quality, rights, answer review and actual client interactions before treating all entries as publishable. |
| Question bank canonical Supabase ingestion | BROKEN | Live `questions` table currently has 0 rows. Admin-created questions can exist, but bundled content is not proven seeded in production. |
| Public sample without signup | PARTIAL | Homepage copy and `/start/[test]` architecture indicate free sample routes; exact anonymous start-to-answer-to-explanation journey not browser-tested. |
| Published question read helper | PARTIAL | `lib/questions-repo.ts` reads published DB rows only; with empty table it returns an empty list. Some bundled banks have separate runtime paths. |
| Question answer explanations | PARTIAL | Bundled question types contain explanations and UI advertises explanation after answer; explanation completeness, accuracy and Urdu coverage have not been audited question-by-question. |
| Server-side attempt recording | PARTIAL | `app/actions/practice.ts` derives user and correctness server-side, validates selected answer, checks published status and supports idempotency. However attempts require a resolvable published DB question row; bundled question-key fallback also resolves through the same empty DB table. |
| Offline attempt queue | PARTIAL | `lib/offline-sync.ts` implements queueing/idempotent drain for signed-in students; live sync and recovery are not proven against production question rows. |
| Mock-test UI | PARTIAL | `MockTestPlayer` and format setup exist. MDCAT mock is explicitly a custom 100-question scaled sample, not the official 180-question blueprint; NET is scaled to 81 available questions; HEC option is specifically the Balochistan/Ex-FATA scholarship pattern, not standard USAT-M. |
| Mock resume | PARTIAL | Shared `useQuizSession` supports sessionStorage resume only when a `resumeKey` is supplied; `MockTestPlayer` shown here does not pass one and explicitly warns that reload discards an exam run. |
| Bookmarks | PARTIAL | Server actions exist and derive student ID from session; canonical bookmark table currently has 0 rows and feature cannot be accepted without a real signed-in persistence test. |
| Mistake notebook | PARTIAL | Wrong-answer capture is scheduled by attempt action; requires successful DB attempt. Verify capture, retry schedule and re-practice route end-to-end. |
| Flashcards / spaced repetition | PARTIAL | FSRS, review state, organization and UI modules exist with tests; production content coverage, review persistence and goal scoping need validation. |
| Analytics / progress | PARTIAL | Fetchers and dashboards exist; zero canonical attempts means no real progress baseline. Never substitute fabricated values. |
| Past-paper registry | DONE (code) | `lib/past-papers.ts` records examining body, year, kind, region, key status and notes. |
| Past-paper question mapping | UNVERIFIED / likely incomplete | Registry exists, but each paper's actual file availability, question-to-paper attribution and key verification need item-level audit. A historic internal audit found no tagged questions in a legacy MDCAT array; do not assume that old finding describes current state without rerunning the audit. |
| BUMHS/Balochistan content | PARTIAL | Registry includes BUMHS 2022, 2024 and 2025 entries; `knowledge-base/reference` includes BUMHS 2025 subject files. This is not proof that all PDFs are published, mapped or reviewed. |
| Repeated-question stars | UNVERIFIED | Knowledge-base report identifies repeated-question clusters; no confirmed student-facing repeated-question badge/filters were located in the inspected source. |
| Honest answer/provenance labels | PARTIAL | Paper registry distinguishes official, recreated, memory-based, campus-test and mock; key labels distinguish official vs circulating keys. Needs a full rendered and source-level audit of every mapped item. |
| Public merit calculator | DONE (code) | `/merit-calculator` is public in source, has metadata, PM&DC 2026 source link, review date and no-account label. |
| MDCAT syllabus page | DONE (code) | `/syllabus/mdcat` exists with official pattern, source, review date and limitations. |
| NUMS syllabus page | DONE (code) | `/syllabus/nums` exists with NUMS-specific TOS and explicit caveat about an internal source inconsistency. |
| SEO internal discovery of calculator/syllabus | PARTIAL | Pages exist and are linked to each other; navbar and footer inspected do not directly link these tools. Verify homepage/FAQ contextual links and add durable high-visibility navigation where useful. |
| SEO sitemap | DONE (code) | `app/sitemap.ts` uses canonical SEO page registry and topical drill paths. Verify generated sitemap on public host and canonical host consistency. |
| Google sign-in UI | DONE (code) / UNVERIFIED (provider) | Google OAuth button calls Supabase OAuth; actual provider enablement, redirect allowlist and clean account journey not tested. |
| Email/password sign-in | PARTIAL | Server actions and form exist; profile approval gate and Supabase auth settings need a real test account journey. |
| Phone OTP sign-in | MISSING | Signup includes optional phone field, but current login UI inspected is email/password plus Google OAuth; no phone OTP flow verified. |
| Signup friction | PARTIAL | Google button is present; email/password fields remain. Phone is optional metadata, not phone authentication. |
| Pricing and payment | PARTIAL / UNVERIFIED | `/pricing` exists; no payment provider, price, checkout or refund model is approved by `TODO.md`. Do not charge until entitlements, policy and payment operations are approved. |
| Exam-specific isolation | PARTIAL | Exam IDs/Prep Space architecture exists in docs and configuration, but `question_attempts` and core question schema have historically global shapes. Prove question ownership, progress scoping and entitlement enforcement before multi-exam paid access. |
| Bilingual / Urdu explanations | MISSING (verified workflow) | No reviewable bilingual explanation pipeline or reviewed Urdu content workflow found in inspected source. Do not bulk publish unreviewed AI translations. |
| Short notes | PARTIAL | Notes pages and knowledge-base notes exist; source/reviewer coverage, rights and goal-scoped access need audit. |
| About/editorial standards/corrections | MISSING | No complete verified editorial standards and corrections workflow confirmed in public nav/footer. |
| Analytics instrumentation | PARTIAL | Telemetry module exists; no verified funnel metrics or Search Console baseline supplied. |
| Public launch access | UNVERIFIED | Vercel reports production READY and preview-only SSO. Anonymous clean-browser accessibility and registration eligibility need live test. |
| Domain / canonical | PARTIAL | `lib/site.ts` fallback uses `https://edweb-nine.vercel.app`; Vercel lists that alias. No custom domain is attached. Brand/domain purchase remains deferred. |

## Critical release blockers

### P0 — fix before staged public invitation

1. **Secure `/api/questions`.** Remove caller control over arbitrary status, require explicit authorization for non-public records, return only safe fields and never include `correct_answer` in a public initial payload. Add tests for anonymous, authenticated and admin cases.
2. **Remove fabricated community floor.** `COMMUNITY_BASELINE = 900` is not a measured account count. Replace with real verified counts or suppress the statistic. Audit every homepage, FAQ, metadata and structured-data claim.
3. **Resolve question source of truth.** Decide whether bundled content is delivered directly or ingested into Supabase; make every practice route use a reliable, exam-scoped canonical identity. Verify content rows before claiming answer persistence.
4. **Prove answer persistence.** Seed only reviewed/rights-clear content through a reviewed non-production-to-production process; test online answer, duplicate submission, offline queue/drain, reload, bookmark, mistake capture and analytics. Production data changes require a separate approved task.
5. **Enforce exam separation.** Stable exam/variant ownership must follow each question, attempt, bookmark, flashcard, note and entitlement. Cross-exam negative tests are required.
6. **Public access smoke.** Confirm production alias opens in a logged-out clean browser, with no SSO wall, broken redirects or hydration/loading failure. Check 360px, 390px, 768px and desktop.
7. **Content-rights gate.** Audit OCR and legacy imports. Quarantine unclear commercial-source material. Only original reviewed content or properly licensed/public official papers can be published.

### P1 — staged beta experience

8. Make the first anonymous question useful: no signup wall before sample, immediate feedback, clear explanation, next question, clear route to continue.
9. Surface actual differentiators: released board/year papers, key availability, source type and BUMHS material only where the actual paper/content is present and verified.
10. Add student-facing repeated-question markers only from defensible paper mappings; never infer frequency from duplicate-looking text alone.
11. Build concise, syllabus-mapped short notes and reviewed Urdu explanations. Start with a small high-value subset and human review, not mass AI translation.
12. Link the public merit calculator and syllabus pages from relevant public navigation/landing sections; they should not be orphaned.
13. Add transparent About/editorial/corrections/contact information and clear Beta/Available labels.
14. Test Google OAuth configuration; keep email fallback. Evaluate phone OTP only after demand, provider cost, rate limits and support burden are known.
15. Define staged access states: public discovery, public sample, registration cohort/approval policy, free beta allowance, premium-ready but not charged. Make future exam-scoped entitlements explicit without activating payment.

## Competitor review — evidence quality

This audit distinguishes vendor marketing from tested product behaviour.

- **Maqsad:** Public pages show a free diagnostic with subject/topic structure and a visible question flow; its own pages advertise 15,000+ MCQs, live classes, weekly mocks, recorded lectures and counselling. These are vendor claims, not independently verified counts/outcomes. Its public diagnostic is a useful benchmark for an immediate no-cost first action. Source: https://maqsad.io/mdcat and https://maqsad.io/app/mdcat/diagnostic-test
- **MDCAT Mentor:** Prior founder review inspected its public homepage only. Video lectures, quizzes, mock tests and discussion are advertised; no signed-in flow or question-quality comparison was completed.
- **ePrepare, TestPrep Smart and MDCAT.pk:** Previously collected claims are secondary/marketing material and not independently validated in this audit. Treat MCQ totals, Urdu explanations, flashcards, AI features, price and analytics claims as unverified until their public demo/product flows are observed.
- **Student-style comparative testing:** Not completed. No competitor accounts were created and no private tiers/paywalls were bypassed. Required next test is a manually observed free-tier journey: registration friction (where account is required), time to first question, 20-question explanation sample, one available mock, mobile usability and clear price/access boundary. Record date, plan, device, timings and screenshots. Do not record personal data or copy proprietary question text.

## Six founder additions — decision and tasks

1. **Test as a student:** PARTIAL. Public Maqsad diagnostic was inspected; full competitor free-tier task test remains unverified. Create a repeatable scorecard and complete permitted public/free flows.
2. **Surface existing advantages:** PARTIAL. Past-paper registry, paper kinds, key status, BUMHS entries and no-signup public surfaces exist in source. Repeated-question stars and live discoverability are unverified. Validate and surface only confirmed capabilities.
3. **Urdu explanations:** MISSING as a reviewed workflow. Build a human-review queue, bilingual fields, reviewer identity/date and publish gate; pilot a small set.
4. **Phone or Google sign-in:** PARTIAL. Google OAuth UI exists; provider configuration unverified. Phone is only an optional profile field; phone OTP is missing. Test OAuth and research phone OTP cost/abuse controls before implementation.
5. **Balochistan angle:** PARTIAL. BUMHS papers and 2025 reference files exist. Add official-source-backed admissions/quota/domicile pages only after reviewing current BUMHS/official prospectus rules and effective year. Do not infer individual eligibility.
6. **Revenue model:** UNVERIFIED / not approved. No payment provider, price, tax, refund or checkout is approved. Use staged beta to measure genuine retention and demand first; design free sample vs premium value, then ask founder approval before payment implementation.

**Textbook rule:** Never OCR or republish commercial textbook text for “bookline MCQs”. Map original questions to syllabus topics and cite rights-clear official sources. OCR does not confer rights.

## Revenue and measurement plan (no price decision made)

Measure the funnel before monetizing: anonymous landing sessions → sample starts → sample completions → registrations → first saved attempt → 7-day return → mock completion → upgrade interest → paid conversion (only after approval) → renewal/refund. Separate traffic, account counts, active learners and attempts. Do not fabricate or floor any metric. Use small staged cohorts to learn which premium value students actually use; do not equate signups with willingness to pay.

## Next execution sequence

1. Fix and test the public questions API security defect and misleading community count.
2. Resolve canonical bank delivery and prove one MDCAT sample-to-attempt journey with durable persistence.
3. Complete MDCAT/NUMS exam-scoped question and progress boundaries; add negative isolation tests.
4. Verify BUMHS/past-paper inventory, key status, repeated mapping and rights.
5. Improve first-question experience, explanations and reviewed short notes/Urdu pilot.
6. Validate OAuth and public signup cohort policy.
7. Complete live mobile/browser QA and publish honest beta/readiness states.
8. Only then activate broader SEO outreach and obtain explicit payment/entitlement approval.

**No production DB changes, domain changes, billing changes, deployment-protection changes or payment processing were made during this audit.**


## Additional P0 claim conflict found during board verification

- `components/landing/Footer.tsx` describes MED Prep as a **“non-profit community initiative”** while the founder has now selected a staged launch with a future premium revenue model. Unless the organization is legally/operationally non-profit and paid access is not for profit, this wording is materially misleading. Founder must confirm the actual legal/business status; remove or qualify the non-profit claim before monetization messaging. Do not imply charity/non-profit status as a marketing tactic.

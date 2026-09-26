# 08 — FEATURE INVENTORY (everything the cadet site ships)

Complete feature list so the MED AI can see the full surface area and choose
what to integrate. Status column verified against the MED repo on 2026-09-22:
✅ = MED already has an equivalent · ⬆ = MED has a version worth upgrading with
the cadet implementation · ➕ = missing, build it.

## Public / growth surfaces

| Feature | Cadet implementation | MED |
|---|---|---|
| Landing with live stats + ISR 60s | `app/page.tsx` + `lib/public-stats.ts` | ⬆ same skeleton exists |
| Hero with live stat tiles + theme wheel | `Hero.tsx` + `ThemeWheel.tsx` | ✅ (wheel exists) |
| Interactive MCQ demo on landing | `MCQDemoSection.tsx` (lazy) | ➕ highest-value addition |
| Social proof bar / trust strip | `SocialProofBar`, `TrustStrip` | ✅ |
| Community streak wall (real activity heatmap, hidden if DB down) | `CommunityStreakWall.tsx` | ✅ |
| Exam countdown band | `EntryTestCountdown.tsx` | ➕ target MDCAT dates |
| Leaderboard hub (all-time / duels / races tabs) | `LeaderboardHub.tsx` | ⬆ has LeaderboardPreview |
| College carousel → per-college pages | `CollegeCarousel` + `/colleges/[slug]` | ⬆ → per-registry pages |
| FAQ page + FAQPage schema | `/faq` | ✅ add schema if missing |
| Founder page | `/founder` | ✅ |
| Blog (pillar + cluster, internal-link graph) | `lib/blog-posts.ts` with sibling maps | ⬆ one post exists — build the cluster |
| Registration-deadlines page | `/registration-deadlines-2027` | ➕ the dates page (file 07) |
| WhatsApp community funnel | group banner + deep links (`lib/site.ts`) | ✅ |
| Referral system (codes, leaderboard, auto-approve at 5) | `lib/referral.ts`, `20260818000000_referral_system.sql` | ✅ |

## Student app (dashboard)

| Feature | Cadet implementation | MED |
|---|---|---|
| Diagnostic test → level placement | `/diagnostic` | ✅ |
| Practice sessions by subject/topic/college, timed | `/practice`, `PracticeSession.tsx` | ✅ |
| Full mock tests with exam pacing | `/dashboard/mock-test` | ✅ |
| Daily quiz (new set daily, streaks) | `/daily-quiz` + cron | ✅ |
| Duels (1v1 head-to-head) | `lib/duels-*`, `/duels` | ✅ |
| Races (7-day win boards) | `lib/races-*` | ✅ |
| Flashcards with FSRS-lite SRS | `lib/flashcards.ts` + server | ✅ (has tests) |
| Formula deck as cards | `lib/formula-deck.ts` | ➕ MDCAT formulas |
| Master notes library (gated) | `/dashboard/notes/*` + gate | ⬆ has mcat notes — add the gate |
| Student note uploads → admin review queue | `notes` table + `AdminNotesManager` | ✅ |
| Interview prep content | `lib/interview-prep.ts` | ➕ MDCAT guidance equivalent |
| Offline practice (IndexedDB bank + sync-back) | `lib/offline*`, `sw` route, harness | ✅ |
| Certificate of completion (print sheet) | `/dashboard/certificate` + print CSS | ➕ cheap delight, ship it |
| Parent transparency tile | `ParentTransparencyTile.tsx` | ➕ parents are the payers — trust wins |
| Push notifications + WhatsApp digest | `lib/push.ts`, web-push, Resend | ✅ |
| Analytics for the student (time spent, trends, weakness) | `lib/analytics/*` | ✅ |

## Admin panel

| Feature | Cadet implementation | MED |
|---|---|---|
| Dashboard: platform pulse, student pipeline, bank coverage | `app/admin/page.tsx` | ✅ |
| Student table: approve/reject/suspend/remove | `StudentTable.tsx` | ✅ |
| Traffic analytics: views/clicks/signups KPIs + charts | `app/admin/analytics` (file 04) | ⬆ page exists — wire clicks |
| Question manager: filters, publish/hide, AI drafts queue | `app/admin/questions` | ✅ |
| Notes review queue | `app/admin/notes` | ✅ |
| Feedback inbox | `app/admin/feedback` + floating widget | ✅ |
| Push composer | `app/admin/push` | ✅ |
| Referral leaderboard ("who brought whom") | admin home section | ✅ |
| Honesty rule everywhere: `—` on failed queries, never guessed zeros | `lib/admin-overview.ts` | ✅ keep |

## Infrastructure

| Feature | Cadet implementation | MED |
|---|---|---|
| Auth: email + Google OAuth, PKCE, admin gate by email list | `lib/auth.ts`, middleware | ✅ |
| Account states: pending / rejected / suspended / deleted | dedicated pages | ✅ |
| Telemetry (file 04) | full stack | ⬆ |
| SEO stack (file 05): canonical helper, one-page-list, IndexNow cron, llms.txt, JSON-LD | full stack | ➕ the big one |
| Question keys (uuid v5) + rebalance scripts | `scripts/` | ⬆ has key tooling |
| PWA manifest + icons + service worker | `app/manifest.ts`, `app/sw/route.ts` | ✅ |
| Crons: maintenance, daily quiz, demo activity, IndexNow | `vercel.json` | ⬆ add IndexNow |
| Error/404/loading UX pages | `error.tsx` etc. | ✅ |
| AntiCopy (content protection) | `AntiCopy.tsx` | ✅ |

## Build order for MED (recommended)

1. **SEO stack** (file 05) — pure upside, no design risk, compounds daily.
2. **Analytics wiring** (file 04) — you can't grow what you can't see.
3. **Dates page + per-registry pages** (file 07) — the ranking pages.
4. **MCQ demo + toolkit grid on landing** (file 07 §3) — conversion.
5. **Notes gate + certificate + parent tile** — retention/trust polish.

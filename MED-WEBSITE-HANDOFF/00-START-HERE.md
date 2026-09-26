# CADET-SITE HANDOFF → MED WEBSITE — READ THIS FIRST

**To the AI working on the MED website (MDCAT prep):** this folder is a complete,
copy-paste design + feature + SEO handoff from our sister platform **Cadet Prep**
(cadet-college entry-test prep, live on Vercel). Both projects share the same
Next.js 16 + React 19 + Tailwind v4 + Supabase lineage, so almost everything here
drops in with minimal edits.

**Your job:** read every file in this folder top to bottom, then integrate the
design, features, analytics and SEO layers into the MED website. Copy code
verbatim where told, rebrand copy where told, and **never port cadet-college
questions or notes** — the MED site keeps its own MDCAT content.

---

## What is in this folder

| File | What it gives you |
|---|---|
| `00-START-HERE.md` | This file — rules, order, integration map |
| `01-DESIGN-SYSTEM.md` | Full design tokens, glass surfaces, motion rules, and the **4-theme colour wheel engine** (complete code) |
| `02-LANDING-AND-NAV.md` | The landing page composition, Hero, Navbar, and every landing effect (aurora, grain, sweep, magnetic CTAs) |
| `03-UI-KIT.md` | Button, Badge, Reveal/Stagger/ScaleIn/Float motion, Magnetic hover, TrackedLink, compass logo |
| `04-CLICKS-AND-ANALYTICS.md` | The whole privacy-first click/view analytics stack: telemetry lib → API → DB table → admin dashboard with charts |
| `05-SEO-PLAYBOOK.md` | Every SEO/AEO lesson: canonical honesty, IndexNow auto-pings, llms.txt for AI search, JSON-LD schemas, sitemap source-of-truth, content plan |
| `06-CONTENT-AUTHORING.md` | How to write MCQs, notes and flashcards in this platform's format (question model, deterministic keys, FSRS-lite scheduler, notes renderer) |
| `07-COMPETITOR-PLAYBOOK.md` | Feature intel from sirmunironlineacademy.com + shaheenacademy.com and how to beat both |
| `08-FEATURE-INVENTORY.md` | Every feature the cadet site ships, with build-order recommendation for the MED site |
| `09-INTEGRATION-CHECKLIST.md` | The step-by-step integration order with verification steps |

## The five standing rules (from the founder — non-negotiable)

1. **Honesty in numbers.** Never show a count that isn't backed by a real query.
   A fabricated "10,000+ students" or a zero placeholder is worse than no number.
   Failed queries render `—`, not a guessed zero.
2. **Never advertise "past papers" as an offering.** Real past papers are not
   legal to hold or share. Product copy says **"exam-style"** or **"modelled on
   real entry tests"** — never "past paper(s)". (The MED site already owns a
   lawful past-paper bank from public papers; if you surface it, describe it
   precisely — e.g. "publicly released papers" — and never imply leaked or
   unpublished material.)
3. **One WebGL engine max, motion is earned.** Students are on budget Androids.
   Every animation must die under `prefers-reduced-motion`, and nothing may
   block first paint.
4. **Contrast is measured, not vibes.** Every text token ships with its contrast
   ratio in a comment; nothing below 4.5:1 ships as body copy.
5. **Canonical honesty.** Every canonical tag must point at a URL that actually
   serves. A dead domain in canonicals got the cadet site **zero** indexed pages
   for months — see `05-SEO-PLAYBOOK.md` before touching metadata.

## Integration order (short version — details in 09)

1. Design tokens + theme engine (`01`) — the palette everything else reads.
2. UI kit (`03`) — Button/Badge/Motion/TrackedLink.
3. Landing upgrades (`02`) — as time allows; the MED landing already shares the skeleton.
4. Analytics stack (`04`) — telemetry table + API + admin dashboard.
5. SEO stack (`05`) — llms.txt, IndexNow cron, seo-pages list, JSON-LD.
6. Content systems (`06`) + competitor features (`07`) — question keying, notes renderer, flashcards.

After each step: `npx tsc --noEmit` and `npm run build` must pass, and the page
must still render at 360px width (the real audience is on small phones).

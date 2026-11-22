# Route inventory and indexability (2026-11-22)

Phase 0 deliverable: one place that says what every route is, whether search engines may index it, and
which crawl bugs are known. It is generated from the running site, not typed by hand — re-run:

```bash
node scripts/audit-routes.mjs http://localhost:3111
```

The audit fetches every URL in `/sitemap.xml`, checks status, canonical, `robots` meta, duplicate
titles and missing descriptions, then checks the private list for `noindex`. A pass is
**0 problems**.

## Current result

| Check | Result |
|---|---|
| Sitemap URLs submitted | **94** (75 static/hub + 19 whole-paper set pages) |
| Sitemap URLs returning 200 | 94 |
| Self-canonical | 94 (0 pointing at the site root) |
| Duplicate titles | 0 |
| Missing meta description | 0 |
| Private routes with `noindex, nofollow` | 13 of 13 |

`app/robots.ts` blocks `/admin`, `/dashboard`, `/api/`, `/login`, `/signup`, `/pending`, `/rejected`,
`/suspended`, `/forgot-password`, `/reset-password`, `/account-deleted`. Every one of those now also
ships a matching `noindex` meta tag; before this pass, ten of them shipped `index, follow` while being
disallowed in robots.txt — a contradiction crawlers report.

## Route classes

**Indexable, in the sitemap** (from `lib/seo-pages.ts`, the single list the sitemap and IndexNow share):
home, `/diagnostic`, `/resources`, `/daily-quiz`, `/faq`, `/flashcards`, `/topicals`, `/notes` and its
five subject pages, `/past-papers` and its 10 board pages, `/blog`, `/blog/mdcat-guide`, `/privacy`,
`/copyright`, plus every chapter drill and whole-paper set under `/topicals/<subject>/<chapter>`.

**Indexable, public, but NOT in the sitemap** (deliberate omissions to confirm or add):
`/exams`, `/pricing`, `/nust/practice`, `/usat/practice`, `/pma/practice`. They return 200 and are not
noindex, so they can be indexed if linked; they are simply not submitted. Adding `/exams` and
`/pricing` is the obvious next step once their metadata is reviewed.

**Noindex, blocked from crawling**: `/login`, `/signup`, `/pending`, `/rejected`, `/suspended`,
`/forgot-password`, `/reset-password`, `/account-deleted`, `/practice/session`, `/offline-practice`.

**Noindex, session-scoped app**: `/dashboard` and all its children (layout-level noindex),
`/admin` and all its children (layout-level noindex).

## Crawl bugs found and fixed in this pass

1. **Three sitemap URLs were 404s.** `/topicals/biology`, `/topicals/chemistry`, `/topicals/physics`
   were submitted but no `app/topicals/[subject]/page.tsx` route exists — only the hub and the
   `/topicals/<subject>/<chapter>` drills. Each returned a 404 shell that itself carried noindex: the
   exact submitted-versus-noindex contradiction `lib/seo-pages.ts` documents as forbidden. Removed.
2. **Nineteen real pages were never submitted.** Whole-paper set pages (`past-paper-<year>`,
   `mixed-bank`) are prerendered and content-full but were excluded from `topicalDrillPaths()`.
   Added.
3. **Five canonical tags pointed at the homepage.** `/diagnostic`, `/privacy`, `/copyright` (and the
   error paths of `/past-papers/[board]`) had no explicit canonical, so Next fell back to the root —
   telling search engines they were duplicates of the homepage. Each now declares its own.
4. **One board page was unreachable at its own URL.** `SZABMU MDCAT (reconducted)` slugged to
   `szabmu-mdcat-reconducted-` (trailing separator, never stripped), while the sitemap submitted
   `szabmu-mdcat-reconducted`. Slugs are now normalised on both sides of the contract.
5. **Ten private routes were crawlable in practice.** robots.txt only stops a polite crawler from
   *fetching*; a page that is disallowed but linked can still be indexed from the link text. All now
   ship `noindex, nofollow` as well.
6. **`/copyright` had no meta description.**

## Known bugs still open (not fixed here)

- `/nust/practice`, `/usat/practice`, `/pma/practice` are public client components that import the
  full question banks, so answer keys and explanations are shipped to the browser. Fine for public
  practice, incompatible with exam-scoped paid access (tracked in `NEXT-WAVE-BUILD-QUEUE.md`).
- `/topicals/biology/mixed-bank` serves 3,716 questions and is ~1.7 MB of HTML. The drill renders one
  question at a time, so paginating the payload is a contained follow-up.
- Sitemap `lastModified` is `new Date()` for every URL on every build, which tells crawlers all 94
  pages changed at once. Should derive from real content dates before any indexing push.
- Three brand names are still live (MED Prep / Apex Pakistan / MED) — founder decision (A3).
- Domain and canonical host: the sitemap uses `https://edweb-nine.vercel.app` until A4 is decided.

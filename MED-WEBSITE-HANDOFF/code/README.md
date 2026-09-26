# code/ — complete source files, ready to copy

Every file here is a real, production-tested file from the cadet site (not an
excerpt). Copy each into the matching path on the MED website, then adjust the
few marked lines (storage keys, site name, namespace).

```
code/
  components/            React components
    ThemeProvider.tsx      ← theme engine (rename storage key cadet-prep-theme → med-prep-theme)
    ThemeSwitcher.tsx      ← nav dots picker (drop-in)
    ThemeWheel.tsx         ← hero colour wheel (drop-in)
    TrackedLink.tsx        ← click-tracking Link (drop-in)
    Telemetry.tsx          ← view/error bootstrap (mount in app/layout.tsx)
    Button.tsx             ← UI kit button (drop-in)
    Badge.tsx              ← UI kit chip (drop-in)
    Motion.tsx             ← Reveal/Stagger/ScaleIn/Float (drop-in)
    Magnetic.tsx           ← magnetic CTA hover (drop-in)
    CompassLogo.tsx        ← brand mark (rebrand or keep)
    Navbar.tsx             ← full landing navbar behavior (rebrand copy)
    Hero.tsx               ← hero composition (rebrand copy)
    admin/charts.tsx       ← dependency-free LineAreaChart/BarList/DeltaChip/Panel
  lib/
    telemetry.ts           ← client tracking helpers (rename opt-out key)
    admin-analytics.ts     ← 30-day aggregation for the analytics page
    seo-pages.ts           ← THE one list of public pages (edit paths for MED)
    site.ts                ← canonical-URL helper + WhatsApp/tel links (edit fallback URL)
    flashcards.ts          ← FSRS-lite scheduler, client-safe (drop-in)
    master-notes-access.ts ← the 3-way notes gate (drop-in; needs profiles/leaderboard tables)
    content-catalog.ts     ← llms.txt editorial catalog pattern (rewrite entries for MED)
  api/
    telemetry/route.ts     ← POST /api/telemetry (drop-in)
    indexnow/route.ts      ← IndexNow pinger (drop-in; key auto-derives)
    sitemap.ts             ← sitemap from seo-pages (drop-in)
    robots.ts              ← robots with AI-crawler layer (drop-in)
  supabase/
    20260903000000_client_telemetry.sql  ← the telemetry table migration
  scripts/
    add-question-keys.mjs  ← deterministic uuid v5 keys (change namespace to med-prep)
```

**Path mapping when copying:** `@/lib/...` and `@/components/...` imports work
as-is on the MED site (same alias). Files that import `@/lib/supabase/server`
or `/service` expect the same Supabase helpers the MED site already has —
verify those two files exist there (`lib/supabase/server.ts`, `lib/supabase/service.ts`).
`Hero.tsx` and `Navbar.tsx` reference sibling landing components (Badge, Motion,
TrackedLink, ThemeWheel, HeroParticleField, FluidCursor, ScrollEffects, …) — the
MED repo already ships most of these; adapt imports for any it lacks.

**Also useful but not copied (too content-specific, documented instead):**
`Hero.tsx` / `Navbar.tsx` (composition + behavior spec in file 02), `app/page.tsx`
(landing composition in file 02 §1), `app/layout.tsx` (metadata in file 05 §7,
FOUC script in 01 §4b), `app/llms.txt/route.ts` + `lib/llms-render.ts` (pattern
in file 05 §5), `app/globals.css` (tokens + effects in file 01 §2–3, theme
blocks in §4e), `app/admin/analytics/page.tsx` (spec in file 04 §5), and the
notes pages (renderer contract in file 06 §4).

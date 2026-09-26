# 05 — SEO / AEO PLAYBOOK (every lesson that got the cadet site indexed)

The cadet site spent months at **zero indexed pages** because of one bug: every
canonical tag pointed at `cadetcollegeprep.com` — a domain that was never
registered. Google saw a site declaring itself a duplicate of a nonexistent
page and indexed nothing. Everything below exists because of that lesson.
**The MED site is on vercel.app with no custom domain — read §1 first; it is
literally about you.**

## 1. Canonical honesty + the domain-agnostic URL helper (copy verbatim)

```ts
// lib/site.ts
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/+$/, '')
  // Vercel injects the stable production domain automatically — this is the
  // honest host while there is no custom domain. When MED registers one, set
  // NEXT_PUBLIC_SITE_URL in Vercel env and every canonical/sitemap/JSON-LD
  // flips to it with zero code changes.
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (production) return `https://${production.replace(/\/+$/, '')}`
  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) return `https://${vercelUrl.replace(/\/+$/, '')}`
  return 'https://med-website.vercel.app' // ← replace with the real vercel.app host
}
export const SITE_NAME = 'MED Prep'
export const SITE_DESCRIPTION = '…' // real sentence describing the real offering
export function getWhatsAppNumber(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '92XXXXXXXXXX').replace(/[^0-9]/g, '')
}
export function getWhatsAppLink(message?: string): string {
  const base = `https://wa.me/${getWhatsAppNumber()}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
export function getTelLink(): string { return `tel:+${getWhatsAppNumber()}` }
```

Rules: never hardcode a domain you don't own in metadata; metadataBase uses
`getSiteUrl()`; the meta description must never drift from reality (no counts
in static metas — a static meta can't run a live query).

## 2. One list of public pages — sitemap AND pings derive from it

```ts
// lib/seo-pages.ts — the ONE list. app/sitemap.ts and the IndexNow route both
// import it, so a new page is sitemapped AND pinged with no second place to
// forget. Must stay DB-free (importable from route handlers/build steps).
export type SeoPage = { path: string; priority: number;
  changeFrequency: "always"|"hourly"|"daily"|"weekly"|"monthly"|"yearly"|"never" };
export const SEO_PAGES: SeoPage[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/diagnostic", priority: 0.9, changeFrequency: "weekly" },
  { path: "/resources", priority: 0.9, changeFrequency: "daily" },
  { path: "/blog", priority: 0.9, changeFrequency: "daily" },
  { path: "/blog/mdcat-guide", priority: 0.8, changeFrequency: "weekly" },
  { path: "/privacy", priority: 0.5, changeFrequency: "yearly" },
  // … every public content page
];
export function seoPageUrls(siteUrl: string): string[] {
  return SEO_PAGES.map((p) => `${siteUrl}${p.path}`);
}
```

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';
import { SEO_PAGES } from '@/lib/seo-pages';
export default function sitemap(): MetadataRoute.Sitemap {
  const url = getSiteUrl();
  return SEO_PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${url}${path}`, lastModified: new Date(), changeFrequency, priority,
  }));
}
```

**Sitemap rule:** indexable pages ONLY. Utility pages that ship `noindex` meta
(login, signup, pending, offline-practice) must stay OUT — a sitemap entry on a
noindex page is a submitted-vs-noindex contradiction that GSC reports as an error.

## 3. robots.txt with the AI-crawler layer

```ts
// app/robots.ts
import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: [
      { userAgent: '*', allow: '/',
        disallow: ['/admin', '/dashboard', '/api/', '/login', '/signup', '/pending',
                   '/rejected', '/suspended', '/forgot-password', '/reset-password', '/account-deleted'] },
      // Explicitly allow AI search crawlers — this is the AEO wedge. Classic
      // competitors predate this layer entirely.
      { userAgent: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended'], allow: '/' },
      // Block training-only crawlers (not search bots).
      { userAgent: ['CCBot', 'Bytespider'], disallow: '/' },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
```

## 4. IndexNow auto-ping (Bing/Yandex/Seznam in hours, not weeks)

Bing discovers by submission, not crawling. This endpoint pings every public
page; wire it as a daily Vercel cron so new pages land without anyone
remembering. Complete source: `app/api/seo/indexnow/route.ts` in the cadet repo.

Key spec points learned in production:
- The key must be served at `/<KEY>.txt` in `public/` (the spec default) — the
  verifier only reliably honours the default location; announcing a custom
  `keyLocation` while the static file sat unused caused every ping to 422.
- Key material: `INDEXNOW_KEY` env override, else a deterministic fallback —
  `sha256("indexnow:" + siteUrl).slice(0,32)` — so redeploys keep the same key
  (engines remember it).
- `GET ?key=<key>` returns the key (ownership proof); authorized GET/POST pings
  all pages (`Authorization: Bearer CRON_SECRET`, mirroring other cron routes).
- Bound the outbound fetch (`AbortSignal.timeout(20_000)`) and fail soft — a
  slow engine must never 500 into the cron log.

```json
// vercel.json (merge with existing crons)
{ "crons": [ { "path": "/api/seo/indexnow", "schedule": "30 4 * * *" } ] }
```

## 5. llms.txt + llms-full.txt — the AI-search catalog

The cadet site serves generated `/llms.txt` (short catalog: what the site
offers, answer-ready extracts, contact) and `/llms-full.txt` (every page with
title + one-line blurb) from `app/llms.txt/route.ts` and
`app/llms-full.txt/route.ts`, rendered from **one editorial catalog**:
`lib/content-catalog.ts`. Adding a page to the catalog = it appears in the AI
surface automatically; the catalogs cannot drift because they are generated.

Structure of an entry: `{ path, title, blurb, key?: boolean }` — `key: true`
puts it in the short file. Keep blurbs to one honest sentence. This is the
single highest-leverage AEO move: none of the classic academies ship llms.txt.

## 6. JSON-LD schema set (copy + rebrand)

In `app/layout.tsx`:

```ts
const jsonLd = {
  "@context": "https://schema.org", "@type": "EducationalOrganization",
  name: "MED Prep", description: SITE_DESCRIPTION, url: siteUrl,
  telephone: whatsapp, areaServed: "PK",
  address: { "@type": "PostalAddress", addressLocality: "Quetta", addressRegion: "Balochistan", addressCountry: "PK" },
  contactPoint: { "@type": "ContactPoint", contactType: "customer support",
    telephone: whatsapp, availableLanguage: ["en", "ur"] },
  // sameAs = entity identity glue → Knowledge Graph + AI-citation entity
  // signals. HONESTY RULE: only real, run-by-us profiles go in here.
  sameAs: [`https://wa.me/${whatsapp}`],
};
const websiteJsonLd = { "@context": "https://schema.org", "@type": "WebSite",
  name: "MED Prep", url: siteUrl, inLanguage: ["en", "ur"] };
```

On the homepage add `FAQPage` (from the FAQ array, `mainEntity` → Question →
acceptedAnswer) and `LearningResource` (`learningResourceType: ["MCQ
Practice","Mock Test","Study Notes"]`, `isAccessibleForFree: true`,
`educationalRole: "student"`). FAQ page gets its own FAQPage schema. Blog
posts: `Article`/`BlogPosting` with dates. All injected via
`<script type="application/ld+json" dangerouslySetInnerHTML={...} />`.

## 7. Metadata template (app/layout.tsx)

```ts
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "MDCAT Preparation — Free MCQ Practice, Notes & Mock Tests",
           template: "%s | MED Prep" },
  description: SITE_DESCRIPTION,
  keywords: [/* long-tail, real terms only */],
  openGraph: { type: "website", url: siteUrl, siteName: "MED Prep",
    title: "…", description: SITE_DESCRIPTION, locale: "en_PK",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "MED Prep" }] },
  twitter: { card: "summary_large_image", images: [`${siteUrl}/og.png`] },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/icon-192.png", sizes: "192x192" }],
           apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }] },
  appleWebApp: { capable: true, title: "MED Prep", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = { themeColor: "#090F1B", colorScheme: "dark" };
```

## 8. Content engine (what actually ranks)

- **Pillar + cluster**: one pillar page per head term, spokes link UP to it.
  Cadet pillar: `/guides/cadet-college-preparation`. MED pillar: a
  `/guides/mdcat-preparation` hub.
- **One college/target page each** — each institution is its own search term
  ("[college] entry test preparation"). MED equivalent: one page per medical
  college/registry (UHS, KMU, SZABMU, DUHS, BUMHS…).
- **Answer blocks**: every guide opens with a 40–60 word direct answer to the
  query, then depth. This is what AI engines quote.
- **Comparison posts** are LLM-citation magnets ("UHS vs KMU MDCAT", "MDCAT vs
  NUMS").
- **Per-college date pages** (competitor Shaheen's strongest asset — a list of
  every college's expected test dates). Refresh it yearly; it earns links.
- Every new page: add to `SEO_PAGES`, add a content-catalog entry, ping
  IndexNow, request indexing in GSC.

## 9. Founder dashboard actions (once, ~1 hour)

1. Google Search Console: verify the vercel.app host → submit sitemap → URL
   Inspection → Request Indexing on the homepage and top pages.
2. Bing Webmaster Tools: verify (import from GSC) → submit sitemap → after
   setting `INDEXNOW_KEY`, confirm `GET /api/seo/indexnow?key=<key>` returns
   the key and crons are pinging daily.
3. Register a domain eventually — but only attach it when ready; the
   vercel.app host with honest canonicals beats a dead custom domain by
   infinity. Set `NEXT_PUBLIC_SITE_URL` at attach time; everything flips.

## 10. Honest expectations

Bing: visible in 1–2 weeks of Webmaster setup + daily pings. Google: meaningful
impressions in 4–8 weeks, long-tail in 2–3 months. The strategic wedge: every
competitor in this niche predates the AI-answer era — no llms.txt, sparse
FAQ schema, copy that isn't answer-blocked. Own the AI-citation layer while
they hold the classic SERPs.

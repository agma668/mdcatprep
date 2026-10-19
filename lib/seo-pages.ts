/**
 * Every public, crawlable URL on the site — the ONE list.
 *
 * Consumers: app/sitemap.ts (what search engines should index) and
 * app/api/seo/indexnow/route.ts (what to ping on publishing). Keeping them
 * on one list means a new page appears in the sitemap AND gets pinged to
 * Bing/IndexNow the moment it ships, with no second place to forget.
 *
 * This file must stay build-safe — it is imported from route handlers and the
 * build step, so no DB imports here. The topical drill URLs derive from
 * lib/topicals.ts (the same in-memory seam the drill pages prerender from),
 * so the list can never disagree with the pages that actually exist.
 *
 * Sitemap rule (from the cadet handoff, file 05 §2): indexable pages ONLY.
 * Utility pages that ship noindex meta (login, signup, pending, dashboard
 * surfaces) must stay OUT — a sitemap entry on a noindex page is a
 * submitted-vs-noindex contradiction that GSC reports as an error.
 * robots.ts blocks the app surfaces; this list holds public content only.
 */

import { TOPICALS_SUBJECTS } from "./topicals";

export type SeoPage = {
  /** Path with leading slash, '' for the homepage. */
  path: string;
  /** Sitemap priority (0–1). Also orders IndexNow batches. */
  priority: number;
  /** Engines accept: always hourly daily weekly monthly yearly never */
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
};

export const SEO_PAGES: SeoPage[] = [
  // Core conversion pages
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/diagnostic", priority: 0.9, changeFrequency: "weekly" },
  { path: "/resources", priority: 0.9, changeFrequency: "daily" },
  { path: "/daily-quiz", priority: 0.7, changeFrequency: "daily" },
  { path: "/faq", priority: 0.8, changeFrequency: "monthly" },

  // Practice surfaces — the honest numbers live on the pages themselves
  { path: "/flashcards", priority: 0.8, changeFrequency: "weekly" },
  { path: "/topicals", priority: 0.9, changeFrequency: "daily" },
  { path: "/topicals/biology", priority: 0.8, changeFrequency: "weekly" },
  { path: "/topicals/chemistry", priority: 0.8, changeFrequency: "weekly" },
  { path: "/topicals/physics", priority: 0.8, changeFrequency: "weekly" },

  // Notes hub + per-subject pages (public master-notes library)
  { path: "/notes", priority: 0.9, changeFrequency: "daily" },
  { path: "/notes/biology", priority: 0.8, changeFrequency: "weekly" },
  { path: "/notes/chemistry", priority: 0.8, changeFrequency: "weekly" },
  { path: "/notes/physics", priority: 0.8, changeFrequency: "weekly" },
  { path: "/notes/english", priority: 0.8, changeFrequency: "weekly" },

  // Past papers by board — one page per examining body. Slugs follow the
  // generateStaticParams contract in app/past-papers/[board]/page.tsx:
  // the registry's exam key lowercased and non-alphanumerics collapsed to '-'.
  { path: "/past-papers", priority: 0.8, changeFrequency: "weekly" },
  { path: "/past-papers/uhs-mdcat", priority: 0.7, changeFrequency: "monthly" },
  { path: "/past-papers/bumhs-mdcat", priority: 0.7, changeFrequency: "monthly" },
  { path: "/past-papers/kmu-mdcat", priority: 0.7, changeFrequency: "monthly" },
  { path: "/past-papers/szabmu-mdcat", priority: 0.7, changeFrequency: "monthly" },
  { path: "/past-papers/duhs-mdcat", priority: 0.7, changeFrequency: "monthly" },
  { path: "/past-papers/etea-mdcat", priority: 0.7, changeFrequency: "monthly" },
  { path: "/past-papers/siba-mdcat", priority: 0.7, changeFrequency: "monthly" },
  { path: "/past-papers/szabmu-mdcat-reconducted", priority: 0.6, changeFrequency: "monthly" },
  { path: "/past-papers/sindh-mdcat", priority: 0.7, changeFrequency: "monthly" },
  { path: "/past-papers/nums-mdcat", priority: 0.7, changeFrequency: "monthly" },

  // Blog — the long-tail engine
  { path: "/blog", priority: 0.9, changeFrequency: "daily" },
  { path: "/blog/mdcat-guide", priority: 0.8, changeFrequency: "weekly" },

  // Legal — low priority but kept so the site looks complete to crawlers
  { path: "/privacy", priority: 0.5, changeFrequency: "yearly" },
  { path: "/copyright", priority: 0.4, changeFrequency: "yearly" },
];

/** Absolute URLs for every public page, in sitemap order. */
export function seoPageUrls(siteUrl: string): string[] {
  return SEO_PAGES.map((p) => `${siteUrl}${p.path}`);
}

/**
 * The chapter-drill paths under /topicals/[subject]/[chapter], derived from
 * the same TOPICALS_SUBJECTS seam the drill route's generateStaticParams
 * uses — sitemap, IndexNow pings and the prerendered pages stay in lockstep
 * by construction (28 drills as of the v2 ingest; grows with the bank).
 */
export function topicalDrillPaths(): string[] {
  const paths: string[] = [];
  for (const s of TOPICALS_SUBJECTS) {
    for (const c of s.chapters) paths.push(`/topicals/${s.slug}/${c.slug}`);
  }
  return paths;
}

export function topicalDrillUrls(siteUrl: string): string[] {
  return topicalDrillPaths().map((p) => `${siteUrl}${p}`);
}

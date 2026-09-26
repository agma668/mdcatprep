/**
 * Every public, crawlable URL on the site — the ONE list.
 *
 * Consumers: app/sitemap.ts (what search engines should index) and
 * app/api/seo/indexnow/route.ts (what to ping on publishing). Keeping them
 * on one list means a new page appears in the sitemap AND gets pinged to
 * Bing/IndexNow the moment it ships, with no second place to forget.
 *
 * This file is allowed to import page components' metadata but NOT to run
 * DB queries — it must stay importable from route handlers and build steps
 * without a database connection.
 *
 * NOTE: /verify/certificate is deliberately absent — it is a lookup utility,
 * not content anyone would search for.
 */

export type SeoPage = {
  /** Path with leading slash, '' for the homepage. */
  path: string;
  /** Sitemap priority (0–1). Also used to order IndexNow batches. */
  priority: number;
  /** Rough change cadence — both engines accept: always hourly daily weekly monthly yearly never */
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
};

export const SEO_PAGES: SeoPage[] = [
  // Core conversion pages
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/diagnostic", priority: 0.9, changeFrequency: "weekly" },
  { path: "/resources", priority: 0.9, changeFrequency: "daily" },
  { path: "/daily-quiz", priority: 0.7, changeFrequency: "daily" },
  { path: "/duels", priority: 0.7, changeFrequency: "daily" },
  { path: "/faq", priority: 0.8, changeFrequency: "monthly" },
  { path: "/founder", priority: 0.8, changeFrequency: "monthly" },
  { path: "/guides/medical-fitness", priority: 0.8, changeFrequency: "monthly" },
  // The head-term pillar page — "cadet college preparation"
  { path: "/guides/cadet-college-preparation", priority: 0.9, changeFrequency: "weekly" },
  { path: "/registration-deadlines-2027", priority: 0.9, changeFrequency: "weekly" },
  { path: "/blog/cadet-college-fees-scholarships", priority: 0.8, changeFrequency: "monthly" },

  // Blog — the long-tail engine
  { path: "/blog", priority: 0.9, changeFrequency: "daily" },
  { path: "/blog/mcj-preparation-guide", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/kohat-preparation-guide", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/cch-preparation-guide", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/cadet-vs-military-college", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/paf-sargodha-preparation-tips", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/petaro-preparation-guide", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/burn-hall-preparation-guide", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/larkana-preparation-guide", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/swat-preparation-guide", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/mardan-preparation-guide", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/sanghar-preparation-guide", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/wana-preparation-guide", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/lower-topa-preparation-guide", priority: 0.8, changeFrequency: "weekly" },
  // Pillar-cluster spokes — each links up to /guides/cadet-college-preparation
  { path: "/blog/3-month-study-plan", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/cadet-college-interview-questions", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/iq-section-guide", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/cch-syllabus-2027", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/class-7-vs-class-8-entry", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog/cadet-college-age-limit", priority: 0.8, changeFrequency: "weekly" },

  // Homepage is covered by the path: "" entry at the top of this list —
  // a second path: "/" entry emitted a duplicate <loc> variant.

  // RULE: the sitemap lists INDEXABLE pages only. Utility pages that serve
  // noindex meta (/offline-practice, /verify/certificate) must stay OUT —
  // a sitemap entry on a noindex page is a submitted-vs-noindex contradiction
  // that GSC reports as an error. robots.ts blocks app surfaces; noindex meta
  // handles public-but-not-content pages; this list handles content only.

  // College pages — one per target institution (each is its own search term)
  { path: "/colleges/cch", priority: 0.9, changeFrequency: "weekly" },
  { path: "/colleges/cch/syllabus", priority: 0.9, changeFrequency: "monthly" },
  { path: "/colleges/petaro/syllabus", priority: 0.9, changeFrequency: "monthly" },
  { path: "/colleges/paf-sargodha", priority: 0.9, changeFrequency: "weekly" },
  { path: "/colleges/mcj", priority: 0.9, changeFrequency: "weekly" },
  { path: "/colleges/kohat", priority: 0.9, changeFrequency: "weekly" },
  { path: "/colleges/petaro", priority: 0.9, changeFrequency: "weekly" },
  { path: "/colleges/burn-hall", priority: 0.9, changeFrequency: "weekly" },
  { path: "/colleges/larkana", priority: 0.9, changeFrequency: "weekly" },
  { path: "/colleges/swat", priority: 0.9, changeFrequency: "weekly" },
  { path: "/colleges/mardan", priority: 0.9, changeFrequency: "weekly" },
  { path: "/colleges/sanghar", priority: 0.9, changeFrequency: "weekly" },
  { path: "/colleges/wana", priority: 0.9, changeFrequency: "weekly" },
  { path: "/colleges/lower-topa", priority: 0.9, changeFrequency: "weekly" },

  // Legal — low priority but kept so the site looks complete to crawlers
  { path: "/privacy", priority: 0.5, changeFrequency: "yearly" },
  { path: "/copyright", priority: 0.4, changeFrequency: "yearly" },
];

/** Absolute URLs for every public page, in sitemap order. */
export function seoPageUrls(siteUrl: string): string[] {
  return SEO_PAGES.map((p) => `${siteUrl}${p.path}`);
}

import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'
import { SEO_PAGES, topicalDrillPaths } from '@/lib/seo-pages'
import { CONTENT_REVIEWED_ON } from '@/lib/dated-claims'

/**
 * Sitemap from the ONE list (lib/seo-pages.ts) — the same source the IndexNow
 * pinger submits, so a new page is sitemapped AND pinged with no second place
 * to forget. SEO_PAGES covers the hand-written public pages; topicalDrillPaths
 * adds the chapter drills derived from the same seam the drill route
 * prerenders from. Indexable pages only; noindex utility pages stay out.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = getSiteUrl()
  // Deliberately not `new Date()`: that stamped every URL as modified on every
  // build, which is the fastest way to have crawlers ignore lastmod entirely.
  // The register's reviewed-on date is bumped in the same commit as a content
  // change, so this value is a claim we can stand behind.
  const lastModified = new Date(`${CONTENT_REVIEWED_ON}T00:00:00Z`)

  const staticPages: MetadataRoute.Sitemap = SEO_PAGES.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${url}${path}`,
      lastModified,
      changeFrequency,
      priority,
    }),
  )

  const drills: MetadataRoute.Sitemap = topicalDrillPaths().map((path) => ({
    url: `${url}${path}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...drills]
}

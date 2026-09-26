import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'
import { SEO_PAGES, topicalDrillPaths } from '@/lib/seo-pages'

/**
 * Sitemap from the ONE list (lib/seo-pages.ts) — the same source the IndexNow
 * pinger submits, so a new page is sitemapped AND pinged with no second place
 * to forget. SEO_PAGES covers the hand-written public pages; topicalDrillPaths
 * adds the chapter drills derived from the same seam the drill route
 * prerenders from. Indexable pages only; noindex utility pages stay out.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = getSiteUrl()
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = SEO_PAGES.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${url}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  )

  const drills: MetadataRoute.Sitemap = topicalDrillPaths().map((path) => ({
    url: `${url}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...drills]
}

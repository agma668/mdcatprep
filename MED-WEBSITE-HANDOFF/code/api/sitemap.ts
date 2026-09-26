import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'
import { SEO_PAGES } from '@/lib/seo-pages'

// Single source of truth: lib/seo-pages.ts owns the list of public pages —
// the same list the IndexNow ping endpoint uses, so a new page is sitemapped
// and pinged together.
export default function sitemap(): MetadataRoute.Sitemap {
  const url = getSiteUrl()

  return SEO_PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${url}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}

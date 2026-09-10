import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const url = getSiteUrl()
  const now = new Date()

  const publicPages = [
    { path: '', priority: 1 },
    { path: '/founder', priority: 0.8 },
    { path: '/daily-quiz', priority: 0.7 },
    { path: '/diagnostic', priority: 0.9 },
    { path: '/faq', priority: 0.8 },
    { path: '/resources', priority: 0.9 },
    { path: '/blog', priority: 0.9 },
    { path: '/blog/mdcat-guide', priority: 0.9 },
    { path: '/privacy', priority: 0.5 },
    { path: '/copyright', priority: 0.4 },
  ]

  return publicPages.map(({ path, priority }) => ({
    url: `${url}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority,
  }))
}

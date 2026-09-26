import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/dashboard',
          '/api/',
          '/login',
          '/signup',
          '/pending',
          '/rejected',
          '/suspended',
          '/forgot-password',
          '/reset-password',
          '/account-deleted',
        ],
      },
      {
        // Explicitly allow AI search crawlers — this is the AEO wedge. Classic
        // competitors predate this layer entirely.
        userAgent: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended'],
        allow: '/',
      },
      {
        // Block training-only crawlers (not search bots)
        userAgent: ['CCBot', 'Bytespider'],
        disallow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

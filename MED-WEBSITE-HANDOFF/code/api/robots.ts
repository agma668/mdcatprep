import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Auth/account-state and app surfaces carry their own noindex meta as
        // well — robots.txt keeps crawlers OUT, the meta keeps any already-
        // discovered URL out of the index (the two signals do different jobs).
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
        // Explicitly allow AI search crawlers for maximum visibility
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
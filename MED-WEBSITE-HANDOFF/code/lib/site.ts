// Site-wide constants for SEO (canonical URLs, sitemap, structured data).
//
// DOMAIN HONESTY (the indexing lesson of 2026-09): this used to default to
// https://cadetcollegeprep.com — a domain that was never registered. Every
// canonical tag on the site pointed at a dead host, so Google saw a site
// declaring itself a duplicate of a nonexistent page and indexed nothing
// (site:elite-cadet-prep.vercel.app returned 0 results). The fallback chain
// below now resolves to a URL that actually SERVES, in order:
//   1. NEXT_PUBLIC_SITE_URL      — set this in Vercel env once the custom
//                                  domain is registered + attached; every
//                                  canonical/sitemap/JSON-LD flips to it.
//   2. VERCEL_PROJECT_PRODUCTION_URL — the stable production domain Vercel
//                                  injects automatically (elite-cadet-prep.vercel.app).
//   3. VERCEL_URL                — per-deployment fallback.
//   4. hardcoded live domain     — local builds without Vercel env.
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/+$/, '')
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (production) return `https://${production.replace(/\/+$/, '')}`
  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) return `https://${vercelUrl.replace(/\/+$/, '')}`
  return 'https://elite-cadet-prep.vercel.app'
}

export const SITE_NAME = 'Cadet College Prep'
// No hardcoded question count here on purpose: the landing page shows the
// live count from lib/public-stats.ts, and the meta description must never
// drift from the real bank (the honesty rule — a number is only shown when it
// is backed by a real query, and a static meta description can't run one).
export const SITE_DESCRIPTION =
  'Free cadet-college entry-test preparation for students across Pakistan. Practice exam-style MCQs for CCH, PAF Sargodha, MCJ, Kohat, and more. Study notes, progress tracking, and live WhatsApp classes — all 100% free.'

/**
 * The academy's WhatsApp number in international format (no + or spaces).
 * NEXT_PUBLIC_WHATSAPP_NUMBER can override it (e.g. from Vercel env vars);
 * otherwise we fall back to the known number so WhatsApp buttons always
 * render, even if the env var is not configured on the host.
 */
export function getWhatsAppNumber(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923193051175').replace(/[^0-9]/g, '')
}

export function getWhatsAppLink(message?: string): string {
  const number = getWhatsAppNumber()
  const base = `https://wa.me/${number}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

/**
 * tel: link for the academy's WhatsApp/call number. Same source of truth as
 * getWhatsAppLink() — flip NEXT_PUBLIC_WHATSAPP_NUMBER on the host to override.
 */
export function getTelLink(): string {
  return `tel:+${getWhatsAppNumber()}`
}

// Site-wide constants for SEO (canonical URLs, sitemap, structured data).
// Override with NEXT_PUBLIC_SITE_URL once a custom domain is connected;
// otherwise we default to the current production deployment.

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/+$/, '')
  return 'https://medprep.pk'
}

export const SITE_NAME = 'MED Prep'
// No hardcoded question count here on purpose: the landing page shows the
// live count from lib/public-stats.ts, and the meta description must never
// drift from the real bank (the honesty rule — a number is only shown when it
// is backed by a real query, and a static meta description can't run one).
export const SITE_DESCRIPTION =
  'Free MDCAT preparation for students across Pakistan. Practice exam-style MCQs in Biology, Chemistry, Physics and English, and read clear master notes built from the PMDC MDCAT syllabus.'

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

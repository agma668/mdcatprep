import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/site'
import { FLASHCARD_META } from '@/lib/flashcards/flashcards-data'
import { PublicFlashcardsClient } from './PublicFlashcardsClient'

// The public flashcards page — the same decks, the same SM-2-lite scheduler
// and the same study UI as the dashboard, but zero signup: progress lives in
// the visitor's localStorage. This is the discovery funnel the big prep sites
// run: let guests taste the spaced-repetition engine, then convert with a
// persistent, cross-device account.

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'Free MDCAT Flashcards — Biology, Chemistry, Physics & English',
  description:
    'Study free MDCAT flashcards online — spaced-repetition decks for Biology, Chemistry, Physics and English built from the PMDC syllabus. No signup needed; Anki-style Again/Hard/Good/Easy scheduling.',
  keywords: [
    'MDCAT flashcards free',
    'MDCAT online flashcards',
    'biology flashcards MDCAT',
    'chemistry flashcards MDCAT',
    'physics flashcards MDCAT',
    'spaced repetition MDCAT',
    'MDCAT revision cards',
    'NUMS flashcards free',
    'medical entry test flashcards Pakistan',
    'PMDC syllabus flashcards',
  ],
  openGraph: {
    type: 'website',
    url: `${siteUrl}/flashcards`,
    title: 'Free MDCAT Flashcards — Spaced Repetition, No Signup | MED Prep',
    description: `Free spaced-repetition flashcards for MDCAT and NUMS: ${FLASHCARD_META.totalDecks} decks across Biology, Chemistry, Physics and English. Study instantly, progress saved on your device.`,
    siteName: 'MED Prep',
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: 'Free MDCAT Flashcards — MED Prep' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free MDCAT Flashcards | MED Prep',
    description: 'Spaced-repetition MDCAT flashcards for all four subjects. Free, no signup.',
    images: [`${siteUrl}/og.png`],
  },
  alternates: { canonical: '/flashcards' },
}

export default function PublicFlashcardsPage() {
  return <PublicFlashcardsClient />
}

'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { FLASHCARD_DECKS, FLASHCARD_META } from '@/lib/flashcards/flashcards-data'
import { FlashcardsClient } from '@/app/dashboard/flashcards/FlashcardsClient'
import {
  getGuestReviewSnapshot,
  getGuestServerSnapshot,
  gradeGuestCard,
  resetGuestCard,
  subscribeGuestReviewState,
} from '@/lib/flashcards/guest-progress'
import { flashcardsJsonLd } from './json-ld'

// Interactive guest surface for the public flashcards page. Guest progress is
// a localStorage-backed external store: the server/hydration snapshot is
// empty (SSR can't read localStorage), and React re-renders from the client
// snapshot after mount — no hydration mismatch, no setState-in-effect.

export function PublicFlashcardsClient() {
  const reviewState = useSyncExternalStore(
    subscribeGuestReviewState,
    getGuestReviewSnapshot,
    getGuestServerSnapshot
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(flashcardsJsonLd) }}
      />
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)] mb-2">
            Retain what you learn · free, no signup
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient-brand tracking-tight mb-3">
            Free MDCAT Flashcards
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] max-w-2xl mb-8 leading-relaxed">
            {FLASHCARD_META.totalDecks} spaced-repetition decks · {FLASHCARD_META.totalCards} cards
            across Biology, Chemistry, Physics and English, built from the PMDC syllabus. Rate each
            card honestly — Again, Hard, Good or Easy — and weak cards come back sooner.
          </p>

          <FlashcardsClient
            decks={FLASHCARD_DECKS}
            initialReviewState={{ byCard: {}, unavailable: false }}
            backend={{
              grade: async (cardId, rating) => gradeGuestCard(cardId, rating),
              reset: async (cardId) => resetGuestCard(cardId),
            }}
            reviewStateOverride={reviewState}
            notice={
              <>
                You&apos;re studying as a guest — progress is saved on this device only.{' '}
                <Link
                  href="/signup"
                  className="font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] underline underline-offset-2"
                >
                  Create a free account
                </Link>{' '}
                to sync your review schedule across all your devices.
              </>
            }
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}

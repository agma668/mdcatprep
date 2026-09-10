import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { FLASHCARD_DECKS } from '@/lib/flashcards/flashcards-data'
import { getFlashcardReviewState } from '@/app/actions/flashcards'
import { FlashcardsClient } from './FlashcardsClient'

export const metadata: Metadata = { title: 'Flashcards' }
export const dynamic = 'force-dynamic'

export default async function FlashcardsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fails open: if flashcard_reviews isn't applied yet, the client shows all
  // decks as "all new" with stats hidden instead of erroring.
  const reviewState = await getFlashcardReviewState()

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      <PageHeader
        eyebrow="Retain what you learn"
        title="Flashcards"
        description="Spaced-repetition decks built from the PMDC syllabus. Rate each card honestly — Again, Hard, Good or Easy — and the schedule brings weak cards back sooner."
      />
      <FlashcardsClient
        decks={FLASHCARD_DECKS}
        initialReviewState={reviewState}
      />
    </div>
  )
}

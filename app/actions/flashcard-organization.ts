'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CARDS_BY_ID } from '@/lib/flashcards/flashcards-data'
import { normaliseTags, type CardMeta } from '@/lib/flashcards/organization'

// Card organization for issue #5, section B. Every query is scoped to the
// signed-in student; ownership of a deck is re-checked before any card is
// attached so a forged deck id cannot touch another student's data. All these
// tables are additive draft-migration objects, so reads fail soft ({} / [])
// when the migration has not been applied; writes report the real error.

type Result = { success: boolean; error?: string }

async function currentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

/** All organization metadata for the signed-in student, keyed by card id. */
export async function getCardMeta(): Promise<Record<string, CardMeta>> {
  const { supabase, user } = await currentUser()
  if (!user) return {}

  const { data, error } = await supabase
    .from('flashcard_card_meta')
    .select('card_id, starred, suspended, buried_until, tags')
    .eq('student_id', user.id)
  if (error || !data) return {}

  const map: Record<string, CardMeta> = {}
  for (const row of data as CardMeta[]) {
    map[row.card_id] = {
      card_id: row.card_id,
      starred: Boolean(row.starred),
      suspended: Boolean(row.suspended),
      buried_until: row.buried_until ?? null,
      tags: Array.isArray(row.tags) ? row.tags : [],
    }
  }
  return map
}

async function upsertMeta(
  cardId: string,
  patch: Partial<Pick<CardMeta, 'starred' | 'suspended' | 'buried_until' | 'tags'>>
): Promise<Result> {
  if (!CARDS_BY_ID.has(cardId)) return { success: false, error: 'Unknown card.' }

  const { supabase, user } = await currentUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('flashcard_card_meta')
    .upsert(
      { student_id: user.id, card_id: cardId, ...patch, updated_at: new Date().toISOString() },
      { onConflict: 'student_id,card_id' }
    )
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/flashcards')
  return { success: true }
}

export async function setCardStarred(cardId: string, starred: boolean): Promise<Result> {
  return upsertMeta(cardId, { starred })
}

export async function setCardSuspended(cardId: string, suspended: boolean): Promise<Result> {
  return upsertMeta(cardId, { suspended })
}

/** Hide a card from study for the next `days` (default 1). */
export async function buryCard(cardId: string, days = 1): Promise<Result> {
  const safeDays = Math.min(30, Math.max(1, Math.floor(days)))
  const until = new Date(Date.now() + safeDays * 86_400_000).toISOString()
  return upsertMeta(cardId, { buried_until: until })
}

export async function unburyCard(cardId: string): Promise<Result> {
  return upsertMeta(cardId, { buried_until: null })
}

export async function setCardTags(cardId: string, tags: string[] | string): Promise<Result> {
  return upsertMeta(cardId, { tags: normaliseTags(tags) })
}

export interface StudentDeck {
  id: string
  name: string
  subject: string | null
  parent_id: string | null
  exam_goal_id: string | null
  cardIds: string[]
}

/** Student-owned decks (including sub-decks) with their attached card ids. */
export async function getMyDecks(): Promise<StudentDeck[]> {
  const { supabase, user } = await currentUser()
  if (!user) return []

  const { data: decks, error } = await supabase
    .from('flashcard_decks')
    .select('id, name, subject, parent_id, exam_goal_id')
    .eq('student_id', user.id)
    .order('created_at', { ascending: true })
  if (error || !decks) return []

  const { data: links } = await supabase
    .from('flashcard_deck_cards')
    .select('deck_id, card_id')
    .eq('student_id', user.id)

  const byDeck = new Map<string, string[]>()
  for (const link of (links ?? []) as { deck_id: string; card_id: string }[]) {
    const list = byDeck.get(link.deck_id) ?? []
    list.push(link.card_id)
    byDeck.set(link.deck_id, list)
  }

  return (decks as Omit<StudentDeck, 'cardIds'>[]).map((d) => ({
    ...d,
    cardIds: byDeck.get(d.id) ?? [],
  }))
}

async function ownsDeck(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  deckId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('flashcard_decks')
    .select('id')
    .eq('id', deckId)
    .eq('student_id', userId)
    .maybeSingle()
  return Boolean(data)
}

export async function createDeck(
  name: string,
  parentId?: string | null,
  subject?: string | null
): Promise<{ success: boolean; error?: string; id?: string }> {
  const clean = name.trim().slice(0, 120)
  if (!clean) return { success: false, error: 'Deck name is required.' }

  const { supabase, user } = await currentUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // A sub-deck may only nest under a deck the same student owns.
  if (parentId && !(await ownsDeck(supabase, user.id, parentId))) {
    return { success: false, error: 'Parent deck not found.' }
  }

  const { data, error } = await supabase
    .from('flashcard_decks')
    .insert({ student_id: user.id, name: clean, parent_id: parentId ?? null, subject: subject ?? null })
    .select('id')
    .single()
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/flashcards')
  return { success: true, id: (data as { id: string }).id }
}

export async function renameDeck(deckId: string, name: string): Promise<Result> {
  const clean = name.trim().slice(0, 120)
  if (!clean) return { success: false, error: 'Deck name is required.' }

  const { supabase, user } = await currentUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('flashcard_decks')
    .update({ name: clean, updated_at: new Date().toISOString() })
    .eq('id', deckId)
    .eq('student_id', user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/flashcards')
  return { success: true }
}

export async function deleteDeck(deckId: string): Promise<Result> {
  const { supabase, user } = await currentUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('flashcard_decks')
    .delete()
    .eq('id', deckId)
    .eq('student_id', user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/flashcards')
  return { success: true }
}

export async function addCardToDeck(deckId: string, cardId: string): Promise<Result> {
  if (!CARDS_BY_ID.has(cardId)) return { success: false, error: 'Unknown card.' }

  const { supabase, user } = await currentUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  if (!(await ownsDeck(supabase, user.id, deckId))) {
    return { success: false, error: 'Deck not found.' }
  }

  const { error } = await supabase
    .from('flashcard_deck_cards')
    .upsert({ deck_id: deckId, card_id: cardId, student_id: user.id }, { onConflict: 'deck_id,card_id' })
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/flashcards')
  return { success: true }
}

export async function removeCardFromDeck(deckId: string, cardId: string): Promise<Result> {
  const { supabase, user } = await currentUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  if (!(await ownsDeck(supabase, user.id, deckId))) {
    return { success: false, error: 'Deck not found.' }
  }

  const { error } = await supabase
    .from('flashcard_deck_cards')
    .delete()
    .eq('deck_id', deckId)
    .eq('card_id', cardId)
    .eq('student_id', user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/flashcards')
  return { success: true }
}


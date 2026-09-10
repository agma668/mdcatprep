/**
 * One owner of the "may this student be challenged?" gate, shared by the
 * duels and races actions. The leaderboard population is approved students
 * plus the founder-sanctioned demo roster; demo rows show the same
 * affordance so the roster is indistinguishable, but a real challenge to a
 * demo is refused HERE (demos cannot play — a live duel or race would farm
 * a free win). Each feature supplies its own refusal copy (challenge vs
 * race wording) so the messages never change and never name demo status.
 * Called server-side on every challenge so RLS alone never decides who may
 * be challenged.
 */

import { isAdminEmail } from '@/lib/auth'
import { isDemoEmail } from '@/lib/demo'
import { createServiceClient } from '@/lib/supabase/service'

export interface OpponentProfile {
  id: string
  email: string
  status: string
  full_name: string | null
}

export type OpponentGateResult = { error: string } | { opponent: OpponentProfile }

/** The feature's own refusal copy — lives with the action that owns the
 *  surface vocabulary, never in the gate. */
export interface OpponentGateCopy {
  self: string
  notApproved: string
  notAccepting: string
  staff: string
}

export async function validateOpponent(
  opponentId: string,
  challengerId: string,
  copy: OpponentGateCopy
): Promise<OpponentGateResult> {
  if (opponentId === challengerId) return { error: copy.self }

  const service = createServiceClient()
  const { data: opponent } = await service
    .from('profiles')
    .select('id, email, status, full_name')
    .eq('id', opponentId)
    .maybeSingle()

  if (!opponent) return { error: 'Student not found.' }
  if (opponent.status !== 'approved') return { error: copy.notApproved }
  if (isDemoEmail(opponent.email)) {
    // Neutral on purpose: naming demo status would out the roster. The demo
    // cannot play, so no challenge to it may ever be stored.
    return { error: copy.notAccepting }
  }
  if (isAdminEmail(opponent.email)) return { error: copy.staff }
  return { opponent }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { dayKey, addDays } from '@/lib/utils'
import { computeStreaks } from '@/lib/analytics/streaks'
import { getSelfRank } from '@/lib/leaderboard'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * Habit snapshot for the signed-in student — the data behind the daily-quiz
 * results strip. Reads the student's OWN question_attempts (the single
 * attempt path every practice surface records through, RLS-scoped), so the
 * strip, the dashboard Daily Goal, the analytics streak, and the leaderboard
 * all agree by construction: they derive from the same rows with the same
 * UTC day-key / streak semantics (computeStreaks matches the leaderboard
 * SQL's "consecutive UTC study days ending today or yesterday").
 *
 * Returns null for guests (nothing rendered) and on any read failure — the
 * strip never guesses.
 */

export interface HabitSnapshot {
  /** Current streak in days (same definition as the leaderboard). */
  streak: number
  /** UTC day keys of the last 7 days, oldest first (for the strip's dots). */
  week: string[]
  /** Subset of `week` that has at least one recorded attempt. */
  activeDays: string[]
  /** Questions recorded on the current UTC day. */
  todayCount: number
  /** Display name — for the share card (null when unreadable). */
  name: string | null
  /** Real leaderboard rank via the findSelfRow path (null = unranked/unreadable). */
  rank: number | null
}

export async function getHabitSnapshot(): Promise<HabitSnapshot | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch every own attempt's created_at within the last ~120 days, paged
  // past PostgREST's row cap so even the most active student's streak is
  // computed over their full run, not the first 1,000 rows.
  const since = addDays(new Date(), -120).toISOString()
  const created: string[] = []
  for (let page = 0; page < 8; page++) {
    const from = page * 1000
    const { data, error } = await supabase
      .from('question_attempts')
      .select('created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .range(from, from + 999)
    if (error || !data) break
    created.push(...data.map((r) => r.created_at).filter(Boolean))
    if (data.length < 1000) break
  }

  const days = [...new Set(created.map((iso) => dayKey(new Date(iso))))]
  const { current } = computeStreaks(days)
  const todayKey = dayKey(new Date())

  const week: string[] = []
  for (let i = 6; i >= 0; i--) week.push(dayKey(addDays(new Date(), -i)))

  // Name + rank for the daily-quiz share card — same leaderboard path the
  // board reads (findSelfRow), failing open to null (never a guessed number).
  let name: string | null = null
  let rank: number | null = null
  try {
    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()
    name = profile?.full_name ?? null
    const spot = await getSelfRank(user.id)
    rank = spot?.rank ?? null
  } catch {
    // Leave name/rank null — the card shows "#—" rather than guessing.
  }

  return {
    streak: current,
    week,
    activeDays: week.filter((d) => days.includes(d)),
    todayCount: created.filter((iso) => dayKey(new Date(iso)) === todayKey).length,
    name,
    rank,
  }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { validateOpponent } from '@/lib/opponent-gate'
import {
  computeRaceOutcome,
  fetchRaceById,
  fetchWindowStats,
  isRaceMetric,
  isRaceOver,
  raceMsLeft,
  type RaceMetric,
  type RaceRow,
  type RaceWinner,
} from '@/lib/races-repo'


export type CreateRaceResult =
  | { error: string }
  | { raceId: string; metric: RaceMetric; opponentName: string }

export async function createRace(opponentId: string, metric: string): Promise<CreateRaceResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  if (!isRaceMetric(metric)) return { error: 'Unknown race metric.' }

  const gate = await validateOpponent(opponentId, user.id, {
    self: 'You cannot race yourself.',
    notApproved: 'Only approved students can be raced.',
    notAccepting: 'This student is not accepting races right now.',
    staff: 'You cannot race staff accounts.',
  })
  if ('error' in gate) return { error: gate.error }
  const { opponent } = gate

  const { data, error } = await supabase
    .from('races')
    .insert({ challenger_id: user.id, opponent_id: opponentId, metric })
    .select('id')
    .single()

  if (error) {
    // Pre-migration: the races table doesn't exist yet (or a race between
    // these two is already running — the DB trigger rejects it). Say so
    // plainly instead of echoing PostgREST's schema-cache error.
    if (/does not exist|schema cache/i.test(error.message)) {
      return { error: "Races aren't live yet — challenges become available soon." }
    }
    return { error: error.message }
  }
  return { raceId: data.id, metric, opponentName: opponent.full_name ?? 'Student' }
}

/** Rematch: same pair, roles reversed, same metric, fresh 7-day window. Only
 *  allowed once the previous race between them has finished. */
export async function rematchRace(raceId: string): Promise<CreateRaceResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const race = await fetchRaceById(supabase, raceId)
  if (!race) return { error: 'Race not found.' }
  if (!isRaceOver(race)) return { error: 'A race can only be rematched after it finishes.' }
  if (race.challenger_id !== user.id && race.opponent_id !== user.id) {
    return { error: 'You are not part of this race.' }
  }
  const opponentId = race.challenger_id === user.id ? race.opponent_id : race.challenger_id
  return createRace(opponentId, race.metric)
}

export interface RaceInboxEntry {
  raceId: string
  metric: RaceMetric
  createdAt: string
  /** Milliseconds left in the race window (live only). */
  msLeft: number
  /** Epoch ms the race window ends — lets the card run a live countdown. */
  endsAt: number
  finished: boolean
  role: 'challenger' | 'opponent'
  otherId: string
  otherName: string
  /** My window totals (challenger or opponent, matched to the viewer). */
  mine: { questions: number; accuracy: number | null }
  /** The other side's window totals. */
  theirs: { questions: number; accuracy: number | null }
  winner: RaceWinner
}

/**
 * The inbox — every race the signed-in student is part of, with LIVE window
 * totals for both sides and the derived winner once the window has passed.
 * Fails OPEN: while the races table isn't applied (or on any read error) it
 * returns an empty list — never an error or a crash.
 */
export async function getMyRaces(): Promise<{ entries: RaceInboxEntry[] } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { entries: [] }

  const { data: races, error } = await supabase
    .from('races')
    .select('*')
    .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    // Pre-migration (table absent) → honest empty state, not a crash.
    if (/does not exist|schema cache/i.test(error.message)) return { entries: [] }
    return { error: error.message }
  }

  const rows = (races ?? []) as RaceRow[]
  if (rows.length === 0) return { entries: [] }

  const service = createServiceClient()
  const otherIds = rows.map((r) => (r.challenger_id === user.id ? r.opponent_id : r.challenger_id))
  const { data: others } = await service
    .from('profiles')
    .select('id, full_name')
    .in('id', otherIds)

  const nameOf = (id: string) =>
    (others ?? []).find((p) => p.id === id)?.full_name ?? 'Student'

  const entries: RaceInboxEntry[] = []
  for (const race of rows) {
    const finished = isRaceOver(race)
    const isChallenger = race.challenger_id === user.id
    const [mine, theirs] = await Promise.all([
      fetchWindowStats(service, race, isChallenger ? race.challenger_id : race.opponent_id),
      fetchWindowStats(service, race, isChallenger ? race.opponent_id : race.challenger_id),
    ])
    const outcome = computeRaceOutcome(race, mine, theirs, finished)
    entries.push({
      raceId: race.id,
      metric: race.metric,
      createdAt: race.created_at,
      msLeft: Math.max(0, raceMsLeft(race)),
      endsAt: new Date(race.created_at).getTime() + 7 * 24 * 60 * 60 * 1000,
      finished,
      role: isChallenger ? 'challenger' : 'opponent',
      otherId: race.challenger_id === user.id ? race.opponent_id : race.challenger_id,
      otherName: nameOf(race.challenger_id === user.id ? race.opponent_id : race.challenger_id),
      mine: { questions: mine.questions, accuracy: mine.accuracy },
      theirs: { questions: theirs.questions, accuracy: theirs.accuracy },
      winner: outcome.winner,
    })
  }
  return { entries }
}


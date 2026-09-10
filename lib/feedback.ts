export type FeedbackProfile = { full_name: string | null; email: string | null } | null

export type FeedbackRow = {
  id: string
  message: string
  page: string | null
  created_at: string
  user_id: string | null
  profile: FeedbackProfile
}

/**
 * Normalizes the `profile:profiles(...)` embed from PostgREST. The runtime
 * shape is a single object (to-one join via feedback.user_id → profiles.id),
 * but the untyped supabase client types it as an array — handle both.
 */
export function normalizeFeedbackRow(row: {
  id: string
  message: string
  page: string | null
  created_at: string
  user_id: string | null
  profile: unknown
}): FeedbackRow {
  const p = row.profile
  return {
    ...row,
    profile: Array.isArray(p) ? (p[0] as FeedbackProfile) ?? null : (p as FeedbackProfile) ?? null,
  }
}

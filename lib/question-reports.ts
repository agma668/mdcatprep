// Shared vocabulary for "report this question". The list lives here rather than
// in the server action because a 'use server' module may only export async
// functions, and the player needs the same labels the server validates.

export const REPORT_REASONS = [
  'The marked answer looks wrong',
  'The wording is unclear or has a typo',
  'A figure or table is missing',
  'Duplicate question',
  'Other',
] as const

export type ReportReason = (typeof REPORT_REASONS)[number]

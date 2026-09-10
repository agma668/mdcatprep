import { createClient } from "@/lib/supabase/server";
import type { AttemptRow } from "./shared";

// Re-export for downstream consumers (subjects, trends, etc.)
export type { AttemptRow } from "./shared";

interface RawAttempt {
  is_correct: boolean;
  created_at: string;
  questions: { subject: string | null; topic: string | null } | { subject: string | null; topic: string | null }[] | null;
  time_spent_seconds?: number | null;
}

/** Fetch all question attempts for a student with subject/topic data. */
export async function fetchAttempts(userId: string): Promise<AttemptRow[]> {
  const supabase = await createClient();

  // Try with time_spent_seconds first; fall back if column doesn't exist
  const primary = await supabase
    .from("question_attempts")
    .select("is_correct, created_at, questions(subject, topic), time_spent_seconds")
    .eq("student_id", userId)
    .order("created_at", { ascending: true });

  let rawAttempts: RawAttempt[];

  if (primary.error) {
    // time_spent_seconds column likely doesn't exist — query without it
    const fallback = await supabase
      .from("question_attempts")
      .select("is_correct, created_at, questions(subject, topic)")
      .eq("student_id", userId)
      .order("created_at", { ascending: true });

    if (fallback.error) {
      console.error("Error fetching attempts:", fallback.error);
      return [];
    }
    rawAttempts = (fallback.data ?? []) as RawAttempt[];
  } else {
    rawAttempts = (primary.data ?? []) as RawAttempt[];
  }

  return rawAttempts.map((a) => {
    const qs = a.questions;
    const q = Array.isArray(qs) ? qs[0] : qs;
    return {
      isCorrect: a.is_correct,
      createdAt: new Date(a.created_at),
      subject: q?.subject ?? null,
      topic: q?.topic ?? null,
      timeSpentSeconds: typeof a.time_spent_seconds === "number" ? a.time_spent_seconds : null,
    };
  });
}

/**
 * Light fetch for surfaces that only need totals / accuracy / streaks /
 * subject performance (the dashboard overview). Skips the topic embed and
 * time_spent_seconds columns — a smaller payload per row — and avoids the
 * legacy fallback round-trip the full fetch pays on every load.
 */
export async function fetchOverviewAttempts(userId: string): Promise<AttemptRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("question_attempts")
    .select("is_correct, created_at, questions(subject)")
    .eq("student_id", userId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Error fetching overview attempts:", error);
    return [];
  }
  return (data ?? []).map((a) => {
    const qs = (a as { questions: { subject: string | null } | { subject: string | null }[] | null }).questions;
    const q = Array.isArray(qs) ? qs[0] : qs;
    return {
      isCorrect: (a as { is_correct: boolean }).is_correct,
      createdAt: new Date((a as { created_at: string }).created_at),
      subject: q?.subject ?? null,
      topic: null,
      timeSpentSeconds: null,
    };
  });
}

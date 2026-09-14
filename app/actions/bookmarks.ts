"use server";

// Bookmarks ("flag for review") — students flag questions during practice
// and revisit them at /dashboard/bookmarks. Server-owned like every other
// write: the student id comes from the session, never the client.

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { QuizQuestion } from "@/lib/questions";
import { toQuizQuestion } from "@/lib/questions";

export type BookmarkedQuestion = QuizQuestion & { id: string; flaggedAt: string };

/** Flip the flag on one question for the signed-in student. */
export async function toggleBookmark(questionId: string): Promise<{ error?: string; flagged?: boolean }> {
  if (!questionId) return { error: "Invalid question." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Existence check via the service client keeps the toggle idempotent even
  // under double-clicks (the unique index is the final guard).
  const service = createServiceClient();
  const { data: existing } = await service
    .from("question_bookmarks")
    .select("id")
    .eq("question_id", questionId)
    .eq("student_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await service
      .from("question_bookmarks")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: error.message };
    return { flagged: false };
  }

  const { error } = await service
    .from("question_bookmarks")
    .insert({ question_id: questionId, student_id: user.id });
  if (error) return { error: error.message };
  return { flagged: true };
}

/** The student's flagged questions, newest flag first. */
export async function getMyBookmarks(): Promise<{ error?: string; questions: BookmarkedQuestion[] }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", questions: [] };

  const service = createServiceClient();
  const { data, error } = await service
    .from("question_bookmarks")
    .select("created_at, questions (*)")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { error: error.message, questions: [] };
  const questions: BookmarkedQuestion[] = [];
  for (const row of data ?? []) {
    const q = Array.isArray(row.questions) ? row.questions[0] : row.questions;
    if (!q || typeof q !== "object") continue;
    const record = q as Record<string, unknown>;
    if (typeof record.id !== "string") continue;
    questions.push({
      ...toQuizQuestion(record),
      id: record.id,
      flaggedAt: typeof row.created_at === "string" ? row.created_at : "",
    });
  }
  return { questions };
}

/** Ids of the student's flagged questions (for the flag button state). */
export async function getMyBookmarkIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const service = createServiceClient();
  const { data } = await service
    .from("question_bookmarks")
    .select("question_id")
    .eq("student_id", user.id)
    .limit(2000);
  return (data ?? []).map((r) => r.question_id).filter((v): v is string => typeof v === "string");
}

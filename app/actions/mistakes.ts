"use server";

// Wrong-answer drill queue: the student's most recent attempt on each
// attempted question, keeping only questions whose LATEST attempt was wrong
// (re-answering correctly retires the question). This is the "fix my
// mistakes" loop — the single highest-retention feature in every modern
// prep product. Attempts data is the student's own (RLS-fetched); question
// bodies resolve through the service client.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { toQuizQuestion, type BankQuestion } from "@/lib/questions";
import {
  isMistakeClassification,
  validateMissReason,
  type MistakeClassification,
} from "@/lib/mistakes/classification";

export type MistakeQuestion = BankQuestion & {
  wrongCount: number;
  lastWrongAt: string;
  subject: string;
};

export async function getMyMistakes(): Promise<{ error?: string; questions: MistakeQuestion[] }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", questions: [] };

  // All of this student's attempts, newest first.
  const { data: attempts, error } = await supabase
    .from("question_attempts")
    .select("question_id, is_correct, created_at")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4000);
  if (error) return { error: error.message, questions: [] };

  // Latest attempt per question; count the wrong ones.
  const latest = new Map<string, { correct: boolean; at: string }>();
  const wrongCount = new Map<string, number>();
  for (const a of attempts ?? []) {
    if (!latest.has(a.question_id)) {
      latest.set(a.question_id, { correct: !!a.is_correct, at: String(a.created_at) });
    }
    if (!a.is_correct) wrongCount.set(a.question_id, (wrongCount.get(a.question_id) ?? 0) + 1);
  }

  const wrongIds = [...latest.entries()]
    .filter(([, v]) => !v.correct)
    .sort((a, b) => b[1].at.localeCompare(a[1].at))
    .map(([id]) => id);
  if (wrongIds.length === 0) return { questions: [] };

  // Resolve the question bodies (service client; a student keeps drill access
  // to questions they attempted even if since unpublished, matching the
  // "review your mistakes" contract).
  const service = createServiceClient();
  const { data: rows, error: qErr } = await service
    .from("questions")
    .select("*")
    .in("id", wrongIds.slice(0, 100));
  if (qErr) return { error: qErr.message, questions: [] };

  const byId = new Map<string, Record<string, unknown>>();
  for (const r of rows ?? []) byId.set(r.id, r);

  const questions: MistakeQuestion[] = [];
  for (const id of wrongIds) {
    const row = byId.get(id);
    if (!row) continue;
    const q = toQuizQuestion(row);
    if (typeof row.id !== "string") continue;
    questions.push({
      ...q,
      id: row.id,
      wrongCount: wrongCount.get(id) ?? 1,
      lastWrongAt: latest.get(id)?.at ?? "",
      subject: q.subject || "General",
    });
  }
  return { questions };
}

// ===========================================================================
// Mistake recovery & mastery rechecks (GitHub issue #4).
//
// The drill above stays untouched and remains the "redo your wrong answers"
// surface. These actions add the server-backed notebook: classification, per
// miss reasons, mastery state and flashcards derived from a question. All
// writes run under the caller's session so RLS enforces per-student ownership.
// ===========================================================================

export interface MistakeReviewRow {
  id: string;
  student_id: string;
  question_id: string;
  attempt_id: string | null;
  classification: MistakeClassification;
  mastered: boolean;
  mastered_at: string | null;
  miss_reason: string | null;
  confidence: number | null;
  created_at: string;
  updated_at: string;
  question_text: string | null;
  question_subject: string | null;
  question_topic: string | null;
  question_correct_answer: string | null;
  question_selected_answer: string | null;
  question_explanation: string | null;
}

export interface MistakeStats {
  total: number;
  notMastered: number;
  masteredCount: number;
  byClassification: Record<string, number>;
  bySubject: Record<string, number>;
}

export interface SubmitMistakeInput {
  question_id: string;
  attempt_id?: string | null;
  classification: string;
  miss_reason?: string | null;
  confidence?: number | null;
}

/** Record (or refresh) a mistake review for one question attempt. */
export async function submitMistakeReview(
  input: SubmitMistakeInput
): Promise<{ success: boolean; error?: string; id?: string }> {
  if (!isMistakeClassification(input.classification)) {
    return { success: false, error: "Invalid classification." };
  }
  let missReason: string | null;
  try {
    missReason = validateMissReason(input.miss_reason);
  } catch {
    return { success: false, error: "Invalid miss reason." };
  }
  if (
    input.confidence != null &&
    (!Number.isInteger(input.confidence) || input.confidence < 1 || input.confidence > 5)
  ) {
    return { success: false, error: "Confidence must be 1-5." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Duplicate-safe: one review per (student, question, attempt). A re-submit
  // refreshes the classification rather than creating a second row.
  let existingQuery = supabase
    .from("mistake_reviews")
    .select("id")
    .eq("student_id", user.id)
    .eq("question_id", input.question_id);
  existingQuery =
    input.attempt_id == null
      ? existingQuery.is("attempt_id", null)
      : existingQuery.eq("attempt_id", input.attempt_id);
  const { data: existing } = await existingQuery.maybeSingle();

  const payload = {
    classification: input.classification,
    miss_reason: missReason,
    confidence: input.confidence ?? null,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error } = await supabase
      .from("mistake_reviews")
      .update(payload)
      .eq("id", existing.id)
      .eq("student_id", user.id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/mistake-notebook");
    return { success: true, id: existing.id };
  }

  const { data, error } = await supabase
    .from("mistake_reviews")
    .insert({
      student_id: user.id,
      question_id: input.question_id,
      attempt_id: input.attempt_id ?? null,
      ...payload,
    })
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/mistake-notebook");
  return { success: true, id: data.id };
}

/** Update a review's miss reason, confidence or mastery state. */
export async function updateMistakeReview(
  reviewId: string,
  updates: { miss_reason?: string | null; confidence?: number | null; mastered?: boolean }
): Promise<{ success: boolean; error?: string }> {
  let missReason: string | null | undefined;
  try {
    missReason =
      updates.miss_reason === undefined ? undefined : validateMissReason(updates.miss_reason);
  } catch {
    return { success: false, error: "Invalid miss reason." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (missReason !== undefined) payload.miss_reason = missReason;
  if (updates.confidence !== undefined) payload.confidence = updates.confidence;
  if (updates.mastered !== undefined) {
    payload.mastered = updates.mastered;
    payload.mastered_at = updates.mastered ? new Date().toISOString() : null;
  }

  const { error } = await supabase
    .from("mistake_reviews")
    .update(payload)
    .eq("id", reviewId)
    .eq("student_id", user.id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/mistake-notebook");
  return { success: true };
}

/** All of the student's mistake reviews, newest first, with question bodies. */
export async function getMyMistakeReviews(): Promise<{
  error?: string;
  reviews: MistakeReviewRow[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", reviews: [] };

  const { data, error } = await supabase
    .from("mistake_reviews")
    .select("*")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return { error: error.message, reviews: [] };

  const rows = data ?? [];
  const ids = [...new Set(rows.map((r) => r.question_id).filter(Boolean))];
  const byId = new Map<string, Record<string, unknown>>();
  if (ids.length > 0) {
    const service = createServiceClient();
    const { data: questions } = await service
      .from("questions")
      .select("id, question_text, subject, topic, correct_answer, explanation")
      .in("id", ids);
    for (const q of questions ?? []) byId.set(q.id, q);
  }

  const reviews: MistakeReviewRow[] = rows.map((r) => {
    const q = byId.get(r.question_id) ?? {};
    return {
      id: r.id,
      student_id: r.student_id,
      question_id: r.question_id,
      attempt_id: r.attempt_id ?? null,
      classification: r.classification,
      mastered: Boolean(r.mastered),
      mastered_at: r.mastered_at ?? null,
      miss_reason: r.miss_reason ?? null,
      confidence: r.confidence ?? null,
      created_at: r.created_at,
      updated_at: r.updated_at,
      question_text: (q.question_text as string) ?? null,
      question_subject: (q.subject as string) ?? null,
      question_topic: (q.topic as string) ?? null,
      question_correct_answer: (q.correct_answer as string) ?? null,
      question_selected_answer: null,
      question_explanation: (q.explanation as string) ?? null,
    };
  });
  return { reviews };
}

/** Aggregate mistake statistics for the dashboard. */
export async function getMistakeStats(): Promise<{ error?: string; stats: MistakeStats }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const empty: MistakeStats = {
    total: 0,
    notMastered: 0,
    masteredCount: 0,
    byClassification: {},
    bySubject: {},
  };
  if (!user) return { error: "Not authenticated", stats: empty };

  const { data, error } = await supabase
    .from("mistake_reviews")
    .select("classification, mastered")
    .eq("student_id", user.id);
  if (error) return { error: error.message, stats: empty };

  const stats: MistakeStats = { ...empty, byClassification: {} };
  for (const r of data ?? []) {
    stats.total += 1;
    if (r.mastered) stats.masteredCount += 1;
    else stats.notMastered += 1;
    stats.byClassification[r.classification] = (stats.byClassification[r.classification] ?? 0) + 1;
  }
  return { stats };
}

/** Mark many of the student's own reviews as mastered in one update. */
export async function bulkMarkMastered(
  reviewIds: string[]
): Promise<{ success: boolean; error?: string; updated: number }> {
  if (reviewIds.length === 0) return { success: true, updated: 0 };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated", updated: 0 };

  const { data, error } = await supabase
    .from("mistake_reviews")
    .update({
      mastered: true,
      mastered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .in("id", reviewIds)
    .eq("student_id", user.id)
    .select("id");
  if (error) return { success: false, error: error.message, updated: 0 };
  revalidatePath("/dashboard/mistake-notebook");
  return { success: true, updated: data?.length ?? 0 };
}

/** Turn a mistake's question + explanation into a review flashcard. */
export async function mistakeToFlashcard(
  reviewId: string
): Promise<{ success: boolean; error?: string; flashcardId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: review, error: reviewError } = await supabase
    .from("mistake_reviews")
    .select("id, question_id, exam_goal_id")
    .eq("id", reviewId)
    .eq("student_id", user.id)
    .maybeSingle();
  if (reviewError) return { success: false, error: reviewError.message };
  if (!review) return { success: false, error: "Review not found." };

  const service = createServiceClient();
  const { data: q } = await service
    .from("questions")
    .select("question_text, subject, topic, correct_answer, explanation")
    .eq("id", review.question_id)
    .maybeSingle();
  if (!q) return { success: false, error: "Question not found." };

  const front = q.question_text ?? "Question";
  const back = [q.correct_answer ? `Answer: ${q.correct_answer}` : null, q.explanation ?? null]
    .filter(Boolean)
    .join("\n\n");

  const { data, error } = await supabase
    .from("review_flashcards")
    .insert({
      student_id: user.id,
      source_question_id: review.question_id,
      source_mistake_id: review.id,
      exam_goal_id: review.exam_goal_id ?? null,
      subject: q.subject ?? null,
      topic: q.topic ?? null,
      front,
      back,
    })
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/flashcards");
  return { success: true, flashcardId: data.id };
}

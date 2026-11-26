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
  hasEarnedMastery,
  isMistakeClassification,
  MASTERY_REQUIRED_CORRECT_STREAK,
  validateMissReason,
  type MistakeClassification,
} from "@/lib/mistakes/classification";
import { retryState, type RetryState } from "@/lib/mistakes/schedule";

/**
 * How many correct answers in a row the student has given on this question
 * since the miss. This is the only evidence mastery accepts: opening an
 * explanation, reading the notebook or pressing a button contributes nothing.
 */
async function correctStreakSince(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  questionId: string,
  sinceISO: string
): Promise<number> {
  const { data } = await supabase
    .from("question_attempts")
    .select("is_correct, created_at")
    .eq("student_id", studentId)
    .eq("question_id", questionId)
    .gt("created_at", sinceISO)
    .order("created_at", { ascending: true });
  let streak = 0;
  for (const attempt of data ?? []) streak = attempt.is_correct ? streak + 1 : 0;
  return streak;
}

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
  /** Correct re-answers in a row since the last miss (0–2+). */
  correct_streak: number;
  /** Next re-check from the 1/3/7-day rhythm, or null for an unreadable date. */
  retry: RetryState | null;
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

  if (updates.mastered === true) {
    // The gate. Mastery is earned by answering the question again — twice in a
    // row, after the miss — so a client that calls this action directly gets
    // the same answer the button does.
    const { data: review } = await supabase
      .from("mistake_reviews")
      .select("question_id, updated_at")
      .eq("id", reviewId)
      .eq("student_id", user.id)
      .maybeSingle();
    if (!review) return { success: false, error: "Review not found." };
    const streak = await correctStreakSince(
      supabase,
      user.id,
      review.question_id,
      review.updated_at
    );
    if (!hasEarnedMastery({ correctStreak: streak })) {
      return {
        success: false,
        error: `Mastery needs ${MASTERY_REQUIRED_CORRECT_STREAK} correct re-answers on this question. You have ${streak}.`,
      };
    }
  }

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

  // Mastery evidence and the retry clock, read from the student's own attempts
  // in one query (RLS scopes it) rather than from a button press.
  const streakByQuestion = new Map<string, number>();
  const anchorByQuestion = new Map<string, string>();
  for (const r of rows) {
    if (!anchorByQuestion.has(r.question_id)) {
      anchorByQuestion.set(r.question_id, r.updated_at ?? r.created_at);
    }
  }
  if (ids.length > 0) {
    const earliest = rows.reduce(
      (min, r) => (r.created_at < min ? r.created_at : min),
      rows[0].created_at
    );
    const { data: attempts } = await supabase
      .from("question_attempts")
      .select("question_id, is_correct, created_at")
      .eq("student_id", user.id)
      .in("question_id", ids)
      .gte("created_at", earliest)
      .order("created_at", { ascending: true });
    for (const attempt of attempts ?? []) {
      const anchor = anchorByQuestion.get(attempt.question_id);
      if (!anchor || String(attempt.created_at) <= anchor) continue;
      streakByQuestion.set(
        attempt.question_id,
        attempt.is_correct ? (streakByQuestion.get(attempt.question_id) ?? 0) + 1 : 0
      );
    }
  }

  const reviews: MistakeReviewRow[] = rows.map((r) => {
    const q = byId.get(r.question_id) ?? {};
    const streak = streakByQuestion.get(r.question_id) ?? 0;
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
      correct_streak: streak,
      retry: retryState(
        anchorByQuestion.get(r.question_id) ?? r.updated_at ?? r.created_at,
        streak
      ),
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

/**
 * One tap from a whole notebook to a whole deck: every unmastered mistake that
 * does not already have a card becomes one. This is the bulk version of
 * `mistakeToFlashcard`, and it exists because making a student press the same
 * button forty times is how a review surface stops being used.
 *
 * Idempotent like its single sibling: cards are keyed on `source_mistake_id`, so
 * pressing it twice reports "already there" instead of duplicating the deck.
 * Pass an empty array for "everything unmastered".
 */
export async function mistakesToFlashcards(
  reviewIds: string[]
): Promise<{ success: boolean; error?: string; created: number; skipped: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated", created: 0, skipped: 0 };

  const base = supabase
    .from("mistake_reviews")
    .select("id, question_id, exam_goal_id")
    .eq("student_id", user.id)
    .eq("mastered", false)
    .limit(200);
  const { data: reviews, error } = reviewIds.length
    ? await base.in("id", reviewIds)
    : await base;
  if (error) return { success: false, error: error.message, created: 0, skipped: 0 };
  if (!reviews || reviews.length === 0) return { success: true, created: 0, skipped: 0 };

  const { data: carded } = await supabase
    .from("review_flashcards")
    .select("source_mistake_id")
    .eq("student_id", user.id)
    .in(
      "source_mistake_id",
      reviews.map((r) => r.id)
    );
  const already = new Set((carded ?? []).map((c) => c.source_mistake_id as string));
  const targets = reviews.filter((r) => !already.has(r.id));
  if (targets.length === 0) {
    return { success: true, created: 0, skipped: reviews.length };
  }

  const service = createServiceClient();
  const { data: questions } = await service
    .from("questions")
    .select("id, question_text, subject, topic, correct_answer, explanation")
    .in("id", [...new Set(targets.map((r) => r.question_id))]);
  const byId = new Map<string, Record<string, unknown>>();
  for (const q of questions ?? []) byId.set(q.id as string, q);

  const rows = [];
  for (const r of targets) {
    const q = byId.get(r.question_id);
    if (!q) continue;
    const back = [
      q.correct_answer ? `Answer: ${q.correct_answer}` : null,
      (q.explanation as string) ?? null,
    ]
      .filter(Boolean)
      .join("\n\n");
    rows.push({
      student_id: user.id,
      source_question_id: r.question_id,
      source_mistake_id: r.id,
      exam_goal_id: r.exam_goal_id ?? null,
      subject: (q.subject as string) ?? null,
      topic: (q.topic as string) ?? null,
      front: (q.question_text as string) ?? "Question",
      back,
    });
  }
  if (rows.length === 0) {
    return { success: true, created: 0, skipped: reviews.length };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("review_flashcards")
    .insert(rows)
    .select("id");
  if (insertError) {
    return { success: false, error: insertError.message, created: 0, skipped: already.size };
  }
  revalidatePath("/dashboard/flashcards");
  revalidatePath("/dashboard/mistake-notebook");
  return {
    success: true,
    created: inserted?.length ?? 0,
    skipped: reviews.length - rows.length + already.size,
  };
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

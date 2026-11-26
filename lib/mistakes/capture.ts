// The notebook's writer.
//
// Until now nothing in the app inserted into `mistake_reviews`: the recovery
// page had classification, mastery and flashcard plumbing and no data to run it
// on, so a student who missed twenty questions saw an empty notebook. This is
// the seam that fills it — called from the one recording path every surface
// funnels through (`app/actions/practice.ts`), scheduled after the response so
// a bookkeeping row never delays the answer on screen.
//
// Rules it keeps:
//  - one row per (student, question) with no attempt attached, so re-missing the
//    same question refreshes the row instead of piling up duplicates;
//  - a fresh miss clears mastery — the question is, by definition, not mastered;
//  - every failure is swallowed. The notebook is a layer on top of practice, and
//    practice must never fail because the notebook's table is missing.

import { deriveClassification } from "@/lib/mistakes/classification";
import type { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/** A wrong answer slower than this reads as a knowledge gap, not a slip. */
const SLOW_ANSWER_SECONDS = 90;

export async function captureWrongAnswer(
  supabase: ServerClient,
  studentId: string,
  questionId: string,
  timeSpentSeconds?: number | null
): Promise<void> {
  try {
    const classification =
      deriveClassification({
        correct: false,
        slow: typeof timeSpentSeconds === "number" && timeSpentSeconds >= SLOW_ANSWER_SECONDS,
      }) ?? "incorrect";
    const now = new Date().toISOString();

    const { data: existing } = await supabase
      .from("mistake_reviews")
      .select("id")
      .eq("student_id", studentId)
      .eq("question_id", questionId)
      .is("attempt_id", null)
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("mistake_reviews")
        .update({
          classification,
          mastered: false,
          mastered_at: null,
          updated_at: now,
        })
        .eq("id", existing.id)
        .eq("student_id", studentId);
      return;
    }

    await supabase.from("mistake_reviews").insert({
      student_id: studentId,
      question_id: questionId,
      attempt_id: null,
      classification,
      updated_at: now,
    });
  } catch {
    /* notebook is optional; the attempt is already recorded */
  }
}

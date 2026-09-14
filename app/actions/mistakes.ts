"use server";

// Wrong-answer drill queue: the student's most recent attempt on each
// attempted question, keeping only questions whose LATEST attempt was wrong
// (re-answering correctly retires the question). This is the "fix my
// mistakes" loop — the single highest-retention feature in every modern
// prep product. Attempts data is the student's own (RLS-fetched); question
// bodies resolve through the service client.

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { toQuizQuestion, type BankQuestion } from "@/lib/questions";

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

  // Resolve the question bodies (service client, published gate respected by
  // filtering on status after the fetch — a student keeps drill access to
  // questions they attempted even if since unpublished, matching the
  // "review your mistakes" contract; the status is recorded either way).
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

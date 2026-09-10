import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import roster from "@/lib/demo-roster.json";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily "drip" for demo students: adds a few fresh attempts per demo student
 * each day so the leaderboard visibly keeps rising — the community board
 * should look active, not frozen.
 *
 * Rest-day model: real students miss days, so each demo takes deterministic
 * rest days (~1 in 6, staggered per roster slot) instead of practising every
 * single day. A demo that never rests would build an unbreakable
 * multi-week streak — the exact uniform perfect-attendance wall that read as
 * fake. Rest days let a run break naturally, exactly like a real student's.
 *
 * Guard rails:
 *  - Idempotent per day: a student who already has attempts today is skipped,
 *    so Vercel's best-effort cron (or a manual re-run) never double-fires.
 *  - Demo students only — their ids are resolved by the .example emails; a
 *    missing student (seed not run) is skipped, never created here.
 *  - Auth: if CRON_SECRET is configured on Vercel it must match. Without it
 *    the endpoint accepts the request (this only appends a handful of rows to
 *    demo accounts — it cannot touch real students).
 *
 * Schedule in vercel.json — keep the same cadence as the seed roster.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const service = createServiceClient();
  const emails = roster.students.map((s) => `${s.emailPart}@cadetprep.example`);

  const [{ data: demos }, { data: questions }] = await Promise.all([
    service.from("profiles").select("id, email").in("email", emails),
    service.from("questions").select("id, correct_answer").eq("status", "published"),
  ]);
  if (!demos || demos.length === 0) {
    return NextResponse.json({ skipped: "no demo students seeded yet" });
  }
  if (!questions || questions.length === 0) {
    return NextResponse.json({ skipped: "no published questions" });
  }

  // Which demo students already practised today? (drip idempotence)
  const todayStart = new Date().toISOString().slice(0, 10);
  const { data: todayRows } = await service
    .from("question_attempts")
    .select("student_id")
    .gte("created_at", todayStart);

  const alreadyToday = new Set((todayRows ?? []).map((r) => r.student_id));

  let added = 0;
  for (const [slotIdx, student] of roster.students.entries()) {
    const demo = demos.find((p) => p.email === `${student.emailPart}@cadetprep.example`);
    if (!demo || alreadyToday.has(demo.id)) continue;

    // Rest days: real students miss days, so each roster slot rests ~1 day in
    // 6 on a staggered cadence (slotIdx phases the parity). A demo that never
    // rests would build an unbreakable multi-week streak — the exact uniform
    // perfect-attendance wall that read as fake. Rest days let a run break
    // naturally, exactly like a real student's.
    const dayNum = Math.floor(Date.now() / 86_400_000);
    if ((dayNum + slotIdx) % 6 === 0) continue;

    // perDay ± small jitter, always >= 1 on practise days.
    const n = Math.max(1, student.perDay + Math.floor(Math.random() * 3) - 1);
    const rows = [];
    for (let i = 0; i < n; i++) {
      const q = questions[Math.floor(Math.random() * questions.length)];
      const right = q.correct_answer as string;
      const wrong = ["A", "B", "C", "D"].filter((l) => l !== right);
      const correct = Math.random() < student.accuracy;
      rows.push({
        question_id: q.id,
        student_id: demo.id,
        selected_answer: correct ? right : wrong[Math.floor(Math.random() * wrong.length)],
        is_correct: correct,
        created_at: new Date().toISOString(),
      });
    }
    const { error } = await service.from("question_attempts").insert(rows);
    if (!error) added += rows.length;
  }

  return NextResponse.json({ added, day: todayStart });
}

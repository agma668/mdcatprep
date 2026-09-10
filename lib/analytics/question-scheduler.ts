import { createClient } from "@/lib/supabase/server";
import { fetchPublishedQuestions } from "@/lib/questions-repo";
import type { QuizQuestion } from "@/lib/questions";
import { dayKey, pct } from "./date-utils";

interface AttemptHistory {
  questionId: string;
  isCorrect: boolean;
  createdAt: Date;
}

/**
 * Adaptive question scheduler that prioritizes weak areas and ensures variety.
 * Returns questions ordered by: weak topics first, then unseen, then random.
 */
export async function fetchAdaptiveQuestions(
  userId: string,
  filters: {
    subject?: string;
    topic?: string;
    difficulty?: string;
  },
  limit: number
): Promise<QuizQuestion[]> {
  const supabase = await createClient();

  // 1. Fetch all published questions matching the subject filter (topic and
  //    difficulty narrowing happen below — the repo owns the published gate
  //    and row shape, the scheduler owns adaptive ordering).
  const allPublished = await fetchPublishedQuestions(supabase, filters.subject ? { subject: filters.subject } : {});
  // The scheduler needs a row id to correlate attempt history — drop any row
  // that has none (repo rows always carry one, this is a belt-and-braces
  // guard) and narrow topic/difficulty here since the repo owns the publish
  // gate but the scheduler owns adaptive ordering.
  const allQuestions = allPublished.filter(
    (q): q is QuizQuestion & { id: string } =>
      !!q.id &&
      (!filters.topic || q.topic === filters.topic) &&
      (!filters.difficulty || q.difficulty === filters.difficulty)
  );

  if (allQuestions.length === 0) {
    return [];
  }

  // 2. Fetch student's attempt history for these questions. The in-list is
  //    chunked: a subject bank can run to 400+ published rows, and stuffing
  //    every id into one .in() URL blows past the ~16 KB request-header limit
  //    (node's HTTP client) and the edge's URL cap — the request then stalls
  //    ~10 s and dies, which is the whole page render stalling. Chunks of 150
  //    keep each URL ~6 KB; results concatenate in the same order.
  const questionIds = allQuestions.map((q) => q.id);
  const CHUNK = 150;
  const chunks: string[][] = [];
  for (let i = 0; i < questionIds.length; i += CHUNK) {
    chunks.push(questionIds.slice(i, i + CHUNK));
  }
  const attemptsPerChunk = await Promise.all(
    chunks.map((ids) =>
      supabase
        .from("question_attempts")
        .select("question_id, is_correct, created_at")
        .eq("student_id", userId)
        .in("question_id", ids)
        .order("created_at", { ascending: false })
    )
  );
  const attemptsData = attemptsPerChunk
    .flatMap((r) => r.data ?? [])
    // Each chunk is desc internally, but the flat concat isn't globally
    // ordered — restore it so the newest attempt per question wins below.
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

  // 3. Build attempt history map (most recent attempt per question)
  const attemptMap = new Map<string, AttemptHistory>();
  for (const a of attemptsData ?? []) {
    if (!attemptMap.has(a.question_id)) {
      attemptMap.set(a.question_id, {
        questionId: a.question_id,
        isCorrect: a.is_correct,
        createdAt: new Date(a.created_at),
      });
    }
  }

  // 4. Compute topic performance for prioritization
  const topicStats = new Map<string, { total: number; correct: number }>();
  for (const a of attemptsData ?? []) {
    const question = allQuestions.find((q) => q.id === a.question_id);
    if (!question?.topic) continue;
    const key = `${question.subject ?? ""} — ${question.topic}`;
    const stats = topicStats.get(key) ?? { total: 0, correct: 0 };
    stats.total += 1;
    if (a.is_correct) stats.correct += 1;
    topicStats.set(key, stats);
  }

  // 5. Score each question for priority
  const scoredQuestions = allQuestions.map((q) => {
    const attempt = attemptMap.get(q.id);
    const topicKey = q.topic ? `${q.subject ?? ""} — ${q.topic}` : null;
    const topicStatsData = topicKey ? topicStats.get(topicKey) : null;

    let score = 0;

    // Unseen questions get highest priority
    if (!attempt) {
      score += 100;
    } else {
      // Recently incorrect questions get high priority
      if (!attempt.isCorrect) {
        score += 80;
      }
      // Questions not seen in 7+ days get moderate priority
      const daysSinceAttempt = Math.floor(
        (Date.now() - attempt.createdAt.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (daysSinceAttempt >= 7) {
        score += 30;
      }
    }

    // Weak topics get priority boost
    if (topicStatsData) {
      const accuracy = pct(topicStatsData.correct, topicStatsData.total);
      if (accuracy < 60) {
        score += 50; // Weak topic
      } else if (accuracy < 80) {
        score += 25; // Moderate topic
      }
    }

    // Add small random factor for variety (0-10 points)
    score += Math.random() * 10;

    return { question: q, score };
  });

  // 6. Sort by score (highest first) and return top N.
  //
  // Freshness: a per-student adaptive session must not re-ask a question the
  // student already answered today (the same UTC dayKey the streak/goal logic
  // uses) — that is the "met this question on the daily quiz this morning"
  // repeat. The rule sits only at pick time, beneath the scoring, so
  // unseen-first and weak-topic ordering are untouched. When same-day
  // exclusions exhaust a thin pool, the session falls back to the normal
  // ranking rather than refusing to start (an honest session beats a stuck
  // one).
  scoredQuestions.sort((a, b) => b.score - a.score);
  const today = dayKey(new Date());
  const fresh = scoredQuestions.filter((sq) => {
    const attempt = attemptMap.get(sq.question.id);
    return !attempt || dayKey(attempt.createdAt) !== today;
  });
  if (fresh.length >= limit) {
    return fresh.slice(0, limit).map((sq) => sq.question);
  }
  const seenToday = scoredQuestions.filter((sq) => {
    const attempt = attemptMap.get(sq.question.id);
    return !!attempt && dayKey(attempt.createdAt) === today;
  });
  return [...fresh, ...seenToday].slice(0, limit).map((sq) => sq.question);
}

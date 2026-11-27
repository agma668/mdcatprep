// Which topics are actually costing marks, ranked from real attempts only.
//
// This is the maths behind /dashboard/plan. It deliberately does not use
// exam-weight guesses: the app has no verified per-topic weighting for most
// exams, so inventing one would make the order look authoritative when it is
// not. What is left is honest and explainable — how far below the target a
// topic sits, how much evidence backs that number, and how stale the evidence
// is.
//
// Pure on purpose: the page, the tests and any future surface read the same
// rule, and nothing here touches the database or the clock implicitly.

export interface AttemptLike {
  isCorrect: boolean;
  createdAt: Date;
  subject: string | null;
  topic: string | null;
}

/** The accuracy a topic is measured against. Not a pass mark for any exam. */
export const WEAK_AREA_TARGET_ACCURACY = 80;

/** Fewer attempts than this is a coin toss, not a weakness pattern. */
export const MIN_TOPIC_ATTEMPTS = 6;
export const MIN_SUBJECT_ATTEMPTS = 10;

/** Evidence stops adding confidence at this many attempts. */
const CONFIDENCE_FULL_ATTEMPTS = 20;

/** Freshness halves every this many days since the last attempt. */
const FRESHNESS_HALF_LIFE_DAYS = 30;

export interface WeakArea {
  scope: "topic" | "subject";
  subject: string;
  /** Null for a subject-level row. */
  topic: string | null;
  attempted: number;
  correct: number;
  accuracy: number;
  /** Percentage points below the target; always > 0 for a returned row. */
  gap: number;
  /** 0–1: how much the attempt count supports the accuracy. */
  confidence: number;
  /** 0–1: how recent the last attempt in this area is. */
  freshness: number;
  /** gap × confidence × freshness, one decimal. Ordering only. */
  score: number;
  daysSinceLastAttempt: number;
}

export interface WeakAreaReport {
  /** Every subject below target with enough evidence, weakest first. */
  subjects: WeakArea[];
  /** Every topic below target with enough evidence, weakest first. */
  topics: WeakArea[];
  /** Topic groups seen but too small to judge yet. */
  belowThresholdTopics: number;
  /** Attempts with no subject label, so they cannot be attributed at all. */
  unlabelledAttempts: number;
}

type Bucket = {
  subject: string;
  topic: string | null;
  attempted: number;
  correct: number;
  lastAttempt: number;
};

const DAY_MS = 86_400_000;

function accuracyOf(correct: number, attempted: number): number {
  return attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
}

function toWeakArea(
  bucket: Bucket,
  scope: WeakArea["scope"],
  now: number
): WeakArea | null {
  const accuracy = accuracyOf(bucket.correct, bucket.attempted);
  const gap = WEAK_AREA_TARGET_ACCURACY - accuracy;
  if (gap <= 0) return null;

  const daysSinceLastAttempt = Math.max(
    0,
    Math.floor((now - bucket.lastAttempt) / DAY_MS)
  );
  const confidence = Math.min(1, bucket.attempted / CONFIDENCE_FULL_ATTEMPTS);
  // 1 today, 0.5 after one half-life, 0.25 after two.
  const freshness = Math.pow(0.5, daysSinceLastAttempt / FRESHNESS_HALF_LIFE_DAYS);
  const score = Math.round(gap * confidence * freshness * 10) / 10;

  return {
    scope,
    subject: bucket.subject,
    topic: bucket.topic,
    attempted: bucket.attempted,
    correct: bucket.correct,
    accuracy,
    gap,
    confidence,
    freshness,
    score,
    daysSinceLastAttempt,
  };
}

function byScore(a: WeakArea, b: WeakArea): number {
  if (b.score !== a.score) return b.score - a.score;
  if (b.attempted !== a.attempted) return b.attempted - a.attempted;
  return a.subject.localeCompare(b.subject) || (a.topic ?? "").localeCompare(b.topic ?? "");
}

/**
 * Rank the student's weak areas from their own attempt history.
 *
 * A row is only returned when it has enough evidence AND sits below the target.
 * Anything else would be noise presented as a diagnosis. Attempts without a
 * subject are counted separately rather than dumped into an "Uncategorised"
 * row that would then be ranked as if it were a real subject.
 */
export function rankWeakAreas(
  attempts: readonly AttemptLike[],
  now: Date = new Date()
): WeakAreaReport {
  const nowMs = now.getTime();
  const subjects = new Map<string, Bucket>();
  const topics = new Map<string, Bucket>();
  let unlabelledAttempts = 0;

  for (const attempt of attempts) {
    const subject = attempt.subject?.trim();
    if (!subject) {
      unlabelledAttempts += 1;
      continue;
    }
    const at = attempt.createdAt.getTime();
    const timestamp = Number.isNaN(at) ? nowMs : at;

    const subjectBucket = subjects.get(subject) ?? {
      subject,
      topic: null,
      attempted: 0,
      correct: 0,
      lastAttempt: timestamp,
    };
    subjectBucket.attempted += 1;
    if (attempt.isCorrect) subjectBucket.correct += 1;
    subjectBucket.lastAttempt = Math.max(subjectBucket.lastAttempt, timestamp);
    subjects.set(subject, subjectBucket);

    const topic = attempt.topic?.trim();
    if (!topic) continue;
    const key = `${subject} :: ${topic}`;
    const topicBucket = topics.get(key) ?? {
      subject,
      topic,
      attempted: 0,
      correct: 0,
      lastAttempt: timestamp,
    };
    topicBucket.attempted += 1;
    if (attempt.isCorrect) topicBucket.correct += 1;
    topicBucket.lastAttempt = Math.max(topicBucket.lastAttempt, timestamp);
    topics.set(key, topicBucket);
  }

  let belowThresholdTopics = 0;
  const rankedTopics: WeakArea[] = [];
  for (const bucket of topics.values()) {
    if (bucket.attempted < MIN_TOPIC_ATTEMPTS) {
      belowThresholdTopics += 1;
      continue;
    }
    const row = toWeakArea(bucket, "topic", nowMs);
    if (row) rankedTopics.push(row);
  }

  const rankedSubjects: WeakArea[] = [];
  for (const bucket of subjects.values()) {
    if (bucket.attempted < MIN_SUBJECT_ATTEMPTS) continue;
    const row = toWeakArea(bucket, "subject", nowMs);
    if (row) rankedSubjects.push(row);
  }

  return {
    subjects: rankedSubjects.sort(byScore),
    topics: rankedTopics.sort(byScore),
    belowThresholdTopics,
    unlabelledAttempts,
  };
}

/** The drill URL for a weak area — the same route the subject page links to. */
export function drillHref(area: WeakArea, count = 10): string {
  if (area.scope === "topic" && area.topic) {
    return `/dashboard/practice/quiz?subject=${encodeURIComponent(
      area.subject
    )}&topic=${encodeURIComponent(area.topic)}&count=${count}`;
  }
  return `/dashboard/practice/${encodeURIComponent(area.subject)}`;
}

/** Human label for a row, used in the plan and the list. */
export function areaLabel(area: WeakArea): string {
  return area.topic ? `${area.subject} · ${area.topic}` : area.subject;
}

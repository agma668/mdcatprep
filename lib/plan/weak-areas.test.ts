// Unit tests for lib/plan/weak-areas.ts.
// Run with: node --import ./scripts/_jev-serveronly-hook.mjs --test lib/plan/weak-areas.test.ts

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  MIN_SUBJECT_ATTEMPTS,
  MIN_TOPIC_ATTEMPTS,
  WEAK_AREA_TARGET_ACCURACY,
  areaLabel,
  drillHref,
  rankWeakAreas,
  type AttemptLike,
} from './weak-areas.ts'

const NOW = new Date('2026-11-27T09:00:00Z')
const DAY = 86_400_000

function attempt(
  isCorrect: boolean,
  subject: string | null,
  topic: string | null,
  daysAgo = 1
): AttemptLike {
  return {
    isCorrect,
    subject,
    topic,
    createdAt: new Date(NOW.getTime() - daysAgo * DAY),
  }
}

function repeat(
  n: number,
  correct: number,
  subject: string,
  topic: string,
  daysAgo = 1
): AttemptLike[] {
  return Array.from({ length: n }, (_, i) => attempt(i < correct, subject, topic, daysAgo))
}

test('no attempts means no weak areas and no invented ones', () => {
  const report = rankWeakAreas([], NOW)
  assert.deepEqual(report.topics, [])
  assert.deepEqual(report.subjects, [])
  assert.equal(report.unlabelledAttempts, 0)
  assert.equal(report.belowThresholdTopics, 0)
})

test('topics below the evidence threshold are counted, not ranked', () => {
  const attempts = repeat(MIN_TOPIC_ATTEMPTS - 1, 0, 'Biology', 'Cell Structure')
  const report = rankWeakAreas(attempts, NOW)
  assert.deepEqual(report.topics, [])
  assert.equal(report.belowThresholdTopics, 1)
})

test('a topic at or above the target is not a weak area', () => {
  const attempts = repeat(MIN_TOPIC_ATTEMPTS + 4, 9, 'Chemistry', 'Bonding')
  const report = rankWeakAreas(attempts, NOW)
  assert.deepEqual(report.topics, [])
})

test('accuracy and gap are computed from the real answers', () => {
  const attempts = repeat(MIN_TOPIC_ATTEMPTS + 4, 2, 'Physics', 'Waves')
  const [area] = rankWeakAreas(attempts, NOW).topics
  assert.equal(area.attempted, MIN_TOPIC_ATTEMPTS + 4)
  assert.equal(area.correct, 2)
  assert.equal(area.accuracy, 20)
  assert.equal(area.gap, WEAK_AREA_TARGET_ACCURACY - 20)
})

test('subjects need their own evidence bar before they are ranked', () => {
  // Ten topic-level attempts spread over one subject that only reaches half
  // the subject threshold: the topic can be judged, the subject cannot.
  const attempts = repeat(MIN_SUBJECT_ATTEMPTS - 1, 0, 'Biology', 'Genetics')
  const report = rankWeakAreas(attempts, NOW)
  assert.equal(report.subjects.length, 0)
  assert.equal(report.topics.length, 1)
})

test('a bigger gap outranks a smaller one at the same evidence level', () => {
  const attempts = [
    ...repeat(10, 3, 'Biology', 'Genetics'), // 30%
    ...repeat(10, 6, 'Chemistry', 'Organic'), // 60%
  ]
  const [first, second] = rankWeakAreas(attempts, NOW).topics
  assert.equal(first.topic, 'Genetics')
  assert.equal(second.topic, 'Organic')
})

test('stale evidence ranks below fresh evidence with the same accuracy', () => {
  const attempts = [
    ...repeat(10, 5, 'Biology', 'Old topic', 120),
    ...repeat(10, 5, 'Biology', 'Fresh topic', 1),
  ]
  const [first, second] = rankWeakAreas(attempts, NOW).topics
  assert.equal(first.topic, 'Fresh topic')
  assert.equal(second.topic, 'Old topic')
  assert.ok(first.score > second.score)
})

test('attempts with no subject are counted, never bucketed as a fake subject', () => {
  const attempts = [
    attempt(false, null, null),
    attempt(false, '  ', null),
    ...repeat(MIN_TOPIC_ATTEMPTS, 1, 'Physics', 'Optics'),
  ]
  const report = rankWeakAreas(attempts, NOW)
  assert.equal(report.unlabelledAttempts, 2)
  assert.equal(report.topics.length, 1)
  assert.equal(report.topics[0].subject, 'Physics')
})

test('topic-less attempts still contribute to their subject row', () => {
  const attempts = [
    ...repeat(MIN_SUBJECT_ATTEMPTS, 4, 'English', 'Grammar'),
    attempt(false, 'English', null),
  ]
  const report = rankWeakAreas(attempts, NOW)
  assert.equal(report.subjects[0].attempted, MIN_SUBJECT_ATTEMPTS + 1)
})

test('drill links point at the real quiz route and encode the topic', () => {
  const attempts = repeat(10, 2, 'Biology', 'Cell & Membrane')
  const [area] = rankWeakAreas(attempts, NOW).topics
  const href = drillHref(area)
  assert.match(href, /^\/dashboard\/practice\/quiz\?/)
  assert.match(href, /subject=Biology/)
  assert.match(href, /topic=Cell%20%26%20Membrane/)
  assert.match(href, /count=10/)
})

test('a subject row links to the subject page instead of the quiz route', () => {
  const attempts = repeat(12, 2, 'English', '', 3)
  const report = rankWeakAreas(attempts, NOW)
  assert.equal(report.subjects.length, 1)
  assert.equal(drillHref(report.subjects[0]), '/dashboard/practice/English')
  assert.equal(areaLabel(report.subjects[0]), 'English')
})

test('areaLabel names both halves of a topic row', () => {
  const attempts = repeat(10, 2, 'Physics', 'Waves')
  const [area] = rankWeakAreas(attempts, NOW).topics
  assert.equal(areaLabel(area), 'Physics · Waves')
})

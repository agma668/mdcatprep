// Unit tests for lib/plan/daily-plan.ts.
// Run with: node --import ./scripts/_jev-serveronly-hook.mjs --test lib/plan/daily-plan.test.ts

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildDailyPlan } from './daily-plan.ts'
import type { WeakArea } from './weak-areas.ts'

function area(overrides: Partial<WeakArea> = {}): WeakArea {
  return {
    scope: 'topic',
    subject: 'Biology',
    topic: 'Genetics',
    attempted: 12,
    correct: 4,
    accuracy: 33,
    gap: 47,
    confidence: 0.6,
    freshness: 0.9,
    score: 25.4,
    daysSinceLastAttempt: 2,
    ...overrides,
  }
}

const EMPTY = {
  weakAreas: [] as WeakArea[],
  dueMistakes: 0,
  dueCards: 0,
  daysToGoal: null as number | null,
  hasAttempts: false,
}

test('no data produces one honest starting task, not a fake plan', () => {
  const plan = buildDailyPlan(EMPTY)
  assert.equal(plan.tasks.length, 1)
  assert.equal(plan.tasks[0].kind, 'start')
  assert.match(plan.headline, /1 task/)
  assert.equal(plan.totalMinutes, plan.tasks[0].minutes)
})

test('due mistakes come before due cards, and both before a drill', () => {
  const plan = buildDailyPlan({
    ...EMPTY,
    hasAttempts: true,
    dueMistakes: 4,
    dueCards: 12,
    weakAreas: [area()],
  })
  assert.deepEqual(
    plan.tasks.map((t) => t.kind),
    ['mistakes', 'cards', 'drill']
  )
})

test('the total is the sum of the tasks, never a separate estimate', () => {
  const plan = buildDailyPlan({
    ...EMPTY,
    hasAttempts: true,
    dueMistakes: 3,
    dueCards: 20,
    weakAreas: [area()],
  })
  assert.equal(
    plan.totalMinutes,
    plan.tasks.reduce((sum, t) => sum + t.minutes, 0)
  )
})

test('at most two weak-area drills are planned', () => {
  const plan = buildDailyPlan({
    ...EMPTY,
    hasAttempts: true,
    weakAreas: [area(), area({ topic: 'Waves', subject: 'Physics' }), area({ topic: 'Bonding', subject: 'Chemistry' })],
  })
  assert.equal(plan.tasks.filter((t) => t.kind === 'drill').length, 2)
})

test('a mock is added inside the two-week window, not outside it', () => {
  const inside = buildDailyPlan({ ...EMPTY, hasAttempts: true, daysToGoal: 9 })
  assert.ok(inside.tasks.some((t) => t.kind === 'mock'))

  const outside = buildDailyPlan({ ...EMPTY, hasAttempts: true, daysToGoal: 30 })
  assert.ok(!outside.tasks.some((t) => t.kind === 'mock'))

  const passed = buildDailyPlan({ ...EMPTY, hasAttempts: true, daysToGoal: -2 })
  assert.ok(!passed.tasks.some((t) => t.kind === 'mock'))
})

test('a large due queue is capped so the plan stays a plan', () => {
  const plan = buildDailyPlan({ ...EMPTY, hasAttempts: true, dueMistakes: 120, dueCards: 400 })
  const mistakes = plan.tasks.find((t) => t.kind === 'mistakes')!
  const cards = plan.tasks.find((t) => t.kind === 'cards')!
  assert.equal(mistakes.minutes, 30)
  assert.equal(cards.minutes, 25)
})

test('a single due item gets a workable minimum, not a zero-minute task', () => {
  const plan = buildDailyPlan({ ...EMPTY, hasAttempts: true, dueMistakes: 1, dueCards: 1 })
  const mistakes = plan.tasks.find((t) => t.kind === 'mistakes')!
  const cards = plan.tasks.find((t) => t.kind === 'cards')!
  assert.equal(mistakes.minutes, 5)
  assert.equal(cards.minutes, 3)
})

test('a subject drill is skipped when one of its topics is already planned', () => {
  const plan = buildDailyPlan({
    ...EMPTY,
    hasAttempts: true,
    weakAreas: [
      area({ scope: 'topic', subject: 'Biology', topic: 'Genetics' }),
      area({ scope: 'subject', subject: 'Biology', topic: null }),
      area({ scope: 'subject', subject: 'Physics', topic: null }),
    ],
  })
  const drills = plan.tasks.filter((t) => t.kind === 'drill')
  assert.equal(drills.length, 2)
  assert.match(drills[0].href, /topic=Genetics/)
  assert.match(drills[1].href, /Physics/)
  assert.ok(!drills.some((d) => d.href === '/dashboard/practice/Biology'))
})

test('drill links carry the subject and topic into the quiz route', () => {
  const plan = buildDailyPlan({ ...EMPTY, hasAttempts: true, weakAreas: [area()] })
  const drill = plan.tasks.find((t) => t.kind === 'drill')!
  assert.match(drill.href, /subject=Biology/)
  assert.match(drill.href, /topic=Genetics/)
})

test('the note tells the truth about what the minutes are', () => {
  const withHistory = buildDailyPlan({ ...EMPTY, hasAttempts: true, dueCards: 5 })
  assert.match(withHistory.note, /estimate/i)

  const withoutHistory = buildDailyPlan(EMPTY)
  assert.match(withoutHistory.note, /not a diagnosis/i)
})

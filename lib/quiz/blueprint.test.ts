// Unit tests for lib/quiz/blueprint.ts.
// Run with: node --import ./scripts/_jev-serveronly-hook.mjs --test lib/quiz/blueprint.test.ts

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  allocateSections,
  buildQuizPlan,
  customBlueprint,
  isBlueprintValid,
  selectQuestionsForPlan,
  validateBlueprint,
  type QuizBlueprint,
} from './blueprint.ts'

// A synthetic fixture — clearly not an official exam pattern. Tests must not
// depend on any unverified real-world blueprint.
const FIXTURE: QuizBlueprint = {
  id: 'fixture',
  examId: 'fixture-exam',
  variantId: 'fixture-variant',
  version: '1',
  verified: false,
  sections: [
    { subject: 'Mathematics', weight: 50 },
    { subject: 'Physics', weight: 30 },
    { subject: 'English', weight: 20 },
  ],
}

test('largest-remainder allocation sums exactly to the requested total', () => {
  const sections = allocateSections(FIXTURE.sections, 100)
  assert.deepEqual(
    sections.map((s) => s.count),
    [50, 30, 20]
  )
})

test('allocation handles totals that do not divide evenly', () => {
  const sections = allocateSections(FIXTURE.sections, 7)
  const sum = sections.reduce((a, s) => a + s.count, 0)
  assert.equal(sum, 7)
  // Physics (30%) gets the single leftover after 3.5/2.1/1.4 flooring.
  assert.deepEqual(
    sections.map((s) => s.count),
    [4, 2, 1]
  )
})

test('allocation is stable for equal weights (section order breaks ties)', () => {
  const equal = [
    { subject: 'A', weight: 1 },
    { subject: 'B', weight: 1 },
    { subject: 'C', weight: 1 },
  ]
  const first = allocateSections(equal, 4).map((s) => s.count)
  const second = allocateSections(equal, 4).map((s) => s.count)
  assert.deepEqual(first, second)
  assert.equal(first.reduce((a, b) => a + b, 0), 4)
})

test('availability clamps a section and marks the plan incomplete', () => {
  const plan = buildQuizPlan(FIXTURE, 100, { Mathematics: 10 })
  const math = plan.sections.find((s) => s.subject === 'Mathematics')!
  assert.equal(math.count, 10)
  assert.equal(plan.complete, false)
  assert.ok(plan.totalAllocated < plan.totalRequested)
})

test('a fully available blueprint is complete', () => {
  const plan = buildQuizPlan(FIXTURE, 20, { Mathematics: 100, Physics: 100, English: 100 })
  assert.equal(plan.complete, true)
  assert.equal(plan.totalAllocated, 20)
})

test('validation rejects empty, duplicate, non-positive and identity-less blueprints', () => {
  assert.equal(validateBlueprint(FIXTURE).ok, true)

  const noSections = { ...FIXTURE, sections: [] }
  assert.equal(validateBlueprint(noSections).ok, false)

  const dup = {
    ...FIXTURE,
    sections: [
      { subject: 'Math', weight: 1 },
      { subject: 'Math', weight: 1 },
    ],
  }
  assert.equal(validateBlueprint(dup).ok, false)

  const zeroWeight = { ...FIXTURE, sections: [{ subject: 'Math', weight: 0 }] }
  assert.equal(validateBlueprint(zeroWeight).ok, false)

  const noId = { ...FIXTURE, id: '' }
  assert.equal(validateBlueprint(noId).ok, false)
})

test('question selection fills sections without duplicates', () => {
  const plan = buildQuizPlan(
    {
      ...FIXTURE,
      sections: [
        { subject: 'Mathematics', weight: 1 },
        { subject: 'Physics', weight: 1 },
      ],
    },
    4
  )
  const pool = [
    { id: 'm1', subject: 'Mathematics' },
    { id: 'm2', subject: 'Mathematics' },
    { id: 'm3', subject: 'Mathematics' },
    { id: 'p1', subject: 'Physics' },
    { id: 'p2', subject: 'Physics' },
  ]
  const { ids, shortfall } = selectQuestionsForPlan(plan, pool)
  assert.equal(ids.length, 4)
  assert.equal(new Set(ids).size, 4)
  assert.equal(shortfall.length, 0)
  assert.deepEqual(ids, ['m1', 'm2', 'p1', 'p2'])
})

test('question selection reports shortfall when the pool is too small', () => {
  const plan = buildQuizPlan(FIXTURE, 10)
  const pool = [{ id: 'm1', subject: 'Mathematics' }]
  const { ids, shortfall } = selectQuestionsForPlan(plan, pool)
  assert.equal(ids.length, 1)
  assert.ok(shortfall.some((s) => s.subject === 'Physics'))
})

test('topic-scoped sections only take matching topics', () => {
  const plan = buildQuizPlan(customBlueprint([{ subject: 'Biology', topic: 'Genetics', weight: 1 }]), 2)
  const pool = [
    { id: 'g1', subject: 'Biology', topic: 'Genetics' },
    { id: 'g2', subject: 'Biology', topic: 'Genetics' },
    { id: 'c1', subject: 'Biology', topic: 'Cell' },
  ]
  const { ids } = selectQuestionsForPlan(plan, pool)
  assert.deepEqual(ids, ['g1', 'g2'])
})

test('custom blueprints are valid but marked unverified', () => {
  const bp = customBlueprint([{ subject: 'Chemistry', weight: 1 }])
  assert.equal(isBlueprintValid(bp), true)
  assert.equal(bp.verified, false)
  assert.equal(bp.id, 'custom')
})

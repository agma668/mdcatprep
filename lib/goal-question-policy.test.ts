import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isDeliverablePublicSampleMapping,
  toSafeGoalQuestion,
  type GoalScope,
  type QuestionMapping,
  type QuestionRecord,
} from './goal-question-policy.ts'

const goal: GoalScope = {
  id: 'goal-1',
  student_id: 'student-1',
  exam_id: 'pmdc-mdcat',
  variant_id: 'pmdc-mdcat-2026',
  status: 'active',
}

const mapping: QuestionMapping = {
  question_id: 'question-1',
  exam_id: 'pmdc-mdcat',
  variant_id: 'pmdc-mdcat-2026',
  access_level: 'public_sample',
  review_state: 'approved',
}

test('allows an approved public sample for the exact active goal variant', () => {
  assert.equal(isDeliverablePublicSampleMapping(mapping, goal), true)
})

test('rejects mappings for a different exam or variant', () => {
  assert.equal(isDeliverablePublicSampleMapping({ ...mapping, exam_id: 'pma-long-course' }, goal), false)
  assert.equal(isDeliverablePublicSampleMapping({ ...mapping, variant_id: 'pmdc-mdcat-2025' }, goal), false)
})

test('rejects inactive goals, unreviewed mappings and non-public access levels', () => {
  assert.equal(isDeliverablePublicSampleMapping(mapping, { ...goal, status: 'paused' }), false)
  assert.equal(isDeliverablePublicSampleMapping({ ...mapping, review_state: 'pending' }, goal), false)
  assert.equal(isDeliverablePublicSampleMapping({ ...mapping, access_level: 'goal_access' }, goal), false)
  assert.equal(isDeliverablePublicSampleMapping({ ...mapping, access_level: 'admin_draft' }, goal), false)
})

test('safe question DTO never contains the answer key or explanation', () => {
  const row: QuestionRecord = {
    id: 'question-1',
    subject: 'Biology',
    topic: 'Cell biology',
    question_text: 'Sample question?',
    option_a: 'A',
    option_b: 'B',
    option_c: 'C',
    option_d: 'D',
    correct_answer: 'C',
    explanation: 'Private explanation',
    difficulty: 'medium',
    college: 'MDCAT',
  }

  const safe = toSafeGoalQuestion(row)
  assert.equal('correct_answer' in safe, false)
  assert.equal('explanation' in safe, false)
  assert.deepEqual(Object.keys(safe).sort(), [
    'college', 'difficulty', 'id', 'option_a', 'option_b', 'option_c',
    'option_d', 'question_text', 'subject', 'topic',
  ])
})

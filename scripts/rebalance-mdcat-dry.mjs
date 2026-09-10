// Dry-run the MDCAT bank rebalance in memory and print the projection.
import { MDCAT_QUESTIONS } from '../lib/mdcat.ts'
import {
  LETTERS,
  answerLetter,
  distribution,
  explanationMentionsLetter,
  letterIndex,
  questionSeed,
  rebalanceQuestionTo,
} from './answer-shuffle.mjs'

const questions = MDCAT_QUESTIONS
const total = questions.length
const base = Math.floor(total / 4)
const rem = total - base * 4
const current = distribution(questions)
console.log('current:', JSON.stringify(current))
const target = Object.fromEntries(LETTERS.map((l) => [l, base]))
for (const l of [...LETTERS].sort((a, b) => current[a] - current[b] || (a < b ? -1 : 1)).slice(0, rem)) target[l]++
console.log('target:', JSON.stringify(target))

const movable = []
const fixed = []
for (const q of questions) {
  const cur = letterIndex(answerLetter(q))
  const opts = [q.option_a, q.option_b, q.option_c, q.option_d]
  if (cur < 0 || !opts[cur] || explanationMentionsLetter(q)) fixed.push(q)
  else movable.push(q)
}
console.log('fixed:', fixed.length, 'movable:', movable.length)

const budget = { ...target }
for (const q of fixed) budget[answerLetter(q)]--

const assignments = new Map()
for (const q of movable.sort((a, b) => questionSeed(a) - questionSeed(b))) {
  const cur = letterIndex(answerLetter(q))
  let t = LETTERS[cur]
  if (budget[t] <= 0) t = [...LETTERS].sort((a, b) => budget[b] - budget[a] || (a < b ? -1 : 1))[0]
  budget[t]--
  const layout = rebalanceQuestionTo(q, letterIndex(t))
  if (!layout) continue
  assignments.set(q.question_text, layout)
}
console.log('assignments:', assignments.size, 'budget left:', JSON.stringify(budget))

const dist = { A: 0, B: 0, C: 0, D: 0 }
for (const q of questions) {
  const a = assignments.get(q.question_text)
  dist[a ? a.correct_answer : answerLetter(q)]++
}
console.log('projected distribution:', JSON.stringify(dist))

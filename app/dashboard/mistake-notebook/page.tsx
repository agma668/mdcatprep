import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { MistakeNotebookClient } from './MistakeNotebookClient'

export const metadata: Metadata = { title: 'Mistake Notebook' }
export const dynamic = 'force-dynamic'

export default async function MistakeNotebookPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all wrong answers with full question details
  const { data: mistakes, error } = await supabase
    .from('question_attempts')
    .select(`
      id,
      selected_answer,
      created_at,
      questions (
        id,
        subject,
        topic,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        explanation,
        difficulty
      )
    `)
    .eq('student_id', user.id)
    .eq('is_correct', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching mistakes:', error)
  }

  // Flatten the nested question data
  // PostgREST returns to-one embeds as either an object or a single-element array.
  type QuestionData = {
    id: string
    subject: string | null
    topic: string | null
    question_text: string
    option_a: string | null
    option_b: string | null
    option_c: string | null
    option_d: string | null
    correct_answer: string
    explanation: string | null
    difficulty: string | null
  }

  type RawMistake = {
    id: string
    selected_answer: string
    created_at: string
    questions: QuestionData | QuestionData[] | null
  }

  const raw = (mistakes ?? []) as unknown as RawMistake[]
  const flatMistakes = raw
    .filter(m => {
      if (!m.questions) return false
      return Array.isArray(m.questions) ? m.questions.length > 0 : true
    })
    .map(m => {
      const q = Array.isArray(m.questions) ? m.questions[0] : m.questions!
      return {
        id: m.id,
        selected_answer: m.selected_answer,
        created_at: m.created_at,
        subject: q.subject ?? 'Uncategorized',
        topic: q.topic ?? null,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        question_id: q.id,
      }
    })

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      <PageHeader
        eyebrow="Learn from mistakes"
        title="Mistake Notebook"
        description="Every question you got wrong is saved here. Review your mistakes to improve."
      />
      <MistakeNotebookClient mistakes={flatMistakes} />
    </div>
  )
}

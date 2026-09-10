'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import {
  createQuestion,
  updateQuestion,
  setQuestionStatus,
  deleteQuestion,
} from '@/app/actions/questions'
import { CCH_SUBJECT_NAMES } from '@/lib/subjects'

type Question = {
  id: string
  subject: string | null
  topic: string | null
  question_text: string
  option_a: string | null
  option_b: string | null
  option_c: string | null
  option_d: string | null
  correct_answer: string | null
  explanation: string | null
  difficulty: string | null
  college: string | null
  status: string
  source: string
  created_at: string
  updated_at: string | null
}

const statusVariant: Record<string, 'success' | 'warning' | 'neutral'> = {
  published: 'success',
  draft: 'warning',
  archived: 'neutral',
}

const inputCls =
  'w-full px-4 py-2 border border-white/10 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white/[0.06] text-white placeholder:text-white/30'

const emptyForm = {
  subject: '',
  topic: '',
  question_text: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'A',
  explanation: '',
  difficulty: '',
  college: '',
}

export function QuestionManager({
  initialQuestions,
  subjects,
  topics,
  difficulties,
}: {
  initialQuestions: Question[]
  subjects: string[]
  topics: string[]
  difficulties: string[]
}) {
  const router = useRouter()
  const [questions, setQuestions] = useState(initialQuestions)
  // Pick up fresh data after router.refresh() re-renders this server page.
  // Reset during render (tracking the last-seen prop) instead of in an
  // effect — same result, no cascading re-render.
  const [prevQuestions, setPrevQuestions] = useState(initialQuestions)
  if (prevQuestions !== initialQuestions) {
    setPrevQuestions(initialQuestions)
    setQuestions(initialQuestions)
  }

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Question | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const setField = (key: keyof typeof emptyForm, value: string) =>
    setForm(f => ({ ...f, [key]: value }))

  const openCreate = () => {
    setForm(emptyForm)
    setError(null)
    setCreateOpen(true)
  }

  const openEdit = (q: Question) => {
    setForm({
      subject: q.subject || '',
      topic: q.topic || '',
      question_text: q.question_text,
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_answer: q.correct_answer || 'A',
      explanation: q.explanation || '',
      difficulty: q.difficulty || '',
      college: q.college || '',
    })
    setError(null)
    setEditTarget(q)
  }

  const submitCreate = async (publish: boolean) => {
    setBusy(true)
    setError(null)
    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => formData.set(key, value))
    const result = await createQuestion(formData, publish ? 'published' : 'draft')
    setBusy(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    setCreateOpen(false)
    router.refresh()
  }

  const submitEdit = async () => {
    if (!editTarget) return
    setBusy(true)
    setError(null)
    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => formData.set(key, value))
    const result = await updateQuestion(editTarget.id, formData)
    setBusy(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    setEditTarget(null)
    router.refresh()
  }

  const runStatus = async (id: string, status: string) => {
    setBusyId(id)
    const result = await setQuestionStatus(id, status)
    setBusyId(null)
    if (result?.error) alert(result.error)
    else router.refresh()
  }

  const runDelete = async (id: string) => {
    if (!confirm('Delete this question permanently? This cannot be undone.')) return
    setBusyId(id)
    const result = await deleteQuestion(id)
    setBusyId(null)
    if (result?.error) alert(result.error)
    else router.refresh()
  }

  const FormFields = (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-500/10 text-rose-400 text-sm rounded-[var(--radius-md)] border border-rose-500/25">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Subject *
          </label>
          <select
            value={form.subject}
            onChange={e => setField('subject', e.target.value)}
            className={inputCls}
          >
            <option value="" disabled>
              Select a subject…
            </option>
            {CCH_SUBJECT_NAMES.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            {subjects
              .filter(s => !CCH_SUBJECT_NAMES.includes(s))
              .map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Topic
          </label>
          <input
            type="text"
            list="question-topics"
            value={form.topic}
            onChange={e => setField('topic', e.target.value)}
            className={inputCls}
            placeholder="Motion"
          />
          <datalist id="question-topics">
            {topics.map(t => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Question text *
        </label>
        <textarea
          value={form.question_text}
          onChange={e => setField('question_text', e.target.value)}
          rows={3}
          className={inputCls}
          placeholder="What is the acceleration due to gravity on Earth's surface?"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['A', 'B', 'C', 'D'] as const).map(letter => (
          <div key={letter}>
            <label className="block text-sm font-medium text-white mb-1">
              Option {letter} {letter === 'A' || letter === 'B' ? '*' : ''}
            </label>
            <input
              type="text"
              value={form[`option_${letter.toLowerCase()}` as keyof typeof form] as string}
              onChange={e =>
                setField(`option_${letter.toLowerCase()}` as keyof typeof emptyForm, e.target.value)
              }
              className={inputCls}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Correct answer *
          </label>
          <select
            value={form.correct_answer}
            onChange={e => setField('correct_answer', e.target.value)}
            className={inputCls}
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Difficulty
          </label>
          <input
            type="text"
            list="question-difficulties"
            value={form.difficulty}
            onChange={e => setField('difficulty', e.target.value)}
            className={inputCls}
            placeholder="easy / medium / hard"
          />
          <datalist id="question-difficulties">
            {difficulties.map(d => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            College
          </label>
          <input
            type="text"
            value={form.college}
            onChange={e => setField('college', e.target.value)}
            className={inputCls}
            placeholder="CCH"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Explanation
        </label>
        <textarea
          value={form.explanation}
          onChange={e => setField('explanation', e.target.value)}
          rows={2}
          className={inputCls}
          placeholder="Why is the correct answer correct?"
        />
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" onClick={openCreate}>
          + New Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-10 text-center">
          <p className="text-4xl mb-3" aria-hidden="true">📝</p>
          <p className="text-white/70">
            No questions found. Create your first MCQ.
          </p>
        </div>
      ) : (
        <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.04] border-b border-white/10">
                  <th className="p-4 font-semibold text-sm text-white/70">Question</th>
                  <th className="p-4 font-semibold text-sm text-white/70">Subject / Topic</th>
                  <th className="p-4 font-semibold text-sm text-white/70">Answer</th>
                  <th className="p-4 font-semibold text-sm text-white/70">Difficulty</th>
                  <th className="p-4 font-semibold text-sm text-white/70">Status</th>
                  <th className="p-4 font-semibold text-sm text-white/70 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map(q => (
                  <tr key={q.id} className="border-b border-white/10 hover:bg-white/[0.04] transition-colors align-top">
                    <td className="p-4 max-w-md">
                      <p className="font-medium text-white line-clamp-2">
                        {q.question_text}
                      </p>
                      <p className="text-xs text-white/45 mt-1">
                        Source: {q.source || 'admin'} · Updated{' '}
                        {new Date(q.updated_at || q.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{q.subject || '—'}</p>
                      <p className="text-xs text-white/45">{q.topic || '—'}</p>
                    </td>
                    <td className="p-4 font-semibold text-[var(--color-primary)]">
                      {q.correct_answer}
                    </td>
                    <td className="p-4 text-white/70">
                      {q.difficulty ? q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1) : '—'}
                    </td>
                    <td className="p-4">
                      <Badge variant={statusVariant[q.status] ?? 'neutral'}>
                        {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => openEdit(q)} disabled={busyId === q.id}>
                          Edit
                        </Button>
                        {q.status === 'draft' && (
                          <Button variant="primary" size="sm" onClick={() => runStatus(q.id, 'published')} disabled={busyId === q.id}>
                            Publish
                          </Button>
                        )}
                        {q.status === 'published' && (
                          <Button variant="secondary" size="sm" onClick={() => runStatus(q.id, 'draft')} disabled={busyId === q.id}>
                            Unpublish
                          </Button>
                        )}
                        {q.status !== 'archived' && (
                          <Button variant="ghost" size="sm" onClick={() => runStatus(q.id, 'archived')} disabled={busyId === q.id}>
                            Archive
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => runDelete(q.id)}
                          disabled={busyId === q.id}
                          className="text-rose-400 hover:bg-rose-500/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} size="lg">
        <ModalHeader
          title="New Question"
          description="Admin-created questions use source = admin. Save as draft or publish immediately."
        />
        <ModalBody>{FormFields}</ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => submitCreate(false)} disabled={busy}>
            Save Draft
          </Button>
          <Button variant="primary" onClick={() => submitCreate(true)} disabled={busy}>
            {busy ? 'Saving...' : 'Publish'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit modal */}
      <Modal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} size="lg">
        <ModalHeader title="Edit Question" description="Changes take effect for students immediately if the question is published." />
        <ModalBody>{FormFields}</ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setEditTarget(null)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitEdit} disabled={busy}>
            {busy ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

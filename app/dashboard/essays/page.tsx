import type { Metadata } from 'next'
import { TrackedLink } from '@/components/TrackedLink'
import { Check } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { CompositionGenerator } from './CompositionGenerator'

export const metadata: Metadata = { title: 'Essays & Stories' }

// Timed composition/story drills — bonus writing practice that sharpens the
// Q.6 asks for a composition of about 200–250 words on ANY ONE of the given
// topics. Topics can be quote-based essays, opinion/descriptive essays, or a
// story that must continue from a given opening line.

const QUOTE_ESSAYS = [
  {
    topic: 'Not failure, but low aim is crime',
    hint: 'An actual entry-test topic. Argue that aiming low — not falling short — is the real mistake, and support it with examples.',
  },
  {
    topic: 'Honesty is the best policy',
    hint: 'Classic moral essay. Give a short example or story and explain why honesty wins in the long run.',
  },
  {
    topic: 'All that glitters is not gold',
    hint: 'Explain that appearances can deceive; support with a real-life or historical example.',
  },
  {
    topic: 'Knowledge is power',
    hint: 'Show how education and knowledge give people the ability to shape their lives and society.',
  },
  {
    topic: 'Time and tide wait for none',
    hint: 'Write about the value of time, punctuality, and not procrastinating.',
  },
  {
    topic: 'Cleanliness is next to godliness',
    hint: 'Describe the importance of personal and public cleanliness in daily life.',
  },
]

const OPINION_DESCRIPTIVE = [
  {
    topic: 'What Would You Change in Your Country?',
    hint: 'A classic entry-test topic. Pick 2–3 concrete changes and explain why and how — keep it realistic.',
  },
  {
    topic: 'My Aim in Life',
    hint: 'A favourite entry-test topic. State your aim, why you chose it, and how you plan to achieve it.',
  },
  {
    topic: 'A Visit to a Place of Historical Importance',
    hint: 'Describe the place, what you saw and learned, and how it made you feel.',
  },
  {
    topic: 'My Favourite Personality',
    hint: 'Describe the person, their qualities, and what you have learned from them.',
  },
  {
    topic: 'The Value of Discipline in Student Life',
    hint: 'Explain why discipline matters for students and give examples from school or sports.',
  },
  {
    topic: 'My School / My College',
    hint: 'Describe your school, its facilities, teachers, and what makes it special to you.',
  },
]

const STORY_STARTS = [
  {
    start: 'Anderson jumped out of the rocket. He was on the soil of…',
    hint: 'An actual entry-test story opening. Continue the story with a clear plot, characters and an ending.',
  },
  {
    start: 'It was a dark and stormy night when Ali heard a knock at the door…',
    hint: 'Build suspense, describe the setting, and give the story a satisfying end.',
  },
  {
    start: 'Once upon a time, there was a boy who always told lies…',
    hint: 'A fable-style opening — develop it into a story with a moral.',
  },
  {
    start: 'The day of the entry test finally arrived. Ahmad could feel his heart beating fast…',
    hint: 'Write a personal narrative in the first person with feelings and details.',
  },
]

const STRUCTURE_GUIDE = [
  {
    step: 'Choose ONE topic and read it twice',
    text: 'Understand exactly what it asks. For a quote, think about its meaning first. For a story start, decide the direction before you write a word.',
  },
  {
    step: 'Plan for 2 minutes before writing',
    text: 'Jot down 3–4 points on the rough page: an introduction idea, 2–3 body points, and a conclusion. A short plan makes the essay organised and complete.',
  },
  {
    step: 'Write a strong introduction (2–3 sentences)',
    text: 'Open with a general statement, a question, or a direct restatement of the topic — do not start with "I am going to write about…". Keep it short and interesting.',
  },
  {
    step: 'Build the body with clear paragraphs (2–3 paragraphs)',
    text: 'Give one main idea per paragraph. Start each paragraph with a topic sentence, support it with examples or description, and connect ideas with linking words (firstly, moreover, finally).',
  },
  {
    step: 'End with a conclusion (2–3 sentences)',
    text: 'Summarise your main point or give a final thought, lesson, or moral. Do not introduce new ideas in the conclusion.',
  },
  {
    step: 'Aim for 200–250 words',
    text: 'That is roughly 3–4 short paragraphs. Do not count words during the test — write naturally, then add a finishing sentence if you are short.',
  },
]

const LANGUAGE_TIPS = [
  'Use a variety of sentences: short ones for impact, longer ones for description.',
  'Use correct tenses — past tense for narratives and stories, present tense for descriptions and opinions.',
  'Check spelling of common words (receive, believe, beautiful, tomorrow).',
  'Use correct punctuation: capital letters, full stops, commas and quotation marks for dialogue.',
  'Avoid repeating the same words — use synonyms (nice → pleasant, beautiful, wonderful).',
  'Add a reference or quotation to impress the examiner, e.g. "As the proverb says…" — but only if it fits the topic.',
  'Write neatly and leave a line between paragraphs. Presentation matters.',
]

const PASSAGE_TIPS = [
  'Read the passage twice: once quickly to get the idea, then again to find the answers.',
  'Most answers are found word-for-word in the passage — look for the sentence containing the key word of the question.',
  'Answer in complete sentences, copying the exact words where possible.',
  'For "What does the word X mean?" — look at the sentence around it and give a simple meaning in your own words.',
  'For antonyms/synonyms — re-read the sentence and think of a word that means the same or the opposite.',
  'Do not leave any question blank; even a short answer may earn marks.',
]

export default function EssaysPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <PageHeader
        eyebrow="English paper prep"
        title="Essays & Stories"
        description={
          <>
            MDCAT doesn't have a composition question — but fast, clear English
            wins you marks in the <strong>reading and comprehension</strong>
            sections. These timed writing drills build the speed and vocabulary
            that make the difference. Treat this as a bonus trainer.
          </>
        }
      />

      <div className="mb-8">
        <CompositionGenerator />
      </div>

      <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 mb-8">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
          How writing practice helps your MDCAT English score
        </h2>
        <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
          <li>• <strong>Speed:</strong> a 200–250 word piece under a timer trains you to think in English without pausing to translate.</li>
          <li>• <strong>Vocabulary:</strong> describing an idea in three ways is the same skill as picking the right synonym in the paper.</li>
          <li>• <strong>Structure:</strong> a clear beginning–middle–end makes comprehension answers shorter and sharper.</li>
          <li>• The MDCAT English section itself: grammar, verb forms, and vocabulary-in-context MCQs.</li>
        </ul>
      </div>

      <div className="space-y-8">
        <section className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-6">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
            Quote-based essay topics
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Explain the meaning of the quote, then support it with examples.
          </p>
          <ul className="space-y-3">
            {QUOTE_ESSAYS.map(t => (
              <li key={t.topic} className="border border-white/10 rounded-[var(--radius-md)] p-4">
                <p className="font-semibold text-[var(--color-text-primary)]">“{t.topic}”</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">{t.hint}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-6">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
            Descriptive & opinion essay topics
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Describe or argue clearly, with an introduction, body and conclusion.
          </p>
          <ul className="space-y-3">
            {OPINION_DESCRIPTIVE.map(t => (
              <li key={t.topic} className="border border-white/10 rounded-[var(--radius-md)] p-4">
                <p className="font-semibold text-[var(--color-text-primary)]">{t.topic}</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">{t.hint}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-6">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
            Story topics with a given start
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Continue the story from the opening line. Keep it in the past tense,
            use dialogue, and end with a clear conclusion.
          </p>
          <ul className="space-y-3">
            {STORY_STARTS.map(t => (
              <li key={t.start} className="border border-white/10 rounded-[var(--radius-md)] p-4">
                <p className="font-semibold text-[var(--color-text-primary)] italic">“…{t.start}”</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">{t.hint}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-6 mt-8">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">
          How to structure your composition
        </h2>
        <ol className="space-y-3">
          {STRUCTURE_GUIDE.map((g, i) => (
            <li key={g.step} className="flex items-start gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] text-sm font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-[var(--color-text-primary)] text-sm">{g.step}</p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{g.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-6 mt-6">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">
          Language & presentation tips
        </h2>
        <ul className="space-y-2.5">
          {LANGUAGE_TIPS.map(tip => (
            <li key={tip} className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)]">
              <Check className="w-4 h-4 text-[var(--color-primary)] mt-0.5 shrink-0" aria-hidden="true" />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 mt-6">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">
          Reading passage tips
        </h2>
        <ul className="space-y-2.5">
          {PASSAGE_TIPS.map(tip => (
            <li key={tip} className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)]">
              <Check className="w-4 h-4 text-[var(--color-primary)] mt-0.5 shrink-0" aria-hidden="true" />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8">
        <TrackedLink
          to="/dashboard/practice"
          label="essays-back-to-practice"
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          ← Back to Practice
        </TrackedLink>
      </div>
    </div>
  )
}

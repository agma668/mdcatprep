'use client'

import { useState } from 'react'
import { Clock, Dices } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type Prompt = {
  topic: string
  kind: 'Essay' | 'Story'
  hint: string
}

const PROMPTS: Prompt[] = [
  // Quote-based essays
  { topic: 'Not failure, but low aim is crime', kind: 'Essay', hint: 'Argue that aiming low is the real mistake; support with examples.' },
  { topic: 'Honesty is the best policy', kind: 'Essay', hint: 'Explain why honesty wins in the long run; add a short story or example.' },
  { topic: 'All that glitters is not gold', kind: 'Essay', hint: 'Appearances can deceive — give a real-life or historical example.' },
  { topic: 'Knowledge is power', kind: 'Essay', hint: 'Show how knowledge lets people shape their lives and society.' },
  { topic: 'Time and tide wait for none', kind: 'Essay', hint: 'Write about the value of time and not procrastinating.' },
  { topic: 'Cleanliness is next to godliness', kind: 'Essay', hint: 'Describe the importance of personal and public cleanliness.' },
  { topic: 'A friend in need is a friend indeed', kind: 'Essay', hint: 'Tell a short story that shows a true friend helping in difficulty.' },
  { topic: 'Unity is strength', kind: 'Essay', hint: 'Explain why people achieve more when they work together.' },
  { topic: 'Haste makes waste', kind: 'Essay', hint: 'Show how rushing leads to mistakes; give an example.' },
  { topic: 'Practice makes perfect', kind: 'Essay', hint: 'Explain how hard work and repetition build skill.' },
  { topic: 'Where there is a will, there is a way', kind: 'Essay', hint: 'Determination overcomes difficulties — give an example.' },
  { topic: 'Health is wealth', kind: 'Essay', hint: 'Explain why good health is the most valuable possession.' },
  // Descriptive / opinion essays
  { topic: 'What Would You Change in Your Country?', kind: 'Essay', hint: 'Pick 2–3 concrete changes and explain why and how.' },
  { topic: 'My Aim in Life', kind: 'Essay', hint: 'State your aim, why you chose it, and how you will achieve it.' },
  { topic: 'My School / My College', kind: 'Essay', hint: 'Describe your school, its teachers, facilities and what makes it special.' },
  { topic: 'My Favourite Personality', kind: 'Essay', hint: 'Describe the person, their qualities, and what you learned from them.' },
  { topic: 'The Value of Discipline in Student Life', kind: 'Essay', hint: 'Explain why discipline matters, with school or sports examples.' },
  { topic: 'A Visit to a Place of Historical Importance', kind: 'Essay', hint: 'Describe the place, what you saw and learned, and your feelings.' },
  { topic: 'My Favourite Book', kind: 'Essay', hint: 'Describe the book, its story, and why you love it.' },
  { topic: 'My Favourite Season', kind: 'Essay', hint: 'Describe the season — weather, activities and feelings.' },
  { topic: 'The Importance of Trees', kind: 'Essay', hint: 'Explain why trees matter for air, water and life.' },
  { topic: 'The Importance of Sports', kind: 'Essay', hint: 'Describe the physical and mental benefits of playing sports.' },
  { topic: 'My Mother / My Father', kind: 'Essay', hint: 'Describe the person, their qualities, and what they mean to you.' },
  { topic: 'Our National Flag', kind: 'Essay', hint: 'Describe the flag, its colours and their meaning.' },
  { topic: 'A Rainy Day', kind: 'Essay', hint: 'Describe a rainy day — the sky, the sounds, and how people react.' },
  { topic: 'My Best Friend', kind: 'Essay', hint: 'Describe your friend, their personality, and your friendship.' },
  { topic: 'The Camel — Ship of the Desert', kind: 'Essay', hint: 'Describe the camel and why it is vital in deserts.' },
  { topic: 'Life in a Village / Life in a City', kind: 'Essay', hint: 'Compare the two — advantages and challenges of each.' },
  // Stories with a given start
  { topic: 'Anderson jumped out of the rocket. He was on the soil of…', kind: 'Story', hint: 'Continue the story with a clear plot and an ending.' },
  { topic: 'It was a dark and stormy night when Ali heard a knock at the door…', kind: 'Story', hint: 'Build suspense, describe the setting, and end the story well.' },
  { topic: 'Once upon a time, there was a boy who always told lies…', kind: 'Story', hint: 'Develop it into a story with a moral.' },
  { topic: 'The day of the entry test finally arrived. Ahmad could feel his heart beating fast…', kind: 'Story', hint: 'Write a first-person narrative with feelings and details.' },
  { topic: 'Ravi found a small, wounded bird in the garden…', kind: 'Story', hint: 'Tell what Ravi did and how the story ended.' },
  { topic: 'The old man smiled and handed the boy a shining key…', kind: 'Story', hint: 'Invent what the key opens and what happens next.' },
  { topic: 'As the whistle blew, the final match of the year began…', kind: 'Story', hint: 'Describe the match, the tension, and the result.' },
  { topic: 'A stranger arrived in the village with a strange box…', kind: 'Story', hint: 'Decide what is in the box and how the villagers react.' },
  // Classic stories
  { topic: 'The Hare and the Tortoise', kind: 'Story', hint: 'Retell in your own words; slow and steady wins the race.' },
  { topic: 'The Lion and the Mouse', kind: 'Story', hint: 'Even the smallest friend can help; kindness is rewarded.' },
  { topic: 'The Thirsty Crow', kind: 'Story', hint: 'Retell how the clever crow got water from the pitcher.' },
  { topic: 'The Boy Who Cried Wolf', kind: 'Story', hint: 'No one believes a liar even when he tells the truth.' },
  { topic: 'The Woodcutter and the Golden Axe', kind: 'Story', hint: 'Honesty brings reward; greed loses everything.' },
  { topic: 'The Ant and the Grasshopper', kind: 'Story', hint: 'Hard work today saves you tomorrow.' },
]

export function CompositionGenerator() {
  const [prompt, setPrompt] = useState<Prompt | null>(null)

  const roll = () => {
    const next = PROMPTS[Math.floor(Math.random() * PROMPTS.length)]
    setPrompt(next)
  }

  return (
    <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            Get a composition topic
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {PROMPTS.length} topics · aim for 200–250 words · time yourself for
            about 25 minutes
          </p>
        </div>
        <Button variant="primary" onClick={roll} className="shrink-0">
          <Dices className="w-4 h-4" aria-hidden="true" />
          {prompt ? 'Get another topic' : 'Get a composition topic'}
        </Button>
      </div>

      {prompt && (
        <div className="mt-5 p-5 rounded-[var(--radius-md)] border-2 border-[var(--color-primary)] bg-[var(--color-surface-2)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary)]">
              {prompt.kind}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              25 minutes · 200–250 words
            </span>
          </div>
          <p className="text-lg font-semibold text-[var(--color-text-primary)] leading-snug">
            {prompt.kind === 'Story' && !prompt.topic.startsWith('“') ? '“' : ''}
            {prompt.topic}
            {prompt.kind === 'Story' ? '…”' : ''}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">{prompt.hint}</p>
        </div>
      )}
    </div>
  )
}

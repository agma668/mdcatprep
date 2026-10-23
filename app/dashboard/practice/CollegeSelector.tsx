'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const EXAMS = [
  { name: 'MDCAT', mark: '🩺', note: 'PMDC syllabus — all Pakistan' },
  { name: 'NUMS', mark: '🎖️', note: 'National University of Medical Sciences' },
  { name: 'UHS', mark: '🧬', note: 'University of Health Sciences, Lahore' },
  { name: 'SZABMU', mark: '⚕️', note: 'Shaheed Zulfiqar Ali Bhutto Medical University' },
  { name: 'ETEA', mark: '🏔️', note: 'KMU ETEA — Khyber Pakhtunkhwa' },
  { name: 'HEC USAT-M', mark: '🎓', note: 'HEC scholarship test — Balo/FATA' },
]

interface ExamSelectorProps {
  selectedCollege: string | null
  onSelect: (college: string | null) => void
}

export function CollegeSelector({ selectedCollege, onSelect }: ExamSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', checkScroll, { passive: true })
    return () => el?.removeEventListener('scroll', checkScroll)
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
  }

  const selectedSlug = selectedCollege?.toLowerCase() || ''

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Choose your exam</h2>
        {selectedCollege && (
          <button
            onClick={() => onSelect(null)}
            className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors"
          >
            Show all subjects
          </button>
        )}
      </div>
      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-[#0a0a0a]/80 backdrop-blur text-white/50 hover:text-white hover:border-white/20 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {EXAMS.map((exam) => {
            const isSelected = selectedSlug.includes(exam.name.toLowerCase())
            return (
              <button
                key={exam.name}
                onClick={() => onSelect(isSelected ? null : exam.name)}
                className={
                  'shrink-0 flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] border transition-all duration-300 min-w-[180px] ' +
                  (isSelected
                    ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.06]')
                }
              >
                <span
                  aria-hidden="true"
                  className="flex w-10 h-10 rounded-lg shrink-0 items-center justify-center bg-white/[0.06] text-xl"
                >
                  {exam.mark}
                </span>
                <div className="text-left min-w-0">
                  <p className={'text-sm font-bold truncate ' + (isSelected ? 'text-[var(--color-primary-light)]' : 'text-white')}>
                    {exam.name}
                  </p>
                  <p className="text-[10px] text-white/40 truncate">{exam.note}</p>
                </div>
              </button>
            )
          })}
        </div>
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-[#0a0a0a]/80 backdrop-blur text-white/50 hover:text-white hover:border-white/20 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const COLLEGES = [
  { name: 'CCH Hasanabdal', slug: 'cch', logo: '/cch-logo.png', city: 'Attock, Punjab' },
  { name: 'PAF Sargodha', slug: 'paf-sargodha', logo: '/paf-sargodha-logo.png', city: 'Sargodha, Punjab' },
  { name: 'MCJ Jhelum', slug: 'mcj', logo: '/mcj-jhelum-logo.jpg', city: 'Jhelum, Punjab' },
  { name: 'Kohat Cadet', slug: 'kohat', logo: '/kohat-logo.jpg', city: 'Kohat, KPK' },
  { name: 'Petaro', slug: 'petaro', logo: '/petaro-logo.png', city: 'Jamshoro, Sindh' },
  { name: 'PAF Lower Topa', slug: 'lower-topa', logo: '/paf-lower-topa-logo.png', city: 'Murree, Punjab' },
]

interface CollegeSelectorProps {
  selectedCollege: string | null
  onSelect: (college: string | null) => void
}

export function CollegeSelector({ selectedCollege, onSelect }: CollegeSelectorProps) {
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
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Choose your college</h2>
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
          {COLLEGES.map((college) => {
            const isSelected = selectedSlug.includes(college.slug)
            return (
              <button
                key={college.slug}
                onClick={() => onSelect(isSelected ? null : college.name)}
                className={
                  'shrink-0 flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] border transition-all duration-300 min-w-[180px] ' +
                  (isSelected
                    ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.06]')
                }
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/[0.06] flex items-center justify-center">
                  <Image src={college.logo} alt={college.name} fill sizes="40px" className="object-contain" />
                </div>
                <div className="text-left min-w-0">
                  <p className={'text-sm font-bold truncate ' + (isSelected ? 'text-[var(--color-primary-light)]' : 'text-white')}>
                    {college.name}
                  </p>
                  <p className="text-[10px] text-white/40 truncate">{college.city}</p>
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

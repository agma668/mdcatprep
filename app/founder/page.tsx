import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { getWhatsAppLink } from '@/lib/site'
import { GraduationCap, Heart, BookOpen } from 'lucide-react'

export const metadata: Metadata = { title: 'Founder' }

const WHATSAPP = getWhatsAppLink()

export default function FounderPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 relative overflow-hidden bg-[#0a0a0a]">
      {/* Ambient field wash — signal, per --rgb-signal */}
      <div aria-hidden="true" className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,rgba(var(--rgb-signal),0.10)_0%,transparent_65%)]" />
      <div aria-hidden="true" className="absolute bottom-0 -left-40 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(var(--rgb-signal),0.06)_0%,transparent_65%)]" />

      <div className="container-page max-w-3xl relative">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-[var(--color-primary-light)] transition-colors">
          <span aria-hidden="true">←</span> Back to Home
        </Link>

        <div className="mt-6 rounded-[var(--radius-xl)] bg-white/[0.06] backdrop-blur-md border border-white/10 shadow-[var(--shadow-lg)] p-8 sm:p-10">
          {/* Photo — zoomed out */}          <div className="flex justify-center mb-8">            <div className="relative w-full max-w-lg">
              <div className="w-full aspect-[2/1] rounded-[var(--radius-xl)] overflow-hidden ring-2 ring-[var(--color-primary)]/30 shadow-[var(--glow-signal-md)] bg-[var(--srf-1)]">
                <Image src="/founder-photo.jpg" alt="Muhammad Haziq Khan Miankhail" width={800} height={400} className="w-full h-full object-cover object-center" priority />
              </div>
              <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-[var(--srf-1)] border-2 border-[var(--color-primary)] shadow-[var(--shadow-md)] p-0.5 flex items-center justify-center">
                <span aria-hidden="true" className="text-xl">🩺</span>
              </div>
            </div>
          </div>

          <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-[linear-gradient(135deg,var(--color-primary-light)_0%,var(--color-primary)_50%,var(--color-primary-light)_100%)] tracking-tight">
            Muhammad Haziq Khan
          </h1>
          <p className="mt-2 text-center text-sm font-medium text-white/70">
            Founder of MED Prep · CCH Alumni
          </p>

          <div className="mt-8 space-y-5 text-[15px] text-white/85 leading-relaxed">
            <p>
              Son of Haji Abdul Ghaffar Khan Miankhail, Haziq was born in Zhob,
              Balochistan, a small town that many people may not even find on a
              map. He grew up in Quetta, completed his O-Levels from Garrison
              APSACS, and later his FSc from Cadet College Hasan Abdal.
            </p>
            <p>
              After graduating from CCH, Haziq noticed something that had always
              bothered him: students from smaller cities often have the same
              ambition and potential as students from bigger cities, but they do
              not always have access to the same opportunities and resources —
              especially for the MDCAT, where a single test decides who gets a
              medical seat. He felt that where a student comes from should not
              determine how far they can go.
            </p>
            <p>
              MED Prep started with a simple belief: where you&apos;re from
              shouldn&apos;t decide where you end up. Every student in Pakistan
              deserves a fair shot at the medical seat they dream of. That is
              why the platform is free. Education should be accessible to
              everyone.
            </p>
            <p>
              For Haziq, however, this is about more than just a platform. It is
              about giving back and helping others move forward. Whether it is
              teaching a student in Wana how to tackle a Biology MCQ or
              encouraging a student from a small town to believe that an MBBS
              seat is within their reach, the purpose remains the same: to make a
              meaningful contribution, uphold his values, and leave things a
              little better than he found them.
            </p>
            <p className="text-white/60 italic">
              If MED Prep helps even one student reach the medical college they
              once thought was beyond their reach, then it will have been worth
              it.
            </p>
          </div>

          {/* Values strip */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <GraduationCap className="w-5 h-5 text-[var(--color-primary-light)] mx-auto mb-1" />
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Accessible Education</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <Heart className="w-5 h-5 text-[var(--color-primary-light)] mx-auto mb-1" />
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Community First</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <BookOpen className="w-5 h-5 text-[var(--color-primary-light)] mx-auto mb-1" />
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Free For All</p>
            </div>
          </div>

          {WHATSAPP && (
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-white/50">Open to questions, guidance, or just a conversation.</p>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-2 border-[var(--color-primary)]/40 text-[var(--color-primary-light)] font-semibold px-5 py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-primary)]/10 transition-colors text-sm">
                <WhatsAppIcon className="w-4 h-4" /> Reach out to me
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

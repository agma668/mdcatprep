import type { Metadata } from 'next'
import Link from 'next/link'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { getWhatsAppLink } from '@/lib/site'

export const metadata: Metadata = { title: 'Copyright & Terms' }

const WHATSAPP = getWhatsAppLink()

export default function CopyrightPage() {
  const year = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pt-24 pb-16">
      <div className="container-page max-w-3xl">
        <Link
          href="/"
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] mt-4 mb-2">
          Copyright & Terms of Use
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          Last updated: {year}
        </p>

        <div className="space-y-6">
          <section className="glass-tile-glow rounded-[var(--radius-lg)] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
              Ownership
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              © {year} Cadet College Prep. All rights reserved. This website — including its
              design, source code, question bank, study notes, essays, passages,
              text content, and graphics — is the original work of the Cadet College Prep team
              and is protected by copyright law, both in Pakistan and
              internationally.
            </p>
          </section>

          <section className="glass-tile-glow rounded-[var(--radius-lg)] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
              What you may not do
            </h2>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed list-disc pl-5">
              <li>
                Copy, scrape, download or reuse the website&apos;s design, code or
                content to build another website or product.
              </li>
              <li>
                Republish our questions, notes, essays or passages on any other
                platform.
              </li>
              <li>
                Sell, resell or redistribute any part of this website or its
                content.
              </li>
              <li>
                Claim this website or its content as your own.
              </li>
            </ul>
          </section>

          <section className="glass-tile-glow rounded-[var(--radius-lg)] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
              Permission for students
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Registered students may use the website and its materials for
              their own personal study and exam preparation only. Personal use
              does not include copying the content to other websites,
              distributing it to others, or using it commercially.
            </p>
          </section>

          <section className="glass-tile-glow rounded-[var(--radius-lg)] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
              Enforcement
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              We actively monitor for unauthorised copying. Violations may
              result in a formal takedown notice, account termination, and
              legal action under applicable copyright law.
            </p>
          </section>

          <section className="glass-tile-glow rounded-[var(--radius-lg)] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
              Contact
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              To report an infringement or request permission, contact us:
            </p>
            {WHATSAPP && (
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 bg-[var(--whatsapp)] text-[var(--color-text-inverse)] font-semibold px-5 py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--whatsapp-deep)] transition-colors text-sm"
              >
                <WhatsAppIcon className="w-4 h-4" /> Contact on WhatsApp
              </a>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

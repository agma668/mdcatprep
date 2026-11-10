'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/analytics', label: 'Analytics', exact: true },
  { href: '/admin#students', label: 'Students', exact: false },
  { href: '/admin/questions', label: 'Questions / MCQs', exact: true },
  { href: '/admin/prep-spaces', label: 'Prep Spaces', exact: true },
  { href: '/admin/notes', label: 'Notes', exact: true },
  { href: '/admin/feedback', label: 'Feedback', exact: true },
  { href: '/admin/push', label: 'Push', exact: true },
] as const

export function AdminNav() {
  const pathname = usePathname()

  const isActive = (href: string, exact: boolean) => {
    if (href === '/admin#students') {
      // The students table lives on /admin; treat the path (not the anchor)
      // as active only when not on a sub-page like /admin/questions.
      return pathname === '/admin'
    }
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav className="flex items-center gap-1" aria-label="Admin navigation">
      {ITEMS.map(({ href, label, exact }) => {
        const active = isActive(href, exact)
        return (
          <Link
            key={href}
            href={href}
            className={[
              'px-3 py-1.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors',
              active
                ? 'bg-[var(--color-primary)] text-[#0a0a0a]'
                : 'text-white/60 hover:text-white hover:bg-white/10',
            ].join(' ')}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

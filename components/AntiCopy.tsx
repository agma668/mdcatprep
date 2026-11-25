'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Lightweight anti-copy friction (a deterrent, not a security measure) for the
 * question surfaces only.
 *
 * It used to run on every route: no text could be selected anywhere, Ctrl+C was
 * swallowed outside form fields, and images were `pointer-events: none`. That
 * made a blog post impossible to quote, broke browser translation and reading
 * aids, and was the first thing a visitor noticed. The protection now applies
 * only where the paid question content lives; everything a reader should be
 * able to select stays selectable.
 */
const PROTECTED_PREFIXES = ['/practice', '/dashboard', '/mock', '/topicals', '/past-papers']

export function AntiCopy() {
  const pathname = usePathname()
  const protectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )

  useEffect(() => {
    if (!protectedRoute) return
    const isEditable = (target: EventTarget | null) => {
      const el = target as HTMLElement | null
      if (!el) return false
      const tag = el.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable
    }

    const blockContextMenu = (e: MouseEvent) => {
      // Allow right-click inside editable fields (copying your own text is fine).
      if (isEditable(e.target)) return
      e.preventDefault()
    }

    const blockSelection = (e: Event) => {
      // Allow selection inside inputs/textarea (e.g. your own typed answer).
      const target = e.target as HTMLElement | null
      if (target && target.tagName === 'INPUT' || (target && target.tagName === 'TEXTAREA')) return
      e.preventDefault()
    }

    const blockShortcuts = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return
      const mod = e.ctrlKey || e.metaKey
      const key = e.key.toLowerCase()
      // Block copy, cut, save, view-source, devtools.
      if (mod && ['c', 'x', 's', 'u'].includes(key)) e.preventDefault()
      if (e.key === 'F12') e.preventDefault()
    }

    const blockDrag = (e: DragEvent) => {
      if (isEditable(e.target)) return
      e.preventDefault()
    }

    document.addEventListener('contextmenu', blockContextMenu)
    document.addEventListener('copy', blockSelection)
    document.addEventListener('cut', blockSelection)
    document.addEventListener('keydown', blockShortcuts)
    document.addEventListener('dragstart', blockDrag)
    document.addEventListener('selectstart', blockSelection)

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu)
      document.removeEventListener('copy', blockSelection)
      document.removeEventListener('cut', blockSelection)
      document.removeEventListener('keydown', blockShortcuts)
      document.removeEventListener('dragstart', blockDrag)
      document.removeEventListener('selectstart', blockSelection)
    }
  }, [protectedRoute])

  if (!protectedRoute) return null

  return (
    <>
      {/* Block text selection on question surfaces, but allow it inside form
          fields. Images stay clickable (pointer-events) — the drag handler
          already stops saving by drag. */}
      <style>{`
        body { -webkit-user-select: none; user-select: none; }
        input, textarea, [contenteditable="true"] { -webkit-user-select: text; user-select: text; }
        img { -webkit-user-drag: none; }
      `}</style>
      {/* Print watermark: page footer shows ownership on any print/save. */}
      <style>{`
        @media print {
          body::after {
            content: "© MED Prep — All rights reserved. Do not copy or redistribute.";
            position: fixed; left: 0; right: 0; bottom: 0;
            text-align: center; font-size: 10px; color: #888; padding: 4px;
          }
        }
      `}</style>
    </>
  )
}

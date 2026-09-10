'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, MessageSquare, Send, X } from 'lucide-react'
import { submitFeedback } from '@/app/actions/feedback'

/**
 * Floating feedback widget shown on every page (hidden on /admin, the owner's
 * own control panel). Kept deliberately minimal: one textarea, no name, no
 * extra questions — just "what would you like us to improve?".
 */
export function FeedbackWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close with Escape / click outside.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      const insidePanel = panelRef.current?.contains(t) ?? false
      const onButton = buttonRef.current?.contains(t) ?? false
      if (!insidePanel && !onButton) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  // Focus the textarea when the panel opens.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => textareaRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  // Hidden on the admin portal (where the owner reads feedback, not where
  // students write it) and on the timed mock-test route, where the floating
  // button overlapped the player's Next/Submit controls on small screens.
  // (Kept after all hooks to preserve hook order.)
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard/mock-test')) return null

  const reset = () => {
    setMessage('')
    setStatus('idle')
    setError('')
  }

  const handleSubmit = async () => {
    if (status === 'sending') return
    const value = message.trim()
    if (!value) {
      setError('Please write your feedback first.')
      return
    }
    setStatus('sending')
    setError('')
    const result = await submitFeedback(value, pathname)
    if ('success' in result) {
      setStatus('done')
    } else {
      setStatus('error')
      setError(result.error)
    }
  }

  const canSend = message.trim().length > 0 && status !== 'sending'

  return (
    <div className="fixed z-40 right-4 md:right-6 bottom-20 md:bottom-6">
      {/* ── Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label="Feedback form"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full right-0 mb-3 w-[min(88vw,22rem)] origin-bottom-right rounded-[var(--radius-lg)] bg-[#0a0a0a] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))] px-5 pb-3 pt-4 text-[var(--color-text-inverse)]">
              <div>
                <h2 className="font-jakarta text-base font-semibold leading-snug">
                  Share your feedback
                </h2>
                <p className="mt-0.5 text-xs opacity-70">
                  Help us improve the site — what&apos;s working, and what&apos;s not?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close feedback form"
                className="shrink-0 cursor-pointer rounded-md p-1 opacity-70 hover:bg-black/15 hover:opacity-100 transition-colors"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {status === 'done' ? (
              /* ── Success ── */
              <div className="px-5 py-8 text-center">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)]">
                  <Check className="w-6 h-6" aria-hidden="true" />
                </span>
                <p className="mt-3 font-semibold text-[var(--color-text-primary)]">
                  Thanks for your feedback!
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  It helps us make the site better for everyone.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-4 text-sm font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
                >
                  Send another
                </button>
              </div>
            ) : (
              /* ── Form: just one field ── */
              <div className="px-5 py-4">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    // Ctrl/Cmd+Enter sends.
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  placeholder="Write your feedback here…"
                  aria-label="Your feedback"
                  rows={4}
                  maxLength={2000}
                  className="w-full resize-none rounded-[var(--radius-md)] border border-white/10 bg-white/[0.06] px-3.5 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
                <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                  {message.length}/2000
                </p>

                {status === 'error' && (
                  <p className="mt-2 text-sm text-[var(--color-error)]" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSend}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-inverse)] transition-all duration-[var(--transition-fast)] hover:bg-[var(--color-primary-light)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  {status === 'sending' ? 'Sending…' : 'Send feedback'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating button ── */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!open) reset()
          setOpen((o) => !o)
        }}
        aria-expanded={open}
        aria-label="Give feedback"
        className="group flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))] px-4 py-3 text-[var(--color-text-inverse)] shadow-[var(--glow-signal-lg)] ring-1 ring-[var(--line-signal)] transition-all duration-[var(--transition-base)] hover:shadow-[var(--glow-signal-lg)] hover:-translate-y-0.5 cursor-pointer"
      >
        {open ? (
          <X className="w-5 h-5" aria-hidden="true" />
        ) : (
          <MessageSquare className="w-5 h-5" aria-hidden="true" />
        )}
        <span className="text-sm font-semibold">
          {open ? 'Close' : 'Feedback'}
        </span>
      </button>
    </div>
  )
}

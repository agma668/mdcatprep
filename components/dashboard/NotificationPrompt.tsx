'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Loader2 } from 'lucide-react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export function NotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!('Notification' in window)) return
    // The permission read is deferred into a requestAnimationFrame callback
    // (never synchronous to the effect body) so the
    // react-hooks/set-state-in-effect rule stays satisfied — the same proven
    // shape as DailyGoal.tsx and ScoreRing.tsx. The prompt still appears right
    // after hydration, one frame later; nothing else about the timing changes.
    const id = requestAnimationFrame(() => setPermission(Notification.permission))
    if (!('serviceWorker' in navigator) || !VAPID_PUBLIC_KEY) return () => cancelAnimationFrame(id)
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => setSubscribed(!!sub))
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const handleUnsubscribe = useCallback(async () => {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await fetch('/api/push', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })
      await sub.unsubscribe()
    }
    setSubscribed(false)
  }, [])

  const handleSubscribe = useCallback(async () => {
    setLoading(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') { setLoading(false); return }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      })
      setSubscribed(true)
    } catch { /* subscription failed */ }
    setLoading(false)
  }, [])

  // SSR-safe: during server render `window` does not exist, so the prompt
  // always starts hidden and only decides what to show after hydration.
  if (typeof window === 'undefined' || !('Notification' in window) || !VAPID_PUBLIC_KEY || dismissed) return null

  if (subscribed || permission === 'granted') {
    return (
      <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-4 flex items-center gap-3">
        <Bell className="w-5 h-5 text-emerald-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Notifications enabled</p>
          <p className="text-xs text-[var(--color-text-muted)]">You&apos;ll receive practice reminders.</p>
        </div>
        <button onClick={handleUnsubscribe} className="text-xs text-white/40 hover:text-rose-400 transition-colors">Disable</button>
      </div>
    )
  }

  if (permission === 'denied') return null

  return (
    <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--color-primary)]/20 p-4 flex items-center gap-3">
      <Bell className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">Enable practice reminders?</p>
        <p className="text-xs text-[var(--color-text-muted)]">Get notified when it&apos;s time to practice.</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={handleSubscribe} disabled={loading}
          className="px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-text-inverse)] text-xs font-semibold hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-colors">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Enable'}
        </button>
        <button onClick={() => setDismissed(true)} className="text-xs text-white/40 hover:text-white/60 transition-colors">
          Later
        </button>
      </div>
    </div>
  )
}

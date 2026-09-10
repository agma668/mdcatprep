'use client'

import { useEffect } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
// Per-build epoch (next.config.mjs): the ?v= changes on every deploy, so the
// browser re-fetches /sw.js itself instead of waiting for its own update
// schedule (which can leave an old SW controlling the tab for up to ~24 h).
const SW_EPOCH = process.env.NEXT_PUBLIC_SW_EPOCH || 'dev'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

async function registerPush(sub: PushSubscription) {
  await fetch('/api/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: sub.toJSON() }),
  })
}

export function SWRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    // Never run the SW against the dev server: hot reload + a caching SW
    // serves stale chunks and poisons the cache-generation dance.
    if (process.env.NODE_ENV !== 'production') return

    // Versioned script URL — a new epoch per deploy means a new script URL,
    // which the browser fetches immediately (register with a changed URL on
    // the same scope triggers an update). skipWaiting in the SW then
    // activates it promptly; clients.claim hands open tabs to it without a
    // reload.
    const register = async () => {
      const reg = await navigator.serviceWorker.register(`/sw.js?v=${SW_EPOCH}`)
      // Explicit update check: catches SW-content changes even when the epoch
      // did not change. Browsers only auto-check ~once per 24 h on
      // navigation; an update() call is never throttled.
      reg.update().catch(() => {})
      return reg
    }

    register()
      .then(async (reg) => {
        // Auto-subscribe to push if VAPID key is configured
        if (!VAPID_PUBLIC_KEY) return

        const existing = await reg.pushManager.getSubscription()
        if (existing) return // already subscribed

        try {
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          })
          await registerPush(sub)
        } catch {
          // User denied notification permission or subscription failed
        }
      })
      .catch(() => {
        // SW registration failed — non-critical
      })

    // Re-check for a newer SW whenever the tab becomes visible again (return
    // from background, refocus, back-forward). Throttled: the browser's own
    // update is cheap, but a fetch of /sw.js per visibility flip is not.
    let lastCheck = Date.now()
    const checkForUpdate = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastCheck < 15 * 60 * 1000) return
      lastCheck = Date.now()
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => reg?.update().catch(() => {}))
        .catch(() => {})
    }
    document.addEventListener('visibilitychange', checkForUpdate)
    window.addEventListener('focus', checkForUpdate)
    return () => {
      document.removeEventListener('visibilitychange', checkForUpdate)
      window.removeEventListener('focus', checkForUpdate)
    }
  }, [])

  return null
}

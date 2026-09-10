/**
 * Serves the service worker at /sw.js with a cache generation injected per
 * deploy.
 *
 * Why a route instead of a static file in /public: the SW needs its cache
 * name to CHANGE on every deploy — the browser detects a new SW by new bytes,
 * and the new SW's activate must delete the previous generation's caches so
 * stale pages/chunks can never be served (or half-mixed with new ones). A
 * static file can't know which deploy it belongs to; this route embeds the
 * same per-build epoch the client bakes into the registration URL
 * (NEXT_PUBLIC_SW_EPOCH, see next.config.mjs). Served no-cache so update
 * checks always see the fresh bytes.
 *
 * Offline guarantee: /offline-practice and its chunks are cache-first, so
 * they survive in whatever cache generation captured them. Each new deploy
 * starts a fresh, empty generation — the known one-time warm-up happens on
 * the next online visit — and this SW best-effort pre-caches the public
 * /offline-practice shell on activate to shorten that gap. The 200-question
 * bank lives in IndexedDB (lib/offline.ts), which is never touched by cache
 * purges, so downloaded questions survive every deploy.
 */

import { NextResponse } from 'next/server'

// Stable per deploy: Vercel sets the commit SHA; elsewhere the build-time
// epoch (same value the client bakes into ?v= via next.config env) is set on
// process.env when the config loads. Last resort: a fresh value per server
// start — still new on every local deploy.
const SW_EPOCH = (
  process.env.NEXT_PUBLIC_SW_EPOCH ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  Date.now()
)
  .toString()
  .slice(-12)

const CACHE_NAME = `cadet-prep-${SW_EPOCH}`

const swSource = `'use strict';

// Cache generation for THIS deploy (injected by the /sw.js route). The
// previous generation's caches are deleted on activate, so old pages and
// chunks are never served after a deploy.
const CACHE_NAME = '${CACHE_NAME}';

// Install: take over as soon as possible — a waiting SW still runs old code.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate: delete every cache that is not THIS generation's (superseded
// caches from earlier deploys AND any legacy named caches), then claim open
// tabs so the new SW controls them without a reload. Atomic: after activate,
// only the new generation exists, so old and new entries can never mix.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      // Best-effort warm-up of the public offline drill page into the fresh
      // generation, shortening the one-time re-warm after a deploy. Fails
      // silently offline.
      try {
        const res = await fetch('/offline-practice');
        if (res.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put('/offline-practice', res);
        }
      } catch {
        /* offline at activation — the page warms on the next online visit */
      }
    })()
  );
  self.clients.claim();
});

// Network-first: fresh from the network, cached for offline, cache as
// fallback when the network is down (document navigations).
async function networkFirst(request, url) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      return response;
    }
    // Network answered with an error — fall back to cache before showing it.
    const cached = await caches.match(request);
    return cached || response;
  } catch {
    // Network failed — offline. Serve the cached page, or the dashboard shell
    // for any dashboard route, or a plain offline response.
    const cached = await caches.match(request);
    if (cached) return cached;
    if (url.pathname.startsWith('/dashboard')) {
      const shell = await caches.match('/dashboard');
      if (shell) return shell;
    }
    return new Response('Offline', { status: 503 });
  }
}

// Cache-first: serve from cache, fetch + store on miss (static assets).
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const clone = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
  }
  return response;
}

// Fetch: three routes —
//   navigations   → network-first with cache fallback (fresh pages, offline-safe)
//   static assets → cache-first (incl. /_next/ build chunks, so cached pages
//                   can hydrate and stay interactive offline)
//   API (/api/*)  → network-first (never served from cache)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API calls: never cache, always go to the network.
  if (url.pathname.startsWith('/api/')) return;

  // RSC payloads (?_rsc= / RSC header): network-first like navigations.
  // They embed the current build's component tree, so a stale cached payload
  // served against a fresh HTML shell breaks hydration (React #419). Fetch
  // fresh when online, fall back to the cached payload only when offline.
  if (url.searchParams.has('_rsc') || request.headers.get('RSC') === '1') {
    event.respondWith(networkFirst(request, url));
    return;
  }

  // Document navigations: network-first.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, url));
    return;
  }

  // Everything else same-origin GET (images, fonts, css, js): cache-first.
  event.respondWith(cacheFirst(request));
});

// Push notification
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {
    title: 'Cadet College Prep',
    body: 'Time to practice!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/badge-72.png',
      data: data.url || '/dashboard/practice',
      actions: [
        { action: 'practice', title: 'Start Practice' },
        { action: 'dismiss', title: 'Later' },
      ],
    })
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'practice' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/dashboard/practice')
    );
  }
});
`

export function GET() {
  return new NextResponse(swSource, {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      // Never let the browser's HTTP cache serve a stale SW script — every
      // update check must see the current deploy's bytes. (The browser keeps
      // its own SW-script cache for offline operation regardless.)
      'Cache-Control': 'no-cache, no-store',
    },
  })
}

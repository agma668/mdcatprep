// Auth-form probe — how long until a phone can actually SEE the login / signup
// form, under a throttled mobile profile?
//
// Why it exists: both sites USED TO serve `/login` and `/signup` as HTML with
// **no `<form>` and no `<input>` at all** — the form was a client component
// behind a `<Suspense>` boundary, because `useSearchParams()` in the form made
// a statically-prerendered route bail out of SSR. A phone waited ~2.9-3.4 s of
// cold, throttled JS before the password field existed. Both sites now read the
// query on the server and pass it down, so the form is in the served bytes.
//
// This probe is now the REGRESSION GUARD for that fix. `fieldPresentWhenParsed`
// is the number that matters and it is binary, not a timing: it is `true` only
// if the password field is in the DOM the moment the HTML is parsed. A
// client-rendered form cannot produce `true`, however fast the connection — so
// a `false` here means the fix was undone, while the ms figures (which drift
// 1.1-2.8 s run to run with chunk arrival order) are context only.
//
// Usage:
//   node scripts/_probe-login.mjs <baseUrl> /login [throttle|nothrottle]
//
// Scratch tool: the repo's `_` prefix marks it as such.

import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = Number(process.env.CDP_PORT || 9388)
const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find(existsSync)
if (!EDGE) {
  console.error('no Edge binary found')
  process.exit(1)
}

const BASE = process.argv[2]
const ROUTE = process.argv[3] || '/login'
const MODE = process.argv[4] || 'throttle'
if (!BASE) {
  console.error('usage: node scripts/_probe-login.mjs <baseUrl> <route> [throttle|nothrottle]')
  process.exit(1)
}

// Mid-tier phone on a congested link, not a worst case: 1.6 Mbps down,
// 750 kbps up, 150 ms RTT, and a 4x CPU slowdown. Stated so the number means
// something — an unthrottled localhost run would flatter every build.
const NET = { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 }
const CPU_RATE = 4

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function findTarget() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const list = await res.json()
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (page) return page.webSocketDebuggerUrl
    } catch {
      /* not up yet */
    }
    await sleep(250)
  }
  throw new Error('devtools never came up')
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl)
    const pending = new Map()
    let id = 0
    const send = (method, params = {}, deadlineMs = 30000) =>
      new Promise((res, rej) => {
        const msgId = ++id
        const timer = setTimeout(() => {
          pending.delete(msgId)
          rej(new Error(`${method} blocked >${deadlineMs}ms`))
        }, deadlineMs)
        pending.set(msgId, {
          ok: (v) => {
            clearTimeout(timer)
            res(v)
          },
          err: (e) => {
            clearTimeout(timer)
            rej(e)
          },
        })
        ws.send(JSON.stringify({ id: msgId, method, params }))
      })
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id && pending.has(msg.id)) {
        const { ok, err } = pending.get(msg.id)
        pending.delete(msg.id)
        if (msg.error) err(new Error(JSON.stringify(msg.error)))
        else ok(msg.result)
      }
    }
    ws.onerror = (e) => reject(e)
    ws.onopen = () => resolve({ send, close: () => ws.close() })
  })
}

const expr = (client, expression, deadlineMs = 20000) =>
  client
    .send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, deadlineMs)
    .then((r) => r?.result?.value ?? null)

// The password field is the honest landmark: it only exists once the auth form
// itself has rendered, so it cannot be satisfied by an unrelated input.
const WATCH = `(() => {
  window.__t0 = performance.now();
  window.__formAt = null;
  window.__formVisibleAt = null;
  window.__errors = [];
  const findInput = () => document.querySelector('form input[type="password"]');
  // The noise-free question: is the field there the moment the HTML is parsed,
  // or only after JS has run? Timings under an emulated throttle vary run to
  // run (measured 1.3-2.8 s for the same build, tracking how many other chunks
  // happened to finish first), so the binary fact is the reliable one. When the
  // form is server-rendered this is true; when it is client-only it cannot be.
  window.__atInteractive = undefined;
  document.addEventListener('readystatechange', function () {
    if (window.__atInteractive === undefined && document.readyState === 'interactive') {
      window.__atInteractive = { fieldPresent: !!findInput() };
    }
  });
  const tick = () => {
    if (window.__formAt === null) {
      const el = findInput();
      if (el) {
        window.__formAt = performance.now();
        // Separately record the first frame it is actually PAINTED, which is
        // what the user sees rather than what the DOM holds.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (window.__formVisibleAt === null) window.__formVisibleAt = performance.now();
          });
        });
      } else {
        requestAnimationFrame(tick);
      }
    }
  };
  requestAnimationFrame(tick);
  window.addEventListener('error', (e) => window.__errors.push(String(e.message).slice(0, 120)));
})()`

async function runOnce(client, label) {
  await client.send('Network.enable').catch(() => {})
  // Cold cache, always. The warm-up run's whole job is to get past the
  // first-run-in-a-session renderer penalty — but it also populated the HTTP
  // cache, and an earlier version of this probe then measured a fully cached
  // page load at ~800 ms and called it a throttled phone. Disabling the cache
  // for both runs makes this a cold first visit, which is what a student
  // arriving from a link actually gets.
  await client.send('Network.setCacheDisabled', { cacheDisabled: true }).catch(() => {})
  await client.send('Network.clearBrowserCache').catch(() => {})
  if (MODE === 'throttle') {
    await client.send('Network.emulateNetworkConditions', NET).catch(() => {})
    await client.send('Emulation.setCPUThrottlingRate', { rate: CPU_RATE }).catch(() => {})
  } else {
    await client.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }).catch(() => {})
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 }).catch(() => {})
  }

  const url = BASE + ROUTE
  const t0 = Date.now()
  await client.send('Page.navigate', { url }, 60000).catch(() => {})

  // Poll until the landmark appears, bounded.
  let formAt = null
  let domContentLoadedAt = null
  for (let i = 0; i < 300; i++) {
    const state = await expr(
      client,
      `({ formAt: window.__formAt, visibleAt: window.__formVisibleAt,
          ready: document.readyState,
          dcl: performance.timing ? performance.timing.domContentLoadedEventEnd : null,
          errors: window.__errors })`,
    ).catch(() => null)
    if (state) {
      if (state.dcl && !domContentLoadedAt) domContentLoadedAt = state.dcl
      if (state.formAt !== null) {
        formAt = state.formAt
        // Give the paint measurement a moment, then read everything once.
        await sleep(400)
        // Read the paint landmark with the same plain shape as the poll above.
        const painted = await expr(client, 'window.__formVisibleAt').catch(() => null)
        const jsBytes = await expr(
          client,
          `performance.getEntriesByType('resource').reduce(function (n, r) { return n + (r.encodedBodySize || 0); }, 0)`,
        ).catch(() => null)
        return {
          label,
          route: ROUTE,
          mode: MODE,
          formInDomMs: Math.round(formAt),
          formPaintedMs: painted != null ? Math.round(painted) : null,
          resourceKB: jsBytes != null ? Math.round(jsBytes / 1024) : null,
          fieldPresentWhenParsed: await expr(client, '(window.__atInteractive || {}).fieldPresent').catch(() => null),
          wallMs: Date.now() - t0,
        }
      }
    }
    await sleep(100)
  }
  return { label, route: ROUTE, mode: MODE, formInDomMs: null, formPaintedMs: null, wallMs: Date.now() - t0, errors: 'form never appeared within 30 s' }
}

const main = async () => {
  const wsUrl = await findTarget()
  const client = await connect(wsUrl)
  await client.send('Page.enable')
  await client.send('Runtime.enable')
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
  })
  await client.send('Emulation.setEmulatedMedia', {
    features: [
      { name: 'hover', value: 'none' },
      { name: 'pointer', value: 'coarse' },
      { name: 'prefers-reduced-motion', value: 'no-preference' },
    ],
  })
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }).catch(() => {})

  // Warm-up, discarded: the first run in a fresh browser session is penalised
  // (proven in docs/PERF-MEASUREMENT.md), so it is never the reported number.
  await client.send('Page.addScriptToEvaluateOnNewDocument', { source: WATCH })
  await runOnce(client, 'warm-up (discarded)')
  const r = await runOnce(client, 'measured')
  console.log(JSON.stringify({ base: BASE, ...r, profile: MODE === 'throttle' ? NET : 'unthrottled', cpuRate: MODE === 'throttle' ? CPU_RATE : 1 }, null, 1))
  client.close()
  child.kill()
  process.exit(0)
}

const profile = mkdtempSync(join(tmpdir(), 'login-'))
const child = spawn(
  EDGE,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=390,844',
    '--no-first-run',
    '--disable-gpu',
    'about:blank',
  ],
  { stdio: 'ignore' },
)

main().catch((e) => {
  console.error('PROBE FAILED:', e.message)
  try {
    child.kill()
  } catch {
    /* ignore */
  }
  process.exit(1)
})

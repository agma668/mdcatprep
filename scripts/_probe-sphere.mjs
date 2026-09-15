// Sphere probe — does the hero constellation canvas draw on a phone, and does
// it still animate on a desktop?
//
// The two failure modes this exists to catch, because both are silent:
//   1. The canvas draws nothing (the emblem is an empty box). Judged by pixels,
//      not by the code path.
//   2. The canvas keeps drawing every frame on a phone (the mobile-lag bug).
//      Judged by counting draw calls across two windows: a still frame's count
//      must not grow, a looping one's must.
//
// Counting `arc` on the 2D context is the cheapest honest instrument: it is the
// call each particle dot makes, so it is proportional to real drawing work, and
// it needs no tracing.
//
// Usage: node scripts/_probe-sphere.mjs <baseUrl> phone|desktop
//
// Scratch tool: the repo's `_` prefix marks it as such.

import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = Number(process.env.CDP_PORT || 9377)
const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find(existsSync)
if (!EDGE) {
  console.error('no Edge binary found')
  process.exit(1)
}

const BASE = process.argv[2]
const MODE = process.argv[3] || 'phone'
const WINDOW_MS = Number(process.env.WINDOW_MS || 1800)
if (!BASE) {
  console.error('usage: node scripts/_probe-sphere.mjs <baseUrl> phone|desktop')
  process.exit(1)
}

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
    const send = (method, params = {}, deadlineMs = 15000) =>
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

const expr = (client, expression, deadlineMs = 15000) =>
  client
    .send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, deadlineMs)
    .then((r) => r?.result?.value ?? null)

// Installed before any page script runs, so every context the page later asks
// for is already wrapped.
const HOOK = `(() => {
  window.__arcs = 0;
  window.__probeCanvas = null;
  const wrap = (ctx) => {
    if (!ctx) return ctx;
    const proto = Object.getPrototypeOf(ctx);
    if (proto.__wrapped) return ctx;
    const origArc = proto.arc;
    proto.arc = function (...args) { window.__arcs++; return origArc.apply(this, args); };
    proto.__wrapped = true;
    return ctx;
  };
  const origGet = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (...args) {
    const ctx = origGet.apply(this, args);
    if (args[0] === '2d') { window.__probeCanvas = this; wrap(ctx); }
    return ctx;
  };
})()`

const main = async () => {
  const wsUrl = await findTarget()
  const client = await connect(wsUrl)
  await client.send('Page.enable')
  await client.send('Runtime.enable')

  const desktop = MODE === 'desktop'
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: desktop ? 1440 : 390,
    height: desktop ? 900 : 844,
    deviceScaleFactor: 1,
    mobile: !desktop,
  })
  await client.send('Emulation.setEmulatedMedia', {
    features: [
      { name: 'hover', value: desktop ? 'hover' : 'none' },
      { name: 'pointer', value: desktop ? 'fine' : 'coarse' },
      { name: 'prefers-reduced-motion', value: 'no-preference' },
    ],
  })
  if (!desktop) {
    await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
  }

  await client.send('Page.addScriptToEvaluateOnNewDocument', { source: HOOK })
  await client.send('Page.navigate', { url: BASE + '/' }, 30000).catch(() => {})
  await sleep(5000)

  // Two consecutive windows over the same still page. A loop grows the count
  // between them; a single still frame does not.
  const a = await expr(client, 'window.__arcs')
  await sleep(WINDOW_MS)
  const b = await expr(client, 'window.__arcs')

  const painted = await expr(
    client,
    `(() => {
      const c = window.__probeCanvas;
      if (!c) return { found: false };
      const ctx = c.getContext('2d');
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let lit = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 8) lit++;
      return { found: true, w: c.width, h: c.height, litPixels: lit, totalPixels: c.width * c.height };
    })()`,
    30000,
  )

  const cdpErrors = await expr(client, 'window.__probeCanvas ? null : "no 2d context captured"')

  const grewInWindow = (b ?? 0) - (a ?? 0)
  const verdict = !painted?.found
    ? 'NO CANVAS'
    : painted.litPixels === 0
      ? 'CANVAS BLANK'
      : grewInWindow > 60
        ? 'ANIMATING'
        : 'STILL FRAME'

  console.log(
    JSON.stringify(
      {
        base: BASE,
        mode: MODE,
        arcsWindow1: a,
        arcsWindow2: b,
        drawCallsInWindow: grewInWindow,
        painted: painted ? { litPixels: painted.litPixels, of: painted.totalPixels } : null,
        note: cdpErrors,
        verdict,
      },
      null,
      1,
    ),
  )
  client.close()
  // Never leave a headless browser behind: an earlier pass filled the machine
  // with orphans and every later measurement was taken on a loaded rig.
  child.kill()
  process.exit(0)
}

const profile = mkdtempSync(join(tmpdir(), 'sphere-'))
const child = spawn(
  EDGE,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=1440,900',
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

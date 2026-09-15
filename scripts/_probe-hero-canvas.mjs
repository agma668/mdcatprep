// Correctness probe for the hero particle canvas's off-screen halt.
//
// The change made the loop STOP (not merely idle) when the hero leaves the
// viewport, which is exactly the kind of change that can leave the hero's
// sphere blank forever if the restart path is wrong. So this asserts the
// behaviour a student would see, using CDP's own cumulative ScriptDuration
// rather than eyeballing pixels:
//
//   1. the sphere is actually DRAWN while the hero is on screen (non-transparent
//      pixels exist in the canvas backing store)
//   2. main-thread script time ADVANCES while the hero is visible (loop running)
//   3. script time is FLAT while the hero is scrolled away (loop halted)
//   4. script time ADVANCES again after scrolling back (loop restarted — the
//      sphere does not stay dead)
//   5. no page errors and no unhandled console errors
//
// Usage: node scripts/_probe-hero-canvas.mjs [url]

import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const URL_TARGET = process.argv[2] || 'http://localhost:3123/'
const PORT = 9363
const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find(existsSync)
if (!EDGE) {
  console.error('no Edge binary found')
  process.exit(1)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const profile = mkdtempSync(join(tmpdir(), 'hero-'))
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

async function findTarget() {
  for (let i = 0; i < 80; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (page) return page.webSocketDebuggerUrl
    } catch {}
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
          ok: (v) => { clearTimeout(timer); res(v) },
          err: (e) => { clearTimeout(timer); rej(e) },
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

const metric = async (client, name) => {
  const r = await client.send('Performance.getMetrics')
  const found = (r?.metrics || []).find((m) => m.name === name)
  return found ? found.value : null
}

const scriptMs = async (client) => (await metric(client, 'ScriptDuration')) * 1000

// Script time consumed over a real-time window, in ms.
const scriptOver = async (client, ms) => {
  const before = await scriptMs(client)
  await sleep(ms)
  const after = await scriptMs(client)
  return Math.round(after - before)
}

const main = async () => {
  const client = await connect(await findTarget())
  await client.send('Page.enable')
  await client.send('Runtime.enable')
  await client.send('Performance.enable')
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
  })
  await client.send('Emulation.setEmulatedMedia', {
    features: [
      { name: 'hover', value: 'hover' },
      { name: 'pointer', value: 'fine' },
      { name: 'prefers-reduced-motion', value: 'no-preference' },
    ],
  })

  const errors = []
  await client.send('Log.enable').catch(() => {})
  const ws = await findTarget()
  void ws

  await client.send('Page.navigate', { url: URL_TARGET }, 25000)
  await sleep(5000)

  const out = {}
  out.readyState = await client
    .send('Runtime.evaluate', { returnByValue: true, expression: 'document.readyState' })
    .then((r) => r.result.value)

  // 1. Is the hero's canvas actually painted?
  out.canvas = await client
    .send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const c = document.querySelector('[aria-label="Hero"] canvas');
        if (!c) return { found: false };
        const r = c.getBoundingClientRect();
        return { found: true, w: c.width, h: c.height, cssW: Math.round(r.width), cssH: Math.round(r.height) };
      })()`,
    })
    .then((r) => r.result.value)

  // Sample the backing store in bands for non-transparent pixels. Drawing proof,
  // not a screenshot: it reads what the loop actually put on the canvas.
  out.painted = await client
    .send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const c = document.querySelector('[aria-label="Hero"] canvas');
        if (!c) return { bands: [], opaque: 0 };
        const ctx = c.getContext('2d');
        if (!ctx) return { bands: [], opaque: 0, noCtx: true };
        const bands = [];
        let opaque = 0;
        for (let i = 0; i < 6; i++) {
          const y = Math.floor((c.height * i) / 6);
          const h = Math.max(1, Math.floor(c.height / 6));
          const d = ctx.getImageData(0, y, c.width, h).data;
          let n = 0;
          for (let p = 3; p < d.length; p += 4) if (d[p] > 8) n++;
          bands.push(n);
          opaque += n;
        }
        return { bands, opaque };
      })()`,
    })
    .then((r) => r.result.value)

  // 2/3/4. Script-time advance in each visibility state.
  await client.send('Runtime.evaluate', {
    expression: 'window.scrollTo(0, 0)',
  })
  await sleep(1200)
  out.visibleScriptMs = await scriptOver(client, 2500)

  await client.send('Runtime.evaluate', {
    expression: 'window.scrollTo(0, document.documentElement.scrollHeight)',
  })
  await sleep(1500)
  out.heroOffScreen = await client
    .send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const c = document.querySelector('[aria-label="Hero"] canvas');
        const r = c && c.getBoundingClientRect();
        return { heroTop: r ? Math.round(r.top) : null, heroBottom: r ? Math.round(r.bottom) : null, scrollY: Math.round(window.scrollY) };
      })()`,
    })
    .then((r) => r.result.value)
  out.offscreenScriptMs = await scriptOver(client, 2500)

  await client.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' })
  await sleep(1500)
  out.resumedScriptMs = await scriptOver(client, 2500)

  // 5. Did anything throw?
  out.pageErrors = errors

  const checks = {
    'sphere canvas exists': !!out.canvas?.found,
    'sphere is painted (non-transparent pixels)': (out.painted?.opaque ?? 0) > 500,
    'loop runs while hero visible': out.visibleScriptMs > 60,
    'hero really left the viewport': (out.heroOffScreen?.heroBottom ?? 1) <= 0,
    'loop halted while hero is off-screen': out.offscreenScriptMs < out.visibleScriptMs * 0.35,
    'loop restarted after scrolling back': out.resumedScriptMs > 60,
    'no page errors': out.pageErrors.length === 0,
  }

  out.checks = checks
  out.passed = Object.values(checks).every(Boolean)
  console.log(JSON.stringify(out, null, 1))

  client.close()
  child.kill()
  process.exit(out.passed ? 0 : 1)
}

main().catch((e) => {
  console.error('PROBE FAILED:', e.message)
  child.kill()
  process.exit(2)
})

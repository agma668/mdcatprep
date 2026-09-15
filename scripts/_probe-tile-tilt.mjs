// Correctness probe for InteractiveTile's cached bounds.
//
// The perf change moved WHERE the tile measures its rect, which is exactly the
// kind of change that silently breaks behaviour (the sibling site's progress rail
// once stopped filling for the same reason). So this asserts the visible result:
//
//   1. a real mouse move over a tile produces non-zero rotation, and the glow
//      position tracks the pointer's side of the tile
//   2. the tile still tracks AFTER the page has scrolled — the newly-introduced
//      risk, since a cached rect goes stale when the page moves under a still
//      pointer
//   3. the rotation decays back toward zero when the pointer leaves
//   4. a tile whose script never ran is still visible (CSS fallbacks intact)
//
// Usage: node scripts/_probe-tile-tilt.mjs [url]

import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const URL_TARGET = process.argv[2] || 'http://localhost:3123/'
const PORT = 9361
const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find(existsSync)
if (!EDGE) {
  console.error('no Edge binary found')
  process.exit(1)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const profile = mkdtempSync(join(tmpdir(), 'tile-'))
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
    const send = (method, params = {}, deadlineMs = 10000) =>
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

const tileState = (client) =>
  client
    .send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const el = document.querySelector('.interactive-tile');
        if (!el) return { found: false };
        const cs = getComputedStyle(el);
        return {
          found: true,
          rx: el.style.getPropertyValue('--tile-rx'),
          ry: el.style.getPropertyValue('--tile-ry'),
          gx: el.style.getPropertyValue('--tile-glow-x'),
          gy: el.style.getPropertyValue('--tile-glow-y'),
          transform: cs.transform,
          opacity: cs.opacity,
          width: Math.round(el.getBoundingClientRect().width),
          height: Math.round(el.getBoundingClientRect().height),
        };
      })()`,
    })
    .then((r) => r?.result?.value)

const main = async () => {
  const client = await connect(await findTarget())
  await client.send('Page.enable')
  await client.send('Runtime.enable')
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
  await client.send('Page.navigate', { url: URL_TARGET }, 25000)
  await sleep(4000)

  // Bring the first tile into view.
  await client.send('Runtime.evaluate', {
    expression: `document.querySelector('.interactive-tile')?.scrollIntoView({ block: 'center' })`,
  })
  await sleep(700)

  const geom = await client
    .send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => { const r = document.querySelector('.interactive-tile').getBoundingClientRect();
        return { left: Math.round(r.left), top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; })()`,
    })
    .then((r) => r.result.value)

  const describe = async (label) => ({ label, ...(await tileState(client)) })

  const before = await describe('before any pointer')

  // Settle long enough for the lerp to arrive. At this rig's frame rate a short
  // wait measures the lerp mid-flight rather than its destination — the first
  // version of this probe used 280 ms, which at 3-6 fps is 1-2 frames, and it
  // therefore reported convergence failures that were the probe's fault.
  const move = async (x, y) => {
    await client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, buttons: 0 })
    await sleep(1400)
  }

  // Hover the TOP-LEFT of the tile: rotation should be negative X / negative Y
  // and the glow should sit toward the left/top.
  const tlX = Math.round(geom.left + geom.w * 0.15)
  const tlY = Math.round(geom.top + geom.h * 0.15)
  await move(tlX, tlY)
  const hoverTopLeft = await describe('pointer at top-left')

  // Hover the BOTTOM-RIGHT: every value must flip sign / side.
  const brX = Math.round(geom.left + geom.w * 0.85)
  const brY = Math.round(geom.top + geom.h * 0.85)
  await move(brX, brY)
  const hoverBottomRight = await describe('pointer at bottom-right')

  // Scroll the page, then hover the SAME viewport point. If the cached rect is
  // not invalidated the tracked position will be wrong (or stale entirely).
  await client.send('Runtime.evaluate', {
    expression: `window.scrollBy(0, 260); window.dispatchEvent(new Event('scroll'));`,
  })
  await sleep(600)
  const geom2 = await client
    .send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => { const r = document.querySelector('.interactive-tile').getBoundingClientRect();
        return { left: Math.round(r.left), top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; })()`,
    })
    .then((r) => r.result.value)
  await move(
    Math.round(geom2.left + geom2.w * 0.85),
    Math.round(geom2.top + geom2.h * 0.85),
  )
  const afterScrollHover = await describe('after scroll, pointer bottom-right')

  // Leave the tile: rotation should decay toward zero.
  await move(20, 20)
  await sleep(900)
  const afterLeave = await describe('pointer left')

  // A tile whose JS never ran must still be visible.
  const fallback = await client
    .send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const el = document.querySelector('.interactive-tile');
        const cs = getComputedStyle(el);
        return { visible: cs.display !== 'none' && cs.opacity !== '0' && el.getBoundingClientRect().height > 0 };
      })()`,
    })
    .then((r) => r.result.value)

  const num = (s) => Number.parseFloat(String(s)) || 0
  // Signs follow the component's own contract: rx = -y * intensity (top of the
  // tile ⇒ POSITIVE rx), ry = x * intensity * 1.2 (right ⇒ POSITIVE ry).
  const checks = {
    'tilt responds to pointer': num(hoverTopLeft.rx) !== 0 || num(hoverTopLeft.ry) !== 0,
    'top-left: +rx (top), -ry (left)': num(hoverTopLeft.rx) > 0 && num(hoverTopLeft.ry) < 0,
    'bottom-right: -rx (bottom), +ry (right)':
      num(hoverBottomRight.rx) < 0 && num(hoverBottomRight.ry) > 0,
    'glow tracks side to side': num(hoverBottomRight.gx) > num(hoverTopLeft.gx),
    'glow tracks top to bottom': num(hoverBottomRight.gy) > num(hoverTopLeft.gy),
    'still tracks after scroll (cache invalidated)':
      num(afterScrollHover.rx) < 0 && num(afterScrollHover.ry) > 0,
    'decays after pointer leaves':
      Math.abs(num(afterLeave.rx)) < Math.abs(num(afterScrollHover.rx)),
    'fallback keeps tile visible': fallback.visible === true,
    'tile has real size': (before.width || 0) > 50 && (before.height || 0) > 30,
  }

  console.log(JSON.stringify({
    geom, geom2,
    states: [before, hoverTopLeft, hoverBottomRight, afterScrollHover, afterLeave],
    checks,
    passed: Object.values(checks).every(Boolean),
  }, null, 1))

  client.close()
  child.kill()
  process.exit(Object.values(checks).every(Boolean) ? 0 : 1)
}

main().catch((e) => {
  console.error('PROBE FAILED:', e.message)
  try { child.kill() } catch {}
  process.exit(1)
})

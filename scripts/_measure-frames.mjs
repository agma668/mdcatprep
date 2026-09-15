// Landing-page frame measurement. Re-derived 2026-09-14; the earlier copy had
// been deleted as scratch.
//
// Read docs/PERF-MEASUREMENT.md first — it states the conditions these numbers
// are only valid under, and the five method limits that voided an earlier pass.
// This script exists to make that doc reproducible rather than a claim.
//
// Usage:
//   node scripts/_measure-frames.mjs <run> [runs...]
//
//   <run> = <viewport>:<target>[:<input>][:<flags>]
//     viewport  desktop | phone
//     target    landing | login | blank
//     input     move | scroll        (default: move on desktop, scroll on phone)
//     flags     comma list; `noeffects` kills blur/filter/blend/shadow/gradient
//               via a document-START style injection (an earlier pass applied
//               it after navigation, which is why it measured nothing)
//
//   desktop:  1440x900, dpr 1, hover/pointer emulated fine  → Lenis IS active
//   phone:     390x844, dpr 3, touch emulation, mobile       → Lenis is gated OFF
//
// Examples:
//   node scripts/_measure-frames.mjs desktop:blank desktop:login desktop:landing
//   node scripts/_measure-frames.mjs phone:landing phone:login phone:blank
//   node scripts/_measure-frames.mjs desktop:landing:scroll   # scroll only, no hover
//
// The `:scroll` variant on desktop is the discriminator that separates
// scroll-driven cost from pointer-driven cost: InteractiveTile only runs on
// pointermove, so if a run with hover is much worse than one without, the cost
// is the hover handler and not the page's scroll work.
//
// Attribution comes from `Performance.getMetrics`, NOT from a trace. A
// `devtools.timeline` trace records every task and running it concurrently with
// the frame loop starves the renderer — it reported ~3 fps on a page that was
// fine, a self-contradiction (heavy fps loss with low task-busy time) that gives
// the flaw away. `Performance.getMetrics` returns the browser's own cumulative
// counters — `TaskDuration`, `ScriptDuration`, `LayoutDuration`,
// `RecalcStyleDuration` — cheaply enough to run alongside the frames, and they
// are the same quantities the trace was being used to estimate. (An earlier
// version of the harness also disabled `Tracing.dataCollected` batching; both
// that and the trace are gone.)

import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE_URL || 'http://localhost:3123'
const PORT = Number(process.env.CDP_PORT || 9355)
const WINDOW_MS = Number(process.env.WINDOW_MS || 8000)
const SETTLE_MS = Number(process.env.SETTLE_MS || 4500)

const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find(existsSync)
if (!EDGE) {
  console.error('no Edge binary found')
  process.exit(1)
}

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, dpr: 1, mobile: false, pointer: 'fine' },
  // Half the area of `desktop`, same pointer class and same Lenis gate. If fps
  // roughly doubles here, the remaining desktop cost scales with viewport AREA,
  // which means it is CPU rasterisation on this GPU-less rig rather than
  // anything a real device would feel. If it does not, it is per-frame work.
  'desktop-sm': { width: 1024, height: 640, dpr: 1, mobile: false, pointer: 'fine' },
  phone: { width: 390, height: 844, dpr: 3, mobile: true, pointer: 'coarse' },
}

const TARGETS = {
  landing: `${BASE}/`,
  login: `${BASE}/login`,
  blank: 'about:blank',
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
    const send = (method, params = {}, deadlineMs = 10000) =>
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
    const eventWaiters = new Map()
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.method && eventWaiters.has(msg.method)) {
        const resolve = eventWaiters.get(msg.method)
        eventWaiters.delete(msg.method)
        resolve(msg.params)
      }
      if (msg.id && pending.has(msg.id)) {
        const { ok, err } = pending.get(msg.id)
        pending.delete(msg.id)
        if (msg.error) err(new Error(JSON.stringify(msg.error)))
        else ok(msg.result)
      }
    }
    ws.onerror = (e) => reject(e)
    ws.onopen = () =>
      resolve({
        send,
        close: () => ws.close(),
        once: (method, deadlineMs = 15000) =>
          new Promise((res, rej) => {
            const timer = setTimeout(() => {
              eventWaiters.delete(method)
              rej(new Error(`no ${method} within ${deadlineMs}ms`))
            }, deadlineMs)
            eventWaiters.set(method, (params) => {
              clearTimeout(timer)
              res(params)
            })
          }),
      })
  })
}

const expr = (client, expression, deadlineMs = 8000) =>
  client
    .send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, deadlineMs)
    .then((r) => r?.result?.value ?? null)

// NOTE: this replaced a `devtools.timeline` trace, which recorded every task and
// starved the frame loop badly enough to report ~3 fps on a page that was fine —
// the self-contradiction (huge fps loss with low task-busy time) is the tell. If a
// future pass wants per-event attribution, run it as a SEPARATE pass.
async function readMetrics(client) {
  const r = await client.send('Performance.getMetrics').catch(() => null)
  const map = {}
  for (const m of r?.metrics || []) map[m.name] = m.value
  return map
}

/** Cumulative process counters → per-run deltas. A negative delta means the
 *  counter reset mid-run, which is reported as null rather than as a number. */
function deltaMetrics(before, after) {
  const d = (k) => {
    const a = after?.[k]
    const b = before?.[k]
    if (typeof a !== 'number' || typeof b !== 'number') return null
    return a >= b ? a - b : null
  }
  const ms = (k) => {
    const v = d(k)
    return v === null ? null : Math.round(v * 1000)
  }
  return {
    taskMs: ms('TaskDuration'),
    scriptMs: ms('ScriptDuration'),
    layoutMs: ms('LayoutDuration'),
    recalcMs: ms('RecalcStyleDuration'),
    recalcCount: d('RecalcStyleCount'),
    layoutCount: d('LayoutCount'),
  }
}

async function runOne(client, spec) {
  const [viewportName, targetName, inputArg, flagArg = ''] = spec.split(':')
  const vp = VIEWPORTS[viewportName]
  const url = TARGETS[targetName]
  if (!vp || !url) throw new Error(`bad run spec: ${spec}`)
  const input = inputArg || (viewportName === 'desktop' ? 'move' : 'scroll')
  const flags = flagArg.split(',').filter(Boolean)

  // Attribution discriminator. Document-start is the whole point: injecting
  // after navigation tests nothing, because the expensive first paint has
  // already happened.
  // Must be removed before the next run: the registration persists for every
  // later navigation in this browser, which would silently contaminate every
  // run after it.
  const inject = []
  if (flags.includes('noeffects')) {
    inject.push(`
      *, *::before, *::after {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        filter: none !important;
        mix-blend-mode: normal !important;
        box-shadow: none !important;
        text-shadow: none !important;
        background-image: none !important;
        animation: none !important;
      }
    `)
  }
  if (flags.includes('nocanvas')) {
    inject.push('canvas { display: none !important; }')
  }
  if (flags.includes('nohover')) {
    inject.push('* { pointer-events: none !important; }')
  }
  // Inside-the-motion-stack discriminators. `reduced` proves the stack costs
  // ~8.5 fps; these say WHICH layer pays it. Display:none removes the layer's
  // raster cost while leaving every JS write in place, so a layer that becomes
  // cheap here is paying in paint, and one that does not is paying in script.
  if (flags.includes('noparallax')) {
    // The three hero atmosphere blobs ScrollEffects moves with translate3d
    // every scroll frame.
    inject.push('[data-speed] { display: none !important; }')
  }
  if (flags.includes('nospotlight')) {
    // The spotlight div (the canvas already has its own `nocanvas` flag).
    inject.push('div[aria-hidden="true"].fixed { display: none !important; }')
  }
  if (flags.includes('noreveal')) {
    // The reveal entrances: same DOM, no animation frames.
    inject.push('[data-reveal] { animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important; }')
  }

  // JS-side discriminators. `coarse` cannot isolate Lenis: the same
  // `(hover: hover) and (pointer: fine)` query that gates SmoothScroll also
  // gates ScrollEffects' spotlight, so "Lenis off" measured with `coarse` was
  // really "Lenis off AND spotlight off". SmoothScroll has a second, independent
  // gate — `navigator.connection.saveData` — so flipping that one turns off
  // Lenis alone and leaves every other layer running.
  const preScript = []
  // `nocanvas` hides the canvases, which removes their PAINT but leaves every
  // rAF loop running — a display:none canvas still services clearRect and
  // drawImage. Returning null from getContext makes the drawing components bail
  // out before starting a loop at all, which is the only way to attribute the
  // canvas cost rather than the canvas pixels.
  if (flags.includes('noloops')) {
    preScript.push(`
      try {
        HTMLCanvasElement.prototype.getContext = function () { return null };
      } catch (e) {}
    `)
  }
  if (flags.includes('nosmoothscroll')) {
    preScript.push(`
      try {
        Object.defineProperty(navigator, 'connection', {
          get: () => ({ saveData: true }),
          configurable: true,
        });
      } catch (e) {}
    `)
  }

  let effectsScriptId = null
  if (inject.length || preScript.length) {
    const css = inject.join('\n')
    const js = preScript.join('\n')
    const added = await client.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        (() => {
          ${js}
          const text = ${JSON.stringify(css)};
          if (text) {
            const s = document.createElement('style');
            s.textContent = text;
            (document.head || document.documentElement).appendChild(s);
          }
        })();
      `,
    })
    effectsScriptId = added?.identifier ?? null
  }

  await client.send('Page.enable')
  await client.send('Runtime.enable')

  await client.send('Emulation.setDeviceMetricsOverride', {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: vp.dpr,
    mobile: vp.mobile,
  })
  // The trap that voided a whole earlier pass: headless reports a COARSE
  // pointer, so `(hover:hover) and (pointer:fine)` is false and anything gated
  // behind it never initialises. Emulate it explicitly.
  // `coarse` keeps the desktop viewport and layout but reports a coarse pointer,
  // which closes SmoothScroll's `(hover: hover) and (pointer: fine)` gate AND
  // ScrollEffects' spotlight/spark gate while leaving the rail and hero parallax
  // running. At constant viewport AREA that isolates the pointer/Lenis layer
  // from the page's own scroll work.
  const pointerClass = flags.includes('coarse') ? 'coarse' : vp.pointer

  await client.send('Emulation.setEmulatedMedia', {
    features: [
      { name: 'hover', value: pointerClass === 'fine' ? 'hover' : 'none' },
      { name: 'pointer', value: pointerClass },
      // `reduced` is the whole-motion-stack discriminator: it makes SmoothScroll
      // return before importing Lenis and makes ScrollEffects drop parallax,
      // spotlight and sparks, so it separates "the motion stack costs this" from
      // "the static page rasterises this slowly".
      { name: 'prefers-reduced-motion', value: flags.includes('reduced') ? 'reduce' : 'no-preference' },
    ],
  })
  if (viewportName === 'phone') {
    await client
      .send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
      .catch(() => {})
  }

  await client.send('Page.navigate', { url }, 25000)
  // Unregister now that this run's document has been created, so the next run
  // in this browser starts clean.
  if (effectsScriptId) {
    await client
      .send('Page.removeScriptToEvaluateOnNewDocument', { identifier: effectsScriptId })
      .catch(() => {})
    effectsScriptId = null
  }
  await sleep(SETTLE_MS)

  // Instrument before any input.
  await expr(
    client,
    `(() => {
      window.__fp = { frames: [], long: 0, longMs: 0 };
      (function loop(prev){ requestAnimationFrame(function(t){
        if (prev) window.__fp.frames.push(t - prev);
        requestAnimationFrame(loop.bind(null, t));
      }); })(0);
      try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__fp.long++; window.__fp.longMs += e.duration; } }).observe({ entryTypes: ['longtask'] }); } catch {}
      return 'armed';
    })()`,
  )

  const conditions = await expr(
    client,
    `(() => {
      const html = document.documentElement;
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        dpr: window.devicePixelRatio,
        coarsePointer: window.matchMedia('(hover: none), (pointer: coarse)').matches,
        finePointer: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
        lenisActive: html.classList.contains('lenis'),
        revealsArmed: html.classList.contains('reveals-armed'),
        // Client-only node: absent if hydration never completed (stale server).
        railFillPresent: !!document.querySelector('.ascent-rail__fill'),
        interactiveTiles: document.querySelectorAll('.interactive-tile').length,
        interactiveTilesVisible: [...document.querySelectorAll('.interactive-tile')].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.top < window.innerHeight && r.bottom > 0;
        }).length,
        canvases: document.querySelectorAll('canvas').length,
        scrollHeight: html.scrollHeight,
      };
    })()`,
  )

  // Main-thread attribution, from the browser's own counters.
  await client.send('Performance.enable', { timeDomain: 'timeTicks' }).catch(() => {})
  const metricsBefore = await readMetrics(client)

  const started = Date.now()
  let moves = 0
  let wheels = 0
  let touches = 0

  while (Date.now() - started < WINDOW_MS) {
    if (viewportName === 'phone') {
      // Explicit touch drag. `Input.synthesizeScrollGesture` looked reasonable
      // but scrolled the page 0 px here — a touch drag of touchStart → several
      // touchMoves → touchEnd is unambiguous, and the run is rejected outright
      // if it still does not move.
      const cx = Math.round(vp.width / 2)
      const cy = Math.round(vp.height * 0.72)
      const ok = async (params) =>
        client.send('Input.dispatchTouchEvent', params, 4000).then(() => true).catch(() => false)
      if (await ok({ type: 'touchStart', touchPoints: [{ x: cx, y: cy, radiusX: 12, radiusY: 12, force: 1 }] })) {
        for (let step = 1; step <= 6; step++) {
          await client
            .send('Input.dispatchTouchEvent', {
              type: 'touchMove',
              touchPoints: [{ x: cx, y: cy - step * 44, radiusX: 12, radiusY: 12, force: 1 }],
            }, 4000)
            .catch(() => {})
        }
        await ok({ type: 'touchEnd', touchPoints: [] })
        touches++
      }
    } else {
      const x = 300 + ((moves * 37) % 700)
      const y = 360 + ((moves * 53) % 220)
      // Pointer movement ONLY in `move` mode. This used to fire on every
      // iteration whatever the mode, which meant a "scroll-only" run was really
      // scroll PLUS a continuous synthetic pointer storm — so the spotlight, the
      // spark canvas, FluidCursor and InteractiveTile were all live in every
      // measurement, and `:scroll` did not isolate what this file's header
      // claims it isolates. Every earlier attribution that relied on that
      // distinction has to be read with this in mind.
      if (input === 'move') {
        await client
          .send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, buttons: 0 })
          .then(() => { moves++ })
          .catch(() => {})
      }
      if (input === 'move' && wheels % 3 === 0) {
        await client
          .send('Input.dispatchMouseEvent', {
            type: 'mouseWheel', x, y, deltaX: 0, deltaY: 300, modifiers: 0,
          })
          .then(() => { wheels++ })
          .catch(() => {})
      } else if (input === 'scroll') {
        // No hover churn at all: park the pointer and drive only the wheel, so
        // InteractiveTile's pointermove path never runs.
        await client.send('Input.dispatchMouseEvent', {
          type: 'mouseWheel', x: 700, y: 450, deltaX: 0, deltaY: 300, modifiers: 0,
        }).then(() => { wheels++ }).catch(() => {})
      }
    }
    await sleep(input === 'scroll' ? 24 : 16)
  }

  const metricsAfter = await readMetrics(client)
  const perf = deltaMetrics(metricsBefore, metricsAfter)

  const frames = await expr(
    client,
    `(() => {
      const f = window.__fp.frames.slice().sort((a, b) => a - b);
      const at = (p) => (f.length ? Math.round(f[Math.min(f.length - 1, Math.floor(f.length * p))]) : null);
      return { samples: f.length, p50: at(0.5), p95: at(0.95), max: f.length ? Math.round(f[f.length - 1]) : null,
               longTasks: window.__fp.long, longTaskMs: Math.round(window.__fp.longMs),
               scrolled: Math.round(window.scrollY) };
    })()`,
  )

  const after = await expr(
    client,
    `({ scrolled: Math.round(window.scrollY), railFill: !!document.querySelector('.ascent-rail__fill'),
        revealed: document.querySelectorAll('[data-scroll-reveal].is-visible').length })`,
  )

  const fps = frames?.samples ? Math.round((frames.samples / (WINDOW_MS / 1000)) * 10) / 10 : null
  const trace = perf

  // Trust checks. A run whose instrumentation is unreliable is reported as
  // such, never as a number.
  const trust = []
  // Landing-specific checks only: /login is deliberately short (cannot scroll)
  // and carries no landing chrome, so those three conditions are false there by
  // design and flagging them would be a false positive.
  if (targetName === 'landing') {
    if (!conditions?.railFillPresent) trust.push('client-only node missing (hydration incomplete or stale server)')
    // Only expected when the run did NOT ask for reduced motion — under reduced
    // motion SmoothScroll returns before importing Lenis, so its absence there
    // is the design, not a failure.
    // A run that deliberately disabled Lenis must not be flagged for its absence.
    if (
      viewportName.startsWith('desktop') &&
      !flags.includes('reduced') &&
      !flags.includes('nosmoothscroll') &&
      !flags.includes('noloops') &&
      !conditions?.lenisActive
    ) {
      trust.push('Lenis not active on desktop (pointer emulation failed)')
    }
    if (viewportName === 'phone' && conditions?.lenisActive) trust.push('Lenis active on phone (should be gated off)')
    if ((after?.scrolled ?? 0) < 200) trust.push('page did not scroll (input starved)')
  }
  if (!frames?.samples || frames.samples < 20) trust.push('too few frames sampled')

  return {
    spec,        conditions: { ...conditions, input, flags, windowMs: WINDOW_MS, settleMs: SETTLE_MS },
    input: { moves, wheels, touches },
    frames,
    fps,
    trace,
    after,
    trust: trust.length ? trust : 'ok',
  }
}

const main = async () => {
  const specs = process.argv.slice(2)
  if (!specs.length) {
    console.error('usage: node scripts/_measure-frames.mjs <viewport>:<target>[:<input>] ...')
    process.exit(1)
  }

  const wsUrl = await findTarget()
  const client = await connect(wsUrl)
  const results = []
  try {
    for (const spec of specs) {
      const r = await runOne(client, spec)
      results.push(r)
      console.log(
        JSON.stringify(
          {
            spec: r.spec,
            flags: r.conditions && r.conditions.flags,
            fps: r.fps,
            frames: r.frames && { p50: r.frames.p50, p95: r.frames.p95, max: r.frames.max, samples: r.frames.samples },
            longTasks: r.frames && `${r.frames.longTasks} (${r.frames.longTaskMs} ms)`,
            mainThread: r.trace,
            lenis: r.conditions && r.conditions.lenisActive,
            tiles: r.conditions && `${r.conditions.interactiveTilesVisible}/${r.conditions.interactiveTiles} visible`,
            scrolled: r.after && r.after.scrolled,
            trust: r.trust,
          },
          null,
          1,
        ),
      )
    }
  } finally {
    client.close()
    child?.kill()
  }
  process.exit(0)
}

const profile = mkdtempSync(join(tmpdir(), 'frames-'))
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
  console.error('HARNESS FAILED:', e.message)
  try {
    child.kill()
  } catch {}
  process.exit(1)
})

// Phone-viewport screenshot + layout audit.
//
// Why this exists: every mobile conclusion so far was read from CSS or inferred
// from a desktop render. This tool renders the real page at a real phone
// viewport and both (a) saves viewport screenshots at each scroll step so the
// result can be LOOKED at, and (b) reports the layout numbers a phone actually
// suffers from — horizontal overflow, elements wider than the screen, tap
// targets under 44 px, text under 12 px.
//
// The `--pointer` flag is the important one. Headless Chrome/Edge reports
// `(hover: hover) and (pointer: fine)` at any width, and `--pointer fine` keeps
// that so the page believes it is on a desktop. That is exactly how a phone can
// end up showing a custom cursor: the CSS media gate says "fine pointer", so a
// component that trusts media queries mounts. `--pointer coarse` emulates the
// real phone instead. Run both to see the difference.
//
// Usage:
//   node scripts/_mobile-shot.mjs --base http://localhost:3123 --out scripts/_shots/med \
//     --routes /,/login,/past-papers --pointer coarse
//
// Scratch tool: the repo's `_` prefix marks it as such.

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = Number(process.env.CDP_PORT || 9366)
const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find(existsSync)
if (!EDGE) {
  console.error('no Edge binary found')
  process.exit(1)
}

const argv = process.argv.slice(2)
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}
const BASE = arg('base', 'http://localhost:3123')
const OUT = arg('out', 'scripts/_shots')
const POINTER = arg('pointer', 'coarse')
const WIDTH = Number(arg('width', '390'))
const HEIGHT = Number(arg('height', '844'))
const MAX_STEPS = Number(arg('steps', '10'))
// `--device mobile|desktop` — desktop keeps a non-mobile viewport so the
// fine-pointer desktop path (the custom cursor) can be checked for regressions
// with the same tool that checks the phone.
const DEVICE = arg('device', 'mobile')
const IS_MOBILE = DEVICE === 'mobile'
// Screenshots are captured at the emulated device scale factor, so a phone at
// DPR 3 produces multi-megabyte PNGs that are too large to attach and review.
// DPR 1 keeps the layout identical for reading purposes and the files small.
const DPR = Number(arg('dpr', '1'))
const ROUTES = arg('routes', '/').split(',').map((r) => r.trim()).filter(Boolean)

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
    // Every event the browser pushes, kept. This audit used to be blind to the
    // console, which is how an error boundary could ship unnoticed: the only
    // way one was found was by looking at a screenshot and reading the words.
    const events = []
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.method) events.push(msg)
      if (msg.id && pending.has(msg.id)) {
        const { ok, err } = pending.get(msg.id)
        pending.delete(msg.id)
        if (msg.error) err(new Error(JSON.stringify(msg.error)))
        else ok(msg.result)
      }
    }
    ws.onerror = (e) => reject(e)
    ws.onopen = () => resolve({ send, close: () => ws.close(), events })
  })
}

const expr = (client, expression, deadlineMs = 15000) =>
  client
    .send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, deadlineMs)
    .then((r) => r?.result?.value ?? null)

/** Browser-pushed errors, deduplicated and trimmed to one line each. */
function collectErrors(events) {
  const out = new Set()
  for (const e of events) {
    if (e.method === 'Runtime.exceptionThrown') {
      const d = e.params?.exceptionDetails
      out.add('exception: ' + String(d?.exception?.description || d?.text || '').replace(/\s+/g, ' ').slice(0, 220))
    } else if (e.method === 'Log.entryAdded' && e.params?.entry?.level === 'error') {
      out.add(
        'log: ' +
          String(e.params.entry.text || '').replace(/\s+/g, ' ').slice(0, 160) +
          ' @ ' +
          String(e.params.entry.url || '').replace(/^https?:\/\/[^/]+/, '').slice(0, 90),
      )
    } else if (e.method === 'Runtime.consoleAPICalled' && e.params?.type === 'error') {
      out.add(
        'console.error: ' +
          (e.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ').replace(/\s+/g, ' ').slice(0, 220),
      )
    }
  }
  return [...out]
}

const AUDIT = `(() => {
  const vw = window.innerWidth;
  const doc = document.scrollingElement || document.documentElement;
  const describe = (el) => {
    const parts = [el.tagName.toLowerCase()];
    if (el.id) parts.push('#' + el.id);
    if (el.className && typeof el.className === 'string') {
      parts.push('.' + el.className.trim().split(/\\s+/).slice(0, 3).join('.'));
    }
    return parts.join('');
  };
  const offenders = [];
  const tiny = [];
  const smallTap = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const overflowRight = r.right - vw;
    if (overflowRight > 1) {
      // Only report the element that actually overflows, not its parents.
      const parent = el.parentElement;
      const parentOverflows = parent && parent.getBoundingClientRect().right - vw > 1;
      if (!parentOverflows) {
        offenders.push({ el: describe(el), overBy: Math.round(overflowRight), width: Math.round(r.width) });
      }
    }
    const fs = parseFloat(cs.fontSize);
    if (fs > 0 && fs < 12 && el.textContent && el.textContent.trim()) {
      const parent = el.parentElement;
      const inherited = parent ? parseFloat(getComputedStyle(parent).fontSize) : 0;
      if (!(inherited > 0 && inherited < 12)) tiny.push({ el: describe(el), px: fs, text: el.textContent.trim().slice(0, 40) });
    }
    const clickable = el.matches('a, button, input, select, textarea, [role="button"]');
    // The tap-44 class (globals.css) expands the HIT area to 44px through an
    // invisible ::after, without changing the visual box; nine controls use it.
    // Measuring the element box alone reported those as failures when they are
    // not, which is the same class of error as the old harness sending a
    // synthetic mouse during "scroll-only" runs. Boost them to compliant.
    const boosted = el.classList.contains('tap-44');
    const effW = boosted ? Math.max(r.width, 44) : r.width;
    const effH = boosted ? Math.max(r.height, 44) : r.height;
    if (clickable && (effW < 44 || effH < 44)) {
      smallTap.push({ el: describe(el), w: Math.round(r.width), h: Math.round(r.height), eff: boosted ? '44+' : undefined, text: (el.textContent || '').trim().slice(0, 30) });
    }
  }
  const root = document.documentElement;
  const cursorEl = document.querySelector('.fluid-cursor');
  const cursorCs = cursorEl ? getComputedStyle(cursorEl) : null;
  const cursorBody = document.querySelector('.fluid-cursor__body');
  return {
    url: location.pathname,
    viewport: { w: vw, h: window.innerHeight, dpr: window.devicePixelRatio },
    horizontalOverflow: Math.round(doc.scrollWidth - doc.clientWidth),
    pageHeight: Math.round(doc.scrollHeight),
    offenders: offenders.slice(0, 14),
    tinyText: tiny.slice(0, 10),
    tinyTextCount: tiny.length,
    smallTap: smallTap.slice(0, 12),
    smallTapCount: smallTap.length,
    pointerMedia: {
      fine: matchMedia('(hover: hover) and (pointer: fine)').matches,
      coarse: matchMedia('(pointer: coarse)').matches,
      hoverNone: matchMedia('(hover: none)').matches,
    },
    cursor: {
      mounted: !!cursorEl,
      dataCustomCursor: root.dataset.customCursor || null,
      cursorInput: root.dataset.cursorInput || null,
      rootCursor: getComputedStyle(root).cursor,
      bodyCursor: getComputedStyle(document.body).cursor,
      elVisible: cursorEl ? cursorEl.dataset.visible : null,
      elDisplay: cursorCs ? cursorCs.display : null,
      elPointerEvents: cursorCs ? cursorCs.pointerEvents : null,
      bodyTransform: cursorBody ? getComputedStyle(cursorBody).transform : null,
    },
    hydration: document.querySelectorAll('.fluid-cursor, canvas').length,
  };
})()`

const main = async () => {
  mkdirSync(OUT, { recursive: true })
  const wsUrl = await findTarget()
  const client = await connect(wsUrl)
  await client.send('Page.enable')
  await client.send('Runtime.enable')

  const report = []
  for (const route of ROUTES) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: DPR,
      mobile: IS_MOBILE,
    })
    await client.send('Emulation.setEmulatedMedia', {
      features: [
        { name: 'hover', value: POINTER === 'fine' ? 'hover' : 'none' },
        { name: 'pointer', value: POINTER },
        { name: 'prefers-reduced-motion', value: 'no-preference' },
      ],
    })
    if (POINTER === 'coarse') {
      await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }).catch(() => {})
    } else {
      await client.send('Emulation.setTouchEmulationEnabled', { enabled: false }).catch(() => {})
    }

    const url = BASE + route
    await client.send('Log.enable').catch(() => {})
    client.events.length = 0
    await client.send('Page.navigate', { url }, 30000).catch(() => {})
    await sleep(3500)

    const audit = await expr(client, AUDIT)
    if (audit) audit.pageErrors = collectErrors(client.events)
    const slug = route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'root'

    // Walk the page in one-viewport steps so scroll-triggered reveals have
    // actually fired by the time each frame is captured.
    const height = audit?.pageHeight || HEIGHT
    const steps = Math.min(MAX_STEPS, Math.max(1, Math.ceil(height / HEIGHT)))
    const shots = []
    for (let i = 0; i < steps; i++) {
      const y = i * HEIGHT
      await expr(client, `window.scrollTo(0, ${y}); ${y}`)
      await sleep(850)
      const shot = await client
        .send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true }, 20000)
        .catch(() => null)
      if (shot?.data) {
        const file = join(OUT, `${slug}-${String(i).padStart(2, '0')}.png`)
        writeFileSync(file, Buffer.from(shot.data, 'base64'))
        shots.push(file)
      }
    }
    report.push({ route, audit, shots })
    console.log(JSON.stringify({ route, audit }, null, 1))
  }
  writeFileSync(join(OUT, 'audit.json'), JSON.stringify(report, null, 1))
  client.close()
  // Never leave a headless browser behind: an earlier pass filled the machine
  // with orphans and every later measurement was taken on a loaded rig.
  child.kill()
  process.exit(0)
}

const profile = mkdtempSync(join(tmpdir(), 'shot-'))
const child = spawn(
  EDGE,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    `--window-size=${WIDTH},${HEIGHT}`,
    '--no-first-run',
    '--disable-gpu',
    '--hide-scrollbars',
    'about:blank',
  ],
  { stdio: 'ignore' },
)

main().catch((e) => {
  console.error('SHOT FAILED:', e.message)
  try {
    child.kill()
  } catch {
    /* ignore */
  }
  process.exit(1)
})

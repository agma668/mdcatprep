# Landing-page performance — method, limits, and the measured answer

Written 2026-09-12 (Freebuff/Codebuff thread). Read this before quoting any perf
number from this repo, and before re-running a measurement pass.

## How these numbers are taken

```bash
node scripts/_measure-frames.mjs <url|baseline> <durationMs> [flags]
#   --gpu        ask for real GPU compositing (no effect in this environment)
#   --nocanvas   hide all <canvas> at document start   (attribution)
#   --noeffects  neutralise blur/blend/filter/shadow   (attribution)
#   --rest       measure at rest, no input at all      (attribution)
#   --trials=N   repeat and report medians
```

Conditions every number below was taken under:

| condition | value |
| --- | --- |
| browser | Edge `153.0.4234.32`, `--headless=new` |
| compositing | **software** — no GPU in this environment |
| viewport | 1440 × 900, dpr 1, forced via `Emulation.setDeviceMetricsOverride` |
| pointer | `(hover: hover) and (pointer: fine)` **emulated** via `Emulation.setEmulatedMedia` |
| reduced motion | `no-preference` |
| settle after navigate | 4,500 ms |
| measurement window | 8,000 ms |
| input | trusted CDP `Input.dispatchMouseEvent` — mouse move every ~16 ms, wheel every 3rd move |
| network | local `next start`, no throttling |

## Method limits — read before quoting a number

1. **The floor is 40 fps / 25 ms p50.** Measured on a blank page *with the same
   input load*. That is a headless software compositor's cadence, not a display's.
   Frame times quantise to multiples of ~25 ms (25.0 / 50.1 / 75.0 …), so a
   p95 of "50 ms" means *every other frame*, not a smooth 50 ms. **Any reading at
   or near 40 fps means "as fast as this rig can measure", not "60 fps".**
2. **GPU cost is not measured.** `--gpu` does not change the compositor here.
   Nothing in this doc speaks to real-device compositing cost.
3. **The input is trusted but synthetic.** Uniform speed, no flick momentum.
   Lenis's work scales with scroll velocity, so a real user's cost *profile*
   differs in shape even if not in kind.
4. **Small trial counts.** Medians are from 2–3 runs. Spread was ~±1.5 fps on the
   landing and 0 on the controls. Treat any difference under ~2 fps as noise.
5. **A server must match its build.** `next start` reads prerendered HTML from
   disk per request, so after a rebuild an already-running server serves *new*
   HTML against *old* chunk hashes and the page never finishes hydrating.
   Symptom: the page loads, but client-only nodes are missing (`.ascent-rail__fill`
   absent) and nothing scrolls. **Always measure on a server started after the
   last build.** Ports 3120–3122 were stale by the end of this pass; 3123 was the
   measuring server.

## The earlier 20-second alarm — what survives

An earlier session reported that the prod landing page "could not answer a CDP
eval for 20 s" and that "neutralising the heavy paint layers made it match the
floor". Both of those runs are **void as evidence**, for one reason:

> Headless reports a **coarse pointer**, so `(hover: hover) and (pointer: fine)`
> is false, so `SmoothScroll`'s gate never opened and **Lenis never initialised**.
> The missing `<html>` classes (`lenis`, `reveals-armed`) were then read as "JS
> never hydrated" when they were really input-capability signals. The
> "paint layers fixed it" comparison therefore compared two pages that had no
> Lenis — not the page users see.

What survives, and what does not:

- **Withdrawn:** the explanation (paint layers) and the runs that supported it.
  `--noeffects` measured **13.1 fps vs 12.2 fps unfixed — no change at all.**
- **Withdrawn:** the specific 20 s eval timeout. It did not reproduce in *any* run
  this pass, before or after the fix; the slowest eval probe was **77 ms**. The
  likely mechanism is limit 5 above, and this pass reproduced exactly that state
  accidentally: after a rebuild, the stale server on 3122 served a page whose
  client-only nodes were absent and which scrolled **0 px** — hydration never
  completed.
- **Upheld, and now properly evidenced:** the landing page *did* have a real
  main-thread problem. Measured with Lenis genuinely active: **12.2 fps against a
  40 fps floor, 94 long tasks totalling 7,479 ms** in an 8 s scroll.

So: the alarm was real, its stated cause was wrong, and its evidence was invalid.
The numbers in the next section replace them.

## The finding

Attribution on the unfixed build, identical conditions:

| run | fps | p50 | long tasks | script | style recalc | layout |
| --- | --- | --- | --- | --- | --- | --- |
| landing | 12.2 | 75 ms | 94 (7,479 ms) | 2,142 ms | **6,156 ms** | 346 ms |
| landing `--noeffects` | 13.1 | 75 ms | 99 (7,492 ms) | 2,319 ms | 6,900 ms | — |
| landing `--nocanvas` | 12.8 | 75 ms | 104 (7,792 ms) | 626 ms | 6,884 ms | 342 ms |
| landing `--rest` (no input) | **39.9** | 25 ms | **0** | 4,612 ms | — | — |
| `/login` | 40.0 | 25 ms | 0 | 180 ms | 23 ms | — |
| blank page + same input | 39.9 | 25 ms | 0 | 20 ms | 0.4 ms | 13 ms |

**58% of main-thread time was style recalculation.** Two independent controls
narrow it decisively: hiding the canvases cut *script* from 2,142 ms to 626 ms
(a 1.5 s saving) yet left long tasks at 7,792 ms and recalc at 6,884 ms — so the
canvases are not the cause. And at rest, with every animation still running, the
page is a flawless 39.9 fps with zero long tasks — so idle rAF loops are not the
cause either. The cost came from **scrolling**, in style invalidation.

The writer: `components/landing/ScrollEffects.tsx` set **four** custom properties
on `document.documentElement` every scroll frame.

## The fix

Two of those four were **dead**. `--section-index` and `--section-progress` had
no consumer anywhere in the project — no `var()` in `globals.css`, nothing in
JS — yet each write on `:root` invalidated the computed style of the entire
document (these properties are unregistered, so they are inherited and Chrome
must re-resolve style for every element that could inherit them). A full-document
style recalc, four times a frame, to publish two numbers nobody read.

The other two are read by three small elements (`--rail` by `.ascent-rail__fill`,
`.ascent-rail__bead` and `.scroll-progress`; `--hero-exit` by `.hero-depth`).

So: the dead writes are gone, and each surviving number is now written onto the
smallest subtree that actually reads it — `--rail` onto the two progress
elements, `--hero-exit` onto `.hero-depth` itself. **Never put a per-frame custom
property back on `<html>`.**

## Result (same harness, same conditions)

| metric | before | after | control floor |
| --- | --- | --- | --- |
| fps | 12.2 | **33.3 – 34.4** | 39.9 |
| p50 frame | 75 ms | **25 ms** | 25 ms |
| p95 frame | 100.2 ms | **50 ms** | 25.5 ms |
| long tasks | 94 (7,479 ms) | **1–7 (52–~300 ms)** | 0 |
| style recalc | 6,156 ms | **2,058 – 2,173 ms** (−66%) | 0.4 ms |
| slowest eval probe | 77 ms | **17 ms** | 2 ms |
| scrolled in 8 s | 2,596 px | **5,217 – 5,370 px** | 8,000 px |

Correctness held, verified rather than assumed (the fix moved where these
variables are written, which is how the rail once silently stopped filling):
rail fill computed `matrix(1, 0, 0, 0.5883, 0, 0)` while scrolled, bead at
`top: 328px`, `.hero-depth` opacity `0.45` — all proportional to scroll position.
`.scroll-progress` reporting `transform: none` is correct: it is
`display: none` above 1024px (it is the phone form of the same data).

Safety rules from the earlier passes still hold: `--hero-exit` defaults to 0, so
`.hero-depth` is `opacity: 1`, `translate: 0` if the writer never runs — a
non-running animation still leaves content visible. Reduced motion never writes
it, so that rule stays an identity.

## Ruled out (do not re-chase these)

- **Paint layers** (blur / backdrop-filter / blend / box-shadow): `--noeffects`
  changed nothing. The earlier lead pointing here came from the void comparison.
- **The canvases**: real script cost (~1.5 s) but not the frame-pacing cause;
  hiding them left long tasks and recalc unchanged.
- **Idle animation loops**: at rest the page sits on the 40 fps floor with zero
  long tasks.
- **Bundle weight**: 603 KB transferred on the landing vs 586 KB on `/login` —
  a 17 KB difference cannot explain a 28 fps gap.

## Still open

- Style recalc is still the largest remaining component (~2.1 s). Not yet
  attributed between Lenis's own writes, the `[data-reveal]` entrance animations,
  and `InteractiveTile`'s four per-hover custom properties.
- 33–34 fps against the 40 fps floor is a large win but not parity; the last
  ~6 fps was not chased, because the pass was scoped to the single biggest cost.
- Everything above concerns **main thread** cost only. Real-device compositing,
  and how this feels on a mid-range Android phone, remains unmeasured.

---

# Pass 2 — 2026-09-14: two viewports, and the attribution above no longer holds

Read this section as an UPDATE, not a replacement. The fix recorded above is
still in the code. What follows is what the page measures as of 2026-09-14.

## Harness, re-derived

The script had been deleted as scratch, so it was rewritten from the conditions
table above — including the viewport, the fine-pointer emulation and the trusted
CDP input — and extended:

```bash
node scripts/_measure-frames.mjs desktop:blank desktop:login desktop:landing
node scripts/_measure-frames.mjs phone:landing phone:landing:reduced
#  <viewport>:<target>[:<input>][:<flags>]
#    viewport  desktop | desktop-sm (1024x640) | phone (390x844 @ dpr3, touch)
#    target    landing | login | blank
#    input     move (default on desktop) | scroll
#    flags     noeffects | nocanvas | nohover | coarse | reduced   (or comma list)
```

`coarse` reports a coarse pointer at a desktop viewport — it closes Lenis's and
the spotlight's gates while keeping full desktop area, which is what isolates
the pointer/Lenis layer from the page's own scroll work. `reduced` disables the
whole motion stack. `noeffects`/`nocanvas`/`nohover` inject at **document start**;
an earlier pass injected after navigation, which is why it measured nothing, and
the injection is now unregistered between runs so it cannot leak forward.

### Method limit 6 — a trace on the frame loop starves it

The first version of this harness layered a `devtools.timeline` trace onto the
frame sampling and reported **3.1 fps with only 24% task-busy time**. That is
self-contradictory: a page cannot be starved of frames by a main thread that is
three-quarters idle. The trace was the cause; removing it did not change the
page. Attribution now comes from `Performance.getMetrics`, which returns the
browser's own cumulative `TaskDuration`, `ScriptDuration`, `LayoutDuration` and
`RecalcStyleDuration` and is cheap enough to run alongside the frames. **A perf
number that contradicts a second perf number is an instrument bug until proven
otherwise.**

### Method limit 7 — runs are now self-rejecting

Every run asserts its own preconditions and prints `trust` instead of a number
when any fail: the client-only rail node must exist (otherwise hydration never
completed — a stale server), Lenis must be active on desktop *unless* the run
asked for reduced motion, Lenis must be off on phone, and the page must actually
have scrolled. Two runs below (`nocanvas`) were rejected by this and are **not
reported**. Frame counts under 20 samples are also rejected.

## Conditions, this pass

Same table as above except: **the floor has moved.** `desktop:blank` and
`/login` now measure **30.1 fps / p50 33 ms / 0 long tasks** on both viewports,
against the 39.9 fps recorded in pass 1 — this rig is ~25% slower than it was
(the machine is shared with other agents' work and a second dev server). Treat
differences under ~2 fps as noise, as before, and compare runs **within** a
session rather than across the two passes.

## Results

All trusted, all 8 s windows, all on a server started after the last build.

| run | viewport | fps | p50 | p95 | long tasks | script | recalc | scrolled |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| blank (control) | desktop | **30.1** | 33 | 33 | 0 | 24 ms | 0 ms | 0 |
| `/login` (control) | desktop | **30.1** | 33 | 33 | 0 | 110 ms | 88 ms | 0 |
| `/login` (control) | phone | **30.3** | 33 | 33 | 0 | 85 ms | 0 ms | 0 |
| landing | phone | **17.8** | 50 | 100 | 0 | 507 ms | 464 ms | 4,570 px |
| landing | phone, effects off | **21.4** | 33 | — | 0 | 401 ms | 446 ms | 5,563 px |
| landing | phone, reduced motion | 17.6 | 50 | 100 | 0 | 538 ms | 472 ms | 4,373 px |
| landing, wheel only | desktop | 6.0 | 150 | 333 | 17 (1,008 ms) | 461 ms | 555 ms | 6,540 px |
| landing, hover + wheel | desktop | **3.0** | 333 | 383 | 18 (999 ms) | 639 ms | 107 ms | 300 px |
| landing, **motion stack off** | desktop | **11.5** | 67 | 183 | **0** | 124 ms | 287 ms | 8,975 px |
| landing, wheel only | desktop-sm | **11.6** | 83 | 167 | 1 (51 ms) | 423 ms | 658 ms | 9,387 px |
| landing, wheel only, effects off | desktop-sm | 11.1 | 83 | 167 | 2 (105 ms) | 424 ms | 745 ms | 9,387 px |

## Attribution

**1. The pass-1 finding no longer describes this build.** Style recalc is no
longer 58% of main-thread time — it is **88–745 ms of an 8 s window**, and script
is 24–639 ms. Main-thread occupancy across every landing run is **14–43%**, and
on phone there are **zero long tasks**. Whatever costs the frames now, it is not
JS and it is not style recalculation.

**2. Lenis is exonerated.** At identical 1440×900 area, turning Lenis off via the
coarse-pointer gate changed nothing: **6.1 → 5.9 fps**. Lenis is not the cost.

**3. The residual desktop deficit scales with viewport AREA.** Halving the
viewport (1440×900 → 1024×640, 0.51× the pixels) nearly **doubled** the frame
rate: 6.0 → 11.6 fps. `noeffects` at the same smaller area changed nothing
(11.6 → 11.1). fps is therefore tracking *pixels painted*, not work performed —
the signature of **CPU rasterisation on this GPU-less rig**, which is method
limit 2 arriving with a number attached. Real devices rasterise on the GPU, so
this part of the desktop number is a rig artifact and should not be quoted as a
user-facing figure.

**4. What is NOT area-proportional, and is therefore real: the desktop motion
stack.** At constant area, disabling it (reduced motion ⇒ no Lenis, no hero
parallax, no spotlight/sparks) takes the landing from **3.0 → 11.5 fps** and
from **18 → 0 long tasks**, and the page scrolls 8,975 px instead of 300 px. That
is a ~3.8× frame-rate effect at fixed pixel count. I could not isolate it further:
the coarse-pointer test removed Lenis and the pointer effects but left parallax
running, and changed nothing — so the cost sits in the reduced-motion remainder,
most likely the hero parallax writing `transform` on three large blurred blobs
every scroll frame. **That is the single biggest named contributor and the next
thing to bisect.**

**5. Phone is the good news, and it was never measured before this pass.** 17.8
fps, p50 50 ms, **0 long tasks**, recalc and script ~12% each. The motion stack
costs it nothing (17.8 vs 17.6 reduced) because Lenis and the spotlight are
gated off below 1024px by design. Neutralising the CSS effect layer is worth
exactly one frame (p50 50 → 33 ms, 17.8 → 21.4 fps), so the effect layer is a real
but bounded cost on the viewport students actually use.

## The retraction

Pass 1 recorded **33.3–34.4 fps** for the fixed landing page on this rig at
1440×900. That does not reproduce: the same page now measures **3.0–6.1 fps**.
The rig accounts for ~25% of that (the floor fell 39.9 → 30.1), not 5×. Either a
regression landed in the landing tree after that pass — several landing
components have uncommitted work from other agents — or an input-cost difference
between the two harnesses is involved; my harness re-emits a mouse move every
~16 ms with a round-trip await, matching the description in pass 1, but that
description is all that survives of the original code. **I could not reconcile it
within this pass, and I am not reporting the pass-1 figure as current.** The
honest position: the *direction* of pass 1's fix is intact and its mechanism
(six root custom-property writes per scroll frame) is gone from the source; the
end-to-end number needs a bisect that this pass did not have the budget for.

## Change made

`components/landing/InteractiveTile.tsx` called `getBoundingClientRect()` inside
every `pointermove` — a forced synchronous style+layout flush per event, on every
tile the pointer crossed, and this landing page carries 14. That is the same
defect class pass 1's sibling site already fixed once (a per-frame
`getComputedStyle` read). The rect is now measured on `pointerenter` and
re-measured only when the page could actually have moved under the pointer —
scroll or resize, both passive, both just setting an invalidation flag.

**Honest result: this moved no aggregate number.** Tiles were `0/14 visible`
during every scroll run, so the change is provably not exercised by these
measurements — desktop wheel-only went 5.6 → 5.4 fps and phone 17.8 → 16.8 fps,
both inside the ~±1.5 fps noise. It is justified by inspection and by the
already-proven defect class, **not** by a measured delta, and it is recorded here
so nobody later credits it with a win it did not produce.

It is verified for correctness, though, because it moved *where* the rect is
measured and that is how the desktop rail once silently stopped filling.`scripts/_probe-tile-tilt.mjs` drives real pointer input and asserts 9 properties
— tilt responds, top-of-tile and left-of-tile produce the signs the component's
own contract requires, the glow tracks both axes, it **still tracks after the
page has scrolled** (the newly-introduced staleness risk), it decays after the
pointer leaves, and a tile whose JS never ran is still visible. All 9 pass —
**re-run last against a freshly rebuilt `next build` served by a restarted server**
(pid confirmed, `✓ Ready`, `curl` 200), because the first run attached to a server
that predated the edit and would have tested the old chunk. That is method-limit #5
in action: a probe that passes against stale chunks is not evidence.

## Settled vs open

**Settled** — do not re-chase: Lenis is not the desktop cost (6.1 → 5.9 fps at
fixed area). Style recalc and script are no longer dominant (14–43% task-busy,
0 long tasks on phone). The residual desktop deficit is area-proportional CPU
rasterisation and is a rig artifact. Phone runs 0 long tasks at ~57% of the floor.
CSS effect layers cost phone exactly one frame.

**Open** — the desktop motion-stack cost at fixed area (3.0 → 11.5 fps), most
likely hero parallax; the unexplained 33 → 3–6 fps gap against pass 1; and still
nothing about real-device GPU compositing.

---

# Pass 4 — the instrument was the story (2026-09-14)

The pass above ended with the desktop motion stack un-bisected: removing the
whole stack moved frames (3.0 → 11.5 fps) but no single layer accounted for it,
and every number in the pass-3 ladder was taken with the harness as it stood.
This pass found out why. **The largest defect in this document was in the
harness, not the page.**

## Retraction: `:scroll` never isolated scroll

`scripts/_measure-frames.mjs` dispatched an `Input.dispatchMouseEvent`
`mouseMoved` on **every iteration of the driving loop regardless of input mode**.
The `:scroll` variant was therefore scroll **plus a continuous synthetic pointer
storm**, with the spotlight, the spark canvas, FluidCursor and all 14
InteractiveTiles live in every run. This file's own header claimed the opposite
("the `:scroll` variant ... separates scroll-driven cost from pointer-driven
cost"). It did not, and nothing measured with it before now does.

What that did to the numbers, same server, same 8 s window, same viewport, warm
runs on both sides, `input=scroll`:

| | polluted (pointer storm) | true scroll-only |
|---|---|---|
| fps | 7.1 – 7.4 | **17.3 – 17.4** |
| p50 frame | 117 – 133 ms | **33 ms** |
| long tasks | 10 (555 ms) | **0** |
| main-thread task time | 2,652 – 2,705 ms | **1,561 – 1,562 ms** |
| script | 365 – 385 ms | 172 – 184 ms |

So the headline symptoms that drove three passes — "7.3 fps", "18 long tasks",
"94 long tasks / 7,479 ms" — were **mostly the instrument**. The page's own
scroll work produces **zero long tasks and a 33 ms median frame**. That does not
rescue the earlier numbers; it withdraws them.

## A second retraction: first-run-in-a-session is not a measurement

The first landing run in a fresh browser is dramatically slower than every run
after it, for reasons that are real (module parse, hydration, first scroll) but
belong to a session's first second, not to steady-state scrolling. On this rig
the first run read 3.5–7.4 fps and later identical runs 11.5–17.4 fps. Controls
are flat: `blank` 30.0/30.1 fps and `login` 30.0/30.1 fps whatever their position.

**Every number in this document that is a single run, or that compares runs taken
at different positions in a session, is unreliable.** The method from here is: a
discarded warm-up run, then matched configs interleaved with each other, compared
on `taskMs` and `ScriptDuration` (stable to ~±5%) rather than fps (which swings
2×).

## The floor moved too

The rig's own ceiling is **30 fps** in this pass (pass 1 recorded 39.9, pass 3
30.1). A 33 ms median frame is the floor, so "the landing page is at 17 fps" and
"this rig cannot render above 30" are the same sentence. Nothing here is a claim
about a real GPU; headless Edge is software-rasterised.

## Corrected attribution — true scroll-only, warm, interleaved

All desktop 1440×900, fine pointer, Lenis genuinely active, wheel input only:

| config | taskMs | fps | long tasks | script | recalc |
|---|---|---|---|---|---|
| baseline | 1,561 / 1,562 | 17.3 / 17.4 | 0 | 172 / 184 | 230 / 232 |
| `noloops` (no 2d context) | 1,165 / 1,176 | 19.5 / 20.0 | 0 | 75 / 80 | 253 / 258 |
| `nosmoothscroll` (Lenis off) | 1,147 | 16.1 | 0 | 112 | 141 |
| `reduced` (everything off) | 405 | 21.0 | 0 | 41 | 28 |

Read plainly: of ~1,560 ms of main-thread work per 8 s of scrolling, the **canvas
render loops are the largest single layer (~395 ms, 25%)**, **Lenis is the second
(~415 ms)**, and the two together are most of the gap to the 405 ms floor. Paint
of the parallax blobs, the spotlight and the reveal entrances is not a
measurable cost (`noparallax`, `nospotlight`, `noreveal` each land inside the
noise), and neither were the per-frame geometry reads removed in pass 3.

`noloops` deserves a note: hiding a canvas with `nocanvas` changes nothing
(2,665 vs 2,670 ms) because a `display:none` canvas still services every draw
call. Only refusing the context — which stops the loop from being built at all —
shows the cost. **Attribution that hides pixels measures pixels; attribution that
stops code measures code.**

## An honesty note on pass 3's "no measured delta" claims

Pass 3 recorded that the `InteractiveTile` rect caching and the `ScrollEffects`
runway caching each "moved no aggregate number". Those measurements were taken
on the polluted harness, so they could not have detected a small win over the
~1,150 ms of synthetic pointer work sitting on top of the page — the ceiling on
resolution was already spent. The claims are not wrong, they are **un-informative**,
and neither change is proven or disproven by them. What can be said about both is
what was verified directly: the tile still tilts, glows, tracks after a scroll and
decays on leave (9 assertions), and the rail still fills proportionally and
retreats to zero at the top.

## Change made: the hero particle loop now halts

`components/landing/HeroParticleField.tsx` re-armed `requestAnimationFrame`
*before* its visibility check and then returned early — so it kept a frame booked
60× a second for the whole session, including every second the student spends
below the hero, which is most of a study session. It now stops: `raf = 0` and no
re-arm, restarted by the IntersectionObserver when the hero returns and by
`visibilitychange` when the tab comes back. Plus a zero-size guard so a
collapsed canvas does not run the per-particle pass to draw nothing.

Measured through the real surface by `scripts/_probe-hero-canvas.mjs`, which uses
CDP's own `ScriptDuration` rather than eyeballing pixels — because the risk this
change introduces is precise: a restart path that never fires leaves the hero's
sphere permanently blank.

| state | main-thread script per 2.5 s |
|---|---|
| hero on screen | **194 ms** |
| hero scrolled off (`heroBottom` −7,649) | **7 ms** |
| scrolled back to top | **199 ms** |

And the sphere is still *there*: 4,468 non-transparent pixels across six bands of
the canvas backing store, 0 page errors, canvas 1430×1256.

## What is settled now, and what is not

**Settled — do not re-chase.** With wheel input and no synthetic pointer: the
landing page produces **0 long tasks** and a **33 ms median frame** (the rig's
floor). Canvas loops ≈ 25% of remaining main-thread work; Lenis ≈ another 25%.
Hiding canvases proves nothing about their cost; refusing their contexts does.
The `[data-reveal]` entrances, the parallax paint and the spotlight paint are not
measurable costs. First run in a session is not a measurement.

**Still open.** The gap between 17 fps and the 30 fps floor once the canvas and
Lenis costs are removed (405 ms of task time producing 21 fps — task time is not
the whole story, so something else is pacing). Whether the pointer-driven layer
(FluidCursor, spotlight, sparks, tiles) is a problem for **real** users, since the
only numbers we have for it came from a harness that moved a synthetic mouse at
~60 Hz — untested, not cleared. And still nothing about real-device GPU
compositing, which no headless run can answer.

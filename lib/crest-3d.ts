/**
 * Pure geometry + shading for the hero crest's live emblem: no React, no DOM,
 * no canvas. Keeping it DOM-free means the exact math the browser paints can
 * also be run in node (frame renders, winding/culling checks) and there is
 * only ever one copy of it. components/landing/CadetCrestCanvas.tsx is the
 * only runtime consumer; CadetCrestStatic.tsx shares the laurel layout at the
 * bottom of this file so the SVG fallback and the live emblem stay the same
 * crest rather than two drawings that drift apart.
 *
 * Model space: a five-pointed star of outer radius 1 lying in z=0, ridged up
 * to a front apex at +APEX_H so each of the ten facets catches the light on
 * its own (that per-facet break-up is what makes brass read as brass), plus a
 * shallower back apex so the star is never hollow when it turns edge-on.
 * Screen space: weak perspective, y flipped for canvas, backfaces culled,
 * remaining facets painted back-to-front.
 *
 * Every colour comes from the brand ramp in app/globals.css. Nothing here
 * invents a shade.
 */

/** Outer radius 1; inner radius 0.385 — the exact ratio the shipped static
 *  polygon uses (a rounded 1/phi^2), so both silhouettes are identical. */
export const STAR_OUTER = 1
export const STAR_INNER = 0.385
export const APEX_H = 0.34
export const BACK_H = 0.16
/** Camera distance in outer-radius units. Small enough to give the turn some
 *  depth, large enough that the near point never fisheyes. */
const PERSPECTIVE = 3.4
const TAU = Math.PI * 2

/** --brass-dim, --brass, --brass-bright (app/globals.css). */
const RAMP: readonly (readonly [number, number, number])[] = [
  [0x8f, 0x72, 0x33],
  [0xc9, 0xa2, 0x4b],
  [0xf2, 0xdc, 0x96],
]

/** Environment map colors for matcap reflections (signal/beacon/brass blobs). */
const ENV_BLOBS: readonly (readonly [number, number, number, number, number])[] = [
  [0.2, 0.3, 0.9, 0.18, 0.35],  // signal blue - center
  [0.8, 0.2, 0.6, 0.12, 0.45],  // beacon cyan - right
  [0.4, 0.8, 0.3, 0.1, 0.5],    // brass gold - left
  [0.6, 0.6, 0.9, 0.08, 0.6],   // signal highlight - top
]

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface StarView {
  /** Radians. yaw spins the star about the vertical axis, pitch tips it. */
  yaw: number
  pitch: number
  /** Canvas centre and the on-screen radius of an outer star point, in px. */
  cx: number
  cy: number
  radius: number
  /** Unit-ish direction the key light comes from; z should stay positive. */
  light: Vec3
  /** 0..1 extra specular bloom — the tap "salute" rides this. */
  bloom?: number
  /** Scroll progress 0..1 for scroll-reactive effects. */
  scrollProgress?: number
  /** Time for animated effects. */
  time?: number
}

/** One shaded triangle, ready for ctx.fill(). */
export interface Facet {
  pts: readonly [number, number][]
  r: number
  g: number
  b: number
  /** Mean model z after rotation; larger is nearer the viewer. */
  depth: number
  /** Facet normal for environment mapping. */
  normal?: Vec3
  /** Facet index for anisotropic direction. */
  index?: number
}

/** Matcap environment map (generated once, cached). */
export interface Matcap {
  canvas: OffscreenCanvas | HTMLCanvasElement
  size: number
}
let matcapCache: Matcap | null = null

/** Generate a procedural matcap for environment reflections. */
export function generateMatcap(size = 256): Matcap {
  if (matcapCache && matcapCache.size === size) return matcapCache

  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(size, size)
    : document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No 2D context for matcap')

  const cx = size / 2
  const cy = size / 2
  const r = size * 0.55

  // Base dark field
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  bg.addColorStop(0, '#0d1524')
  bg.addColorStop(0.6, '#090f1b')
  bg.addColorStop(1, '#05080f')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // Blobs
  for (const [hx, hy, h, sat, pos] of ENV_BLOBS) {
    const x = cx + (hx - 0.5) * size * 1.2
    const y = cy + (hy - 0.5) * size * 1.2
    const radius = r * pos
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
    const hue = h * 360
    grad.addColorStop(0, `hsla(${hue}, ${sat * 100}%, 65%, 0.45)`)
    grad.addColorStop(0.4, `hsla(${hue}, ${sat * 100}%, 50%, 0.25)`)
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
  }

  // Central highlight (window reflection)
  const win = ctx.createRadialGradient(cx * 0.7, cy * 0.7, 0, cx * 0.7, cy * 0.7, r * 0.35)
  win.addColorStop(0, 'rgba(255,255,255,0.35)')
  win.addColorStop(0.5, 'rgba(255,255,255,0.12)')
  win.addColorStop(1, 'transparent')
  ctx.fillStyle = win
  ctx.fillRect(0, 0, size, size)

  matcapCache = { canvas, size }
  return matcapCache
}

/** Sample matcap at normalized direction (x,y,z on hemisphere). */
function sampleMatcap(matcap: Matcap, dir: Vec3): [number, number, number] {
  const { canvas, size } = matcap
  // Map hemisphere to circle: project (x,y) from z=1 plane
  const u = (dir.x * 0.5 + 0.5) * size
  const v = (dir.y * -0.5 + 0.5) * size
  const ctx = canvas.getContext('2d')
  if (!ctx) return [0, 0, 0]
  const data = ctx.getImageData(Math.max(0, Math.min(size - 1, Math.floor(u))), Math.max(0, Math.min(size - 1, Math.floor(v))), 1, 1).data
  return [data[0], data[1], data[2]]
}

/**
 * The ten rim vertices, alternating outer and inner, walking anticlockwise
 * from the top point. Model +y is up, so the caller flips y for canvas.
 * Precomputed once: the render loop only rotates twelve points a frame.
 */
const RIM: readonly Vec3[] = Array.from({ length: 10 }, (_, i) => {
  const outer = i % 2 === 0
  const angle = Math.PI / 2 + (i * TAU) / 10
  const r = outer ? STAR_OUTER : STAR_INNER
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r, z: 0 }
})

function rotate(p: Vec3, yaw: number, pitch: number): Vec3 {
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const y1 = p.y * cp - p.z * sp
  const z1 = p.y * sp + p.z * cp
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  return { x: p.x * cy + z1 * sy, y: y1, z: -p.x * sy + z1 * cy }
}

/** Weak perspective, then canvas coords (y down). */
function project(p: Vec3, view: StarView): [number, number] {
  const s = (PERSPECTIVE / (PERSPECTIVE - p.z)) * view.radius
  return [view.cx + p.x * s, view.cy - p.y * s]
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
const byte = (n: number) => (n < 0 ? 0 : n > 255 ? 255 : Math.round(n))

/** Walk the two-segment brand ramp: dim -> brass -> bright. */
function rampColor(t: number): [number, number, number] {
  const u = clamp01(t)
  const lo = u <= 0.5 ? RAMP[0] : RAMP[1]
  const hi = u <= 0.5 ? RAMP[1] : RAMP[2]
  const k = u <= 0.5 ? u * 2 : (u - 0.5) * 2
  return [
    lo[0] + (hi[0] - lo[0]) * k,
    lo[1] + (hi[1] - lo[1]) * k,
    lo[2] + (hi[2] - lo[2]) * k,
  ]
}

/** Mix two colors. */
function mixColor(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ]
}

/** Precomputed facet normals for anisotropic highlights. */
const FACET_NORMALS: readonly Vec3[] = Array.from({ length: 20 }, (_, i) => {
  const outer = i < 10
  const idx = i % 10
  const angle = Math.PI / 2 + (idx * TAU) / 10 + (outer ? 0 : TAU / 20)
  return { x: Math.cos(angle), y: Math.sin(angle), z: outer ? 0.6 : -0.3 }
})

/**
 * Advanced shading: Lambert + Blinn-Phong + Fresnel rim + Matcap environment + Anisotropic.
 * All colors derive from brand ramp; matcap adds subtle environment reflection.
 */
function shade(n: Vec3, view: StarView, matcap: Matcap | null, facetIndex: number): [number, number, number] {
  const L = view.light
  const bloom = view.bloom ?? 0
  const scroll = view.scrollProgress ?? 0
  const time = view.time ?? 0

  // Lambert diffuse
  const lambert = Math.max(0, n.x * L.x + n.y * L.y + n.z * L.z)
  const base = rampColor(0.16 + 0.84 * lambert)

  // Blinn-Phong specular
  const hx = L.x
  const hy = L.y
  const hz = L.z + 1
  const hl = Math.hypot(hx, hy, hz) || 1
  const ndoth = Math.max(0, (n.x * hx + n.y * hy + n.z * hz) / hl)
  const spec = Math.pow(ndoth, 40) * (0.8 + bloom * 1.6)

  // Fresnel rim (view-dependent edge glow)
  const viewDir = { x: 0, y: 0, z: 1 }
  const fresnel = Math.pow(1 - Math.max(0, n.x * viewDir.x + n.y * viewDir.y + n.z * viewDir.z), 3)
  const rimIntensity = 0.35 + bloom * 0.5 + scroll * 0.2

  // Anisotropic highlight (aligned to facet geometry)
  const anisoNormal = FACET_NORMALS[facetIndex % FACET_NORMALS.length]
  const anisoDir = rotate(anisoNormal, view.yaw, view.pitch)
  const aniso = Math.max(0, anisoDir.x * L.x + anisoDir.y * L.y + anisoDir.z * L.z)
  const anisoSpec = Math.pow(aniso, 60) * 0.4 * (1 + bloom)

  // Matcap environment reflection
  let env = [0, 0, 0]
  if (matcap) {
    env = sampleMatcap(matcap, n)
  }

  // Subsurface scatter during bloom (salute)
  let subsurface = [0, 0, 0]
  if (bloom > 0.01) {
    const scatter = bloom * fresnel * 0.6
    subsurface = [242, 220, 150].map(c => c * scatter) as [number, number, number]
  }

  // Combine: base + spec + rim + aniso + env + subsurface
  const brassBright = RAMP[2]
  const rimColor = [brassBright[0], brassBright[1], brassBright[2]]

  return [
    byte(base[0] + spec * 150 + rimColor[0] * rimIntensity * fresnel + anisoSpec * 200 + env[0] * 0.15 + subsurface[0]),
    byte(base[1] + spec * 140 + rimColor[1] * rimIntensity * fresnel + anisoSpec * 180 + env[1] * 0.15 + subsurface[1]),
    byte(base[2] + spec * 110 + rimColor[2] * rimIntensity * fresnel + anisoSpec * 140 + env[2] * 0.15 + subsurface[2]),
  ]
}

/** Cull-and-shade one triangle. Winding is (apex, a, b) for the front cone and
 *  (apex, b, a) for the back, which puts every visible normal at +z. */
function addFacet(out: Facet[], apex: Vec3, a: Vec3, b: Vec3, view: StarView, matcap: Matcap | null, facetIndex: number) {
  const ux = a.x - apex.x
  const uy = a.y - apex.y
  const uz = a.z - apex.z
  const vx = b.x - apex.x
  const vy = b.y - apex.y
  const vz = b.z - apex.z
  let nx = uy * vz - uz * vy
  let ny = uz * vx - ux * vz
  let nz = ux * vy - uy * vx
  if (nz <= 0) return // facing away from the camera
  const len = Math.hypot(nx, ny, nz) || 1
  nx /= len
  ny /= len
  nz /= len
  const [r, g, b2] = shade({ x: nx, y: ny, z: nz }, view, matcap, facetIndex)
  out.push({
    pts: [project(apex, view), project(a, view), project(b, view)],
    r,
    g,
    b: b2,
    depth: (apex.z + a.z + b.z) / 3,
    normal: { x: nx, y: ny, z: nz },
    index: facetIndex,
  })
}

/** Every visible facet of the star, painted back-to-front by the caller. */
export function projectStar(view: StarView): Facet[] {
  const { yaw, pitch } = view
  const rim = RIM.map((p) => rotate(p, yaw, pitch))
  const front = rotate({ x: 0, y: 0, z: APEX_H }, yaw, pitch)
  const back = rotate({ x: 0, y: 0, z: -BACK_H }, yaw, pitch)
  const out: Facet[] = []

  // Generate matcap once per frame
  const matcap = generateMatcap()

  let facetIndex = 0
  for (let i = 0; i < 10; i++) {
    const a = rim[i]
    const b = rim[(i + 1) % 10]
    addFacet(out, front, a, b, view, matcap, facetIndex++)
    addFacet(out, back, b, a, view, matcap, facetIndex++)
  }
  out.sort((p, q) => p.depth - q.depth)
  return out
}

/** Gold motes on a ring around the star: they share the star's yaw, so they
 *  read as orbiting it rather than drifting on their own axis. */
export const MOTE_COUNT = 14

export interface Mote {
  x: number
  y: number
  size: number
  alpha: number
  /** True while the mote is behind the star, so the caller can paint it first. */
  behind: boolean
}

export function projectMotes(view: StarView, t: number): Mote[] {
  const out: Mote[] = []
  for (let i = 0; i < MOTE_COUNT; i++) {
    const ring = 1.16 + 0.14 * Math.sin(i * 2.399)
    const angle = (i / MOTE_COUNT) * TAU + t * 0.22
    const p = rotate(
      {
        x: Math.cos(angle) * ring,
        y: 0.3 * Math.sin(i * 1.7 + t * 0.6),
        z: Math.sin(angle) * ring,
      },
      view.yaw,
      view.pitch
    )
    const s = PERSPECTIVE / (PERSPECTIVE - p.z)
    const [x, y] = project(p, view)
    out.push({
      x,
      y,
      size: (0.016 + 0.011 * Math.abs(Math.sin(i * 3.1))) * view.radius * s,
      alpha: 0.2 + 0.6 * clamp01((p.z + 1.3) / 2.6),
      behind: p.z < 0,
    })
  }
  return out
}

/* ------------------------------------------------------------------ *
 * Crest furniture shared by the static SVG and the live canvas, in the
 * shipped 200x200 viewBox. One copy of these numbers means the fallback
 * and the emblem can never end up describing two different crests.
 * ------------------------------------------------------------------ */

export const CREST_VIEWBOX = 200
export const LEAF_RX = 7
export const LEAF_RY = 2.6

export interface LaurelLeaf {
  x: number
  y: number
  /** Degrees, matching the SVG rotate() the static crest already uses. */
  rot: number
}

export const LAUREL_LEAVES: readonly LaurelLeaf[] = [
  { x: 88, y: 134, rot: -48 },
  { x: 80, y: 126, rot: -54 },
  { x: 72, y: 117, rot: -60 },
  { x: 65, y: 107, rot: -66 },
  { x: 59, y: 96, rot: -72 },
  { x: 55, y: 86, rot: -78 },
  { x: 112, y: 134, rot: 48 },
  { x: 120, y: 126, rot: 54 },
  { x: 128, y: 117, rot: 60 },
  { x: 135, y: 107, rot: 66 },
  { x: 141, y: 96, rot: 72 },
  { x: 145, y: 86, rot: 78 },
]

export interface LaurelStem {
  from: readonly [number, number]
  c1: readonly [number, number]
  c2: readonly [number, number]
  to: readonly [number, number]
}

export const LAUREL_STEMS: readonly LaurelStem[] = [
  { from: [93, 141], c1: [70, 133], c2: [55, 110], to: [51, 79] },
  { from: [107, 141], c1: [130, 133], c2: [145, 110], to: [149, 79] },
]

/** The stem as an SVG path; asserted equal to the shipped `d` attributes. */
export function stemPath(s: LaurelStem): string {
  return `M${s.from[0]} ${s.from[1]} C${s.c1[0]} ${s.c1[1]} ${s.c2[0]} ${s.c2[1]} ${s.to[0]} ${s.to[1]}`
}

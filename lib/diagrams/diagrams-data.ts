// Interactive labeled diagrams for MDCAT Biology — SVG figures with tappable
// hotspots. Every diagram is a lightweight hand-authored SVG (no images to
// load, crisp at any zoom, works offline) plus a list of hotspot markers:
// { x, y } in the same viewBox coordinates, each with its expected label.
//
// Two study modes use the same data:
//   Explore  — tap a dot, see the name + a one-line function note.
//   Quiz     — the app names a part, the student taps it on the figure.

export type DiagramHotspot = {
  id: string
  /** Hotspot centre in viewBox coordinates. */
  x: number
  y: number
  /** The anatomical name (what the student must recall). */
  label: string
  /** One-line function/fact shown after reveal. */
  note: string
}

export type Diagram = {
  id: string
  title: string
  subject: 'Biology'
  chapter: string
  viewBox: string
  description: string
  /** Raw SVG inner content (paths, shapes) rendered inside the viewBox. */
  svg: string
  hotspots: DiagramHotspot[]
}

// ── Shared palette (matches the dark dashboard field) ────────────────────
const P = {
  tissue: '#5b7a9d',   // muted steel-blue organ fill
  tissue2: '#3d5a78',  // darker shade
  light: '#8fb3d4',    // lighter inner fill
  accent: '#e8b45a',   // brass/gold accent (food path, arrows)
  red: '#c05a5a',      // oxygenated vessels
  blue: '#5a86c0',     // deoxygenated vessels
  bone: '#d9d2c4',     // bone fill
  bone2: '#a89f8e',    // bone shade
  ink: '#c9d6e4',      // stroke ink
} as const

export const DIAGRAMS: Diagram[] = [
  // ── 1. Human heart ────────────────────────────────────────────────────
  {
    id: 'heart',
    title: 'The Human Heart',
    chapter: 'Transport / Circulation',
    subject: 'Biology',
    viewBox: '0 0 400 380',
    description: 'Four chambers, major vessels and the direction of blood flow.',
    svg: `
      <!-- great vessels -->
      <path d="M175 60 Q170 30 200 28 L200 90 L180 95 Z" fill="${P.blue}" />
      <path d="M205 30 Q260 30 268 70 L232 78 Q228 48 205 48 Z" fill="${P.red}" />
      <path d="M150 70 Q120 80 128 130 L158 118 Q150 92 162 80 Z" fill="${P.blue}" />
      <path d="M262 74 Q300 92 292 140 L258 128 Q266 100 258 86 Z" fill="${P.red}" />
      <!-- heart body -->
      <path d="M140 110 Q200 70 262 108 Q310 140 296 210 Q282 282 214 330 Q202 338 192 328 Q120 262 108 190 Q100 132 140 110 Z"
            fill="${P.tissue}" stroke="${P.ink}" stroke-width="2.5" />
      <!-- ventricles shading -->
      <path d="M150 230 Q200 250 262 224 Q252 286 204 324 Q196 330 190 322 Q146 272 150 230 Z" fill="${P.tissue2}" opacity="0.85" />
      <!-- septum -->
      <path d="M202 120 L202 320" stroke="${P.ink}" stroke-width="2" stroke-dasharray="5 5" opacity="0.5" />
      <!-- valves -->
      <path d="M158 132 L182 142" stroke="${P.accent}" stroke-width="4" stroke-linecap="round" />
      <path d="M224 142 L248 132" stroke="${P.accent}" stroke-width="4" stroke-linecap="round" />
      <path d="M168 226 L188 236" stroke="${P.accent}" stroke-width="4" stroke-linecap="round" />
      <path d="M216 236 L236 226" stroke="${P.accent}" stroke-width="4" stroke-linecap="round" />
      <!-- atria shading -->
      <path d="M142 116 Q176 100 190 128 L184 156 Q156 150 146 136 Z" fill="${P.light}" opacity="0.5" />
      <path d="M216 128 Q236 100 262 116 Q258 142 224 156 Z" fill="${P.light}" opacity="0.5" />
    `,
    hotspots: [
      { id: 'right-atrium', x: 162, y: 140, label: 'Right atrium', note: 'Receives deoxygenated blood from the body via the vena cava.' },
      { id: 'left-atrium', x: 236, y: 140, label: 'Left atrium', note: 'Receives oxygenated blood from the lungs via pulmonary veins.' },
      { id: 'right-ventricle', x: 176, y: 250, label: 'Right ventricle', note: 'Pumps deoxygenated blood to the lungs (pulmonary artery).' },
      { id: 'left-ventricle', x: 236, y: 250, label: 'Left ventricle', note: 'Thickest wall — pumps oxygenated blood to the whole body via the aorta.' },
      { id: 'septum', x: 202, y: 195, label: 'Septum', note: 'Wall dividing left and right sides — keeps oxygen-rich and oxygen-poor blood separate.' },
      { id: 'aorta', x: 240, y: 52, label: 'Aorta', note: 'Carries oxygenated blood from the left ventricle to the body.' },
      { id: 'pulmonary-artery', x: 188, y: 58, label: 'Pulmonary artery', note: 'Carries deoxygenated blood from the right ventricle to the lungs.' },
      { id: 'vena-cava', x: 142, y: 92, label: 'Vena cava', note: 'Returns deoxygenated blood from the body to the right atrium.' },
      { id: 'valve-tricuspid', x: 172, y: 137, label: 'Tricuspid valve', note: 'One-way valve between right atrium and right ventricle.' },
      { id: 'valve-bicuspid', x: 234, y: 137, label: 'Bicuspid (mitral) valve', note: 'One-way valve between left atrium and left ventricle.' },
    ],
  },

  // ── 2. Nephron ────────────────────────────────────────────────────────
  {
    id: 'nephron',
    title: 'The Nephron',
    chapter: 'Homeostasis',
    subject: 'Biology',
    viewBox: '0 0 400 380',
    description: 'The kidney’s functional unit — filtration, reabsorption and urine formation.',
    svg: `
      <!-- Bowman's capsule -->
      <path d="M96 88 Q88 60 116 52 Q150 42 158 74 Q160 104 128 110 Q100 114 96 88 Z"
            fill="${P.tissue2}" stroke="${P.ink}" stroke-width="2.5" />
      <circle cx="126" cy="80" r="22" fill="${P.light}" opacity="0.45" />
      <!-- glomerulus -->
      <path d="M112 70 q14 -12 26 2 q-12 12 -26 0 q14 -8 24 6" fill="none" stroke="${P.red}" stroke-width="4" stroke-linecap="round" />
      <!-- proximal tubule -->
      <path d="M150 96 Q196 108 192 152 Q188 186 226 192" fill="none" stroke="${P.tissue}" stroke-width="9" stroke-linecap="round" />
      <!-- loop of Henle (descending + ascending) -->
      <path d="M226 192 Q276 196 278 244 L278 300 Q278 330 250 330 Q222 330 222 300 L222 252 Q222 226 268 228"
            fill="none" stroke="${P.tissue}" stroke-width="9" stroke-linecap="round" />
      <!-- distal tubule -->
      <path d="M268 228 Q312 226 316 186 Q318 158 344 152" fill="none" stroke="${P.tissue}" stroke-width="9" stroke-linecap="round" />
      <!-- collecting duct -->
      <path d="M344 152 Q366 150 366 186 L366 320 Q366 344 340 344"
            fill="none" stroke="${P.light}" stroke-width="12" stroke-linecap="round" opacity="0.9" />
      <!-- afferent/efferent vessels -->
      <path d="M64 56 Q88 52 104 68" fill="none" stroke="${P.red}" stroke-width="6" stroke-linecap="round" />
      <path d="M104 92 Q84 102 66 96" fill="none" stroke="${P.blue}" stroke-width="6" stroke-linecap="round" />
      <!-- capillary net around loop -->
      <path d="M204 260 q-18 6 -16 26 M198 292 q-16 8 -12 26 M388 240 q14 10 8 30 M392 278 q12 12 4 30"
            fill="none" stroke="${P.blue}" stroke-width="3.5" stroke-linecap="round" opacity="0.8" />
      <!-- to ureter arrow -->
      <path d="M322 344 L376 344" stroke="${P.accent}" stroke-width="3.5" stroke-dasharray="6 5" stroke-linecap="round" marker-end="none" />
      <path d="M376 344 l-9 -5 l0 10 Z" fill="${P.accent}" />
    `,
    hotspots: [
      { id: 'bowman', x: 122, y: 62, label: "Bowman's capsule", note: 'Cup-shaped start of the nephron where blood is filtered under pressure.' },
      { id: 'glomerulus', x: 126, y: 80, label: 'Glomerulus', note: 'Knot of capillaries; high pressure forces water, glucose, salts and urea into the capsule.' },
      { id: 'pct', x: 190, y: 130, label: 'Proximal convoluted tubule', note: 'Selectively reabsorbs ALL glucose, most water and salts back into the blood.' },
      { id: 'loop-desc', x: 248, y: 288, label: 'Loop of Henle (descending limb)', note: 'Water leaves by osmosis as the limb dips into the salty medulla.' },
      { id: 'loop-asc', x: 290, y: 232, label: 'Loop of Henle (ascending limb)', note: 'Salts are actively pumped out — makes the medulla salty for water reabsorption.' },
      { id: 'dct', x: 312, y: 200, label: 'Distal convoluted tubule', note: 'Fine-tunes salt and pH; ADH acts downstream in the collecting duct.' },
      { id: 'collecting-duct', x: 366, y: 250, label: 'Collecting duct', note: 'ADH inserts aquaporins here — more ADH means more water reabsorbed, concentrated urine.' },
      { id: 'afferent', x: 78, y: 58, label: 'Afferent arteriole', note: 'Brings blood INTO the glomerulus (wider than the efferent — keeps pressure high).' },
      { id: 'efferent', x: 76, y: 98, label: 'Efferent arteriole', note: 'Carries filtered blood away from the glomerulus (narrower — raises filtration pressure).' },
    ],
  },

  // ── 3. Digestive system ───────────────────────────────────────────────
  {
    id: 'digestive',
    title: 'The Digestive System',
    chapter: 'Nutrition',
    subject: 'Biology',
    viewBox: '0 0 400 380',
    description: 'The complete alimentary canal with the organs that digest and absorb food.',
    svg: `
      <!-- head/neck outline -->
      <path d="M168 22 q32 -12 64 0 q10 4 8 20 l-6 22 q-34 -10 -68 0 l-6 -22 q-2 -16 8 -20 Z" fill="${P.tissue2}" stroke="${P.ink}" stroke-width="2" />
      <!-- oesophagus -->
      <path d="M200 64 Q198 92 200 118" fill="none" stroke="${P.tissue}" stroke-width="12" stroke-linecap="round" />
      <!-- stomach -->
      <path d="M196 116 Q172 112 162 136 Q152 162 176 178 Q204 192 226 174 Q244 158 232 138 Q222 122 196 116 Z"
            fill="${P.tissue}" stroke="${P.ink}" stroke-width="2.5" />
      <!-- small intestine (coiled) -->
      <path d="M182 192 q-28 12 -14 30 q14 18 42 6 q30 -12 16 -28 q-12 -14 -36 -4 q-26 10 -8 26 q18 16 46 4 q28 -12 10 -30"
            fill="none" stroke="${P.tissue}" stroke-width="11" stroke-linecap="round" />
      <!-- large intestine frame -->
      <path d="M148 184 L140 246 Q138 286 168 292 L232 292 Q262 286 260 246 L252 184"
            fill="none" stroke="${P.light}" stroke-width="15" stroke-linecap="round" opacity="0.85" />
      <!-- rectum -->
      <path d="M198 292 L198 330" fill="none" stroke="${P.light}" stroke-width="13" stroke-linecap="round" opacity="0.85" />
      <!-- liver + pancreas hints -->
      <path d="M240 120 q34 -6 44 14 q-20 16 -44 8 Z" fill="${P.tissue2}" stroke="${P.ink}" stroke-width="2" />
      <path d="M238 186 q30 -2 38 12 q-16 12 -38 4 Z" fill="${P.accent}" opacity="0.55" />
      <!-- food path arrow -->
      <path d="M200 34 L200 52" stroke="${P.accent}" stroke-width="3" stroke-dasharray="5 4" />
      <path d="M200 58 l-5 -9 l10 0 Z" fill="${P.accent}" />
    `,
    hotspots: [
      { id: 'mouth', x: 200, y: 34, label: 'Mouth / buccal cavity', note: 'Teeth mechanically digest; salivary amylase starts starch digestion.' },
      { id: 'oesophagus', x: 200, y: 90, label: 'Oesophagus', note: 'Pushes food to the stomach by peristalsis (muscular waves).' },
      { id: 'stomach', x: 192, y: 148, label: 'Stomach', note: 'Pepsin digests protein in acid (pH ~2); muscular churning makes chyme.' },
      { id: 'liver', x: 262, y: 130, label: 'Liver', note: 'Produces bile — emulsifies fats into droplets; stored in the gall bladder.' },
      { id: 'pancreas', x: 258, y: 194, label: 'Pancreas', note: 'Makes pancreatic juice (amylase, lipase, trypsin) and the hormones insulin/glucagon.' },
      { id: 'small-intestine', x: 196, y: 232, label: 'Small intestine', note: 'Digestion completes here; villi absorb nutrients into the blood.' },
      { id: 'large-intestine', x: 152, y: 240, label: 'Large intestine', note: 'Reabsorbs water and salts; houses gut bacteria.' },
      { id: 'rectum', x: 198, y: 314, label: 'Rectum', note: 'Stores faeces before egestion through the anus.' },
    ],
  },

  // ── 4. Human skeleton (anterior view) ─────────────────────────────────
  {
    id: 'skeleton',
    title: 'The Human Skeleton',
    chapter: 'Support & Movement',
    subject: 'Biology',
    viewBox: '0 0 400 380',
    description: 'Anterior view — axial and appendicular bones you must label in the exam.',
    svg: `
      <!-- skull -->
      <ellipse cx="200" cy="42" rx="30" ry="26" fill="${P.bone}" stroke="${P.ink}" stroke-width="2" />
      <path d="M182 58 q18 10 36 0 l-4 10 q-14 6 -28 0 Z" fill="${P.bone2}" />
      <!-- spine -->
      <path d="M200 70 L200 200" stroke="${P.bone2}" stroke-width="10" stroke-linecap="round" />
      <!-- ribcage -->
      <path d="M200 88 Q160 92 152 128 Q148 160 172 176 M200 88 Q240 92 248 128 Q252 160 228 176
               M196 100 Q164 106 158 134 M204 100 Q236 106 242 134
               M196 116 Q166 122 162 146 M204 116 Q234 122 238 146
               M198 132 Q172 138 170 158 M202 132 Q228 138 230 158"
            fill="none" stroke="${P.bone}" stroke-width="5" stroke-linecap="round" />
      <!-- clavicles + arms -->
      <path d="M176 86 L146 92 M224 86 L254 92" stroke="${P.bone}" stroke-width="6" stroke-linecap="round" />
      <path d="M146 94 L128 140 M254 94 L272 140" stroke="${P.bone}" stroke-width="6" stroke-linecap="round" />
      <path d="M128 142 L122 192 M272 142 L278 192" stroke="${P.bone2}" stroke-width="6" stroke-linecap="round" />
      <!-- pelvis -->
      <path d="M178 202 Q160 210 164 228 Q180 238 200 232 Q220 238 236 228 Q240 210 222 202 Z"
            fill="${P.bone}" stroke="${P.ink}" stroke-width="2" />
      <!-- legs -->
      <path d="M184 236 L182 300 M216 236 L218 300" stroke="${P.bone}" stroke-width="7" stroke-linecap="round" />
      <path d="M182 302 L184 348 M218 302 L216 348" stroke="${P.bone2}" stroke-width="6" stroke-linecap="round" />
      <!-- joints -->
      <circle cx="126" cy="141" r="5" fill="${P.bone2}" /><circle cx="274" cy="141" r="5" fill="${P.bone2}" />
      <circle cx="184" cy="301" r="5" fill="${P.bone2}" /><circle cx="216" cy="301" r="5" fill="${P.bone2}" />
    `,
    hotspots: [
      { id: 'skull', x: 200, y: 36, label: 'Skull (cranium)', note: 'Protects the brain; fixed joints between its plates (sutures).' },
      { id: 'ribcage', x: 172, y: 130, label: 'Rib cage', note: 'Protects heart and lungs; moves with breathing (intercostal muscles).' },
      { id: 'spine', x: 200, y: 150, label: 'Vertebral column', note: 'Supports the body and protects the spinal cord; vertebrae have cartilage discs.' },
      { id: 'clavicle', x: 162, y: 89, label: 'Clavicle (collarbone)', note: 'Links the arm to the axial skeleton — commonly fractured.' },
      { id: 'humerus', x: 136, y: 118, label: 'Humerus', note: 'Upper-arm bone; joins the shoulder ball-and-socket joint.' },
      { id: 'radius-ulna', x: 125, y: 168, label: 'Radius & ulna', note: 'Two forearm bones allowing the hand to rotate.' },
      { id: 'pelvis', x: 178, y: 216, label: 'Pelvis (girdle)', note: 'Attaches the legs; supports abdominal organs.' },
      { id: 'femur', x: 183, y: 268, label: 'Femur', note: 'Longest, strongest bone — thigh; joins at the hip ball-and-socket.' },
      { id: 'knee', x: 184, y: 301, label: 'Knee joint', note: 'Hinge joint with cartilage, ligaments and synovial fluid.' },
      { id: 'tibia-fibula', x: 182, y: 326, label: 'Tibia & fibula', note: 'Shin bones; the tibia carries body weight.' },
    ],
  },
]

export const DIAGRAM_META = {
  total: DIAGRAMS.length,
  totalHotspots: DIAGRAMS.reduce((n, d) => n + d.hotspots.length, 0),
} as const

/**
 * Science notation formatter.
 *
 * OCR'd and hand-entered questions carry chemistry and maths in typewriter form:
 * `H2O`, `SO4^2-`, `Fe2+`, `cm3`, `1.1x10-3`, `->`. On screen that reads as a
 * formula dump, not as the notation an exam uses. This module rewrites those
 * into real Unicode notation — subscripts, superscripts, arrows, × — so a
 * question shows `H₂O + CO₂ → C₆H₁₂O₆` everywhere it is rendered, including in
 * exports and flashcards, without needing a maths renderer.
 *
 * It is deliberately conservative and idempotent:
 *  - a formula is only touched when every element symbol in it is a real one
 *    (`H2O` yes, `A2` no, `Class 10` no, `2024` no),
 *  - exponents are only collapsed after an explicit `^` or a ×10,
 *  - already-correct Unicode passes through unchanged.
 */

const ELEMENTS = new Set(
  (
    "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr " +
    "Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu " +
    "Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr " +
    "Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og"
  ).split(" "),
)

const SUB: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  "+": "₊", "-": "₋",
}

const SUP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻",
}

function sub(s: string): string {
  return s.replace(/[0-9+-]/g, (c) => SUB[c] ?? c)
}

function sup(s: string): string {
  return s.replace(/[0-9+-]/g, (c) => SUP[c] ?? c)
}

/** Every element symbol in this formula body a real one? */
function isFormula(body: string): boolean {
  const symbols = body.match(/[A-Z][a-z]?/g)
  return !!symbols && symbols.length > 0 && symbols.every((s) => ELEMENTS.has(s))
}

/**
 * Subscript the counts in a formula: `C6H12O6` → `C₆H₁₂O₆`, `Ca(OH)2` → `Ca(OH)₂`.
 * Only the digits directly following an element symbol or a closing bracket are
 * counts; a leading coefficient (`2H2O`) is left alone.
 */
/**
 * Tokens that look like formulas but are labels: SN2/SN1 are mechanisms, not
 * S-nitrogen compounds, and subscripting them is simply wrong.
 */
const NOT_FORMULAS = /^(?:SN|E|Z|R|S)\d+$/

function subscriptFormula(token: string): string {
  return token.replace(/([A-Za-z)])([0-9]+)/g, (_m, lead: string, digits: string) => lead + sub(digits))
}

// A run of element symbols with counts, optionally with bracketed groups.
const FORMULA = /(?<![A-Za-z])(?:[A-Z][a-z]?[0-9]*|[\(\[][A-Z][a-z]?[0-9]*(?:[A-Z][a-z]?[0-9]*)*[\)\]][0-9]*)+(?![a-z])/g

/**
 * Rewrite science notation in one string. Safe to call twice.
 */
export function formatSci(input: string): string {
  if (!input) return input
  let s = input

  // Arrows: reversible first (`<->` would otherwise read as `->`), then plain.
  s = s.replace(/<=>|<->|⇄|⇋|↔/g, "⇌")
  s = s.replace(/-+>|<-|⟶|–>|=>|==>/g, "→")

  // Multiplication sign between numbers: `2x3`, `1.1 x 10`.
  s = s.replace(/(\d)\s*[xX]\s*(?=\d)/g, "$1 × ")

  // Powers of ten: only after an explicit × or ^, never bare subtraction.
  s = s.replace(/(×\s*10)\s*\^?\s*([-+]?[0-9]{1,2})(?![0-9])/g, (_m, head: string, exp: string) => head + sup(exp))
  s = s.replace(/\b10\s*\^\s*([-+]?[0-9]{1,2})(?![0-9])/g, (_m, exp: string) => "10" + sup(exp))

  // Explicit ionic charge: `SO4^2-` → `SO₄²⁻`.
  s = s.replace(
    /(?<![A-Za-z])((?:[A-Z][a-z]?[0-9]*)+)\s*\^\s*([0-9]{0,2})([+-])(?![A-Za-z0-9])/g,
    (m, body: string, charge: string, sign: string) =>
      isFormula(body) ? subscriptFormula(body) + sup((charge || "1") + sign) : m,
  )

  // Implicit ionic charge: `Fe2+` → `Fe²⁺`, `Cl-` → `Cl⁻`, `OH-` → `OH⁻`.
  s = s.replace(
    /(?<![A-Za-z])((?:[A-Z][a-z]?[0-9]*){1,6})([0-9]{0,2})([+-])(?![A-Za-z0-9])/g,
    (m, body: string, charge: string, sign: string) => {
      const symbols = body.match(/[A-Z][a-z]?/g) ?? []
      if (!isFormula(body) || symbols.length > 3) return m
      // `Fe2+` puts the charge in the trailing digit; `SO4^2-` already split it
      // off, so there the digits are subscripts.
      const trailing = charge ? "" : (body.match(/([0-9]+)$/)?.[1] ?? "")
      const base = subscriptFormula(trailing ? body.slice(0, -trailing.length) : body)
      const chargePart = charge || trailing
      return base + sup(chargePart ? chargePart + sign : sign)
    },
  )

  // General formulas: `CnH2n+2` → `CₙH₂ₙ₊₂`.
  s = s.replace(/(?<![A-Za-z])C(n)H(\d+)?n(\+\d+|-\d+)?/g, (_m, _n, h: string, tail: string) =>
    "CₙH" + (h ? sub(h) : "") + "ₙ" + (tail ? sub(tail) : ""),
  )

  // Neutral formulas: `H2O`, `C6H12O6`, `Ca(OH)2`.
  s = s.replace(FORMULA, (token) =>
    isFormula(token) && !NOT_FORMULAS.test(token) ? subscriptFormula(token) : token,
  )

  // Unit exponents: `cm3` → `cm³`, `mol-1` → `mol⁻¹`.
  s = s.replace(
    /\b(mm|cm|dm|nm|μm|um|km|kg|mg|mL|ml|dL|mol|mmol|kPa|Pa|kJ|J|Hz|W|V|N|s|g|m|L|K|M)(2|3|-1|-2|-3)\b/g,
    (_m, unit: string, exp: string) => unit + sup(exp),
  )

  return s
}

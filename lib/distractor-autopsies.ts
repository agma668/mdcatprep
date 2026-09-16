// Distractor autopsies — the "why was that wrong?" engine.
//
// For every high-yield MCQ, this maps each WRONG option to the cognitive
// trap it sets and how to neutralize it. Unlike a plain explanation (which
// only covers the right answer), an autopsy shows the student the trap they
// nearly fell for — the single highest-yield exam skill is recognizing
// distractors, not just knowing facts.
//
// Data contract (keyed by the question's stable `key` so it never collides
// with edits to the question bodies themselves):
//   [questionKey] => {
//     trapPerOption: { 'A' | 'B' | 'C' | 'D': { why: string, counter: string } }
//       // 'A' is dropped (it's the correct answer); each wrong option gets:
//       //   why     — the trap that makes this option tempting
//       //   counter — one line to defeat it
//     rule: string   // the one-line exam rule this question tests
//   }
//
// Content authored by AKUMA (orchestrator / academic content owner).

export type DistractorAutopsy = {
  trapPerOption: Record<string, { why: string; counter: string }>
  rule: string
}

/**
 * Look up the distractor autopsy for a bundled question by its stable key.
 * Bundled questions carry `key`; bank rows carry `id` and resolve here only
 * if their key was preserved. Returns undefined when no authored autopsy
 * exists yet — callers must render nothing, never a fake.
 */
export function autopsyFor(
  key: string | null | undefined,
  resolve?: (k: string) => DistractorAutopsy | undefined
): DistractorAutopsy | undefined {
  const k = key ?? "";
  if (!k) return undefined;
  return resolve ? resolve(k) : DISTRACTOR_AUTOPSIES[k];
}

export const DISTRACTOR_AUTOPSIES: Record<string, DistractorAutopsy> = {
  // Biology · Cell Structure
  'ee0479e0-ca45-5ce9-ba53-21c76653678a': {
    trapPerOption: {
      B: { why: "The Golgi modifies and packages proteins — it looks 'active' but it never makes ATP.", counter: 'ATP synthesis = mitochondria only. Golgi is the packaging plant.' },
      C: { why: "Ribosomes build proteins and are high-energy workers, tempting students to link 'energy' with activity.", counter: 'Ribosomes consume energy (protein synthesis); they do not produce it.' },
      D: { why: "Lysosomes sound destructive and 'powerful', so students guess them for energy work.", counter: 'Lysosomes are the cell shredder (digestion), not the power plant.' },
    },
    rule: 'Cellular ATP is made in the mitochondrion — associate energy production exclusively with this organelle.',
  },

  // Biology · Cell Structure (plant-only structure)
  'f7f9cb5e-f1ec-5e84-98ba-c797da5e8d8c': {
    trapPerOption: {
      A: { why: "Mitochondria are in almost all cells, but students forget plants have them too — and 'only in plants' invites a false 'energetic' guess.", counter: "Chloroplasts are the ONLY listed organelle restricted to photosynthetic cells." },
      B: { why: "The nucleus is essential and central, making it an intuitive 'special' pick — but every cell has one.", counter: "'Only in plants' needs a photosynthetic/plant-specific structure; nucleus is universal." },
      D: { why: "Ribosomes are tiny and seemed like a niche answer to some students — but they exist in all cells (even prokaryotes).", counter: 'Ribosomes are universal; plant-only = chloroplast, cell wall, large central vacuole.' },
    },
    rule: 'Plant-only structures: chloroplast, cell wall, and large central vacuole — everything else listed is universal.',
  },
}
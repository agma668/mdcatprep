// lib/usat-drill.ts — chapter-style drill grouping for the HEC USAT bank.
//
// The USAT questions are flat (subject → topic, one fine category each —
// profit/loss, pipes, analogies, antonyms…), and the papers rotate those fine
// categories heavily, so a per-topic drill would hand students 1-question
// dead ends (the same conclusion the MDCAT `[subject]` page already reached).
// Instead the bank is grouped into chapter-style sections whose members are
// SELECTED FROM THE TOPIC STRINGS THEMSELVES — the groupings below are
// keyword predicates over the bank's real `topic` values, so counts stay
// derived and a future question lands in a section (or the honest "More"
// bucket) automatically. Nothing here invents topics, chapters for topics that
// do not exist, or a count.
//
// SERVER-ONLY surface: imported by the practice page and the session route —
// never from a client component (groups are passed down as serialized props).

/** One chapter-style section of a USAT subject. */
export type UsatChapter = {
  name: string;
  /** Half-width matches against the bank's own topic strings. */
  test: (topic: string) => boolean;
};

/** Chapters per USAT subject, in the order the metadata suggests drilling. */
export const USAT_DRILL_CHAPTERS: Record<string, UsatChapter[]> = {
  Quantitative: [
    {
      name: "Percentages, Profit & Interest",
      test: (t) => /percent|profit|loss|interest|discount|balance|dealer|unit cost|markup|alligation/i.test(t),
    },
    {
      name: "Averages, Ages & Speed",
      test: (t) => /average|age|speed|clock/i.test(t),
    },
    {
      name: "Numbers, Ratios & Fractions",
      test: (t) => /ratio|fraction|bodmas|inverse|hcf|lcm|modular|number series|ordering/i.test(t),
    },
    {
      name: "Pipes, Cisterns & Work",
      test: (t) => /pipe|cistern|work|scenario/i.test(t),
    },
    {
      name: "Algebra, Equations & Series",
      test: (t) => /algebra|equation|quadratic|logarithm|series|sequence|function|two-variable/i.test(t),
    },
    {
      name: "Geometry, Mensuration & Trigonometry",
      test: (t) => /geometry|mensuration|trig|polygon|coordinate/i.test(t),
    },
    {
      name: "Probability, Statistics & Counting",
      test: (t) => /probability|permutation|combination|counting|statistic|median|mean|dice/i.test(t),
    },
  ],
  Verbal: [
    {
      name: "Analogies",
      test: (t) => /analog/i.test(t),
    },
    {
      name: "Synonyms & Antonyms",
      test: (t) => /synonym|antonym|exact meaning|opposite meaning|vocabulary/i.test(t),
    },
    {
      name: "Sentence Completion",
      test: (t) => /sentence completion|sentence correction/i.test(t),
    },
    {
      name: "Grammar & Usage",
      test: (t) => /concord|subject-verb|conditional|voice|preposition|phrasal|verb form|time clause|used to/i.test(t),
    },
    {
      name: "Parts of Speech",
      test: (t) => /parts of speech/i.test(t),
    },
    {
      name: "Comprehension & Idioms",
      test: (t) => /comprehension|idiom/i.test(t),
    },
  ],
  Biology: [
    {
      name: "Cell Biology & Enzymes",
      test: (t) => /cell|dna|mitosis|molecular|enzyme|biomolecule/i.test(t),
    },
    {
      name: "Genetics, Reproduction & Evolution",
      test: (t) => /genetic|reproduction|embryolog|mendelian|cross|evolution|lamarck/i.test(t),
    },
    {
      name: "Plant Physiology",
      test: (t) => /photosynth|plant|stomata/i.test(t),
    },
    {
      name: "Human Systems",
      test: (t) => /circulat|heart|blood|nephron|excretion|immune|physiolog|transport|nervous|cranial|respiration/i.test(t),
    },
    {
      name: "Microbes, Diversity & Support",
      test: (t) => /kingdom|fungi|bacteria|virus|biotech|support|movement/i.test(t),
    },
  ],
  Chemistry: [
    {
      name: "Atomic Structure & Moles",
      test: (t) => /atomic|stoichiometr|mole/i.test(t),
    },
    {
      name: "Periodic Table & Bonding",
      test: (t) => /periodic|bonding|hybridis/i.test(t),
    },
    {
      name: "Physical Chemistry",
      test: (t) => /gas|equilibrium|solution|energetic|electrochem|indicator/i.test(t),
    },
    {
      name: "Organic Chemistry",
      test: (t) => /organic/i.test(t),
    },
  ],
  Physics: [
    {
      name: "Mechanics",
      test: (t) => /kinemat|newton|vector|work|energy/i.test(t),
    },
    {
      name: "Waves & Optics",
      test: (t) => /wave|sound|optic|refraction/i.test(t),
    },
    {
      name: "Electricity, Electronics & Magnetism",
      test: (t) => /current|electromagnet|magnetic|logic gate|electronic|rectif|galvanometer|ammeter/i.test(t),
    },
    {
      name: "Thermodynamics & Modern Physics",
      test: (t) => /thermo|modern|photoelectric|quantum/i.test(t),
    },
    {
      name: "Measurements & SI Units",
      test: (t) => /measurement|\bunits?\b|quantit/i.test(t),
    },
  ],
};

/** Everything a drill section needs to render: derived, never hand-typed. */
export type UsatDrillChapter = {
  name: string;
  count: number;
  topics: string[];
};

/** Serialized drill map: subject → chapter sections (bank-derived counts). */
export type UsatDrill = Record<string, UsatDrillChapter[]>;

const stripped = (t: string) => t.replace(/\\(["'])/g, "$1");

/**
 * Group a USAT bank (USATEliteQuestion-shaped: subject + topic) into its
 * chapter sections. Every question lands in exactly one section; topics no
 * chapter rule covers fall into an honest trailing "More <subject>" section,
 * so a count can never silently vanish. Empty sections are dropped.
 */
export function deriveUsatDrill(
  bank: readonly { subject: string; topic: string }[]
): UsatDrill {
  /** subject → topic → count, minus subject's chapter membership. */
  const perSubject = new Map<string, Map<string, number>>();
  for (const q of bank) {
    const topic = typeof q.topic === "string" ? stripped(q.topic) : "";
    if (!topic) continue;
    let t = perSubject.get(q.subject);
    if (!t) perSubject.set(q.subject, (t = new Map()));
    t.set(topic, (t.get(topic) ?? 0) + 1);
  }

  const drill: UsatDrill = {};
  for (const [subject, topics] of perSubject) {
    const chapters = USAT_DRILL_CHAPTERS[subject] ?? [];
    const sections: UsatDrillChapter[] = [];
    const claimed = new Set<string>();

    for (const chapter of chapters) {
      const members: string[] = [];
      let count = 0;
      for (const [topic, n] of topics) {
        if (claimed.has(topic)) continue;
        if (chapter.test(topic)) {
          members.push(topic);
          count += n;
          claimed.add(topic);
        }
      }
      if (count > 0) {
        members.sort((a, b) => a.localeCompare(b));
        sections.push({ name: chapter.name, count, topics: members });
      }
    }

    // Honest overflow bucket for topics no rule matched — never dropped.
    const rest = [...topics.keys()].filter((t) => !claimed.has(t));
    if (rest.length > 0) {
      const count = rest.reduce((sum, t) => sum + (topics.get(t) ?? 0), 0);
      rest.sort((a, b) => a.localeCompare(b));
      sections.push({ name: `More ${subject}`, count, topics: rest });
    }

    drill[subject] = sections;
  }
  return drill;
}

/**
 * Resolve a chapter's member-topic set for the session filter. The chapter
 * name must match exactly (they are unique across the map; the trailing
 * "More <subject>" sections make collisions impossible), so the session route
 * and this derivation can never disagree about what a chapter contains.
 */
export function usatChapterTopics(
  bank: readonly { subject: string; topic: string }[],
  chapter: string
): { subject: string | null; topics: Set<string> } | null {
  const drill = deriveUsatDrill(bank);
  for (const [subject, sections] of Object.entries(drill)) {
    const match = sections.find((s) => s.name.toLowerCase() === chapter.toLowerCase());
    if (match) {
      return { subject, topics: new Set(match.topics) };
    }
  }
  return null;
}

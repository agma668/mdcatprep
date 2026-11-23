import {
  TOPICALS_QUARANTINE_SUMMARY,
  TOPICALS_SUBJECTS,
  TOPICALS_TOTAL,
  topicalChapter,
} from "../lib/topicals.ts";

const questions = TOPICALS_SUBJECTS.flatMap((subject) =>
  [...subject.chapters, ...subject.sets].flatMap((entry) => {
    const result = topicalChapter(subject.slug, entry.slug);
    return result?.questions ?? [];
  }),
);

const bySubject = {};
const bySource = {};
const answerState = { keyed: 0, practiceOnly: 0, invalid: 0 };
const missingFields = { key: 0, stem: 0, option: 0, source: 0 };
const duplicateKeys = [];
const seenKeys = new Set();
const exactSignatures = new Set();
let exactDuplicateQuestions = 0;
let explanations = 0;

for (const question of questions) {
  bySubject[question.subject] = (bySubject[question.subject] ?? 0) + 1;
  bySource[question.source] = (bySource[question.source] ?? 0) + 1;

  if (!question.key?.trim()) missingFields.key += 1;
  if (!question.question_text?.trim()) missingFields.stem += 1;
  if (!question.source?.trim()) missingFields.source += 1;
  const options = [
    question.option_a,
    question.option_b,
    question.option_c,
    question.option_d,
  ].map((value) => (typeof value === "string" ? value.trim().replace(/\\s+/g, " ") : ""));
  if (options.some((value) => !value)) missingFields.option += 1;

  if (question.correct_answer === null) answerState.practiceOnly += 1;
  else if (["A", "B", "C", "D"].includes(question.correct_answer)) answerState.keyed += 1;
  else answerState.invalid += 1;

  if (question.explanation?.trim()) explanations += 1;

  if (seenKeys.has(question.key)) duplicateKeys.push(question.key);
  seenKeys.add(question.key);

  const signature = [
    question.question_text,
    ...options,
  ].map((value) => (value ?? "").trim().replace(/\\s+/g, " ")).join("\\u0000");
  if (exactSignatures.has(signature)) exactDuplicateQuestions += 1;
  exactSignatures.add(signature);
}

const report = {
  bank: "served topical bank",
  sourceBaseline: TOPICALS_QUARANTINE_SUMMARY,
  servedRows: TOPICALS_TOTAL,
  rowsBySubject: bySubject,
  rowsBySourceLabel: bySource,
  answerState,
  sourceWrittenExplanations: explanations,
  missingFields,
  duplicateKeyCount: duplicateKeys.length,
  exactDuplicateStemAndOrderedOptionCount: exactDuplicateQuestions,
  subjectTaxonomyNote: "Mathematics is a navigation category, not a separate PM&DC MDCAT paper section.",
  limitations: [
    "This is a structural audit, not an academic correctness review.",
    "It does not establish PM&DC or NUMS exam membership or syllabus-outcome mapping.",
    "It does not clear copyright or reuse rights.",
    "It does not detect all near-duplicates or OCR semantic corruption.",
  ],
};

console.log(JSON.stringify(report, null, 2));

if (
  questions.length !== TOPICALS_TOTAL ||
  Object.values(missingFields).some((count) => count > 0) ||
  duplicateKeys.length > 0 ||
  exactDuplicateQuestions > 0 ||
  answerState.invalid > 0
) {
  process.exitCode = 1;
}

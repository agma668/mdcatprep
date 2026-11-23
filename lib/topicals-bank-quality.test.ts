import assert from "node:assert/strict";
import { test } from "node:test";
import {
  TOPICALS_CHAPTER_COUNT,
  TOPICALS_QUARANTINE_SUMMARY,
  TOPICALS_SET_COUNT,
  TOPICALS_SUBJECTS,
  TOPICALS_TOTAL,
  isSetChapter,
  topicalChapter,
} from "./topicals.ts";

function getServedQuestions() {
  return TOPICALS_SUBJECTS.flatMap((subject) =>
    [...subject.chapters, ...subject.sets].flatMap((entry) => {
      const result = topicalChapter(subject.slug, entry.slug);
      return result?.questions ?? [];
    }),
  );
}

test("every served topical question has four non-empty distinct options and a valid answer state", () => {
  const questions = getServedQuestions();
  assert.equal(questions.length, TOPICALS_TOTAL);

  const keys = new Set<string>();
  for (const question of questions) {
    assert.ok(question.key.trim(), "question key must be present");
    assert.ok(!keys.has(question.key), `duplicate key: ${question.key}`);
    keys.add(question.key);

    assert.ok(question.question_text.trim(), `missing stem: ${question.key}`);
    const options = [
      question.option_a,
      question.option_b,
      question.option_c,
      question.option_d,
    ].map((option) => option.trim().replace(/\s+/g, " "));
    assert.ok(options.every(Boolean), `missing option: ${question.key}`);
    assert.equal(new Set(options).size, 4, `duplicate option: ${question.key}`);

    assert.ok(
      question.correct_answer === null || ["A", "B", "C", "D"].includes(question.correct_answer),
      `invalid answer state: ${question.key}`,
    );
    assert.ok(question.source.trim(), `missing source label: ${question.key}`);
  }
});

test("known malformed source rows remain quarantined from the student-facing topical bank", () => {
  assert.deepEqual(TOPICALS_QUARANTINE_SUMMARY, {
    sourceRows: 16547,
    servedRows: 16294,
    quarantinedRows: 253,
    missingOptionRows: 246,
    duplicateOptionRows: 7,
  });
});


test("source-named mocks and paper collections are grouped as sets, not syllabus chapters", () => {
  assert.equal(TOPICALS_CHAPTER_COUNT, 45);
  assert.equal(TOPICALS_SET_COUNT, 22);
  assert.equal(isSetChapter("FINAL JETS MDCAT MOCK"), true);
  assert.equal(isSetChapter("Balochistan · MDCAT · 2022"), true);
  assert.equal(isSetChapter("500 MOST POWERFUL MCQS FOR MDCAT 2026 with key.p"), true);
  assert.equal(isSetChapter("Biological Molecules"), false);
});

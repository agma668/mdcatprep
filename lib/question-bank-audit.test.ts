import assert from "node:assert/strict";
import { test } from "node:test";
import { MDCAT_QUESTIONS } from "./mdcat.ts";
import { NUST_NET_BANK } from "./nust-questions.ts";
import { PMA_QUESTIONS } from "./pma-questions.ts";
import { USAT_ELITE_BANK } from "./usat-comprehensive-bank.ts";
import { auditQuestionBank } from "./question-bank-audit.ts";

test("bundled MDCAT bank has stable identities and complete MCQ structure", () => {
  const issues = auditQuestionBank(MDCAT_QUESTIONS);
  assert.equal(issues.length, 0, JSON.stringify(issues.slice(0, 30), null, 2));
});

test("bundled HEC scholarship-preparation bank has stable identities and complete MCQ structure", () => {
  const issues = auditQuestionBank(USAT_ELITE_BANK);
  assert.equal(issues.length, 0, JSON.stringify(issues.slice(0, 30), null, 2));
});

test("bundled NUST-pattern bank has stable identities and complete MCQ structure", () => {
  const issues = auditQuestionBank(NUST_NET_BANK);
  assert.equal(issues.length, 0, JSON.stringify(issues.slice(0, 30), null, 2));
});

test("bundled PMA bank has stable identities and valid text/figure question structure", () => {
  const issues = auditQuestionBank(PMA_QUESTIONS);
  assert.equal(issues.length, 0, JSON.stringify(issues.slice(0, 30), null, 2));
});

test("auditor reports duplicate keys, duplicate prompts and invalid answer labels", () => {
  const issues = auditQuestionBank([
    {
      key: "duplicate",
      subject: "Biology",
      question_text: "  What is ATP? ",
      option_a: "Energy currency",
      option_b: "A lipid",
      option_c: "A mineral",
      option_d: "A vitamin",
      correct_answer: "A",
      explanation: "ATP transfers usable energy.",
    },
    {
      key: "duplicate",
      subject: "Biology",
      question_text: "what is   atp?",
      option_a: "Energy currency",
      option_b: "A lipid",
      option_c: "A mineral",
      option_d: "A vitamin",
      correct_answer: "E",
      explanation: "This fixture intentionally contains invalid data.",
    },
  ]);

  assert.deepEqual(
    issues.map((issue) => issue.code),
    ["duplicate_key", "duplicate_question_text", "invalid_correct_answer"],
  );
});

test("figure questions may omit text options but still need an explanation and answer key", () => {
  const issues = auditQuestionBank([
    {
      key: "figure-1",
      category: "Non-Verbal",
      question_text: "Which figure completes the sequence?",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "C",
      explanation: "The sequence rotates clockwise.",
      figure: { style: "rotation-series" },
    },
  ]);

  assert.deepEqual(issues, []);
});

export type QuestionBankRecord = {
  key?: unknown;
  subject?: unknown;
  category?: unknown;
  question_text?: unknown;
  option_a?: unknown;
  option_b?: unknown;
  option_c?: unknown;
  option_d?: unknown;
  correct_answer?: unknown;
  explanation?: unknown;
  figure?: unknown;
};

export type QuestionBankIssue = {
  index: number;
  key: string | null;
  code:
    | "missing_key"
    | "duplicate_key"
    | "missing_question_text"
    | "duplicate_question_text"
    | "missing_subject_or_category"
    | "invalid_correct_answer"
    | "missing_option"
    | "missing_explanation";
  detail: string;
};

const VALID_ANSWERS = new Set(["A", "B", "C", "D"]);
const OPTION_FIELDS = ["option_a", "option_b", "option_c", "option_d"] as const;

function normalizedText(value: unknown): string {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en")
    : "";
}

/**
 * Read-only structural audit for a bundled question bank.
 *
 * It deliberately does not attempt to judge whether an answer is academically
 * correct or whether a question belongs to a particular exam. Those require
 * human content review and an explicit exam/variant mapping.
 */
export function auditQuestionBank(
  questions: readonly QuestionBankRecord[]
): QuestionBankIssue[] {
  const issues: QuestionBankIssue[] = [];
  const seenKeys = new Map<string, number>();
  const seenQuestions = new Map<string, number>();

  questions.forEach((question, index) => {
    const key = typeof question.key === "string" ? question.key.trim() : "";
    const questionText = normalizedText(question.question_text);
    const hasFigure = question.figure !== undefined && question.figure !== null;

    if (!key) {
      issues.push({
        index,
        key: null,
        code: "missing_key",
        detail: "Every question needs a stable non-empty key.",
      });
    } else if (seenKeys.has(key)) {
      issues.push({
        index,
        key,
        code: "duplicate_key",
        detail: `Key already appears at index ${seenKeys.get(key)}.`,
      });
    } else {
      seenKeys.set(key, index);
    }

    if (!questionText) {
      issues.push({
        index,
        key: key || null,
        code: "missing_question_text",
        detail: "Question text is empty.",
      });
    } else if (seenQuestions.has(questionText)) {
      issues.push({
        index,
        key: key || null,
        code: "duplicate_question_text",
        detail: `Normalized question text already appears at index ${seenQuestions.get(questionText)}.`,
      });
    } else {
      seenQuestions.set(questionText, index);
    }

    if (!normalizedText(question.subject) && !normalizedText(question.category)) {
      issues.push({
        index,
        key: key || null,
        code: "missing_subject_or_category",
        detail: "Question needs a subject or category.",
      });
    }

    const answer = typeof question.correct_answer === "string"
      ? question.correct_answer.trim().toUpperCase()
      : "";
    if (!VALID_ANSWERS.has(answer)) {
      issues.push({
        index,
        key: key || null,
        code: "invalid_correct_answer",
        detail: "Correct answer must be A, B, C or D.",
      });
    }

    if (!hasFigure) {
      for (const field of OPTION_FIELDS) {
        if (!normalizedText(question[field])) {
          issues.push({
            index,
            key: key || null,
            code: "missing_option",
            detail: `${field} is empty on a text-based question.`,
          });
        }
      }
    }

    if (!normalizedText(question.explanation)) {
      issues.push({
        index,
        key: key || null,
        code: "missing_explanation",
        detail: "Every student-facing question needs an explanation.",
      });
    }
  });

  return issues;
}

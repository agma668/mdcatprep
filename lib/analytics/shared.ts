/**
 * Canonical attempt row shape used by all analytics computation modules.
 * Imported from here instead of being re-declared in each file.
 */
export interface AttemptRow {
  isCorrect: boolean;
  createdAt: Date;
  subject: string | null;
  topic: string | null;
  timeSpentSeconds: number | null;
}

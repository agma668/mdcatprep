// When a missed question should come back.
//
// The notebook's rhythm is 1 → 3 → 7 days from the last miss, the spacing every
// spaced-repetition primer starts with, keyed on the number of correct
// re-answers since that miss. It is computed from the row's own timestamps, so
// there is no scheduler job and no new column — the notebook reads the same
// table it already reads and works out the date in the browser's time zone.
//
// Pure functions on purpose: the rule can be unit-tested directly and cannot
// drift between the action layer and the card that renders it.

export const RETRY_SPACING_DAYS = [1, 3, 7] as const;
export const DAY_MS = 86_400_000;

export type RetryState = {
  /** Which spacing produced this date (0 = first re-check, 1 = second …). */
  step: number;
  /** ISO timestamp of the next re-check. */
  dueAt: string;
  /** Whole days from now; 0 or less means due (or overdue). */
  daysUntil: number;
  due: boolean;
  /** Short human label: "Due today", "Overdue by 2 days", "Due in 5 days". */
  label: string;
};

function label(daysUntil: number): string {
  if (daysUntil < -1) return `Overdue by ${Math.abs(daysUntil)} days`;
  if (daysUntil === -1) return "Overdue by a day";
  if (daysUntil <= 0) return "Due today";
  if (daysUntil === 1) return "Due tomorrow";
  return `Due in ${daysUntil} days`;
}

/**
 * The next re-check for a mistake missed at `anchorISO` that has since been
 * answered correctly `retriesDone` times. Returns null for an unreadable date
 * rather than inventing a schedule.
 *
 * Once the 7-day step is reached the review keeps a weekly rhythm: it stays
 * due until it is answered again, which is the honest behaviour for something
 * that still has not stuck.
 */
export function retryState(
  anchorISO: string,
  retriesDone: number,
  now: Date = new Date()
): RetryState | null {
  const anchor = new Date(anchorISO);
  if (Number.isNaN(anchor.getTime())) return null;

  const step = Math.max(0, Math.min(Math.floor(retriesDone), RETRY_SPACING_DAYS.length - 1));
  const dueAt = new Date(anchor.getTime() + RETRY_SPACING_DAYS[step] * DAY_MS);
  const daysUntil = Math.ceil((dueAt.getTime() - now.getTime()) / DAY_MS);

  return {
    step,
    dueAt: dueAt.toISOString(),
    daysUntil,
    due: daysUntil <= 0,
    label: label(daysUntil),
  };
}

/** How many days the notebook's forecast strip looks ahead, today included. */
export const FORECAST_DAYS = 7;

export type ForecastDay = {
  /** 0 = today, 1 = tomorrow … */
  offset: number;
  /** "Today" for the first cell, otherwise the short weekday ("Fri"). */
  label: string;
  /** Day of the month, so the strip is dated and not just relative. */
  dayOfMonth: number;
  /** Local calendar date, used as the render key. */
  iso: string;
  /** Reviews the ladder puts on this day. */
  count: number;
};

// Fixed English names rather than toLocaleDateString: the page is pre-rendered
// on the server and hydrated in the browser, and the two can disagree on locale.
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * The week ahead, in reviews per day.
 *
 * This is the same `daysUntil` the cards already show, counted per day — no
 * extra query and no extra storage, so the strip cannot promise a schedule the
 * ladder would not keep. Anything already due (today or overdue) counts on the
 * first cell: an overdue review is work for today, not for the past. Questions
 * beyond the seventh day are outside the strip and simply not shown.
 */
export function forecastWeek(
  daysUntilList: readonly number[],
  now: Date = new Date()
): ForecastDay[] {
  const counts: number[] = new Array(FORECAST_DAYS).fill(0);
  for (const daysUntil of daysUntilList) {
    const offset = Math.max(0, Math.ceil(daysUntil));
    if (offset < FORECAST_DAYS) counts[offset] += 1;
  }

  const days: ForecastDay[] = [];
  for (let offset = 0; offset < FORECAST_DAYS; offset++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    days.push({
      offset,
      label: offset === 0 ? "Today" : WEEKDAY_LABELS[date.getDay()],
      dayOfMonth: date.getDate(),
      iso: `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`,
      count: counts[offset],
    });
  }
  return days;
}

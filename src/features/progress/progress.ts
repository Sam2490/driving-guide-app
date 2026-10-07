import type { ExamRecord, MistakeBook } from '@/services/storage';

/** How many recent mock exams the readiness score looks at. */
export const READINESS_WINDOW = 3;
/** A missed question leaves the mistakes list after this many correct answers in a row. */
export const MASTERED_AFTER = 2;

export type ReadinessLevel = 'none' | 'practise' | 'almost' | 'ready';
export type Readiness = {
  /** 0–100: average score of the last few mock exams. */
  percent: number;
  /** Exams counted (0–3) and how many of them passed. */
  counted: number;
  passed: number;
  level: ReadinessLevel;
};

/**
 * Readiness for the real test, from the learner's own recent mock exams (newest first). No new data is collected:
 * it is the average of the last three scores, labelled "ready" only when all of them passed with room to spare.
 */
export function readiness(history: readonly ExamRecord[], passRatio = 21 / 30): Readiness {
  const recent = history.slice(0, READINESS_WINDOW);
  if (recent.length === 0) return { percent: 0, counted: 0, passed: 0, level: 'none' };
  const percent = Math.round((recent.reduce((a, r) => a + r.correct / r.total, 0) / recent.length) * 100);
  const passed = recent.filter((r) => r.passed).length;
  const ready = recent.length === READINESS_WINDOW && passed === READINESS_WINDOW && percent >= 80;
  const level: ReadinessLevel = ready ? 'ready' : percent >= Math.round(passRatio * 100) ? 'almost' : 'practise';
  return { percent, counted: recent.length, passed, level };
}

/** Change in readiness caused by the newest exam (in points), or null when there is nothing to compare. */
export function readinessChange(history: readonly ExamRecord[]): number | null {
  if (history.length < 2) return null;
  return readiness(history).percent - readiness(history.slice(1)).percent;
}

/** Adds missed question ids to the book (a miss resets the run of correct answers). */
export function recordMisses(book: MistakeBook, ids: readonly string[]): MistakeBook {
  if (!ids.length) return book;
  const next = { ...book };
  for (const id of ids) next[id] = 0;
  return next;
}

/** A correct answer to a saved mistake counts toward mastering it; the second in a row removes it. */
export function recordCorrect(book: MistakeBook, ids: readonly string[]): MistakeBook {
  let next: MistakeBook | null = null;
  for (const id of ids) {
    if (!(id in book)) continue;
    next ??= { ...book };
    const run = (next[id] ?? 0) + 1;
    if (run >= MASTERED_AFTER) delete next[id];
    else next[id] = run;
  }
  return next ?? book;
}

/** Ids in the order they should be practised: least progress first, then most recently added. */
export function mistakeIds(book: MistakeBook): string[] {
  return Object.keys(book).sort((a, b) => book[a] - book[b]);
}

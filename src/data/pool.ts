import { QUESTIONS } from './questions';

/**
 * Questions held out of every practice mode (mock exam, levels, mistakes drill) until a driving expert rules on their
 * answer keys. The questions and their keys stay unchanged in the bank (integrity tests still cover them); they are
 * only not asked. Approved by the app owner on 2026-10-15 (Expert Review Report, Part 1):
 * - q140: the key says the speed limit need not be followed.
 * - q469: "Both of the above" fits better than the key "Concentration".
 * - q565: no option is clearly false.
 * To bring a question back, remove its id here.
 */
export const HELD_OUT: ReadonlySet<string> = new Set(['q140', 'q469', 'q565']);

/** The questions the app asks. */
export const POOL = QUESTIONS.filter((q) => !HELD_OUT.has(q.id));

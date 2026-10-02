import type { Question } from '@/data/types';
import { mulberry32, shuffle } from '@/features/quiz/random';
import { prepareQuestion } from '@/features/quiz/engine';
import type { Rng } from '@/features/quiz/random';

export const QUESTIONS_PER_LEVEL = 8;
export const ATTEMPTS = 5;
export const LEVELS_PER_STAGE = 5;
export const RANK_XP = [0, 150, 500, 1100, 2200, 4000] as const;
const SEED = 2026;

/** Fixed question order for the level challenge (same seed and algorithm as the web app). */
export function levelOrder(bankSize: number): number[] {
  const rng = mulberry32(SEED);
  const a = Array.from({ length: bankSize }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function levelCount(bankSize: number): number {
  return Math.floor(bankSize / QUESTIONS_PER_LEVEL);
}

export function stageCount(bankSize: number): number {
  return Math.ceil(levelCount(bankSize) / LEVELS_PER_STAGE);
}

export function levelQuestions(bank: readonly Question[], level: number, rng: Rng = Math.random): Question[] {
  const order = levelOrder(bank.length);
  return order.slice((level - 1) * QUESTIONS_PER_LEVEL, level * QUESTIONS_PER_LEVEL).map((i) => prepareQuestion(bank[i], rng));
}

export function rankFor(xp: number): number {
  let r = 0;
  RANK_XP.forEach((v, i) => {
    if (xp >= v) r = i;
  });
  return r;
}

/** Progress toward the next rank, 0–1 (1 at the top rank). */
export function rankProgress(xp: number): number {
  const r = rankFor(xp);
  const next = RANK_XP[r + 1];
  return next === undefined ? 1 : (xp - RANK_XP[r]) / (next - RANK_XP[r]);
}

export type Progress = {
  xp: number;
  streak: number;
  /** Last day (YYYY-MM-DD, local) a level was completed. */
  last?: string;
  /** Best result per level: 1–3. */
  done: Record<number, number>;
};

export const EMPTY_PROGRESS: Progress = { xp: 0, streak: 0, done: {} };

export function currentLevel(p: Progress, total: number): number {
  const top = Math.max(0, ...Object.keys(p.done).map(Number));
  return Math.min(total, top + 1);
}

export function isUnlocked(p: Progress, level: number, total: number): boolean {
  return level <= currentLevel(p, total);
}

export type Run = {
  level: number;
  index: number;
  attempts: number;
  correct: number;
  combo: number;
  xp: number;
  results: boolean[];
};

export function startRun(level: number): Run {
  return { level, index: 0, attempts: ATTEMPTS, correct: 0, combo: 0, xp: 0, results: [] };
}

/** Applies one answer: 10 XP per correct answer, +5 from the third correct in a row. */
export function answerRun(run: Run, good: boolean): { run: Run; gain: number } {
  const combo = good ? run.combo + 1 : 0;
  const gain = good ? 10 + (combo >= 3 ? 5 : 0) : 0;
  return {
    gain,
    run: {
      ...run,
      combo,
      attempts: good ? run.attempts : run.attempts - 1,
      correct: run.correct + (good ? 1 : 0),
      xp: run.xp + gain,
      results: [...run.results, good],
    },
  };
}

export function isFailed(run: Run): boolean {
  return run.attempts <= 0;
}

export function starsFor(correct: number, total: number): number {
  const wrong = total - correct;
  return wrong === 0 ? 3 : wrong <= 2 ? 2 : 1;
}

export function localDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Records a finished level. Completion bonus (20, or 30 with no mistakes) is paid only the first time. */
export function completeLevel(p: Progress, run: Run, total: number, now = new Date()): { progress: Progress; earned: number; stars: number; rankUp: number | null } {
  const stars = starsFor(run.correct, total);
  const first = !p.done[run.level];
  const earned = run.xp + (first ? 20 + (stars === 3 ? 10 : 0) : 0);
  const today = localDay(now);
  const yesterday = localDay(new Date(now.getTime() - 864e5));
  let streak = p.streak;
  if (p.last !== today) streak = p.last === yesterday ? streak + 1 : 1;
  const progress: Progress = {
    xp: p.xp + earned,
    streak,
    last: today,
    done: { ...p.done, [run.level]: Math.max(p.done[run.level] ?? 0, stars) },
  };
  const before = rankFor(p.xp);
  const after = rankFor(progress.xp);
  return { progress, earned, stars, rankUp: after > before ? after : null };
}

export { shuffle };

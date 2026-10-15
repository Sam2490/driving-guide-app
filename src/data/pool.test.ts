import { QUESTIONS } from './questions';
import { HELD_OUT, POOL } from './pool';
import { levelCount, levelQuestions, levelOrder, QUESTIONS_PER_LEVEL } from '@/features/levels/levels';
import { DEFAULT_EXAM, startExam } from '@/features/quiz/engine';
import { mulberry32 } from '@/features/quiz/random';
import { SIGN_NAMES } from './i18n/signs';
import { SIGNS } from './signs';

describe('questions held out until an expert rules (owner approval, 2026-10-15)', () => {
  it('holds out exactly q140, q469 and q565, which stay in the bank unchanged', () => {
    expect([...HELD_OUT].sort()).toEqual(['q140', 'q469', 'q565']);
    for (const id of HELD_OUT) expect(QUESTIONS.some((q) => q.id === id)).toBe(true);
    expect(POOL).toHaveLength(QUESTIONS.length - 3);
    expect(POOL.some((q) => HELD_OUT.has(q.id))).toBe(false);
  });

  it('never asks them in a mock exam', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 300; i++) {
      const exam = startExam(POOL, DEFAULT_EXAM, 0, rng);
      expect(exam.questions.some((q) => HELD_OUT.has(q.id))).toBe(false);
    }
  });

  it('never asks them in a level, and every other question still has a level', () => {
    const n = levelCount(POOL.length);
    expect(n).toBe(levelCount(QUESTIONS.length)); // still 82 levels: saved progress keeps its meaning
    const asked = new Set<string>();
    for (let l = 1; l <= n; l++) {
      const qs = levelQuestions(QUESTIONS, l, Math.random, HELD_OUT);
      expect(qs).toHaveLength(QUESTIONS_PER_LEVEL);
      for (const q of qs) {
        expect(HELD_OUT.has(q.id)).toBe(false);
        asked.add(q.id);
      }
    }
    expect(asked.size).toBe(n * QUESTIONS_PER_LEVEL);
  });

  it('leaves the levels before the first held-out question exactly as they were', () => {
    const order = levelOrder(QUESTIONS.length);
    const first = Math.min(...[...HELD_OUT].map((id) => order.indexOf(QUESTIONS.findIndex((q) => q.id === id))));
    const untouched = Math.floor(first / QUESTIONS_PER_LEVEL);
    for (let l = 1; l <= untouched; l++) {
      expect(levelQuestions(QUESTIONS, l, Math.random, HELD_OUT).map((q) => q.id).sort()).toEqual(
        levelQuestions(QUESTIONS, l).map((q) => q.id).sort(),
      );
    }
  });
});

describe('curve-sign names match their pictures (build 38 phone check B38-7, owner approval)', () => {
  // s004's road bends left first; s005 is its mirror. q527 (s004) and q130 (s005) already say so.
  it('names s004 first-to-the-left and s005 first-to-the-right in every language', () => {
    const s004 = SIGNS.find((s) => s.id === 's004')!;
    const s005 = SIGNS.find((s) => s.id === 's005')!;
    expect(s004.nameAr).toContain('لليسار');
    expect(s005.nameAr).toContain('لليمين');
    expect(SIGN_NAMES.s004.en).toMatch(/first to the left/);
    expect(SIGN_NAMES.s005.en).toMatch(/first to the right/);
    expect(SIGN_NAMES.s004.ur).toContain('بائیں');
    expect(SIGN_NAMES.s004.hi).toContain('बाईं');
    expect(SIGN_NAMES.s004.bn).toContain('বাম');
    const q527 = QUESTIONS.find((q) => q.id === 'q527')!;
    const q130 = QUESTIONS.find((q) => q.id === 'q130')!;
    expect(q527.image).toEqual({ kind: 'sign', id: 's004' });
    expect(q130.image).toEqual({ kind: 'sign', id: 's005' });
  });
});

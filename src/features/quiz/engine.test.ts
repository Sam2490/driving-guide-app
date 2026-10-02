import { QUESTIONS } from '@/data/questions';
import type { Question } from '@/data/types';
import { buildExam, DEFAULT_EXAM, formatClock, isCorrect, mistakes, prepareQuestion, remainingSeconds, scoreExam, selectAnswer, startExam } from './engine';
import { mulberry32, shuffle } from './random';

const q = (id: string, correct = 'a', lockOrder = false): Question => ({
  id,
  question: `Q ${id}`,
  options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }, { id: 'c', text: 'C' }, { id: 'd', text: 'D' }],
  correctAnswerId: correct,
  category: 'general',
  ...(lockOrder ? { lockOrder } : {}),
});

describe('question bank', () => {
  it('has 661 questions with unique ids and a valid answer each', () => {
    expect(QUESTIONS).toHaveLength(661);
    expect(new Set(QUESTIONS.map((x) => x.id)).size).toBe(661);
    for (const x of QUESTIONS) {
      expect(x.options.map((o) => o.id)).toContain(x.correctAnswerId);
      for (const o of x.options) expect(Boolean(o.text) !== Boolean(o.image)).toBe(true);
    }
  });
});

describe('randomisation', () => {
  it('shuffle keeps every item and does not mutate the input', () => {
    const src = [1, 2, 3, 4, 5, 6];
    const out = shuffle(src, mulberry32(1));
    expect(out.slice().sort()).toEqual(src);
    expect(src).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('buildExam returns distinct questions of the requested size', () => {
    const exam = buildExam(QUESTIONS, 30, mulberry32(7));
    expect(exam).toHaveLength(30);
    expect(new Set(exam.map((x) => x.id)).size).toBe(30);
  });
  it('different seeds give different exams', () => {
    const a = buildExam(QUESTIONS, 30, mulberry32(1)).map((x) => x.id).join();
    const b = buildExam(QUESTIONS, 30, mulberry32(2)).map((x) => x.id).join();
    expect(a).not.toEqual(b);
  });
  it('keeps option order for "all of the above" questions and the correct id survives shuffling', () => {
    const locked = q('x', 'd', true);
    expect(prepareQuestion(locked, mulberry32(3)).options.map((o) => o.id)).toEqual(['a', 'b', 'c', 'd']);
    const shuffled = prepareQuestion(q('y', 'c'), mulberry32(3));
    expect(shuffled.correctAnswerId).toBe('c');
    expect(shuffled.options.map((o) => o.id).sort()).toEqual(['a', 'b', 'c', 'd']);
  });
  it('throws when the bank is too small', () => {
    expect(() => buildExam([q('1')], 2)).toThrow();
  });
});

describe('scoring', () => {
  const qs = [q('1', 'a'), q('2', 'b'), q('3', 'c'), q('4', 'd')];
  it('detects correct and incorrect answers', () => {
    expect(isCorrect(qs[0], 'a')).toBe(true);
    expect(isCorrect(qs[0], 'b')).toBe(false);
    expect(isCorrect(qs[0], undefined)).toBe(false);
  });
  it('counts correct, wrong and unanswered and applies the pass mark', () => {
    const r = scoreExam(qs, { '1': 'a', '2': 'b', '3': 'a' }, 2);
    expect(r).toMatchObject({ total: 4, correct: 2, wrong: 1, unanswered: 1, percent: 50, passed: true });
    expect(scoreExam(qs, { '1': 'a' }, 2).passed).toBe(false);
  });
  it('lists mistakes including unanswered questions, in order', () => {
    expect(mistakes(qs, { '1': 'a', '2': 'c' }).map((x) => x.id)).toEqual(['2', '3', '4']);
  });
  it('pass mark 21 of 30 by default', () => {
    expect(DEFAULT_EXAM).toEqual({ count: 30, minutes: 40, passMark: 21 });
  });
});

describe('session', () => {
  it('starts with a 40-minute deadline, records answers and can change them', () => {
    const s = startExam(QUESTIONS, DEFAULT_EXAM, 1000, mulberry32(9));
    expect(s.endsAt - s.startedAt).toBe(40 * 60_000);
    const id = s.questions[0].id;
    const s2 = selectAnswer(selectAnswer(s, id, 'a'), id, 'b');
    expect(s2.answers[id]).toBe('b');
    expect(selectAnswer(s, 'not-in-exam', 'a')).toBe(s);
  });
  it('restart gives a fresh session with no answers', () => {
    const s = startExam(QUESTIONS, DEFAULT_EXAM, 0, mulberry32(1));
    const again = startExam(QUESTIONS, DEFAULT_EXAM, 0, mulberry32(2));
    expect(Object.keys(again.answers)).toHaveLength(0);
    expect(again.questions.map((x) => x.id)).not.toEqual(s.questions.map((x) => x.id));
  });
  it('timer uses wall-clock time and never goes negative', () => {
    expect(remainingSeconds(61_000, 0)).toBe(61);
    expect(remainingSeconds(1000, 5000)).toBe(0);
    expect(formatClock(2400)).toBe('40:00');
    expect(formatClock(59)).toBe('00:59');
  });
});

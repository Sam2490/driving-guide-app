import { mistakeIds, readiness, readinessChange, recordCorrect, recordMisses } from './progress';
import { parseLearn, parseMistakes, parseExam, serializeExam } from '@/services/storage';
import { QUESTIONS } from '@/data/questions';
import { startExam, toggleFlag } from '@/features/quiz/engine';

const rec = (correct: number, at = 0) => ({ at, correct, total: 30, passed: correct >= 21 });

describe('readiness', () => {
  it('is empty before the first exam', () => {
    expect(readiness([])).toEqual({ percent: 0, counted: 0, passed: 0, level: 'none' });
  });
  it('averages the last three exams, newest first', () => {
    const r = readiness([rec(27), rec(24), rec(21), rec(3)]);
    expect(r.percent).toBe(80);
    expect(r.passed).toBe(3);
    expect(r.level).toBe('ready');
  });
  it('is only "ready" after three passes, "almost" at the pass mark, else "practise"', () => {
    expect(readiness([rec(30)]).level).toBe('almost');
    expect(readiness([rec(22), rec(22), rec(22)]).level).toBe('almost');
    expect(readiness([rec(10), rec(12)]).level).toBe('practise');
  });
  it('reports the change made by the newest exam', () => {
    expect(readinessChange([rec(27)])).toBeNull();
    expect(readinessChange([rec(27), rec(21)])).toBe(10);
  });
});

describe('mistake book', () => {
  it('a miss adds or resets, two correct in a row remove', () => {
    let b = recordMisses({}, ['a', 'b']);
    b = recordCorrect(b, ['a']);
    expect(b).toEqual({ a: 1, b: 0 });
    b = recordMisses(b, ['a']);
    expect(b.a).toBe(0);
    b = recordCorrect(recordCorrect(b, ['a']), ['a']);
    expect('a' in b).toBe(false);
    expect(recordCorrect(b, ['zzz'])).toBe(b);
  });
  it('orders practice by least progress', () => {
    expect(mistakeIds({ a: 1, b: 0 })).toEqual(['b', 'a']);
  });
  it('stored books keep only known questions and valid runs', () => {
    const id = QUESTIONS[0].id;
    expect(parseMistakes(JSON.stringify({ [id]: 1, nope: 0, [QUESTIONS[1].id]: 7 }), QUESTIONS)).toEqual({ [id]: 1 });
    expect(parseMistakes('[1,2]', QUESTIONS)).toEqual({});
    expect(parseMistakes('{bad', QUESTIONS)).toEqual({});
  });
});

describe('learn progress and exam flags', () => {
  it('learn state keeps only valid topic ids and step numbers', () => {
    expect(parseLearn(JSON.stringify({ read: ['t01', 't01', '<script>'], steps: [2, 2, 0, 99, 'x'] }))).toEqual({ read: ['t01'], steps: [0, 2] });
    expect(parseLearn('nope')).toEqual({ read: [], steps: [] });
  });
  it('flags survive a save and restore, and only for questions in the exam', () => {
    const x = toggleFlag(startExam(QUESTIONS), '');
    const q = x.questions[3].id;
    const flagged = toggleFlag(x, q);
    expect(flagged.flags).toEqual([q]);
    expect(toggleFlag(flagged, q).flags).toEqual([]);
    const raw = JSON.stringify({ ...serializeExam(flagged), f: [q, 'other'] });
    expect(parseExam(raw, QUESTIONS)!.flags).toEqual([q]);
  });
});

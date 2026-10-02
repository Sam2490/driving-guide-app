import { QUESTIONS } from '@/data/questions';
import webOrder from './__fixtures__/webOrder.json';
import { answerRun, completeLevel, currentLevel, EMPTY_PROGRESS, isFailed, isUnlocked, levelCount, levelOrder, levelQuestions, rankFor, rankProgress, startRun, starsFor } from './levels';

describe('level order', () => {
  it('matches the web app exactly, so saved progress means the same questions', () => {
    expect(levelOrder(QUESTIONS.length)).toEqual(webOrder);
  });
  it('has 82 levels of 8 questions', () => {
    expect(levelCount(QUESTIONS.length)).toBe(82);
    expect(levelQuestions(QUESTIONS, 1)).toHaveLength(8);
    expect(levelQuestions(QUESTIONS, 1).map((q) => q.id)).toEqual(webOrder.slice(0, 8).map((i: number) => QUESTIONS[i].id));
  });
});

describe('runs', () => {
  it('awards 10 per correct answer and +5 from the third in a row', () => {
    let r = startRun(1);
    const gains: number[] = [];
    for (const good of [true, true, true, true, false, true]) {
      const x = answerRun(r, good);
      r = x.run;
      gains.push(x.gain);
    }
    expect(gains).toEqual([10, 10, 15, 15, 0, 10]);
    expect(r.attempts).toBe(4);
  });
  it('fails after 5 wrong answers', () => {
    let r = startRun(1);
    for (let i = 0; i < 5; i++) r = answerRun(r, false).run;
    expect(isFailed(r)).toBe(true);
  });
  it('stars: 3 with no mistakes, 2 with up to 2, else 1', () => {
    expect([starsFor(8, 8), starsFor(6, 8), starsFor(5, 8)]).toEqual([3, 2, 1]);
  });
});

describe('progress', () => {
  const perfect = () => {
    let r = startRun(1);
    for (let i = 0; i < 8; i++) r = answerRun(r, true).run;
    return r;
  };
  it('pays the completion bonus only once and unlocks the next level', () => {
    const now = new Date(2026, 9, 2, 12);
    const a = completeLevel(EMPTY_PROGRESS, perfect(), 8, now);
    expect(a.earned).toBe(perfect().xp + 30);
    expect(a.progress.done[1]).toBe(3);
    expect(currentLevel(a.progress, 82)).toBe(2);
    expect(isUnlocked(a.progress, 3, 82)).toBe(false);
    const b = completeLevel(a.progress, perfect(), 8, now);
    expect(b.earned).toBe(perfect().xp);
  });
  it('tracks the daily streak', () => {
    const d1 = new Date(2026, 9, 1, 20);
    const d2 = new Date(2026, 9, 2, 9);
    const d4 = new Date(2026, 9, 4, 9);
    const p1 = completeLevel(EMPTY_PROGRESS, perfect(), 8, d1).progress;
    const p2 = completeLevel(p1, perfect(), 8, d2).progress;
    expect(p2.streak).toBe(2);
    expect(completeLevel(p2, perfect(), 8, d4).progress.streak).toBe(1);
  });
  it('ranks by XP thresholds', () => {
    expect([rankFor(0), rankFor(149), rankFor(150), rankFor(4000), rankFor(99999)]).toEqual([0, 0, 1, 5, 5]);
    expect(rankProgress(325)).toBeCloseTo(0.5);
    expect(rankProgress(5000)).toBe(1);
  });
});

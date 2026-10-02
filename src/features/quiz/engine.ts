import type { Question } from '@/data/types';
import { shuffle, type Rng } from './random';

export type ExamConfig = { count: number; minutes: number; passMark: number };

/** The mock exam rules carried over from the web app. */
export const DEFAULT_EXAM: ExamConfig = { count: 30, minutes: 40, passMark: 21 };

/** Answers keyed by question id; undefined = not answered. */
export type Answers = Record<string, string | undefined>;

export type ExamSession = {
  questions: Question[];
  answers: Answers;
  startedAt: number;
  endsAt: number;
  config: ExamConfig;
};

export type ExamResult = {
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  percent: number;
  passed: boolean;
  passMark: number;
};

/** Shuffles a question's options unless its order must stay fixed ("all of the above"). */
export function prepareQuestion(q: Question, rng: Rng = Math.random): Question {
  return q.lockOrder ? q : { ...q, options: shuffle(q.options, rng) };
}

/** Picks `count` distinct random questions and shuffles their options. */
export function buildExam(bank: readonly Question[], count: number, rng: Rng = Math.random): Question[] {
  if (count > bank.length) throw new Error(`Exam needs ${count} questions but the bank has ${bank.length}`);
  return shuffle(bank, rng).slice(0, count).map((q) => prepareQuestion(q, rng));
}

export function startExam(bank: readonly Question[], config: ExamConfig = DEFAULT_EXAM, now = Date.now(), rng: Rng = Math.random): ExamSession {
  return { questions: buildExam(bank, config.count, rng), answers: {}, startedAt: now, endsAt: now + config.minutes * 60_000, config };
}

export function isCorrect(q: Question, answerId: string | undefined): boolean {
  return answerId !== undefined && answerId === q.correctAnswerId;
}

export function selectAnswer(session: ExamSession, questionId: string, optionId: string): ExamSession {
  if (!session.questions.some((q) => q.id === questionId)) return session;
  return { ...session, answers: { ...session.answers, [questionId]: optionId } };
}

export function scoreExam(questions: readonly Question[], answers: Answers, passMark: number): ExamResult {
  let correct = 0;
  let unanswered = 0;
  for (const q of questions) {
    const a = answers[q.id];
    if (a === undefined) unanswered++;
    else if (a === q.correctAnswerId) correct++;
  }
  const total = questions.length;
  return {
    total,
    correct,
    unanswered,
    wrong: total - correct - unanswered,
    percent: total ? Math.round((correct / total) * 100) : 0,
    passed: correct >= passMark,
    passMark,
  };
}

/** Questions answered wrongly or left blank, in exam order. */
export function mistakes(questions: readonly Question[], answers: Answers): Question[] {
  return questions.filter((q) => !isCorrect(q, answers[q.id]));
}

export function answeredCount(session: ExamSession): number {
  return session.questions.filter((q) => session.answers[q.id] !== undefined).length;
}

/** Seconds left, based on wall-clock time so it stays right after the app is backgrounded. */
export function remainingSeconds(endsAt: number, now = Date.now()): number {
  return Math.max(0, Math.round((endsAt - now) / 1000));
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

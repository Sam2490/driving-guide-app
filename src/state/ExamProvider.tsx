import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { scoreExam, type ExamSession } from '@/features/quiz/engine';
import { QUESTIONS } from '@/data/questions';
import { storage, type ExamRecord } from '@/services/storage';

export type ExamDone = { session: ExamSession; finishedAt: number; timedOut: boolean };

type ExamState = {
  exam: ExamSession | null;
  setExam: (s: ExamSession | null) => void;
  examDone: ExamDone | null;
  setExamDone: (d: ExamDone | null) => void;
  /** Finished mock exams, newest first. */
  history: ExamRecord[];
};

const Ctx = createContext<ExamState | null>(null);

/**
 * Exam state lives apart from the app settings, so answering a question re-renders only the exam screens.
 * The session in progress is saved on the phone, so an exam survives the app being closed until its time runs out.
 */
export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [exam, setExamState] = useState<ExamSession | null>(null);
  const [examDone, setExamDoneState] = useState<ExamDone | null>(null);
  const [history, setHistory] = useState<ExamRecord[]>([]);
  const touched = useRef(false);

  useEffect(() => {
    let alive = true;
    storage.loadHistory().then((h) => alive && setHistory(h));
    storage.loadExam(QUESTIONS).then((saved) => {
      // Don't overwrite an exam the user started while the saved one was loading.
      if (alive && saved && !touched.current) setExamState(saved);
    });
    return () => {
      alive = false;
    };
  }, []);

  const setExam = useCallback((s: ExamSession | null) => {
    touched.current = true;
    setExamState(s);
    storage.saveExam(s);
  }, []);

  const setExamDone = useCallback((d: ExamDone | null) => {
    setExamDoneState(d);
    if (!d) return;
    const r = scoreExam(d.session.questions, d.session.answers, d.session.config.passMark);
    const rec = { at: d.finishedAt, correct: r.correct, total: r.total, passed: r.passed };
    setHistory((h) => [rec, ...h.filter((x) => x.at !== rec.at)].slice(0, 20));
    storage.addHistory(rec);
  }, []);

  const value = useMemo(() => ({ exam, setExam, examDone, setExamDone, history }), [exam, setExam, examDone, setExamDone, history]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExam(): ExamState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useExam must be used inside ExamProvider');
  return v;
}

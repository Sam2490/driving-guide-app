import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ExamSession } from '@/features/quiz/engine';
import { QUESTIONS } from '@/data/questions';
import { storage } from '@/services/storage';

export type ExamDone = { session: ExamSession; finishedAt: number; timedOut: boolean };

type ExamState = {
  exam: ExamSession | null;
  setExam: (s: ExamSession | null) => void;
  examDone: ExamDone | null;
  setExamDone: (d: ExamDone | null) => void;
};

const Ctx = createContext<ExamState | null>(null);

/**
 * Exam state lives apart from the app settings, so answering a question re-renders only the exam screens.
 * The session in progress is saved on the phone, so an exam survives the app being closed until its time runs out.
 */
export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [exam, setExamState] = useState<ExamSession | null>(null);
  const [examDone, setExamDone] = useState<ExamDone | null>(null);
  const touched = useRef(false);

  useEffect(() => {
    let alive = true;
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

  const value = useMemo(() => ({ exam, setExam, examDone, setExamDone }), [exam, setExam, examDone]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExam(): ExamState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useExam must be used inside ExamProvider');
  return v;
}

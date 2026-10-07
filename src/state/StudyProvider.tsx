import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { QUESTIONS } from '@/data/questions';
import { EMPTY_LEARN, storage, type LearnState, type MistakeBook } from '@/services/storage';
import { recordCorrect, recordMisses } from '@/features/progress/progress';

type StudyState = {
  /** Saved mistakes across exams, levels and practice. */
  mistakes: MistakeBook;
  addMisses: (ids: readonly string[]) => void;
  addCorrect: (ids: readonly string[]) => void;
  clearMistakes: () => void;
  learn: LearnState;
  markRead: (topicId: string) => void;
  toggleStep: (index: number) => void;
};

const Ctx = createContext<StudyState | null>(null);

/** Study progress kept on the phone only: the mistakes to practise and what was read or ticked in Learn. */
export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [mistakes, setMistakes] = useState<MistakeBook>({});
  const [learn, setLearn] = useState<LearnState>(EMPTY_LEARN);
  const book = useRef<MistakeBook>({});
  const learnRef = useRef<LearnState>(EMPTY_LEARN);
  const touched = useRef({ m: false, l: false });

  useEffect(() => {
    let alive = true;
    storage.loadMistakes(QUESTIONS).then((m) => {
      if (!alive || touched.current.m) return;
      book.current = m;
      setMistakes(m);
    });
    storage.loadLearn().then((l) => {
      if (!alive || touched.current.l) return;
      learnRef.current = l;
      setLearn(l);
    });
    return () => {
      alive = false;
    };
  }, []);

  const saveBook = useCallback((next: MistakeBook) => {
    touched.current.m = true;
    if (next === book.current) return;
    book.current = next;
    setMistakes(next);
    storage.saveMistakes(next);
  }, []);
  const saveLearn = useCallback((next: LearnState) => {
    touched.current.l = true;
    learnRef.current = next;
    setLearn(next);
    storage.saveLearn(next);
  }, []);

  const addMisses = useCallback((ids: readonly string[]) => saveBook(recordMisses(book.current, ids)), [saveBook]);
  const addCorrect = useCallback((ids: readonly string[]) => saveBook(recordCorrect(book.current, ids)), [saveBook]);
  const clearMistakes = useCallback(() => saveBook({}), [saveBook]);
  const markRead = useCallback(
    (id: string) => {
      const l = learnRef.current;
      if (!l.read.includes(id)) saveLearn({ ...l, read: [...l.read, id] });
    },
    [saveLearn],
  );
  const toggleStep = useCallback(
    (i: number) => {
      const l = learnRef.current;
      saveLearn({ ...l, steps: l.steps.includes(i) ? l.steps.filter((s) => s !== i) : [...l.steps, i].sort((a, b) => a - b) });
    },
    [saveLearn],
  );

  const value = useMemo(() => ({ mistakes, addMisses, addCorrect, clearMistakes, learn, markRead, toggleStep }), [mistakes, addMisses, addCorrect, clearMistakes, learn, markRead, toggleStep]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudy(): StudyState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStudy must be used inside StudyProvider');
  return v;
}

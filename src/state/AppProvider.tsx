import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import type { Lang } from '@/data/types';
import { isRtlLang, STRINGS, type Strings } from '@/i18n';
import { dark, light, type Palette } from '@/theme/colors';
import { fontFor, lineHeightFor, type Weight } from '@/theme/fonts';
import { DEFAULT_SETTINGS, storage, type Settings, type ThemePref } from '@/services/storage';
import { EMPTY_PROGRESS, type Progress } from '@/features/levels/levels';
import type { ExamSession } from '@/features/quiz/engine';

type AppState = {
  ready: boolean;
  lang: Lang;
  t: Strings;
  rtl: boolean;
  c: Palette;
  isDark: boolean;
  themePref: ThemePref;
  setLang: (l: Lang) => void;
  setTheme: (t: ThemePref) => void;
  font: (w: Weight, content?: boolean) => string;
  lh: (size: number, content?: boolean) => number;
  progress: Progress;
  setProgress: (p: Progress) => void;
  exam: ExamSession | null;
  setExam: (s: ExamSession | null) => void;
  examDone: { session: ExamSession; finishedAt: number; timedOut: boolean } | null;
  setExamDone: (d: AppState['examDone']) => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children, initial }: { children: React.ReactNode; initial?: { settings?: Settings; progress?: Progress } }) {
  const scheme = useColorScheme();
  const [settings, setSettings] = useState<Settings>(initial?.settings ?? DEFAULT_SETTINGS);
  const [progress, setProgressState] = useState<Progress>(initial?.progress ?? EMPTY_PROGRESS);
  const [ready, setReady] = useState(Boolean(initial));
  const [exam, setExam] = useState<ExamSession | null>(null);
  const [examDone, setExamDone] = useState<AppState['examDone']>(null);

  useEffect(() => {
    if (initial) return;
    let alive = true;
    Promise.all([storage.loadSettings(), storage.loadProgress()]).then(([s, p]) => {
      if (!alive) return;
      setSettings(s);
      setProgressState(p);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [initial]);

  const update = useCallback((s: Settings) => {
    setSettings(s);
    storage.saveSettings(s);
  }, []);
  const setLang = useCallback((lang: Lang) => update({ ...settings, lang }), [settings, update]);
  const setTheme = useCallback((theme: ThemePref) => update({ ...settings, theme }), [settings, update]);
  const setProgress = useCallback((p: Progress) => {
    setProgressState(p);
    storage.saveProgress(p);
  }, []);

  const value = useMemo<AppState>(() => {
    const isDark = settings.theme === 'system' ? scheme !== 'light' : settings.theme === 'dark';
    const lang = settings.lang;
    return {
      ready, lang, t: STRINGS[lang], rtl: isRtlLang(lang), c: isDark ? dark : light, isDark, themePref: settings.theme,
      setLang, setTheme,
      font: (w, content) => fontFor(lang, w, content),
      lh: (size, content) => lineHeightFor(lang, size, content),
      progress, setProgress, exam, setExam, examDone, setExamDone,
    };
  }, [ready, settings, scheme, setLang, setTheme, progress, setProgress, exam, examDone]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}

/** Direction helpers: the app manages right-to-left itself so the language can change without a restart. */
export function useDir() {
  const { rtl } = useApp();
  return {
    rtl,
    row: (rtl ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
    align: (rtl ? 'right' : 'left') as 'left' | 'right',
    start: (rtl ? 'flex-end' : 'flex-start') as 'flex-start' | 'flex-end',
    end: (rtl ? 'flex-start' : 'flex-end') as 'flex-start' | 'flex-end',
    writing: (rtl ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
  };
}

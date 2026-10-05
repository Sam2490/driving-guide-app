import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang, Question } from '@/data/types';
import { EMPTY_PROGRESS, type Progress } from '@/features/levels/levels';
import type { ExamSession } from '@/features/quiz/engine';

export type ThemePref = 'system' | 'light' | 'dark';
export type Settings = { lang: Lang; theme: ThemePref };

export const DEFAULT_SETTINGS: Settings = { lang: 'ar', theme: 'dark' };
const KEYS = { settings: 'settings.v1', progress: 'levels.v1', exam: 'exam.v1', history: 'history.v1' } as const;

/** One finished mock exam, for "last result" and "best" on the Test tab. */
export type ExamRecord = { at: number; correct: number; total: number; passed: boolean };
const HISTORY_MAX = 20;

export function parseHistory(raw: string | null): ExamRecord[] {
  try {
    const v = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(v)) return [];
    return v
      .filter((r) => r && Number.isFinite(r.at) && Number.isInteger(r.total) && r.total > 0 && r.total <= 100 && Number.isInteger(r.correct) && r.correct >= 0 && r.correct <= r.total && typeof r.passed === 'boolean')
      .slice(0, HISTORY_MAX)
      .map((r) => ({ at: r.at, correct: r.correct, total: r.total, passed: r.passed }));
  } catch {
    return [];
  }
}

/** Stored data is treated as untrusted: anything malformed falls back to defaults. */
export function parseSettings(raw: string | null): Settings {
  try {
    const v = raw ? JSON.parse(raw) : null;
    return {
      lang: v && ['ar', 'en', 'ur', 'hi', 'bn'].includes(v.lang) ? v.lang : DEFAULT_SETTINGS.lang,
      theme: v && ['system', 'light', 'dark'].includes(v.theme) ? v.theme : DEFAULT_SETTINGS.theme,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function parseProgress(raw: string | null): Progress {
  try {
    const v = raw ? JSON.parse(raw) : null;
    if (!v || typeof v !== 'object') return EMPTY_PROGRESS;
    const done: Record<number, number> = {};
    if (v.done && typeof v.done === 'object') {
      for (const [k, s] of Object.entries(v.done)) {
        const lv = Number(k);
        if (Number.isInteger(lv) && lv > 0 && lv < 1000 && typeof s === 'number' && s >= 1 && s <= 3) done[lv] = Math.round(s);
      }
    }
    return {
      xp: Number.isFinite(v.xp) && v.xp >= 0 ? Math.floor(v.xp) : 0,
      streak: Number.isFinite(v.streak) && v.streak >= 0 ? Math.floor(v.streak) : 0,
      last: typeof v.last === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.last) ? v.last : undefined,
      done,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

/** Only ids, option order and answers are saved; question text always comes from the bundled bank. */
type SavedExam = { v: 1; q: { id: string; o: string[] }[]; a: Record<string, string>; s: number; e: number; c: { count: number; minutes: number; passMark: number } };

export function serializeExam(x: ExamSession): SavedExam {
  const a: Record<string, string> = {};
  for (const [k, v] of Object.entries(x.answers)) if (v !== undefined) a[k] = v;
  return { v: 1, q: x.questions.map((q) => ({ id: q.id, o: q.options.map((o) => o.id) })), a, s: x.startedAt, e: x.endsAt, c: x.config };
}

/** Rebuilds a saved exam from the bundled bank. Anything unknown, tampered with or already timed out is dropped. */
export function parseExam(raw: string | null, bank: readonly Question[], now = Date.now()): ExamSession | null {
  try {
    const v = raw ? JSON.parse(raw) : null;
    if (!v || v.v !== 1 || !Array.isArray(v.q) || v.q.length === 0 || v.q.length > 100) return null;
    if (!Number.isFinite(v.s) || !Number.isFinite(v.e) || v.e <= now || v.e - v.s > 4 * 3600_000) return null;
    const c = v.c ?? {};
    if (![c.count, c.minutes, c.passMark].every((n) => Number.isInteger(n) && n > 0 && n <= 1000)) return null;
    const byId = new Map(bank.map((q) => [q.id, q]));
    const seen = new Set<string>();
    const questions: Question[] = [];
    for (const item of v.q) {
      const q = item && typeof item.id === 'string' ? byId.get(item.id) : undefined;
      if (!q || seen.has(q.id) || !Array.isArray(item.o) || item.o.length !== q.options.length) return null;
      const opts = item.o.map((id: unknown) => q.options.find((o) => o.id === id));
      if (opts.some((o: unknown) => !o) || new Set(item.o).size !== q.options.length) return null;
      seen.add(q.id);
      questions.push({ ...q, options: opts });
    }
    const answers: Record<string, string | undefined> = {};
    if (v.a && typeof v.a === 'object') {
      for (const [k, a] of Object.entries(v.a)) {
        const q = byId.get(k);
        if (q && seen.has(k) && typeof a === 'string' && q.options.some((o) => o.id === a)) answers[k] = a;
      }
    }
    return { questions, answers, startedAt: v.s, endsAt: v.e, config: { count: c.count, minutes: c.minutes, passMark: c.passMark } };
  } catch {
    return null;
  }
}

async function read(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function write(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage failures are not fatal; the app keeps working for this session.
  }
}

export const storage = {
  loadSettings: async () => parseSettings(await read(KEYS.settings)),
  /** Settings plus whether the user has ever chosen them (false on the very first launch). */
  loadSettingsState: async () => {
    const raw = await read(KEYS.settings);
    return { settings: parseSettings(raw), saved: raw !== null };
  },
  saveSettings: (s: Settings) => write(KEYS.settings, s),
  loadProgress: async () => parseProgress(await read(KEYS.progress)),
  saveProgress: (p: Progress) => write(KEYS.progress, p),
  clearProgress: () => write(KEYS.progress, EMPTY_PROGRESS),
  loadHistory: async () => parseHistory(await read(KEYS.history)),
  /** Newest first; the same exam (same finish time) is never stored twice. */
  addHistory: async (r: ExamRecord) => {
    const list = parseHistory(await read(KEYS.history)).filter((x) => x.at !== r.at);
    await write(KEYS.history, [r, ...list].slice(0, HISTORY_MAX));
  },
  loadExam: async (bank: readonly Question[]) => parseExam(await read(KEYS.exam), bank),
  saveExam: async (x: ExamSession | null) => {
    if (x) return write(KEYS.exam, serializeExam(x));
    try {
      await AsyncStorage.removeItem(KEYS.exam);
    } catch {
      // Not fatal.
    }
  },
};

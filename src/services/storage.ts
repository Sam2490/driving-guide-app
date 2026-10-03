import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from '@/data/types';
import { EMPTY_PROGRESS, type Progress } from '@/features/levels/levels';

export type ThemePref = 'system' | 'light' | 'dark';
export type Settings = { lang: Lang; theme: ThemePref };

export const DEFAULT_SETTINGS: Settings = { lang: 'ar', theme: 'dark' };
const KEYS = { settings: 'settings.v1', progress: 'levels.v1' } as const;

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
  saveSettings: (s: Settings) => write(KEYS.settings, s),
  loadProgress: async () => parseProgress(await read(KEYS.progress)),
  saveProgress: (p: Progress) => write(KEYS.progress, p),
  clearProgress: () => write(KEYS.progress, EMPTY_PROGRESS),
};

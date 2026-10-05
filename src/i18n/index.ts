import type { Lang } from '@/data/types';
import { ar } from './ar';
import { en, type Strings } from './en';
import { ur } from './ur';
import { hi } from './hi';
import { bn } from './bn';

export const STRINGS: Record<Lang, Strings> = { ar, en, ur, hi, bn };
/** Native name, plus the English name so anyone can find their language. */
export const LANGUAGES: { id: Lang; name: string; english: string }[] = [
  { id: 'ar', name: 'العربية', english: 'Arabic' },
  { id: 'en', name: 'English', english: 'English' },
  { id: 'ur', name: 'اردو', english: 'Urdu' },
  { id: 'hi', name: 'हिन्दी', english: 'Hindi' },
  { id: 'bn', name: 'বাংলা', english: 'Bengali' },
];
export const isRtlLang = (l: Lang) => l === 'ar' || l === 'ur';
export type { Strings };

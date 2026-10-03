import type { Lang } from '@/data/types';
import { ar } from './ar';
import { en, type Strings } from './en';
import { ur } from './ur';
import { hi } from './hi';
import { bn } from './bn';

export const STRINGS: Record<Lang, Strings> = { ar, en, ur, hi, bn };
export const LANGUAGES: { id: Lang; name: string }[] = [
  { id: 'ar', name: 'العربية' },
  { id: 'en', name: 'English' },
  { id: 'ur', name: 'اردو' },
  { id: 'hi', name: 'हिन्दी' },
  { id: 'bn', name: 'বাংলা' },
];
export const isRtlLang = (l: Lang) => l === 'ar' || l === 'ur';
export type { Strings };

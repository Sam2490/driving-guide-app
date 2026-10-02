import type { Lang } from '@/data/types';
import { ar } from './ar';
import { en, type Strings } from './en';
import { ur } from './ur';

export const STRINGS: Record<Lang, Strings> = { ar, en, ur };
export const LANGUAGES: { id: Lang; name: string }[] = [
  { id: 'ar', name: 'العربية' },
  { id: 'en', name: 'English' },
  { id: 'ur', name: 'اردو' },
];
export const isRtlLang = (l: Lang) => l !== 'en';
export type { Strings };

import type { GuideTopic, Lang, Question, QuestionOption, School, Sign } from './types';
import { QUESTION_TEXT } from './i18n/questions';
import { GUIDE_TEXT } from './i18n/guide';
import { SIGN_NAMES } from './i18n/signs';
import { CITY_NAMES, REGION_NAMES, SCHOOL_TEXT } from './i18n/places';

/** Content in the reader's language; Arabic is the source, English and Urdu are translations. */
export function questionText(q: Question, lang: Lang): string {
  return lang === 'ar' ? q.question : QUESTION_TEXT[q.id]?.[lang]?.q ?? q.question;
}

export function optionText(q: Question, o: QuestionOption, lang: Lang): string | undefined {
  if (!o.text) return undefined;
  return lang === 'ar' ? o.text : QUESTION_TEXT[q.id]?.[lang]?.o[o.id] ?? o.text;
}

export function topicText(t: GuideTopic, lang: Lang): { title: string; blocks: GuideTopic['blocks'] } {
  return lang === 'ar' ? t : GUIDE_TEXT[t.id]?.[lang] ?? t;
}

export function signName(s: Sign, lang: Lang): string {
  return lang === 'ar' ? s.nameAr : SIGN_NAMES[s.id]?.[lang] ?? s.nameEn;
}

export function schoolText(s: School, lang: Lang): { name: string; description: string } {
  return lang === 'ar' ? s : SCHOOL_TEXT[s.id]?.[lang] ?? s;
}

export function cityName(name: string, lang: Lang): string {
  return lang === 'ar' ? name : CITY_NAMES[name]?.[lang] ?? name;
}

export function regionName(name: string, lang: Lang): string {
  return lang === 'ar' ? name : REGION_NAMES[name]?.[lang] ?? name;
}

import type { GuideTopic, Lang, Question, QuestionOption, School, Sign, TLang } from './types';
import type { QText, TopicText } from './i18n/types';
import { SIGN_NAMES } from './i18n/signs';
import { BRAND_NAMES, CITY_NAMES, REGION_NAMES } from './i18n/places';

/*
 * The question and guide translations are large (about 1 MB for four languages), so each language lives in its
 * own module and is loaded the first time it is needed. Arabic readers never load any of them.
 */
const questionCache: Partial<Record<TLang, Record<string, QText>>> = {};
const guideCache: Partial<Record<TLang, Record<string, TopicText>>> = {};

/* eslint-disable @typescript-eslint/no-require-imports -- deferred loading needs literal require() calls */
function loadQuestions(lang: TLang): Record<string, QText> {
  switch (lang) {
    case 'en': return require('./i18n/questions/en').default;
    case 'ur': return require('./i18n/questions/ur').default;
    case 'hi': return require('./i18n/questions/hi').default;
    case 'bn': return require('./i18n/questions/bn').default;
  }
}

function loadGuide(lang: TLang): Record<string, TopicText> {
  switch (lang) {
    case 'en': return require('./i18n/guide/en').default;
    case 'ur': return require('./i18n/guide/ur').default;
    case 'hi': return require('./i18n/guide/hi').default;
    case 'bn': return require('./i18n/guide/bn').default;
  }
}
/* eslint-enable @typescript-eslint/no-require-imports */

const questionsFor = (lang: TLang) => (questionCache[lang] ??= loadQuestions(lang));
const guideFor = (lang: TLang) => (guideCache[lang] ??= loadGuide(lang));

/** Content in the reader's language; Arabic is the source, the other languages are translations. */
/**
 * Display tidy-up for the Arabic question bank, which comes with typing habits of its source: a space before the
 * final "؟" or ":" ("الطريق ؟"), and ".." before a question mark ("الإشارة .. ؟"). The data stays as published.
 */
export function tidyArabic(s: string): string {
  return s
    .replace(/\s*\.{2,}\s*([؟?])/g, '$1')
    .replace(/[ \u00a0]+([؟?:،!])/g, '$1')
    .trim();
}

const tidied = new Map<string, string>();
function tidyQ(s: string): string {
  let v = tidied.get(s);
  if (v === undefined) tidied.set(s, (v = tidyArabic(s)));
  return v;
}

export function questionText(q: Question, lang: Lang): string {
  return lang === 'ar' ? tidyQ(q.question) : questionsFor(lang)[q.id]?.q ?? tidyQ(q.question);
}

export function optionText(q: Question, o: QuestionOption, lang: Lang): string | undefined {
  if (!o.text) return undefined;
  return lang === 'ar' ? o.text : questionsFor(lang)[q.id]?.o[o.id] ?? o.text;
}

export function topicText(t: GuideTopic, lang: Lang): { title: string; blocks: GuideTopic['blocks'] } {
  return lang === 'ar' ? t : guideFor(lang)[t.id] ?? t;
}

export function signName(s: Sign, lang: Lang): string {
  return lang === 'ar' ? s.nameAr : SIGN_NAMES[s.id]?.[lang] ?? s.nameEn;
}

/** Arabic shows the exact Absher branch name; other languages show the translated school name (the city is shown beside it). */
export function schoolText(s: School, lang: Lang): { name: string } {
  return { name: lang === 'ar' ? s.name : BRAND_NAMES[s.brand]?.[lang] ?? s.name };
}

export function cityName(name: string, lang: Lang): string {
  return lang === 'ar' ? name : CITY_NAMES[name]?.[lang] ?? name;
}

export function regionName(name: string, lang: Lang): string {
  return lang === 'ar' ? name : REGION_NAMES[name]?.[lang] ?? name;
}

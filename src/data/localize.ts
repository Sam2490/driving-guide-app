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

/**
 * Letters typed on a Persian keyboard (ی, ک, ھ) and stretching tatweel (ـ) in the Arabic source. Most fonts draw them
 * close enough, but search, copy and screen readers treat them as different letters ("الطریق" is not "الطريق").
 */
export function arabicLetters(s: string): string {
  return s.replace(/\u06cc/g, '\u064a').replace(/\u06a9/g, '\u0643').replace(/\u06be/g, '\u0647').replace(/\u0640/g, '');
}

// Whole Arabic words only: the edges are any character that is not an Arabic letter.
const L = '\u0621-\u064a';
const word = (w: string) => new RegExp(`(^|[^${L}])(${w})(?=$|[^${L}])`, 'g');

/** Words typed without their hamza in the source (QA_1 A1: 111 in 71 questions). */
const HAMZA: Record<string, string> = {
  '\u0627\u0644\u0649': '\u0625\u0644\u0649', // الى → إلى
  '\u0627\u0648': '\u0623\u0648', // او → أو
  '\u0627\u0630\u0627': '\u0625\u0630\u0627', // اذا → إذا
  '\u0627\u0642\u0635\u0649': '\u0623\u0642\u0635\u0649', // اقصى → أقصى
  '\u0627\u0639\u0644\u0627\u0647': '\u0623\u0639\u0644\u0627\u0647', // اعلاه → أعلاه
  '\u0627\u0646\u062a': '\u0623\u0646\u062a', // انت → أنت
  '\u0627\u0643\u062b\u0631': '\u0623\u0643\u062b\u0631', // اكثر → أكثر
  '\u0627\u0642\u0644': '\u0623\u0642\u0644', // اقل → أقل
  '\u0627\u062e\u0631': '\u0622\u062e\u0631', // اخر → آخر
  '\u0627\u064a': '\u0623\u064a', // اي → أي
};
const HAMZA_RE = word(Object.keys(HAMZA).join('|'));

/**
 * More words typed without their hamza, each checked by hand against the question bank (QA_1 A1 follow-up). They may
 * carry a prefix (و ف ب ل ك ال وال بال فال كال لل ولل): "للاشارة" → "للإشارة". Left out on purpose: احد (also part of
 * واحد), انه / انها (أنه or إنه), and imperatives that correctly have none (انظر، احذر، افسح، افحص، اختر، اتصل).
 */
const HAMZA_STEMS: Record<string, string> = {
  'اجباري': 'إجباري',
  'اجبارية': 'إجبارية',
  'اخرى': 'أخرى',
  'اخرين': 'آخرين',
  'اشارة': 'إشارة',
  'اشارات': 'إشارات',
  'افضلية': 'أفضلية',
  'امام': 'أمام',
  'امامك': 'أمامك',
  'امامي': 'أمامي',
  'امامية': 'أمامية',
  'امامها': 'أمامها',
  'امان': 'أمان',
  'اطارات': 'إطارات',
  'احمر': 'أحمر',
  'اثناء': 'أثناء',
  'اسعاف': 'إسعاف',
  'اقوم': 'أقوم',
  'اولوية': 'أولوية',
  'ادنى': 'أدنى',
  'اشهر': 'أشهر',
  'انوار': 'أنوار',
  'اعمال': 'أعمال',
  'اشغال': 'أشغال',
  'افساح': 'إفساح',
  'احاول': 'أحاول',
  'اتوقف': 'أتوقف',
  'اشخاص': 'أشخاص',
  'اول': 'أول',
  'اعطاء': 'إعطاء',
  'اقرب': 'أقرب',
  'اضافة': 'إضافة',
  'ايجابي': 'إيجابي',
  'ايجابيا': 'إيجابياً',
  'افضل': 'أفضل',
  'ايمن': 'أيمن',
  'اسفل': 'أسفل',
  'اربعة': 'أربعة',
  'اقامة': 'إقامة',
  'امور': 'أمور',
  'اطراف': 'أطراف',
  'اجراءات': 'إجراءات',
  'ابيض': 'أبيض',
  'احترمك': 'أحترمك',
  'اضاءة': 'إضاءة',
  'ارقام': 'أرقام',
  'اصلاح': 'إصلاح',
  'احيانا': 'أحياناً',
  'الى': 'إلى',
  'اذا': 'إذا',
  'اقصى': 'أقصى',
  'اعلاه': 'أعلاه',
  'اكثر': 'أكثر',
  'اقل': 'أقل',
  'اخر': 'آخر',
  'الكترونية': 'إلكترونية',
  'انه': 'أنه', // only after ب (بأنه); bare انه stays (أنه or إنه)
};
const STEM_RE = new RegExp(`(^|[^${L}])(\u0648\u0627\u0644|\u0628\u0627\u0644|\u0641\u0627\u0644|\u0643\u0627\u0644|\u0648\u0644\u0644|\u0644\u0644|\u0627\u0644|\u0648|\u0641|\u0628|\u0644|\u0643)?(${Object.keys(HAMZA_STEMS).join('|')})(?=$|[^${L}])`, 'g');

/** "لا" run into the next verb (QA_1 A2): لايسمح → لا يسمح. */
const LA_RE = word('\u0648?\u0644\u0627(?:\u062a\u0642\u0644|\u064a\u0633\u0645\u062d|\u062a\u0643\u0648\u0646|\u064a\u0645\u0643\u0646|\u064a\u062c\u0628|\u064a\u0648\u062c\u062f|\u062a\u0648\u062c\u062f|\u064a\u0631\u0627\u0642\u0628\u0648\u0646|\u064a\u0633\u062a\u0637\u064a\u0639\u0648\u0646|\u062a\u0639\u0648\u062f)');

/** After 11–99 the counted noun is singular and accusative (QA_1 A3): "20 متر" → "20 متراً". */
const TAMYIZ: Record<string, string> = {
  '\u0645\u062a\u0631': '\u0645\u062a\u0631\u0627\u064b', // متر
  '\u0646\u0642\u0637\u0629': '\u0646\u0642\u0637\u0629\u064b', // نقطة
  '\u0639\u0627\u0645': '\u0639\u0627\u0645\u0627\u064b', // عام
  '\u0633\u0646\u0629': '\u0633\u0646\u0629\u064b', // سنة
  '\u0634\u062e\u0635': '\u0634\u062e\u0635\u0627\u064b', // شخص
  '\u062b\u0627\u0646\u064a\u0629': '\u062b\u0627\u0646\u064a\u0629\u064b', // ثانية
  '\u0633\u0627\u0639\u0629': '\u0633\u0627\u0639\u0629\u064b', // ساعة
  '\u062f\u0642\u064a\u0642\u0629': '\u062f\u0642\u064a\u0642\u0629\u064b', // دقيقة
};
const TAMYIZ_RE = new RegExp(`(^|[^\\d.,])(\\d+)[ \u00a0]+(${Object.keys(TAMYIZ).join('|')})(?=$|[^${L}])`, 'g');

/** "ان" is "إن" when it opens a question (after any opening « or bracket) or follows حيث / قال; otherwise "أن". */
function inna(before: string, question: boolean): boolean {
  if (question && /^[\s\u00ab(]*$/.test(before)) return true;
  return /(^|[^\u0621-\u064a])(?:\u062d\u064a\u062b|\u0642\u0627\u0644|\u0642\u0627\u0644\u062a)[\s\u00a0]+$/.test(before);
}

/**
 * Display tidy-up for the Arabic question bank, which comes with typing habits of its source. The data stays as
 * published; the reader sees standard spelling:
 * - Persian-keyboard letters and tatweel (arabicLetters);
 * - missing hamza on common words; "ان" is "إن" when it opens a question and "أن" elsewhere; "أن لا" before a verb is "ألّا";
 * - "لا" separated from the verb it was typed into, and "ماذكر" → "ما ذُكر";
 * - the counted noun after 11–99;
 * - no space before final punctuation or inside brackets, ".." before a question mark dropped;
 * - a question that stops mid-sentence ends with "…", as the translations do (`question` only).
 */
export function tidyArabic(s: string, question = true): string {
  let v = arabicLetters(s)
    .replace(HAMZA_RE, (_m, pre: string, w: string) => pre + HAMZA[w])
    .replace(STEM_RE, (m, pre: string, clitic: string | undefined, w: string) => (w === '\u0627\u0646\u0647' && clitic !== '\u0628' ? m : pre + (clitic ?? '') + HAMZA_STEMS[w]))
    .replace(/\u0627\u0644\u0627\u062a\u064a(?=$|[^\u0621-\u064a])/g, '\u0627\u0644\u0622\u062a\u064a') // الاتي → الآتي
    .replace(word('\u0644\u0627\u0634\u064a\u0621'), (_m, pre: string) => `${pre}\u0644\u0627 \u0634\u064a\u0621`) // لاشيء → لا شيء
    .replace(/\u0623\u0645\u0648\u0631\u0627\u0644\u062a\u064a|\u0627\u0645\u0648\u0631\u0627\u0644\u062a\u064a/g, '\u0623\u0645\u0648\u0631 \u0627\u0644\u062a\u064a') // امورالتي → أمور التي
    .replace(word('\u0627\u0646'), (_m, pre: string, _w: string, at: number, all: string) => pre + (inna(all.slice(0, at + pre.length), question) ? '\u0625\u0646' : '\u0623\u0646'))
    .replace(word('\u0628?[\u0623\u0627]\u0646 \u0644\u0627'), (m, pre: string) => `${pre}${m.slice(pre.length).startsWith('\u0628') ? '\u0628' : ''}\u0623\u0644\u0651\u0627`)
    .replace(LA_RE, (_m, pre: string, w: string) => (w.startsWith('\u0648') ? `${pre}\u0648\u0644\u0627 ${w.slice(3)}` : `${pre}\u0644\u0627 ${w.slice(2)}`))
    .replace(word('\u0645\u0627\u0630\u0643\u0631'), (_m, pre: string) => `${pre}\u0645\u0627 \u0630\u064f\u0643\u0631`)
    .replace(word('\u0645\u0627\u0647(?:\u0648|\u064a)'), (_m, pre: string, w: string) => `${pre}\u0645\u0627 ${w.slice(2)}`) // ماهو → ما هو
    .replace(/\u0627\u064e(?=$|[^\u0621-\u064a])/g, '\u0627\u064b') // مستعداَ → مستعداً
    .replace(TAMYIZ_RE, (m, pre: string, n: string, noun: string) => {
      const r = Number(n) % 100;
      return r >= 11 && r <= 99 ? `${pre}${n} ${TAMYIZ[noun]}` : m;
    })
    .replace(/(\d[ \u00a0]+\u0645\u062a\u0631)\u0627\u064b(?=[ \u00a0]+\u0645(?:\u0631\u0628\u0639|\u0643\u0639\u0628))/g, '$1') // an adjective follows: leave "20 متر مربع"
    .replace(/\s*\.{2,}\s*([؟?])/g, '$1')
    .replace(/[ \u00a0]+([؟?:،!؛])/g, '$1')
    .replace(/[ \u00a0]+\.(?!\.)/g, '.')
    .replace(/\([ \u00a0]+/g, '(')
    .replace(/[ \u00a0]+\)/g, ')')
    .replace(/([^\s(\u00ab])\(/g, '$1 (') // "3(باللون" → "3 (باللون"
    .replace(/\)(?=[\u0621-\u064a])/g, ') ') // "2)بعد" → "2) بعد"
    .replace(/([\u0621-\u064a])\u00ab/g, '$1 \u00ab') // "أو«" → "أو «"
    .replace(/\u00ab[ \u00a0]+/g, '\u00ab')
    .replace(/[ \u00a0]+\u00bb/g, '\u00bb')
    .replace(/:-$/, ':')
    .replace(/(^|[\u0621-\u064a]{2}[\s\u060c]+)\u0648\s+(?=[\u0621-\u064a])/g, '$1\u0648') // "و أكثر" → "وأكثر"; not "أ و ب"
    .trim();
  // A one-letter preposition that ends the stem keeps its joining stroke: "يقصد ب" → "يقصد بـ…".
  if (question && /(^|\s)[\u0628\u0644\u0643]$/.test(v)) v += '\u0640';
  if (question && v && !/[؟?.:!…](\s*\([^()]*\))?$/.test(v)) v += '…';
  return v;
}

const tidied = new Map<string, string>();
function tidyQ(s: string): string {
  let v = tidied.get(s);
  if (v === undefined) tidied.set(s, (v = tidyArabic(s)));
  return v;
}
const tidiedO = new Map<string, string>();
function tidyO(s: string): string {
  let v = tidiedO.get(s);
  if (v === undefined) tidiedO.set(s, (v = tidyArabic(s, false)));
  return v;
}

export function questionText(q: Question, lang: Lang): string {
  return lang === 'ar' ? tidyQ(q.question) : questionsFor(lang)[q.id]?.q ?? tidyQ(q.question);
}

export function optionText(q: Question, o: QuestionOption, lang: Lang): string | undefined {
  if (!o.text) return undefined;
  return lang === 'ar' ? tidyO(o.text) : questionsFor(lang)[q.id]?.o[o.id] ?? o.text;
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

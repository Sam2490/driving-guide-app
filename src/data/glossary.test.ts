/**
 * Glossary guard (linguistic audit, build 26, section H): one term per concept in each language. The test fails when a
 * banned variant comes back into the text the app shows: interface strings, questions, the guide and sign names.
 * scripts/generated/*.ts are the source of these tables; the older JSON drafts in scripts/translations (and -hi-bn) still
 * hold some banned terms, so they must not be used to rebuild the tables without this test passing.
 */
import { SIGN_NAMES } from './i18n/signs';
import enQ from './i18n/questions/en';
import urQ from './i18n/questions/ur';
import hiQ from './i18n/questions/hi';
import bnQ from './i18n/questions/bn';
import enG from './i18n/guide/en';
import urG from './i18n/guide/ur';
import hiG from './i18n/guide/hi';
import bnG from './i18n/guide/bn';
import { en } from '@/i18n/en';
import { ur } from '@/i18n/ur';
import { hi } from '@/i18n/hi';
import { bn } from '@/i18n/bn';

// Every string the app can show, including the text inside interface functions (plurals, templates).
const flat = (v: unknown): string =>
  typeof v === 'string' ? v : typeof v === 'function' ? v.toString() : v && typeof v === 'object' ? Object.values(v).map(flat).join('\n') : '';
const DATA = { en: [en, enQ, enG], ur: [ur, urQ, urG], hi: [hi, hiQ, hiG], bn: [bn, bnQ, bnG] } as const;
const shown = (lang: keyof typeof DATA) => [...DATA[lang].map(flat), ...Object.values(SIGN_NAMES).map((n) => n[lang])].join('\n');

// [banned variant, the standard term, why]
const BANNED: Record<'en' | 'ur' | 'hi' | 'bn', [RegExp, string, string][]> = {
  en: [
    [/\bMotorway/, 'Highway', 'one term for طريق سريع'],
    [/\blorry\b/i, 'truck', 'international English'],
    [/\(type \d\)/, '(design N)', 'sign variants are designs'],
  ],
  ur: [
    [/مشقی امتحان/, 'آزمائشی امتحان', 'one name for the mock exam (UR-6)'],
    [/تھیوری امتحان/, 'نظری امتحان', 'one name for the theory test (UR-6)'],
    [/انتظار ممنوع/, 'پارکنگ ممنوع', 'الانتظار means parking (UR-5)'],
    [/بند راستہ/, 'بند گلی', 'a dead end, not a closed road (UR-8)'],
    [/آگے آپ کو ترجیح حاصل ہے/, 'آگے راستہ دیں', 'the give-way sign (UR-1)'],
  ],
  hi: [
    [/बंद रास्ता/, 'बंद गली', 'a dead end, not a closed road (HI-3)'],
    [/अबशर/, 'अबशिर', 'one spelling of Absher'],
  ],
  bn: [
    [/সাইন(?!বোর্ড)/, 'চিহ্ন', 'one word for a traffic sign (BN-2)'],
    [/আবশের/, 'আবশির', 'one spelling of Absher'],
    // "আংশিক বন্ধ রাস্তা" (a partly closed road, guide t12) is correct; a dead end is কানাগলি.
    [/(?<!আংশিক )বন্ধ রাস্তা/, 'কানাগলি', 'a dead end, not a closed road (BN-3)'],
  ],
};

describe.each(Object.keys(BANNED) as (keyof typeof BANNED)[])('glossary: %s', (lang) => {
  const text = shown(lang);
  it.each(BANNED[lang].map(([re, std, why]) => [re.source, std, why, re] as const))('no "%s" (use "%s": %s)', (_src, _std, _why, re) => {
    const hits = text.split('\n').filter((l) => re.test(l)).map((l) => l.slice(0, 120));
    expect(hits).toEqual([]);
  });
});

it('Absher is written one way in Urdu', () => {
  expect(shown('ur')).not.toMatch(/ابشير|آبشر/);
});

it('reads the real interface, question, guide and sign text (so a pass means something)', () => {
  const urText = shown('ur');
  expect(urText).toContain('نظری امتحان'); // interface
  expect(urText).toContain('بند گلی (آگے راستہ نہیں)'); // questions and sign names
  expect(urText).toContain('رکنے کا فاصلہ'); // guide
  expect(shown('bn')).toContain('কানাগলি');
});

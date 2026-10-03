import { QUESTIONS } from './questions';
import { GUIDE_TOPICS } from './licenseGuide';
import { SIGNS } from './signs';
import { SCHOOLS } from './schools';
import { CITIES } from './cities';
import { STRINGS } from '@/i18n';
import { cityName, optionText, questionText, regionName, schoolText, signName, topicText } from './localize';

const ARABIC = /[؀-ۿ]/;
const LANGS = ['en', 'ur', 'hi', 'bn'] as const;
const SCRIPT = { en: /^[^\u0600-\u06FF]*$/, ur: ARABIC, hi: /[\u0900-\u097F]/, bn: /[\u0980-\u09FF]/ };

describe('translations are complete', () => {
  it.each(LANGS)('every question and text option has a %s translation', (lang) => {
    for (const q of QUESTIONS) {
      const text = questionText(q, lang);
      expect(text).not.toBe(q.question);
      expect(text).toMatch(SCRIPT[lang]);
      if (lang !== 'ur') expect(text).not.toMatch(ARABIC);
      for (const o of q.options) {
        if (!o.text) continue;
        const t = optionText(q, o, lang)!;
        expect(t.trim().length).toBeGreaterThan(0);
        if (lang !== 'ur') expect(t).not.toMatch(ARABIC);
      }
    }
  });
  it.each(LANGS)('guide topics keep their structure in %s', (lang) => {
    for (const topic of GUIDE_TOPICS) {
      const tx = topicText(topic, lang);
      expect(tx.title).not.toBe(topic.title);
      expect(tx.blocks).toHaveLength(topic.blocks.length);
      tx.blocks.forEach((b, i) => {
        const src = topic.blocks[i];
        if ('table' in src) {
          expect('table' in b && b.table.map((r) => r.length)).toEqual(src.table.map((r) => r.length));
        } else expect('text' in b && b.text.length).toBeGreaterThan(0);
      });
    }
  });
  it.each(LANGS)('signs, schools, cities and regions have %s names', (lang) => {
    for (const s of SIGNS) expect(signName(s, lang)).not.toBe(s.nameAr);
    for (const s of SCHOOLS) expect(schoolText(s, lang).name).not.toBe(s.name);
    for (const c of CITIES) {
      const city = cityName(c.name, lang);
      const region = regionName(c.region, lang);
      expect(city).toMatch(SCRIPT[lang]);
      expect(region).toMatch(SCRIPT[lang]);
    }
  });
  it('Urdu text is written in Arabic script', () => {
    for (const q of QUESTIONS) expect(questionText(q, 'ur')).toMatch(ARABIC);
  });
  it('Arabic stays the original', () => {
    expect(questionText(QUESTIONS[0], 'ar')).toBe(QUESTIONS[0].question);
  });
});

describe('interface strings', () => {
  const shape = (o: unknown): unknown =>
    Array.isArray(o) ? o.length : typeof o === 'function' ? 'fn' : o && typeof o === 'object' ? Object.fromEntries(Object.keys(o as object).sort().map((k) => [k, shape((o as Record<string, unknown>)[k])])) : typeof o;
  it.each(['ar', 'ur', 'hi', 'bn'])('%s has every key the English file has', (lang) => {
    const en = { ...STRINGS.en, signs: { ...STRINGS.en.signs, groups: {} } };
    const other = { ...STRINGS[lang as 'ar'], signs: { ...STRINGS[lang as 'ar'].signs, groups: {} } };
    expect(shape(other)).toEqual(shape(en));
  });
  it.each(['hi', 'bn'])('%s strings are in their own script', (lang) => {
    const re = lang === 'hi' ? /[\u0900-\u097F]/ : /[\u0980-\u09FF]/;
    const s = STRINGS[lang as 'ar'];
    for (const v of [s.home.title, s.test.start, s.schools.denied, s.about.privacy, s.levels.ranks[0], s.test.exSub(30, 40, 21), s.signs.groups['تحذيرية']]) expect(v).toMatch(re);
  });
});

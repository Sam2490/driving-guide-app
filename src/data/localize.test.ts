import { QUESTIONS } from './questions';
import { GUIDE_TOPICS } from './licenseGuide';
import { SIGNS } from './signs';
import { SCHOOLS } from './schools';
import { CITIES } from './cities';
import { cityName, optionText, questionText, regionName, schoolText, signName, topicText } from './localize';

const ARABIC = /[؀-ۿ]/;
const LANGS = ['en', 'ur'] as const;

describe('translations are complete', () => {
  it.each(LANGS)('every question and text option has a %s translation', (lang) => {
    for (const q of QUESTIONS) {
      const text = questionText(q, lang);
      expect(text).not.toBe(q.question);
      if (lang === 'en') expect(text).not.toMatch(ARABIC);
      for (const o of q.options) {
        if (!o.text) continue;
        const t = optionText(q, o, lang)!;
        expect(t.trim().length).toBeGreaterThan(0);
        if (lang === 'en') expect(t).not.toMatch(ARABIC);
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
      if (lang === 'en') {
        expect(city).not.toMatch(ARABIC);
        expect(region).not.toMatch(ARABIC);
      } else {
        expect(city).toMatch(ARABIC);
        expect(region).toMatch(ARABIC);
      }
    }
  });
  it('Urdu text is written in Arabic script', () => {
    for (const q of QUESTIONS) expect(questionText(q, 'ur')).toMatch(ARABIC);
  });
  it('Arabic stays the original', () => {
    expect(questionText(QUESTIONS[0], 'ar')).toBe(QUESTIONS[0].question);
  });
});

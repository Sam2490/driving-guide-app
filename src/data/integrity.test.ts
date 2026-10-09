/**
 * Exam-content integrity across all five languages. Guards the release against the QA_1 content findings: a
 * question with the same answer twice (q566), a missing translation, or a number that changed in translation.
 */
import { QUESTIONS } from './questions';
import { SIGNS } from './signs';
import { GUIDE_TOPICS } from './licenseGuide';
import { optionText, questionText, signName, topicText } from './localize';
import type { Lang } from './types';

const LANGS: Lang[] = ['ar', 'en', 'ur', 'hi', 'bn'];
const norm = (s: string) => s.replace(/[\s ​-‏⁠]+/g, ' ').trim().toLowerCase();
const digits = (s: string) => (s.replace(/,/g, '').match(/\d+(?:\.\d+)?/g) ?? []).sort();
// Translations may add a gloss with a digit that the English lacks ("(3D)").
const GLOSS = new Set(['q076']);

describe('questions', () => {
  it('have unique option ids and a correct answer that is one of them', () => {
    for (const q of QUESTIONS) {
      const ids = q.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toContain(q.correctAnswerId);
    }
  });

  it('are translated in full: a question and every text option in every language', () => {
    for (const q of QUESTIONS)
      for (const lang of LANGS) {
        expect(questionText(q, lang).trim()).not.toBe('');
        for (const o of q.options) if (o.text) expect((optionText(q, o, lang) ?? '').trim()).not.toBe('');
      }
  });

  it('never offer the same answer twice in any language', () => {
    const dupes: string[] = [];
    for (const q of QUESTIONS)
      for (const lang of LANGS) {
        const texts = q.options.filter((o) => o.text).map((o) => norm(optionText(q, o, lang) ?? ''));
        if (new Set(texts).size !== texts.length) dupes.push(`${q.id}:${lang}`);
      }
    expect(dupes).toEqual([]);
  });

  it('keep the same numbers in English, Urdu, Hindi and Bengali', () => {
    const changed: string[] = [];
    for (const q of QUESTIONS) {
      if (GLOSS.has(q.id)) continue;
      for (const lang of ['ur', 'hi', 'bn'] as Lang[]) {
        if (digits(questionText(q, lang)).join() !== digits(questionText(q, 'en')).join()) changed.push(`${q.id}:${lang}:q`);
        for (const o of q.options)
          if (o.text && digits(optionText(q, o, lang) ?? '').join() !== digits(optionText(q, o, 'en') ?? '').join()) changed.push(`${q.id}:${lang}:${o.id}`);
      }
    }
    expect(changed).toEqual([]);
  });
});

it('every sign has a name in every language', () => {
  for (const s of SIGNS) for (const lang of LANGS) expect(signName(s, lang).trim()).not.toBe('');
});

it('every guide topic has the same blocks and table shapes in every language', () => {
  for (const t of GUIDE_TOPICS) {
    const shape = (lang: Lang) => topicText(t, lang).blocks.map((b) => ('table' in b ? `t${b.table.length}x${b.table[0]?.length}` : 'p'));
    for (const lang of LANGS) expect(shape(lang)).toEqual(shape('ar'));
  }
});

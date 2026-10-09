import { QUESTIONS } from './questions';
import { arabicLetters, optionText, questionText, tidyArabic } from './localize';

describe('tidyArabic', () => {
  it('drops the space before a final question mark or colon', () => {
    expect(tidyArabic('أي مركبة يجب أن تفسح الطريق ؟')).toBe('أي مركبة يجب أن تفسح الطريق؟');
    expect(tidyArabic('هناك قواعد للتجاوز تتمثل في الاتي :')).toBe('هناك قواعد للتجاوز تتمثل في الاتي:');
  });
  it('turns ".. ؟" into a plain question mark', () => {
    expect(tidyArabic('ماذا تعني هذه الإشارة .. ؟')).toBe('ماذا تعني هذه الإشارة؟');
  });
  it('keeps a trailing ellipsis that marks a blank to complete', () => {
    expect(tidyArabic('يجب على السائق ...')).toBe('يجب على السائق ...');
  });
  it('leaves no question with a space before its final mark, and changes nothing else', () => {
    for (const q of QUESTIONS) {
      const out = questionText(q, 'ar');
      expect(out).not.toMatch(/\s[؟?:]$/);
      expect(out.replace(/[\s.؟?:]/g, '')).toBe(arabicLetters(q.question).replace(/[\s.؟?:]/g, ''));
    }
  });
  it('writes Persian-keyboard letters and tatweel as plain Arabic', () => {
    expect(tidyArabic('ھل یجب علـى السائق')).toBe('هل يجب على السائق');
    for (const q of QUESTIONS) {
      expect(questionText(q, 'ar')).not.toMatch(/[\u06cc\u06a9\u06be\u0640]/);
      for (const o of q.options) expect(optionText(q, o, 'ar') ?? '').not.toMatch(/[\u06cc\u06a9\u06be\u0640]/);
    }
  });
});

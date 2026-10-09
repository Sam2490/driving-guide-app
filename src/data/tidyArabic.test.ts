import { QUESTIONS } from './questions';
import { arabicLetters, optionText, questionText, tidyArabic } from './localize';

describe('tidyArabic', () => {
  it('drops the space before a final question mark or colon', () => {
    expect(tidyArabic('أي مركبة يجب أن تفسح الطريق ؟')).toBe('أي مركبة يجب أن تفسح الطريق؟');
    expect(tidyArabic('هناك قواعد للتجاوز تتمثل في الاتي :')).toBe('هناك قواعد للتجاوز تتمثل في الآتي:');
  });
  it('turns ".. ؟" into a plain question mark', () => {
    expect(tidyArabic('ماذا تعني هذه الإشارة .. ؟')).toBe('ماذا تعني هذه الإشارة؟');
  });
  it('keeps a trailing ellipsis that marks a blank to complete', () => {
    expect(tidyArabic('يجب على السائق ...')).toBe('يجب على السائق ...');
  });
  it('leaves no question with a space before its final mark, and changes no letters beyond spelling fixes', () => {
    // Skeleton: no alef forms, diacritics, spaces or punctuation; what is left must match the source letter for letter.
    const skeleton = (s: string) => arabicLetters(s).replace(/\u0623\u0644\u0651\u0627/g, 'انلا').replace(/[\u0621-\u0627\u064b-\u0652\u0640\s.…؟?:،؛!()\-«»]/g, '');
    for (const q of QUESTIONS) {
      const out = questionText(q, 'ar');
      expect(out).not.toMatch(/\s[؟?:]$/);
      expect(skeleton(out)).toBe(skeleton(q.question));
      for (const o of q.options) if (o.text) expect(skeleton(optionText(q, o, 'ar') ?? '')).toBe(skeleton(o.text));
    }
  });
  it('restores the hamza on common words, whole words only (QA_1 A1)', () => {
    expect(tidyArabic('يمكن ان تزيد السرعة الى 70 كلم/س', false)).toBe('يمكن أن تزيد السرعة إلى 70 كلم/س');
    expect(tidyArabic('تغيير مسارك الى مسار اخر', false)).toBe('تغيير مسارك إلى مسار آخر');
    expect(tidyArabic('ان مخالفة قيادة المركبة قبل الحصول على رخصة قيادة هي ...')).toBe('إن مخالفة قيادة المركبة قبل الحصول على رخصة قيادة هي ...');
    expect(tidyArabic('ان تقف وتقدم ما تستطيع', false)).toBe('أن تقف وتقدم ما تستطيع');
    expect(tidyArabic('الانعطاف والاتجاه', false)).toBe('الانعطاف والاتجاه');
  });
  it('writes أن لا as ألّا and separates لا from its verb (QA_1 A2, A9)', () => {
    expect(tidyArabic('يجب أن لا يقل عمق النقشة في الإطارات السليمة عن')).toBe('يجب ألّا يقل عمق النقشة في الإطارات السليمة عن…');
    expect(tidyArabic('غرامة مالية لاتقل عن ثلاثمائة ريال', false)).toBe('غرامة مالية لا تقل عن ثلاثمائة ريال');
    expect(tidyArabic('جميع ماذكر اعلاه', false)).toBe('جميع ما ذُكر أعلاه');
  });
  it('puts the counted noun after 11–99 in the accusative (QA_1 A3)', () => {
    expect(tidyArabic('على بعد 20 متر أو أقل من النفق', false)).toBe('على بعد 20 متراً أو أقل من النفق');
    expect(tidyArabic('100 متر', false)).toBe('100 متر');
    expect(tidyArabic('5 متر', false)).toBe('5 متر');
  });
  it('removes spaces inside brackets and before punctuation (QA_1 A7)', () => {
    expect(tidyArabic('إشارة ( ممنوع التوقف) .', false)).toBe('إشارة (ممنوع التوقف).');
  });
  it('ends a question that stops mid-sentence with an ellipsis, as the translations do (QA_1 A8)', () => {
    expect(tidyArabic('تعتبر معابر المشاة من بين الأماكن التي')).toBe('تعتبر معابر المشاة من بين الأماكن التي…');
    expect(tidyArabic('ما هي النقطة العمياء؟')).toBe('ما هي النقطة العمياء؟');
    for (const q of QUESTIONS) expect(questionText(q, 'ar')).toMatch(/[؟?.:!…](\s*\([^()]*\))?$/);
  });
  it('leaves no hamza-less common word in any question or option', () => {
    const bare = /(^|[^\u0621-\u064a])(الى|او|اذا|اقصى|اعلاه|انت|ان|ماذكر|لاتقل|لايسمح)(?=$|[^\u0621-\u064a])/;
    for (const q of QUESTIONS) {
      expect(questionText(q, 'ar')).not.toMatch(bare);
      for (const o of q.options) expect(optionText(q, o, 'ar') ?? '').not.toMatch(bare);
    }
  });
  it('writes Persian-keyboard letters and tatweel as plain Arabic', () => {
    expect(tidyArabic('ھل یجب علـى السائق', false)).toBe('هل يجب على السائق');
    for (const q of QUESTIONS) {
      // A final one-letter preposition keeps its joining stroke on purpose ("بـ…").
      expect(questionText(q, 'ar').replace(/\u0640…$/, '…')).not.toMatch(/[\u06cc\u06a9\u06be\u0640]/);
      for (const o of q.options) expect(optionText(q, o, 'ar') ?? '').not.toMatch(/[\u06cc\u06a9\u06be\u0640]/);
    }
  });
});

describe('tidyArabic spacing around brackets and quotes', () => {
  it('puts a space before an opening bracket and after a closing one, and before «', () => {
    expect(tidyArabic('الدوار 3( باللون الاحمر)', false)).toBe('الدوار 3 (باللون الأحمر)');
    expect(tidyArabic('المركبة 2 )بعد', false)).toBe('المركبة 2) بعد');
    expect(tidyArabic('أو«افساح', false)).toBe('أو «إفساح');
  });
  it('treats ":-" as a final colon and keeps a final one-letter preposition joined', () => {
    expect(tidyArabic('اختر من التالية:-')).toBe('اختر من التالية:');
    expect(tidyArabic('يقصد بالنقطة العمياء ب')).toBe('يقصد بالنقطة العمياء بـ…');
  });
  it('adds the hamza to بانه and الالكترونية but leaves bare انه alone', () => {
    expect(tidyArabic('يوصف بانه', false)).toBe('يوصف بأنه');
    expect(tidyArabic('البوابات الالكترونية', false)).toBe('البوابات الإلكترونية');
    expect(tidyArabic('انه خطر', false)).toBe('انه خطر');
  });
});

it('joins a detached و to the next word', () => {
  expect(tidyArabic('آمنة و أكثر متعة', false)).toBe('آمنة وأكثر متعة');
  expect(tidyArabic('واحد', false)).toBe('واحد');
});

describe('tidyArabic edge cases from the independent review', () => {
  it('uses إن after حيث / قال and at a question start behind « or (', () => {
    expect(tidyArabic('وذلك حيث ان السرعة عالية', false)).toBe('وذلك حيث إن السرعة عالية');
    expect(tidyArabic('«ان القيادة فن وذوق»')).toBe('«إن القيادة فن وذوق»…');
  });
  it('writes بأن لا as بألّا, ماهو as ما هو, and اَ at a word end as اً', () => {
    expect(tidyArabic('أقر بان لا أتجاوز', false)).toBe('أقر بألّا أتجاوز');
    expect(tidyArabic('ماهو الحد الأقصى؟')).toBe('ما هو الحد الأقصى؟');
    expect(tidyArabic('كن مستعداَ', false)).toBe('كن مستعداً');
  });
  it('leaves the counted noun alone before an adjective, and a و between single letters', () => {
    expect(tidyArabic('مساحة 20 متر مربع', false)).toBe('مساحة 20 متر مربع');
    expect(tidyArabic('الخياران أ و ب', false)).toBe('الخياران أ و ب');
  });
  it('removes spaces just inside «» and adds no ellipsis after a bracketed note', () => {
    expect(tidyArabic('اترك « حق الأولوية »', false)).toBe('اترك «حق الأولوية»');
    expect(tidyArabic('أي واحدة منها؟ (الأسهم الصغيرة)')).toBe('أي واحدة منها؟ (الأسهم الصغيرة)');
  });
});

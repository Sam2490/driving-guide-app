/**
 * Arabic count phrases. Arabic nouns change with the number: 1 and 2 have their own words (no digit), 3–10 take
 * the plural, 11–99 the singular with tanween, and 0 or round hundreds the plain singular. The rule looks at the
 * last two digits, as the CLDR plural rules for Arabic do.
 */
export type ArForms = { one: string; two: string; few: string; many: string; other?: string };

export function arCount(n: number, f: ArForms): string {
  const r = Math.abs(n) % 100;
  if (n === 1) return f.one;
  if (n === 2) return f.two;
  if (r >= 3 && r <= 10) return `${n} ${f.few}`;
  if (r >= 11 && r <= 99) return `${n} ${f.many}`;
  return `${n} ${f.other ?? f.many}`;
}

export const AR = {
  mistake: { one: 'خطأ واحد', two: 'خطآن', few: 'أخطاء', many: 'خطأً', other: 'خطأ' },
  /** Accusative, after a verb ("راجع …"). */
  mistakeAcc: { one: 'خطأً واحداً', two: 'خطأين', few: 'أخطاء', many: 'خطأً', other: 'خطأ' },
  topic: { one: 'موضوع واحد', two: 'موضوعان', few: 'مواضيع', many: 'موضوعاً', other: 'موضوع' },
  sign: { one: 'علامة واحدة', two: 'علامتان', few: 'علامات', many: 'علامة' },
  question: { one: 'سؤال واحد', two: 'سؤالان', few: 'أسئلة', many: 'سؤالاً', other: 'سؤال' },
  minute: { one: 'دقيقة واحدة', two: 'دقيقتان', few: 'دقائق', many: 'دقيقة' },
  school: { one: 'مدرسة واحدة', two: 'مدرستان', few: 'مدارس', many: 'مدرسة' },
  /** Consecutive days, with the adjective agreeing ("يومان متتاليان", "5 أيام متتالية", "12 يوماً متتالياً"). */
  dayStreak: { one: 'يوم واحد متتالٍ', two: 'يومان متتاليان', few: 'أيام متتالية', many: 'يوماً متتالياً', other: 'يوم متتالٍ' },
  /** After "من آخر …" (genitive). */
  examGen: { one: 'اختبار', two: 'اختبارين', few: 'اختبارات', many: 'اختباراً', other: 'اختبار' },
} satisfies Record<string, ArForms>;

import { STRINGS } from './index';

// QA_1 C2: the readiness line used the plural after one exam ("पिछली 1 परीक्षाओं", "آخری 1 امتحانات", "last 1 exams").
describe('readiness text after one exam', () => {
  it('uses the singular in every language, on screen and for screen readers', () => {
    expect(STRINGS.en.rd.readySub(0, 1)).toBe('Passed 0 of your last 1 exam');
    expect(STRINGS.en.rd.readyA11y(6, 0, 1)).toBe('Readiness 6 percent. Passed 0 of your last 1 exam.');
    expect(STRINGS.hi.rd.readySub(0, 1)).toBe('पिछली 1 परीक्षा में पास नहीं');
    expect(STRINGS.hi.rd.readySub(1, 3)).toBe('पिछली 3 परीक्षाओं में से 1 में पास');
    expect(STRINGS.ur.rd.readySub(1, 1)).toBe('آخری امتحان میں کامیاب');
    expect(STRINGS.ur.rd.readySub(0, 2)).toBe('آخری 2 میں سے 0 امتحان پاس');
    expect(STRINGS.ar.rd.readyA11y(6, 0, 1)).toBe('الجاهزية 6 بالمئة. نجحت في 0 من آخر اختبار.');
    for (const s of Object.values(STRINGS)) {
      expect(s.rd.readyA11y(6, 0, 1)).not.toMatch(/\b1 exams|1 اختبارات|1 परीक्षाओं|1 امتحانات/);
    }
  });
});

// QA_1 C1: "halfway" was translated literally; the summary now says what is needed.
it('the mistakes-practice summary explains the two-in-a-row rule in every language', () => {
  for (const s of Object.values(STRINGS)) {
    expect(s.rd.drillRule.length).toBeGreaterThan(10);
    expect(s.rd.drillLeft.length).toBeGreaterThan(2);
    expect(s.rd.drillSub(0, 23, 10)).toContain('10');
  }
  expect(STRINGS.en.rd.drillSub(0, 23, 10)).toBe('0 mastered · 10 need one more correct answer · 23 still to fix');
  expect(STRINGS.en.rd.drillSub(0, 23, 1)).toBe('0 mastered · 1 needs one more correct answer · 23 still to fix');
  expect(STRINGS.ar.rd.drillSub(0, 23, 10)).not.toContain('منتصف الطريق');
});

// QA_1 A4: "10 ريال" → "10 ريالات"; the noun follows the last number in the chip.
it('Arabic fee chips agree with the number', () => {
  expect(STRINGS.ar.rd.fee('10')).toBe('10 ريالات');
  expect(STRINGS.ar.rd.fee('≈ 2760')).toBe('≈ 2760 ريالاً');
  expect(STRINGS.ar.rd.fee('85 · 200 · 400')).toBe('85 · 200 · 400 ريال');
});

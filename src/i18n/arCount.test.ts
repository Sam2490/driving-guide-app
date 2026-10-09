import { AR, arCount, arNoun } from './arCount';
import { ar } from './ar';

test('Arabic count words follow the number', () => {
  expect(arCount(1, AR.mistake)).toBe('خطأ واحد');
  expect(arCount(2, AR.mistake)).toBe('خطآن');
  expect(arCount(3, AR.mistake)).toBe('3 أخطاء');
  expect(arCount(10, AR.mistake)).toBe('10 أخطاء');
  expect(arCount(11, AR.mistake)).toBe('11 خطأً');
  expect(arCount(30, AR.mistake)).toBe('30 خطأً');
  expect(arCount(100, AR.mistake)).toBe('100 خطأ');
  expect(arCount(103, AR.mistake)).toBe('103 أخطاء');
});

test('app strings use the inflected forms', () => {
  expect(ar.rd.mistakesRow(1)).toBe('راجع خطأً واحداً');
  expect(ar.rd.mistakesRow(30)).toBe('راجع 30 خطأً');
  expect(ar.test.exSub(30, 30, 24)).toBe('30 سؤالاً · 30 دقيقة · النجاح من\u00a024');
  expect(ar.signs.count(192)).toBe('192 علامة');
  expect(ar.schools.count(1)).toBe('مدرسة واحدة');
  expect(ar.rd.timeWarn(5)).toBe('بقيت 5 دقائق');
});

test('the day streak agrees with its number', () => {
  expect(ar.levels.streak(1)).toBe('يوم واحد متتالٍ');
  expect(ar.levels.streak(2)).toBe('يومان متتاليان');
  expect(ar.levels.streak(5)).toBe('5 أيام متتالية');
  expect(ar.levels.streak(12)).toBe('12 يوماً متتالياً');
});

describe('arNoun', () => {
  it('picks the plural for 3–10 and the tanween singular for 11–99', () => {
    expect(arNoun(10, AR.point)).toBe('نقاط');
    expect(arNoun(12, AR.point)).toBe('نقطةً');
    expect(arNoun(100, AR.point)).toBe('نقطة');
  });
});

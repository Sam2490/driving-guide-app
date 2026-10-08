import { AR, arCount } from './arCount';
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
  expect(ar.test.exSub(30, 30, 24)).toBe('30 سؤالاً · 30 دقيقة · النجاح من 24');
  expect(ar.signs.count(192)).toBe('192 علامة');
  expect(ar.schools.count(1)).toBe('مدرسة واحدة');
  expect(ar.rd.timeWarn(5)).toBe('بقيت 5 دقائق');
});

import { SCHOOLS } from '@/data/schools';
import { renderRouter, screen, fireEvent, act, waitFor } from 'expo-router/testing-library';
import * as Location from 'expo-location';
import { render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorBoundary } from '@/app/_layout';
import { QUESTIONS } from '@/data/questions';
import { levelQuestions } from '@/features/levels/levels';
import { selectAnswer, startExam } from '@/features/quiz/engine';
import { serializeExam } from '@/services/storage';

jest.mock('expo-location', () => ({
  Accuracy: { Low: 2, Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));
jest.mock('expo-haptics', () => ({ selectionAsync: jest.fn(() => Promise.resolve()), notificationAsync: jest.fn(() => Promise.resolve()), NotificationFeedbackType: { Success: 's', Error: 'e' } }));
const L = Location as jest.Mocked<typeof Location>;

const APP = './src/app';
beforeEach(() => AsyncStorage.clear());
async function settle() {
  for (let i = 0; i < 6; i++) await act(async () => {});
}
async function open(url: string) {
  await renderRouter(APP, { initialUrl: url });
  await settle();
}

describe('navigation', () => {
  it.each(['/', '/guide', '/guide/t00', '/guide/license', '/signs', '/signs/s000', '/test', '/schools', '/schools/b01', '/settings', '/about', '/level/1'])('renders %s', async (url) => {
    await open(url);
    expect(screen.toJSON()).toBeTruthy();
  });

  it('home cards open the right tabs', async () => {
    await open('/');
    await fireEvent.press(screen.getByLabelText('دليل المتدرب'));
    await settle();
    expect(screen.getByRole('tab', { name: 'الدليل' }).props.accessibilityState.selected).toBe(true);
    expect(screen.getByPlaceholderText('ابحث في الدليل…', { includeHiddenElements: true })).toBeTruthy();
  });

  it('unknown ids show an empty state instead of crashing', async () => {
    await open('/guide/nope');
    expect(screen.getByText('لا توجد نتائج.')).toBeTruthy();
  });
});

describe('mock exam flow', () => {
  it('hides answers until submit, supports back, and shows score and mistakes', async () => {
    await open('/test');
    await fireEvent.press(screen.getByText('ابدأ الاختبار'));
    await settle();
    expect(screen.getByText('السؤال 1 من 30')).toBeTruthy();

    const options = screen.getAllByRole('radio');
    await fireEvent.press(options[0]);
    // no correct/incorrect feedback during the exam
    expect(screen.queryByText('إجابة صحيحة')).toBeNull();
    expect(screen.queryByText('إجابة خاطئة')).toBeNull();

    await fireEvent.press(screen.getByText('التالي'));
    expect(screen.getByText('السؤال 2 من 30')).toBeTruthy();
    await fireEvent.press(screen.getByText('السابق'));
    expect(screen.getByText('السؤال 1 من 30')).toBeTruthy();
    expect(screen.getAllByRole('radio')[0].props.accessibilityState.selected).toBe(true);

    await fireEvent.press(screen.getByLabelText('كل الأسئلة'));
    await fireEvent.press(screen.getAllByText('تسليم').at(-1)!);
    expect(screen.getByText('لم تُجب عن 29 من الأسئلة. هل تريد التسليم؟')).toBeTruthy();
    await fireEvent.press(screen.getAllByText('تسليم').at(-1)!);
    await settle();
    expect(screen.getByText('راسب')).toBeTruthy();
    expect(screen.getByText('النجاح من 21 فأكثر')).toBeTruthy();

    await fireEvent.press(screen.getByText('مراجعة الأخطاء'));
    await settle();
    expect(screen.getByText(/^الأخطاء \((29|30)\)$/)).toBeTruthy();
    expect(screen.getAllByText('الإجابة الصحيحة:').length).toBeGreaterThanOrEqual(29);
  });
});

describe('level challenge', () => {
  it('locks later levels and plays level 1 with instant feedback', async () => {
    await open('/level/3');
    expect(screen.getByText('يُفتح بعد المستوى السابق')).toBeTruthy();
  });
  it('gives feedback after confirming an answer', async () => {
    await open('/level/1');
    await fireEvent.press(screen.getAllByRole('radio')[0]);
    await fireEvent.press(screen.getByText('تأكيد الإجابة'));
    expect(screen.queryByText('إجابة صحيحة') ?? screen.queryByText('إجابة خاطئة')).toBeTruthy();
    expect(screen.getByText('متابعة')).toBeTruthy();
  });
});

describe('nearby schools', () => {
  beforeEach(() => [L.requestForegroundPermissionsAsync, L.hasServicesEnabledAsync, L.getCurrentPositionAsync].forEach((f) => f.mockReset()));
  it('explains first, then lists schools by distance when allowed', async () => {
    L.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted', canAskAgain: true } as never);
    L.hasServicesEnabledAsync.mockResolvedValue(true);
    L.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: 26.33, longitude: 43.97 } } as never);
    await open('/schools');
    await fireEvent.press(screen.getByText('ابحث عن أقرب مدرسة'));
    expect(L.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(screen.getByText('استخدام موقعك؟')).toBeTruthy();
    await fireEvent.press(screen.getByText('متابعة'));
    await settle();
    await waitFor(() => expect(screen.getByText('أقرب المدارس')).toBeTruthy());
    expect(screen.getAllByText(/^\d+ كم$/)[0].props.children).toBe('1 كم');
  });
  it('stays usable when permission is denied', async () => {
    L.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied', canAskAgain: true } as never);
    await open('/schools');
    await fireEvent.press(screen.getByText('ابحث عن أقرب مدرسة'));
    await fireEvent.press(screen.getByText('متابعة'));
    await settle();
    await waitFor(() => expect(screen.getByText('يلزم إذن الموقع للعثور على مدارس القيادة القريبة منك.')).toBeTruthy());
    await fireEvent.press(screen.getByText('عرض كل المدارس'));
    expect(screen.getByText(`${SCHOOLS.length} مدرسة`)).toBeTruthy();
  });
  it('reports GPS turned off', async () => {
    L.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted', canAskAgain: true } as never);
    L.hasServicesEnabledAsync.mockResolvedValue(false);
    await open('/schools');
    await fireEvent.press(screen.getByText('ابحث عن أقرب مدرسة'));
    await fireEvent.press(screen.getByText('متابعة'));
    await settle();
    await waitFor(() => expect(screen.getByText('خدمات الموقع متوقفة. شغّل الموقع وحاول مرة أخرى.')).toBeTruthy());
  });
});

describe('English exam', () => {
  it('shows the question and answers in English with A-D letters', async () => {
    await open('/settings');
    await fireEvent.press(screen.getByRole('radio', { name: 'English' }));
    await settle();
    await open('/test');
    await fireEvent.press(screen.getByText('Start exam'));
    await settle();
    expect(screen.getByText('Question 1 of 30')).toBeTruthy();
    const radios = screen.getAllByRole('radio');
    expect(radios[0].props.accessibilityLabel).toMatch(/^A\. /);
    expect(radios[0].props.accessibilityLabel).not.toMatch(/[\u0600-\u06FF]/);
  });
});

describe('safe failures', () => {
  it('unknown routes show a translated not-found screen', async () => {
    await open('/does-not-exist');
    expect(screen.getByText('هذه الصفحة غير موجودة.')).toBeTruthy();
    await fireEvent.press(screen.getByText('الرئيسية'));
    await settle();
    expect(screen.getByRole('tab', { name: 'الرئيسية' }).props.accessibilityState.selected).toBe(true);
  });
  it('a crashing screen shows a friendly message with retry, and no technical details', async () => {
    const retry = jest.fn();
    await render(<ErrorBoundary error={new Error('secret stack detail')} retry={retry} />);
    expect(screen.queryByText(/secret stack detail/)).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: /Try again|حاول مرة أخرى/ }));
    expect(retry).toHaveBeenCalled();
  });
});

describe('exam survives the app closing', () => {
  it('saves the exam in progress as ids and answers only', async () => {
    await open('/test');
    await fireEvent.press(screen.getByText('ابدأ الاختبار'));
    await settle();
    await fireEvent.press(screen.getAllByRole('radio')[1]);
    await settle();
    const saved = JSON.parse((await AsyncStorage.getItem('exam.v1'))!);
    expect(saved.q).toHaveLength(30);
    expect(Object.keys(saved.a)).toHaveLength(1);
  });
  it('offers to resume a saved exam after a restart', async () => {
    const x = startExam(QUESTIONS);
    const first = QUESTIONS[0];
    const withFirst = selectAnswer({ ...x, questions: [first, ...x.questions.filter((q) => q.id !== first.id).slice(0, 29)] }, first.id, first.options[0].id);
    await AsyncStorage.setItem('exam.v1', JSON.stringify(serializeExam(withFirst)));
    await open('/test');
    await waitFor(() => expect(screen.getByText('متابعة الاختبار · أجبت عن 1 من 30')).toBeTruthy());
    await fireEvent.press(screen.getByText('متابعة الاختبار · أجبت عن 1 من 30'));
    await settle();
    expect(screen.getByText('السؤال 1 من 30')).toBeTruthy();
    expect(screen.getByRole('radio', { selected: true })).toBeTruthy();
  });
});

describe('level outcomes', () => {
  // Level 1 always has the same 8 questions (only the option order is shuffled), so the right answer is found by its text.
  async function play(right: boolean, rounds: number) {
    const qs = levelQuestions(QUESTIONS, 1);
    await open('/level/1');
    for (let i = 0; i < rounds; i++) {
      const q = qs[i];
      const correctText = q.options.find((o) => o.id === q.correctAnswerId)!.text!;
      const radios = screen.getAllByRole('radio');
      const isRight = (r: (typeof radios)[number]) => String(r.props.accessibilityLabel).slice(3) === correctText;
      await fireEvent.press(radios.find((r) => isRight(r) === right)!);
      await fireEvent.press(screen.getByText('تأكيد الإجابة'));
      expect(screen.getByText(right ? 'إجابة صحيحة' : 'إجابة خاطئة')).toBeTruthy();
      await fireEvent.press(screen.getByText('متابعة'));
      await settle();
    }
  }
  it('completes a level with all answers right and saves 3 stars', async () => {
    await play(true, 8);
    expect(screen.getByText('اكتمل المستوى')).toBeTruthy();
    expect(JSON.parse((await AsyncStorage.getItem('levels.v1'))!).done['1']).toBe(3);
  });
  it('ends the level after 5 wrong answers', async () => {
    await play(false, 5);
    expect(screen.getByText('نفدت المحاولات')).toBeTruthy();
  });
});

/** Every pressable control must expose a role and a name to screen readers. */
function unlabelledControls(node: unknown): string[] {
  const out: string[] = [];
  const textOf = (n: any): string => (typeof n === 'string' ? n : n?.children ? n.children.map(textOf).join('') : '');
  const walk = (n: any) => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(walk);
    const p = n.props ?? {};
    if (p.accessible && (p.onClick || p.onResponderRelease)) {
      const name = p.accessibilityLabel ?? textOf(n);
      if (!p.accessibilityRole || !String(name).trim()) out.push(JSON.stringify({ role: p.accessibilityRole, name, testID: p.testID }));
    }
    (n.children ?? []).forEach(walk);
  };
  walk(node);
  return out;
}

describe('accessibility', () => {
  it.each(['/', '/guide', '/guide/license', '/signs', '/test', '/schools', '/schools/b01', '/settings', '/about', '/level/1'])('all controls on %s have a role and a name', async (url) => {
    await open(url);
    expect(unlabelledControls(screen.toJSON())).toEqual([]);
  });
  it('the level map labels every level node', async () => {
    await open('/test');
    await fireEvent.press(screen.getByRole('tab', { name: /المستويات/ }));
    await settle();
    expect(screen.getAllByLabelText(/^المستوى \d+/).length).toBeGreaterThan(0);
    expect(unlabelledControls(screen.toJSON())).toEqual([]);
  });
});

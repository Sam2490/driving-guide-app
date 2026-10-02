import { renderRouter, screen, fireEvent, act, waitFor } from 'expo-router/testing-library';
import * as Location from 'expo-location';

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));
jest.mock('expo-haptics', () => ({ selectionAsync: jest.fn(() => Promise.resolve()), notificationAsync: jest.fn(() => Promise.resolve()), NotificationFeedbackType: { Success: 's', Error: 'e' } }));
const L = Location as jest.Mocked<typeof Location>;

const APP = './src/app';
async function settle() {
  for (let i = 0; i < 6; i++) await act(async () => {});
}
async function open(url: string) {
  await renderRouter(APP, { initialUrl: url });
  await settle();
}

describe('navigation', () => {
  it.each(['/', '/guide', '/guide/t00', '/guide/license', '/signs', '/signs/s000', '/test', '/schools', '/schools/sch00', '/settings', '/about', '/level/1'])('renders %s', async (url) => {
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
    expect(screen.getByText('22 مدرسة')).toBeTruthy();
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
    await fireEvent.press(screen.getByRole('tab', { name: 'English' }));
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

import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { getPositionOnce } from './location';
import { nativeMapsUrl, webMapsUrl } from './maps';
import { parseExam, parseProgress, parseSettings, serializeExam } from './storage';
import { isSafeDeepLink, upgradeLegacyPath } from './links';
import { QUESTIONS } from '@/data/questions';
import { selectAnswer, startExam } from '@/features/quiz/engine';

jest.mock('expo-location', () => ({
  Accuracy: { Low: 2, Balanced: 3, High: 4 },
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  enableNetworkProviderAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(() => Promise.resolve(null)),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(() => new Promise(() => {})),
}));
const L = Location as jest.Mocked<typeof Location>;

describe('location', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    L.getLastKnownPositionAsync.mockResolvedValue(null);
  });
  it('uses a recent cached fix without waiting for a new one', async () => {
    L.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted', canAskAgain: true } as never);
    L.hasServicesEnabledAsync.mockResolvedValue(true);
    L.getLastKnownPositionAsync.mockResolvedValue({ coords: { latitude: 21.5, longitude: 39.2 } } as never);
    await expect(getPositionOnce()).resolves.toEqual({ status: 'ok', lat: 21.5, lng: 39.2 });
    expect(L.getCurrentPositionAsync).not.toHaveBeenCalled();
  });
  it('takes the first fix from location updates when a one-off read gives nothing', async () => {
    L.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted', canAskAgain: true } as never);
    L.hasServicesEnabledAsync.mockResolvedValue(true);
    L.getCurrentPositionAsync.mockRejectedValue(new Error('no fix'));
    const remove = jest.fn();
    L.watchPositionAsync.mockImplementation(async (_o, cb) => {
      setTimeout(() => cb({ coords: { latitude: 26.4, longitude: 50.1 } } as never), 10);
      return { remove } as never;
    });
    await expect(getPositionOnce()).resolves.toEqual({ status: 'ok', lat: 26.4, lng: 50.1 });
    expect(remove).toHaveBeenCalled();
    // Straight to the provider: no settings dialog that can leave requests queued (Xiaomi, network location off).
    expect(L.watchPositionAsync.mock.calls[0][0]).toMatchObject({ accuracy: 4, mayShowUserSettingsDialog: false });
    expect(L.getCurrentPositionAsync.mock.calls[0][0]).toMatchObject({ mayShowUserSettingsDialog: false });
  });
  it('returns the position when permission is granted', async () => {
    L.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted', canAskAgain: true } as never);
    L.hasServicesEnabledAsync.mockResolvedValue(true);
    L.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: 24.7, longitude: 46.7 } } as never);
    await expect(getPositionOnce()).resolves.toEqual({ status: 'ok', lat: 24.7, lng: 46.7 });
  });
  it('reports denied permission without reading the position', async () => {
    L.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied', canAskAgain: false } as never);
    await expect(getPositionOnce()).resolves.toEqual({ status: 'denied', canAskAgain: false });
    expect(L.getCurrentPositionAsync).not.toHaveBeenCalled();
  });
  it('on Android, asks the system to switch location on and carries on if the user agrees', async () => {
    const os = jest.replaceProperty(Platform, 'OS', 'android');
    L.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted', canAskAgain: true } as never);
    L.hasServicesEnabledAsync.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    L.enableNetworkProviderAsync.mockResolvedValue(undefined);
    L.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: 24.7, longitude: 46.7 } } as never);
    await expect(getPositionOnce()).resolves.toEqual({ status: 'ok', lat: 24.7, lng: 46.7 });
    expect(L.enableNetworkProviderAsync).toHaveBeenCalled();
    L.hasServicesEnabledAsync.mockResolvedValue(false);
    L.enableNetworkProviderAsync.mockRejectedValue(new Error('declined'));
    await expect(getPositionOnce()).resolves.toEqual({ status: 'services-off' });
    os.restore();
  });
  it('reports GPS turned off', async () => {
    L.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted', canAskAgain: true } as never);
    L.hasServicesEnabledAsync.mockResolvedValue(false);
    await expect(getPositionOnce()).resolves.toEqual({ status: 'services-off' });
  });
  it('reports unavailable when no valid fix arrives in time', async () => {
    jest.useFakeTimers();
    L.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted', canAskAgain: true } as never);
    L.hasServicesEnabledAsync.mockResolvedValue(true);
    L.getLastKnownPositionAsync.mockResolvedValue(null);
    L.watchPositionAsync.mockReturnValue(new Promise(() => {}));
    L.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: NaN, longitude: 46 } } as never);
    const r = getPositionOnce();
    await jest.advanceTimersByTimeAsync(46_000);
    await expect(r).resolves.toEqual({ status: 'unavailable' });
    jest.useRealTimers();
  });
});

describe('maps', () => {
  it('builds platform URLs with an encoded query', () => {
    expect(nativeMapsUrl('دلة الرياض', 'android')).toBe('geo:0,0?q=' + encodeURIComponent('دلة الرياض'));
    expect(nativeMapsUrl('x y', 'ios')).toBe('maps://?q=x%20y');
    expect(webMapsUrl('a&b')).toBe('https://www.google.com/maps/search/?api=1&query=a%26b');
  });
});

describe('stored data validation', () => {
  it('falls back to defaults for bad settings', () => {
    expect(parseSettings('{bad json')).toEqual({ lang: 'ar', theme: 'system' });
    expect(parseSettings('{"lang":"fr","theme":"light"}')).toEqual({ lang: 'ar', theme: 'light' });
  });
  it('keeps only valid progress values', () => {
    expect(parseProgress('{"xp":-5,"streak":"x","done":{"1":3,"2":9,"abc":2},"last":"2026-10-02"}')).toEqual({ xp: 0, streak: 0, last: '2026-10-02', done: { 1: 3 } });
    expect(parseProgress(null)).toEqual({ xp: 0, streak: 0, done: {} });
  });
});

describe('saved exam', () => {
  const now = 1_800_000_000_000;
  const exam = () => {
    let x = startExam(QUESTIONS, { count: 30, minutes: 40, passMark: 21 }, now, () => 0.3);
    x = selectAnswer(x, x.questions[0].id, x.questions[0].options[1].id);
    return x;
  };

  it('round-trips ids, option order and answers, and rebuilds text from the bank', () => {
    const x = exam();
    const saved = JSON.stringify(serializeExam(x));
    expect(saved).not.toContain(x.questions[0].question);
    expect(parseExam(saved, QUESTIONS, now + 1000)).toEqual(x);
  });
  it('drops expired, unknown or tampered sessions', () => {
    const s = serializeExam(exam());
    expect(parseExam(JSON.stringify(s), QUESTIONS, s.e + 1)).toBeNull();
    expect(parseExam(JSON.stringify({ ...s, q: [{ id: 'nope', o: ['a'] }] }), QUESTIONS, now)).toBeNull();
    expect(parseExam(JSON.stringify({ ...s, q: [{ ...s.q[0], o: [s.q[0].o[0], s.q[0].o[0], ...s.q[0].o.slice(2)] }, ...s.q.slice(1)] }), QUESTIONS, now)).toBeNull();
    expect(parseExam(JSON.stringify({ ...s, c: { count: -1, minutes: 40, passMark: 21 } }), QUESTIONS, now)).toBeNull();
    expect(parseExam('{bad', QUESTIONS, now)).toBeNull();
    expect(parseExam(null, QUESTIONS, now)).toBeNull();
  });
  it('ignores answers that are not options of that question', () => {
    const s = serializeExam(exam());
    const first = s.q[0].id;
    const x = parseExam(JSON.stringify({ ...s, a: { [first]: 'zzz', other: 'a' } }), QUESTIONS, now)!;
    expect(x.answers).toEqual({});
  });
});

describe('deep link guard', () => {
  it('accepts the app links', () => {
    for (const p of ['/', '/schools/b01', 'drivingguide://signs/s000', '/level/3', '/guide/t00?x=%D8%A7']) expect(isSafeDeepLink(p)).toBe(true);
  });
  it('rejects oversized or malformed percent-encoding', () => {
    expect(isSafeDeepLink('/x?' + 'a'.repeat(600))).toBe(false);
    expect(isSafeDeepLink('/x?q=' + '%25'.repeat(60))).toBe(false);
    expect(isSafeDeepLink('/x?q=%E0%A4%A')).toBe(false);
    expect(isSafeDeepLink('/x?q=%zz')).toBe(false);
  });
});

describe('links from before the redesign', () => {
  it('open the same content in the new tabs', () => {
    expect(upgradeLegacyPath('/test')).toBe('/practice');
    expect(upgradeLegacyPath('/guide')).toBe('/learn?section=guide');
    expect(upgradeLegacyPath('/guide/license')).toBe('/learn?section=steps');
    expect(upgradeLegacyPath('drivingguide://signs/s000')).toBe('/learn/signs/s000');
    expect(upgradeLegacyPath('/guide/t00?q=x')).toBe('/learn/guide/t00?q=x');
    expect(upgradeLegacyPath('/signs')).toBe('/learn?section=signs');
  });
  it('leave current links alone', () => {
    for (const p of ['/', '/schools/b01', '/learn/signs/s001', '/level/3', '/practice']) expect(upgradeLegacyPath(p)).toBe(p);
  });
});

describe('opening maps and fixed links', () => {
  const { Linking, Platform } = jest.requireActual('react-native') as typeof import('react-native');
  const maps = jest.requireActual('./maps') as typeof import('./maps');
  let spy: jest.SpyInstance;
  beforeEach(() => {
    spy = jest.spyOn(Linking, 'openURL');
  });
  afterEach(() => spy.mockRestore());

  it('tries the phone map app first', async () => {
    spy.mockResolvedValue(true);
    await expect(maps.openInMaps('مدرسة')).resolves.toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBe(maps.nativeMapsUrl('مدرسة', Platform.OS) ?? maps.webMapsUrl('مدرسة'));
  });
  it('falls back to the web map, then reports failure', async () => {
    spy.mockRejectedValueOnce(new Error('no map app')).mockResolvedValueOnce(true);
    await expect(maps.openInMaps('x')).resolves.toBe(true);
    expect(spy.mock.calls.at(-1)![0]).toBe(maps.webMapsUrl('x'));
    spy.mockRejectedValue(new Error('nothing'));
    await expect(maps.openInMaps('x')).resolves.toBe(false);
  });
  it('opens only the fixed HTTPS links', async () => {
    spy.mockResolvedValue(true);
    await maps.openAbsher();
    await maps.openPrivacyPolicy();
    expect(spy.mock.calls.map((c) => c[0])).toEqual([maps.ABSHER_URL, maps.PRIVACY_URL]);
    for (const u of [maps.ABSHER_URL, maps.PRIVACY_URL]) expect(u.startsWith('https://')).toBe(true);
    spy.mockRejectedValue(new Error('no browser'));
    await expect(maps.openAbsher()).resolves.toBe(false);
  });
});

import * as Location from 'expo-location';
import { getPositionOnce } from './location';
import { nativeMapsUrl, webMapsUrl } from './maps';
import { parseProgress, parseSettings } from './storage';

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));
const L = Location as jest.Mocked<typeof Location>;

describe('location', () => {
  beforeEach(() => jest.resetAllMocks());
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
  it('reports GPS turned off', async () => {
    L.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted', canAskAgain: true } as never);
    L.hasServicesEnabledAsync.mockResolvedValue(false);
    await expect(getPositionOnce()).resolves.toEqual({ status: 'services-off' });
  });
  it('reports unavailable when the position cannot be read or is invalid', async () => {
    L.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted', canAskAgain: true } as never);
    L.hasServicesEnabledAsync.mockResolvedValue(true);
    L.getCurrentPositionAsync.mockRejectedValue(new Error('no fix'));
    await expect(getPositionOnce()).resolves.toEqual({ status: 'unavailable' });
    L.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: NaN, longitude: 46 } } as never);
    await expect(getPositionOnce()).resolves.toEqual({ status: 'unavailable' });
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
    expect(parseSettings('{bad json')).toEqual({ lang: 'ar', theme: 'dark' });
    expect(parseSettings('{"lang":"fr","theme":"light"}')).toEqual({ lang: 'ar', theme: 'light' });
  });
  it('keeps only valid progress values', () => {
    expect(parseProgress('{"xp":-5,"streak":"x","done":{"1":3,"2":9,"abc":2},"last":"2026-10-02"}')).toEqual({ xp: 0, streak: 0, last: '2026-10-02', done: { 1: 3 } });
    expect(parseProgress(null)).toEqual({ xp: 0, streak: 0, done: {} });
  });
});

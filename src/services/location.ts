import * as Location from 'expo-location';
import { isValidCoords } from '@/features/schools/search';

export type LocationResult =
  | { status: 'ok'; lat: number; lng: number }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'services-off' }
  | { status: 'unavailable' };

/**
 * Asks for "when in use" permission (only when the user taps Find nearby) and reads the position once.
 * The position is returned to the caller and never stored or sent anywhere.
 */
export async function getPositionOnce(): Promise<LocationResult> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return { status: 'denied', canAskAgain: perm.canAskAgain };
    if (!(await Location.hasServicesEnabledAsync())) return { status: 'services-off' };
    const pos = await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), 15_000);
    const { latitude, longitude } = pos.coords;
    if (!isValidCoords(latitude, longitude)) return { status: 'unavailable' };
    return { status: 'ok', lat: latitude, lng: longitude };
  } catch {
    return { status: 'unavailable' };
  }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

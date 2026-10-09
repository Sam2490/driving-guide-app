import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { isValidCoords } from '@/features/schools/search';

export type LocationResult =
  | { status: 'ok'; lat: number; lng: number }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'services-off' }
  | { status: 'unavailable' };

/** A town-level position is enough, so a fix from the last half hour is used as is. */
const RECENT_MS = 30 * 60_000;

/**
 * Approximate location is enough: schools are sorted by distance to town centres.
 * Asks for "when in use" permission (only when the user taps Find nearby) and reads the position once.
 * The position is returned to the caller and never stored or sent anywhere.
 *
 * Build 26 on a Xiaomi phone: with location just switched on, a single low-power read had no fix to give and timed
 * out, so "Find nearby" failed until it was tried several times; with location off it only showed a warning. Now:
 * Android is asked to switch location on (the system dialog), a recent cached fix is used straight away, and a fresh
 * read gets a longer wait at network accuracy (low-power mode can wait forever without Wi-Fi or cell positioning).
 */
export async function getPositionOnce(): Promise<LocationResult> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return { status: 'denied', canAskAgain: perm.canAskAgain };
    if (!(await servicesOn())) return { status: 'services-off' };

    const recent = await Location.getLastKnownPositionAsync({ maxAge: RECENT_MS }).catch(() => null);
    if (recent && isValidCoords(recent.coords.latitude, recent.coords.longitude)) return ok(recent);

    for (const [accuracy, ms] of [[Location.Accuracy.Balanced, 20_000], [Location.Accuracy.High, 20_000]] as const) {
      const pos = await withTimeout(Location.getCurrentPositionAsync({ accuracy }), ms).catch(() => null);
      if (pos && isValidCoords(pos.coords.latitude, pos.coords.longitude)) return ok(pos);
    }
    // Still nothing fresh: an older fix is better than no list (schools are matched by town).
    const old = await Location.getLastKnownPositionAsync().catch(() => null);
    if (old && isValidCoords(old.coords.latitude, old.coords.longitude)) return ok(old);
    return { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
}

/** Location switched on, or (Android) the user switched it on from the system dialog just now. */
async function servicesOn(): Promise<boolean> {
  if (await Location.hasServicesEnabledAsync()) return true;
  if (Platform.OS !== 'android') return false;
  try {
    await Location.enableNetworkProviderAsync();
  } catch {
    return false; // dialog declined
  }
  return Location.hasServicesEnabledAsync();
}

function ok(pos: Location.LocationObject): LocationResult {
  return { status: 'ok', lat: pos.coords.latitude, lng: pos.coords.longitude };
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

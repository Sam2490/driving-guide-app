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
/** How long to wait for a first fix with location just switched on (indoors, mobile data only). */
const WAIT_MS = 45_000;

/**
 * Approximate location is enough: schools are sorted by distance to town centres.
 * Asks for "when in use" permission (only when the user taps Find nearby) and reads the position once.
 * The position is returned to the caller and never stored or sent anywhere.
 *
 * Build 26 on a Xiaomi phone: with location just switched on, a single low-power read had no fix to give and timed
 * out, so "Find nearby" failed until it was tried several times; with location off it only showed a warning. Now:
 * Android is asked to switch location on (the system dialog), a recent cached fix is used straight away, and a fresh
 * read gets a longer wait at network accuracy (low-power mode can wait forever without Wi-Fi or cell positioning).
 * Then: a one-off read on Android (FusedLocationProviderClient.getCurrentLocation) gives up and returns nothing
 * when the phone has no fix yet, so it still took several taps. The fresh read now keeps location updates running
 * and takes the first good fix (see firstFix).
 */
export async function getPositionOnce(): Promise<LocationResult> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return { status: 'denied', canAskAgain: perm.canAskAgain };
    if (!(await servicesOn())) return { status: 'services-off' };

    const recent = await Location.getLastKnownPositionAsync({ maxAge: RECENT_MS }).catch(() => null);
    if (valid(recent)) return ok(recent);

    const fresh = await firstFix(WAIT_MS);
    if (fresh) return ok(fresh);
    // Still nothing fresh: an older fix is better than no list (schools are matched by town).
    const old = await Location.getLastKnownPositionAsync().catch(() => null);
    if (valid(old)) return ok(old);
    return { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
}

/** Location switched on, or (Android) the user switched it on from the system dialog just now. */
async function servicesOn(): Promise<boolean> {
  if (await Location.hasServicesEnabledAsync()) return true;
  if (Platform.OS !== 'android') return false;
  // The dialog shares expo-location's settings queue, which can stop answering; time-box it (long enough to tap OK).
  let timer: ReturnType<typeof setTimeout> | undefined;
  const asked = await Promise.race([
    attempt(() => Location.enableNetworkProviderAsync()).then(
      () => true,
      () => false, // declined
    ),
    new Promise<boolean>((r) => (timer = setTimeout(() => r(false), 30_000))),
  ]);
  clearTimeout(timer);
  if (!asked) return Location.hasServicesEnabledAsync();
  // Location can take a moment to report "on" after the user accepts.
  for (let i = 0; i < 6; i++) {
    if (await Location.hasServicesEnabledAsync()) return true;
    await sleep(500);
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * The first usable fix from any of: continuous updates (they keep asking until the phone has a position), a one-off
 * read, and the system's cached position (polled, since another app or the updates above may fill it). Null after
 * `ms`. Every request is stopped once a fix arrives.
 */
function firstFix(ms: number): Promise<Location.LocationObject | null> {
  return new Promise((resolve) => {
    let done = false;
    let sub: Location.LocationSubscription | undefined;
    const finish = (pos: Location.LocationObject | null) => {
      if (done) return;
      done = true;
      sub?.remove();
      clearInterval(poll);
      clearTimeout(timer);
      resolve(pos);
    };
    const take = (pos: Location.LocationObject | null | undefined) => {
      if (valid(pos)) finish(pos);
    };
    const timer = setTimeout(() => {
      note('timeout', `${ms} ms`);
      finish(null);
    }, ms);
    const poll = setInterval(() => {
      attempt(() => Location.getLastKnownPositionAsync({ maxAge: 60_000 })).then(take, () => {});
    }, 2_000);
    // mayShowUserSettingsDialog: false — with Android's network location off (common on Xiaomi when Google Location
    // Accuracy is off), expo-location otherwise parks each request behind a settings dialog; on some phones that dialog
    // never reports back and every later request queues behind it until the app restarts. Location itself is already
    // on (servicesOn), so the requests go straight to the fused provider: High uses GPS, Balanced uses Wi-Fi / cell.
    attempt(() => Location.watchPositionAsync({ accuracy: Location.Accuracy.High, timeInterval: 1_000, distanceInterval: 0, mayShowUserSettingsDialog: false }, take)).then(
      (s) => (done ? s.remove() : (sub = s)),
      (e) => note('watch', e),
    );
    attempt(() => Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced, mayShowUserSettingsDialog: false })).then(take, (e) => note('current', e));
  });
}

/** Shows in `adb logcat` (ReactNativeJS) why a read failed, for phone testing; nothing is stored or sent. */
function note(step: string, e: unknown) {
  console.warn(`[location] ${step}: ${e instanceof Error ? e.message : String(e)}`);
}

/** Runs a location call so that a synchronous throw becomes a rejection, like any other failure. */
function attempt<T>(f: () => Promise<T>): Promise<T> {
  return Promise.resolve().then(f);
}

function valid(pos: Location.LocationObject | null | undefined): pos is Location.LocationObject {
  return !!pos && isValidCoords(pos.coords.latitude, pos.coords.longitude);
}

function ok(pos: Location.LocationObject): LocationResult {
  return { status: 'ok', lat: pos.coords.latitude, lng: pos.coords.longitude };
}

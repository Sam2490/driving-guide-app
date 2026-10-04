import { Linking, Platform } from 'react-native';

/** A web URL that works everywhere (Google Maps search). */
export function webMapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** The platform's own map app: Apple Maps on iOS, the default map app chooser on Android. */
export function nativeMapsUrl(query: string, os: string = Platform.OS): string | null {
  const q = encodeURIComponent(query);
  if (os === 'ios') return `maps://?q=${q}`;
  if (os === 'android') return `geo:0,0?q=${q}`;
  return null;
}

/** Opens directions/search for a place. Returns false if no map app or browser could open it. */
export async function openInMaps(query: string): Promise<boolean> {
  const native = nativeMapsUrl(query);
  if (native) {
    try {
      await Linking.openURL(native);
      return true;
    } catch {
      // fall through to the web URL
    }
  }
  try {
    await Linking.openURL(webMapsUrl(query));
    return true;
  } catch {
    return false;
  }
}

export const ABSHER_URL = 'https://www.absher.sa';
export const PRIVACY_URL = 'https://sam2490.github.io/driving-guide-app/privacy/';

/** Opens one of the app's fixed HTTPS links. Never called with user-provided URLs. */
async function openFixed(url: string): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

export const openAbsher = () => openFixed(ABSHER_URL);
export const openPrivacyPolicy = () => openFixed(PRIVACY_URL);

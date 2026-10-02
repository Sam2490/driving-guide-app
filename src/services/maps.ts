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

export async function openAbsher(): Promise<boolean> {
  try {
    await Linking.openURL(ABSHER_URL);
    return true;
  } catch {
    return false;
  }
}

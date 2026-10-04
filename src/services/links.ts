/**
 * Incoming deep links are checked before Expo Router parses them. The router's query parser
 * (query-string → decode-uri-component 0.2.2) has a denial-of-service advisory for long, malformed
 * percent-encoding (GHSA-vcc3-ghjq-m6fr), so oversized or malformed links open the home screen instead.
 * The app's own links are short (for example drivingguide://schools/b01).
 */
export const MAX_LINK_LENGTH = 512;
const MAX_PERCENT_ESCAPES = 48;

export function isSafeDeepLink(path: string): boolean {
  if (typeof path !== 'string' || path.length > MAX_LINK_LENGTH) return false;
  if ((path.match(/%/g) ?? []).length > MAX_PERCENT_ESCAPES) return false;
  if (/%(?![0-9a-fA-F]{2})/.test(path)) return false;
  try {
    decodeURIComponent(path);
  } catch {
    return false;
  }
  return true;
}

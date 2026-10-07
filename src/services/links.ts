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

/**
 * Links from before the four-tab redesign keep working: Guide and Signs moved into Learn, Test became Practice.
 * Accepts a bare path or a full app link and returns the new path (or the input unchanged).
 */
export function upgradeLegacyPath(path: string): string {
  const m = path.match(/^(?:[a-z][a-z0-9+.-]*:\/\/)?\/?([^?#]*)(.*)$/i);
  if (!m) return path;
  const [, route, rest] = m;
  const parts = route.split('/').filter(Boolean);
  const [head, id] = parts;
  if (parts.length > 2) return path;
  if (head === 'test' && !id) return `/practice${rest}`;
  if (head === 'guide' && !id) return '/learn?section=guide';
  if (head === 'guide' && id === 'license') return '/learn?section=steps';
  if (head === 'guide' && id) return `/learn/guide/${id}${rest}`;
  if (head === 'signs' && !id) return '/learn?section=signs';
  if (head === 'signs' && id) return `/learn/signs/${id}${rest}`;
  return path;
}

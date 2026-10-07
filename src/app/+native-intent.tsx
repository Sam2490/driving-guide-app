import { isSafeDeepLink, upgradeLegacyPath } from '@/services/links';

/** Runs for every link that opens the app, before routing. Unsafe links go to the home screen; old paths are upgraded. */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  return isSafeDeepLink(path) ? upgradeLegacyPath(path) : '/';
}

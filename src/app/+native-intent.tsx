import { isSafeDeepLink } from '@/services/links';

/** Runs for every link that opens the app, before routing. Unsafe links go to the home screen. */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  return isSafeDeepLink(path) ? path : '/';
}

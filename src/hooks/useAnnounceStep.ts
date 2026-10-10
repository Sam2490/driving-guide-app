import { useEffect, useRef } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Announces a step change (the next question) to screen readers. Next/Previous keep focus on the footer button, so
 * without this a screen-reader user is not told that the question changed (a11y review A11Y-28). Not on first render.
 */
export function useAnnounceStep(step: number, text: (step: number) => string): void {
  const first = useRef(true);
  const message = text(step);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    AccessibilityInfo.announceForAccessibility(message);
    // Only a new step is announced, not a new message for the same step (e.g. after a language change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
}

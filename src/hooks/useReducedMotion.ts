import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Read once at start-up and kept current, so a component mounted later starts with the right value instead of
// animating for a frame or two before the setting arrives (a11y review A11Y-23).
let known: boolean | null = null;
AccessibilityInfo.isReduceMotionEnabled?.()
  .then((v) => (known = v))
  .catch(() => {});
AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => (known = v));

/** True when the user asked the system to reduce motion; screen and sheet animations are then turned off. */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(known ?? false);
  useEffect(() => {
    let alive = true;
    // The value read at start-up may arrive after this component's first render.
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => alive && setReduce(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);
  return reduce;
}

/**
 * Design tokens ("Road-ready" design system). Every size, gap, corner and elevation comes from here.
 * Components use the named roles (TEXT, LAYOUT, ELEVATION) and fall back to the raw scales only for geometry.
 */

/** Type scale (px). Caption (12) is the smallest size used anywhere. */
export const TYPE = {
  caption: 12,
  label: 14,
  body: 16,
  bodyLg: 17,
  title: 18,
  h3: 20,
  h2: 22,
  stat: 24,
  h1: 28,
  display: 32,
} as const;
export type TypeSize = (typeof TYPE)[keyof typeof TYPE];

export type TextRole = 'display' | 'h1' | 'h2' | 'h3' | 'title' | 'bodyLg' | 'body' | 'label' | 'caption';

/**
 * Typography roles. Line heights are per script (see theme/fonts lineHeightFor); `heading` picks the tighter
 * heading ratio. `maxScale` caps the system font-size multiplier for decorative numbers and chrome only.
 */
export const TEXT: Record<TextRole, { size: TypeSize; weight: 'regular' | 'medium' | 'semibold' | 'bold'; heading?: boolean; maxScale?: number }> = {
  display: { size: TYPE.display, weight: 'bold', heading: true, maxScale: 1.3 },
  h1: { size: TYPE.h1, weight: 'bold', heading: true },
  h2: { size: TYPE.h2, weight: 'bold', heading: true },
  h3: { size: TYPE.h3, weight: 'semibold', heading: true },
  title: { size: TYPE.title, weight: 'semibold' },
  bodyLg: { size: TYPE.bodyLg, weight: 'regular' },
  body: { size: TYPE.body, weight: 'regular' },
  label: { size: TYPE.label, weight: 'semibold' },
  caption: { size: TYPE.caption, weight: 'medium' },
};

/** 4-pt spacing scale (px). */
export const SPACE = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, x3: 40, x4: 48 } as const;

/** Named layout spacing. */
export const LAYOUT = {
  gutter: 20,
  gutterCompact: 16,
  section: 32,
  card: 16,
  cardWide: 20,
  list: 12,
  stack: 8,
  buttonY: 14,
  buttonX: 20,
  form: 16,
  modal: 24,
  sheet: 20,
} as const;

/** Corner radii (px): sm badges, md controls and rows, lg cards, xl sheets and dialogs, pill for pills. */
export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

/** Icon sizes (px) and their stroke widths, so small icons keep the same optical weight. */
export const ICON = { inline: 16, control: 20, nav: 24, tile: 28, hero: 48 } as const;
export const strokeFor = (size: number) => (size <= 20 ? 2 : size <= 28 ? 1.75 : 1.5);

/** Minimum touch target (px): 44 pt on iOS; Android buttons use 48. */
export const TOUCH = 44;
export const TOUCH_ANDROID = 48;

/** Elevation: shadows only on overlays (level 3), so a shadow always means "on top, can be dismissed". */
export const ELEVATION = {
  flat: 0,
  raised: 1,
  sticky: 2,
  overlay: { shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
} as const;

/** Readable column on large phones and tablets. */
export const MAX_CONTENT_WIDTH = 640;

/** Width classes (pt). */
export const BREAKPOINTS = { compact: 360, medium: 600, expanded: 840 } as const;
export type WidthClass = 'compact' | 'regular' | 'medium' | 'expanded';
export function widthClass(w: number): WidthClass {
  if (w < BREAKPOINTS.compact) return 'compact';
  if (w < BREAKPOINTS.medium) return 'regular';
  if (w < BREAKPOINTS.expanded) return 'medium';
  return 'expanded';
}

/** Motion durations (ms). Reduced motion turns movement into an instant change. */
export const MOTION = { press: 80, select: 120, quick: 200, sheet: 250, celebrate: 600 } as const;

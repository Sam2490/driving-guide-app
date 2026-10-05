/**
 * Design tokens. Every size, gap and corner in the app should come from these scales
 * (UI/UX audit: one type scale, a 4-pt spacing grid, four radii).
 */

/** Type scale (px). Caption is the smallest size used anywhere. */
export const TYPE = {
  caption: 12,
  label: 14,
  body: 16,
  bodyLg: 18,
  title: 20,
  heading: 24,
  display: 28,
  hero: 36,
} as const;
export type TypeSize = (typeof TYPE)[keyof typeof TYPE];

/** 4-pt spacing grid (px). */
export const SPACE = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32 } as const;

/** Corner radii (px). Circles use half their size instead. */
export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

/** Icon sizes (px). */
export const ICON = { sm: 16, md: 20, lg: 24, hero: 36 } as const;

/** Minimum touch target (px): 44 pt on iOS, 48 dp on Android; 44 is used where space is tight. */
export const TOUCH = 44;

/** Content column width on tablets and large phones, so lines and cards keep a readable width. */
export const MAX_CONTENT_WIDTH = 640;

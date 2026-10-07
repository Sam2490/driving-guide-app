/**
 * Theme colours ("Road-ready" identity: palm green from the app icon, warm off-white, sand as the only accent).
 * Every colour on screen comes from here; components never use raw hex. `SEMANTIC` below names each key's role.
 */
export type Palette = {
  /** color.background.primary / .secondary */
  bg: string; bg2: string;
  /** color.surface.default / .elevated */
  card: string; elevated: string;
  /** color.text.primary / .secondary */
  tx: string; tx2: string;
  /** color.border.subtle (decorative hairlines) / .strong (outlines of controls, 3:1) */
  ln: string; lnStrong: string;
  /** Neutral fill for idle chips, tracks and icon buttons. */
  fill: string;
  /** color.brand.text: links, selected chips, brand words. */
  ac: string;
  /** color.action.primary, its pressed step, and the tinted secondary action (fill + text). */
  acSolid: string; acPressed: string; acSoft: string; onAcSoft: string;
  /** color.text.onAction */
  onAc: string;
  /** color.status.* with their tinted backgrounds; *Solid carry white text. */
  ok: string; okbg: string; okSolid: string;
  bad: string; badbg: string; badSolid: string;
  warn: string; warnbg: string;
  info: string; infobg: string;
  /** color.brand.sand: XP, rank, stars and fees. The only accent besides green. */
  sand: string;
  /** White panel behind sign and question artwork, in both themes. */
  paper: string;
  scrim: string;
  /** Overlay shadow colour (level 3 only). */
  shadow: string;
};

export const light: Palette = {
  bg: '#f6f7f5', bg2: '#eef0ec', card: '#ffffff', elevated: '#ffffff',
  tx: '#16201b', tx2: '#55615a', ln: '#e1e5e0', lnStrong: '#7c8680', fill: '#eef0ec',
  ac: '#006c35', acSolid: '#006c35', acPressed: '#00552a', acSoft: '#e3f0e7', onAcSoft: '#00552a', onAc: '#ffffff',
  ok: '#1a7a3a', okbg: 'rgba(26,122,58,0.10)', okSolid: '#1a7a3a',
  bad: '#c4291c', badbg: 'rgba(196,41,28,0.10)', badSolid: '#c4291c',
  warn: '#8a5a00', warnbg: 'rgba(201,140,0,0.14)',
  info: '#0b5cad', infobg: 'rgba(11,92,173,0.10)',
  sand: '#8a6414', paper: '#ffffff', scrim: 'rgba(10,14,12,0.5)', shadow: '#000000',
};

export const dark: Palette = {
  bg: '#0e1311', bg2: '#0a0e0c', card: '#161c19', elevated: '#1d2521',
  tx: '#eef2ef', tx2: '#a7b2ac', ln: '#2a332e', lnStrong: '#6f7a74', fill: '#222b26',
  ac: '#5fd08e', acSolid: '#1b7d45', acPressed: '#156637', acSoft: '#1f3328', onAcSoft: '#7ddca4', onAc: '#ffffff',
  ok: '#4ccf7e', okbg: 'rgba(76,207,126,0.16)', okSolid: '#1b7d45',
  bad: '#ff6b5e', badbg: 'rgba(255,107,94,0.16)', badSolid: '#c4291c',
  warn: '#f2b84b', warnbg: 'rgba(242,184,75,0.16)',
  info: '#6aaeff', infobg: 'rgba(106,174,255,0.16)',
  sand: '#e2b65a', paper: '#ffffff', scrim: 'rgba(0,0,0,0.6)', shadow: '#000000',
};

/** The semantic token names used in the design system, mapped to palette keys. */
export const SEMANTIC = {
  'color.background.primary': 'bg',
  'color.background.secondary': 'bg2',
  'color.surface.default': 'card',
  'color.surface.elevated': 'elevated',
  'color.border.subtle': 'ln',
  'color.border.strong': 'lnStrong',
  'color.text.primary': 'tx',
  'color.text.secondary': 'tx2',
  'color.text.onAction': 'onAc',
  'color.action.primary': 'acSolid',
  'color.action.primaryPressed': 'acPressed',
  'color.action.secondary': 'acSoft',
  'color.brand.text': 'ac',
  'color.brand.sand': 'sand',
  'color.status.success': 'ok',
  'color.status.warning': 'warn',
  'color.status.error': 'bad',
  'color.status.info': 'info',
  'color.media.paper': 'paper',
  'color.scrim': 'scrim',
} as const satisfies Record<string, keyof Palette>;

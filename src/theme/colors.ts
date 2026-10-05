/** Theme colours. Every colour on screen should come from here (no raw hex in components). */
export type FeatureKey = 'guide' | 'signs' | 'license' | 'schools' | 'test';

export type Palette = {
  bg: string; card: string; tx: string; tx2: string; ac: string; ok: string; bad: string;
  okbg: string; badbg: string;
  /** Fills that carry white text or icons (4.5:1 contrast with white). */
  acSolid: string; okSolid: string; badSolid: string;
  /** Per-feature accent (home cards, guide icons) and per-stage colours in the level journey. Light mode uses darker shades for 3:1+ contrast. */
  feature: Record<FeatureKey, string>; stage: string[];
  /** White panel behind sign and question artwork, in both themes. */
  paper: string; ln: string; fill: string; onAc: string; glass: string; glassBorder: string; scrim: string;
};

export const dark: Palette = {
  bg: '#060a1c', card: '#0f1738', tx: '#f2f4ff', tx2: '#9aa3d8', ac: '#5b9bff', ok: '#30d158', bad: '#ff453a',
  acSolid: '#1f6bf0', okSolid: '#1e7b34', badSolid: '#d0302a',
  feature: { guide: '#7d96ff', signs: '#f59ad2', license: '#43d8c9', schools: '#b39bff', test: '#6fb0ff' },
  paper: '#ffffff',
  stage: ['#7d96ff', '#43d8c9', '#b39bff', '#f59ad2', '#f5b05a'],
  okbg: 'rgba(48,209,88,0.18)', badbg: 'rgba(255,69,58,0.18)', ln: 'rgba(255,255,255,0.09)', fill: 'rgba(255,255,255,0.08)',
  onAc: '#ffffff', glass: 'rgba(17,25,58,0.98)', glassBorder: 'rgba(255,255,255,0.16)', scrim: 'rgba(3,6,18,0.72)',
};

export const light: Palette = {
  bg: '#f5f5f7', card: '#ffffff', tx: '#1d1d1f', tx2: '#636366', ac: '#0060c7', ok: '#1f7a36', bad: '#d70015',
  acSolid: '#0071e3', okSolid: '#1f7a36', badSolid: '#d70015',
  feature: { guide: '#4a5fd1', signs: '#b8327f', license: '#0f7d74', schools: '#6d4fd1', test: '#1f6fc4' },
  paper: '#ffffff',
  stage: ['#4a5fd1', '#0f7d74', '#6d4fd1', '#b8327f', '#a35f0b'],
  okbg: 'rgba(52,199,89,0.15)', badbg: 'rgba(255,59,48,0.12)', ln: 'rgba(0,0,0,0.09)', fill: 'rgba(0,0,0,0.06)',
  onAc: '#ffffff', glass: 'rgba(255,255,255,0.98)', glassBorder: 'rgba(0,0,0,0.08)', scrim: 'rgba(3,6,18,0.5)',
};


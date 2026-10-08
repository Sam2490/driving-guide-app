import { dark, light, SEMANTIC, type Palette } from './colors';
import { TYPE, TEXT } from './tokens';

// WCAG 2.1 contrast, with rgba colours composited over their background.
const rgb = (c: string, under: number[] = [0, 0, 0]): number[] => {
  const m = c.match(/^rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/);
  if (m) {
    const a = Number(m[4]);
    return [1, 2, 3].map((i) => Number(m[i]) * a + (under.at(i - 1) ?? 0) * (1 - a));
  }
  const h = c.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const lum = (v: number[]) => {
  const [r, g, b] = v.map((x) => (x / 255 <= 0.03928 ? x / 255 / 12.92 : ((x / 255 + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: number[], b: number[]) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

describe.each([['dark', dark], ['light', light]] as [string, Palette][])('%s theme contrast (WCAG 2.2 AA)', (_, p) => {
  const bg = rgb(p.bg);
  const card = rgb(p.card);
  const surfaces = [bg, card, rgb(p.bg2), rgb(p.elevated), rgb(p.fill, bg), rgb(p.fill, card)];

  it('primary and secondary text pass 4.5:1 on every surface', () => {
    for (const s of surfaces) {
      expect(ratio(rgb(p.tx), s)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(rgb(p.tx2), s)).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('brand, status and sand text pass 4.5:1 on cards and backgrounds', () => {
    for (const col of [p.ac, p.ok, p.bad, p.warn, p.info, p.sand]) for (const s of [bg, card]) expect(ratio(rgb(col), s)).toBeGreaterThanOrEqual(4.5);
  });
  it('status text passes 4.5:1 on its own tinted background', () => {
    for (const [fg, tint] of [[p.ok, p.okbg], [p.bad, p.badbg], [p.warn, p.warnbg], [p.info, p.infobg]]) {
      expect(ratio(rgb(fg), rgb(tint, card))).toBeGreaterThanOrEqual(4.5);
      expect(ratio(rgb(p.tx), rgb(tint, card))).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('white text on filled buttons and the secondary button label pass 4.5:1', () => {
    for (const s of [p.acSolid, p.acPressed, p.okSolid, p.badSolid]) expect(ratio(rgb(p.onAc), rgb(s))).toBeGreaterThanOrEqual(4.5);
    expect(ratio(rgb(p.onAcSoft), rgb(p.acSoft))).toBeGreaterThanOrEqual(4.5);
  });
  it('control outlines pass 3:1 (WCAG 1.4.11)', () => {
    for (const s of [bg, card]) expect(ratio(rgb(p.lnStrong), s)).toBeGreaterThanOrEqual(3);
  });
  it('every semantic token points at a real colour', () => {
    for (const key of Object.values(SEMANTIC)) expect(p[key]).toMatch(/^(#[0-9a-f]{6}|rgba\()/);
  });
});

it('type scale starts at 12 px and every text role is on the scale', () => {
  expect(Math.min(...Object.values(TYPE))).toBe(12);
  for (const r of Object.values(TEXT)) expect(Object.values(TYPE)).toContain(r.size);
});

it('the web focus ring (action green) keeps 3:1 against the page in both themes', () => {
  for (const p of [light, dark]) expect(ratio(rgb(p.acSolid), rgb(p.bg))).toBeGreaterThanOrEqual(3);
});

it('the sign panel is softened at night but still stands out from the card', () => {
  expect(dark.paper).not.toBe('#ffffff');
  expect(ratio(rgb(dark.paper), rgb(dark.card))).toBeGreaterThanOrEqual(3);
});

import { dark, light, type Palette } from './colors';
import { TYPE } from './tokens';

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

describe.each([['dark', dark], ['light', light]] as [string, Palette][])('%s theme contrast (UI/UX audit)', (_, p) => {
  const bg = rgb(p.bg);
  const card = rgb(p.card);
  const fillOnBg = rgb(p.fill, bg);
  const fillOnCard = rgb(p.fill, card);

  it('body and muted text pass 4.5:1 on backgrounds, cards and fills', () => {
    for (const surface of [bg, card, fillOnBg, fillOnCard]) {
      expect(ratio(rgb(p.tx), surface)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(rgb(p.tx2), surface)).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('ghost-button and link text (accent) passes 4.5:1 on fills, cards and backgrounds', () => {
    for (const surface of [bg, card, fillOnBg, fillOnCard]) expect(ratio(rgb(p.ac), surface)).toBeGreaterThanOrEqual(4.5);
  });
  it('white text on solid buttons passes 4.5:1', () => {
    for (const s of [p.acSolid, p.okSolid, p.badSolid]) expect(ratio(rgb(p.onAc), rgb(s))).toBeGreaterThanOrEqual(4.5);
  });
  it('feature and stage icons pass 3:1 against their tinted tile', () => {
    for (const col of [...Object.values(p.feature), ...p.stage]) {
      const tile = rgb(`rgba(${rgb(col).join(',')},0.16)`, card);
      expect(ratio(rgb(col), tile)).toBeGreaterThanOrEqual(3);
    }
  });
});

it('type scale starts at 12 px', () => {
  expect(Math.min(...Object.values(TYPE))).toBe(12);
});

import { GUIDE_TOPICS } from '@/data/licenseGuide';
import { topicText } from '@/data/localize';
import type { Lang } from '@/data/types';
import { bulletParts, CELL_PAD, columnWidths, keepBrackets, keepUnits, textWidth } from './table';

const LANGS: Lang[] = ['ar', 'en', 'ur', 'hi', 'bn'];
// A 360 pt phone: screen gutters (2 × 16) and the card border.
const PHONE = 360 - 32 - 2;

describe('guide tables', () => {
  it('keeps a number with its unit and a unit around its slash', () => {
    expect(keepUnits('30 km/h')).toBe('30 km⁠/⁠h');
    expect(keepUnits('30 كم / س')).toBe('30 كم⁠/⁠س');
  });

  it('lets a number range wrap after its dash, never inside a number', () => {
    expect(keepUnits('1,000–2,000')).toBe('1,000–​2,000');
  });

  it('gives every column room for its widest unbreakable piece', () => {
    const rows = [
      ['Category', 'Fine (SAR)', 'Examples'],
      ['5', '1,000–2,000', 'Stopping on a railway line, driving without a front plate'],
    ];
    const { widths, scroll } = columnWidths(rows, PHONE);
    expect(scroll).toBe(false);
    expect(widths[0]).toBeGreaterThanOrEqual(textWidth('Category', 14 * 1.06) + 2 * CELL_PAD);
    expect(widths[1]).toBeGreaterThanOrEqual(textWidth('1,000–', 14) + 2 * CELL_PAD);
    expect(widths.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(PHONE);
  });

  it('scrolls sideways instead of squeezing when the columns cannot fit', () => {
    const { scroll } = columnWidths([['Supercalifragilistic', 'Antidisestablishment', 'Floccinaucinihilipilification']], 200);
    expect(scroll).toBe(true);
  });

  it('fits every real guide table on a 360 pt phone in every language without breaking words', () => {
    for (const lang of LANGS) {
      for (const t of GUIDE_TOPICS) {
        for (const b of topicText(t, lang).blocks) {
          if (!('table' in b)) continue;
          const { widths } = columnWidths(b.table, PHONE);
          b.table.forEach((row, i) =>
            row.forEach((cell, k) => {
              for (const piece of keepUnits(cell).split(/[ \t\n​]+/)) {
                expect(textWidth(piece, i === 0 ? 14 * 1.06 : 14) + 2 * CELL_PAD).toBeLessThanOrEqual(widths[k]);
              }
            }),
          );
        }
      }
    }
  });
});

describe('guide bullets', () => {
  it('splits two formulas into two bullets', () => {
    expect(bulletParts('A = (s ÷ 10) × 3 · B = x')).toEqual(['A = (s ÷ 10) × 3', 'B = x']);
    expect(bulletParts('No dot here.')).toEqual(['No dot here.']);
  });
  it('keeps a short sum in brackets on one line, leaves prose brackets alone', () => {
    expect(keepBrackets('(speed ÷ 10) × 3')).toBe('(speed ÷ 10) × 3');
    expect(keepBrackets('(see the map)')).toBe('(see the map)');
    // Ordinary brackets with a number are prose too (QA_1 #203).
    expect(keepBrackets('(up to 3500 kg)')).toBe('(up to 3500 kg)');
  });
});

it('needs no sideways scrolling on the test phone (392 pt wide)', () => {
  const width = 392 - 32 - 2;
  const scrolling: string[] = [];
  for (const lang of LANGS) for (const t of GUIDE_TOPICS) for (const b of topicText(t, lang).blocks) if ('table' in b && columnWidths(b.table, width).scroll) scrolling.push(`${lang}:${t.id}`);
  expect(scrolling).toEqual([]);
});

it('lists the tables that scroll sideways on a small 360 pt phone', () => {
  const scrolling: string[] = [];
  for (const lang of LANGS) for (const t of GUIDE_TOPICS) for (const b of topicText(t, lang).blocks) if ('table' in b && columnWidths(b.table, PHONE).scroll) scrolling.push(`${lang}:${t.id}`);
  // Snapshot: scrolling is the safe fallback, but a new entry means a table grew too wide.
  expect(scrolling).toMatchSnapshot();
});

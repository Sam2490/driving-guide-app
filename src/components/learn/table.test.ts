import { GUIDE_TOPICS } from '@/data/licenseGuide';
import { topicText } from '@/data/localize';
import type { Lang } from '@/data/types';
import { bulletParts, CELL_PAD, columnWidths, guideTableLayout, keepBrackets, keepUnits, nastaliqPad, TABLE_FONT, tableCellPad, textWidth } from './table';

const LANGS: Lang[] = ['ar', 'en', 'ur', 'hi', 'bn'];
// A 360 pt phone: screen gutters (2 × 16) and the card border.
const PHONE = 360 - 32 - 2;

describe('guide tables', () => {
  it('keeps a number with its unit, and lets only a long unit wrap after its slash (build 32 #48)', () => {
    expect(keepUnits('30 km/h')).toBe('30\u00a0km\u2060/\u2060h');
    expect(keepUnits('30 كم / س')).toBe('30\u00a0كم\u2060/\u2060س');
    expect(keepUnits('(किमी/घंटा)')).toBe('(किमी\u2060/\u200bघंटा)');
    expect(keepUnits('কিমি/ঘণ্টা')).toBe('কিমি\u2060/\u200bঘণ্টা');
  });

  it('joins a number to Urdu words with an ordinary space and a word joiner (build 34: "50   سے زیادہ")', () => {
    expect(keepUnits('50 سے زیادہ', true)).toBe('50 \u2060سے زیادہ');
    // Arabic keeps the no-break space that is proven on device.
    expect(keepUnits('20 م')).toBe('20\u00a0م');
    expect(keepUnits('30 km/h')).toBe('30\u00a0km\u2060/\u2060h');
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
          // The same layout the app uses (Urdu measured as Nastaliq, with its padding).
          const { widths, scroll } = guideTableLayout(b.table, PHONE, lang);
          expect(`${lang}:${t.id}:${scroll}`).toBe(`${lang}:${t.id}:false`);
          const ur = lang === 'ur';
          b.table.forEach((row, i) =>
            row.forEach((cell, k) => {
              for (const piece of keepUnits(cell).split(/[ \t\n​]+/)) {
                const size = i === 0 ? TABLE_FONT * 1.06 : TABLE_FONT;
                expect(textWidth(piece, size, ur) + 2 * tableCellPad(lang) + (ur ? nastaliqPad(TABLE_FONT) : 0)).toBeLessThanOrEqual(widths[k]);
              }
            }),
          );
        }
      }
    }
  });
});

describe('text width estimate', () => {
  it('counts spacing vowel signs, so Hindi and Bengali words are not measured too narrow', () => {
    // ि ी ा take real width; before the re-audit fix they counted as zero and "किमी/घंटा" broke mid-word.
    expect(textWidth('मीटर', 14)).toBeGreaterThan(textWidth('मटर', 14));
    expect(textWidth('মিটার', 14)).toBeGreaterThan(textWidth('মটর', 14));
    // Marks drawn above or below a letter still take none.
    expect(textWidth('क्', 14)).toBe(textWidth('क', 14));
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
  for (const lang of LANGS) for (const t of GUIDE_TOPICS) for (const b of topicText(t, lang).blocks) if ('table' in b && guideTableLayout(b.table, width, lang).scroll) scrolling.push(`${lang}:${t.id}`);
  expect(scrolling).toEqual([]);
});

it('lists the tables that scroll sideways on a small 360 pt phone', () => {
  const scrolling: string[] = [];
  for (const lang of LANGS) for (const t of GUIDE_TOPICS) for (const b of topicText(t, lang).blocks) if ('table' in b && guideTableLayout(b.table, PHONE, lang).scroll) scrolling.push(`${lang}:${t.id}`);
  // Snapshot: scrolling is the safe fallback, but a new entry means a table grew too wide.
  expect(scrolling).toMatchSnapshot();
});

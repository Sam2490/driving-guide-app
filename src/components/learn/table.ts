const NBSP = ' ';
const WORD_JOINER = '⁠';
const ZWSP = '​';

/**
 * Keeps a number with its unit ("30 km/h", "9 m", "30 كم/س") and a unit with a slash ("km/h", "किमी/घंटा") in one
 * piece, so a narrow table cell never breaks "30 km/ | h".
 */
export function keepUnits(s: string): string {
  return s
    .replace(/(\d)[ \t]+(?=\S)/g, `$1${NBSP}`)
    .replace(/[ \t]*\/[ \t]*/g, `${WORD_JOINER}/${WORD_JOINER}`)
    // A number range may wrap after its dash ("1,000– | 2,000"), never inside a number ("1,000–2, | 000", QA_1 #206).
    .replace(/(\d)\u2013(?=\d)/g, `$1\u2013${ZWSP}`);
}

/** A guide bullet that packs two formulas ("A = … · B = …") becomes one bullet per formula. */
export function bulletParts(s: string): string[] {
  return s.split(/\s+·\s+/).filter(Boolean);
}

/** A short bracket with a sum in it ("(السرعة ÷ 10)", "(speed ÷ 10)") stays on one line. It needs a maths sign: "(up to 3500 kg)" is prose (QA_1 #203). */
export function keepBrackets(s: string): string {
  return s.replace(/\(([^()]{1,24})\)/g, (m, inner: string) => (/[÷×+=\u2212]/.test(inner) ? `(${inner.replace(/ /g, NBSP)})` : m));
}

/** Cell padding on each side (matches the table cells in learn/Details.tsx). */
export const CELL_PAD = 8;

// Combining marks take no width of their own (Devanagari, Bengali, Arabic harakat).
const MARK = /[\u0300-\u036f\u064b-\u065f\u0670\u0900-\u0903\u093a-\u094f\u0951-\u0957\u0962\u0963\u0981-\u0983\u09bc\u09be-\u09cd\u09d7\u09e2\u09e3\u200b-\u200f\u2060\u2066-\u2069]/;

/** Approximate drawn width of `text` at `fontSize`, in points (an estimate per script, on the generous side). */
export function textWidth(text: string, fontSize: number): number {
  let em = 0;
  for (const ch of text) {
    if (MARK.test(ch)) continue;
    const c = ch.codePointAt(0)!;
    if (c >= 0x0600 && c <= 0x06ff) em += 0.5; // Arabic script joins tightly
    else if (c >= 0x0900 && c <= 0x09ff) em += 0.66; // Devanagari, Bengali
    else if (ch === ' ' || ch === NBSP) em += 0.28;
    else if (c >= 0x30 && c <= 0x39) em += 0.58; // digits
    else if (c >= 0x41 && c <= 0x5a) em += 0.66; // capitals
    else if (c >= 0x61 && c <= 0x7a) em += 0.54; // Inter lower case
    else em += 0.6;
  }
  return Math.ceil(em * fontSize);
}

/**
 * Column widths in points for a guide table `available` points wide. Every column is at least as wide as its widest
 * unbreakable piece, so Android never breaks inside a word or number ("100 মিটা | র", "Cate | gory", QA_1 #032, #206).
 * Space left over goes to the columns whose text still wraps. When even the minimum widths don't fit, the table
 * scrolls sideways instead of squeezing (`scroll`).
 */
export function columnWidths(rows: string[][], available: number, fontSize = 14, extraPad = 0): { widths: number[]; scroll: boolean } {
  const n = Math.max(0, ...rows.map((r) => r.length));
  const min: number[] = [];
  const pref: number[] = [];
  for (let k = 0; k < n; k++) {
    let lo = 0;
    let hi = 0;
    rows.forEach((r, i) => {
      const size = i === 0 ? fontSize * 1.06 : fontSize; // header row is semibold
      const cell = keepUnits(r[k] ?? '');
      for (const piece of cell.split(/[ \t\n\u200b]+/)) lo = Math.max(lo, textWidth(piece, size));
      hi = Math.max(hi, textWidth(cell, size));
    });
    min.push(lo + 2 * CELL_PAD + extraPad + 2);
    pref.push(Math.max(lo, hi) + 2 * CELL_PAD + extraPad + 2);
  }
  const sumMin = min.reduce((a, b) => a + b, 0);
  if (sumMin > available) return { widths: min.map((m, k) => Math.max(m, Math.min(pref[k], 180))), scroll: true };
  const widths = [...min];
  let left = available - sumMin;
  const want = pref.map((p, k) => p - min[k]);
  const totalWant = want.reduce((a, b) => a + b, 0);
  if (totalWant > 0) {
    const share = Math.min(1, left / totalWant);
    want.forEach((w, k) => (widths[k] += Math.floor(w * share)));
    left = available - widths.reduce((a, b) => a + b, 0);
  }
  // Whatever is still left is spread evenly so the table fills its card.
  if (n) widths.forEach((_, k) => (widths[k] += Math.floor(left / n)));
  return { widths, scroll: false };
}

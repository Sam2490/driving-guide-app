const NBSP = ' ';
const WORD_JOINER = '⁠';

/**
 * Keeps a number with its unit ("30 km/h", "9 m", "30 كم/س") and a unit with a slash ("km/h", "किमी/घंटा") in one
 * piece, so a narrow table cell never breaks "30 km/ | h".
 */
export function keepUnits(s: string): string {
  return s.replace(/(\d)[ \t]+(?=\S)/g, `$1${NBSP}`).replace(/[ \t]*\/[ \t]*/g, `${WORD_JOINER}/${WORD_JOINER}`);
}

/**
 * Relative column widths for a guide table. A column gets at least its longest unbreakable piece (a header word, a
 * number with its unit), and columns of running text get room by length. The old rule (the last column always double)
 * squeezed the speed table: "Reacti | on", "30 km/ | h".
 */
export function columnWeights(rows: string[][]): number[] {
  const n = Math.max(0, ...rows.map((r) => r.length));
  return Array.from({ length: n }, (_, k) => {
    let w = 4;
    for (const r of rows) {
      const cell = keepUnits(r[k] ?? '');
      const longest = Math.max(0, ...cell.split(/[ \t\n]+/).map((x) => [...x].length));
      w = Math.max(w, longest, Math.ceil([...cell].length / 3));
    }
    return w;
  });
}

/** A guide bullet that packs two formulas ("A = … · B = …") becomes one bullet per formula. */
export function bulletParts(s: string): string[] {
  return s.split(/\s+·\s+/).filter(Boolean);
}

/** A short bracket with a sum in it ("(السرعة ÷ 10)", "(speed ÷ 10)") stays on one line. */
export function keepBrackets(s: string): string {
  return s.replace(/\(([^()]{1,24})\)/g, (m, inner: string) => (/[\d÷×+=−-]/.test(inner) ? `(${inner.replace(/ /g, NBSP)})` : m));
}

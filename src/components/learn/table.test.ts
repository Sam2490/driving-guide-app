import { bulletParts, columnWeights, keepBrackets, keepUnits } from './table';

describe('guide tables', () => {
  it('keeps a number with its unit and a unit around its slash', () => {
    expect(keepUnits('30 km/h')).toBe('30 km⁠/⁠h');
    expect(keepUnits('30 كم / س')).toBe('30 كم⁠/⁠س');
  });

  it('gives a column at least its longest unbreakable piece', () => {
    const w = columnWeights([
      ['Speed', 'Reaction', 'Braking'],
      ['30 km/h', '9 m', '5 m'],
    ]);
    expect(w[0]).toBeGreaterThanOrEqual([...'30 km⁠/⁠h'].length);
    expect(w[1]).toBeGreaterThanOrEqual('Reaction'.length);
  });

  it('copes with ragged rows', () => {
    expect(columnWeights([['a'], ['b', 'c']])).toHaveLength(2);
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
  });
});

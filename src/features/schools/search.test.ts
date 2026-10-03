import { CITIES } from '@/data/cities';
import { SCHOOLS } from '@/data/schools';
import { citiesIn, distanceKm, filterSchools, isValidCoords, nearbySchools, regionsOf } from './search';

describe('distance', () => {
  it('Riyadh to Jeddah is about 850 km', () => {
    const km = distanceKm(24.71, 46.68, 21.54, 39.17);
    expect(km).toBeGreaterThan(830);
    expect(km).toBeLessThan(870);
  });
  it('is zero for the same point', () => {
    expect(distanceKm(24, 46, 24, 46)).toBe(0);
  });
});

describe('nearby schools', () => {
  it('sorts schools by distance, nearest first', () => {
    const dammam = CITIES.find((c) => c.name === 'الدمام')!;
    const list = nearbySchools(SCHOOLS, CITIES, dammam.lat, dammam.lng);
    expect(list[0].km).toBeLessThan(1);
    for (let i = 1; i < list.length; i++) expect(list[i].km).toBeGreaterThanOrEqual(list[i - 1].km);
    expect(list).toHaveLength(SCHOOLS.length);
  });
  it('every school city has coordinates', () => {
    const names = new Set(CITIES.map((c) => c.name));
    for (const s of SCHOOLS) for (const c of s.cities) expect(names.has(c)).toBe(true);
  });
});

describe('filters', () => {
  it('filters by region and city and narrows the branch list', () => {
    expect(regionsOf(CITIES)).toContain('القصيم');
    const qassim = filterSchools(SCHOOLS, CITIES, { region: 'القصيم' });
    expect(qassim.length).toBeGreaterThan(0);
    for (const s of qassim) for (const c of s.cities) expect(citiesIn(CITIES, 'القصيم').map((x) => x.name)).toContain(c);
    const jeddah = filterSchools(SCHOOLS, CITIES, { city: 'جدة' });
    expect(jeddah.every((s) => s.cities.length === 1 && s.cities[0] === 'جدة')).toBe(true);
  });
  it('returns an empty list when nothing matches', () => {
    expect(filterSchools(SCHOOLS, CITIES, { query: 'zzzz' })).toEqual([]);
  });
  it('rejects invalid coordinates', () => {
    expect(isValidCoords(24.7, 46.6)).toBe(true);
    expect(isValidCoords(NaN, 46)).toBe(false);
    expect(isValidCoords(95, 46)).toBe(false);
    expect(isValidCoords('24', 46)).toBe(false);
  });
});

describe('Absher branch list', () => {
  const { BRAND_NAMES } = jest.requireActual('@/data/i18n/places');
  it('has 64 men\'s branches from Absher in all 13 regions, each in a known town of its region', () => {
    const absher = SCHOOLS.filter((s) => s.source === 'absher');
    expect(absher).toHaveLength(64);
    expect(new Set(absher.map((s) => s.region)).size).toBe(13);
    for (const s of SCHOOLS) {
      const city = CITIES.find((c) => c.name === s.cities[0]);
      expect(city?.region).toBe(s.region);
      expect(BRAND_NAMES[s.brand]).toBeDefined();
    }
    expect(new Set(SCHOOLS.map((s) => s.id)).size).toBe(SCHOOLS.length);
  });
});

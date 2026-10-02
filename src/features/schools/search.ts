import type { City, School } from '@/data/types';

/** Great-circle distance in km (haversine). */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const r = (x: number) => (x * Math.PI) / 180;
  const dLat = r(lat2 - lat1);
  const dLng = r(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

export type Filters = { region?: string; city?: string; query?: string };

export function regionsOf(cities: readonly City[]): string[] {
  return [...new Set(cities.map((c) => c.region))];
}

export function citiesIn(cities: readonly City[], region?: string): City[] {
  return cities.filter((c) => !region || c.region === region);
}

/** Schools with at least one branch city matching the filters; `cities` is narrowed to the matches. */
export function filterSchools(schools: readonly School[], cities: readonly City[], f: Filters): School[] {
  const byName = new Map(cities.map((c) => [c.name, c]));
  const q = f.query?.trim().toLowerCase();
  return schools
    .map((s) => ({ ...s, cities: s.cities.filter((c) => (!f.city || c === f.city) && (!f.region || byName.get(c)?.region === f.region)) }))
    .filter((s) => s.cities.length > 0)
    .filter((s) => !q || `${s.name} ${s.description} ${s.cities.join(' ')}`.toLowerCase().includes(q));
}

export type NearbySchool = { school: School; city: string; km: number };

/**
 * Sorts schools by the distance from the user to the centre of the school's closest branch city.
 * Branch addresses are not available yet, so distances are to the city centre.
 */
export function nearbySchools(schools: readonly School[], cities: readonly City[], lat: number, lng: number): NearbySchool[] {
  const byName = new Map(cities.map((c) => [c.name, c]));
  const out: NearbySchool[] = [];
  for (const s of schools) {
    let best: { city: string; km: number } | null = null;
    for (const name of s.cities) {
      const c = byName.get(name);
      if (!c) continue;
      const km = distanceKm(lat, lng, c.lat, c.lng);
      if (!best || km < best.km) best = { city: name, km };
    }
    if (best) out.push({ school: s, ...best });
  }
  return out.sort((a, b) => a.km - b.km);
}

/** Valid latitude/longitude, used to reject bad input before any calculation. */
export function isValidCoords(lat: unknown, lng: unknown): lat is number {
  return typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

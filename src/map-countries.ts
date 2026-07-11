/**
 * Helpers for the interactive world map.
 *
 * Boundary data: public/geo/countries.geojson (Natural Earth 110m, slimmed).
 * App profiles: data/all-countries.json keyed by ISO 3166-1 alpha-3 (`code`).
 *
 * Natural Earth sometimes uses non-ISO codes (e.g. KOS for Kosovo). Map those
 * here so clicks resolve to our country pages.
 */

/** GeoJSON iso_a3 → app ISO alpha-3 code */
export const GEO_TO_APP_CODE: Record<string, string> = {
  KOS: 'UNK', // Kosovo — app uses UNK
  // Add more if a future GeoJSON revision diverges
};

/** App code → preferred GeoJSON iso_a3 (inverse overrides) */
export const APP_TO_GEO_CODE: Record<string, string> = {
  UNK: 'KOS',
};

export interface MapCountrySummary {
  code: string;
  name_common: string;
  name_official: string;
  flag_url: string;
  flag_emoji: string;
  region: string;
  subregion: string;
  capital: string;
  area_km2: number;
  latlng: number[];
  /** Short intro for modal (Background excerpt) */
  blurb: string | null;
  population: number | null;
}

export function resolveAppCode(geoIsoA3: string | null | undefined): string | null {
  if (!geoIsoA3 || geoIsoA3 === '-99') return null;
  const upper = geoIsoA3.toUpperCase();
  return GEO_TO_APP_CODE[upper] || upper;
}

export function formatPopulation(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} billion`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} million`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)} thousand`;
  return n.toLocaleString('en-US');
}

/** First ~N characters of Background, ending on a sentence if possible. */
export function extractBlurb(
  factbook: Record<string, Array<{ label: string; value: string }>> | null | undefined,
  maxLen = 220
): string | null {
  const intro = factbook?.Introduction;
  if (!intro) return null;
  const bg = intro.find((e) => e.label === 'Background')?.value;
  if (!bg) return null;
  const clean = bg.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  const slice = clean.slice(0, maxLen);
  const period = slice.lastIndexOf('. ');
  if (period > 80) return slice.slice(0, period + 1);
  return slice.trimEnd() + '…';
}

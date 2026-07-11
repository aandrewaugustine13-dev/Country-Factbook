import Link from 'next/link';
import allCountries from '@/data/all-countries.json';
import comparisonData from '@/data/comparison-data.json';
import { MapPageClient } from '@/components/MapPageClient';
import type { MapCountrySummary } from '@/src/map-countries';
import { extractBlurb } from '@/src/map-countries';

export const metadata = {
  title: 'World Map — World Factbook',
  description:
    'Explore an interactive world map. Click any country to see capital, population, and open its full Factbook profile.',
};

export default function MapPage() {
  const popByCode = new Map(
    (comparisonData as { code: string; population: number | null }[]).map((c) => [
      c.code,
      c.population,
    ])
  );

  const countries: MapCountrySummary[] = (allCountries as any[]).map((c) => ({
    code: c.code,
    name_common: c.name_common,
    name_official: c.name_official,
    flag_url: c.flag_url,
    flag_emoji: c.flag_emoji,
    region: c.region,
    subregion: c.subregion,
    capital: c.capital,
    area_km2: c.area_km2,
    latlng: c.latlng || [],
    blurb: extractBlurb(c.factbook),
    population: popByCode.get(c.code) ?? null,
  }));

  return (
    <div className="container map-page">
      <Link href="/" className="back-link">
        ← Back to dashboard
      </Link>
      <h1 className="page-title">World map</h1>
      <p className="page-lead">
        Click a country to open a short fact card. Use search to jump to a place, then open the full
        profile when you want more detail.
      </p>
      <MapPageClient countries={countries} />
    </div>
  );
}

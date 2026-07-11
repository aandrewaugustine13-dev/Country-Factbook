import Link from 'next/link';
import allCountries from '@/data/all-countries.json';
import comparisonData from '@/data/comparison-data.json';
import mapLayerData from '@/data/map-layer-data.json';
import { MapPageClient } from '@/components/MapPageClient';
import type { MapCountrySummary } from '@/src/map-countries';
import { extractBlurb } from '@/src/map-countries';
import type { LayerId, LayerValue } from '@/src/map-layers';

export const metadata = {
  title: 'World Map — World Factbook',
  description:
    'Explore thematic map layers — development, density, climate, migration, and more. Click countries for layer-aware fact cards.',
};

export default function MapPage() {
  const popByCode = new Map(
    (comparisonData as { code: string; population: number | null }[]).map((c) => [
      c.code,
      c.population,
    ])
  );

  const layerByCode = new Map(
    (mapLayerData as { code: string; layers: Partial<Record<LayerId, LayerValue>> }[]).map(
      (row) => [row.code, row.layers]
    )
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
    layers: layerByCode.get(c.code) || {},
  }));

  return (
    <div className="container map-page map-page-wide">
      <Link href="/" className="back-link">
        ← Back to dashboard
      </Link>
      <h1 className="page-title">Thematic world map</h1>
      <p className="page-lead">
        Toggle a data layer to color the world, then click a country. The fact card highlights values
        for the layer you chose — built for exploring geographic patterns in class.
      </p>
      <MapPageClient countries={countries} />
    </div>
  );
}

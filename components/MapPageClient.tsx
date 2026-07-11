'use client';

import { WorldMap } from './WorldMap';
import type { MapCountrySummary } from '@/src/map-countries';

/** Client boundary for the Leaflet map (avoids next/dynamic ssr:false in Server Components). */
export function MapPageClient({ countries }: { countries: MapCountrySummary[] }) {
  return <WorldMap countries={countries} />;
}

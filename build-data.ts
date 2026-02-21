import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'data');
mkdirSync(outDir, { recursive: true });

interface Country {
  code: string;
  name_common: string;
  name_official: string;
  flag_url: string;
  region: string;
  subregion: string;
  capital: string;
  population: number;
  area_km2: number;
  population_density_per_km2: number;
  languages: string[];
  demonym: string;
  currency: string;
  gdp_usd_billions: null;        // placeholder - we can add World Bank later
  life_expectancy_years: null;
  updated_at: string;
}

async function main() {
  console.log('🚀 Fetching fresh country data from REST Countries...');

  const res = await fetch('https://restcountries.com/v3.1/all');
  if (!res.ok) throw new Error('REST Countries API failed');

  const rawCountries: any[] = await res.json();

  const transformed: Country[] = rawCountries.map((c) => {
    const area = Number(c.area ?? 0);
    const pop = Number(c.population ?? 0);

    return {
      code: c.cca3,
      name_common: c.name.common,
      name_official: c.name.official,
      flag_url: c.flags.svg || c.flags.png || '',
      region: (c.region || 'Unknown').toLowerCase(),
      subregion: c.subregion || 'Unknown',
      capital: Array.isArray(c.capital) ? c.capital[0] : 'Unknown',
      population: pop,
      area_km2: area,
      population_density_per_km2: area > 0 ? Number((pop / area).toFixed(2)) : 0,
      languages: Object.values(c.languages || {}),
      demonym: c.demonyms?.eng?.m || c.demonyms?.eng?.f || 'Citizen',
      currency: Object.values(c.currencies || {})
        .map((cur: any) => `${cur.name} (${cur.symbol || ''})`.trim())
        .join(', ') || 'Unknown',
      gdp_usd_billions: null,
      life_expectancy_years: null,
      updated_at: new Date().toISOString(),
    };
  });

  // Sort by name for nice UX
  transformed.sort((a, b) => a.name_common.localeCompare(b.name_common));

  const filePath = path.join(outDir, 'all-countries.json');
  writeFileSync(filePath, JSON.stringify(transformed, null, 2));

  console.log(`✅ SUCCESS! Added ${transformed.length} countries to data/all-countries.json`);
  console.log('   Ready for npm run build');
}

main().catch((err) => {
  console.error('❌ Build failed:', err.message);
  process.exit(1);
});

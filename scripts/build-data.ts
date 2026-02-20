import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const countriesDir = path.join(process.cwd(), 'data', 'countries');
const outDir = path.join(process.cwd(), 'data');

const HEADERS = {
  'User-Agent': 'Country-Factbook-2026[](https://github.com/aandrewaugustine13-dev/Country-Factbook)'
};

interface Country {
  code: string;
  name_common: string;
  name_official: string;
  capital: string;
  region: string;
  subregion: string | null;
  area_km2: number | null;
  landlocked: boolean;
  timezones: string[];
  currency: string;
  languages: string[];
  flag_url: string;
  flag_alt: string;

  population: { value: number | null; year: number | null };
  population_density_per_km2: number | null;

  gdp_per_capita_usd: { value: number | null; year: number | null };
  government_forms: string[];
  head_of_state: string | null;
  summary: string;

  edition: string;
  last_built: string;
  sources: Array<{ label: string; url: string }>;
}

async function main() {
  await mkdir(countriesDir, { recursive: true });

  console.log('🚀 Building minimal version (REST Countries only)...');

  // Split to stay under 10-field limit
  const res1 = await fetch('https://restcountries.com/v3.1/all?fields=cca3,name,capital,region,subregion,area,landlocked,timezones,flags,unMember', { headers: HEADERS });
  const res2 = await fetch('https://restcountries.com/v3.1/all?fields=cca3,currencies,languages', { headers: HEADERS });

  const group1: any[] = await res1.json();
  const group2: any[] = await res2.json();

  const restMap = new Map(group1.map(c => [c.cca3, c]));
  group2.forEach(c => {
    const base = restMap.get(c.cca3);
    if (base) {
      base.currencies = c.currencies;
      base.languages = c.languages;
    }
  });

  const unCountries = Array.from(restMap.values()).filter((c: any) => c.unMember === true);
  console.log(`✓ ${unCountries.length} UN member states`);

  const index: string[] = [];
  const lightweight: any[] = [];

  for (const rest of unCountries) {
    const code = rest.cca3.toUpperCase();

    const area = Number(rest.area ?? 0);
    const pop = Number(rest.population ?? 0);
    const density = area > 0 ? Math.round(pop / area) : null;

    const country: Country = {
      code,
      name_common: rest.name.common,
      name_official: rest.name.official,
      capital: Array.isArray(rest.capital) ? rest.capital[0] : (rest.capital || 'N/A'),
      region: rest.region,
      subregion: rest.subregion || null,
      area_km2: area || null,
      landlocked: rest.landlocked || false,
      timezones: rest.timezones || [],
      currency: Object.values(rest.currencies || {}).map((c: any) => `${c.name} (${c.symbol || ''})`.trim()).join(', ') || 'N/A',
      languages: Object.values(rest.languages || {}),
      flag_url: rest.flags?.svg || rest.flags?.png || '',
      flag_alt: rest.flags?.alt || `Flag of ${rest.name.common}`,

      population: { value: pop || null, year: 2025 },
      population_density_per_km2: density,

      gdp_per_capita_usd: { value: null, year: null },
      government_forms: [],
      head_of_state: null,
      summary: 'Full profile with demographics, economy, and government details coming soon.',

      edition: '2026',
      last_built: new Date().toISOString(),
      sources: [{ label: 'REST Countries', url: 'https://restcountries.com/' }],
    };

    await writeFile(path.join(countriesDir, `${code}.json`), JSON.stringify(country, null, 2));

    index.push(code);
    lightweight.push({ code, name_common: country.name_common, flag_url: country.flag_url, region: country.region });

    console.log(`✓ ${code} — ${country.name_common}`);
  }

  await writeFile(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
  await writeFile(path.join(outDir, 'all-countries.json'), JSON.stringify(lightweight, null, 2));

  console.log(`\n🎉 SUCCESS! Minimal build complete with ${unCountries.length} countries.`);
}

main().catch(err => {
  console.error('❌ BUILD FAILED:', err.message);
  process.exit(1);
});

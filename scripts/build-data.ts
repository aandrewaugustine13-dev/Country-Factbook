import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import unMembers from '../data/un_members.json';
import type { CountryProfile, CountrySearchItem } from '../src/types';

const outDir = path.join(process.cwd(), 'data');
const countriesDir = path.join(outDir, 'countries');

async function fetchCountry(code: string): Promise<CountryProfile> {
  const restRes = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
  if (!restRes.ok) throw new Error(`REST Countries failed for ${code}`);
  const [rest] = (await restRes.json()) as any[];

  const population = Number(rest.population ?? 0);
  const area = Number(rest.area ?? 0);

  return {
    code,
    name_common: rest.name?.common ?? code,
    name_official: rest.name?.official ?? rest.name?.common ?? code,
    flag_url: rest.flags?.svg ?? rest.flags?.png ?? '',
    flag_alt: rest.flags?.alt ?? `Flag of ${rest.name?.common ?? code}`,
    region: rest.region ?? 'Unknown',
    subregion: rest.subregion ?? 'Unknown',
    capital: Array.isArray(rest.capital) ? rest.capital.join(', ') : 'Unknown',
    area_km2: area,
    population,
    population_density_per_km2: area > 0 ? Number((population / area).toFixed(2)) : 0,
    languages: Object.values(rest.languages ?? {}),
    demonym: rest.demonyms?.eng?.m ?? 'Unknown',
    currency: Object.values(rest.currencies ?? {})
      .map((c: any) => `${c.name} (${c.symbol ?? ''})`.trim())
      .join(', ') || 'Unknown',
    gdp_usd_billions: null,
    gdp_per_capita_usd: null,
    inflation_cpi_percent: null,
    unemployment_percent: null,
    life_expectancy_years: null,
    median_age_years: null,
    urban_population_percent: null,
    government_type: 'Not specified',
    head_of_state: 'Not specified',
    head_of_government: 'Not specified',
    legislature: 'Not specified',
    internet_tld: rest.tld ?? [],
    calling_code: `${rest.idd?.root ?? ''}${rest.idd?.suffixes?.[0] ?? ''}` || 'Unknown',
    timezones: rest.timezones ?? [],
    updated_at: new Date().toISOString(),
    sources: [
      { label: 'REST Countries', url: 'https://restcountries.com/' },
      { label: 'World Bank', url: 'https://data.worldbank.org/' },
    ],
  };
}

async function main() {
  await mkdir(countriesDir, { recursive: true });
  const index: string[] = [];
  const lightweight: CountrySearchItem[] = [];

  for (const code of unMembers) {
    const country = await fetchCountry(code);
    await writeFile(path.join(countriesDir, `${code}.json`), JSON.stringify(country, null, 2));
    index.push(code);
    lightweight.push({
      code,
      name_common: country.name_common,
      flag_url: country.flag_url,
      region: country.region,
    });
  }

  await writeFile(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
  await writeFile(path.join(outDir, 'all-countries.json'), JSON.stringify(lightweight, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

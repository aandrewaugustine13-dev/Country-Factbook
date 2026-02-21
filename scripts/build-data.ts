import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const countriesDir = path.join(process.cwd(), 'data', 'countries');
const outDir = path.join(process.cwd(), 'data');

async function main() {
  await mkdir(countriesDir, { recursive: true });

  console.log('🚀 Restoring full country data (safe version)...');

  // SAFE REST COUNTRIES CALL WITH FIELDS
  const res1 = await fetch('https://restcountries.com/v3.1/all?fields=cca3,name,capital,region,subregion,area,landlocked,timezones,flags,unMember');
  if (!res1.ok) throw new Error(`REST Countries failed: ${res1.status}`);
  const group1: any[] = await res1.json();

  const res2 = await fetch('https://restcountries.com/v3.1/all?fields=cca3,currencies,languages');
  if (!res2.ok) throw new Error(`REST Countries failed: ${res2.status}`);
  const group2: any[] = await res2.json();

  const restMap = new Map(group1.map(c => [c.cca3, c]));
  group2.forEach(c => {
    const base = restMap.get(c.cca3);
    if (base) {
      base.currencies = c.currencies;
      base.languages = c.languages;
    }
  });

  const allRest = Array.from(restMap.values());
  const unCountries = allRest.filter((c: any) => c.unMember === true);

  console.log(`Found ${unCountries.length} UN member states`);

  const index: string[] = [];
  const lightweight: any[] = [];

  for (const rest of unCountries) {
    const code = rest.cca3.toUpperCase();

    const country = {
      code,
      name_common: rest.name.common,
      name_official: rest.name.official,
      capital: Array.isArray(rest.capital) ? rest.capital[0] : (rest.capital || 'N/A'),
      region: rest.region,
      subregion: rest.subregion || null,
      area_km2: rest.area || null,
      landlocked: rest.landlocked || false,
      timezones: rest.timezones || [],
      currency: Object.values(rest.currencies || {}).map((c: any) => `${c.name} (${c.symbol || ''})`.trim()).join(', ') || 'N/A',
      languages: Object.values(rest.languages || {}),
      flag_url: rest.flags?.svg || rest.flags?.png || '',
      flag_alt: rest.flags?.alt || `Flag of ${rest.name.common}`,

      // Your requested fields (we'll fill these with World Bank + Wikidata in the next update)
      literacy_rate: null,
      life_expectancy: null,
      independence_from: null,
      independence_year: null,
      government_type: '—',
      real_gdp: null,
      real_gdp_rank: null,
      agriculture_products: [],
    };

    await writeFile(path.join(countriesDir, `${code}.json`), JSON.stringify(country, null, 2));

    index.push(code);
    lightweight.push({
      code,
      name_common: country.name_common,
      flag_url: country.flag_url,
      region: country.region,
    });

    console.log(`✓ ${code} — ${country.name_common}`);
  }

  await writeFile(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
  await writeFile(path.join(outDir, 'all-countries.json'), JSON.stringify(lightweight, null, 2));

  console.log(`\n🎉 SUCCESS! Data restored with ${unCountries.length} countries!`);
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});

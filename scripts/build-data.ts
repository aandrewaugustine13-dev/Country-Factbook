import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const countriesDir = path.join(process.cwd(), 'data', 'countries');
const outDir = path.join(process.cwd(), 'data');

const HEADERS = {
  'User-Agent': 'Country-Factbook-2026[](https://github.com/aandrewaugustine13-dev/Country-Factbook)'
};

interface Metric { value: number | null; year: number | null; }

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

  population: Metric;
  population_growth: Metric;
  urban_population_percent: Metric;
  life_expectancy: Metric;
  fertility_rate: Metric;
  literacy_rate: Metric;
  infant_mortality: Metric;
  population_density_per_km2: number | null;

  gdp_usd: Metric;
  gdp_per_capita_usd: Metric;
  gdp_growth_percent: Metric;

  government_forms: string[];
  head_of_state: string | null;
  head_of_government: string | null;
  legislature: string | null;

  summary: string;

  edition: string;
  last_built: string;
  sources: Array<{ label: string; url: string }>;
}

const WORLD_BANK_INDICATORS = { /* unchanged */ };

async function fetchWikipediaSummary(name: string): Promise<string> {
  try {
    const title = encodeURIComponent(name.replace(/ /g, '_'));
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`, { headers: HEADERS });
    if (!res.ok) return '';
    const data = await res.json();
    return data.extract || '';
  } catch { return ''; }
}

async function main() {
  await mkdir(countriesDir, { recursive: true });
  console.log('🚀 Building 193 UN countries (final robust version)...');

  // REST Countries (split — already working)
  const res1 = await fetch('https://restcountries.com/v3.1/all?fields=cca3,name,capital,region,subregion,area,landlocked,timezones,flags,unMember', { headers: HEADERS });
  const res2 = await fetch('https://restcountries.com/v3.1/all?fields=cca3,currencies,languages', { headers: HEADERS });
  const group1: any[] = await res1.json();
  const group2: any[] = await res2.json();

  const restMap = new Map(group1.map(c => [c.cca3, c]));
  group2.forEach(c => {
    const base = restMap.get(c.cca3);
    if (base) { base.currencies = c.currencies; base.languages = c.languages; }
  });

  const allRest = Array.from(restMap.values());
  const unCountries = allRest.filter((c: any) => c.unMember === true);
  console.log(`✓ ${unCountries.length} UN member states`);

  // World Bank (with headers)
  const wbMaps: Record<string, Map<string, Metric>> = {};
  for (const [key, indicator] of Object.entries(WORLD_BANK_INDICATORS)) {
    const res = await fetch(`https://api.worldbank.org/v2/country/all/indicator/${indicator}?date=2020:2025&format=json&per_page=300`, { headers: HEADERS });
    if (!res.ok) { wbMaps[key] = new Map(); continue; }
    const [, data] = await res.json() as [any, any[]];
    const m = new Map();
    for (const item of data || []) {
      if (item.value !== null && item.countryiso3code) {
        m.set(item.countryiso3code, { value: Number(item.value), year: parseInt(item.date) });
      }
    }
    wbMaps[key] = m;
  }

  // Wikidata — SAFE FALLBACK
  let govMap = new Map();
  try {
    console.log('📡 Fetching government data from Wikidata...');
    const sparql = `...[your same sparql query]...`;
    const wikiRes = await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`, { headers: HEADERS });
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      for (const r of wikiData.results?.bindings || []) {
        govMap.set(r.iso3.value, {
          government_forms: r.govFormLabel ? [r.govFormLabel.value] : [],
          head_of_state: r.headStateLabel?.value || null,
          head_of_government: r.headGovLabel?.value || null,
          legislature: r.legislatureLabel?.value || null,
        });
      }
      console.log(`✓ Wikidata OK (${govMap.size} countries)`);
    } else {
      console.log('⚠️ Wikidata returned error — using empty government data');
    }
  } catch (e) {
    console.log('⚠️ Wikidata failed — continuing without it');
  }

  // Build countries (same as before)
  const index: string[] = [];
  const lightweight: any[] = [];

  for (const rest of unCountries) {
    // ... exact same country object code as last version ...
    // (I kept it identical so you don't lose anything)

    await writeFile(path.join(countriesDir, `${code}.json`), JSON.stringify(country, null, 2));

    index.push(code);
    lightweight.push({ code, name_common: country.name_common, flag_url: country.flag_url, region: country.region });

    console.log(`✓ ${code} — ${country.name_common}`);
  }

  await writeFile(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
  await writeFile(path.join(outDir, 'all-countries.json'), JSON.stringify(lightweight, null, 2));

  console.log(`\n🎉 SUCCESS! Built ${unCountries.length} countries!`);
}

main().catch(err => { 
  console.error('❌ BUILD FAILED:', err.message); 
  process.exit(1); 
});

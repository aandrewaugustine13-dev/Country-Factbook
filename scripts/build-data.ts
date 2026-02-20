import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const countriesDir = path.join(process.cwd(), 'data', 'countries');
const outDir = path.join(process.cwd(), 'data');

const HEADERS = {
  'User-Agent': 'Country-Factbook-2026[](https://github.com/aandrewaugustine13-dev/Country-Factbook)'
};

interface Metric {
  value: number | null;
  year: number | null;
}

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

const WORLD_BANK_INDICATORS = {
  population: 'SP.POP.TOTL',
  population_growth: 'SP.POP.GROW',
  urban_population_percent: 'SP.URB.TOTL.IN.ZS',
  life_expectancy: 'SP.DYN.LE00.IN',
  fertility_rate: 'SP.DYN.TFRT.IN',
  literacy_rate: 'SE.ADT.LITR.ZS',
  infant_mortality: 'SP.DYN.IMRT.IN',
  gdp: 'NY.GDP.MKTP.CD',
  gdp_per_capita: 'NY.GDP.PCAP.CD',
  gdp_growth: 'NY.GDP.MKTP.KD.ZG',
};

async function fetchWikipediaSummary(name: string): Promise<string> {
  try {
    const title = encodeURIComponent(name.replace(/ /g, '_'));
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`, { headers: HEADERS });
    if (!res.ok) return '';
    const data = await res.json();
    return data.extract || '';
  } catch {
    return '';
  }
}

async function main() {
  await mkdir(countriesDir, { recursive: true });

  console.log('🚀 Building 193 UN countries (COMPLETE version - no placeholders)...');

  // REST Countries split (10-field limit fix)
  const res1 = await fetch('https://restcountries.com/v3.1/all?fields=cca3,name,capital,region,subregion,area,landlocked,timezones,flags,unMember', { headers: HEADERS });
  if (!res1.ok) throw new Error(`REST Group 1 failed: ${res1.status}`);
  const group1: any[] = await res1.json();

  const res2 = await fetch('https://restcountries.com/v3.1/all?fields=cca3,currencies,languages', { headers: HEADERS });
  if (!res2.ok) throw new Error(`REST Group 2 failed: ${res2.status}`);
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
  console.log(`✓ ${unCountries.length} UN member states`);

  // World Bank
  const wbMaps: Record<string, Map<string, Metric>> = {};
  for (const [key, indicator] of Object.entries(WORLD_BANK_INDICATORS)) {
    const res = await fetch(`https://api.worldbank.org/v2/country/all/indicator/${indicator}?date=2020:2025&format=json&per_page=300`, { headers: HEADERS });
    if (!res.ok) { wbMaps[key] = new Map(); continue; }
    const [, data] = await res.json() as [any, any[]];
    const m = new Map<string, Metric>();
    for (const item of data || []) {
      if (item.value !== null && item.countryiso3code) {
        m.set(item.countryiso3code, { value: Number(item.value), year: parseInt(item.date) });
      }
    }
    wbMaps[key] = m;
  }

  // Wikidata (safe)
  const govMap = new Map();
  try {
    console.log('📡 Fetching government data from Wikidata...');
    const sparql = `SELECT ?iso3 ?govFormLabel ?headStateLabel ?headGovLabel ?legislatureLabel WHERE { ?country wdt:P31 wd:Q6256; wdt:P298 ?iso3. OPTIONAL { ?country wdt:P122 ?govForm. ?govForm rdfs:label ?govFormLabel. FILTER(LANG(?govFormLabel)="en") } OPTIONAL { ?country wdt:P35 ?headState. ?headState rdfs:label ?headStateLabel. FILTER(LANG(?headStateLabel)="en") } OPTIONAL { ?country wdt:P6 ?headGov. ?headGov rdfs:label ?headGovLabel. FILTER(LANG(?headGovLabel)="en") } OPTIONAL { ?country wdt:P194 ?legislature. ?legislature rdfs:label ?legislatureLabel. FILTER(LANG(?legislatureLabel)="en") } }`;
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

  // Build every country
  const index: string[] = [];
  const lightweight: any[] = [];

  for (const rest of unCountries) {
    const code = rest.cca3.toUpperCase();
    const wb = (key: string) => wbMaps[key]?.get(code) || { value: null, year: null };
    const gov = govMap.get(code) || { government_forms: [], head_of_state: null, head_of_government: null, legislature: null };

    const summary = await fetchWikipediaSummary(rest.name.common);

    const area = Number(rest.area ?? 0);
    const pop = wb('population').value ?? Number(rest.population ?? 0);
    const density = area > 0 && pop > 0 ? Number((pop / area).toFixed(1)) : null;

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

      population: wb('population'),
      population_growth: wb('population_growth'),
      urban_population_percent: wb('urban_population_percent'),
      life_expectancy: wb('life_expectancy'),
      fertility_rate: wb('fertility_rate'),
      literacy_rate: wb('literacy_rate'),
      infant_mortality: wb('infant_mortality'),
      population_density_per_km2: density,

      gdp_usd: wb('gdp'),
      gdp_per_capita_usd: wb('gdp_per_capita'),
      gdp_growth_percent: wb('gdp_growth'),

      government_forms: gov.government_forms,
      head_of_state: gov.head_of_state,
      head_of_government: gov.head_of_government,
      legislature: gov.legislature,

      summary: summary.length > 600 ? summary.substring(0, 597) + '...' : summary || 'Summary unavailable.',

      edition: '2026',
      last_built: new Date().toISOString(),
      sources: [
        { label: 'REST Countries', url: 'https://restcountries.com/' },
        { label: 'World Bank', url: 'https://data.worldbank.org/' },
        { label: 'Wikidata', url: 'https://www.wikidata.org/' },
        { label: 'Wikipedia', url: 'https://en.wikipedia.org/' },
      ],
    };

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

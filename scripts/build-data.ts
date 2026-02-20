import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const countriesDir = path.join(process.cwd(), 'data', 'countries');
const outDir = path.join(process.cwd(), 'data');

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

  // People & Demographics (World Bank)
  population: Metric;
  population_growth: Metric;
  urban_population_percent: Metric;
  life_expectancy: Metric;
  fertility_rate: Metric;
  literacy_rate: Metric;
  infant_mortality: Metric;
  population_density_per_km2: number | null;

  // Economy (World Bank)
  gdp_usd: Metric;
  gdp_per_capita_usd: Metric;
  gdp_growth_percent: Metric;

  // Government (Wikidata)
  government_forms: string[];
  head_of_state: string | null;
  head_of_government: string | null;
  legislature: string | null;

  // Summary (Wikipedia)
  summary: string;

  // Metadata
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

async function fetchWorldBankMaps() {
  const maps: Record<string, Map<string, Metric>> = {};
  const years = '2020:2025';

  for (const [key, indicator] of Object.entries(WORLD_BANK_INDICATORS)) {
    const url = `https://api.worldbank.org/v2/country/all/indicator/${indicator}?date=${years}&format=json&per_page=300`;
    const res = await fetch(url);
    const [, data] = await res.json() as [any, any[]];

    const m = new Map<string, Metric>();
    for (const item of data || []) {
      if (item.value !== null && item.countryiso3code) {
        m.set(item.countryiso3code, {
          value: Number(item.value),
          year: parseInt(item.date),
        });
      }
    }
    maps[key] = m;
  }
  return maps;
}

async function fetchWikidataGovernment() {
  const sparql = `
    SELECT ?iso3 ?govFormLabel ?headStateLabel ?headGovLabel ?legislatureLabel WHERE {
      ?country wdt:P31 wd:Q6256;
               wdt:P298 ?iso3.
      OPTIONAL { ?country wdt:P122 ?govForm. ?govForm rdfs:label ?govFormLabel. FILTER(LANG(?govFormLabel)="en") }
      OPTIONAL { ?country wdt:P35 ?headState. ?headState rdfs:label ?headStateLabel. FILTER(LANG(?headStateLabel)="en") }
      OPTIONAL { ?country wdt:P6 ?headGov. ?headGov rdfs:label ?headGovLabel. FILTER(LANG(?headGovLabel)="en") }
      OPTIONAL { ?country wdt:P194 ?legislature. ?legislature rdfs:label ?legislatureLabel. FILTER(LANG(?legislatureLabel)="en") }
    }`;
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`;
  const res = await fetch(url);
  const { results } = await res.json();
  const govMap = new Map();
  for (const r of results.bindings) {
    govMap.set(r.iso3.value, {
      government_forms: r.govFormLabel ? [r.govFormLabel.value] : [],
      head_of_state: r.headStateLabel?.value || null,
      head_of_government: r.headGovLabel?.value || null,
      legislature: r.legislatureLabel?.value || null,
    });
  }
  return govMap;
}

async function fetchWikipediaSummary(name: string): Promise<string> {
  try {
    const title = name.replace(/ /g, '_').replace(/&/g, '%26');
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
    if (!res.ok) return '';
    const data = await res.json();
    return data.extract || '';
  } catch {
    return '';
  }
}

async function main() {
  await mkdir(countriesDir, { recursive: true });

  // 1. REST Countries + filter to exactly 193 UN members
  const restRes = await fetch('https://restcountries.com/v3.1/all');
  const allRest: any[] = await restRes.json();
  const unCountries = allRest.filter(c => c.unMember === true);

  // 2. Bulk data
  const wbMaps = await fetchWorldBankMaps();
  const govMap = await fetchWikidataGovernment();

  const index: string[] = [];
  const lightweight: any[] = [];

  for (const rest of unCountries) {
    const code = rest.cca3.toUpperCase();
    const wb = (key: string) => wbMaps[key]?.get(code) || { value: null, year: null };
    const gov = govMap.get(code) || { government_forms: [], head_of_state: null, head_of_government: null, legislature: null };

    const summary = await fetchWikipediaSummary(rest.name.common);

    const area = Number(rest.area ?? 0);
    const pop = Number(rest.population ?? 0);
    const density = area > 0 ? Number((pop / area).toFixed(1)) : null;

    const country: Country = {
      code,
      name_common: rest.name.common,
      name_official: rest.name.official,
      capital: Array.isArray(rest.capital) ? rest.capital[0] : rest.capital || 'N/A',
      region: rest.region,
      subregion: rest.subregion || null,
      area_km2: area || null,
      landlocked: rest.landlocked || false,
      timezones: rest.timezones || [],
      currency: Object.values(rest.currencies || {})
        .map((c: any) => `${c.name} (${c.symbol || ''})`.trim())
        .join(', ') || 'N/A',
      languages: Object.values(rest.languages || {}),
      flag_url: rest.flags.svg || rest.flags.png || '',
      flag_alt: rest.flags.alt || `Flag of ${rest.name.common}`,

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

      summary: summary.length > 600 ? summary.substring(0, 597) + '...' : summary,

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
    lightweight.push({
      code,
      name_common: country.name_common,
      flag_url: country.flag_url,
      region: country.region,
    });

    console.log(`✓ Built ${code} — ${country.name_common}`);
  }

  await writeFile(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
  await writeFile(path.join(outDir, 'all-countries.json'), JSON.stringify(lightweight, null, 2));

  console.log(`\n🎉 Successfully built ${unCountries.length} UN member states!`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

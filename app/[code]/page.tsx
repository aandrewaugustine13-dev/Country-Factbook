import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import index from '@/data/index.json';
import type { CountryProfile } from '@/src/types';
import { SectionHeader } from '@/components/SectionHeader';
import { StatRow } from '@/components/StatRow';

export function generateStaticParams() {
  return (index as string[]).map((code) => ({ code }));
}

async function getCountry(code: string): Promise<CountryProfile | null> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'countries', `${code}.json`);
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as CountryProfile;
  } catch {
    return null;
  }
}

function format(value: number | null, digits = 0) {
  if (value === null || Number.isNaN(value)) return 'Not available';
  return value.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const country = await getCountry(code.toUpperCase());
  if (!country) notFound();

  return (
    <main className="container country-page">
      <p className="back-link"><Link href="/">← Back to index</Link></p>
      <header className="country-header">
        <Image src={country.flag_url} alt={country.flag_alt} width={96} height={68} />
        <div>
          <h1>{country.name_common}</h1>
          <p>{country.name_official}</p>
        </div>
      </header>

      <div className="two-column">
        <section>
          <SectionHeader title="BASICS" />
          <dl>
            <StatRow label="Code" value={country.code} />
            <StatRow label="Region" value={`${country.region} — ${country.subregion}`} />
            <StatRow label="Capital" value={country.capital} />
            <StatRow label="Area (km²)" value={format(country.area_km2)} />
            <StatRow label="Population" value={format(country.population)} />
            <StatRow label="Density (per km²)" value={format(country.population_density_per_km2, 2)} />
          </dl>

          <SectionHeader title="PEOPLE" />
          <dl>
            <StatRow label="Languages" value={country.languages.join(', ')} />
            <StatRow label="Demonym" value={country.demonym} />
            <StatRow label="Life expectancy" value={`${format(country.life_expectancy_years, 1)} years`} />
            <StatRow label="Median age" value={`${format(country.median_age_years, 1)} years`} />
            <StatRow label="Urban population" value={`${format(country.urban_population_percent, 1)}%`} />
          </dl>
        </section>

        <section>
          <SectionHeader title="ECONOMY" />
          <dl>
            <StatRow label="Currency" value={country.currency} />
            <StatRow label="GDP (USD billions)" value={format(country.gdp_usd_billions, 1)} />
            <StatRow label="GDP per capita (USD)" value={format(country.gdp_per_capita_usd)} />
            <StatRow label="Inflation (CPI %)" value={format(country.inflation_cpi_percent, 1)} />
            <StatRow label="Unemployment (%)" value={format(country.unemployment_percent, 1)} />
          </dl>

          <SectionHeader title="GOVERNMENT" />
          <dl>
            <StatRow label="Type" value={country.government_type} />
            <StatRow label="Head of state" value={country.head_of_state} />
            <StatRow label="Head of government" value={country.head_of_government} />
            <StatRow label="Legislature" value={country.legislature} />
            <StatRow label="Internet TLD" value={country.internet_tld.join(', ')} />
            <StatRow label="Calling code" value={country.calling_code} />
            <StatRow label="Time zones" value={country.timezones.join(', ')} />
          </dl>
        </section>
      </div>

      <section>
        <SectionHeader title="SOURCES" />
        <ul className="sources">
          {country.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url}>{source.label}</a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

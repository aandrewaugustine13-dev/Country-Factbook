import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import index from '@/data/index.json';

interface Metric {
  value: number | null;
  year: number | null;
}

function formatMetric(m: Metric | number | null | undefined, digits = 0): string {
  let value = typeof m === 'number' ? m : (m?.value ?? null);
  if (value === null || Number.isNaN(value)) return '—';
  const num = value.toLocaleString(undefined, { maximumFractionDigits: digits });
  const year = typeof m === 'object' && m?.year ? ` (${m.year})` : '';
  return num + year;
}

function cleanSummary(text: string): string {
  return text
    .replace(/\\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function generateStaticParams() {
  return (index as string[]).map((code) => ({ code }));
}

async function getCountry(code: string) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'countries', `${code}.json`);
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const country = await getCountry(code.toUpperCase());
  if (!country) notFound();

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 font-serif">
      <p className="mb-8"><Link href="/" className="text-blue-600 hover:underline">← Back to all countries</Link></p>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start border-b pb-10 mb-12">
        <Image 
          src={country.flag_url} 
          alt={country.flag_alt} 
          width={180} 
          height={120} 
          className="rounded shadow-md" 
        />
        <div>
          <h1 className="text-6xl font-bold tracking-tight">{country.name_common}</h1>
          <p className="text-3xl text-gray-600 mt-2">{country.name_official}</p>
          <p className="text-xl text-gray-500 mt-4">The World Factbook • 2026 Edition</p>
        </div>
      </div>

      {/* Introduction */}
      <section className="mb-14 max-w-3xl">
        <h2 className="uppercase text-sm font-bold tracking-widest mb-4 text-gray-500">Introduction</h2>
        <p className="text-[17px] leading-relaxed text-gray-800">
          {cleanSummary(country.summary)}
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
        {/* Geography */}
        <section>
          <h2 className="uppercase text-sm font-bold tracking-widest mb-5 text-gray-500">Geography</h2>
          <dl className="space-y-4 text-[15px]">
            <div><dt className="font-medium inline">Capital</dt><dd className="ml-3 inline">{country.capital}</dd></div>
            <div><dt className="font-medium inline">Region</dt><dd className="ml-3 inline">{country.region} — {country.subregion || '—'}</dd></div>
            <div><dt className="font-medium inline">Area</dt><dd className="ml-3 inline">{formatMetric(country.area_km2)} km²</dd></div>
            <div><dt className="font-medium inline">Landlocked</dt><dd className="ml-3 inline">{country.landlocked ? 'Yes' : 'No'}</dd></div>
            <div><dt className="font-medium inline">Time zones</dt><dd className="ml-3 inline">{country.timezones.join(', ') || '—'}</dd></div>
          </dl>
        </section>

        {/* People and Society */}
        <section>
          <h2 className="uppercase text-sm font-bold tracking-widest mb-5 text-gray-500">People and Society</h2>
          <dl className="space-y-4 text-[15px]">
            <div><dt className="font-medium inline">Population</dt><dd className="ml-3 inline">{formatMetric(country.population)}</dd></div>
            <div><dt className="font-medium inline">Population density</dt><dd className="ml-3 inline">{formatMetric(country.population_density_per_km2, 1)} per km²</dd></div>
            <div><dt className="font-medium inline">Life expectancy</dt><dd className="ml-3 inline">{formatMetric(country.life_expectancy, 1)} years</dd></div>
            <div><dt className="font-medium inline">Fertility rate</dt><dd className="ml-3 inline">{formatMetric(country.fertility_rate, 2)} births per woman</dd></div>
            <div><dt className="font-medium inline">Urban population</dt><dd className="ml-3 inline">{formatMetric(country.urban_population_percent, 1)}%</dd></div>
            <div><dt className="font-medium inline">Languages</dt><dd className="ml-3 inline">{country.languages.join(', ') || '—'}</dd></div>
          </dl>
        </section>

        {/* Economy */}
        <section>
          <h2 className="uppercase text-sm font-bold tracking-widest mb-5 text-gray-500">Economy</h2>
          <dl className="space-y-4 text-[15px]">
            <div><dt className="font-medium inline">GDP (current US$)</dt><dd className="ml-3 inline">{formatMetric(country.gdp_usd)}</dd></div>
            <div><dt className="font-medium inline">GDP per capita</dt><dd className="ml-3 inline">{formatMetric(country.gdp_per_capita_usd)}</dd></div>
            <div><dt className="font-medium inline">GDP growth</dt><dd className="ml-3 inline">{formatMetric(country.gdp_growth_percent, 1)}%</dd></div>
            <div><dt className="font-medium inline">Currency</dt><dd className="ml-3 inline">{country.currency}</dd></div>
          </dl>
        </section>

        {/* Government */}
        <section>
          <h2 className="uppercase text-sm font-bold tracking-widest mb-5 text-gray-500">Government</h2>
          <dl className="space-y-4 text-[15px]">
            <div><dt className="font-medium inline">Type</dt><dd className="ml-3 inline">{country.government_forms.join(', ') || '—'}</dd></div>
            <div><dt className="font-medium inline">Head of State</dt><dd className="ml-3 inline">{country.head_of_state || '—'}</dd></div>
            <div><dt className="font-medium inline">Head of Government</dt><dd className="ml-3 inline">{country.head_of_government || '—'}</dd></div>
            <div><dt className="font-medium inline">Legislature</dt><dd className="ml-3 inline">{country.legislature || '—'}</dd></div>
          </dl>
        </section>
      </div>

      {/* Sources */}
      <section className="mt-16 pt-10 border-t text-sm text-gray-500">
        <h2 className="uppercase text-xs font-bold tracking-widest mb-4">Sources</h2>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
          {country.sources.map((s: any, i: number) => (
            <li key={i}>
              <a href={s.url} target="_blank" className="hover:underline">{s.label}</a>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs">Last built: {new Date(country.last_built).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </section>
    </main>
  );
}

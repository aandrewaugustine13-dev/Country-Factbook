import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import index from '@/data/index.json';

interface Metric { value: number | null; year: number | null; }

function formatMetric(m: Metric | number | null | undefined, digits = 0): string {
  let value = typeof m === 'number' ? m : m?.value;
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const num = value.toLocaleString(undefined, { maximumFractionDigits: digits });
  const year = typeof m === 'object' && m?.year ? ` (${m.year})` : '';
  return num + year;
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
    <main className="max-w-5xl mx-auto px-6 py-8 font-serif">
      <p className="mb-6"><Link href="/" className="text-blue-600 hover:underline">← Back to all countries</Link></p>

      {/* Header */}
      <div className="flex gap-8 items-start border-b pb-8 mb-10">
        <Image src={country.flag_url} alt={country.flag_alt} width={160} height={110} className="rounded shadow" />
        <div>
          <h1 className="text-5xl font-bold">{country.name_common}</h1>
          <p className="text-2xl text-gray-600 mt-1">{country.name_official}</p>
          <p className="text-lg mt-3 text-gray-500">The World Factbook • 2026 Edition</p>
        </div>
      </div>

      {/* Introduction */}
      <section className="mb-12">
        <h2 className="uppercase tracking-widest text-sm font-bold mb-3 text-gray-500">Introduction</h2>
        <p className="text-lg leading-relaxed max-w-3xl">{country.summary}</p>
      </section>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Geography */}
        <section>
          <h2 className="uppercase tracking-widest text-sm font-bold mb-4 text-gray-500">Geography</h2>
          <dl className="space-y-3">
            <div><dt className="inline font-medium">Capital</dt><dd className="inline ml-2">{country.capital}</dd></div>
            <div><dt className="inline font-medium">Region</dt><dd className="inline ml-2">{country.region} — {country.subregion || '—'}</dd></div>
            <div><dt className="inline font-medium">Area</dt><dd className="inline ml-2">{formatMetric(country.area_km2)} km²</dd></div>
            <div><dt className="inline font-medium">Landlocked</dt><dd className="inline ml-2">{country.landlocked ? 'Yes' : 'No'}</dd></div>
            <div><dt className="inline font-medium">Time zones</dt><dd className="inline ml-2">{country.timezones.join(', ') || '—'}</dd></div>
          </dl>
        </section>

        {/* People & Society */}
        <section>
          <h2 className="uppercase tracking-widest text-sm font-bold mb-4 text-gray-500">People and Society</h2>
          <dl className="space-y-3">
            <div><dt className="inline font-medium">Population</dt><dd className="inline ml-2">{formatMetric(country.population)}</dd></div>
            <div><dt className="inline font-medium">Population density</dt><dd className="inline ml-2">{formatMetric(country.population_density_per_km2, 1)} per km²</dd></div>
            <div><dt className="inline font-medium">Life expectancy</dt><dd className="inline ml-2">{formatMetric(country.life_expectancy, 1)} years</dd></div>
            <div><dt className="inline font-medium">Fertility rate</dt><dd className="inline ml-2">{formatMetric(country.fertility_rate, 2)} births per woman</dd></div>
            <div><dt className="inline font-medium">Urban population</dt><dd className="inline ml-2">{formatMetric(country.urban_population_percent, 1)}%</dd></div>
            <div><dt className="inline font-medium">Languages</dt><dd className="inline ml-2">{country.languages.join(', ') || '—'}</dd></div>
          </dl>
        </section>

        {/* Economy */}
        <section>
          <h2 className="uppercase tracking-widest text-sm font-bold mb-4 text-gray-500">Economy</h2>
          <dl className="space-y-3">
            <div><dt className="inline font-medium">GDP (current US$)</dt><dd className="inline ml-2">{formatMetric(country.gdp_usd)}</dd></div>
            <div><dt className="inline font-medium">GDP per capita</dt><dd className="inline ml-2">{formatMetric(country.gdp_per_capita_usd)}</dd></div>
            <div><dt className="inline font-medium">GDP growth</dt><dd className="inline ml-2">{formatMetric(country.gdp_growth_percent, 1)}%</dd></div>
            <div><dt className="inline font-medium">Currency</dt><dd className="inline ml-2">{country.currency}</dd></div>
          </dl>
        </section>

        {/* Government */}
        <section>
          <h2 className="uppercase tracking-widest text-sm font-bold mb-4 text-gray-500">Government</h2>
          <dl className="space-y-3">
            <div><dt className="inline font-medium">Type</dt><dd className="inline ml-2">{country.government_forms.join(', ') || '—'}</dd></div>
            <div><dt className="inline font-medium">Head of State</dt><dd className="inline ml-2">{country.head_of_state || '—'}</dd></div>
            <div><dt className="inline font-medium">Head of Government</dt><dd className="inline ml-2">{country.head_of_government || '—'}</dd></div>
            <div><dt className="inline font-medium">Legislature</dt><dd className="inline ml-2">{country.legislature || '—'}</dd></div>
          </dl>
        </section>
      </div>

      {/* Sources */}
      <section className="mt-16 pt-8 border-t text-sm text-gray-500">
        <h2 className="uppercase tracking-widest text-xs font-bold mb-3">Sources</h2>
        <ul className="space-y-1">
          {country.sources.map((s: any, i: number) => (
            <li key={i}><a href={s.url} target="_blank" className="hover:underline">{s.label}</a></li>
          ))}
        </ul>
        <p className="mt-6 text-xs">Last built: {new Date(country.last_built).toLocaleDateString()}</p>
      </section>
    </main>
  );
}

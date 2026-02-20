import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import index from '@/data/index.json';

function formatMetric(metric: number | { value: number | null } | null | undefined, digits = 0): string {
  let value = metric;
  if (typeof metric === 'object' && metric !== null) value = metric.value;
  if (value === null || value === undefined || Number.isNaN(value)) return 'Not available';
  return (value as number).toLocaleString(undefined, { maximumFractionDigits: digits });
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
          <h2 className="section-header">BASICS</h2>
          <dl>
            <div className="stat-row"><dt>Code</dt><dd>{country.code}</dd></div>
            <div className="stat-row"><dt>Region</dt><dd>{country.region} — {country.subregion || '—'}</dd></div>
            <div className="stat-row"><dt>Capital</dt><dd>{country.capital}</dd></div>
            <div className="stat-row"><dt>Area (km²)</dt><dd>{formatMetric(country.area_km2)}</dd></div>
            <div className="stat-row"><dt>Population</dt><dd>{formatMetric(country.population)}</dd></div>
            <div className="stat-row"><dt>Density (per km²)</dt><dd>{formatMetric(country.population_density_per_km2, 1)}</dd></div>
          </dl>

          <h2 className="section-header">PEOPLE</h2>
          <dl>
            <div className="stat-row"><dt>Languages</dt><dd>{country.languages?.join(', ') || '—'}</dd></div>
            <div className="stat-row"><dt>Currency</dt><dd>{country.currency}</dd></div>
          </dl>
        </section>

        <section>
          <h2 className="section-header">GOVERNMENT</h2>
          <dl>
            <div className="stat-row"><dt>Type</dt><dd>—</dd></div>
            <div className="stat-row"><dt>Head of State</dt><dd>—</dd></div>
            <div className="stat-row"><dt>Time zones</dt><dd>{country.timezones?.join(', ') || '—'}</dd></div>
          </dl>
        </section>
      </div>

      <section>
        <h2 className="section-header">SOURCES</h2>
        <ul className="sources">
          <li><a href="https://restcountries.com/" target="_blank">REST Countries</a></li>
        </ul>
      </section>
    </main>
  );
}

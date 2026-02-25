import Link from 'next/link';
import { notFound } from 'next/navigation';
import allCountries from '@/data/all-countries.json';
import comparisonData from '@/data/comparison-data.json';
import { PrintReportButton } from '@/components/PrintReportButton';

export function generateStaticParams() {
  return (allCountries as any[]).map((c) => ({ code: c.code }));
}

export default async function CountryReportPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const country = (allCountries as any[]).find((c) => c.code.toUpperCase() === code.toUpperCase());
  if (!country) notFound();
  const stats = (comparisonData as any[]).find((c) => c.code === country.code) || {};

  return (
    <div className="container print-report">
      <div className="print-actions">
        <Link href={`/countries/${country.code}`} className="back-link">← Back to country page</Link>
        <PrintReportButton />
      </div>

      <header className="print-header">
        <img src={country.flag_url} alt={`Flag of ${country.name_common}`} width={96} height={64} />
        <div>
          <h1>{country.name_common}</h1>
          <p>{country.name_official}</p>
        </div>
      </header>

      <section className="print-grid">
        <article>
          <h2 className="section-header">Basics</h2>
          <p><strong>Capital:</strong> {country.capital}</p>
          <p><strong>Region:</strong> {country.region}</p>
          <p><strong>Population:</strong> {stats.population?.toLocaleString('en-US') || '—'}</p>
          <p><strong>Area:</strong> {country.area_km2?.toLocaleString('en-US') || '—'} km²</p>
          <p><strong>Languages:</strong> {country.languages?.join(', ') || '—'}</p>
          <p><strong>Currency:</strong> {country.currency || '—'}</p>
        </article>

        <article>
          <h2 className="section-header">Government & Economy</h2>
          <p><strong>Government:</strong> {stats.government_type || '—'}</p>
          <p><strong>GDP (PPP):</strong> {stats.gdp_ppp ? `$${Number(stats.gdp_ppp).toLocaleString('en-US')}` : '—'}</p>
          <p><strong>GDP per capita:</strong> {stats.gdp_per_capita ? `$${Number(stats.gdp_per_capita).toLocaleString('en-US')}` : '—'}</p>
          <p><strong>Unemployment:</strong> {stats.unemployment_pct != null ? `${stats.unemployment_pct}%` : '—'}</p>
          <p><strong>Inflation:</strong> {stats.inflation_pct != null ? `${stats.inflation_pct}%` : '—'}</p>
        </article>

        <article>
          <h2 className="section-header">People & Geography</h2>
          <p><strong>Life expectancy:</strong> {stats.life_expectancy != null ? `${stats.life_expectancy} years` : '—'}</p>
          <p><strong>Median age:</strong> {stats.median_age != null ? `${stats.median_age} years` : '—'}</p>
          <p><strong>Infant mortality:</strong> {stats.infant_mortality != null ? `${stats.infant_mortality} / 1,000 births` : '—'}</p>
          <p><strong>Landlocked:</strong> {country.landlocked ? 'Yes' : 'No'}</p>
          <p><strong>Demonym:</strong> {country.demonym || '—'}</p>
        </article>
      </section>
    </div>
  );
}

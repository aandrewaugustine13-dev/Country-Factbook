import { notFound } from 'next/navigation';
import Link from 'next/link';
import allCountries from '@/data/all-countries.json';
import { CountryContent } from '@/components/CountryContent';
import { AddToCompareButton } from '@/components/AddToCompareButton';

export function generateStaticParams() {
  return allCountries.map((c) => ({ code: c.code }));
}

function getCountry(code: string) {
  return (
    allCountries.find(
      (c) => c.code.toUpperCase() === code.toUpperCase()
    ) || null
  );
}

function fmt(n: number) {
  return n ? n.toLocaleString('en-US') : '—';
}

const SECTION_ORDER = [
  'Introduction',
  'Geography',
  'People and Society',
  'Environment',
  'Government',
  'Economy',
  'Energy',
  'Communications',
  'Transportation',
  'Military and Security',
  'Space',
  'Terrorism',
  'Transnational Issues',
];

export default async function CountryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const country = getCountry(code);
  if (!country) notFound();

  const fb = (country as any).factbook as Record<
    string,
    Array<{ label: string; value: string }>
  > | null;

  const activeSections = fb
    ? SECTION_ORDER.filter((s) => fb[s] && fb[s].length > 0)
    : [];

  return (
    <div className="container">
      <Link href="/" className="back-link">
        ← Back to all countries
      </Link>

      <div className="country-header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={country.flag_url}
          alt={`Flag of ${country.name_common}`}
          width={80}
          height={56}
          style={{ borderRadius: '4px', border: '1px solid #2A4A73' }}
        />
        <div>
          <h1>{country.name_common}</h1>
          <p>{country.name_official}</p>
          <AddToCompareButton code={country.code} />
          <p><Link href={`/countries/${country.code}/report`} style={{ color: "#C7A55B" }}>Print-friendly report</Link></p>
        </div>
      </div>

      {activeSections.length > 0 && (
        <nav className="section-nav" aria-label="Page sections">
          {activeSections.map((s) => (
            <a key={s} href={`#${s.toLowerCase().replace(/\s+/g, '-')}`}>
              {s}
            </a>
          ))}
        </nav>
      )}

      {fb && activeSections.length > 0 ? (
        <CountryContent sections={fb} sectionOrder={activeSections} />
      ) : (
        /* Fallback: basic data for countries without factbook profiles */
        <div className="two-column">
          <div>
            <h2 className="section-header">INTRODUCTION</h2>
            <dl>
              <div className="stat-row"><dt>Official Name</dt><dd>{country.name_official}</dd></div>
              <div className="stat-row"><dt>Capital</dt><dd>{country.capital}</dd></div>
              <div className="stat-row"><dt>Independent</dt><dd>{country.independent ? 'Yes' : 'No'}</dd></div>
            </dl>
            <h2 className="section-header">GEOGRAPHY</h2>
            <dl>
              <div className="stat-row"><dt>Region</dt><dd>{country.region}</dd></div>
              <div className="stat-row"><dt>Subregion</dt><dd>{country.subregion}</dd></div>
              <div className="stat-row"><dt>Area</dt><dd>{country.area_km2 ? `${fmt(country.area_km2)} km²` : '—'}</dd></div>
              <div className="stat-row"><dt>Landlocked</dt><dd>{country.landlocked ? 'Yes' : 'No'}</dd></div>
            </dl>
          </div>
          <div>
            <h2 className="section-header">PEOPLE AND SOCIETY</h2>
            <dl>
              <div className="stat-row"><dt>Languages</dt><dd>{country.languages.join(', ') || '—'}</dd></div>
              <div className="stat-row"><dt>Demonym</dt><dd>{country.demonym || '—'}</dd></div>
            </dl>
            <h2 className="section-header">ECONOMY</h2>
            <dl>
              <div className="stat-row"><dt>Currency</dt><dd>{country.currency}</dd></div>
            </dl>
            <h2 className="section-header">COMMUNICATIONS</h2>
            <dl>
              <div className="stat-row"><dt>Internet TLD</dt><dd>{country.tld.join(', ') || '—'}</dd></div>
              <div className="stat-row"><dt>Calling Code</dt><dd>{country.calling_code || '—'}</dd></div>
            </dl>
          </div>
        </div>
      )}

      <footer className="country-footer">
        <p>
          Data sourced from the <a href="https://github.com/factbook/factbook.json" style={{ color: '#C7A55B' }}>CIA World Factbook open archive</a> (public domain) and{' '}
          <a href="https://github.com/mledoze/countries" style={{ color: '#C7A55B' }}>mledoze/countries</a>.
          This is an open-source reference tool, not affiliated with any government agency.
        </p>
      </footer>
    </div>
  );
}

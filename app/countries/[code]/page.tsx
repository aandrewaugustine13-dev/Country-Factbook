import { notFound } from 'next/navigation';
import Link from 'next/link';
import allCountries from '@/data/all-countries.json';
import pyramidData from '@/data/population-pyramids.json';
import { CountryContent } from '@/components/CountryContent';
import { AddToCompareButton } from '@/components/AddToCompareButton';
import { CountryMap } from '@/components/CountryMap';
import { CountryPyramidSection } from '@/components/CountryPyramidSection';
import type { CountryProfile, FactbookSections } from '@/src/types';
import type { PopulationPyramid } from '@/src/population-pyramid';

export function generateStaticParams() {
  return allCountries.map((c) => ({ code: c.code }));
}

function getCountry(code: string): CountryProfile | null {
  const found = (allCountries as CountryProfile[]).find(
    (c) => c.code.toUpperCase() === code.toUpperCase()
  );
  return found || null;
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

  const fb = country.factbook as FactbookSections | null;

  const activeSections = fb
    ? SECTION_ORDER.filter((s) => fb[s] && fb[s].length > 0)
    : [];

  const pyramid = (pyramidData as PopulationPyramid[]).find(
    (p) => p.code === country.code
  );

  return (
    <div className="container">
      <Link href="/#browse" className="back-link">
        ← Back to dashboard
      </Link>

      <div className="country-hero">
        <div className="country-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={country.flag_url}
            alt={`Flag of ${country.name_common}`}
            width={88}
            height={60}
            className="country-header-flag"
          />
          <div>
            <h1>{country.name_common}</h1>
            <p>{country.name_official}</p>
            <div className="country-header-actions">
              <span className="pill">{country.region}</span>
              {country.subregion && country.subregion !== 'Unknown' && (
                <span className="pill pill-teal">{country.subregion}</span>
              )}
              <span className="pill pill-gold">{country.code}</span>
              <AddToCompareButton code={country.code} />
            </div>
          </div>
        </div>

        <dl className="country-meta-grid">
          <div className="meta-tile">
            <dt>Capital</dt>
            <dd>{country.capital || '—'}</dd>
          </div>
          <div className="meta-tile">
            <dt>Area</dt>
            <dd>{country.area_km2 ? `${fmt(country.area_km2)} km²` : '—'}</dd>
          </div>
          <div className="meta-tile">
            <dt>Currency</dt>
            <dd>{country.currency || '—'}</dd>
          </div>
          <div className="meta-tile">
            <dt>Languages</dt>
            <dd>
              {country.languages?.length ? country.languages.slice(0, 3).join(', ') : '—'}
              {country.languages && country.languages.length > 3 ? '…' : ''}
            </dd>
          </div>
        </dl>
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

      {country.latlng && country.latlng.length === 2 && (
        <div className="map-panel">
          <h2 className="section-header">Location</h2>
          <CountryMap
            lat={country.latlng[0]}
            lng={country.latlng[1]}
            name={country.name_common}
          />
        </div>
      )}

      {pyramid && (
        <div style={{ marginBottom: '1.25rem' }}>
          <CountryPyramidSection data={pyramid} />
        </div>
      )}

      {fb && activeSections.length > 0 ? (
        <CountryContent sections={fb} sectionOrder={activeSections} />
      ) : (
        <div className="two-column">
          <div className="fallback-panel">
            <h2 className="section-header">Introduction</h2>
            <dl>
              <div className="stat-row">
                <dt>Official Name</dt>
                <dd>{country.name_official}</dd>
              </div>
              <div className="stat-row">
                <dt>Capital</dt>
                <dd>{country.capital}</dd>
              </div>
              <div className="stat-row">
                <dt>Independent</dt>
                <dd>{country.independent ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
            <h2 className="section-header">Geography</h2>
            <dl>
              <div className="stat-row">
                <dt>Region</dt>
                <dd>{country.region}</dd>
              </div>
              <div className="stat-row">
                <dt>Subregion</dt>
                <dd>{country.subregion}</dd>
              </div>
              <div className="stat-row">
                <dt>Area</dt>
                <dd>{country.area_km2 ? `${fmt(country.area_km2)} km²` : '—'}</dd>
              </div>
              <div className="stat-row">
                <dt>Landlocked</dt>
                <dd>{country.landlocked ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>
          <div className="fallback-panel">
            <h2 className="section-header">People &amp; Economy</h2>
            <dl>
              <div className="stat-row">
                <dt>Languages</dt>
                <dd>{country.languages.join(', ') || '—'}</dd>
              </div>
              <div className="stat-row">
                <dt>Demonym</dt>
                <dd>{country.demonym || '—'}</dd>
              </div>
              <div className="stat-row">
                <dt>Currency</dt>
                <dd>{country.currency}</dd>
              </div>
              <div className="stat-row">
                <dt>Internet TLD</dt>
                <dd>{country.tld.join(', ') || '—'}</dd>
              </div>
              <div className="stat-row">
                <dt>Calling Code</dt>
                <dd>{country.calling_code || '—'}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      <footer className="country-footer">
        <p>
          Data sourced from the{' '}
          <a href="https://github.com/factbook/factbook.json">CIA World Factbook open archive</a>{' '}
          (public domain) and <a href="https://github.com/mledoze/countries">mledoze/countries</a>.
          Rebuilt via <code>npm run build:data</code>. This is an open-source reference tool, not
          affiliated with any government agency.
        </p>
      </footer>
    </div>
  );
}

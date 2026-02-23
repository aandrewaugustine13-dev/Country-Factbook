import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SectionHeader } from '@/components/SectionHeader';
import { StatRow } from '@/components/StatRow';
import allCountries from '@/data/all-countries.json';

export function generateStaticParams() {
  return allCountries.map((c) => ({ code: c.code }));
}

function getCountry(code: string) {
  return allCountries.find(
    (c) => c.code.toUpperCase() === code.toUpperCase()
  ) || null;
}

function fmt(n: number) {
  return n ? n.toLocaleString('en-US') : '—';
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const country = getCountry(code);
  if (!country) notFound();

  const density =
    country.area_km2 > 0
      ? (0 / country.area_km2).toFixed(1)
      : '—';

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
        </div>
      </div>

      <div className="two-column">
        <div>
          <SectionHeader title="INTRODUCTION" />
          <dl>
            <StatRow label="Official Name" value={country.name_official} />
            <StatRow label="Capital" value={country.capital} />
            <StatRow label="Independent" value={country.independent ? 'Yes' : 'No'} />
          </dl>

          <SectionHeader title="GEOGRAPHY" />
          <dl>
            <StatRow label="Region" value={country.region} />
            <StatRow label="Subregion" value={country.subregion} />
            <StatRow label="Area" value={country.area_km2 ? `${fmt(country.area_km2)} km²` : '—'} />
            <StatRow label="Landlocked" value={country.landlocked ? 'Yes' : 'No'} />
            {country.borders.length > 0 && (
              <StatRow
                label="Borders"
                value={country.borders.join(', ')}
              />
            )}
            {country.latlng.length === 2 && (
              <StatRow
                label="Coordinates"
                value={`${country.latlng[0]}°, ${country.latlng[1]}°`}
              />
            )}
          </dl>

          <SectionHeader title="PEOPLE AND SOCIETY" />
          <dl>
            <StatRow
              label="Languages"
              value={country.languages.length > 0 ? country.languages.join(', ') : '—'}
            />
            <StatRow label="Demonym" value={country.demonym || '—'} />
          </dl>
        </div>

        <div>
          <SectionHeader title="ECONOMY" />
          <dl>
            <StatRow label="Currency" value={country.currency} />
          </dl>

          <SectionHeader title="COMMUNICATIONS" />
          <dl>
            <StatRow
              label="Internet TLD"
              value={country.tld.length > 0 ? country.tld.join(', ') : '—'}
            />
            <StatRow label="Calling Code" value={country.calling_code || '—'} />
          </dl>

          <SectionHeader title="GEOGRAPHY MAP" />
          <div className="map-embed">
            <iframe
              title={`Map of ${country.name_common}`}
              width="100%"
              height="300"
              style={{ border: '1px solid #2A4A73', borderRadius: '4px' }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                country.latlng.length === 2
                  ? `${country.latlng[1] - 10},${country.latlng[0] - 8},${country.latlng[1] + 10},${country.latlng[0] + 8}`
                  : '-180,-90,180,90'
              }&layer=mapnik`}
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <footer className="country-footer">
        <p>
          Data sourced from open public datasets. This is an open-source reference
          tool, not affiliated with any government agency.
        </p>
      </footer>
    </div>
  );
}

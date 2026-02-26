'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

interface CountryItem {
  code: string;
  name_common: string;
  flag_url: string;
  flag_emoji: string;
  region: string;
  capital: string;
}

const REGIONS = ['All Regions', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

export function HomeClient({ countries }: { countries: CountryItem[] }) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('All Regions');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    let result = countries;

    if (region !== 'All Regions') {
      result = result.filter((c) => c.region === region);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((c) =>
        `${c.name_common} ${c.code} ${c.capital || ''}`.toLowerCase().includes(q)
      );
    }

    return result;
  }, [countries, query, region]);

  return (
    <>
      {/* Search */}
      <input
        type="text"
        className="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by country, code, or capital…"
      />

      {/* Region tabs */}
      <div className="controls">
        <div className="region-tabs">
          {REGIONS.map((r) => (
            <button
              key={r}
              className={`region-tab ${region === r ? 'active' : ''}`}
              onClick={() => setRegion(r)}
            >
              {r}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="view-toggle">
          <button
            className={`view-tab ${view === 'grid' ? 'active' : ''}`}
            onClick={() => setView('grid')}
          >
            Grid
          </button>
          <button
            className={`view-tab ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            List
          </button>
        </div>
      </div>

      {/* Result count */}
      <div className="result-count">
        {filtered.length} {filtered.length === 1 ? 'country' : 'countries'} found
      </div>

      {/* Country grid / list */}
      {filtered.length === 0 ? (
        <div className="no-results">
          No countries match your search.
        </div>
      ) : (
        <ul className={`country-grid ${view === 'list' ? 'list-view' : ''}`}>
          {filtered.map((country) => (
            <li key={country.code}>
              <Link href={`/countries/${country.code}`} className="country-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={country.flag_url}
                  alt={`${country.name_common} flag`}
                  width="48"
                  height="34"
                />
                <div>
                  <h2>{country.name_common}</h2>
                  <p>
                    {country.capital !== 'N/A' && country.capital
                      ? country.capital
                      : country.region}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

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

const REGIONS = ['All Regions', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Antarctic'];

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
        `${c.name_common} ${c.code} ${c.capital}`.toLowerCase().includes(q)
      );
    }
    return result;
  }, [countries, query, region]);

  return (
    <>
      <div className="controls">
        <label htmlFor="search" className="sr-only">Search countries</label>
        <input
          id="search"
          className="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by country, code, or capital…"
        />
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
        <div className="view-toggle" role="group" aria-label="Country list view">
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

      <p className="result-count">{filtered.length} {filtered.length === 1 ? 'country' : 'countries'}</p>

      <ul className={`country-grid ${view === 'list' ? 'list-view' : ''}`} aria-label="Country list">
        {filtered.map((country) => (
          <li key={country.code}>
            <Link className="country-card" href={`/countries/${country.code}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={country.flag_url}
                alt={`Flag of ${country.name_common}`}
                width={56}
                height={40}
                loading="lazy"
              />
              <div>
                <h2>{country.name_common}</h2>
                <p>{country.capital !== 'N/A' ? country.capital : country.region}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="no-results">No countries match your search.</p>
      )}
    </>
  );
}

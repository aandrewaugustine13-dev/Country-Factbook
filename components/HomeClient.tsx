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
  landlocked: boolean;
  population: number | null;
  government_type: string | null;
}

const REGIONS = ['All Continents', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Antarctic'];
const POP_FILTERS = ['Any Population', '< 1M', '1M - 10M', '10M - 100M', '> 100M'];

export function HomeClient({ countries }: { countries: CountryItem[] }) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('All Continents');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [governmentFilter, setGovernmentFilter] = useState('All Governments');
  const [landlocked, setLandlocked] = useState('Any');
  const [popRange, setPopRange] = useState('Any Population');

  const govOptions = useMemo(() => {
    const unique = new Set(
      countries
        .map((c) => c.government_type)
        .filter(Boolean)
        .map((g) => String(g).split(';')[0].trim())
    );
    return ['All Governments', ...Array.from(unique).sort().slice(0, 40)];
  }, [countries]);

  const filtered = useMemo(() => {
    let result = countries;
    if (region !== 'All Continents') result = result.filter((c) => c.region === region);

    if (governmentFilter !== 'All Governments') {
      const qGov = governmentFilter.toLowerCase();
      result = result.filter((c) => (c.government_type || '').toLowerCase().includes(qGov));
    }

    if (landlocked !== 'Any') {
      result = result.filter((c) => (landlocked === 'Landlocked' ? c.landlocked : !c.landlocked));
    }

    if (popRange !== 'Any Population') {
      result = result.filter((c) => {
        const p = c.population ?? -1;
        if (popRange === '< 1M') return p >= 0 && p < 1_000_000;
        if (popRange === '1M - 10M') return p >= 1_000_000 && p < 10_000_000;
        if (popRange === '10M - 100M') return p >= 10_000_000 && p < 100_000_000;
        if (popRange === '> 100M') return p >= 100_000_000;
        return true;
      });
    }

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((c) =>
        `${c.name_common} ${c.code} ${c.capital} ${c.region}`.toLowerCase().includes(q)
      );
    }
    return result;
  }, [countries, query, region, governmentFilter, landlocked, popRange]);

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
        <div className="advanced-filters">
          <select className="filter-select" value={region} onChange={(e) => setRegion(e.target.value)}>
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
          <select className="filter-select" value={governmentFilter} onChange={(e) => setGovernmentFilter(e.target.value)}>
            {govOptions.map((g) => <option key={g}>{g}</option>)}
          </select>
          <select className="filter-select" value={popRange} onChange={(e) => setPopRange(e.target.value)}>
            {POP_FILTERS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select className="filter-select" value={landlocked} onChange={(e) => setLandlocked(e.target.value)}>
            <option>Any</option>
            <option>Landlocked</option>
            <option>Coastal</option>
          </select>
        </div>
        <div className="view-toggle" role="group" aria-label="Country list view">
          <button className={`view-tab ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>Grid</button>
          <button className={`view-tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List</button>
        </div>
      </div>

      <p className="result-count">{filtered.length} {filtered.length === 1 ? 'country' : 'countries'}</p>

      <ul className={`country-grid ${view === 'list' ? 'list-view' : ''}`} aria-label="Country list">
        {filtered.map((country) => (
          <li key={country.code}>
            <Link className="country-card" href={`/countries/${country.code}`}>
              <img src={country.flag_url} alt={`Flag of ${country.name_common}`} width={56} height={40} loading="lazy" />
              <div>
                <h2>{country.name_common}</h2>
                <p>{country.capital !== 'N/A' ? country.capital : country.region}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && <p className="no-results">No countries match your search.</p>}
    </>
  );
}

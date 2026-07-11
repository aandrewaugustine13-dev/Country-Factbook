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

interface HomeStats {
  total: number;
  withFactbook: number;
  withPopulation: number;
  regionCounts: Record<string, number>;
}

const REGIONS = ['All Regions', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Antarctic'];

const REGION_ORDER = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Antarctic'];

export function HomeClient({
  countries,
  stats,
}: {
  countries: CountryItem[];
  stats: HomeStats;
}) {
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

  function selectRegion(r: string) {
    setRegion(r === region ? 'All Regions' : r);
  }

  return (
    <>
      {/* Dashboard hero */}
      <section className="dash-hero" aria-label="Overview">
        <div className="dash-hero-main">
          <p className="dash-kicker">
            <span className="dash-kicker-dot" aria-hidden="true" />
            Reference Edition 2026
          </p>
          <h1>A modern atlas of nations</h1>
          <p>
            Explore authoritative country profiles, compare economies and societies side by side,
            and test your world knowledge — built for clarity, speed, and institutional confidence.
          </p>
          <div className="dash-hero-actions">
            <a href="#browse" className="btn btn-primary">
              Browse countries
            </a>
            <Link href="/compare" className="btn btn-ghost">
              Compare
            </Link>
            <Link href="/quiz" className="btn btn-ghost">
              Take the quiz
            </Link>
          </div>
        </div>

        <div className="dash-side">
          <div className="stat-card">
            <span className="stat-card-label">Countries & territories</span>
            <span className="stat-card-value">{stats.total}</span>
            <span className="stat-card-meta">{stats.withFactbook} full Factbook profiles</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Comparable metrics</span>
            <span className="stat-card-value">{stats.withPopulation}</span>
            <span className="stat-card-meta">profiles with population data</span>
          </div>
          <div className="quick-links">
            <Link href="/compare" className="quick-link">
              <span className="quick-link-icon" aria-hidden="true">
                📊
              </span>
              <span className="quick-link-title">Compare</span>
              <span className="quick-link-desc">Side-by-side stats & charts</span>
            </Link>
            <Link href="/map" className="quick-link">
              <span className="quick-link-icon" aria-hidden="true">
                🗺️
              </span>
              <span className="quick-link-title">Map</span>
              <span className="quick-link-desc">Click countries to explore</span>
            </Link>
            <Link href="/pyramids" className="quick-link">
              <span className="quick-link-icon" aria-hidden="true">
                📐
              </span>
              <span className="quick-link-title">Pyramids</span>
              <span className="quick-link-desc">Age structure comparison</span>
            </Link>
            <Link href="/quiz" className="quick-link">
              <span className="quick-link-icon" aria-hidden="true">
                🎯
              </span>
              <span className="quick-link-title">Quiz</span>
              <span className="quick-link-desc">Which country ranks higher?</span>
            </Link>
            <Link href="/daily" className="quick-link">
              <span className="quick-link-icon" aria-hidden="true">
                🌍
              </span>
              <span className="quick-link-title">Daily</span>
              <span className="quick-link-desc">Guess the country of the day</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Regional overview */}
      <div className="panel-label">
        <h2>Regions</h2>
        <span>Jump to a part of the world</span>
      </div>
      <div className="region-overview" role="group" aria-label="Filter by region">
        {REGION_ORDER.map((r) => (
          <button
            key={r}
            type="button"
            className={`region-chip-card ${region === r ? 'active' : ''}`}
            onClick={() => selectRegion(r)}
          >
            <span className="region-chip-name">{r}</span>
            <span className="region-chip-count">
              {stats.regionCounts[r] || 0}{' '}
              {(stats.regionCounts[r] || 0) === 1 ? 'entry' : 'entries'}
            </span>
          </button>
        ))}
      </div>

      {/* Browse */}
      <section id="browse" aria-label="Browse countries">
        <div className="panel-label">
          <h2>Browse countries</h2>
          <span>
            {filtered.length} of {countries.length}
          </span>
        </div>

        <div className="browse-panel">
          <div className="controls">
            <div className="search-wrap">
              <label htmlFor="search" className="sr-only">
                Search countries
              </label>
              <input
                id="search"
                className="search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by country, code, or capital…"
                autoComplete="off"
              />
            </div>

            <div className="controls-row">
              <div className="region-tabs">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`region-tab ${region === r ? 'active' : ''}`}
                    onClick={() => setRegion(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="view-toggle" role="group" aria-label="Country list view">
                <button
                  type="button"
                  className={`view-tab ${view === 'grid' ? 'active' : ''}`}
                  onClick={() => setView('grid')}
                >
                  Grid
                </button>
                <button
                  type="button"
                  className={`view-tab ${view === 'list' ? 'active' : ''}`}
                  onClick={() => setView('list')}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          <p className="result-count">
            {filtered.length} {filtered.length === 1 ? 'country' : 'countries'}
            {region !== 'All Regions' ? ` in ${region}` : ''}
            {query.trim() ? ` matching “${query.trim()}”` : ''}
          </p>

          <ul
            className={`country-grid ${view === 'list' ? 'list-view' : ''}`}
            aria-label="Country list"
          >
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
                    <div className="country-card-meta">
                      <span className="pill">{country.region}</span>
                      <span className="pill pill-gold">{country.code}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {filtered.length === 0 && (
            <p className="no-results">No countries match your search. Try another term or region.</p>
          )}
        </div>
      </section>
    </>
  );
}

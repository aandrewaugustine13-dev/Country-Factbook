'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { InstitutionalGlobe } from './InstitutionalGlobe';

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

const REGION_MARKS: Record<string, string> = {
  Africa: 'AF',
  Americas: 'AM',
  Asia: 'AS',
  Europe: 'EU',
  Oceania: 'OC',
  Antarctic: 'AN',
};

const TOOLS = [
  {
    href: '/compare',
    title: 'Compare',
    desc: 'Side-by-side metrics and charts',
    mark: '01',
  },
  {
    href: '/map',
    title: 'Map',
    desc: 'Click the world to explore',
    mark: '02',
  },
  {
    href: '/pyramids',
    title: 'Pyramids',
    desc: 'Age structure for the classroom',
    mark: '03',
  },
  {
    href: '/quiz',
    title: 'Quiz',
    desc: 'Which country ranks higher?',
    mark: '04',
  },
  {
    href: '/daily',
    title: 'Daily',
    desc: 'Guess the country of the day',
    mark: '05',
  },
] as const;

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
      {/* Hero — institutional panel */}
      <section className="home-hero" aria-label="Overview">
        <div className="home-hero-panel">
          <div className="home-hero-rule" aria-hidden="true" />

          <div className="home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-hero-kicker">
                <span className="home-hero-kicker-line" aria-hidden="true" />
                The World Factbook
                <span className="home-hero-kicker-sep" aria-hidden="true">
                  ·
                </span>
                Reference Edition 2026
              </p>

              <h1 className="home-hero-title">
                An atlas of nations
                <span className="home-hero-title-sub">for study and reference</span>
              </h1>

              <p className="home-hero-lead">
                Authoritative country profiles, clear comparisons, and classroom tools — designed
                with institutional clarity and quiet optimism.
              </p>

              <div className="home-hero-actions">
                <a href="#browse" className="btn btn-primary">
                  Browse countries
                </a>
                <Link href="/map" className="btn btn-ghost">
                  Explore the map
                </Link>
                <Link href="/compare" className="btn btn-ghost">
                  Compare
                </Link>
              </div>

              <dl className="home-hero-stats">
                <div>
                  <dt>Entries</dt>
                  <dd>{stats.total}</dd>
                </div>
                <div>
                  <dt>Full profiles</dt>
                  <dd>{stats.withFactbook}</dd>
                </div>
                <div>
                  <dt>With metrics</dt>
                  <dd>{stats.withPopulation}</dd>
                </div>
              </dl>
            </div>

            <div className="home-hero-emblem" aria-hidden="true">
              <div className="home-hero-emblem-frame">
                <InstitutionalGlobe variant="hero" className="home-hero-globe" />
                <p className="home-hero-emblem-caption">Nations of the world</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools — numbered institutional index */}
      <section className="home-tools" aria-label="Reference tools">
        <div className="home-section-head">
          <div>
            <p className="home-section-eyebrow">Index</p>
            <h2 className="home-section-title">Reference tools</h2>
          </div>
          <p className="home-section-note">Study, compare, and explore</p>
        </div>

        <ul className="home-tools-grid">
          {TOOLS.map((tool) => (
            <li key={tool.href}>
              <Link href={tool.href} className="home-tool-card">
                <span className="home-tool-mark">{tool.mark}</span>
                <span className="home-tool-title">{tool.title}</span>
                <span className="home-tool-desc">{tool.desc}</span>
                <span className="home-tool-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Regions */}
      <section className="home-regions" aria-label="Regions">
        <div className="home-section-head">
          <div>
            <p className="home-section-eyebrow">Atlas</p>
            <h2 className="home-section-title">Regions of the world</h2>
          </div>
          <p className="home-section-note">Filter the directory below</p>
        </div>

        <div className="home-region-grid" role="group" aria-label="Filter by region">
          {REGION_ORDER.map((r) => {
            const count = stats.regionCounts[r] || 0;
            const active = region === r;
            return (
              <button
                key={r}
                type="button"
                className={`home-region-card ${active ? 'active' : ''}`}
                onClick={() => selectRegion(r)}
                aria-pressed={active}
              >
                <span className="home-region-mark">{REGION_MARKS[r]}</span>
                <span className="home-region-name">{r}</span>
                <span className="home-region-count">
                  {count} {count === 1 ? 'entry' : 'entries'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Browse directory */}
      <section id="browse" className="home-browse" aria-label="Browse countries">
        <div className="home-section-head">
          <div>
            <p className="home-section-eyebrow">Directory</p>
            <h2 className="home-section-title">Browse countries</h2>
          </div>
          <span className="home-browse-count">
            {filtered.length}
            <span className="home-browse-count-total"> / {countries.length}</span>
          </span>
        </div>

        <div className="browse-panel home-browse-panel">
          <div className="controls">
            <div className="search-wrap home-search-wrap">
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

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

function ToolIcon({ name }: { name: string }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.85,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'compare':
      return (
        <svg viewBox="0 0 24 24" className="home-tool-icon" aria-hidden>
          <path {...common} d="M5 19V9M10 19V5M15 19v-7M20 19V11" />
        </svg>
      );
    case 'map':
      return (
        <svg viewBox="0 0 24 24" className="home-tool-icon" aria-hidden>
          <circle {...common} cx="12" cy="12" r="8" />
          <path {...common} d="M4 12h16M12 4c2.5 2.8 2.5 13.2 0 16M12 4c-2.5 2.8-2.5 13.2 0 16" />
        </svg>
      );
    case 'pyramids':
      return (
        <svg viewBox="0 0 24 24" className="home-tool-icon" aria-hidden>
          <path {...common} d="M3 20h8V8L7 20M13 20h8V6l-4 14" />
        </svg>
      );
    case 'quiz':
      return (
        <svg viewBox="0 0 24 24" className="home-tool-icon" aria-hidden>
          <circle {...common} cx="12" cy="12" r="8" />
          <path {...common} d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8V14" />
          <circle cx="12" cy="17" r="0.85" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'daily':
      return (
        <svg viewBox="0 0 24 24" className="home-tool-icon" aria-hidden>
          <rect {...common} x="4" y="5" width="16" height="15" rx="2" />
          <path {...common} d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );
    default:
      return null;
  }
}

/** One-word or two-word labels only — scannable tiles */
const TOOLS = [
  { href: '/map', title: 'Map', hint: 'Layers', icon: 'map', featured: true },
  { href: '/compare', title: 'Compare', hint: 'Stats', icon: 'compare', featured: true },
  { href: '/pyramids', title: 'Pyramids', hint: 'Ages', icon: 'pyramids', featured: true },
  { href: '/quiz', title: 'Quiz', hint: 'Play', icon: 'quiz', featured: false },
  { href: '/daily', title: 'Daily', hint: 'Guess', icon: 'daily', featured: false },
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
    if (typeof document !== 'undefined') {
      document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="home-hero" aria-label="Overview">
        <div className="home-hero-panel">
          <div className="home-hero-glow" aria-hidden="true" />
          <div className="home-hero-mesh" aria-hidden="true" />

          <div className="home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-hero-kicker">
                <span className="home-hero-pulse" aria-hidden="true" />
                Factbook 2026
              </p>

              <h1 className="home-hero-title">
                The world,
                <br />
                <span className="home-hero-title-accent">mapped out.</span>
              </h1>

              <p className="home-hero-lead">Explore countries. Spot patterns. Dig deeper.</p>

              <div className="home-hero-actions">
                <Link href="/map" className="btn btn-hero-primary">
                  Open the map
                </Link>
                <a href="#browse" className="btn btn-hero-secondary">
                  Browse countries
                </a>
              </div>

              <ul className="home-hero-metrics" aria-label="At a glance">
                <li>
                  <strong>{stats.total}</strong>
                  <span>countries</span>
                </li>
                <li>
                  <strong>{stats.withFactbook}</strong>
                  <span>profiles</span>
                </li>
                <li>
                  <strong>8</strong>
                  <span>map layers</span>
                </li>
              </ul>
            </div>

            <div className="home-hero-emblem" aria-hidden="true">
              <div className="home-hero-emblem-ring">
                <div className="home-hero-emblem-core">
                  <InstitutionalGlobe variant="hero" className="home-hero-globe" />
                </div>
              </div>
              <div className="home-hero-badge">Nations of the world</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools — icon-forward, almost no prose */}
      <section className="home-featured" aria-label="Tools">
        <ul className="home-featured-grid">
          {TOOLS.filter((t) => t.featured).map((tool) => (
            <li key={tool.href}>
              <Link href={tool.href} className={`home-feature-card home-feature-${tool.icon}`}>
                <span className="home-feature-icon-wrap">
                  <ToolIcon name={tool.icon} />
                </span>
                <span className="home-feature-title">{tool.title}</span>
                <span className="home-feature-hint">{tool.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="home-quick-row">
          {TOOLS.filter((t) => !t.featured).map((tool) => (
            <Link key={tool.href} href={tool.href} className="home-quick-pill">
              <ToolIcon name={tool.icon} />
              <span>{tool.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Regions */}
      <section className="home-regions" aria-label="Regions">
        <div className="home-section-head home-section-head-tight">
          <h2 className="home-section-title">Regions</h2>
          {region !== 'All Regions' && (
            <button
              type="button"
              className="home-clear-region"
              onClick={() => setRegion('All Regions')}
            >
              Show all
            </button>
          )}
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
                <span className="home-region-count">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Directory */}
      <section id="browse" className="home-browse" aria-label="Browse countries">
        <div className="home-section-head home-section-head-tight">
          <h2 className="home-section-title">Countries</h2>
          <span className="home-browse-count">
            {filtered.length}
            <span className="home-browse-count-total"> / {countries.length}</span>
          </span>
        </div>

        <div className="browse-panel home-browse-panel">
          <div className="controls home-browse-controls">
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
                placeholder="Search country, capital, or code…"
                autoComplete="off"
              />
            </div>

            <div className="controls-row">
              <div className="region-tabs" aria-label="Region filter">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`region-tab ${region === r ? 'active' : ''}`}
                    onClick={() => setRegion(r)}
                  >
                    {r === 'All Regions' ? 'All' : r}
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
                  <div className="country-card-body">
                    <h2>{country.name_common}</h2>
                    <p>
                      {country.capital !== 'N/A' ? country.capital : '—'}
                      <span className="country-card-sep">·</span>
                      {country.region}
                    </p>
                  </div>
                  <span className="country-card-code">{country.code}</span>
                </Link>
              </li>
            ))}
          </ul>

          {filtered.length === 0 && (
            <p className="no-results">No matches — try another name or region.</p>
          )}
        </div>
      </section>
    </>
  );
}

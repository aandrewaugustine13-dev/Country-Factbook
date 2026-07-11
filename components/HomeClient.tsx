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
    strokeWidth: 1.75,
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
          <path {...common} d="M4 18h7M13 18h7M5.5 15h4M14.5 15h4M7 12h1M16 12h1M7.5 9h0.5" />
          <path {...common} d="M3 20h8V8L7 20M13 20h8V6l-4 14" />
        </svg>
      );
    case 'quiz':
      return (
        <svg viewBox="0 0 24 24" className="home-tool-icon" aria-hidden>
          <circle {...common} cx="12" cy="12" r="8" />
          <path {...common} d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8V14" />
          <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
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

const TOOLS = [
  {
    href: '/map',
    title: 'Map',
    desc: 'Color the world by data',
    icon: 'map',
    featured: true,
  },
  {
    href: '/compare',
    title: 'Compare',
    desc: 'Stack countries head-to-head',
    icon: 'compare',
    featured: true,
  },
  {
    href: '/pyramids',
    title: 'Pyramids',
    desc: 'See young vs aging nations',
    icon: 'pyramids',
    featured: true,
  },
  {
    href: '/quiz',
    title: 'Quiz',
    desc: 'Higher or lower?',
    icon: 'quiz',
    featured: false,
  },
  {
    href: '/daily',
    title: 'Daily',
    desc: 'Guess the country',
    icon: 'daily',
    featured: false,
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
    if (typeof document !== 'undefined') {
      document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <>
      {/* Hero — bold, visual-first */}
      <section className="home-hero" aria-label="Overview">
        <div className="home-hero-panel">
          <div className="home-hero-glow" aria-hidden="true" />
          <div className="home-hero-orbit home-hero-orbit-a" aria-hidden="true" />
          <div className="home-hero-orbit home-hero-orbit-b" aria-hidden="true" />

          <div className="home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-hero-kicker">
                <span className="home-hero-pulse" aria-hidden="true" />
                World Factbook · 2026
              </p>

              <h1 className="home-hero-title">
                See the world
                <span className="home-hero-title-accent">clearly.</span>
              </h1>

              <p className="home-hero-lead">
                Maps, comparisons, and country stories — ready to explore.
              </p>

              <div className="home-hero-actions">
                <Link href="/map" className="btn btn-hero-primary">
                  Launch map
                </Link>
                <a href="#browse" className="btn btn-hero-secondary">
                  Find a country
                </a>
                <Link href="/quiz" className="btn btn-hero-ghost">
                  Take a quiz
                </Link>
              </div>

              <div className="home-hero-chips" aria-label="Highlights">
                <span className="home-hero-chip">
                  <strong>{stats.total}</strong> countries
                </span>
                <span className="home-hero-chip">
                  <strong>{stats.withFactbook}</strong> full profiles
                </span>
                <span className="home-hero-chip home-hero-chip-accent">
                  8 map layers
                </span>
              </div>
            </div>

            <div className="home-hero-emblem" aria-hidden="true">
              <div className="home-hero-emblem-ring">
                <div className="home-hero-emblem-core">
                  <InstitutionalGlobe variant="hero" className="home-hero-globe" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jump in — big visual cards */}
      <section className="home-featured" aria-label="Ways to explore">
        <ul className="home-featured-grid">
          {TOOLS.filter((t) => t.featured).map((tool) => (
            <li key={tool.href}>
              <Link href={tool.href} className={`home-feature-card home-feature-${tool.icon}`}>
                <span className="home-feature-icon-wrap">
                  <ToolIcon name={tool.icon} />
                </span>
                <span className="home-feature-copy">
                  <span className="home-feature-title">{tool.title}</span>
                  <span className="home-feature-desc">{tool.desc}</span>
                </span>
                <span className="home-feature-go" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="home-quick-row">
          {TOOLS.filter((t) => !t.featured).map((tool) => (
            <Link key={tool.href} href={tool.href} className="home-quick-pill">
              <ToolIcon name={tool.icon} />
              {tool.title}
              <span className="home-quick-pill-desc">{tool.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Regions */}
      <section className="home-regions" aria-label="Regions">
        <div className="home-section-head home-section-head-tight">
          <h2 className="home-section-title">Jump by region</h2>
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
          <h2 className="home-section-title">All countries</h2>
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
                placeholder="Type a country, capital, or code…"
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

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PopulationPyramid } from './PopulationPyramid';
import type { PopulationPyramid as PyramidData, PyramidShape } from '@/src/population-pyramid';
import { SHAPE_META } from '@/src/population-pyramid';

const MIN = 1;
const MAX = 4;

const DEFAULT_CODES = ['NGA', 'USA', 'JPN', 'DEU'];

const CLASSROOM_PRESETS: { name: string; codes: string[]; desc: string }[] = [
  {
    name: 'Young vs Aging',
    codes: ['NGA', 'JPN'],
    desc: 'Classic expansive vs constrictive contrast',
  },
  {
    name: 'World powers',
    codes: ['USA', 'CHN', 'IND', 'DEU'],
    desc: 'Major economies, different structures',
  },
  {
    name: 'Latin America',
    codes: ['MEX', 'BRA', 'ARG', 'COL'],
    desc: 'Regional comparison',
  },
  {
    name: 'East Asia aging',
    codes: ['JPN', 'KOR', 'CHN', 'SGP'],
    desc: 'Rapid demographic transition',
  },
  {
    name: 'Sub-Saharan Africa',
    codes: ['NGA', 'ETH', 'KEN', 'ZAF'],
    desc: 'Youthful populations',
  },
];

function parseCodesFromSearch(search: string): string[] {
  try {
    const params = new URLSearchParams(search);
    const raw = params.get('c') || params.get('codes') || '';
    return raw
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, MAX);
  } catch {
    return [];
  }
}

function writeCodesToUrl(codes: string[]) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (codes.length) url.searchParams.set('c', codes.join(','));
  else url.searchParams.delete('c');
  window.history.replaceState({}, '', url.toString());
}

export function PyramidsClient({ pyramids }: { pyramids: PyramidData[] }) {
  const byCode = useMemo(() => {
    const m = new Map<string, PyramidData>();
    for (const p of pyramids) m.set(p.code, p);
    return m;
  }, [pyramids]);

  const availableDefault = DEFAULT_CODES.filter((c) => byCode.has(c));

  const [selected, setSelected] = useState<string[]>(availableDefault.slice(0, 3));
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'percent' | 'count'>('percent');
  const [shapeFilter, setShapeFilter] = useState<PyramidShape | 'all'>('all');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const fromUrl = parseCodesFromSearch(window.location.search).filter((c) =>
      byCode.has(c)
    );
    if (fromUrl.length >= MIN) setSelected(fromUrl);
    setHydrated(true);
  }, [byCode]);

  useEffect(() => {
    if (!hydrated) return;
    writeCodesToUrl(selected);
  }, [selected, hydrated]);

  const selectedPyramids = useMemo(
    () => selected.map((c) => byCode.get(c)).filter((p): p is PyramidData => !!p),
    [selected, byCode]
  );

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pyramids
      .filter((p) => {
        if (shapeFilter !== 'all' && p.shape !== shapeFilter) return false;
        if (selected.includes(p.code)) return false;
        if (!q) return true;
        return `${p.name} ${p.code} ${p.region}`.toLowerCase().includes(q);
      })
      .slice(0, 10);
  }, [pyramids, query, selected, shapeFilter]);

  const add = useCallback(
    (code: string) => {
      setSelected((prev) => {
        if (prev.includes(code) || prev.length >= MAX) return prev;
        return [...prev, code];
      });
      setQuery('');
    },
    []
  );

  const remove = useCallback((code: string) => {
    setSelected((prev) => prev.filter((c) => c !== code));
  }, []);

  const loadPreset = useCallback(
    (codes: string[]) => {
      const next = codes.filter((c) => byCode.has(c)).slice(0, MAX);
      if (next.length >= MIN) setSelected(next);
    },
    [byCode]
  );

  const shapeCounts = useMemo(() => {
    const counts = { expansive: 0, stationary: 0, constrictive: 0 };
    for (const p of pyramids) counts[p.shape]++;
    return counts;
  }, [pyramids]);

  return (
    <div className="pyramids-root">
      <section className="pyramid-intro-card">
        <h2 className="pyramid-intro-title">How to read a population pyramid</h2>
        <div className="pyramid-intro-grid">
          {(Object.keys(SHAPE_META) as PyramidShape[]).map((key) => (
            <div key={key} className={`pyramid-intro-item pyramid-shape-${key}`}>
              <strong>{SHAPE_META[key].label}</strong>
              <p>{SHAPE_META[key].summary}</p>
              <span className="pyramid-intro-count">
                {shapeCounts[key]} countries in dataset
              </span>
            </div>
          ))}
        </div>
        <p className="pyramid-intro-note">
          Bars show <strong>male (left, blue)</strong> and <strong>female (right, rose)</strong>.
          Use <strong>% of population</strong> to compare shapes fairly across countries of
          different sizes.
        </p>
      </section>

      <section className="pyramid-controls-card">
        <div className="pyramid-controls-top">
          <div className="pyramid-search-block">
            <label htmlFor="pyramid-search" className="preset-label">
              Add a country ({selected.length}/{MAX})
            </label>
            <input
              id="pyramid-search"
              className="search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country to add…"
              disabled={selected.length >= MAX}
              autoComplete="off"
            />
            {query.trim() && options.length > 0 && (
              <div className="compare-dropdown pyramid-dropdown">
                {options.map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    className="compare-dropdown-item"
                    onClick={() => add(p.code)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.flag_url} alt="" width={22} height={14} />
                    <span>{p.name}</span>
                    <span className={`pyramid-shape-dot pyramid-shape-${p.shape}`} />
                    <span className="dropdown-region">{p.region}</span>
                  </button>
                ))}
              </div>
            )}
            {query.trim() && options.length === 0 && (
              <p className="pyramid-no-match">No matching countries with pyramid data.</p>
            )}
          </div>

          <div className="pyramid-mode-block">
            <span className="preset-label">Display</span>
            <div className="compare-view-toggle" role="group" aria-label="Value mode">
              <button
                type="button"
                className={`view-btn ${mode === 'percent' ? 'active' : ''}`}
                onClick={() => setMode('percent')}
              >
                % of population
              </button>
              <button
                type="button"
                className={`view-btn ${mode === 'count' ? 'active' : ''}`}
                onClick={() => setMode('count')}
              >
                People count
              </button>
            </div>
          </div>
        </div>

        <div className="pyramid-filter-row">
          <span className="preset-label">Filter search by shape</span>
          <div className="region-tabs">
            <button
              type="button"
              className={`region-tab ${shapeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setShapeFilter('all')}
            >
              All
            </button>
            {(Object.keys(SHAPE_META) as PyramidShape[]).map((s) => (
              <button
                key={s}
                type="button"
                className={`region-tab ${shapeFilter === s ? 'active' : ''}`}
                onClick={() => setShapeFilter(s)}
              >
                {SHAPE_META[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="preset-section pyramid-presets">
          <span className="preset-label">Classroom quick sets</span>
          <div className="compare-presets">
            {CLASSROOM_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className="preset-btn"
                title={preset.desc}
                onClick={() => loadPreset(preset.codes)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {selectedPyramids.length > 0 && (
          <div className="compare-chips pyramid-chips">
            {selectedPyramids.map((p) => (
              <span key={p.code} className="compare-chip">
                {p.flag_emoji} {p.name}
                <button
                  type="button"
                  className="chip-remove"
                  onClick={() => remove(p.code)}
                  aria-label={`Remove ${p.name}`}
                >
                  ×
                </button>
              </span>
            ))}
            {selected.length > 0 && (
              <button type="button" className="compare-clear" onClick={() => setSelected([])}>
                Clear
              </button>
            )}
          </div>
        )}
      </section>

      {selectedPyramids.length === 0 ? (
        <div className="compare-empty">
          <p>Select 1–4 countries to view population pyramids.</p>
          <p className="pyramid-empty-hint">
            Try a classroom preset above, or search for Nigeria and Japan to see a stark contrast.
          </p>
        </div>
      ) : (
        <section
          className={`pyramid-grid pyramid-grid-${Math.min(selectedPyramids.length, 4)}`}
          aria-label="Population pyramid comparison"
        >
          {selectedPyramids.map((p) => (
            <div key={p.code} className="pyramid-grid-item">
              <PopulationPyramid data={p} mode={mode} showGuide />
              <Link href={`/countries/${p.code}`} className="pyramid-profile-link">
                View full profile →
              </Link>
            </div>
          ))}
        </section>
      )}

      {selectedPyramids.length >= 2 && (
        <section className="pyramid-class-prompt">
          <h2>Class discussion</h2>
          <ol>
            <li>
              Which country has the <strong>widest base</strong> (largest share under 15)? What might
              that mean for future population growth?
            </li>
            <li>
              Which country has the <strong>largest 65+</strong> share? How could that affect
              healthcare and the workforce?
            </li>
            <li>
              Are any pyramids nearly <strong>rectangular</strong>? What does that suggest about
              birth and death rates over time?
            </li>
            <li>
              Toggle to <strong>People count</strong>. Which differences are about{' '}
              <em>shape</em> vs total <em>size</em>?
            </li>
          </ol>
        </section>
      )}

      <p className="pyramid-data-note">
        Age structure from the CIA World Factbook (3 broad bands: 0–14, 15–64, 65+).{' '}
        {pyramids.length} countries available. Data file:{' '}
        <code>data/population-pyramids.json</code>.
      </p>
    </div>
  );
}

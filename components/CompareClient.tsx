'use client';

import { useMemo, useState } from 'react';
import { CountryPicker } from './CountryPicker';
import { CompareToolbar } from './CompareToolbar';
import { CompareTable, sortableMetrics } from './CompareTable';
import { CompareBarChart, MetricScatter } from './CompareCharts';
import { CompareFilters } from './CompareFilters';
import { CompareMetricPicker } from './CompareMetricPicker';
import { CompareDataGrid } from './CompareDataGrid';
import { COMPARISON_PRESETS } from '@/src/presets';
import { MAX_COMPARE } from '@/src/compare-state';
import {
  DEFAULT_VISIBLE_METRICS,
  filterCountries,
  sortCountries,
  type MetricFilter,
} from '@/src/compare-filters';

interface CompareClientProps {
  countries: any[];
  list: string[];
  addCountry: (code: string) => void;
  removeCountry: (code: string) => void;
  clearAll: () => void;
  reorderCountry: (from: number, to: number) => void;
}

type ViewMode = 'charts' | 'grid' | 'table';

export function CompareClient({
  countries,
  list,
  addCountry,
  removeCountry,
  clearAll,
  reorderCountry,
}: CompareClientProps) {
  const [highlightDiffs, setHighlightDiffs] = useState(true);
  const [sortMetric, setSortMetric] = useState('population');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [view, setView] = useState<ViewMode>('grid');

  const [regions, setRegions] = useState<string[]>([]);
  const [filters, setFilters] = useState<MetricFilter[]>([]);
  const [metricKeys, setMetricKeys] = useState<string[]>([...DEFAULT_VISIBLE_METRICS]);

  // Clean initial filter if empty values (treat as no-op via matchesFilter)
  const activeFilters = useMemo(
    () =>
      filters.filter((f) => {
        if (f.value === '' && f.value2 === '') return false;
        return true;
      }),
    [filters]
  );

  const matchedPool = useMemo(
    () => filterCountries(countries, { regions, filters: activeFilters }),
    [countries, regions, activeFilters]
  );

  const selected = useMemo(
    () => list.map((code) => countries.find((c) => c.code === code)).filter(Boolean) as any[],
    [countries, list]
  );

  const orderedSelected = useMemo(
    () => sortCountries(selected, sortMetric, sortDir),
    [selected, sortMetric, sortDir]
  );

  function loadPreset(codes: string[]) {
    clearAll();
    setTimeout(() => {
      codes.slice(0, MAX_COMPARE).forEach((code) => addCountry(code));
    }, 10);
  }

  function addMatching() {
    const remaining = MAX_COMPARE - list.length;
    if (remaining <= 0) return;
    const toAdd = matchedPool
      .map((c) => c.code as string)
      .filter((code) => !list.includes(code))
      .slice(0, remaining);
    toAdd.forEach((code) => addCountry(code));
  }

  function handleSort(key: string) {
    if (sortMetric === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortMetric(key);
      setSortDir('desc');
    }
  }

  const pickerCountries = useMemo(
    () =>
      countries.map((c) => ({
        code: c.code,
        name: c.name || c.name_common,
        flag_url: c.flag_url,
        region: c.region,
      })),
    [countries]
  );

  return (
    <div className="compare-root compare-research-root">
      <div className="compare-research-layout">
        <aside className="compare-sidebar">
          <CompareFilters
            regions={regions}
            onRegionsChange={setRegions}
            filters={filters}
            onFiltersChange={setFilters}
            matchCount={matchedPool.length}
            selectedCount={list.length}
            maxSelect={MAX_COMPARE}
            onAddMatching={addMatching}
          />
          <CompareMetricPicker selectedKeys={metricKeys} onChange={setMetricKeys} />
        </aside>

        <div className="compare-main">
          <div className="compare-add-row">
            <CountryPicker
              countries={pickerCountries}
              selected={list}
              onAdd={addCountry}
            />
            <p className="compare-limit-note">
              {list.length}/{MAX_COMPARE} selected
              {activeFilters.length > 0 || regions.length > 0
                ? ` · ${matchedPool.length} match filters`
                : ''}
            </p>
          </div>

          <div className="preset-section">
            <span className="preset-label">Quick sets</span>
            <div className="compare-presets">
              {COMPARISON_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className="preset-btn"
                  onClick={() => loadPreset(preset.codes)}
                  title={preset.desc}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <CompareToolbar
            selected={orderedSelected as any}
            onRemove={removeCountry}
            onMove={reorderCountry}
            onClear={clearAll}
          />

          {selected.length > 0 ? (
            <>
              <div className="compare-controls">
                <div className="compare-view-toggle" role="group" aria-label="View mode">
                  <button
                    type="button"
                    className={`view-btn ${view === 'grid' ? 'active' : ''}`}
                    onClick={() => setView('grid')}
                  >
                    Data grid
                  </button>
                  <button
                    type="button"
                    className={`view-btn ${view === 'charts' ? 'active' : ''}`}
                    onClick={() => setView('charts')}
                  >
                    Charts
                  </button>
                  <button
                    type="button"
                    className={`view-btn ${view === 'table' ? 'active' : ''}`}
                    onClick={() => setView('table')}
                  >
                    Full table
                  </button>
                </div>

                <div className="compare-sort-controls">
                  <label>
                    Sort{' '}
                    <select
                      value={sortMetric}
                      onChange={(e) => setSortMetric(e.target.value)}
                      className="sort-select"
                    >
                      {sortableMetrics.map((m) => (
                        <option key={m.key} value={m.key}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="view-btn"
                    onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
                  </button>
                  {(view === 'grid' || view === 'table') && (
                    <label className="compare-highlight-label">
                      <input
                        type="checkbox"
                        checked={highlightDiffs}
                        onChange={(e) => setHighlightDiffs(e.target.checked)}
                      />{' '}
                      Highlight min/max
                    </label>
                  )}
                </div>
              </div>

              {view === 'grid' && (
                <CompareDataGrid
                  countries={orderedSelected}
                  metricKeys={metricKeys}
                  sortMetric={sortMetric}
                  sortDir={sortDir}
                  onSort={handleSort}
                  highlightExtremes={highlightDiffs}
                />
              )}

              {view === 'charts' && (
                <div className="compare-charts-grid">
                  <CompareBarChart countries={orderedSelected} />
                  <MetricScatter countries={orderedSelected} />
                </div>
              )}

              {view === 'table' && (
                <CompareTable
                  countries={orderedSelected}
                  highlightDiffs={highlightDiffs}
                  sortMetric={sortMetric}
                  sortDir={sortDir}
                  visibleMetricKeys={metricKeys}
                />
              )}
            </>
          ) : (
            <div className="compare-empty">
              <p>Search for countries, use filters + “Add matching”, or load a quick set.</p>
              <p className="compare-empty-hint">
                Example: region Asia + urbanization ≥ 70, then add matches to the selection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { CountryPicker } from './CountryPicker';
import { CompareToolbar } from './CompareToolbar';
import { CompareTable, sortableMetrics } from './CompareTable';
import { CompareBarChart, WealthHealthScatter } from './CompareCharts';
import { COMPARISON_PRESETS } from '@/src/presets';

interface CompareClientProps {
  countries: any[];
  list: string[];
  addCountry: (code: string) => void;
  removeCountry: (code: string) => void;
  clearAll: () => void;
  reorderCountry: (from: number, to: number) => void;
}

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
  const [view, setView] = useState<'charts' | 'table'>('charts');

  const selected = useMemo(
    () => list.map((code) => countries.find((c) => c.code === code)).filter(Boolean),
    [countries, list]
  );

  function loadPreset(codes: string[]) {
    clearAll();
    // Slight delay so clearAll processes first
    setTimeout(() => {
      codes.forEach((code) => addCountry(code));
    }, 10);
  }

  return (
    <div className="compare-root">
      <CountryPicker countries={countries} selected={list} onAdd={addCountry} />

      {/* Preset Quick-Load Buttons */}
      <div className="preset-section">
        <span className="preset-label">Quick Sets:</span>
        <div className="compare-presets">
          {COMPARISON_PRESETS.map((preset) => (
            <button
              key={preset.name}
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
        selected={selected as any}
        onRemove={removeCountry}
        onMove={reorderCountry}
        onClear={clearAll}
      />

      {selected.length > 0 && (
        <>
          {/* View Toggle + Sort Controls */}
          <div className="compare-controls">
            <div className="compare-view-toggle">
              <button
                className={`view-btn ${view === 'charts' ? 'active' : ''}`}
                onClick={() => setView('charts')}
              >
                📊 Charts
              </button>
              <button
                className={`view-btn ${view === 'table' ? 'active' : ''}`}
                onClick={() => setView('table')}
              >
                📋 Table
              </button>
            </div>

            {view === 'table' && (
              <div className="compare-sort-controls">
                <label>
                  <input
                    type="checkbox"
                    checked={highlightDiffs}
                    onChange={(e) => setHighlightDiffs(e.target.checked)}
                  />{' '}
                  Highlight differences
                </label>
                <label>
                  Sort by{' '}
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
                  className="view-btn"
                  onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                >
                  {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
                </button>
              </div>
            )}
          </div>

          {/* Chart View */}
          {view === 'charts' && (
            <div className="compare-charts-grid">
              <CompareBarChart countries={selected} />
              <WealthHealthScatter countries={selected} />
            </div>
          )}

          {/* Table View (always render for printing, hide visually if charts active) */}
          <div className={view === 'charts' ? 'table-below-charts' : ''}>
            {view === 'charts' && <h3 className="table-section-title">Full Data Table</h3>}
            <CompareTable
              countries={selected}
              highlightDiffs={highlightDiffs}
              sortMetric={sortMetric}
              sortDir={sortDir}
            />
          </div>
        </>
      )}

      {selected.length === 0 && (
        <div className="compare-empty">
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌍</p>
          <p>Add countries above or pick a Quick Set to start comparing.</p>
        </div>
      )}
    </div>
  );
}

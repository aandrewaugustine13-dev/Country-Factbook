'use client';

import { useMemo, useState } from 'react';
import { CountryPicker } from './CountryPicker';
import { CompareToolbar } from './CompareToolbar';
import { CompareTable, sortableMetrics } from './CompareTable';

interface CompareClientProps {
  countries: any[];
  list?: string[];
  addCountry?: (code: string) => void;
  removeCountry?: (code: string) => void;
  clearAll?: () => void;
  reorderCountry?: (from: number, to: number) => void;
}

export function CompareClient({
  countries,
  list = [],
  addCountry = () => {},
  removeCountry = () => {},
  clearAll = () => {},
  reorderCountry = () => {},
}: CompareClientProps) {
  const [highlightDiffs, setHighlightDiffs] = useState(true);
  const [sortMetric, setSortMetric] = useState('population');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const selected = useMemo(
    () => list.map((code) => countries.find((c) => c.code === code)).filter(Boolean),
    [countries, list]
  );

  return (
    <div className="compare-root">
      <CountryPicker countries={countries} selected={list} onAdd={addCountry} />
      <CompareToolbar selected={selected as any} onRemove={removeCountry} onMove={reorderCountry} onClear={clearAll} />

      <div className="compare-view-toggle" style={{ marginBottom: '0.75rem' }}>
        <label>
          <input type="checkbox" checked={highlightDiffs} onChange={(e) => setHighlightDiffs(e.target.checked)} /> Highlight differences
        </label>
        <label style={{ marginLeft: '1rem' }}>
          Sort by{' '}
          <select value={sortMetric} onChange={(e) => setSortMetric(e.target.value)}>
            {sortableMetrics.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </label>
        <button className="view-btn" onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')} style={{ marginLeft: '0.5rem' }}>
          {sortDir === 'asc' ? 'Asc' : 'Desc'}
        </button>
      </div>

      {selected.length === 0 ? (
        <p className="compare-empty">Add countries to start comparing.</p>
      ) : (
        <CompareTable countries={selected} highlightDiffs={highlightDiffs} sortMetric={sortMetric} sortDir={sortDir} />
      )}
    </div>
  );
}

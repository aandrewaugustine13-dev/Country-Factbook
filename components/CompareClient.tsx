'use client';

import { useMemo, useState } from 'react';
import { CountryPicker } from './CountryPicker';
import { CompareToolbar } from './CompareToolbar';
import { CompareTable, sortableMetrics } from './CompareTable';
import { CompareBarChart, WealthHealthScatter } from './CompareCharts';
import { COMPARISON_PRESETS } from '@/src/presets';

interface CompareClientProps {
  countries: any[];
}

export function CompareClient({ countries }: CompareClientProps) {
  const [list, setList] = useState<string[]>([]);
  const [highlightDiffs, setHighlightDiffs] = useState(true);
  const [sortMetric, setSortMetric] = useState('population');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [view, setView] = useState<'charts' | 'table'>('charts');

  const addCountry = (code: string) => {
    if (list.length >= 10) return;
    if (!list.includes(code)) {
      setList([...list, code]);
    }
  };

  const removeCountry = (code: string) => {
    setList(list.filter((c) => c !== code));
  };

  const clearAll = () => setList([]);

  const reorderCountry = (from: number, to: number) => {
    const newList = [...list];
    const [moved] = newList.splice(from, 1);
    newList.splice(to, 0, moved);
    setList(newList);
  };

  const selected = useMemo(
    () => list.map((code) => countries.find((c) => c.code === code)).filter(Boolean),
    [countries, list]
  );

  function loadPreset(codes: string[]) {
    clearAll();
    setTimeout(() => {
      codes.forEach((code) => addCountry(code));
    }, 10);
  }

  return (
    <>
      {/* Preset Quick-Load Buttons */}
      <div>
        <strong>Quick Sets:</strong>
        {COMPARISON_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => loadPreset(preset.codes)}
            title={preset.desc}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <>
          {/* View Toggle + Sort Controls */}
          <div>
            <button onClick={() => setView('charts')}>Charts</button>
            <button onClick={() => setView('table')}>Table</button>

            {view === 'table' && (
              <button onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
                {sortDir === 'asc' ? 'Asc' : 'Desc'}
              </button>
            )}
          </div>

          {/* Chart View */}
          {view === 'charts' && (
            <>
              <CompareBarChart countries={selected} />
              <WealthHealthScatter countries={selected} />
            </>
          )}

          {/* Table View (always render for printing, hide visually if charts active) */}
          <div className={view === 'charts' ? 'hidden print:block' : ''}>
            <CompareTable
              countries={selected}
              highlightDiffs={highlightDiffs}
              sortMetric={sortMetric}
              sortDir={sortDir}
              onSort={setSortMetric}
              onSortDir={setSortDir}
            />
          </div>
        </>
      )}

      {selected.length === 0 && (
        <p>
          <strong>No countries selected.</strong> Add countries above or pick a Quick Set to start
          comparing.
        </p>
      )}
    </>
  );
}

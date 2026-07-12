'use client';

import { NUMERIC_METRICS, type MetricFilter, type FilterOp } from '@/src/compare-filters';

const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Antarctic'];

export function CompareFilters({
  regions,
  onRegionsChange,
  filters,
  onFiltersChange,
  matchCount,
  selectedCount,
  maxSelect,
  onAddMatching,
}: {
  regions: string[];
  onRegionsChange: (regions: string[]) => void;
  filters: MetricFilter[];
  onFiltersChange: (filters: MetricFilter[]) => void;
  matchCount: number;
  selectedCount: number;
  maxSelect: number;
  onAddMatching: () => void;
}) {
  function toggleRegion(r: string) {
    if (regions.includes(r)) onRegionsChange(regions.filter((x) => x !== r));
    else onRegionsChange([...regions, r]);
  }

  function updateFilter(id: string, patch: Partial<MetricFilter>) {
    onFiltersChange(filters.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function removeFilter(id: string) {
    onFiltersChange(filters.filter((f) => f.id !== id));
  }

  const remaining = Math.max(0, maxSelect - selectedCount);

  return (
    <div className="compare-research-panel">
      <div className="compare-research-head">
        <h2 className="compare-research-title">Filters</h2>
        <span className="compare-research-meta">
          {matchCount} match{matchCount === 1 ? '' : 'es'}
        </span>
      </div>

      <div className="compare-filter-block">
        <span className="preset-label">Region</span>
        <div className="compare-region-chips">
          {REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              className={`region-tab ${regions.includes(r) ? 'active' : ''}`}
              onClick={() => toggleRegion(r)}
            >
              {r}
            </button>
          ))}
          {regions.length > 0 && (
            <button type="button" className="compare-clear" onClick={() => onRegionsChange([])}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="compare-filter-block">
        <div className="compare-filter-block-head">
          <span className="preset-label">Metric filters</span>
          <button
            type="button"
            className="preset-btn"
            onClick={() =>
              onFiltersChange([
                ...filters,
                {
                  id: `f_${Math.random().toString(36).slice(2, 9)}`,
                  metricKey: 'urbanization_pct',
                  op: 'gte',
                  value: 70,
                  value2: '',
                },
              ])
            }
            disabled={filters.length >= 4}
          >
            + Filter
          </button>
        </div>

        {filters.length === 0 && (
          <p className="compare-filter-empty">No metric filters — all values included.</p>
        )}

        <div className="compare-filter-rows">
          {filters.map((f) => (
            <div key={f.id} className="compare-filter-row">
              <select
                className="sort-select"
                value={f.metricKey}
                onChange={(e) => updateFilter(f.id, { metricKey: e.target.value })}
                aria-label="Metric"
              >
                {NUMERIC_METRICS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                className="sort-select"
                value={f.op}
                onChange={(e) => updateFilter(f.id, { op: e.target.value as FilterOp })}
                aria-label="Operator"
              >
                <option value="gte">≥</option>
                <option value="lte">≤</option>
                <option value="between">between</option>
              </select>
              <input
                type="number"
                className="compare-filter-input"
                value={f.value}
                onChange={(e) =>
                  updateFilter(f.id, {
                    value: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                placeholder="value"
                aria-label="Value"
              />
              {f.op === 'between' && (
                <input
                  type="number"
                  className="compare-filter-input"
                  value={f.value2}
                  onChange={(e) =>
                    updateFilter(f.id, {
                      value2: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  placeholder="max"
                  aria-label="Max value"
                />
              )}
              <button
                type="button"
                className="chip-remove"
                onClick={() => removeFilter(f.id)}
                aria-label="Remove filter"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="compare-filter-actions">
        <button
          type="button"
          className="btn btn-sky"
          onClick={onAddMatching}
          disabled={matchCount === 0 || remaining === 0}
          title={
            remaining === 0
              ? `Selection full (${maxSelect} max)`
              : `Add up to ${remaining} matching countries`
          }
        >
          Add matching ({Math.min(matchCount, remaining)})
        </button>
      </div>
    </div>
  );
}

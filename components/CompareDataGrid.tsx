'use client';

import { METRICS, formatMetricValue, type MetricDef } from '@/src/glossary';

type Country = Record<string, any>;

/**
 * Spreadsheet-style grid: countries as rows, selected metrics as columns.
 * Better for multi-metric research than the field-first CompareTable.
 */
export function CompareDataGrid({
  countries,
  metricKeys,
  sortMetric,
  sortDir,
  onSort,
  highlightExtremes = true,
}: {
  countries: Country[];
  metricKeys: string[];
  sortMetric: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  highlightExtremes?: boolean;
}) {
  const cols = metricKeys
    .map((k) => METRICS.find((m) => m.key === k))
    .filter((m): m is MetricDef => !!m);

  const extremes = new Map<string, { min: number | null; max: number | null }>();
  if (highlightExtremes) {
    for (const col of cols) {
      if (!col.numeric) continue;
      const nums = countries
        .map((c) => col.getValue(c))
        .filter((v): v is number => typeof v === 'number');
      extremes.set(col.key, {
        min: nums.length ? Math.min(...nums) : null,
        max: nums.length ? Math.max(...nums) : null,
      });
    }
  }

  if (countries.length === 0) {
    return <p className="no-chart-data">No countries in the current selection.</p>;
  }

  return (
    <div className="compare-table-wrap compare-grid-wrap">
      <table className="compare-table compare-data-grid">
        <thead>
          <tr>
            <th className="compare-metric-col sticky-left">Country</th>
            {cols.map((col) => {
              const active = sortMetric === col.key;
              return (
                <th key={col.key}>
                  {col.numeric ? (
                    <button
                      type="button"
                      className={`compare-sort-th ${active ? 'active' : ''}`}
                      onClick={() => onSort(col.key)}
                      title={`Sort by ${col.label}`}
                    >
                      {col.label}
                      {active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </button>
                  ) : (
                    col.label
                  )}
                  {col.unit ? <span className="metric-unit">{col.unit}</span> : null}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {countries.map((c) => (
            <tr key={c.code}>
              <td className="compare-metric-col sticky-left compare-country-cell">
                <span className="compare-country-flag">{c.flag_emoji}</span>
                {c.name || c.name_common}
              </td>
              {cols.map((col) => {
                const val = col.getValue(c);
                const ext = extremes.get(col.key);
                const isMax =
                  highlightExtremes &&
                  col.numeric &&
                  typeof val === 'number' &&
                  ext?.max != null &&
                  ext.min != null &&
                  ext.max !== ext.min &&
                  val === ext.max;
                const isMin =
                  highlightExtremes &&
                  col.numeric &&
                  typeof val === 'number' &&
                  ext?.max != null &&
                  ext.min != null &&
                  ext.max !== ext.min &&
                  val === ext.min;
                const display = col.numeric
                  ? formatMetricValue(val, col.format)
                  : val == null || val === ''
                    ? '—'
                    : String(val);

                return (
                  <td
                    key={col.key}
                    className={`${isMax ? 'val-high' : ''} ${isMin ? 'val-low' : ''}`}
                    title={display === '—' ? 'Not available' : undefined}
                  >
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

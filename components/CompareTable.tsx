'use client';

import React from 'react';
import { METRICS, formatMetricValue } from '@/src/glossary';
import { GlossaryTip } from './GlossaryTip';

type Country = Record<string, any>;

const TABLE_METRICS = METRICS.filter(m => m.key !== 'gdp_growth_pct');

function format(v: any) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'number') return v.toLocaleString('en-US');
  return String(v);
}

export function CompareTable({
  countries,
  highlightDiffs,
  sortMetric,
  sortDir,
}: {
  countries: Country[];
  highlightDiffs: boolean;
  sortMetric: string;
  sortDir: 'asc' | 'desc';
}) {
  const sortRow = TABLE_METRICS.find((r) => r.key === sortMetric && r.numeric);
  const ordered = [...countries].sort((a, b) => {
    if (!sortRow) return 0;
    const av = Number(sortRow.getValue(a) ?? Number.NEGATIVE_INFINITY);
    const bv = Number(sortRow.getValue(b) ?? Number.NEGATIVE_INFINITY);
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const sections = [...new Set(TABLE_METRICS.map((r) => r.section))];

  return (
    <div className="compare-table-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th className="compare-metric-col sticky-left">Field</th>
            {ordered.map((c) => (
              <th key={c.code}>{c.flag_emoji} {c.name || c.name_common}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sections.map((s) => (
            <React.Fragment key={s}>
              <tr className="group-header">
                <td colSpan={ordered.length + 1}>{s}</td>
              </tr>
              {TABLE_METRICS.filter((r) => r.section === s).map((r) => {
                const rawVals = ordered.map((c) => r.getValue(c));
                const numericVals = rawVals.map(v => (typeof v === 'number' ? v : null));
                const validNums = numericVals.filter((v): v is number => v !== null);
                const maxVal = validNums.length > 0 ? Math.max(...validNums) : null;
                const minVal = validNums.length > 0 ? Math.min(...validNums) : null;

                return (
                  <tr key={r.key}>
                    <td className="compare-metric-col sticky-left">
                      {r.label}
                      {r.tip && <> <GlossaryTip text={r.tip} /></>}
                      {r.unit && <span className="metric-unit">{r.unit}</span>}
                    </td>
                    {ordered.map((c) => {
                      const val = r.getValue(c);
                      const displayVal = format(val);
                      const isMax = r.numeric && val != null && val === maxVal && validNums.length > 1 && maxVal !== minVal;
                      const isMin = r.numeric && val != null && val === minVal && validNums.length > 1 && maxVal !== minVal;

                      return (
                        <td
                          key={c.code}
                          className={`${isMax ? 'val-high' : ''} ${isMin ? 'val-low' : ''}`}
                          title={displayVal === '—' ? 'Not available' : undefined}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const sortableMetrics = TABLE_METRICS.filter((r) => r.numeric).map((r) => ({ key: r.key, label: r.label }));

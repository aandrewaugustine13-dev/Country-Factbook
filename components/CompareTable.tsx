'use client';

import React from 'react';

type Country = Record<string, any>;

type Row = { section: string; key: string; label: string; source: 'CIA' | 'mledoze'; tooltip?: string; numeric?: boolean; getValue: (c: Country) => string | number | null | undefined; };

const rows: Row[] = [
  { section: 'Basics', key: 'capital', label: 'Capital', source: 'mledoze', getValue: c => c.capital },
  { section: 'Basics', key: 'region', label: 'Region', source: 'mledoze', getValue: c => c.region },
  { section: 'Basics', key: 'population', label: 'Population', source: 'CIA', numeric: true, getValue: c => c.population },
  { section: 'Basics', key: 'area_km2', label: 'Area (km²)', source: 'mledoze', numeric: true, getValue: c => c.area_km2 },
  { section: 'Basics', key: 'languages', label: 'Languages', source: 'mledoze', getValue: c => c.languages_detail || c.languages?.join(', ') },
  { section: 'Basics', key: 'currency', label: 'Currency', source: 'mledoze', getValue: c => c.currency },
  { section: 'Government', key: 'government_type', label: 'Government type', source: 'CIA', getValue: c => c.government_type },
  { section: 'Economy', key: 'gdp_ppp', label: 'GDP (PPP)', source: 'CIA', tooltip: 'Total output adjusted for purchasing power parity.', numeric: true, getValue: c => c.gdp_ppp },
  { section: 'Economy', key: 'gdp_per_capita', label: 'GDP per capita', source: 'CIA', numeric: true, getValue: c => c.gdp_per_capita },
  { section: 'Economy', key: 'inflation_pct', label: 'Inflation (%)', source: 'CIA', numeric: true, getValue: c => c.inflation_pct },
  { section: 'Economy', key: 'unemployment_pct', label: 'Unemployment (%)', source: 'CIA', numeric: true, getValue: c => c.unemployment_pct },
  { section: 'People', key: 'life_expectancy', label: 'Life expectancy', source: 'CIA', numeric: true, getValue: c => c.life_expectancy },
  { section: 'People', key: 'infant_mortality', label: 'Infant mortality', source: 'CIA', tooltip: 'Deaths of infants under 1 year per 1,000 live births.', numeric: true, getValue: c => c.infant_mortality },
  { section: 'People', key: 'median_age', label: 'Median age', source: 'CIA', numeric: true, getValue: c => c.median_age },
  { section: 'Geography/Environment', key: 'climate', label: 'Climate', source: 'CIA', getValue: c => c.climate },
  { section: 'Geography/Environment', key: 'terrain', label: 'Terrain', source: 'CIA', getValue: c => c.terrain },
  { section: 'Geography/Environment', key: 'natural_resources', label: 'Natural resources', source: 'CIA', getValue: c => c.natural_resources },
];

function format(v: any) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'number') return v.toLocaleString('en-US');
  return String(v);
}

export function CompareTable({ countries, highlightDiffs, sortMetric, sortDir }: { countries: Country[]; highlightDiffs: boolean; sortMetric: string; sortDir: 'asc' | 'desc'; }) {
  const sortRow = rows.find((r) => r.key === sortMetric && r.numeric);
  const ordered = [...countries].sort((a, b) => {
    if (!sortRow) return 0;
    const av = Number(sortRow.getValue(a) ?? Number.NEGATIVE_INFINITY);
    const bv = Number(sortRow.getValue(b) ?? Number.NEGATIVE_INFINITY);
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const sections = [...new Set(rows.map((r) => r.section))];

  return (
    <div className="compare-table-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th className="compare-metric-col sticky-left">Field</th>
            {ordered.map((c) => <th key={c.code}>{c.flag_emoji} {c.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {sections.map((s) => (
            <React.Fragment key={s}>
              <tr key={s} className="group-header"><td colSpan={ordered.length + 1}>{s}</td></tr>
              {rows.filter((r) => r.section === s).map((r) => {
                const vals = ordered.map((c) => format(r.getValue(c)));
                const differs = new Set(vals).size > 1;
                return (
                  <tr key={r.key}>
                    <td className="compare-metric-col sticky-left" title={r.tooltip}>{r.label} <span className="metric-unit">{r.source}</span></td>
                    {ordered.map((c, i) => {
                      const val = format(r.getValue(c));
                      return <td key={c.code} className={highlightDiffs && differs ? 'val-high' : ''} title={val === '—' ? 'Not available' : undefined}>{val}</td>;
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

export const sortableMetrics = rows.filter((r) => r.numeric).map((r) => ({ key: r.key, label: r.label }));

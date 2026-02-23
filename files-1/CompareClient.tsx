'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';

interface CountryData {
  code: string;
  name: string;
  flag_url: string;
  flag_emoji: string;
  region: string;
  area_km2: number | null;
  capital: string;
  independent: boolean;
  population: number | null;
  life_expectancy: number | null;
  median_age: number | null;
  pop_growth_pct: number | null;
  birth_rate: number | null;
  death_rate: number | null;
  infant_mortality: number | null;
  fertility_rate: number | null;
  urbanization_pct: number | null;
  gdp_ppp: number | null;
  gdp_per_capita: number | null;
  gdp_growth_pct: number | null;
  unemployment_pct: number | null;
  inflation_pct: number | null;
  public_debt_pct: number | null;
  internet_pct: number | null;
  military_pct_gdp: number | null;
  edu_spend_pct_gdp: number | null;
  government_type: string | null;
  religions: string | null;
  ethnic_groups: string | null;
  languages_detail: string | null;
}

interface MetricDef {
  key: keyof CountryData;
  label: string;
  unit: string;
  format: (v: number) => string;
  group: string;
}

const COLORS = [
  '#C7A55B', '#5B9EC7', '#C75B5B', '#5BC78A', '#9B5BC7',
  '#C7985B', '#5BC7C7', '#C75B9B', '#7BC75B', '#5B6EC7',
];

function fmtNum(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return n.toLocaleString('en-US');
  return n.toString();
}

function fmtPop(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toString();
}

const METRICS: MetricDef[] = [
  // People & Society
  { key: 'population', label: 'Population', unit: '', format: fmtPop, group: 'People & Society' },
  { key: 'life_expectancy', label: 'Life Expectancy', unit: ' yrs', format: v => v.toFixed(1), group: 'People & Society' },
  { key: 'median_age', label: 'Median Age', unit: ' yrs', format: v => v.toFixed(1), group: 'People & Society' },
  { key: 'pop_growth_pct', label: 'Pop. Growth Rate', unit: '%', format: v => v.toFixed(2), group: 'People & Society' },
  { key: 'birth_rate', label: 'Birth Rate', unit: '/1K', format: v => v.toFixed(1), group: 'People & Society' },
  { key: 'death_rate', label: 'Death Rate', unit: '/1K', format: v => v.toFixed(1), group: 'People & Society' },
  { key: 'infant_mortality', label: 'Infant Mortality', unit: '/1K', format: v => v.toFixed(1), group: 'People & Society' },
  { key: 'fertility_rate', label: 'Fertility Rate', unit: '', format: v => v.toFixed(2), group: 'People & Society' },
  { key: 'urbanization_pct', label: 'Urbanization', unit: '%', format: v => v.toFixed(1), group: 'People & Society' },
  // Economy
  { key: 'gdp_ppp', label: 'GDP (PPP)', unit: '', format: fmtNum, group: 'Economy' },
  { key: 'gdp_per_capita', label: 'GDP per Capita', unit: '', format: v => `$${v.toLocaleString('en-US')}`, group: 'Economy' },
  { key: 'gdp_growth_pct', label: 'GDP Growth', unit: '%', format: v => v.toFixed(1), group: 'Economy' },
  { key: 'unemployment_pct', label: 'Unemployment', unit: '%', format: v => v.toFixed(1), group: 'Economy' },
  { key: 'inflation_pct', label: 'Inflation', unit: '%', format: v => v.toFixed(1), group: 'Economy' },
  { key: 'public_debt_pct', label: 'Public Debt', unit: '% GDP', format: v => v.toFixed(1), group: 'Economy' },
  // Other
  { key: 'area_km2', label: 'Area', unit: ' km²', format: v => v.toLocaleString('en-US'), group: 'Geography' },
  { key: 'internet_pct', label: 'Internet Users', unit: '%', format: v => v.toFixed(1), group: 'Infrastructure' },
  { key: 'military_pct_gdp', label: 'Military Spending', unit: '% GDP', format: v => v.toFixed(1), group: 'Infrastructure' },
  { key: 'edu_spend_pct_gdp', label: 'Education Spending', unit: '% GDP', format: v => v.toFixed(1), group: 'Infrastructure' },
];

const METRIC_GROUPS = [...new Set(METRICS.map(m => m.group))];

export function CompareClient({ countries }: { countries: CountryData[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeMetric, setActiveMetric] = useState<string>('gdp_per_capita');
  const [view, setView] = useState<'table' | 'chart'>('chart');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return countries
      .filter(c => !selected.includes(c.code) && c.name.toLowerCase().includes(q))
      .slice(0, 12);
  }, [search, selected, countries]);

  const selectedCountries = useMemo(
    () => selected.map(code => countries.find(c => c.code === code)!).filter(Boolean),
    [selected, countries]
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function addCountry(code: string) {
    if (selected.length >= 10) return;
    setSelected([...selected, code]);
    setSearch('');
    setShowDropdown(false);
    inputRef.current?.focus();
  }

  function removeCountry(code: string) {
    setSelected(selected.filter(c => c !== code));
  }

  function clearAll() {
    setSelected([]);
  }

  // Chart data
  const currentMetric = METRICS.find(m => m.key === activeMetric)!;
  const chartData = selectedCountries
    .map((c, i) => ({
      name: c.name.length > 18 ? c.name.slice(0, 16) + '…' : c.name,
      fullName: c.name,
      value: c[currentMetric.key] as number | null,
      color: COLORS[i % COLORS.length],
    }))
    .filter(d => d.value != null);

  return (
    <div className="compare-root">
      {/* Country Selector */}
      <div className="compare-selector" ref={dropdownRef}>
        <div className="compare-chips">
          {selectedCountries.map((c, i) => (
            <span
              key={c.code}
              className="compare-chip"
              style={{ borderColor: COLORS[i % COLORS.length] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.flag_url} alt="" width={20} height={14} style={{ borderRadius: 2 }} />
              {c.name}
              <button onClick={() => removeCountry(c.code)} className="chip-remove">×</button>
            </span>
          ))}
          {selected.length < 10 && (
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => search && setShowDropdown(true)}
              placeholder={selected.length === 0 ? 'Search for a country...' : 'Add another...'}
              className="compare-search-input"
            />
          )}
        </div>
        {showDropdown && filtered.length > 0 && (
          <div className="compare-dropdown">
            {filtered.map(c => (
              <button
                key={c.code}
                className="compare-dropdown-item"
                onClick={() => addCountry(c.code)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.flag_url} alt="" width={24} height={16} style={{ borderRadius: 2 }} />
                <span>{c.name}</span>
                <span className="dropdown-region">{c.region}</span>
              </button>
            ))}
          </div>
        )}
        {selected.length > 0 && (
          <button onClick={clearAll} className="compare-clear">Clear All</button>
        )}
      </div>

      {selected.length === 0 && (
        <div className="compare-empty">
          <p>Start typing a country name above to begin comparing.</p>
          <div className="compare-presets">
            <p style={{ fontSize: '0.85rem', color: '#B7C7DA', marginBottom: '0.5rem' }}>Quick presets:</p>
            <button className="preset-btn" onClick={() => setSelected(['USA', 'CHN', 'JPN', 'DEU', 'IND'])}>
              Top 5 Economies
            </button>
            <button className="preset-btn" onClick={() => setSelected(['NOR', 'CHE', 'AUS', 'JPN', 'ISL'])}>
              Highest Life Expectancy
            </button>
            <button className="preset-btn" onClick={() => setSelected(['USA', 'RUS', 'CHN', 'GBR', 'FRA'])}>
              UN Security Council (P5)
            </button>
            <button className="preset-btn" onClick={() => setSelected(['BRA', 'RUS', 'IND', 'CHN', 'ZAF'])}>
              BRICS
            </button>
            <button className="preset-btn" onClick={() => setSelected(['NGA', 'ETH', 'EGY', 'COD', 'ZAF', 'KEN', 'TZA'])}>
              Africa&apos;s Largest
            </button>
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <>
          {/* View toggle */}
          <div className="compare-view-toggle">
            <button
              className={`view-btn ${view === 'chart' ? 'active' : ''}`}
              onClick={() => setView('chart')}
            >
              Chart View
            </button>
            <button
              className={`view-btn ${view === 'table' ? 'active' : ''}`}
              onClick={() => setView('table')}
            >
              Table View
            </button>
          </div>

          {view === 'chart' && (
            <div className="compare-chart-section">
              {/* Metric selector */}
              <div className="metric-selector">
                {METRIC_GROUPS.map(group => (
                  <div key={group} className="metric-group">
                    <span className="metric-group-label">{group}</span>
                    <div className="metric-buttons">
                      {METRICS.filter(m => m.group === group).map(m => (
                        <button
                          key={m.key}
                          className={`metric-btn ${activeMetric === m.key ? 'active' : ''}`}
                          onClick={() => setActiveMetric(m.key as string)}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="compare-chart">
                <h3 className="chart-title">
                  {currentMetric.label}
                  {currentMetric.unit && (
                    <span className="chart-unit"> ({currentMetric.unit.trim()})</span>
                  )}
                </h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={Math.max(250, chartData.length * 50 + 60)}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A4A73" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: '#B7C7DA', fontSize: 12 }}
                        tickFormatter={(v) => currentMetric.format(v)}
                        stroke="#2A4A73"
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={130}
                        tick={{ fill: '#E6EDF5', fontSize: 13 }}
                        stroke="#2A4A73"
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#132B4C',
                          border: '1px solid #2A4A73',
                          borderRadius: '0.3rem',
                          color: '#E6EDF5',
                        }}
                        formatter={(value: any) => [
                          currentMetric.format(value as number) + currentMetric.unit,
                          currentMetric.label,
                        ]}
                        labelFormatter={(label: any, payload: any) =>
                          payload?.[0]?.payload?.fullName || label
                        }
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={35}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="no-chart-data">No data available for this metric.</p>
                )}
              </div>
            </div>
          )}

          {view === 'table' && (
            <div className="compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th className="compare-metric-col">Metric</th>
                    {selectedCountries.map((c, i) => (
                      <th key={c.code} style={{ borderBottom: `3px solid ${COLORS[i % COLORS.length]}` }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.flag_url} alt="" width={28} height={18} style={{ borderRadius: 2, display: 'block', margin: '0 auto 4px' }} />
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="group-header"><td colSpan={selectedCountries.length + 1}>General</td></tr>
                  <tr>
                    <td className="compare-metric-col">Capital</td>
                    {selectedCountries.map(c => <td key={c.code}>{c.capital || '—'}</td>)}
                  </tr>
                  <tr>
                    <td className="compare-metric-col">Region</td>
                    {selectedCountries.map(c => <td key={c.code}>{c.region}</td>)}
                  </tr>
                  <tr>
                    <td className="compare-metric-col">Government</td>
                    {selectedCountries.map(c => (
                      <td key={c.code} className="small-text">{c.government_type || '—'}</td>
                    ))}
                  </tr>
                  {METRIC_GROUPS.map(group => {
                    const groupMetrics = METRICS.filter(m => m.group === group);
                    return [
                      <tr key={`gh-${group}`} className="group-header">
                        <td colSpan={selectedCountries.length + 1}>{group}</td>
                      </tr>,
                      ...groupMetrics.map(metric => {
                        const vals = selectedCountries.map(c => c[metric.key] as number | null).filter(v => v != null);
                        const max = vals.length > 0 ? Math.max(...vals as number[]) : 0;
                        const min = vals.length > 0 ? Math.min(...vals as number[]) : 0;

                        return (
                          <tr key={metric.key}>
                            <td className="compare-metric-col">
                              {metric.label}
                              {metric.unit && <span className="metric-unit">{metric.unit}</span>}
                            </td>
                            {selectedCountries.map((c, i) => {
                              const val = c[metric.key] as number | null;
                              const isMax = val != null && val === max && vals.length > 1;
                              const isMin = val != null && val === min && vals.length > 1;
                              return (
                                <td
                                  key={c.code}
                                  className={isMax ? 'val-high' : isMin ? 'val-low' : ''}
                                >
                                  {val != null ? metric.format(val) : '—'}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      }),
                    ];
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

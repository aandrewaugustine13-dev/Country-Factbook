'use client';

import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, CartesianGrid, Cell,
} from 'recharts';
import { CHART_METRICS, formatMetricValue } from '@/src/glossary';
import { GlossaryTip } from './GlossaryTip';

type Country = Record<string, any>;

const REGION_COLORS: Record<string, string> = {
  Africa: '#B8860B',
  Americas: '#1B6CA8',
  Asia: '#C0392B',
  Europe: '#2A7F7A',
  Oceania: '#2D8A4E',
  Antarctic: '#8A96A3',
};

function truncateName(name: string, max = 16) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name;
}

/* ============================
   BAR CHART
   ============================ */
export function CompareBarChart({ countries }: { countries: Country[] }) {
  const [metricKey, setMetricKey] = useState('gdp_per_capita');
  const metric = CHART_METRICS.find(m => m.key === metricKey) || CHART_METRICS[0];

  const chartData = useMemo(() =>
    countries
      .filter(c => c[metricKey] != null)
      .map(c => ({
        name: truncateName(c.name || c.name_common || c.code),
        fullName: c.name || c.name_common,
        value: c[metricKey],
        region: c.region,
        emoji: c.flag_emoji,
      }))
      .sort((a, b) => b.value - a.value),
    [countries, metricKey]
  );

  return (
    <div className="compare-chart">
      <div className="chart-header">
        <h3 className="chart-title">
          {metric.label}
          {metric.tip && <> <GlossaryTip text={metric.tip} /></>}
        </h3>
        <select
          className="chart-metric-select"
          value={metricKey}
          onChange={e => setMetricKey(e.target.value)}
        >
          {CHART_METRICS.map(m => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 38)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
            <XAxis
              type="number"
              tick={{ fill: '#5A6A7A', fontSize: 11, fontFamily: 'inherit' }}
              tickFormatter={v => formatMetricValue(v, metric.format)}
              axisLine={{ stroke: '#E5DFD4' }}
              tickLine={{ stroke: '#E5DFD4' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#0D2B45', fontSize: 12, fontFamily: 'inherit' }}
              width={110}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid #E5DFD4',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                color: '#1A2332',
                boxShadow: '0 8px 24px rgba(13, 43, 69, 0.1)',
              }}
              formatter={(v: number) => [formatMetricValue(v, metric.format), metric.label]}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.name === label);
                return item ? `${item.emoji} ${item.fullName}` : label;
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={30}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={REGION_COLORS[entry.region] || '#B8860B'} fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="no-chart-data">No data available for this metric</p>
      )}

      <div className="chart-legend">
        {Object.entries(REGION_COLORS).filter(([r]) => r !== 'Antarctic').map(([region, color]) => (
          <span key={region} className="chart-legend-item">
            <span className="chart-legend-dot" style={{ background: color }} />
            {region}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================
   SCATTER: any two numeric metrics
   ============================ */
export function MetricScatter({ countries }: { countries: Country[] }) {
  const [xKey, setXKey] = useState('gdp_per_capita');
  const [yKey, setYKey] = useState('life_expectancy');
  const xMetric = CHART_METRICS.find((m) => m.key === xKey) || CHART_METRICS[0];
  const yMetric = CHART_METRICS.find((m) => m.key === yKey) || CHART_METRICS[1];

  const data = useMemo(
    () =>
      countries
        .filter((c) => c[xKey] != null && c[yKey] != null)
        .map((c) => ({
          x: Number(c[xKey]),
          y: Number(c[yKey]),
          name: c.name || c.name_common,
          region: c.region,
          emoji: c.flag_emoji,
          pop: c.population || 0,
        })),
    [countries, xKey, yKey]
  );

  return (
    <div className="compare-chart">
      <div className="chart-header">
        <h3 className="chart-title">Scatter</h3>
        <div className="scatter-metric-picks">
          <label>
            X{' '}
            <select
              className="chart-metric-select"
              value={xKey}
              onChange={(e) => setXKey(e.target.value)}
            >
              {CHART_METRICS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Y{' '}
            <select
              className="chart-metric-select"
              value={yKey}
              onChange={(e) => setYKey(e.target.value)}
            >
              {CHART_METRICS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <p className="chart-subtitle">
        {xMetric.label} vs {yMetric.label}
        {data.some((d) => d.pop > 0) ? ' · dot size ≈ population' : ''}
      </p>

      {data.length >= 2 ? (
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ bottom: 28, left: 12, right: 24, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD4" />
            <XAxis
              type="number"
              dataKey="x"
              name={xMetric.label}
              tick={{ fill: '#5A6A7A', fontSize: 11 }}
              tickFormatter={(v) => formatMetricValue(v, xMetric.format)}
              label={{
                value: xMetric.label,
                position: 'bottom',
                offset: 8,
                style: { fill: '#5A6A7A', fontSize: 11 },
              }}
              axisLine={{ stroke: '#E5DFD4' }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yMetric.label}
              tick={{ fill: '#5A6A7A', fontSize: 11 }}
              domain={['auto', 'auto']}
              tickFormatter={(v) => formatMetricValue(v, yMetric.format)}
              label={{
                value: yMetric.label,
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#5A6A7A', fontSize: 11 },
              }}
              axisLine={{ stroke: '#E5DFD4' }}
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E5DFD4',
                      borderRadius: '0.5rem',
                      padding: '0.55rem 0.8rem',
                      fontSize: '0.85rem',
                      boxShadow: '0 8px 24px rgba(13, 43, 69, 0.1)',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#0D2B45' }}>
                      {d.emoji} {d.name}
                    </div>
                    <div style={{ color: '#5A6A7A' }}>
                      {xMetric.label}: {formatMetricValue(d.x, xMetric.format)}
                    </div>
                    <div style={{ color: '#5A6A7A' }}>
                      {yMetric.label}: {formatMetricValue(d.y, yMetric.format)}
                    </div>
                  </div>
                );
              }}
            />
            <Scatter data={data}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={REGION_COLORS[entry.region] || '#B8860B'}
                  r={Math.max(5, Math.min(18, Math.sqrt((entry.pop || 1e6) / 4000000)))}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      ) : (
        <p className="no-chart-data">Need at least two countries with both metrics available.</p>
      )}

      <div className="chart-legend">
        {Object.entries(REGION_COLORS)
          .filter(([r]) => r !== 'Antarctic')
          .map(([region, color]) => (
            <span key={region} className="chart-legend-item">
              <span className="chart-legend-dot" style={{ background: color }} />
              {region}
            </span>
          ))}
      </div>
    </div>
  );
}

/** @deprecated Use MetricScatter — kept for any external imports */
export function WealthHealthScatter({ countries }: { countries: Country[] }) {
  return <MetricScatter countries={countries} />;
}

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
  Africa: '#C6952B',
  Americas: '#4B92DB',
  Asia: '#C0392B',
  Europe: '#6C5CE7',
  Oceania: '#2D8A4E',
  Antarctic: '#8694A7',
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
              tick={{ fill: '#9BB0CB', fontSize: 11, fontFamily: 'inherit' }}
              tickFormatter={v => formatMetricValue(v, metric.format)}
              axisLine={{ stroke: '#1E3A5F' }}
              tickLine={{ stroke: '#1E3A5F' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#E8EDF4', fontSize: 12, fontFamily: 'inherit' }}
              width={110}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#132B4C',
                border: '1px solid #1E3A5F',
                borderRadius: '0.25rem',
                fontSize: '0.85rem',
                color: '#E8EDF4',
              }}
              formatter={(v: number) => [formatMetricValue(v, metric.format), metric.label]}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.name === label);
                return item ? `${item.emoji} ${item.fullName}` : label;
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={30}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={REGION_COLORS[entry.region] || '#C6952B'} fillOpacity={0.85} />
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
   SCATTER PLOT: Wealth vs Health
   ============================ */
export function WealthHealthScatter({ countries }: { countries: Country[] }) {
  const data = useMemo(() =>
    countries
      .filter(c => c.gdp_per_capita != null && c.life_expectancy != null)
      .map(c => ({
        x: c.gdp_per_capita,
        y: c.life_expectancy,
        name: c.name || c.name_common,
        region: c.region,
        emoji: c.flag_emoji,
        pop: c.population || 0,
      })),
    [countries]
  );

  if (data.length < 2) return null;

  return (
    <div className="compare-chart">
      <h3 className="chart-title">
        Wealth vs. Health
        <GlossaryTip text="Shows the relationship between GDP per capita and life expectancy. Richer countries tend to live longer, but not always — some countries punch above their weight." />
      </h3>
      <p className="chart-subtitle">GDP per capita vs life expectancy · dot size = population</p>

      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ bottom: 24, left: 12, right: 24, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.5)" />
          <XAxis
            type="number"
            dataKey="x"
            name="GDP/capita"
            tick={{ fill: '#9BB0CB', fontSize: 11 }}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
            label={{ value: 'GDP per Capita', position: 'bottom', offset: 4, style: { fill: '#9BB0CB', fontSize: 11 } }}
            axisLine={{ stroke: '#1E3A5F' }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Life Exp."
            tick={{ fill: '#9BB0CB', fontSize: 11 }}
            domain={['auto', 'auto']}
            label={{ value: 'Life Expectancy', angle: -90, position: 'insideLeft', style: { fill: '#9BB0CB', fontSize: 11 } }}
            axisLine={{ stroke: '#1E3A5F' }}
          />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div style={{
                  background: '#132B4C', border: '1px solid #1E3A5F',
                  borderRadius: '0.25rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem',
                }}>
                  <div style={{ fontWeight: 600, color: '#E8EDF4' }}>{d.emoji} {d.name}</div>
                  <div style={{ color: '#9BB0CB' }}>GDP/capita: ${d.x?.toLocaleString()}</div>
                  <div style={{ color: '#9BB0CB' }}>Life exp: {d.y} years</div>
                  <div style={{ color: '#9BB0CB' }}>Pop: {d.pop >= 1e6 ? `${(d.pop / 1e6).toFixed(1)}M` : d.pop.toLocaleString()}</div>
                </div>
              );
            }}
          />
          <Scatter data={data}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={REGION_COLORS[entry.region] || '#C6952B'}
                r={Math.max(5, Math.min(18, Math.sqrt(entry.pop / 4000000)))}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

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

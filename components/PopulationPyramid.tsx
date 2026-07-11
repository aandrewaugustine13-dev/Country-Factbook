'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { PopulationPyramid as PyramidData } from '@/src/population-pyramid';
import {
  SHAPE_META,
  toChartRows,
  formatCount,
} from '@/src/population-pyramid';

const MALE_COLOR = '#1B6CA8';
const FEMALE_COLOR = '#C45C7A';

function formatAxisTick(value: number, mode: 'percent' | 'count') {
  const v = Math.abs(value);
  if (mode === 'percent') return `${v.toFixed(v >= 10 ? 0 : 1)}%`;
  return formatCount(v);
}

function PyramidTooltip({
  active,
  payload,
  mode,
}: {
  active?: boolean;
  payload?: Array<{ payload: ReturnType<typeof toChartRows>[number] }>;
  mode: 'percent' | 'count';
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="pyramid-tooltip">
      <div className="pyramid-tooltip-title">{row.band}</div>
      <div className="pyramid-tooltip-row male">
        <span>Male</span>
        <strong>
          {mode === 'percent'
            ? `${row.malePct.toFixed(1)}%`
            : formatCount(row.maleCount)}{' '}
          <span className="pyramid-tooltip-sub">({formatCount(row.maleCount)})</span>
        </strong>
      </div>
      <div className="pyramid-tooltip-row female">
        <span>Female</span>
        <strong>
          {mode === 'percent'
            ? `${row.femalePct.toFixed(1)}%`
            : formatCount(row.femaleCount)}{' '}
          <span className="pyramid-tooltip-sub">({formatCount(row.femaleCount)})</span>
        </strong>
      </div>
    </div>
  );
}

export function PopulationPyramid({
  data,
  mode = 'percent',
  height = 260,
  showGuide = true,
  compact = false,
}: {
  data: PyramidData;
  mode?: 'percent' | 'count';
  height?: number;
  showGuide?: boolean;
  compact?: boolean;
}) {
  const rows = toChartRows(data.bands, mode);
  const meta = SHAPE_META[data.shape];
  const maxAbs = Math.max(
    ...rows.flatMap((r) => [Math.abs(r.male), Math.abs(r.female)]),
    mode === 'percent' ? 25 : 1
  );
  const domainMax = mode === 'percent' ? Math.ceil(maxAbs / 5) * 5 + 5 : maxAbs * 1.1;

  return (
    <article className={`pyramid-card ${compact ? 'pyramid-card-compact' : ''}`}>
      <header className="pyramid-card-header">
        <div className="pyramid-card-identity">
          {data.flag_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.flag_url}
              alt=""
              width={40}
              height={28}
              className="pyramid-flag"
            />
          ) : (
            <span className="pyramid-emoji" aria-hidden>
              {data.flag_emoji}
            </span>
          )}
          <div>
            <h3 className="pyramid-card-title">{data.name}</h3>
            <p className="pyramid-card-meta">
              {data.region}
              {data.year ? ` · ${data.year} est.` : ''}
              {data.totalPopulation
                ? ` · ${formatCount(data.totalPopulation)} people`
                : ''}
            </p>
          </div>
        </div>
        <span
          className={`pyramid-shape-badge pyramid-shape-${data.shape}`}
          title={meta.summary}
        >
          {meta.label}
        </span>
      </header>

      <div className="pyramid-legend" aria-hidden>
        <span className="pyramid-legend-item">
          <span className="pyramid-swatch male" /> Male
        </span>
        <span className="pyramid-legend-item">
          <span className="pyramid-swatch female" /> Female
        </span>
        <span className="pyramid-legend-center">
          {mode === 'percent' ? '% of population' : 'people'}
        </span>
      </div>

      <div className="pyramid-chart-wrap" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
            stackOffset="sign"
            barCategoryGap="18%"
          >
            <XAxis
              type="number"
              domain={[-domainMax, domainMax]}
              tickFormatter={(v) => formatAxisTick(v, mode)}
              tick={{ fill: '#5A6A7A', fontSize: 11 }}
              axisLine={{ stroke: '#E5DFD4' }}
              tickLine={{ stroke: '#E5DFD4' }}
            />
            <YAxis
              type="category"
              dataKey="band"
              width={72}
              tick={{ fill: '#0D2B45', fontSize: 12, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine x={0} stroke="#D4CDC0" strokeWidth={1} />
            <Tooltip
              content={<PyramidTooltip mode={mode} />}
              cursor={{ fill: 'rgba(13, 43, 69, 0.04)' }}
            />
            <Bar dataKey="male" name="Male" stackId="pyramid" radius={[4, 0, 0, 4]}>
              {rows.map((_, i) => (
                <Cell key={`m-${i}`} fill={MALE_COLOR} />
              ))}
            </Bar>
            <Bar dataKey="female" name="Female" stackId="pyramid" radius={[0, 4, 4, 0]}>
              {rows.map((_, i) => (
                <Cell key={`f-${i}`} fill={FEMALE_COLOR} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pyramid-band-stats" aria-label="Age band summary">
        {data.bands.map((b) => (
          <div key={b.id} className="pyramid-band-stat">
            <span className="pyramid-band-stat-label">{b.label}</span>
            <strong>{b.percent.toFixed(1)}%</strong>
          </div>
        ))}
      </div>

      {showGuide && (
        <div className="pyramid-guide">
          <p className="pyramid-guide-summary">{meta.summary}</p>
          <p className="pyramid-guide-label">Think about</p>
          <ul className="pyramid-guide-questions">
            {meta.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

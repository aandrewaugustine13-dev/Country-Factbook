/**
 * Filter helpers for the research Compare tool.
 * Pure functions — no UI coupling.
 */

import type { MetricDef } from './glossary';
import { METRICS } from './glossary';

export type FilterOp = 'gte' | 'lte' | 'between';

export interface MetricFilter {
  id: string;
  metricKey: string;
  op: FilterOp;
  value: number | '';
  value2: number | '';
}

export const NUMERIC_METRICS: MetricDef[] = METRICS.filter((m) => m.numeric);

export const DEFAULT_VISIBLE_METRICS = [
  'population',
  'gdp_per_capita',
  'life_expectancy',
  'median_age',
  'urbanization_pct',
  'internet_pct',
  'fertility_rate',
  'gdp_ppp',
  'infant_mortality',
  'military_pct_gdp',
] as const;

export function createFilter(partial?: Partial<MetricFilter>): MetricFilter {
  return {
    id: `f_${Math.random().toString(36).slice(2, 9)}`,
    metricKey: partial?.metricKey || 'gdp_per_capita',
    op: partial?.op || 'gte',
    value: partial?.value ?? '',
    value2: partial?.value2 ?? '',
  };
}

function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export function matchesFilter(country: Record<string, any>, filter: MetricFilter): boolean {
  const metric = METRICS.find((m) => m.key === filter.metricKey);
  if (!metric?.numeric) return true;

  const raw = metric.getValue(country);
  const n = numOrNull(raw);
  if (n === null) return false;

  const v1 = filter.value === '' ? null : Number(filter.value);
  const v2 = filter.value2 === '' ? null : Number(filter.value2);

  if (filter.op === 'gte') {
    if (v1 === null || !Number.isFinite(v1)) return true;
    return n >= v1;
  }
  if (filter.op === 'lte') {
    if (v1 === null || !Number.isFinite(v1)) return true;
    return n <= v1;
  }
  // between
  if (v1 === null && v2 === null) return true;
  if (v1 !== null && v2 !== null) return n >= Math.min(v1, v2) && n <= Math.max(v1, v2);
  if (v1 !== null) return n >= v1;
  if (v2 !== null) return n <= v2;
  return true;
}

export function filterCountries(
  countries: Record<string, any>[],
  opts: {
    regions: string[];
    filters: MetricFilter[];
  }
): Record<string, any>[] {
  return countries.filter((c) => {
    if (opts.regions.length > 0 && !opts.regions.includes(c.region)) return false;
    for (const f of opts.filters) {
      if (!matchesFilter(c, f)) return false;
    }
    return true;
  });
}

export function sortCountries(
  countries: Record<string, any>[],
  metricKey: string,
  dir: 'asc' | 'desc'
): Record<string, any>[] {
  const metric = METRICS.find((m) => m.key === metricKey);
  if (!metric?.numeric) return [...countries];

  return [...countries].sort((a, b) => {
    const av = numOrNull(metric.getValue(a));
    const bv = numOrNull(metric.getValue(b));
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    return dir === 'asc' ? av - bv : bv - av;
  });
}

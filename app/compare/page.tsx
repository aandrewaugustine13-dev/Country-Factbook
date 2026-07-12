import Link from 'next/link';
import { Suspense } from 'react';
import comparisonData from '@/data/comparison-data.json';
import allCountries from '@/data/all-countries.json';
import CompareClient from './CompareClient';
import { MAX_COMPARE } from '@/src/compare-state';

function extractFactbookValue(country: any, section: string, labelNeedle: string) {
  const entries = country.factbook?.[section] as Array<{ label: string; value: string }> | undefined;
  const found = entries?.find((e) => e.label.toLowerCase().includes(labelNeedle.toLowerCase()));
  return found?.value ?? null;
}

export default function ComparePage() {
  const map = new Map((allCountries as any[]).map((c) => [c.code, c]));
  const countries = (comparisonData as any[]).map((c) => {
    const base = map.get(c.code) || {};
    return {
      ...c,
      languages: base.languages,
      currency: base.currency,
      climate: extractFactbookValue(base, 'Environment', 'climate'),
      terrain: extractFactbookValue(base, 'Geography', 'terrain'),
      natural_resources: extractFactbookValue(base, 'Environment', 'natural resources'),
    };
  });

  return (
    <div className="container">
      <Link href="/" className="back-link">
        ← Back to dashboard
      </Link>
      <h1 className="page-title">Compare</h1>
      <p className="page-lead">
        Filter the world, select up to {MAX_COMPARE} countries, sort by any metric, and inspect
        charts or a data grid.
      </p>
      <Suspense fallback={<div className="compare-empty">Loading comparison…</div>}>
        <CompareClient countries={countries} />
      </Suspense>
    </div>
  );
}

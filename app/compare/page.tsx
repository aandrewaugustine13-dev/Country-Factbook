import Link from 'next/link';
import { Suspense } from 'react';
import comparisonData from '@/data/comparison-data.json';
import allCountries from '@/data/all-countries.json';
import CompareClient from './CompareClient';

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
      <h1 className="page-title">Compare countries</h1>
      <p className="page-lead">
        Select up to 10 countries, share the URL, and explore side-by-side charts and metrics.
      </p>
      <Suspense fallback={<div className="compare-empty">Loading comparison…</div>}>
        <CompareClient countries={countries} />
      </Suspense>
    </div>
  );
}

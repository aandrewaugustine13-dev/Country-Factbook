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
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm underline underline-offset-4">
          ← Back to all countries
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-semibold tracking-wide uppercase">Compare Countries</h1>
      <p className="mb-6 text-sm opacity-80">
        Select up to 10 countries, share the URL, and compare side-by-side.
      </p>

      <Suspense fallback={<div className="text-sm opacity-70">Loading comparison…</div>}>
        <CompareClient countries={countries} />
      </Suspense>
    </main>
  );
}

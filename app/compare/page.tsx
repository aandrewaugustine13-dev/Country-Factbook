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
    <div className="max-w-7xl mx-auto p-6">
      <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
        ← Back to all countries
      </Link>

      <h1 className="text-3xl font-bold mt-4">Compare Countries</h1>
      <p className="text-gray-600 mt-2">
        Select up to 10 countries, share the URL, and compare side-by-side.
      </p>

      <div className="mt-8">
        <Suspense fallback={<div>Loading comparison…</div>}>
          <CompareClient countries={countries} />
        </Suspense>
      </div>
    </div>
  );
}

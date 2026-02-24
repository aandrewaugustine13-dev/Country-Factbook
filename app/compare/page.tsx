import Link from 'next/link';
import comparisonData from '@/data/comparison-data.json';
import allCountries from '@/data/all-countries.json';
import { CompareClient } from '@/components/CompareClient';

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
      <Link href="/" className="back-link">← Back to all countries</Link>
      <h1>Compare Countries</h1>
      <p style={{ color: '#B7C7DA', marginBottom: '1rem' }}>Select up to 10 countries, share the URL, and compare side-by-side.</p>
      <CompareClient countries={countries} />
    </div>
  );
}

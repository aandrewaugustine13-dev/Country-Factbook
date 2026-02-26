import comparisonData from '@/data/comparison-data.json';
import { CompareClient } from '@/components/CompareClient';
import Link from 'next/link';

export default function ComparePage() {
  return (
    <div className="container">
      <Link href="/" className="back-link">
        ← Back to all countries
      </Link>
      <h1>Compare Countries</h1>
      <p style={{ color: '#B7C7DA', marginBottom: '1rem' }}>
        Select up to 10 countries to compare side by side.
      </p>
      <CompareClient countries={comparisonData as any} />
    </div>
  );
}

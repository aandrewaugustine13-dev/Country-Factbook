import comparisonData from '@/data/comparison-data.json';
import { CompareClient } from '@/components/CompareClient';
import Link from 'next/link';

export default function ComparePage() {
  return (
    <>
      <Link href="/countries">← Back to all countries</Link>

      <h1>Compare Countries</h1>

      <p>Select up to 10 countries to compare side by side.</p>

      <CompareClient countries={comparisonData} />   {/* ← this line fixed */}
    </>
  );
}

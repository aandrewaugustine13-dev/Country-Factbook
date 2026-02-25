import { CompareClient } from './CompareClient';
import comparisonData from '@/data/comparison-data.json';   // ← adjust path if your JSON is elsewhere

export default function ComparePage() {
  return <CompareClient countries={comparisonData} />;
}

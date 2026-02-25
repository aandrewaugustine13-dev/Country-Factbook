import Link from 'next/link';
import comparisonData from '@/data/comparison-data.json';
import { DailyClient } from './DailyClient';

export const metadata = {
  title: 'Country of the Day — World Factbook',
  description: 'Discover a random country every day. Great for classroom bellringers.',
};

export default function DailyPage() {
  const countries = (comparisonData as any[]).map((c) => ({
    code: c.code,
    name: c.name,
    flag_emoji: c.flag_emoji,
    region: c.region,
    capital: c.capital,
    population: c.population,
    gdp_per_capita: c.gdp_per_capita,
    life_expectancy: c.life_expectancy,
    median_age: c.median_age,
    urbanization_pct: c.urbanization_pct,
    internet_pct: c.internet_pct,
    government_type: c.government_type,
    area_km2: c.area_km2,
  }));

  return (
    <div className="container">
      <Link href="/" className="back-link">← Back to all countries</Link>
      <DailyClient countries={countries} />
    </div>
  );
}

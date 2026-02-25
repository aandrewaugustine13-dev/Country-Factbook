import Link from 'next/link';
import comparisonData from '@/data/comparison-data.json';
import { QuizClient } from './QuizClient';

export const metadata = {
  title: 'Quiz — World Factbook',
  description: 'Test your world knowledge! Which country has the higher stat?',
};

export default function QuizPage() {
  // Only pass the fields the quiz needs
  const countries = (comparisonData as any[])
    .filter((c) => c.population != null)
    .map((c) => ({
      code: c.code,
      name: c.name,
      flag_emoji: c.flag_emoji,
      region: c.region,
      population: c.population,
      gdp_per_capita: c.gdp_per_capita,
      gdp_ppp: c.gdp_ppp,
      life_expectancy: c.life_expectancy,
      infant_mortality: c.infant_mortality,
      median_age: c.median_age,
      fertility_rate: c.fertility_rate,
      urbanization_pct: c.urbanization_pct,
      unemployment_pct: c.unemployment_pct,
      inflation_pct: c.inflation_pct,
      internet_pct: c.internet_pct,
      military_pct_gdp: c.military_pct_gdp,
      edu_spend_pct_gdp: c.edu_spend_pct_gdp,
      public_debt_pct: c.public_debt_pct,
      area_km2: c.area_km2,
    }));

  return (
    <div className="container">
      <Link href="/" className="back-link">← Back to all countries</Link>
      <QuizClient countries={countries} />
    </div>
  );
}

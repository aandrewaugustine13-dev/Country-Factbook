import { HomeClient } from '@/components/HomeClient';
import allCountries from '@/data/all-countries.json';
import comparisonData from '@/data/comparison-data.json';

export default function Home() {
  const countries = allCountries.map((c) => ({
    code: c.code,
    name_common: c.name_common,
    flag_url: c.flag_url,
    flag_emoji: c.flag_emoji,
    region: c.region,
    capital: c.capital,
  }));

  const withFactbook = allCountries.filter((c) => (c as { factbook?: unknown }).factbook).length;

  const regionCounts: Record<string, number> = {};
  for (const c of countries) {
    regionCounts[c.region] = (regionCounts[c.region] || 0) + 1;
  }

  const withPopulation = (comparisonData as { population?: number | null }[]).filter(
    (c) => c.population != null
  ).length;

  return (
    <div className="container">
      <HomeClient
        countries={countries}
        stats={{
          total: countries.length,
          withFactbook,
          withPopulation,
          regionCounts,
        }}
      />
    </div>
  );
}

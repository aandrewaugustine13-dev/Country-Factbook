import { Seal } from '@/components/Seal';
import { HomeClient } from '@/components/HomeClient';
import { DidYouKnow } from '@/components/DidYouKnow';
import allCountries from '@/data/all-countries.json';
import comparisonData from '@/data/comparison-data.json';

function fmtNum(n: number | null | undefined) {
  if (n == null) return '—';
  return n.toLocaleString('en-US');
}

export default function Home() {
  const comparisonMap = new Map((comparisonData as any[]).map((c) => [c.code, c]));

  const countries = (allCountries as any[]).map((c) => {
    const stats = comparisonMap.get(c.code) || {};
    return {
      code: c.code,
      name_common: c.name_common,
      flag_url: c.flag_url,
      flag_emoji: c.flag_emoji,
      region: c.region,
      capital: c.capital,
      landlocked: c.landlocked,
      population: stats.population ?? null,
      government_type: stats.government_type ?? null,
    };
  });

  const smallest = countries.reduce((best, c) => {
    const area = (allCountries as any[]).find((x) => x.code === c.code)?.area_km2;
    if (!best || (area && area < best.area)) return { name: c.name_common, area };
    return best;
  }, null as null | { name: string; area: number });

  const compList = comparisonData as any[];
  const highestGdpCap = compList.filter((c) => c.gdp_per_capita != null).reduce((a, b) => a.gdp_per_capita > b.gdp_per_capita ? a : b);
  const youngestMedian = compList.filter((c) => c.median_age != null).reduce((a, b) => a.median_age < b.median_age ? a : b);
  const highestInfant = compList.filter((c) => c.infant_mortality != null).reduce((a, b) => a.infant_mortality > b.infant_mortality ? a : b);
  const mostLanguages = (allCountries as any[]).reduce((a, b) => ((b.languages?.length || 0) > (a.languages?.length || 0) ? b : a));

  const facts = [
    { title: 'Smallest country by area', country: smallest?.name || '—', value: smallest ? `${fmtNum(smallest.area)} km²` : '—' },
    { title: 'Highest GDP per capita', country: highestGdpCap.name, value: `$${fmtNum(highestGdpCap.gdp_per_capita)}` },
    { title: 'Youngest median age', country: youngestMedian.name, value: `${youngestMedian.median_age} years` },
    { title: 'Most languages spoken', country: mostLanguages.name_common, value: `${mostLanguages.languages?.length || 0} languages` },
    { title: 'Highest infant mortality', country: highestInfant.name, value: `${highestInfant.infant_mortality} per 1,000 births` },
  ];

  return (
    <div className="container">
      <header className="home-header">
        <Seal />
        <h1>THE WORLD FACTBOOK</h1>
        <p>Reference Edition 2026</p>
      </header>
      <DidYouKnow facts={facts} />
      <HomeClient countries={countries} />
    </div>
  );
}

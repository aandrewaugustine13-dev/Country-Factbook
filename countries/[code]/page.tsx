import { Seal } from '@/components/Seal';
import { HomeClient } from '@/components/HomeClient';
import allCountries from '@/data/all-countries.json';

export default function Home() {
  const countries = allCountries.map((c) => ({
    code: c.code,
    name_common: c.name_common,
    flag_url: c.flag_url,
    flag_emoji: c.flag_emoji,
    region: c.region,
    capital: c.capital,
    landlocked: c.landlocked,
    population: null,
    government_type: null,
  }));

  return (
    <div className="container">
      <header className="home-header">
        <Seal />
        <h1>THE WORLD FACTBOOK</h1>
        <p>Reference Edition 2026</p>
      </header>
      <HomeClient countries={countries} />
    </div>
  );
}

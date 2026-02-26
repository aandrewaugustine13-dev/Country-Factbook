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
  }));

  return (
    <div className="container">
      <header className="home-header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.jpg"
          alt="The World Factbook — Reference Edition 2026"
          className="home-logo"
        />
      </header>
      <HomeClient countries={countries} />
    </div>
  );
}

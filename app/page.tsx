import { Seal } from '@/components/Seal';
import { HomeClient } from '@/components/HomeClient';
import countries from '@/data/all-countries.json';
import type { CountrySearchItem } from '@/src/types';

export default function HomePage() {
  return (
    <main className="container">
      <header className="home-header">
        <Seal />
        <h1>THE COUNTRY FACTBOOK</h1>
        <p>Reference Edition 2026</p>
      </header>
      <HomeClient countries={countries as CountrySearchItem[]} />
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface Country {
  code: string;
  name_common: string;
  name_official: string;
  flag_url: string;
  region: string;
  subregion: string;
  capital: string;
  population: number;
  area_km2: number;
  population_density_per_km2: number;
  languages: string[];
  demonym: string;
  currency: string;
}

const FALLBACK_COUNTRIES: Country[] = [
  { code: "USA", name_common: "United States", name_official: "United States of America", flag_url: "https://flagcdn.com/w320/us.png", region: "americas", subregion: "North America", capital: "Washington, D.C.", population: 331900000, area_km2: 9833520, population_density_per_km2: 33.7, languages: ["English"], demonym: "American", currency: "United States Dollar (USD)" },
  { code: "MEX", name_common: "Mexico", name_official: "United Mexican States", flag_url: "https://flagcdn.com/w320/mx.png", region: "americas", subregion: "North America", capital: "Mexico City", population: 126700000, area_km2: 1964375, population_density_per_km2: 64.5, languages: ["Spanish"], demonym: "Mexican", currency: "Mexican Peso (MXN)" },
  { code: "CAN", name_common: "Canada", name_official: "Canada", flag_url: "https://flagcdn.com/w320/ca.png", region: "americas", subregion: "North America", capital: "Ottawa", population: 38010000, area_km2: 9984670, population_density_per_km2: 3.8, languages: ["English", "French"], demonym: "Canadian", currency: "Canadian Dollar (CAD)" },
  { code: "BRA", name_common: "Brazil", name_official: "Federative Republic of Brazil", flag_url: "https://flagcdn.com/w320/br.png", region: "americas", subregion: "South America", capital: "Brasília", population: 214300000, area_km2: 8515770, population_density_per_km2: 25.2, languages: ["Portuguese"], demonym: "Brazilian", currency: "Brazilian Real (BRL)" },
  { code: "ARG", name_common: "Argentina", name_official: "Argentine Republic", flag_url: "https://flagcdn.com/w320/ar.png", region: "americas", subregion: "South America", capital: "Buenos Aires", population: 45380000, area_km2: 2780400, population_density_per_km2: 16.3, languages: ["Spanish"], demonym: "Argentine", currency: "Argentine Peso (ARS)" },
  { code: "GBR", name_common: "United Kingdom", name_official: "United Kingdom of Great Britain and Northern Ireland", flag_url: "https://flagcdn.com/w320/gb.png", region: "europe", subregion: "Northern Europe", capital: "London", population: 67500000, area_km2: 243610, population_density_per_km2: 277.0, languages: ["English"], demonym: "British", currency: "Pound Sterling (GBP)" },
  { code: "FRA", name_common: "France", name_official: "French Republic", flag_url: "https://flagcdn.com/w320/fr.png", region: "europe", subregion: "Western Europe", capital: "Paris", population: 67800000, area_km2: 551695, population_density_per_km2: 122.9, languages: ["French"], demonym: "French", currency: "Euro (EUR)" },
  { code: "DEU", name_common: "Germany", name_official: "Federal Republic of Germany", flag_url: "https://flagcdn.com/w320/de.png", region: "europe", subregion: "Western Europe", capital: "Berlin", population: 83200000, area_km2: 357022, population_density_per_km2: 233.0, languages: ["German"], demonym: "German", currency: "Euro (EUR)" },
  { code: "ITA", name_common: "Italy", name_official: "Italian Republic", flag_url: "https://flagcdn.com/w320/it.png", region: "europe", subregion: "Southern Europe", capital: "Rome", population: 59100000, area_km2: 301340, population_density_per_km2: 196.1, languages: ["Italian"], demonym: "Italian", currency: "Euro (EUR)" },
  { code: "ESP", name_common: "Spain", name_official: "Kingdom of Spain", flag_url: "https://flagcdn.com/w320/es.png", region: "europe", subregion: "Southern Europe", capital: "Madrid", population: 47400000, area_km2: 505990, population_density_per_km2: 93.7, languages: ["Spanish"], demonym: "Spanish", currency: "Euro (EUR)" },
  { code: "JPN", name_common: "Japan", name_official: "Japan", flag_url: "https://flagcdn.com/w320/jp.png", region: "asia", subregion: "Eastern Asia", capital: "Tokyo", population: 125800000, area_km2: 377975, population_density_per_km2: 333.0, languages: ["Japanese"], demonym: "Japanese", currency: "Japanese Yen (JPY)" },
  { code: "CHN", name_common: "China", name_official: "People's Republic of China", flag_url: "https://flagcdn.com/w320/cn.png", region: "asia", subregion: "Eastern Asia", capital: "Beijing", population: 1412000000, area_km2: 9706961, population_density_per_km2: 145.5, languages: ["Chinese"], demonym: "Chinese", currency: "Chinese Yuan (CNY)" },
  { code: "IND", name_common: "India", name_official: "Republic of India", flag_url: "https://flagcdn.com/w320/in.png", region: "asia", subregion: "Southern Asia", capital: "New Delhi", population: 1380000000, area_km2: 3287590, population_density_per_km2: 419.7, languages: ["Hindi", "English"], demonym: "Indian", currency: "Indian Rupee (INR)" },
  { code: "AUS", name_common: "Australia", name_official: "Commonwealth of Australia", flag_url: "https://flagcdn.com/w320/au.png", region: "oceania", subregion: "Australia and New Zealand", capital: "Canberra", population: 25900000, area_km2: 7692024, population_density_per_km2: 3.4, languages: ["English"], demonym: "Australian", currency: "Australian Dollar (AUD)" },
  { code: "ZAF", name_common: "South Africa", name_official: "Republic of South Africa", flag_url: "https://flagcdn.com/w320/za.png", region: "africa", subregion: "Southern Africa", capital: "Pretoria", population: 60000000, area_km2: 1221037, population_density_per_km2: 49.1, languages: ["English", "Afrikaans", "Zulu"], demonym: "South African", currency: "South African Rand (ZAR)" },
  { code: "RUS", name_common: "Russia", name_official: "Russian Federation", flag_url: "https://flagcdn.com/w320/ru.png", region: "europe", subregion: "Eastern Europe", capital: "Moscow", population: 144000000, area_km2: 17098242, population_density_per_km2: 8.4, languages: ["Russian"], demonym: "Russian", currency: "Russian Ruble (RUB)" },
  { code: "EGY", name_common: "Egypt", name_official: "Arab Republic of Egypt", flag_url: "https://flagcdn.com/w320/eg.png", region: "africa", subregion: "Northern Africa", capital: "Cairo", population: 109000000, area_km2: 1001450, population_density_per_km2: 108.9, languages: ["Arabic"], demonym: "Egyptian", currency: "Egyptian Pound (EGP)" },
  { code: "NGA", name_common: "Nigeria", name_official: "Federal Republic of Nigeria", flag_url: "https://flagcdn.com/w320/ng.png", region: "africa", subregion: "Western Africa", capital: "Abuja", population: 218500000, area_km2: 923769, population_density_per_km2: 236.6, languages: ["English"], demonym: "Nigerian", currency: "Nigerian Naira (NGN)" },
];

export default function Home() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kidMode, setKidMode] = useState(false);

  const loadCountries = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('https://restcountries.com/v3.1/all');
      if (!res.ok) throw new Error('Live map is taking a nap');
      const raw: any[] = await res.json();

      const transformed = raw.map((c: any) => {
        const area = Number(c.area ?? 0);
        const pop = Number(c.population ?? 0);
        return {
          code: c.cca3,
          name_common: c.name.common,
          name_official: c.name.official,
          flag_url: c.flags.svg || c.flags.png || '',
          region: (c.region || 'Unknown').toLowerCase(),
          subregion: c.subregion || 'Unknown',
          capital: Array.isArray(c.capital) ? c.capital[0] : 'Unknown',
          population: pop,
          area_km2: area,
          population_density_per_km2: area > 0 ? Number((pop / area).toFixed(2)) : 0,
          languages: Object.values(c.languages || {}) as string[],
          demonym: (c.demonyms?.eng?.m || c.demonyms?.eng?.f || 'Citizen') as string,
          currency: Object.values(c.currencies || {})
            .map((cur: any) => `${cur.name} (${cur.symbol || ''})`.trim())
            .join(', ') || 'Unknown',
        };
      }).sort((a, b) => a.name_common.localeCompare(b.name_common));

      setCountries(transformed);
    } catch (err: any) {
      setError('Live data is napping — using backup countries for now 😎 (still works for class!)');
      setCountries(FALLBACK_COUNTRIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  const filtered = countries.filter(c => {
    const regionMatch = region === 'all' || c.region === region;
    const searchMatch = c.name_common.toLowerCase().includes(search.toLowerCase());
    return regionMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="text-5xl">🌍</div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">World Factbook Explorer</h1>
                <p className="text-sm text-gray-600">For students & teachers • 2026 Edition (CIA-free)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setKidMode(!kidMode)}
                className={`px-5 py-2 rounded-full font-medium transition-all ${kidMode ? 'bg-purple-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              >
                {kidMode ? '👦 Kid Mode ON' : '👦 Kid Mode'}
              </button>
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'africa', 'americas', 'asia', 'europe', 'oceania'].map(r => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${region === r ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-100'}`}
              >
                {r === 'all' ? '🌍 All Regions' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('grid')} className={`p-2 rounded-lg ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>Grid</button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>List</button>
          </div>
        </div>

        {loading && <div className="text-center py-20"><div className="text-6xl mb-4">🌍</div><div className="text-2xl">Loading countries...</div></div>}

        {error && <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6 text-center text-yellow-800">{error}</div>}

        <div className="text-center mb-4 text-sm text-gray-500">
          Showing {filtered.length} countries {error && '(backup mode)'}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20"><div className="text-6xl mb-4">🤔</div><div>No matches — try different search or region</div></div>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-3'}>
            {filtered.map(country => (
              <div
                key={country.code}
                onClick={() => setSelected(country)}
                className="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition-all p-4 flex items-center gap-4"
              >
                <div className="text-5xl flex-shrink-0">
                  {country.flag_url ? <img src={country.flag_url} alt="" className="w-12 h-8 object-cover rounded" /> : '🌍'}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-lg">{country.name_common}</h3>
                  <p className="text-sm text-gray-600 capitalize">{country.region}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <img src={selected.flag_url} alt="" className="w-20 h-14 object-cover rounded" />
                <div>
                  <h2 className="text-4xl font-bold">{selected.name_common}</h2>
                  <p className="text-xl text-gray-600 capitalize">{selected.region}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-5xl leading-none hover:text-red-500">&times;</button>
            </div>

            <div className="grid grid-cols-2 gap-6 text-lg">
              <div><strong>Capital:</strong> {selected.capital}</div>
              <div><strong>Population:</strong> {selected.population.toLocaleString()}</div>
              <div><strong>Area:</strong> {selected.area_km2.toLocaleString()} km²</div>
              <div><strong>Density:</strong> {selected.population_density_per_km2} per km²</div>
              <div><strong>Languages:</strong> {selected.languages.join(', ') || 'N/A'}</div>
              <div><strong>Currency:</strong> {selected.currency}</div>
            </div>

            <button className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-xl w-full text-xl font-medium" onClick={() => alert(kidMode ? 'Fun fact time! This country has super cool animals 🦒' : 'Full profile coming soon — your dad built the new CIA Factbook while being too lazy for Linux 😂')}>
              {kidMode ? 'Show Kid Fun Fact!' : 'View Full Profile (coming soon)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

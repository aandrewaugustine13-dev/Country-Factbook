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

export default function Home() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all')
      .then(res => res.json())
      .then((raw: any[]) => {
        const transformed = raw.map((c) => {
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
            languages: Object.values(c.languages || {}),
            demonym: c.demonyms?.eng?.m || c.demonyms?.eng?.f || 'Citizen',
            currency: Object.values(c.currencies || {})
              .map((cur: any) => `${cur.name} (${cur.symbol || ''})`.trim())
              .join(', ') || 'Unknown',
          };
        }).sort((a, b) => a.name_common.localeCompare(b.name_common));

        setCountries(transformed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = countries.filter(c => {
    const regionMatch = region === 'all' || c.region === region;
    const searchMatch = c.name_common.toLowerCase().includes(search.toLowerCase());
    return regionMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
      </header>

      {/* Filters */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'africa', 'americas', 'asia', 'europe', 'oceania'].map(r => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  region === r ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-100'
                }`}
              >
                {r === 'all' ? 'All Regions' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setView('grid')} className={`p-2 rounded-lg ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>Grid</button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>List</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-2xl">Loading 250 countries from the internet... (no CIA needed 😎)</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-6xl">🤔</div>
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

      {/* Modal */}
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

            <button className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-xl w-full text-xl font-medium" onClick={() => alert('Full profile coming soon — you just built the new CIA World Factbook, king!')}>
              View Full Profile (coming soon)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

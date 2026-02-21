'use client';

import { useState } from 'react';
import allCountries from '@/data/all-countries.json';

export default function Home() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<any>(null);

  const filtered = allCountries.filter(c => {
    const regionMatch = region === 'all' || c.region.toLowerCase() === region;
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
                <p className="text-sm text-gray-600">For students & teachers • 2026 Edition</p>
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
                {r === 'all' ? '🌐 All Regions' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              List
            </button>
          </div>
        </div>

        {/* Countries */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">No countries found</h3>
            <p className="text-gray-600">Try adjusting search or filters</p>
          </div>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-3'}>
            {filtered.map(country => (
              <div
                key={country.code}
                onClick={() => setSelected(country)}
                className="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition-all p-4 flex items-center gap-4"
              >
                <div className="text-5xl flex-shrink-0">{country.flag_url ? <img src={country.flag_url} alt="" className="w-12 h-8 object-cover rounded" /> : '🇺🇳'}</div>
                <div className="flex-grow">
                  <h3 className="font-bold text-lg">{country.name_common}</h3>
                  <p className="text-sm text-gray-600">{country.region}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <img src={selected.flag_url} alt="" className="w-16 h-12 object-cover rounded" />
                <div>
                  <h2 className="text-3xl font-bold">{selected.name_common}</h2>
                  <p className="text-gray-600">{selected.region}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-3xl">&times;</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Capital</p>
                <p className="font-bold">{/* TODO: pull from full JSON */}</p>
              </div>
              {/* Add more stat cards for literacy, life expectancy, independence, agriculture, real GDP rank */}
            </div>

            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full font-medium">
              View Full Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

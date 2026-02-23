
Commit with message: `Add professional README.md – official Factbook replica`

### 2. Replace `app/page.tsx` (final clean version – no jokes, no kid mode, links to full pages)

Go to `app/page.tsx` → Edit → delete everything → paste this:

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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

const REGIONS = ['All Regions', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

export default function WorldFactbook() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/all-countries.json')
      .then(res => res.json())
      .then((data: Country[]) => {
        setCountries(data);
        setFilteredCountries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...countries];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name_common.toLowerCase().includes(term) || 
        c.name_official.toLowerCase().includes(term)
      );
    }
    if (selectedRegion !== 'All Regions') {
      result = result.filter(c => c.region === selectedRegion.toLowerCase());
    }
    setFilteredCountries(result);
  }, [searchTerm, selectedRegion, countries]);

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-50 bg-[#0A2540] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🌍</div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">THE WORLD FACTBOOK</h1>
              <p className="text-xl opacity-90 mt-1">Reference Edition 2026</p>
              <p className="text-sm opacity-75 mt-2">Comprehensive, authoritative country profiles and statistics</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search countries or official names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {REGIONS.map(r => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  selectedRegion === r 
                    ? 'bg-[#0A2540] text-white' 
                    : 'bg-white border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setViewMode('grid')} className={`px-5 py-3 rounded-xl border ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white'}`}>Grid</button>
            <button onClick={() => setViewMode('list')} className={`px-5 py-3 rounded-xl border ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white'}`}>List</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xl text-gray-500">Loading country profiles...</div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'}>
            
            {filteredCountries.map(country => (
              <div key={country.code} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#0A2540] hover:shadow-xl transition-all group">
                <div className="h-48 bg-gray-100 relative">
                  <img src={country.flag_url} alt={`${country.name_common} flag`} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold group-hover:text-[#0A2540] transition-colors">{country.name_common}</h3>
                  <p className="text-sm text-gray-500 mt-1">{country.region.charAt(0).toUpperCase() + country.region.slice(1)}</p>
                  <div className="mt-6 flex gap-3">
                    <Link 
                      href={`/countries/${country.code}`}
                      className="flex-1 text-center bg-[#0A2540] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#0A2540]/90 transition-colors"
                    >
                      View Full Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

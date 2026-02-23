'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Country {
  code: string;
  name_common: string;
  name_official: string;
  flag_url: string;
  region: string;
  capital: string;
  population: number;
  area_km2: number;
  languages: string[];
  currency: string;
}

const REGIONS = ['All Regions', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

export default function WorldFactbook() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=cca3,name,flags,region,capital,population,area,languages,currencies')
      .then(res => res.json())
      .then((data: any[]) => {
        const transformed: Country[] = data.map(c => ({
          code: c.cca3,
          name_common: c.name.common,
          name_official: c.name.official,
          flag_url: c.flags.svg || c.flags.png || '',
          region: c.region,
          capital: Array.isArray(c.capital) ? c.capital[0] : c.capital || '—',
          population: c.population || 0,
          area_km2: c.area || 0,
          languages: Object.values(c.languages || {}) as string[],
          currency: Object.values(c.currencies || {})
            .map((cur: any) => `${cur.name} (${cur.symbol || ''})`.trim())
            .join(', ') || '—',
        })).sort((a, b) => a.name_common.localeCompare(b.name_common));

        setCountries(transformed);
        setFilteredCountries(transformed);
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
      result = result.filter(c => c.region.toLowerCase() === selectedRegion.toLowerCase());
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
              placeholder="Search countries..."
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
                  selectedRegion === r ? 'bg-[#0A2540] text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xl text-gray-500">Loading 250 countries...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCountries.map(country => (
              <div key={country.code} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#0A2540] hover:shadow-xl transition-all group">
                <div className="h-48 bg-gray-100 relative">
                  <img src={country.flag_url} alt={`${country.name_common} flag`} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold group-hover:text-[#0A2540]">{country.name_common}</h3>
                  <p className="text-sm text-gray-500 mt-1">{country.region}</p>
                  <Link 
                    href={`/countries/${country.code}`}
                    className="mt-6 block text-center bg-[#0A2540] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#0A2540]/90"
                  >
                    View Full Profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

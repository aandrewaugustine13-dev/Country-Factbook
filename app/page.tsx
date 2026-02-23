'use client';

import React, { useState, useEffect } from 'react';

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
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=cca3,name,flags,region,subregion,capital,population,area,languages,demonyms,currencies')
      .then(res => res.json())
      .then((data: any[]) => {
        const transformed: Country[] = data
          .map(country => {
            const name = country.name.common;
            const official = country.name.official;
            const flag = country.flags.svg || country.flags.png;
            const capital = Array.isArray(country.capital) ? country.capital[0] : country.capital || '—';
            const languages = Object.values(country.languages || {}) as string[];
            const currencies = Object.values(country.currencies || {})
              .map((c: any) => `${c.name} (${c.symbol || ''})`.trim())
              .join(', ') || '—';

            return {
              code: country.cca3,
              name_common: name,
              name_official: official,
              flag_url: flag,
              region: country.region.toLowerCase(),
              subregion: country.subregion || '',
              capital,
              population: country.population || 0,
              area_km2: country.area || 0,
              population_density_per_km2: country.area ? Number((country.population / country.area).toFixed(1)) : 0,
              languages,
              demonym: (country.demonyms?.eng?.m || country.demonyms?.eng?.f || name + ' citizen'),
              currency: currencies,
            };
          })
          .sort((a, b) => a.name_common.localeCompare(b.name_common));

        setCountries(transformed);
        setFilteredCountries(transformed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter logic
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
      {/* Professional header - exact style and tone of original Factbook */}
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
        {/* Search + filters - clean and functional */}
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
              <div
                key={country.code}
                onClick={() => setSelectedCountry(country)}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-[#0A2540] hover:shadow-xl transition-all group"
              >
                <div className="h-48 bg-gray-100 relative">
                  <img src={country.flag_url} alt={`${country.name_common} flag`} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold group-hover:text-[#0A2540] transition-colors">{country.name_common}</h3>
                  <p className="text-sm text-gray-500 mt-1">{country.region.charAt(0).toUpperCase() + country.region.slice(1)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clean modal - no jokes, factual only */}
      {selectedCountry && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4" onClick={() => setSelectedCountry(null)}>
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-auto rounded-3xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-6">
                <img src={selectedCountry.flag_url} alt="flag" className="w-24 h-auto rounded-xl shadow" />
                <div>
                  <h2 className="text-4xl font-bold">{selectedCountry.name_common}</h2>
                  <p className="text-xl text-gray-600">{selectedCountry.name_official}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCountry(null)} className="text-4xl text-gray-400 hover:text-gray-900">×</button>
            </div>

            <div className="p-8 prose max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-lg">
                <div><strong>Capital:</strong> {selectedCountry.capital}</div>
                <div><strong>Population:</strong> {formatNumber(selectedCountry.population)}</div>
                <div><strong>Area:</strong> {formatNumber(selectedCountry.area_km2)} km²</div>
                <div><strong>Population density:</strong> {selectedCountry.population_density_per_km2} per km²</div>
                <div><strong>Official languages:</strong> {selectedCountry.languages.join(', ')}</div>
                <div><strong>Currency:</strong> {selectedCountry.currency}</div>
              </div>

              <div className="mt-12 pt-8 border-t text-xs text-gray-500">
                Data from public international sources (restcountries.com + verified public datasets). 
                Full detailed sections (Geography, People and Society, Government, Economy, Military, etc.) are planned for the next release using archived Factbook data. 
                This replica is maintained as a free public service.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

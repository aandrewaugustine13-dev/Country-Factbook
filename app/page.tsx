'use client';

import React, { useState, useEffect } from 'react';

interface Country {
  code: string;
  name_common: string;
  name_official: string;
  flag_url: string;
  region: string;
}

interface FullCountry {
  name_common: string;
  name_official: string;
  flag_url: string;
  coat_of_arms?: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area_km2: number;
  languages: string[];
  currency: string;
  borders: string[];
  timezones: string[];
  independent: boolean;
  unMember: boolean;
  google_maps: string;
}

const REGIONS = ['All Regions', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

export default function WorldFactbook() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [fullData, setFullData] = useState<FullCountry | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load basic list
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=cca3,name,flags,region')
      .then(res => res.json())
      .then((data: any[]) => {
        const list = data.map(c => ({
          code: c.cca3,
          name_common: c.name.common,
          name_official: c.name.official,
          flag_url: c.flags.svg || c.flags.png || '',
          region: c.region,
        })).sort((a, b) => a.name_common.localeCompare(b.name_common));

        setCountries(list);
        setFilteredCountries(list);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load countries. Please refresh.');
        setLoading(false);
      });
  }, []);

  // Filter list
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

  // Load full detailed data when country is clicked
  useEffect(() => {
    if (!selectedCountry) {
      setFullData(null);
      return;
    }

    setModalLoading(true);
    fetch(`https://restcountries.com/v3.1/alpha/${selectedCountry.code}`)
      .then(res => res.json())
      .then((data: any) => {
        const c = data[0];
        setFullData({
          name_common: c.name.common,
          name_official: c.name.official,
          flag_url: c.flags.svg || c.flags.png || '',
          coat_of_arms: c.coatOfArms?.svg || c.coatOfArms?.png || '',
          capital: Array.isArray(c.capital) ? c.capital[0] : c.capital || '—',
          region: c.region,
          subregion: c.subregion || '—',
          population: c.population || 0,
          area_km2: c.area || 0,
          languages: Object.values(c.languages || {}) as string[],
          currency: Object.values(c.currencies || {})
            .map((cur: any) => `${cur.name} (${cur.symbol || ''})`.trim())
            .join(', ') || '—',
          borders: c.borders || [],
          timezones: c.timezones || [],
          independent: !!c.independent,
          unMember: !!c.unMember,
          google_maps: c.maps?.googleMaps || '',
        });
        setModalLoading(false);
      })
      .catch(() => {
        setModalLoading(false);
      });
  }, [selectedCountry]);

  const formatNumber = (num: number) => num.toLocaleString();
  const density = (pop: number, area: number) => area ? (pop / area).toFixed(1) : '—';

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

        {loading && <div className="text-center py-20 text-xl text-gray-500">Loading 250 countries...</div>}
        {error && <div className="text-center py-20 text-red-600">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <h3 className="text-2xl font-semibold group-hover:text-[#0A2540]">{country.name_common}</h3>
                  <p className="text-sm text-gray-500 mt-1">{country.region}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCountry && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4" onClick={() => setSelectedCountry(null)}>
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-auto rounded-3xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-6">
                <img src={selectedCountry.flag_url} alt="flag" className="w-28 rounded-2xl shadow" />
                {fullData?.coat_of_arms && <img src={fullData.coat_of_arms} alt="coat of arms" className="w-20 rounded-xl shadow" />}
                <div>
                  <h2 className="text-5xl font-bold tracking-tight">{selectedCountry.name_common}</h2>
                  <p className="text-2xl text-gray-600">{selectedCountry.name_official}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCountry(null)} className="text-5xl text-gray-400 hover:text-gray-900">×</button>
            </div>

            {modalLoading ? (
              <div className="text-center py-20 text-xl text-gray-500">Loading full profile...</div>
            ) : fullData && (
              <div className="p-8 prose prose-lg max-w-none">
                <section className="mb-12">
                  <h3 className="text-3xl font-bold text-[#0A2540] border-b pb-3 mb-6">Introduction</h3>
                  <p><strong>Capital:</strong> {fullData.capital}</p>
                  <p><strong>Independent:</strong> {fullData.independent ? 'Yes' : 'No'}</p>
                  <p><strong>UN Member:</strong> {fullData.unMember ? 'Yes' : 'No'}</p>
                </section>

                <section className="mb-12">
                  <h3 className="text-3xl font-bold text-[#0A2540] border-b pb-3 mb-6">Geography</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg">
                    <div><strong>Region:</strong> {fullData.region}, {fullData.subregion}</div>
                    <div><strong>Area:</strong> {formatNumber(fullData.area_km2)} km²</div>
                    <div><strong>Population density:</strong> {density(fullData.population, fullData.area_km2)} per km²</div>
                    <div><strong>Borders:</strong> {fullData.borders.length ? fullData.borders.join(', ') : 'None (island nation)'}</div>
                  </div>
                </section>

                <section className="mb-12">
                  <h3 className="text-3xl font-bold text-[#0A2540] border-b pb-3 mb-6">People and Society</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg">
                    <div><strong>Population:</strong> {formatNumber(fullData.population)}</div>
                    <div><strong>Languages:</strong> {fullData.languages.join(', ') || '—'}</div>
                  </div>
                </section>

                <section className="mb-12">
                  <h3 className="text-3xl font-bold text-[#0A2540] border-b pb-3 mb-6">Economy</h3>
                  <p className="text-lg"><strong>Currency:</strong> {fullData.currency}</p>
                </section>

                <section className="mb-12">
                  <h3 className="text-3xl font-bold text-[#0A2540] border-b pb-3 mb-6">Transportation &amp; Communications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg">
                    <div><strong>Time zones:</strong> {fullData.timezones.join(', ')}</div>
                  </div>
                  {fullData.google_maps && (
                    <a href={fullData.google_maps} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block bg-[#0A2540] text-white px-8 py-3 rounded-xl hover:bg-[#0A2540]/90 text-sm font-medium">
                      View on Google Maps →
                    </a>
                  )}
                </section>
              </div>
            )}

            <div className="px-8 py-6 border-t text-xs text-gray-500">
              Professional replica of the original CIA World Factbook (Reference Edition 2026). Full narrative text and additional sections (Government, Military, Energy, Transnational Issues) coming in the next update using the complete archived dataset.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

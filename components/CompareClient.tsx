'use client';

import { useMemo, useState } from 'react';

interface CompareClientProps {
  countries: any[];

  // Controlled mode (when parent passes compare state)
  list?: string[];
  addCountry?: (code: string) => void;
  removeCountry?: (code: string) => void;
  clearAll?: () => void;
  reorderCountry?: (fromIndex: number, toIndex: number) => void;
}

export function CompareClient({
  countries,
  list,
  addCountry,
  removeCountry,
  clearAll,
}: CompareClientProps) {
  // Uncontrolled fallback (if parent does NOT pass list/handlers)
  const [internalCodes, setInternalCodes] = useState<string[]>([]);
  const selectedCodes = list ?? internalCodes;

  const handleAddCountry = (code: string) => {
    if (!code) return;

    if (selectedCodes.length >= 10) {
      alert('Maximum 10 countries allowed for comparison');
      return;
    }

    if (selectedCodes.includes(code)) return;

    if (addCountry) addCountry(code);
    else setInternalCodes([...selectedCodes, code]);
  };

  const handleRemoveCountry = (code: string) => {
    if (removeCountry) removeCountry(code);
    else setInternalCodes(selectedCodes.filter((c) => c !== code));
  };

  const handleClearAll = () => {
    if (clearAll) clearAll();
    else setInternalCodes([]);
  };

  const selectedCountries = useMemo(() => {
    return selectedCodes
      .map((code) => countries.find((c: any) => c.code === code))
      .filter(Boolean);
  }, [countries, selectedCodes]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">Country Factbook 2026</h1>
      <p className="text-xl text-gray-600 mb-8">
        Compare up to 10 countries side-by-side
      </p>

      {/* Add country selector */}
      <div className="mb-10">
        <div className="flex gap-3 max-w-md">
          <select
            onChange={(e) => handleAddCountry(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            defaultValue=""
          >
            <option value="" disabled>
              Select a country to add...
            </option>
            {countries
              .filter((c: any) => !selectedCodes.includes(c.code))
              .map((country: any) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
          </select>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {selectedCodes.length}/10 countries selected
        </p>
      </div>

      {/* Selected countries chips */}
      {selectedCountries.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Selected Countries</h2>
            <button
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {selectedCountries.map((country: any) => (
              <div
                key={country.code}
                className="bg-white border border-gray-200 px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm"
              >
                <span className="font-medium">{country.name}</span>
                <button
                  onClick={() => handleRemoveCountry(country.code)}
                  className="text-red-500 hover:text-red-600 text-2xl leading-none -mt-0.5"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison area */}
      {selectedCountries.length > 1 ? (
        <div className="border border-gray-200 rounded-3xl p-8 bg-white shadow">
          <h2 className="text-2xl font-semibold mb-6">
            Side-by-side comparison ({selectedCountries.length} countries)
          </h2>

          {/* Put your CompareTable, CompareBarChart, WealthHealthScatter, etc. here */}
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl">
            <p className="text-gray-400 text-lg">
              Your comparison charts &amp; table go here
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Paste your &lt;CompareTable /&gt;, &lt;CompareBarChart /&gt;, etc.
              inside this block
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          Add at least 2 countries to see the comparison
        </div>
      )}
    </div>
  );
}

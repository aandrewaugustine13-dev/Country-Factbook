'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

type Country = {
  code: string;
  name: string;
  population?: number;
  area?: number;
  gdp_per_capita?: number;
  life_expectancy?: number;
  median_age?: number;
  internet_users_percent?: number;
  urbanization_percent?: number;
  languages?: string[];
  currency?: string;
};

export default function CompareClient({ countries }: { countries: Country[] }) {
  const searchParams = useSearchParams();

  const selectedCodes = searchParams.getAll('c');

  const selectedCountries = useMemo(() => {
    return countries.filter((c) => selectedCodes.includes(c.code));
  }, [countries, selectedCodes]);

  if (selectedCountries.length === 0) {
    return (
      <div className="text-sm opacity-70">
        No countries selected. Add query params like ?c=USA&c=CAN
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-gray-300">
        <thead>
          <tr>
            <th className="p-2 border">Metric</th>
            {selectedCountries.map((c) => (
              <th key={c.code} className="p-2 border">
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {renderRow('Population', selectedCountries, 'population')}
          {renderRow('Area (km²)', selectedCountries, 'area')}
          {renderRow('GDP per Capita', selectedCountries, 'gdp_per_capita')}
          {renderRow('Life Expectancy', selectedCountries, 'life_expectancy')}
          {renderRow('Median Age', selectedCountries, 'median_age')}
          {renderRow('Internet %', selectedCountries, 'internet_users_percent')}
          {renderRow('Urbanization %', selectedCountries, 'urbanization_percent')}
        </tbody>
      </table>
    </div>
  );
}

function renderRow(
  label: string,
  countries: Country[],
  key: keyof Country
) {
  return (
    <tr key={label}>
      <td className="p-2 border font-medium">{label}</td>
      {countries.map((c) => (
        <td key={c.code} className="p-2 border text-right">
          {c[key] ?? '—'}
        </td>
      ))}
    </tr>
  );
}

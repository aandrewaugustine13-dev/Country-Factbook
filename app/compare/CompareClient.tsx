'use client';

import { useSearchParams } from 'next/navigation';

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
};

export default function CompareClient({
  countries,
}: {
  countries: Country[];
}) {
  const searchParams = useSearchParams();

  // Read ?c=USA&c=CAN style params
  const selectedCodes = searchParams.getAll('c');

  // Filter selected countries
  const selected = countries.filter((c) =>
    selectedCodes.includes(c.code)
  );

  if (!selected.length) {
    return <div>No countries selected.</div>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={cellStyle}>Metric</th>
            {selected.map((c) => (
              <th key={c.code} style={cellStyle}>
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {row('Population', selected, 'population')}
          {row('Area', selected, 'area')}
          {row('GDP per Capita', selected, 'gdp_per_capita')}
          {row('Life Expectancy', selected, 'life_expectancy')}
          {row('Median Age', selected, 'median_age')}
          {row('Internet %', selected, 'internet_users_percent')}
          {row('Urbanization %', selected, 'urbanization_percent')}
        </tbody>
      </table>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  border: '1px solid #999',
  padding: '8px',
  textAlign: 'right',
};

function row(
  label: string,
  countries: Country[],
  key: keyof Country
) {
  return (
    <tr key={label}>
      <td style={{ ...cellStyle, textAlign: 'left', fontWeight: 600 }}>
        {label}
      </td>
      {countries.map((c) => (
        <td key={c.code} style={cellStyle}>
          {c[key] ?? '—'}
        </td>
      ))}
    </tr>
  );
}

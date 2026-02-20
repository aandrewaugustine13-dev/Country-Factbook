'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CountrySearchItem } from '@/src/types';

export function HomeClient({ countries }: { countries: CountrySearchItem[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) =>
      `${c.name_common} ${c.code} ${c.region}`.toLowerCase().includes(q)
    );
  }, [countries, query]);

  return (
    <>
      <label htmlFor="search" className="sr-only">Search countries</label>
      <input
        id="search"
        className="search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by country, code, or region"
      />
      <ul className="country-grid" aria-label="Country list">
        {filtered.map((country) => (
          <li key={country.code}>
            <Link className="country-card" href={`/${country.code}`}>
              <Image src={country.flag_url} alt={`Flag of ${country.name_common}`} width={56} height={40} />
              <div>
                <h2>{country.name_common}</h2>
                <p>{country.region}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

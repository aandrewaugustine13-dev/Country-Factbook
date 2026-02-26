'use client';

import { useMemo, useState } from 'react';

interface PickerCountry { code: string; name: string; flag_url: string; region: string; }

export function CountryPicker({ countries, selected, onAdd }: { countries: PickerCountry[]; selected: string[]; onAdd: (code: string) => void; }) {
  const [query, setQuery] = useState('');
  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return countries.filter((c) => !selected.includes(c.code) && (`${c.name} ${c.code}`).toLowerCase().includes(q)).slice(0, 8);
  }, [countries, query, selected]);

  return (
    <div>
      <label htmlFor="compare-search" className="sr-only">Add country to compare</label>
      <input id="compare-search" className="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search country to add…" />
      {options.length > 0 && (
        <div className="compare-dropdown">
          {options.map((c) => (
            <button key={c.code} className="compare-dropdown-item" onClick={() => { onAdd(c.code); setQuery(''); }} aria-label={`Add ${c.name} to compare`}>
              <img src={c.flag_url} alt="" width={22} height={14} />
              <span>{c.name}</span>
              <span className="dropdown-region">{c.region}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

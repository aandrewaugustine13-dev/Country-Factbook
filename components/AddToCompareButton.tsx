'use client';

import { useState } from 'react';
import { addCountry, COMPARE_STORAGE_KEY } from '@/src/compare-state';
import { COMPARE_UPDATED_EVENT } from '@/src/useCompareState';

export function AddToCompareButton({ code }: { code: string }) {
  const [added, setAdded] = useState(false);

  function handleClick() {
    let current: string[] = [];
    try {
      const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      current = Array.isArray(parsed) ? parsed.map((x) => String(x)) : [];
    } catch {
      current = [];
    }

    const next = addCountry(current, code);
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(COMPARE_UPDATED_EVENT, { detail: { count: next.length } }));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div style={{ marginTop: '0.35rem' }}>
      <button className="fb-toggle-all" onClick={handleClick} aria-label="Add this country to compare">
        Add to Compare
      </button>
      {added && <span className="compare-added-msg">Added</span>}
    </div>
  );
}

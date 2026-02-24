'use client';

import { useRouter } from 'next/navigation';
import { addCountry, COMPARE_STORAGE_KEY, listToQuery } from '@/src/compare-state';

export function AddToCompareButton({ code }: { code: string }) {
  const router = useRouter();

  function handleClick() {
    let list: string[] = [];
    try {
      const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (stored) list = JSON.parse(stored);
    } catch {}
    const next = addCountry(list, code);
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(next));
    router.push(`/compare?${listToQuery(next)}`);
  }

  return <button className="fb-toggle-all" onClick={handleClick} aria-label="Add this country to compare">Add to Compare</button>;
}

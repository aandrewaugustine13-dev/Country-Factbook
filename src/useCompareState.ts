'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { addCountry, clearAll, COMPARE_STORAGE_KEY, listToQuery, parseQueryToList, removeCountry, reorderCountry } from './compare-state';

export function useCompareState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const queryList = useMemo(() => parseQueryToList(queryString), [queryString]);
  const [list, setList] = useState<string[]>(queryList);

  useEffect(() => {
    if (queryList.length > 0 || queryString.includes('c=')) {
      setList(queryList);
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(queryList));
      return;
    }
    const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const fallback = parsed.map((x) => String(x));
        setList(fallback);
        const q = listToQuery(fallback);
        router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
      }
    } catch {}
  }, [pathname, queryList, queryString, router]);

  const update = (next: string[]) => {
    setList(next);
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(next));
    const q = listToQuery(next);
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  return {
    list,
    addCountry: (code: string) => update(addCountry(list, code)),
    removeCountry: (code: string) => update(removeCountry(list, code)),
    clearAll: () => update(clearAll()),
    reorderCountry: (from: number, to: number) => update(reorderCountry(list, from, to)),
  };
}

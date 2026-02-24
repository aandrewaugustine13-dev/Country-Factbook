'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CompareClient as CompareView } from '@/components/CompareClient';
import {
  addCountry,
  clearAll,
  COMPARE_STORAGE_KEY,
  listToQuery,
  parseQueryToList,
  removeCountry,
  reorderCountry,
} from '@/src/compare-state';

export default function CompareClient({ countries }: { countries: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const queryList = useMemo(() => parseQueryToList(queryString), [queryString]);
  const [list, setList] = useState<string[] | null>(null);

  useEffect(() => {
    const hasCompareParams = queryList.length > 0 || queryString.includes('c=');
    if (hasCompareParams) {
      setList(queryList);
      return;
    }

    const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!stored) {
      setList([]);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const fallback = Array.isArray(parsed) ? parsed.map((x) => String(x)) : [];
      setList(fallback);
    } catch {
      setList([]);
    }
  }, [queryList, queryString]);

  useEffect(() => {
    if (list === null) return;

    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(list));
    const nextQuery = listToQuery(list);

    if (nextQuery !== queryString) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }
  }, [list, pathname, queryString, router]);

  if (list === null) {
    return <div className="p-4">Loading comparison…</div>;
  }

  return (
    <CompareView
      countries={countries}
      list={list}
      addCountry={(code) => setList((prev) => addCountry(prev ?? [], code))}
      removeCountry={(code) => setList((prev) => removeCountry(prev ?? [], code))}
      clearAll={() => setList(clearAll())}
      reorderCountry={(fromIndex, toIndex) =>
        setList((prev) => reorderCountry(prev ?? [], fromIndex, toIndex))
      }
    />
  );
}

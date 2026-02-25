'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  addCountry,
  COMPARE_STORAGE_KEY,
  listToQuery,
  parseQueryToList,
  removeCountry,
  reorderCountry,
} from './compare-state';

export const COMPARE_UPDATED_EVENT = 'factbook:compare-updated';

function readStoredList(): string[] {
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((x) => String(x).toUpperCase()) : [];
  } catch {
    return [];
  }
}

export function useCompareState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const queryList = useMemo(() => parseQueryToList(queryString), [queryString]);
  const [list, setList] = useState<string[] | null>(null);

  useEffect(() => {
    const hasQuery = queryList.length > 0 || queryString.includes('c=');
    setList(hasQuery ? queryList : readStoredList());
  }, [queryList, queryString]);

  useEffect(() => {
    if (list === null) return;
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(COMPARE_UPDATED_EVENT, { detail: { count: list.length } }));

    const nextQuery = listToQuery(list);
    if (nextQuery !== queryString) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }
  }, [list, pathname, queryString, router]);

  const setFromUpdater = useCallback((updater: (current: string[]) => string[]) => {
    setList((current) => updater(current ?? []));
  }, []);

  return {
    list,
    addCountry: (code: string) => setFromUpdater((current) => addCountry(current, code)),
    removeCountry: (code: string) => setFromUpdater((current) => removeCountry(current, code)),
    clearAll: () => setFromUpdater(() => []),
    reorderCountry: (fromIndex: number, toIndex: number) =>
      setFromUpdater((current) => reorderCountry(current, fromIndex, toIndex)),
  };
}

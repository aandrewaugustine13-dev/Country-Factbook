'use client';

import { useEffect, useState } from 'react';
import { COMPARE_STORAGE_KEY, parseQueryToList } from '@/src/compare-state';
import { COMPARE_UPDATED_EVENT } from '@/src/useCompareState';

function readStoredCount() {
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? Math.min(parsed.length, 10) : 0;
  } catch {
    return 0;
  }
}

export function CompareNavButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      const fromUrl = parseQueryToList(window.location.search).length;
      setCount(fromUrl > 0 ? fromUrl : readStoredCount());
    };

    const onUpdate = (event: Event) => {
      const custom = event as CustomEvent<{ count?: number }>;
      const detailCount = custom.detail?.count;
      setCount(typeof detailCount === 'number' ? Math.min(detailCount, 10) : readStoredCount());
    };

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    window.addEventListener(COMPARE_UPDATED_EVENT, onUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener(COMPARE_UPDATED_EVENT, onUpdate as EventListener);
    };
  }, []);

  return (
    <span aria-label={`Compare (${count} selected)`}>
      📊 Compare <span className="nav-badge">{count}</span>
    </span>
  );
}

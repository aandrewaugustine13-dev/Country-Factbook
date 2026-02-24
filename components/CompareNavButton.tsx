'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { COMPARE_STORAGE_KEY, parseQueryToList } from '@/src/compare-state';

export function CompareNavButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      const fromUrl = parseQueryToList(window.location.search).length;
      if (fromUrl > 0) { setCount(fromUrl); return; }
      const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (!stored) { setCount(0); return; }
      try { setCount((JSON.parse(stored) as string[]).length); } catch { setCount(0); }
    };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('focus', sync); };
  }, []);

  return <Link href="/compare" className="nav-compare" aria-label={`Open compare page (${count} selected)`}>Compare <span className="nav-badge">{count}</span></Link>;
}

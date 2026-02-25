'use client';

import { CompareClient as CompareView } from '@/components/CompareClient';
import { useCompareState } from '@/src/useCompareState';

export default function CompareClient({ countries }: { countries: any[] }) {
  const { list, addCountry, removeCountry, clearAll, reorderCountry } =
    useCompareState();

  if (list === null) {
    return <div>Loading comparison…</div>;
  }

  return (
    <CompareView
      countries={countries}
      list={list}
      addCountry={addCountry}
      removeCountry={removeCountry}
      clearAll={clearAll}
      reorderCountry={reorderCountry}
    />
  );
}

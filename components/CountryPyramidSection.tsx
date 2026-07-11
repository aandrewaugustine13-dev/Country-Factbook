'use client';

import { PopulationPyramid } from './PopulationPyramid';
import type { PopulationPyramid as PyramidData } from '@/src/population-pyramid';
import Link from 'next/link';

/** Compact pyramid block for individual country pages. */
export function CountryPyramidSection({ data }: { data: PyramidData }) {
  return (
    <section className="country-pyramid-section" aria-label="Population pyramid">
      <div className="panel-label" style={{ marginBottom: '0.75rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)' }}>
          Population pyramid
        </h2>
        <Link href={`/pyramids?c=${data.code}`} className="pyramid-profile-link">
          Compare with others →
        </Link>
      </div>
      <PopulationPyramid data={data} mode="percent" showGuide={false} compact height={220} />
    </section>
  );
}

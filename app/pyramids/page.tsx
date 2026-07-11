import Link from 'next/link';
import pyramidData from '@/data/population-pyramids.json';
import { PyramidsClient } from '@/components/PyramidsClient';
import type { PopulationPyramid } from '@/src/population-pyramid';

export const metadata = {
  title: 'Population Pyramids — World Factbook',
  description:
    'Compare population pyramids for 2–4 countries. Built for 9th-grade World Geography.',
};

export default function PyramidsPage() {
  const pyramids = pyramidData as PopulationPyramid[];

  return (
    <div className="container">
      <Link href="/" className="back-link">
        ← Back to dashboard
      </Link>
      <h1 className="page-title">Population pyramids</h1>
      <p className="page-lead">
        Compare age and sex structure across countries. Choose 1–4 nations, read the shapes, and
        discuss what the base and top of each pyramid tell us about young and aging populations.
      </p>
      <PyramidsClient pyramids={pyramids} />
    </div>
  );
}

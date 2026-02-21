import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import index from '@/data/index.json';

export function generateStaticParams() {
  return (index as string[]).map((code) => ({ code }));
}

async function getCountry(code: string) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'countries', `${code}.json`);
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const country = await getCountry(code.toUpperCase());
  if (!country) notFound();

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 font-serif text-gray-900 bg-white">
      <p className="mb-8"><Link href="/" className="text-blue-600 hover:underline">← Back to all countries</Link></p>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start border-b pb-10 mb-12">
        <Image 
          src={country.flag_url || ''} 
          alt={country.flag_alt || ''} 
          width={180} 
          height={120} 
          className="rounded shadow-md" 
        />
        <div>
          <h1 className="text-6xl font-bold tracking-tight">{country.name_common}</h1>
          <p className="text-3xl text-gray-700 mt-2">{country.name_official}</p>
          <p className="text-xl text-gray-600 mt-4">The World Factbook • 2026 Edition</p>
        </div>
      </div>

      {/* Introduction */}
      <section className="mb-14 max-w-3xl">
        <h2 className="uppercase text-sm font-bold tracking-widest mb-4 text-gray-600">Introduction</h2>
        <p className="text-lg leading-relaxed text-gray-900">
          {country.summary || 'Summary coming soon.'}
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
        <section>
          <h2 className="uppercase text-sm font-bold tracking-widest mb-5 text-gray-600">Geography</h2>
          <dl className="space-y-4 text-base">
            <div><dt className="font-medium inline">Capital</dt><dd className="ml-3 inline">{country.capital || '—'}</dd></div>
            <div><dt className="font-medium inline">Region</dt><dd className="ml-3 inline">{country.region} — {country.subregion || '—'}</dd></div>
          </dl>
        </section>

        <section>
          <h2 className="uppercase text-sm font-bold tracking-widest mb-5 text-gray-600">Basic Info</h2>
          <dl className="space-y-4 text-base">
            <div><dt className="font-medium inline">Languages</dt><dd className="ml-3 inline">{country.languages?.join(', ') || '—'}</dd></div>
            <div><dt className="font-medium inline">Time zones</dt><dd className="ml-3 inline">{country.timezones?.join(', ') || '—'}</dd></div>
            <div><dt className="font-medium inline">Currency</dt><dd className="ml-3 inline">{country.currency || '—'}</dd></div>
          </dl>
        </section>
      </div>

      <section className="mt-16 pt-10 border-t text-sm text-gray-600">
        <p className="text-xs">Full detailed profile (literacy, independence, agriculture, real GDP rank, etc.) coming in the next update.</p>
      </section>
    </main>
  );
}

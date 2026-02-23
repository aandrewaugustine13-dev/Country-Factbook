import { notFound } from 'next/navigation';
import Link from 'next/link';

async function getCountry(code: string) {
  const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`, { 
    next: { revalidate: 3600 } 
  });
  if (!res.ok) return null;
  const data = await res.json();
  const c = data[0];
  return {
    code: c.cca3,
    name_common: c.name.common,
    name_official: c.name.official,
    flag_url: c.flags.svg || c.flags.png || '',
    region: c.region,
    capital: Array.isArray(c.capital) ? c.capital[0] : c.capital || '—',
    population: c.population || 0,
    area_km2: c.area || 0,
    languages: Object.values(c.languages || {}) as string[],
    currency: Object.values(c.currencies || {})
      .map((cur: any) => `${cur.name} (${cur.symbol || ''})`.trim())
      .join(', ') || '—',
  };
}

export default async function CountryPage({ params }: { params: { code: string } }) {
  const country = await getCountry(params.code.toUpperCase());
  if (!country) notFound();

  const formatNumber = (num: number) => num.toLocaleString();
  const density = (pop: number, area: number) => area ? (pop / area).toFixed(1) : '—';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-50 bg-[#0A2540] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🌍</div>
            <div>
              <h1 className="text-3xl font-bold">THE WORLD FACTBOOK</h1>
              <p className="text-sm opacity-75">Reference Edition 2026</p>
            </div>
          </div>
          <Link href="/" className="text-white hover:underline">← Back to all countries</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3">
            <img src={country.flag_url} alt="flag" className="w-full rounded-3xl shadow-2xl" />
            <div className="mt-8 bg-white p-8 rounded-3xl shadow">
              <h2 className="text-5xl font-bold tracking-tight">{country.name_common}</h2>
              <p className="text-2xl text-gray-600 mt-2">{country.name_official}</p>
            </div>
          </div>

          <div className="md:w-2/3 prose prose-lg max-w-none">
            <section className="mb-12">
              <h3 className="text-3xl font-bold text-[#0A2540] border-b pb-4 mb-6">Introduction</h3>
              <p><strong>Capital:</strong> {country.capital}</p>
            </section>

            <section className="mb-12">
              <h3 className="text-3xl font-bold text-[#0A2540] border-b pb-4 mb-6">Geography</h3>
              <p><strong>Region:</strong> {country.region}</p>
              <p><strong>Area:</strong> {formatNumber(country.area_km2)} km²</p>
              <p><strong>Population density:</strong> {density(country.population, country.area_km2)} per km²</p>
            </section>

            <section className="mb-12">
              <h3 className="text-3xl font-bold text-[#0A2540] border-b pb-4 mb-6">People and Society</h3>
              <p><strong>Population:</strong> {formatNumber(country.population)}</p>
              <p><strong>Languages:</strong> {country.languages.join(', ') || '—'}</p>
            </section>

            <section className="mb-12">
              <h3 className="text-3xl font-bold text-[#0A2540] border-b pb-4 mb-6">Economy</h3>
              <p><strong>Currency:</strong> {country.currency}</p>
            </section>

            <p className="text-xs text-gray-500 mt-16 border-t pt-8">
              Professional replica of the original CIA World Factbook (Reference Edition 2026).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

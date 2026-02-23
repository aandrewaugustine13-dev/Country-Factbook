import { notFound } from 'next/navigation';
import countriesData from '../../../data/all-countries.json';

interface Country {
  code: string;
  name_common: string;
  name_official: string;
  flag_url: string;
  region: string;
  subregion: string;
  capital: string;
  population: number;
  area_km2: number;
  population_density_per_km2: number;
  languages: string[];
  demonym: string;
  currency: string;
}

export async function generateStaticParams() {
  return countriesData.map((country: Country) => ({
    code: country.code,
  }));
}

export default function CountryPage({ params }: { params: { code: string } }) {
  const country = countriesData.find((c: Country) => c.code === params.code.toUpperCase()) as Country | undefined;

  if (!country) notFound();

  const formatNumber = (num: number) => num.toLocaleString();

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
          <a href="/" className="text-white hover:underline">← Back to all countries</a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3">
            <img src={country.flag_url} alt={country.name_common} className="w-full rounded-3xl shadow-2xl" />
            <div className="mt-8 bg-white p-8 rounded-3xl shadow">
              <h2 className="text-5xl font-bold tracking-tight">{country.name_common}</h2>
              <p className="text-2xl text-gray-600 mt-2">{country.name_official}</p>
              <div className="mt-8 grid grid-cols-2 gap-y-6 text-lg">
                <div><strong>Capital</strong><br />{country.capital}</div>
                <div><strong>Region</strong><br />{country.region.charAt(0).toUpperCase() + country.region.slice(1)}</div>
                <div><strong>Population</strong><br />{formatNumber(country.population)}</div>
                <div><strong>Area</strong><br />{formatNumber(country.area_km2)} km²</div>
                <div><strong>Density</strong><br />{country.population_density_per_km2} /km²</div>
                <div><strong>Currency</strong><br />{country.currency}</div>
              </div>
            </div>
          </div>

          <div className="md:w-2/3 prose prose-lg max-w-none">
            <h3 className="text-3xl font-semibold border-b pb-4">Country Profile</h3>
            
            <div className="mt-10 space-y-16">
              <section>
                <h4 className="text-2xl font-semibold mb-6 text-[#0A2540]">Geography &amp; People</h4>
                <p><strong>Languages:</strong> {country.languages.join(', ')}</p>
                <p><strong>Demonym:</strong> {country.demonym}</p>
                <p className="text-sm text-gray-500 mt-8">Full sections (Geography, People and Society, Government, Economy, Military &amp; Security, etc.) will be added in the next update using the complete archived Factbook dataset.</p>
              </section>
            </div>

            <div className="mt-16 text-xs text-gray-500 border-t pt-8">
              Data sourced from public international datasets. This is an independent open-source replica maintained for public access.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

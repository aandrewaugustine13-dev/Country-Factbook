import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const countriesDir = path.join(process.cwd(), 'data', 'countries');
const outDir = path.join(process.cwd(), 'data');

async function main() {
  await mkdir(countriesDir, { recursive: true });

  console.log('🚀 Restoring country data (REST Countries only)...');

  const res = await fetch('https://restcountries.com/v3.1/all?fields=cca3,name,capital,region,subregion,flags,unMember');
  const allRest: any[] = await res.json();
  const unCountries = allRest.filter((c: any) => c.unMember === true);

  const index: string[] = [];
  const lightweight: any[] = [];

  for (const rest of unCountries) {
    const code = rest.cca3.toUpperCase();

    const country = {
      code,
      name_common: rest.name.common,
      name_official: rest.name.official,
      capital: Array.isArray(rest.capital) ? rest.capital[0] : (rest.capital || 'N/A'),
      region: rest.region,
      subregion: rest.subregion || null,
      flag_url: rest.flags?.svg || rest.flags?.png || '',
      flag_alt: rest.flags?.alt || `Flag of ${rest.name.common}`,
      summary: 'Full profile with demographics, economy, and government details coming soon.',
    };

    await writeFile(path.join(countriesDir, `${code}.json`), JSON.stringify(country, null, 2));

    index.push(code);
    lightweight.push({
      code,
      name_common: country.name_common,
      flag_url: country.flag_url,
      region: country.region,
    });

    console.log(`✓ ${code} — ${country.name_common}`);
  }

  await writeFile(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
  await writeFile(path.join(outDir, 'all-countries.json'), JSON.stringify(lightweight, null, 2));

  console.log(`\n🎉 Data restored with ${unCountries.length} countries!`);
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});

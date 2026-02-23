import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'data');
mkdirSync(outDir, { recursive: true });

function getCallingCode(idd: { root?: string; suffixes?: string[] }) {
  if (!idd?.root) return '';
  if (!idd.suffixes || idd.suffixes.length > 5) return idd.root;
  if (idd.suffixes.length === 1) return idd.root + idd.suffixes[0];
  return idd.root;
}

async function main() {
  console.log('🚀 Fetching country data from REST Countries API...');

  const res = await fetch(
    'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flags,region,subregion,capital,population,area,languages,currencies,demonyms,tld,idd,landlocked,borders,latlng,independent'
  );
  if (!res.ok) throw new Error('REST Countries API failed: ' + res.status);

  const rawCountries: any[] = await res.json();

  const transformed = rawCountries
    .map((c) => {
      const cca2 = (c.cca2 || '').toLowerCase();
      return {
        code: c.cca3 || '',
        name_common: c.name?.common || '',
        name_official: c.name?.official || '',
        flag_url: c.flags?.png || (cca2 ? `https://flagcdn.com/w320/${cca2}.png` : ''),
        flag_svg: c.flags?.svg || (cca2 ? `https://flagcdn.com/${cca2}.svg` : ''),
        flag_emoji: '',
        region: c.region || 'Unknown',
        subregion: c.subregion || 'Unknown',
        capital: Array.isArray(c.capital) ? c.capital[0] || 'N/A' : 'N/A',
        population: c.population || 0,
        area_km2: c.area || 0,
        languages: Object.values(c.languages || {}),
        demonym: c.demonyms?.eng?.m || c.demonyms?.eng?.f || '',
        currency:
          Object.entries(c.currencies || {})
            .map(([code, cur]: [string, any]) =>
              `${cur.name} (${cur.symbol || code})`.trim()
            )
            .join(', ') || 'N/A',
        tld: c.tld || [],
        calling_code: getCallingCode(c.idd || {}),
        landlocked: c.landlocked || false,
        borders: c.borders || [],
        latlng: c.latlng || [],
        independent: c.independent ?? null,
      };
    })
    .filter((c) => c.code && c.name_common)
    .sort((a, b) => a.name_common.localeCompare(b.name_common));

  const filePath = path.join(outDir, 'all-countries.json');
  writeFileSync(filePath, JSON.stringify(transformed, null, 2));
  console.log(`✅ Wrote ${transformed.length} countries to ${filePath}`);
}

main().catch((err) => {
  console.error('❌ Build failed:', err.message);
  console.error('   Make sure you have internet access. The committed data/all-countries.json');
  console.error('   will be used as a fallback if this script fails.');
  process.exit(1);
});

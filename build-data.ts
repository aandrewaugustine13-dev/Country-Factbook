/**
 * Country-Factbook data build pipeline
 * =====================================
 *
 * Produces:
 *   data/all-countries.json   — base profiles + nested CIA Factbook sections
 *   data/comparison-data.json — numeric/text metrics for compare / quiz / daily
 *
 * Sources:
 *   1. mledoze/countries (GitHub) — ISO codes, names, flags, region, capital, etc.
 *      (REST Countries v3/v4 were shut down; v5 requires an API key. mledoze is
 *       free, public-domain, and matches the old REST Countries shape closely.)
 *   2. factbook/factbook.json — structured CIA World Factbook profiles (public domain)
 *   3. GeoNames countryInfo  — GEC/FIPS → ISO alpha-3 mapping
 *
 * Why not MilkMp/CIA-World-Factbooks-Archive apps-v1.2.2?
 *   That release ships an Android APK (~300 MB) with an offline archive bundle.
 *   Excellent for historical editions; awkward as a primary JSON pipeline input.
 *   factbook.json is cleaner, smaller, and maps 1:1 onto our section UI.
 *   Historical re-runs can still point FACTBOOK_SOURCE at a local clone of the
 *   archive (or any folder of region/*.json files in factbook.json shape).
 *
 * Usage:
 *   npm run build:data
 *   # or:  npx tsx build-data.ts
 *
 * Optional env vars:
 *   FACTBOOK_SOURCE   Local path or GitHub zip URL for factbook.json data.
 *                     Default: latest zipball of factbook/factbook.json master.
 *   COUNTRIES_JSON_URL  Override base-country JSON URL (default: mledoze/countries).
 *   SKIP_FETCH=1      Reuse files under .cache/ when present.
 *
 * Re-running after a new Factbook release:
 *   1. Delete .cache/ (or just .cache/factbook.json.zip) to force a fresh download.
 *   2. npm run build:data
 *   3. Commit data/all-countries.json + data/comparison-data.json
 */

import {
  writeFileSync,
  mkdirSync,
  readFileSync,
  existsSync,
  readdirSync,
  rmSync,
  createWriteStream,
  statSync,
} from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { execFileSync } from 'child_process';
import { extractPyramidFromCountry } from './src/population-pyramid';

// ---------------------------------------------------------------------------
// Paths & configuration
// ---------------------------------------------------------------------------

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const CACHE_DIR = path.join(ROOT, '.cache');

/** Base country metadata (ISO codes, names, flags). Public domain via mledoze/countries. */
const COUNTRIES_JSON_URL =
  process.env.COUNTRIES_JSON_URL ||
  'https://raw.githubusercontent.com/mledoze/countries/master/countries.json';

/** Default: official public-domain factbook.json mirror (GEC codes, weekly updates while CIA was live). */
const DEFAULT_FACTBOOK_ZIP =
  'https://github.com/factbook/factbook.json/archive/refs/heads/master.zip';

const FACTBOOK_SOURCE = process.env.FACTBOOK_SOURCE || DEFAULT_FACTBOOK_ZIP;
const SKIP_FETCH = process.env.SKIP_FETCH === '1';

/** Factbook section titles we surface in the country page UI (stable order). */
const SECTION_ORDER = [
  'Introduction',
  'Geography',
  'People and Society',
  'Environment',
  'Government',
  'Economy',
  'Energy',
  'Communications',
  'Transportation',
  'Military and Security',
  'Space',
  'Terrorism',
  'Transnational Issues',
] as const;

/** Territories that rarely have their own Factbook entry — never invent a match. */
const FORCE_NO_FACTBOOK = new Set([
  'ALA', // Åland Islands
  'SJM', // Svalbard and Jan Mayen (split entries in Factbook)
  'UMI', // U.S. Minor Outlying Islands (Factbook uses um refuges profile)
  'BES', // Bonaire, Sint Eustatius and Saba
  'BLM', // Saint Barthélemy sometimes sparse
]);

/**
 * Extra GEC/FIPS → ISO alpha-3 overrides not covered (or wrong) in GeoNames.
 * Keys are lowercase GEC codes as used in factbook.json filenames.
 */
const GEC_ISO3_OVERRIDES: Record<string, string> = {
  // Special / disputed / non-ISO entities
  we: 'PSE', // West Bank → Palestine (ISO)
  gz: 'PSE', // Gaza Strip → Palestine (ISO) — merged profile preference: later wins unless we merge
  tw: 'TWN', // Taiwan
  kv: 'UNK', // Kosovo (XKX/UNK convention used in this project historically as UNK)
  // Dependencies sometimes missing fips in GeoNames dumps
  dx: '', // Dhekelia — no ISO; skip
  ax: '', // Akrotiri — no ISO; skip
  ip: '', // Clipperton
  bq: '', // Navassa
  wq: '', // Wake
  um: 'UMI',
  pf: '', // Paracel Islands
  pg: '', // Spratly Islands
  // Oceans / world — not countries
  xq: '',
  zh: '',
  xo: '',
  zn: '',
  oo: '',
  xx: '',
  ee: '', // European Union
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FactbookEntry {
  label: string;
  value: string;
}

type FactbookSections = Record<string, FactbookEntry[]>;

interface CountryProfile {
  code: string;
  name_common: string;
  name_official: string;
  flag_url: string;
  flag_svg: string;
  flag_emoji: string;
  region: string;
  subregion: string;
  capital: string;
  area_km2: number;
  languages: string[];
  demonym: string;
  currency: string;
  tld: string[];
  calling_code: string;
  landlocked: boolean;
  borders: string[];
  latlng: number[];
  independent: boolean | null;
  factbook: FactbookSections | null;
}

interface ComparisonRow {
  code: string;
  name: string;
  flag_url: string;
  flag_emoji: string;
  region: string;
  area_km2: number;
  capital: string;
  independent: boolean | null;
  population: number | null;
  life_expectancy: number | null;
  median_age: number | null;
  pop_growth_pct: number | null;
  birth_rate: number | null;
  death_rate: number | null;
  infant_mortality: number | null;
  fertility_rate: number | null;
  urbanization_pct: number | null;
  gdp_ppp: number | null;
  gdp_per_capita: number | null;
  gdp_growth_pct: number | null;
  unemployment_pct: number | null;
  inflation_pct: number | null;
  public_debt_pct: number | null;
  internet_pct: number | null;
  military_pct_gdp: number | null;
  edu_spend_pct_gdp: number | null;
  government_type: string | null;
  religions: string | null;
  ethnic_groups: string | null;
  languages_detail: string | null;
}

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

function log(msg: string) {
  console.log(msg);
}

function ensureDirs() {
  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(CACHE_DIR, { recursive: true });
}

function getCallingCode(idd: { root?: string; suffixes?: string[] }) {
  if (!idd?.root) return '';
  if (!idd.suffixes || idd.suffixes.length > 5) return idd.root;
  if (idd.suffixes.length === 1) return idd.root + idd.suffixes[0];
  return idd.root;
}

/** Strip HTML tags and collapse whitespace while keeping intentional newlines. */
function cleanText(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function normalizeName(s: string): string {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

async function downloadToFile(url: string, dest: string): Promise<void> {
  log(`  ↓ ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  if (!res.body) throw new Error(`No body for ${url}`);
  // @ts-expect-error Node fetch body is a web ReadableStream
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

// ---------------------------------------------------------------------------
// 1) Base country list (mledoze/countries — same shape as legacy REST Countries)
// ---------------------------------------------------------------------------

async function loadBaseCountries(): Promise<CountryProfile[]> {
  const cachePath = path.join(CACHE_DIR, 'mledoze-countries.json');

  let raw: any[];
  if (SKIP_FETCH && existsSync(cachePath)) {
    log('📦 Base countries: using .cache/mledoze-countries.json');
    raw = JSON.parse(readFileSync(cachePath, 'utf8'));
  } else {
    log('🌐 Fetching mledoze/countries…');
    raw = await fetchJson<any[]>(COUNTRIES_JSON_URL);
    if (!Array.isArray(raw)) {
      throw new Error(
        'Base countries response was not an array. Check COUNTRIES_JSON_URL.'
      );
    }
    writeFileSync(cachePath, JSON.stringify(raw));
  }

  const transformed: CountryProfile[] = raw
    .map((c) => {
      const cca2 = (c.cca2 || '').toLowerCase();
      const flagEmoji =
        c.flag ||
        (cca2.length === 2
          ? String.fromCodePoint(
              ...[...cca2.toUpperCase()].map(
                (ch: string) => 0x1f1e6 - 65 + ch.charCodeAt(0)
              )
            )
          : '');
      return {
        code: c.cca3 || '',
        name_common: c.name?.common || '',
        name_official: c.name?.official || '',
        flag_url:
          c.flags?.png ||
          (cca2 ? `https://flagcdn.com/w320/${cca2}.png` : ''),
        flag_svg:
          c.flags?.svg || (cca2 ? `https://flagcdn.com/${cca2}.svg` : ''),
        flag_emoji: flagEmoji,
        region: c.region || 'Unknown',
        subregion: c.subregion || 'Unknown',
        capital: Array.isArray(c.capital) ? c.capital[0] || 'N/A' : 'N/A',
        area_km2: typeof c.area === 'number' ? c.area : 0,
        languages: Object.values(c.languages || {}) as string[],
        demonym: c.demonyms?.eng?.m || c.demonyms?.eng?.f || '',
        currency:
          Object.entries(c.currencies || {})
            .map(([code, cur]: [string, any]) =>
              `${cur.name} (${cur.symbol || code})`.trim()
            )
            .join(', ') || 'N/A',
        tld: c.tld || [],
        calling_code: getCallingCode(c.idd || {}),
        landlocked: !!c.landlocked,
        borders: c.borders || [],
        latlng: c.latlng || [],
        independent: c.independent ?? null,
        factbook: null,
      };
    })
    .filter((c) => c.code && c.name_common)
    .sort((a, b) => a.name_common.localeCompare(b.name_common));

  log(`  → ${transformed.length} base country profiles`);
  return transformed;
}

// ---------------------------------------------------------------------------
// 2) GEC/FIPS → ISO alpha-3 map (GeoNames + overrides)
// ---------------------------------------------------------------------------

async function loadGecToIso3(): Promise<Map<string, string>> {
  const cachePath = path.join(CACHE_DIR, 'geonames-countryInfo.txt');
  const map = new Map<string, string>();

  if (!existsSync(cachePath) || !SKIP_FETCH) {
    log('🌐 Fetching GeoNames countryInfo (FIPS ↔ ISO)…');
    await downloadToFile(
      'https://download.geonames.org/export/dump/countryInfo.txt',
      cachePath
    );
  } else {
    log('📦 GeoNames: using cached countryInfo.txt');
  }

  const text = readFileSync(cachePath, 'utf8');
  for (const line of text.split('\n')) {
    if (!line || line.startsWith('#')) continue;
    // ISO, ISO3, ISO-Numeric, fips, Country, ...
    const cols = line.split('\t');
    const iso3 = (cols[1] || '').trim().toUpperCase();
    const fips = (cols[3] || '').trim().toLowerCase();
    if (iso3 && fips) map.set(fips, iso3);
  }

  for (const [gec, iso3] of Object.entries(GEC_ISO3_OVERRIDES)) {
    if (iso3) map.set(gec.toLowerCase(), iso3.toUpperCase());
    else map.delete(gec.toLowerCase());
  }

  // Manual fixes for known GeoNames/Factbook quirks
  // Burma (bm) → Myanmar MM R; Factbook still uses "Burma"
  map.set('bm', 'MMR');
  // Czechia
  map.set('ez', 'CZE');
  // Eswatini (was Swaziland wz)
  map.set('wz', 'SWZ');
  // North Macedonia
  map.set('mk', 'MKD');
  // Cape Verde / Cabo Verde
  map.set('cv', 'CPV');
  // East Timor
  map.set('tt', 'TLS');
  // Kosovo — project uses UNK historically
  map.set('kv', 'UNK');
  // Palestine components
  map.set('we', 'PSE');
  map.set('gz', 'PSE');

  log(`  → ${map.size} GEC→ISO3 mappings`);
  return map;
}

// ---------------------------------------------------------------------------
// 3) Load factbook.json (zip or local directory)
// ---------------------------------------------------------------------------

function findFactbookRoot(extracted: string): string {
  // Zipball unpacks to factbook.json-master/ or similar
  const entries = readdirSync(extracted);
  for (const e of entries) {
    const p = path.join(extracted, e);
    if (statSync(p).isDirectory()) {
      // Prefer directory that contains region folders
      if (existsSync(path.join(p, 'europe')) || existsSync(path.join(p, 'africa'))) {
        return p;
      }
    }
  }
  if (existsSync(path.join(extracted, 'europe'))) return extracted;
  throw new Error(`Could not locate factbook region folders under ${extracted}`);
}

async function ensureFactbookDir(): Promise<string> {
  // Local directory path
  if (!FACTBOOK_SOURCE.startsWith('http') && existsSync(FACTBOOK_SOURCE)) {
    log(`📁 Using local FACTBOOK_SOURCE: ${FACTBOOK_SOURCE}`);
    return findFactbookRoot(FACTBOOK_SOURCE);
  }

  const zipPath = path.join(CACHE_DIR, 'factbook.json.zip');
  const extractDir = path.join(CACHE_DIR, 'factbook.json');

  if (SKIP_FETCH && existsSync(extractDir)) {
    log('📦 Factbook: using cached extract');
    return findFactbookRoot(extractDir);
  }

  if (!SKIP_FETCH || !existsSync(zipPath)) {
    log('🌐 Downloading factbook.json archive…');
    await downloadToFile(FACTBOOK_SOURCE, zipPath);
  }

  // Clean extract dir then unzip
  if (existsSync(extractDir)) rmSync(extractDir, { recursive: true, force: true });
  mkdirSync(extractDir, { recursive: true });

  log('📦 Extracting factbook.json…');
  try {
    execFileSync('unzip', ['-q', '-o', zipPath, '-d', extractDir], { stdio: 'inherit' });
  } catch {
    // Fallback: Python zipfile (always available on most systems)
    execFileSync(
      'python3',
      ['-c', `import zipfile; zipfile.ZipFile(${JSON.stringify(zipPath)}).extractall(${JSON.stringify(extractDir)})`],
      { stdio: 'inherit' }
    );
  }

  return findFactbookRoot(extractDir);
}

/**
 * Flatten nested factbook.json field trees into a single multi-line string.
 * Leaf nodes are usually { text: "..." }; intermediate keys become "key: value" lines.
 */
function flattenFieldValue(node: unknown, depth = 0): string {
  if (node == null) return '';
  if (typeof node === 'string') return cleanText(node);
  if (typeof node !== 'object') return String(node);

  const obj = node as Record<string, unknown>;

  // Common leaf: { text: "..." }
  if (typeof obj.text === 'string' && Object.keys(obj).length === 1) {
    return cleanText(obj.text);
  }

  const parts: string[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (key === 'text' && typeof val === 'string') {
      parts.push(cleanText(val));
      continue;
    }
    const nested = flattenFieldValue(val, depth + 1);
    if (!nested) continue;
    // Heuristic: note-like keys or pure text children
    if (key === 'note' || key.trim() === 'note') {
      parts.push(nested.startsWith('note') ? nested : `note: ${nested}`);
    } else if (!nested.includes('\n') && nested.length < 200) {
      parts.push(`${key.trim()}: ${nested}`);
    } else {
      parts.push(`${key.trim()}:\n${nested}`);
    }
  }
  return parts.join('\n').trim();
}

/** Convert one factbook.json country document → our section map. */
function convertFactbookDoc(doc: Record<string, unknown>): FactbookSections {
  const sections: FactbookSections = {};

  for (const sectionName of Object.keys(doc)) {
    // Skip meta keys if any
    if (sectionName.startsWith('_')) continue;
    const section = doc[sectionName];
    if (!section || typeof section !== 'object' || Array.isArray(section)) continue;

    const entries: FactbookEntry[] = [];
    for (const [fieldName, fieldVal] of Object.entries(section as Record<string, unknown>)) {
      const value = flattenFieldValue(fieldVal);
      if (!value) continue;
      entries.push({ label: fieldName.trim(), value });
    }

    if (entries.length) {
      // Normalize a few historical section name variants
      let name = sectionName;
      if (name === 'People & Society') name = 'People and Society';
      if (name === 'Military & Security') name = 'Military and Security';
      if (name === 'Transnational issues') name = 'Transnational Issues';
      sections[name] = entries;
    }
  }

  // Prefer stable ordering when serializing later
  const ordered: FactbookSections = {};
  for (const s of SECTION_ORDER) {
    if (sections[s]) ordered[s] = sections[s];
  }
  for (const [k, v] of Object.entries(sections)) {
    if (!ordered[k]) ordered[k] = v;
  }
  return ordered;
}

interface LoadedFactbook {
  /** ISO3 → factbook sections */
  byIso3: Map<string, FactbookSections>;
  /** ISO3 → original GEC code(s) */
  gecByIso3: Map<string, string[]>;
  unmatchedGec: string[];
}

async function loadAllFactbooks(gecToIso3: Map<string, string>): Promise<LoadedFactbook> {
  const root = await ensureFactbookDir();
  const byIso3 = new Map<string, FactbookSections>();
  const gecByIso3 = new Map<string, string[]>();
  const unmatchedGec: string[] = [];

  const regionDirs = readdirSync(root).filter((name) => {
    const p = path.join(root, name);
    return (
      statSync(p).isDirectory() &&
      !['meta', 'world', 'oceans', '.git'].includes(name)
    );
  });

  let fileCount = 0;
  for (const region of regionDirs) {
    const dir = path.join(root, region);
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.json')) continue;
      const gec = file.replace(/\.json$/i, '').toLowerCase();
      const iso3 = gecToIso3.get(gec);
      if (!iso3) {
        unmatchedGec.push(`${region}/${file}`);
        continue;
      }

      const doc = JSON.parse(readFileSync(path.join(dir, file), 'utf8'));
      const sections = convertFactbookDoc(doc);

      // If multiple GEC map to same ISO (e.g. West Bank + Gaza → PSE), merge sections
      const existing = byIso3.get(iso3);
      if (existing) {
        for (const [sec, entries] of Object.entries(sections)) {
          if (!existing[sec]) existing[sec] = entries;
          else {
            // Prefer longer / more complete field set; append unique labels
            const labels = new Set(existing[sec].map((e) => e.label));
            for (const e of entries) {
              if (!labels.has(e.label)) existing[sec].push(e);
            }
          }
        }
      } else {
        byIso3.set(iso3, sections);
      }

      const list = gecByIso3.get(iso3) || [];
      list.push(gec);
      gecByIso3.set(iso3, list);
      fileCount++;
    }
  }

  log(`  → loaded ${fileCount} factbook profiles → ${byIso3.size} ISO entities`);
  if (unmatchedGec.length) {
    log(`  ⚠ ${unmatchedGec.length} GEC files without ISO mapping (skipped):`);
    for (const u of unmatchedGec.slice(0, 15)) log(`     - ${u}`);
    if (unmatchedGec.length > 15) log(`     … +${unmatchedGec.length - 15} more`);
  }

  return { byIso3, gecByIso3, unmatchedGec };
}

// ---------------------------------------------------------------------------
// 4) Attach factbook + sanitize mismatches
// ---------------------------------------------------------------------------

function flattenFactbookBlob(fb: FactbookSections | null): string {
  if (!fb) return '';
  return Object.values(fb)
    .flat()
    .map((e) => `${e.label} ${e.value}`)
    .join(' ')
    .toLowerCase();
}

function factbookLooksWrong(country: CountryProfile, fb: FactbookSections): boolean {
  if (FORCE_NO_FACTBOOK.has(country.code)) return true;

  const blob = flattenFactbookBlob(fb);
  if (!blob) return true;

  const names = [
    normalizeName(country.name_common),
    normalizeName(country.name_official),
  ].filter(Boolean);

  // Known alias patches for short / alternate names
  const aliases: Record<string, string[]> = {
    USA: ['united states', 'america'],
    GBR: ['united kingdom', 'britain', 'england'],
    RUS: ['russia', 'russian federation'],
    KOR: ['south korea', 'korea south', 'republic of korea'],
    PRK: ['north korea', 'korea north', 'dprk'],
    LAO: ['laos', 'lao'],
    SYR: ['syria'],
    IRN: ['iran', 'persia'],
    CZE: ['czechia', 'czech republic'],
    SWZ: ['eswatini', 'swaziland'],
    MMR: ['myanmar', 'burma'],
    COD: ['congo', 'democratic republic'],
    COG: ['congo'],
    CAF: ['central african'],
    TLS: ['timor'],
    CIV: ['ivoire', 'ivory'],
    PSE: ['west bank', 'gaza', 'palestine', 'palestinian'],
    TWN: ['taiwan'],
    UNK: ['kosovo'],
    HKG: ['hong kong'],
    MAC: ['macau', 'macao'],
    VAT: ['holy see', 'vatican'],
    FSM: ['micronesia'],
    BIH: ['bosnia'],
    MKD: ['macedonia', 'north macedonia'],
    FLK: ['falkland', 'malvinas'],
    CCK: ['cocos', 'keeling'],
    CXR: ['christmas island'],
    SHN: ['saint helena', 'st helena', 'ascension', 'tristan'],
    VIR: ['virgin islands', 'danish west indies'],
    VGB: ['british virgin', 'virgin islands'],
    MAF: ['saint martin', 'st martin'],
    SXM: ['sint maarten'],
    CUW: ['curacao', 'curaçao'],
    BES: ['bonaire', 'eustatius', 'saba'],
  };

  for (const a of aliases[country.code] || []) names.push(normalizeName(a));

  // If none of the expected names appear in the blob, treat as mismatch
  const hit = names.some((n) => n && blob.includes(n));
  return !hit;
}

function attachFactbooks(
  countries: CountryProfile[],
  loaded: LoadedFactbook
): { attached: number; rejected: string[] } {
  let attached = 0;
  const rejected: string[] = [];

  for (const c of countries) {
    if (FORCE_NO_FACTBOOK.has(c.code)) {
      c.factbook = null;
      continue;
    }
    const fb = loaded.byIso3.get(c.code);
    if (!fb) {
      c.factbook = null;
      continue;
    }
    if (factbookLooksWrong(c, fb)) {
      c.factbook = null;
      rejected.push(`${c.code} (${c.name_common})`);
      continue;
    }
    c.factbook = fb;
    attached++;
  }

  return { attached, rejected };
}

// ---------------------------------------------------------------------------
// 5) Comparison metrics — parse numbers out of factbook text
// ---------------------------------------------------------------------------

/**
 * Pick the most recent data line from multi-year Factbook fields.
 * Lines often look like: "Real GDP per capita 2024: $75,500 (2024 est.)"
 */
function mostRecentDataLine(text: string): string {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !/^note\b/i.test(l));
  if (!lines.length) return text;
  // Prefer lines that contain a dollar amount or a percent
  const dataLines = lines.filter((l) => /\$|\d+(?:\.\d+)?%/.test(l) || /:\s*-?\d/.test(l));
  return dataLines[0] || lines[0];
}

/**
 * First meaningful number in a string.
 * Skips bare 4-digit years (1900–2099) that often prefix Factbook multi-year rows.
 */
function firstNumber(text: string | null | undefined): number | null {
  if (!text) return null;
  const cleaned = text.replace(/,/g, '');
  // Prefer $ amounts
  const money = cleaned.match(/\$\s*(-?\d+(?:\.\d+)?)/);
  if (money) return parseFloat(money[1]);
  // Prefer percentages
  const pct = cleaned.match(/(-?\d+(?:\.\d+)?)\s*%/);
  if (pct) return parseFloat(pct[1]);
  // Otherwise first non-year number
  const re = /-?\d+(?:\.\d+)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned))) {
    const n = parseFloat(m[0]);
    const isYear = Number.isInteger(n) && n >= 1900 && n <= 2099;
    // Skip years unless that's all we have later
    if (isYear) continue;
    if (Number.isFinite(n)) return n;
  }
  // Fallback: allow a lone year only if nothing else matched (rare)
  const any = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!any) return null;
  const n = parseFloat(any[0]);
  return Number.isFinite(n) ? n : null;
}

/** Parse values like "$25.676 trillion", "822.38 billion", "$75,500" into USD. */
function parseMoney(text: string | null | undefined): number | null {
  if (!text) return null;
  const line = mostRecentDataLine(text).replace(/,/g, '').toLowerCase();
  // Prefer explicit $ amount with optional scale word
  const m =
    line.match(
      /\$\s*(-?\d+(?:\.\d+)?)\s*(trillion|billion|million|thousand)?/
    ) ||
    line.match(
      /(-?\d+(?:\.\d+)?)\s*(trillion|billion|million|thousand)\b/
    );
  if (!m) {
    // Plain dollar figure without unit (e.g. per-capita $75500)
    const plain = line.match(/\$\s*(-?\d+(?:\.\d+)?)/);
    if (!plain) return null;
    const n = parseFloat(plain[1]);
    return Number.isFinite(n) ? Math.round(n) : null;
  }
  let n = parseFloat(m[1]);
  const unit = m[2];
  if (unit === 'trillion') n *= 1e12;
  else if (unit === 'billion') n *= 1e9;
  else if (unit === 'million') n *= 1e6;
  else if (unit === 'thousand') n *= 1e3;
  return Number.isFinite(n) ? Math.round(n) : null;
}

function findEntry(
  fb: FactbookSections | null,
  section: string,
  labelNeedle: string
): string | null {
  if (!fb) return null;
  const entries = fb[section];
  if (!entries) return null;
  const needle = labelNeedle.toLowerCase();
  const found = entries.find((e) => e.label.toLowerCase().includes(needle));
  return found?.value ?? null;
}

/** Prefer the "total population" / "total:" line when present. */
function parsePopulation(text: string | null): number | null {
  if (!text) return null;
  const totalLine = text.split('\n').find((l) => /total/i.test(l)) || text;
  const n = firstNumber(totalLine.replace(/,/g, ''));
  // Populations should be large integers; reject tiny mis-parses
  if (n != null && n < 50 && !/thousand|million/i.test(text)) {
    // e.g. "total: 38.4 million"
    const moneyLike = parseMoney(text);
    return moneyLike;
  }
  if (n != null && /million/i.test(totalLine)) return Math.round(n * 1e6);
  if (n != null && /billion/i.test(totalLine)) return Math.round(n * 1e9);
  return n != null ? Math.round(n) : null;
}

function parsePercent(text: string | null): number | null {
  if (!text) return null;
  // urbanization: urban population: 83.3% of total population (2023)
  const m = text.replace(/,/g, '').match(/(-?\d+(?:\.\d+)?)\s*%/);
  if (m) return parseFloat(m[1]);
  return firstNumber(text);
}

function buildComparisonRow(c: CountryProfile): ComparisonRow {
  const fb = c.factbook;

  const popText = findEntry(fb, 'People and Society', 'Population');
  // Avoid matching "Population growth rate" when looking for Population — findEntry uses includes;
  // so match exact-ish: try exact label first
  const popExact =
    fb?.['People and Society']?.find((e) => e.label === 'Population')?.value ??
    null;

  const lifeText = findEntry(fb, 'People and Society', 'Life expectancy at birth');
  const medianText = findEntry(fb, 'People and Society', 'Median age');
  const growthText = findEntry(fb, 'People and Society', 'Population growth rate');
  const birthText = findEntry(fb, 'People and Society', 'Birth rate');
  const deathText = findEntry(fb, 'People and Society', 'Death rate');
  const infantText = findEntry(fb, 'People and Society', 'Infant mortality rate');
  const fertText = findEntry(fb, 'People and Society', 'Total fertility rate');
  const urbanText = findEntry(fb, 'People and Society', 'Urbanization');

  const gdpPppText = findEntry(fb, 'Economy', 'Real GDP (purchasing power parity)');
  const gdpCapText = findEntry(fb, 'Economy', 'Real GDP per capita');
  const gdpGrowthText = findEntry(fb, 'Economy', 'Real GDP growth rate');
  const unempText = findEntry(fb, 'Economy', 'Unemployment rate');
  const inflText = findEntry(fb, 'Economy', 'Inflation rate');
  const debtText = findEntry(fb, 'Economy', 'Public debt');

  const inetText =
    findEntry(fb, 'Communications', 'Internet users') ||
    findEntry(fb, 'Communications', 'Internet');
  const milText =
    findEntry(fb, 'Military and Security', 'Military expenditures') ||
    findEntry(fb, 'Military and Security', 'Military expenditure');
  const eduText = findEntry(fb, 'People and Society', 'Education expenditure');

  const govType = findEntry(fb, 'Government', 'Government type');
  const religions = findEntry(fb, 'People and Society', 'Religions');
  const ethnic = findEntry(fb, 'People and Society', 'Ethnic groups');
  const langs = findEntry(fb, 'People and Society', 'Languages');

  // Internet: often "total: 311.3 million (2021 est.)\npercent of population: 92% (2021 est.)"
  let internet_pct: number | null = null;
  if (inetText) {
    const pctLine = inetText.split('\n').find((l) => /percent of population/i.test(l));
    internet_pct = parsePercent(pctLine || inetText);
  }

  return {
    code: c.code,
    name: c.name_common,
    flag_url: c.flag_url,
    flag_emoji: c.flag_emoji,
    region: c.region,
    area_km2: c.area_km2,
    capital: c.capital,
    independent: c.independent,
    population: parsePopulation(popExact || popText),
    life_expectancy: firstNumber(
      (lifeText || '').split('\n').find((l) => /total population/i.test(l)) || lifeText
    ),
    median_age: firstNumber(
      (medianText || '').split('\n').find((l) => /total/i.test(l)) || medianText
    ),
    pop_growth_pct: firstNumber(growthText),
    birth_rate: firstNumber(birthText),
    death_rate: firstNumber(deathText),
    infant_mortality: firstNumber(
      (infantText || '').split('\n').find((l) => /total/i.test(l)) || infantText
    ),
    fertility_rate: firstNumber(fertText),
    urbanization_pct: parsePercent(
      (urbanText || '').split('\n').find((l) => /urban population/i.test(l)) || urbanText
    ),
    gdp_ppp: parseMoney(gdpPppText),
    gdp_per_capita: parseMoney(gdpCapText),
    gdp_growth_pct: firstNumber(gdpGrowthText ? mostRecentDataLine(gdpGrowthText) : null),
    unemployment_pct: firstNumber(unempText ? mostRecentDataLine(unempText) : null),
    inflation_pct: firstNumber(inflText ? mostRecentDataLine(inflText) : null),
    public_debt_pct: parsePercent(
      debtText ? mostRecentDataLine(debtText) : null
    ) ?? firstNumber(debtText ? mostRecentDataLine(debtText) : null),
    internet_pct,
    military_pct_gdp: parsePercent(milText) ?? firstNumber(milText),
    edu_spend_pct_gdp: parsePercent(eduText) ?? firstNumber(eduText),
    government_type: govType ? govType.split('\n')[0].trim() : null,
    religions: religions,
    ethnic_groups: ethnic
      ? ethnic.length > 400
        ? ethnic.slice(0, 400)
        : ethnic
      : null,
    languages_detail: langs
      ? langs.length > 500
        ? langs.slice(0, 500)
        : langs
      : null,
  };
}

// ---------------------------------------------------------------------------
// Population pyramids (educational Age structure extract)
// ---------------------------------------------------------------------------

function buildPopulationPyramids(countries: CountryProfile[]) {
  return countries
    .map((c) =>
      extractPyramidFromCountry({
        code: c.code,
        name_common: c.name_common,
        flag_url: c.flag_url,
        flag_emoji: c.flag_emoji,
        region: c.region,
        factbook: c.factbook,
      })
    )
    .filter((p): p is NonNullable<typeof p> => p != null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   Country-Factbook — data pipeline               ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');

  ensureDirs();

  // Base list
  const countries = await loadBaseCountries();

  // Code map + factbook profiles
  const gecToIso3 = await loadGecToIso3();
  const loaded = await loadAllFactbooks(gecToIso3);

  const { attached, rejected } = attachFactbooks(countries, loaded);
  log(`✅ Factbook attached to ${attached}/${countries.length} countries`);
  if (rejected.length) {
    log(`⚠ Rejected mismatched factbook for ${rejected.length}:`);
    for (const r of rejected) log(`   - ${r}`);
  }

  // Write all-countries.json
  const allPath = path.join(DATA_DIR, 'all-countries.json');
  writeFileSync(allPath, JSON.stringify(countries, null, 2) + '\n');
  log(`💾 Wrote ${allPath} (${(statSync(allPath).size / 1e6).toFixed(2)} MB)`);

  // Comparison data
  const comparison = countries.map(buildComparisonRow);
  const cmpPath = path.join(DATA_DIR, 'comparison-data.json');
  writeFileSync(cmpPath, JSON.stringify(comparison, null, 2) + '\n');
  log(`💾 Wrote ${cmpPath} (${(statSync(cmpPath).size / 1e3).toFixed(0)} KB)`);

  // Population pyramids (Age structure → structured bands for educational charts)
  const pyramids = buildPopulationPyramids(countries);
  const pyrPath = path.join(DATA_DIR, 'population-pyramids.json');
  writeFileSync(pyrPath, JSON.stringify(pyramids, null, 2) + '\n');
  log(`💾 Wrote ${pyrPath} (${pyramids.length} pyramids)`);

  // Coverage report
  const withPop = comparison.filter((c) => c.population != null).length;
  const withGdp = comparison.filter((c) => c.gdp_per_capita != null).length;
  const withLe = comparison.filter((c) => c.life_expectancy != null).length;
  log('');
  log('📊 Comparison metric coverage:');
  log(`   population:       ${withPop}/${comparison.length}`);
  log(`   gdp_per_capita:   ${withGdp}/${comparison.length}`);
  log(`   life_expectancy:  ${withLe}/${comparison.length}`);
  log(`   pyramids:         ${pyramids.length}/${countries.length}`);
  log('');
  log('Done. Next: npm run build  (or npm run dev)');
  log('Cache lives in .cache/ — delete it to force a full re-download.');
}

main().catch((err) => {
  console.error('');
  console.error('❌ Build failed:', err?.message || err);
  console.error('');
  console.error('Troubleshooting:');
  console.error('  • Need network access for mledoze/countries + factbook.zip + GeoNames');
  console.error('  • Or set FACTBOOK_SOURCE=/path/to/factbook.json-clone');
  console.error('  • Or SKIP_FETCH=1 if .cache/ is already populated');
  console.error('  • Committed data/*.json remains the runtime fallback');
  process.exit(1);
});

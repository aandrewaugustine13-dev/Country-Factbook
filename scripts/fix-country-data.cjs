const fs = require('fs');
const path = require('path');

const FILE = path.join(process.cwd(), 'data', 'all-countries.json');

if (!fs.existsSync(FILE)) {
  console.error(`Missing file: ${FILE}`);
  process.exit(1);
}

const countries = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const FORCE_REMOVE_FACTBOOK = new Set([
  'ALA', // Åland Islands
  'SJM', // Svalbard and Jan Mayen
  'UMI', // U.S. Minor Outlying Islands
]);

// If you KNOW a record should keep factbook, remove it from this map.
// If you KNOW a record should never have factbook, add it here.
const OBVIOUS_MISMATCH_RULES = {
  ALA: ['falkland', 'stanley', 'argentina', 'islas malvinas'],
  SJM: ['falkland', 'stanley', 'argentina', 'islas malvinas'],
  UMI: ['falkland', 'stanley', 'argentina', 'islas malvinas'],
};

const NAME_ALIASES = {
  ALA: ['åland', 'aland', 'aland islands', 'åland islands'],
  FLK: ['falkland', 'falkland islands', 'islas malvinas'],
  SJM: ['svalbard', 'jan mayen', 'svalbard and jan mayen'],
  UMI: ['minor outlying islands', 'u.s. minor outlying islands', 'united states minor outlying islands'],
};

function flattenFactbook(fb) {
  if (!fb || typeof fb !== 'object') return '';

  return Object.values(fb)
    .flatMap((section) => (Array.isArray(section) ? section : []))
    .map((item) => {
      const label = item && typeof item.label === 'string' ? item.label : '';
      const value = item && typeof item.value === 'string' ? item.value : '';
      return `${label} ${value}`.trim();
    })
    .join(' ')
    .toLowerCase();
}

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function expectedNames(country) {
  const names = new Set();

  if (country.name_common) names.add(normalize(country.name_common));
  if (country.name_official) names.add(normalize(country.name_official));

  for (const alias of NAME_ALIASES[country.code] || []) {
    names.add(normalize(alias));
  }

  return [...names].filter(Boolean);
}

function shouldRemoveFactbook(country, blob) {
  // Hard kill list for territories that are common mismatch magnets
  if (FORCE_REMOVE_FACTBOOK.has(country.code)) return true;

  // Obvious poisoned content
  const badTerms = OBVIOUS_MISMATCH_RULES[country.code] || [];
  if (badTerms.some((term) => blob.includes(normalize(term)))) return true;

  // If the content doesn't mention the country at all, it's probably wrong.
  const names = expectedNames(country);
  if (names.length > 0) {
    const mentionsExpectedName = names.some((name) => blob.includes(name));
    if (!mentionsExpectedName) return true;
  }

  return false;
}

let changed = 0;
const removed = [];

for (const country of countries) {
  if (!country || !country.code || !country.factbook) continue;

  const blob = flattenFactbook(country.factbook);

  if (shouldRemoveFactbook(country, blob)) {
    country.factbook = null;
    changed++;
    removed.push(`${country.code} - ${country.name_common}`);
  }
}

fs.writeFileSync(FILE, JSON.stringify(countries, null, 2) + '\n');

console.log(`Sanitized ${changed} country records.`);
if (removed.length) {
  console.log('Removed factbook from:');
  for (const line of removed) console.log(`- ${line}`);
}

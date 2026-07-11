/**
 * Extract thematic map layer values from all-countries + comparison-data.
 * Run: node scripts/extract-map-layers.cjs
 * Also invoked from npm run build:data (via build-data.ts).
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const countries = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', 'all-countries.json'), 'utf8')
);
const comparison = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', 'comparison-data.json'), 'utf8')
);

const cmpMap = new Map(comparison.map((c) => [c.code, c]));

function findEntry(fb, section, needle) {
  const entries = fb?.[section];
  if (!Array.isArray(entries)) return null;
  const n = needle.toLowerCase();
  const found = entries.find((e) => e.label.toLowerCase().includes(n));
  return found?.value || null;
}

function firstNumber(text) {
  if (!text) return null;
  const cleaned = text.replace(/,/g, '');
  const re = /-?\d+(?:\.\d+)?/g;
  let m;
  while ((m = re.exec(cleaned))) {
    const n = parseFloat(m[0]);
    if (Number.isInteger(n) && n >= 1900 && n <= 2099) continue;
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function parseArable(text) {
  if (!text) return null;
  const m = text.replace(/,/g, '').match(/arable land[^0-9]*?(\d+(?:\.\d+)?)\s*%/i);
  return m ? parseFloat(m[1]) : null;
}

function parseRefugeesAndIdps(text) {
  if (!text) return null;
  let total = 0;
  let found = false;
  const re = /(?:refugees|IDPs|asylum[- ]seekers)\s*:\s*([\d,]+)/gi;
  let m;
  while ((m = re.exec(text))) {
    total += parseInt(m[1].replace(/,/g, ''), 10);
    found = true;
  }
  if (!found) {
    const nums = [...text.matchAll(/([\d,]{4,})/g)].map((x) =>
      parseInt(x[1].replace(/,/g, ''), 10)
    );
    if (nums.length) {
      total = Math.max(...nums);
      found = true;
    }
  }
  return found ? total : null;
}

function classifyResources(resourcesText, arablePct, waterText) {
  const t = (resourcesText || '').toLowerCase();
  const water = (waterText || '').toLowerCase();
  if (!t && arablePct == null) return { category: 'unknown', display: 'No data', detail: null };

  const energy = /petroleum|oil|natural gas|gas|coal|hydrocarbon/.test(t);
  const mineral =
    /iron|gold|copper|diamond|bauxite|uranium|lithium|nickel|tin|phosphate|silver|zinc|chrome/.test(
      t
    );
  const scarce = /none|negligible|limited|few natural|no significant/.test(t);
  const waterScarce = /scarce|shortage|deficit|desalin/.test(water) || /arid|desert/.test(t);

  let waterBm3 = null;
  if (waterText) {
    const m = waterText.replace(/,/g, '').match(/([\d.]+)\s*billion/);
    if (m) waterBm3 = parseFloat(m[1]);
  }

  let category = 'mixed';
  let display = 'Mixed resources';
  if (energy) {
    category = 'energy';
    display = mineral ? 'Energy + other' : 'Energy (oil/gas)';
  } else if (arablePct != null && arablePct >= 25) {
    category = 'arable';
    display = 'Farmland / arable';
  } else if (mineral) {
    category = 'mineral';
    display = 'Minerals / metals';
  } else if (waterBm3 != null && waterBm3 >= 200) {
    category = 'water_rich';
    display = 'Water-rich';
  } else if (scarce || waterScarce || (arablePct != null && arablePct < 5 && !mineral)) {
    category = 'scarce';
    display = 'Limited / scarce';
  }

  return {
    category,
    display,
    detail: resourcesText ? resourcesText.split('\n')[0].slice(0, 160) : null,
  };
}

function classifyClimate(text) {
  if (!text) return { category: 'unknown', display: 'No data', detail: null };
  const t = text.toLowerCase();
  const detail = text.split('\n')[0].slice(0, 160);
  if (/mediterranean/.test(t)) return { category: 'mediterranean', display: 'Mediterranean', detail };
  if (/tropical|equatorial|monsoon|rainforest|hot and humid/.test(t))
    return { category: 'tropical', display: 'Tropical', detail };
  if (/arid|desert|semi-?arid|dry|sahara/.test(t))
    return { category: 'arid', display: 'Arid / desert', detail };
  if (/polar|tundra|arctic|subarctic|ice cap/.test(t))
    return { category: 'polar', display: 'Polar / tundra', detail };
  if (/highland|alpine|mountain/.test(t) && !/temperate/.test(t))
    return { category: 'highland', display: 'Highland', detail };
  if (/continental|cold winter|severe winter/.test(t))
    return { category: 'continental', display: 'Continental', detail };
  if (/temperate|mild|oceanic|maritime/.test(t))
    return { category: 'temperate', display: 'Temperate', detail };
  return { category: 'mixed', display: 'Varied / mixed', detail };
}

const out = [];
for (const c of countries) {
  const cmp = cmpMap.get(c.code) || {};
  const fb = c.factbook;
  const layers = {};

  if (cmp.gdp_per_capita != null) {
    layers.development = {
      value: cmp.gdp_per_capita,
      display: `$${Number(cmp.gdp_per_capita).toLocaleString('en-US')}`,
      detail: 'Real GDP per capita (Factbook / comparison extract)',
    };
  }

  if (cmp.population != null && c.area_km2 > 0) {
    const dens = cmp.population / c.area_km2;
    layers.density = {
      value: dens,
      display: dens >= 100 ? `${Math.round(dens)} / km²` : `${dens.toFixed(1)} / km²`,
      detail: `Population ${cmp.population.toLocaleString()} ÷ ${c.area_km2.toLocaleString()} km²`,
    };
  }

  if (cmp.urbanization_pct != null) {
    layers.urbanization = {
      value: cmp.urbanization_pct,
      display: `${cmp.urbanization_pct}%`,
      detail:
        findEntry(fb, 'People and Society', 'Urbanization')?.split('\n')[0] || null,
    };
  }

  const resText = findEntry(fb, 'Geography', 'Natural resources');
  const landText =
    findEntry(fb, 'Geography', 'Land use') || findEntry(fb, 'Environment', 'Land use');
  const waterText =
    findEntry(fb, 'Environment', 'Total renewable water') ||
    findEntry(fb, 'Environment', 'renewable water');
  const arable = parseArable(landText || '');
  const res = classifyResources(resText, arable, waterText);
  if (res.category !== 'unknown' || resText) {
    layers.resources = {
      value: null,
      category: res.category,
      display: res.display,
      detail: res.detail,
    };
  }

  const climText =
    findEntry(fb, 'Geography', 'Climate') || findEntry(fb, 'Environment', 'Climate');
  const clim = classifyClimate(climText);
  layers.climate = {
    value: null,
    category: clim.category,
    display: clim.display,
    detail: clim.detail,
  };

  const migText = findEntry(fb, 'People and Society', 'Net migration');
  const mig = firstNumber(migText);
  if (mig != null) {
    layers.migration = {
      value: mig,
      display: `${mig > 0 ? '+' : ''}${mig} / 1,000`,
      detail: migText?.split('\n')[0] || null,
    };
  }

  const refText = findEntry(fb, 'Transnational Issues', 'Refugees');
  const displaced = parseRefugeesAndIdps(refText || '');
  if (displaced != null) {
    layers.stability = {
      value: displaced,
      display:
        displaced >= 1e6
          ? `${(displaced / 1e6).toFixed(1)}M people`
          : displaced >= 1e3
            ? `${(displaced / 1e3).toFixed(0)}K people`
            : `${displaced} people`,
      detail: refText
        ? refText.split('\n').slice(0, 3).join(' · ').slice(0, 200)
        : null,
    };
  }

  if (cmp.internet_pct != null) {
    layers.trade = {
      value: cmp.internet_pct,
      display: `${cmp.internet_pct}% online`,
      detail:
        'Internet users (% of population) — classroom proxy for global connection',
    };
  }

  out.push({ code: c.code, layers });
}

const dest = path.join(ROOT, 'data', 'map-layer-data.json');
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote ${out.length} map layer rows → ${dest}`);

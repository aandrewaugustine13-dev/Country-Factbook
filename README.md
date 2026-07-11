# The World Factbook
**Reference Edition 2026**

A clean, open-source replica of the original CIA World Factbook website (retired February 2026).

This site provides authoritative country profiles and statistics for researchers, students, journalists, and the public.

**Live site:** https://country-factbook.vercel.app

## Features
- Search by common or official name
- Filter by region (Africa, Americas, Asia, Europe, Oceania)
- Grid and list views
- Full Factbook section profiles (Introduction through Transnational Issues)
- Country comparison, quiz, and “country of the day”
- **Population pyramid comparison** (`/pyramids`) for classroom age-structure analysis
- **Interactive world map** (`/map`) — click a country for a fact card + full profile link
- Individual country pages (`/countries/USA`, `/countries/CHN`, etc.)
- Built with Next.js 15 + Tailwind — static export friendly

## Data Sources
| Layer | Source | Role |
| --- | --- | --- |
| Base metadata | [mledoze/countries](https://github.com/mledoze/countries) | ISO codes, names, flags, capital, languages, borders |
| Factbook text | [factbook/factbook.json](https://github.com/factbook/factbook.json) | Structured CIA World Factbook profiles (public domain) |
| Code mapping | [GeoNames countryInfo](https://download.geonames.org/export/dump/countryInfo.txt) | GEC/FIPS → ISO alpha-3 |
| Flags | [flagcdn.com](https://flagcdn.com) | PNG/SVG flag images |

> **Note on MilkMp archive** ([CIA-World-Factbooks-Archive-1990-2025](https://github.com/MilkMp/CIA-World-Factbooks-Archive-1990-2025)): excellent for historical editions and the offline Android app (`apps-v1.2.2`). For this web app’s pipeline we use `factbook.json` because it is already clean, per-country JSON and matches our UI schema. You can point `FACTBOOK_SOURCE` at any compatible local tree if you extract JSON from that archive later.

## Local Development
```bash
git clone https://github.com/aandrewaugustine13-dev/Country-Factbook.git
cd Country-Factbook
npm install
npm run build:data   # optional: rebuild data/ from upstream sources
npm run dev
```

Open http://localhost:3000

## Data pipeline (`npm run build:data`)

The script [`build-data.ts`](./build-data.ts) rebuilds both app datasets:

| Output | Purpose |
| --- | --- |
| `data/all-countries.json` | Full profiles + nested Factbook sections |
| `data/comparison-data.json` | Parsed numeric metrics for compare / quiz / daily |
| `data/population-pyramids.json` | Age structure bands (0–14 / 15–64 / 65+) for pyramid charts |

### Interactive thematic map
Open **`/map`**. Boundaries: `public/geo/countries.geojson` (Natural Earth 110m). Layer values: `data/map-layer-data.json`.

| Layer | What students see | Source / proxy |
| --- | --- | --- |
| Development | GDP per person | comparison-data `gdp_per_capita` |
| Density | People / km² | population ÷ area |
| Urbanization | % urban | comparison-data + Factbook |
| Natural resources | Energy / farmland / minerals… | classified from Factbook text |
| Climate zones | Tropical, arid, temperate… | keyword class on Climate field |
| Migration | Net migrants / 1,000 | Factbook net migration rate |
| Displacement | Refugees + IDPs | Transnational Issues text |
| Trade & connections | Internet % | globalization proxy |

- **One choropleth at a time** (radio toggles) so colors stay readable
- Click a country → modal **highlights the active layer value**
- Rebuild layers: `npm run build:map-layers` (also runs after `npm run build:data`)

Matching uses ISO alpha-3; overrides in `src/map-countries.ts` (e.g. `KOS` → `UNK`).

### Population pyramids (classroom tool)
Open **`/pyramids`** to compare 1–4 countries side by side (Recharts back-to-back bars).

Data is parsed from Factbook **Age structure** text into:

```json
{
  "code": "NGA",
  "name": "Nigeria",
  "bands": [
    { "id": "0-14", "label": "0–14 years", "percent": 40.4, "male": 48856606, "female": 46770810 },
    { "id": "15-64", "percent": 56.2, "male": 66897900, "female": 66187584 },
    { "id": "65+", "percent": 3.4, "male": 3759943, "female": 4274287 }
  ],
  "shape": "expansive"
}
```

Rebuild with `npm run build:data` after refreshing Factbook sources. Parser lives in `src/population-pyramid.ts`.

### What it does
1. Downloads base country metadata (mledoze/countries).
2. Downloads GeoNames FIPS/GEC → ISO mapping.
3. Downloads (or reuses) the `factbook.json` zip archive.
4. Flattens nested Factbook fields into `{ label, value }[]` sections.
5. Matches Factbook GEC codes to ISO alpha-3 and attaches profiles.
6. Rejects obvious name mismatches (safety net).
7. Parses population, GDP, life expectancy, etc. into comparison metrics.
8. Writes both JSON files under `data/`.

### Re-run after a new Factbook release
```bash
rm -rf .cache          # force re-download
npm run build:data
git add data/all-countries.json data/comparison-data.json
git commit -m "Refresh Factbook data"
```

### Optional environment variables
| Variable | Meaning |
| --- | --- |
| `FACTBOOK_SOURCE` | Local directory **or** zip URL of factbook.json-shaped data |
| `COUNTRIES_JSON_URL` | Alternate base-country JSON URL |
| `SKIP_FETCH=1` | Reuse files already in `.cache/` |

Example using a local checkout:
```bash
FACTBOOK_SOURCE=/path/to/factbook.json npm run build:data
```

Downloads are cached under `.cache/` (gitignored).

## Static export / deployment
```bash
npm run build    # also runs a light factbook sanitizer (prebuild)
```

With `output: 'export'` in `next.config.mjs`, Next.js writes a static site to `out/`. Deploy `out/` to Vercel, Cloudflare Pages, GitHub Pages, or any static host.

**Do not commit** root-level `*.html`, `*.txt`, or `_next/` — those are old export artifacts. They are listed in `.gitignore`.

## Project layout
```
app/                 Next.js App Router pages
components/          UI components
data/                Generated JSON consumed at build time
  all-countries.json
  comparison-data.json
scripts/
  fix-country-data.cjs   Lightweight sanitizer (also runs on prebuild)
src/                 Shared types, glossary, compare state
build-data.ts        Full data pipeline (run via npm run build:data)
public/              Static assets (logo, etc.)
```

## License
Factbook content is public domain (U.S. government work). Base country metadata from mledoze/countries is similarly free to use. This project is an independent open-source reference tool and is **not** affiliated with any government agency.

/**
 * Population pyramid utilities for educational comparison.
 *
 * Source: CIA Factbook "Age structure" free-text fields (People and Society).
 * Typical format:
 *   0-14 years: 18.1% (male 31,618,532/female 30,254,223)
 *   15-64 years: 63.4% (male 108,553,822/female 108,182,491)
 *   65 years and over: 18.5% (2024 est.) (male 28,426,426/female 34,927,914)
 *
 * Bands are the broad UN-style groups used in 9th-grade World Geography.
 * Finer 5-year cohorts can be added later by extending PopulationBand[].
 */

export type PyramidShape = 'expansive' | 'stationary' | 'constrictive';

export interface PopulationBand {
  /** Short label for the Y-axis, e.g. "0–14" */
  id: string;
  /** Full label, e.g. "0–14 years" */
  label: string;
  /** Share of total population (0–100) */
  percent: number;
  male: number;
  female: number;
}

export interface PopulationPyramid {
  code: string;
  name: string;
  flag_url: string;
  flag_emoji: string;
  region: string;
  /** Year estimate when known, e.g. 2024 */
  year: number | null;
  bands: PopulationBand[];
  shape: PyramidShape;
  totalPopulation: number | null;
}

export interface PyramidListItem {
  code: string;
  name: string;
  flag_url: string;
  flag_emoji: string;
  region: string;
  shape: PyramidShape;
  youthPct: number;
  elderlyPct: number;
}

/** Canonical order for the three broad age bands (young → old, bottom → top of pyramid). */
export const BAND_ORDER = ['0-14', '15-64', '65+'] as const;

const BAND_ID_MAP: Record<string, string> = {
  '0-14 years': '0-14',
  '15-64 years': '15-64',
  '65 years and over': '65+',
};

const BAND_LABEL_MAP: Record<string, string> = {
  '0-14': '0–14 years',
  '15-64': '15–64 years',
  '65+': '65+ years',
};

/**
 * Parse Factbook "Age structure" text into structured bands.
 * Returns null if fewer than 3 standard bands are found.
 */
export function parseAgeStructure(text: string): PopulationBand[] | null {
  if (!text) return null;

  const bands: PopulationBand[] = [];
  // Optional "(2024 est.)" before male/female counts (common on 65+ line)
  const re =
    /(0-14 years|15-64 years|65 years and over):\s*([\d.]+)%\s*(?:\([^)]*est\.\)\s*)?\(male\s*([\d,]+)\/female\s*([\d,]+)\)/gi;

  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const rawLabel = m[1].toLowerCase();
    const id = BAND_ID_MAP[rawLabel] || BAND_ID_MAP[m[1]];
    if (!id) continue;
    bands.push({
      id,
      label: BAND_LABEL_MAP[id] || m[1],
      percent: parseFloat(m[2]),
      male: parseInt(m[3].replace(/,/g, ''), 10),
      female: parseInt(m[4].replace(/,/g, ''), 10),
    });
  }

  // Ensure canonical order bottom→top for pyramid rendering
  const ordered = BAND_ORDER.map((id) => bands.find((b) => b.id === id)).filter(
    (b): b is PopulationBand => !!b
  );

  return ordered.length >= 3 ? ordered : null;
}

/** Extract a year like 2024 from the age-structure blob when present. */
export function parseAgeStructureYear(text: string): number | null {
  const m = text.match(/\((\d{4})\s*est\.\)/i);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Classify pyramid shape for classroom discussion.
 * - Expansive: wide base (many children) — often higher fertility / younger population
 * - Constrictive: narrow base / large elderly share — aging population
 * - Stationary: more rectangular middle — transitional / developed
 */
export function classifyPyramidShape(bands: PopulationBand[]): PyramidShape {
  const youth = bands.find((b) => b.id === '0-14')?.percent ?? 0;
  const elderly = bands.find((b) => b.id === '65+')?.percent ?? 0;

  if (youth >= 32) return 'expansive';
  if (elderly >= 20 || (youth < 18 && elderly >= 14)) return 'constrictive';
  return 'stationary';
}

export const SHAPE_META: Record<
  PyramidShape,
  { label: string; color: string; summary: string; questions: string[] }
> = {
  expansive: {
    label: 'Expansive (young)',
    color: '#2A7F7A',
    summary:
      'Wide base: a large share of the population is under 15. Often linked to higher birth rates and a younger median age.',
    questions: [
      'Why might the base of this pyramid be so wide?',
      'What challenges could a large youth population create for schools and jobs?',
      'How might this shape change if birth rates fall over the next 20 years?',
    ],
  },
  stationary: {
    label: 'Stationary (balanced)',
    color: '#1B6CA8',
    summary:
      'More even sides: youth, working-age, and older groups are closer in share. Common in transitional or developed societies.',
    questions: [
      'How does the working-age group (15–64) compare to children and older adults?',
      'What might this mean for the dependency ratio?',
      'Compare this shape to a country with a much wider base.',
    ],
  },
  constrictive: {
    label: 'Constrictive (aging)',
    color: '#B8860B',
    summary:
      'Narrower base and larger older share: fewer children relative to adults. Often signals lower fertility and an aging population.',
    questions: [
      'What does a narrow base suggest about recent birth rates?',
      'How could a large 65+ share affect healthcare and pensions?',
      'Which country in your comparison looks most different from this one?',
    ],
  },
};

export function formatCount(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString('en-US');
}

/** Chart rows: male values are negative so bars extend left. */
export interface PyramidChartRow {
  band: string;
  bandId: string;
  male: number;
  female: number;
  maleCount: number;
  femaleCount: number;
  malePct: number;
  femalePct: number;
}

/**
 * Build Recharts rows from bands.
 * mode 'percent' → % of total population (best for shape comparison)
 * mode 'count' → absolute people (shows scale differences)
 */
export function toChartRows(
  bands: PopulationBand[],
  mode: 'percent' | 'count' = 'percent'
): PyramidChartRow[] {
  // Pyramid displays oldest at top → reverse for Recharts category axis
  const ordered = [...bands].reverse();

  return ordered.map((b) => {
    const total = b.male + b.female || 1;
    const malePctOfBand = (b.male / total) * b.percent;
    const femalePctOfBand = (b.female / total) * b.percent;

    if (mode === 'count') {
      return {
        band: b.label.replace(' years', ''),
        bandId: b.id,
        male: -b.male,
        female: b.female,
        maleCount: b.male,
        femaleCount: b.female,
        malePct: malePctOfBand,
        femalePct: femalePctOfBand,
      };
    }

    return {
      band: b.label.replace(' years', ''),
      bandId: b.id,
      male: -malePctOfBand,
      female: femalePctOfBand,
      maleCount: b.male,
      femaleCount: b.female,
      malePct: malePctOfBand,
      femalePct: femalePctOfBand,
    };
  });
}

/** Pull Age structure from a full country profile (all-countries.json shape). */
export function extractPyramidFromCountry(country: {
  code: string;
  name_common?: string;
  name?: string;
  flag_url?: string;
  flag_emoji?: string;
  region?: string;
  factbook?: Record<string, Array<{ label: string; value: string }>> | null;
}): PopulationPyramid | null {
  const entries = country.factbook?.['People and Society'];
  if (!entries) return null;
  const age = entries.find((e) => e.label === 'Age structure');
  if (!age?.value) return null;

  const bands = parseAgeStructure(age.value);
  if (!bands) return null;

  const totalPopulation = bands.reduce((s, b) => s + b.male + b.female, 0);

  return {
    code: country.code,
    name: country.name_common || country.name || country.code,
    flag_url: country.flag_url || '',
    flag_emoji: country.flag_emoji || '',
    region: country.region || 'Unknown',
    year: parseAgeStructureYear(age.value),
    bands,
    shape: classifyPyramidShape(bands),
    totalPopulation: totalPopulation || null,
  };
}

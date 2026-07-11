/**
 * Thematic map layer definitions for classroom exploration.
 *
 * Data is pre-extracted into data/map-layer-data.json by build-data.ts /
 * scripts/extract-map-layers.ts from:
 *   - comparison-data.json (GDP, urbanization, population, military, internet)
 *   - all-countries.json factbook free text (resources, climate, migration, refugees, trade)
 *
 * Design choice: ONE choropleth layer at a time (radio). Keeps the map
 * readable for 9th-grade students and makes legends unambiguous.
 */

export type LayerId =
  | 'development'
  | 'density'
  | 'urbanization'
  | 'resources'
  | 'climate'
  | 'migration'
  | 'stability'
  | 'trade';

export type LayerKind = 'numeric' | 'category';

export interface LayerValue {
  /** Numeric value for choropleth scaling (null = no data) */
  value: number | null;
  /** Category key for categorical layers */
  category?: string | null;
  /** Student-facing short value, e.g. "$75,500" or "Tropical" */
  display: string;
  /** Optional longer excerpt / note for the modal */
  detail?: string | null;
}

export interface MapLayerCountry {
  code: string;
  layers: Partial<Record<LayerId, LayerValue>>;
}

export interface MapLayerDef {
  id: LayerId;
  name: string;
  shortName: string;
  kind: LayerKind;
  /** Plain-language description for the layer panel */
  description: string;
  /** What the color scale means */
  legendTitle: string;
  /** Source / honesty note for students & teachers */
  sourceNote: string;
  /** Hex stops low → high (numeric) or category → color map */
  colors: string[];
  /** Category labels when kind === 'category' */
  categories?: { id: string; label: string; color: string }[];
  /** Format a number for the legend / modal */
  format?: (n: number) => string;
  /** Approximate breaks for equal-ish educational classes (optional) */
  breaks?: number[];
}

export const MAP_LAYERS: MapLayerDef[] = [
  {
    id: 'development',
    name: 'Development level',
    shortName: 'Development',
    kind: 'numeric',
    description: 'How wealthy a country is on average — using GDP per person as a stand-in for development.',
    legendTitle: 'GDP per person (USD)',
    sourceNote: 'Proxy for development using Factbook Real GDP per capita (not official HDI).',
    colors: ['#edf8fb', '#b2e2e2', '#66c2a4', '#2ca25f', '#006d2c'],
    format: (n) =>
      n >= 1000 ? `$${Math.round(n).toLocaleString('en-US')}` : `$${n.toFixed(0)}`,
    breaks: [2500, 8000, 20000, 45000],
  },
  {
    id: 'density',
    name: 'Population density',
    shortName: 'Density',
    kind: 'numeric',
    description: 'How crowded a country is: people per square kilometer.',
    legendTitle: 'People per km²',
    sourceNote: 'Population ÷ land area from Factbook / base country data.',
    colors: ['#f7fcf5', '#c7e9c0', '#74c476', '#31a354', '#006d2c'],
    format: (n) => (n >= 100 ? `${Math.round(n)}` : n.toFixed(1)),
    breaks: [20, 80, 200, 500],
  },
  {
    id: 'urbanization',
    name: 'Urbanization',
    shortName: 'Urban',
    kind: 'numeric',
    description: 'Share of people living in cities and towns.',
    legendTitle: 'Urban population (%)',
    sourceNote: 'Factbook “Urbanization — urban population” percentage.',
    colors: ['#fff5eb', '#fdd0a2', '#fdae6b', '#f16913', '#7f2704'],
    format: (n) => `${n.toFixed(0)}%`,
    breaks: [30, 50, 70, 85],
  },
  {
    id: 'resources',
    name: 'Natural resources',
    shortName: 'Resources',
    kind: 'category',
    description: 'Main resource story: energy, farmland, minerals, or limited resources.',
    legendTitle: 'Resource focus',
    sourceNote: 'Classified from Factbook Natural resources + arable land + renewable water text.',
    colors: [],
    categories: [
      { id: 'energy', label: 'Energy (oil/gas)', color: '#2c3e50' },
      { id: 'arable', label: 'Farmland / arable', color: '#6b8e23' },
      { id: 'mineral', label: 'Minerals / metals', color: '#8b6914' },
      { id: 'water_rich', label: 'Water-rich', color: '#1b6ca8' },
      { id: 'mixed', label: 'Mixed resources', color: '#5a6a7a' },
      { id: 'scarce', label: 'Limited / scarce', color: '#c0392b' },
      { id: 'unknown', label: 'No data', color: '#c5cdd6' },
    ],
  },
  {
    id: 'climate',
    name: 'Climate zones',
    shortName: 'Climate',
    kind: 'category',
    description: 'Broad climate type from the Factbook climate description.',
    legendTitle: 'Climate type',
    sourceNote: 'Keyword classification of Factbook Geography → Climate text.',
    colors: [],
    categories: [
      { id: 'tropical', label: 'Tropical', color: '#2d8a4e' },
      { id: 'arid', label: 'Arid / desert', color: '#d4a017' },
      { id: 'temperate', label: 'Temperate', color: '#3d8b6e' },
      { id: 'continental', label: 'Continental', color: '#4a6fa5' },
      { id: 'polar', label: 'Polar / tundra', color: '#7eb6d9' },
      { id: 'highland', label: 'Highland', color: '#8b6f47' },
      { id: 'mediterranean', label: 'Mediterranean', color: '#c45c2a' },
      { id: 'mixed', label: 'Varied / mixed', color: '#6b7c8a' },
      { id: 'unknown', label: 'No data', color: '#c5cdd6' },
    ],
  },
  {
    id: 'migration',
    name: 'Migration',
    shortName: 'Migration',
    kind: 'numeric',
    description: 'Net migration: positive = more people entering than leaving (per 1,000 people).',
    legendTitle: 'Net migrants / 1,000 people',
    sourceNote: 'Factbook Net migration rate. Blue = net in, orange = net out.',
    // diverging-ish via breaks around 0 handled in color function
    colors: ['#d94801', '#fdd0a2', '#f7f7f7', '#9ecae1', '#08519c'],
    format: (n) => `${n > 0 ? '+' : ''}${n.toFixed(1)}`,
    breaks: [-5, -1, 1, 5],
  },
  {
    id: 'stability',
    name: 'Displacement pressure',
    shortName: 'Displacement',
    kind: 'numeric',
    description:
      'A classroom proxy for conflict stress: refugees + IDPs hosted or reported (log scale). Not a full political-stability index.',
    legendTitle: 'Refugees + IDPs (approx.)',
    sourceNote:
      'Parsed from Factbook “Refugees and internally displaced persons.” Higher values often signal conflict or major hosting.',
    colors: ['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000'],
    format: (n) => {
      if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
      if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
      return `${Math.round(n)}`;
    },
    breaks: [10000, 100000, 500000, 2000000],
  },
  {
    id: 'trade',
    name: 'Trade & connections',
    shortName: 'Trade',
    kind: 'numeric',
    description: 'How connected an economy is online — internet access as a simple globalization signal.',
    legendTitle: 'Internet users (%)',
    sourceNote:
      'Uses internet access % (available consistently). Export values vary too much in free text for a clean choropleth.',
    colors: ['#f2f0f7', '#cbc9e2', '#9e9ac8', '#756bb1', '#54278f'],
    format: (n) => `${n.toFixed(0)}%`,
    breaks: [25, 50, 70, 90],
  },
];

export function getLayerDef(id: LayerId | null): MapLayerDef | null {
  if (!id) return null;
  return MAP_LAYERS.find((l) => l.id === id) || null;
}

/** Pick color for a numeric value using layer breaks. */
export function colorForNumeric(layer: MapLayerDef, value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '#c5cdd6';
  const colors = layer.colors;
  const breaks = layer.breaks || [];
  if (layer.id === 'migration') {
    // diverging around 0
    if (value <= -5) return colors[0];
    if (value <= -1) return colors[1];
    if (value < 1) return colors[2];
    if (value < 5) return colors[3];
    return colors[4];
  }
  let idx = 0;
  for (let i = 0; i < breaks.length; i++) {
    if (value >= breaks[i]) idx = i + 1;
  }
  return colors[Math.min(idx, colors.length - 1)];
}

export function colorForCategory(layer: MapLayerDef, category: string | null | undefined): string {
  if (!category) return '#c5cdd6';
  const found = layer.categories?.find((c) => c.id === category);
  return found?.color || '#c5cdd6';
}

export function colorForLayerValue(
  layer: MapLayerDef | null,
  lv: LayerValue | null | undefined
): string {
  if (!layer || !lv) return '#c5cdd6';
  if (layer.kind === 'category') return colorForCategory(layer, lv.category);
  return colorForNumeric(layer, lv.value);
}

/** Legend rows for the active layer. */
export function legendItems(layer: MapLayerDef): { color: string; label: string }[] {
  if (layer.kind === 'category') {
    return (layer.categories || [])
      .filter((c) => c.id !== 'unknown')
      .map((c) => ({ color: c.color, label: c.label }));
  }
  const breaks = layer.breaks || [];
  const colors = layer.colors;
  const fmt = layer.format || ((n: number) => String(n));
  const items: { color: string; label: string }[] = [];
  if (layer.id === 'migration') {
    return [
      { color: colors[0], label: '≤ −5 (strong net out)' },
      { color: colors[1], label: '−5 to −1' },
      { color: colors[2], label: 'About even' },
      { color: colors[3], label: '+1 to +5' },
      { color: colors[4], label: '≥ +5 (strong net in)' },
    ];
  }
  items.push({ color: colors[0], label: `< ${fmt(breaks[0])}` });
  for (let i = 0; i < breaks.length - 1; i++) {
    items.push({
      color: colors[i + 1],
      label: `${fmt(breaks[i])} – ${fmt(breaks[i + 1])}`,
    });
  }
  items.push({
    color: colors[colors.length - 1],
    label: `≥ ${fmt(breaks[breaks.length - 1])}`,
  });
  return items;
}

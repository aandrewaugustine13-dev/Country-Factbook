export interface MetricDef {
  key: string;
  label: string;
  unit: string;
  section: string;
  numeric: boolean;
  tip: string;
  format: 'number' | 'dollar' | 'pct' | 'decimal' | 'bigNumber' | 'bigDollar';
  /** For compare table: extract value from a country object */
  getValue: (c: Record<string, any>) => string | number | null | undefined;
}

export const METRICS: MetricDef[] = [
  // Basics
  { key: 'capital', label: 'Capital', unit: '', section: 'Basics', numeric: false, tip: 'The city where the country\'s government is headquartered.', format: 'number', getValue: c => c.capital },
  { key: 'region', label: 'Region', unit: '', section: 'Basics', numeric: false, tip: 'The world region this country belongs to.', format: 'number', getValue: c => c.region },
  { key: 'population', label: 'Population', unit: 'people', section: 'Basics', numeric: true, tip: 'Total number of people living in the country.', format: 'bigNumber', getValue: c => c.population },
  { key: 'area_km2', label: 'Area (km²)', unit: 'km²', section: 'Basics', numeric: true, tip: 'Total land and water area of the country in square kilometers.', format: 'bigNumber', getValue: c => c.area_km2 },
  { key: 'languages', label: 'Languages', unit: '', section: 'Basics', numeric: false, tip: 'Primary languages spoken in this country.', format: 'number', getValue: c => c.languages_detail || c.languages?.join(', ') },
  { key: 'currency', label: 'Currency', unit: '', section: 'Basics', numeric: false, tip: 'The official money used in this country.', format: 'number', getValue: c => c.currency },

  // Government
  { key: 'government_type', label: 'Government Type', unit: '', section: 'Government', numeric: false, tip: 'How this country is governed — monarchy, republic, democracy, etc.', format: 'number', getValue: c => c.government_type },

  // Economy
  { key: 'gdp_ppp', label: 'GDP (PPP)', unit: 'USD', section: 'Economy', numeric: true, tip: 'Total economic output adjusted so you can compare what money actually buys in each country. "PPP" stands for Purchasing Power Parity.', format: 'bigDollar', getValue: c => c.gdp_ppp },
  { key: 'gdp_per_capita', label: 'GDP per Capita', unit: 'USD', section: 'Economy', numeric: true, tip: 'The average economic output per person. Higher usually means people earn more, but doesn\'t show how equally wealth is distributed.', format: 'dollar', getValue: c => c.gdp_per_capita },
  { key: 'gdp_growth_pct', label: 'GDP Growth', unit: '%', section: 'Economy', numeric: true, tip: 'How fast the economy grew (or shrank) in the past year.', format: 'pct', getValue: c => c.gdp_growth_pct },
  { key: 'inflation_pct', label: 'Inflation', unit: '%', section: 'Economy', numeric: true, tip: 'How fast prices are rising. High inflation means your money buys less over time. 2-3% is considered healthy.', format: 'pct', getValue: c => c.inflation_pct },
  { key: 'unemployment_pct', label: 'Unemployment', unit: '%', section: 'Economy', numeric: true, tip: 'Percentage of people who want to work but can\'t find a job.', format: 'pct', getValue: c => c.unemployment_pct },
  { key: 'public_debt_pct', label: 'Public Debt', unit: '% of GDP', section: 'Economy', numeric: true, tip: 'How much the government owes compared to its total economic output. Over 100% means the government owes more than the country produces in a year.', format: 'pct', getValue: c => c.public_debt_pct },

  // People
  { key: 'life_expectancy', label: 'Life Expectancy', unit: 'years', section: 'People', numeric: true, tip: 'How long a baby born today can expect to live on average.', format: 'decimal', getValue: c => c.life_expectancy },
  { key: 'infant_mortality', label: 'Infant Mortality', unit: 'per 1,000 births', section: 'People', numeric: true, tip: 'How many babies out of every 1,000 born don\'t survive their first year. Lower is better.', format: 'decimal', getValue: c => c.infant_mortality },
  { key: 'median_age', label: 'Median Age', unit: 'years', section: 'People', numeric: true, tip: 'The age where half the population is older and half is younger. Low = young country, high = aging population.', format: 'decimal', getValue: c => c.median_age },
  { key: 'fertility_rate', label: 'Fertility Rate', unit: 'children/woman', section: 'People', numeric: true, tip: 'Average number of children a woman has. Below 2.1 means the population may shrink over time without immigration.', format: 'decimal', getValue: c => c.fertility_rate },
  { key: 'pop_growth_pct', label: 'Population Growth', unit: '%', section: 'People', numeric: true, tip: 'How fast the population is growing (or shrinking if negative) per year.', format: 'pct', getValue: c => c.pop_growth_pct },
  { key: 'urbanization_pct', label: 'Urbanization', unit: '%', section: 'People', numeric: true, tip: 'What percentage of people live in cities versus rural areas.', format: 'pct', getValue: c => c.urbanization_pct },

  // Infrastructure
  { key: 'internet_pct', label: 'Internet Access', unit: '%', section: 'Infrastructure', numeric: true, tip: 'What percentage of the population uses the internet.', format: 'pct', getValue: c => c.internet_pct },
  { key: 'military_pct_gdp', label: 'Military Spending', unit: '% of GDP', section: 'Infrastructure', numeric: true, tip: 'What share of the country\'s economy goes to the military.', format: 'pct', getValue: c => c.military_pct_gdp },
  { key: 'edu_spend_pct_gdp', label: 'Education Spending', unit: '% of GDP', section: 'Infrastructure', numeric: true, tip: 'What share of the country\'s economy goes to education.', format: 'pct', getValue: c => c.edu_spend_pct_gdp },

  // Geography/Culture (text fields)
  { key: 'climate', label: 'Climate', unit: '', section: 'Geography', numeric: false, tip: 'The typical weather patterns in this country.', format: 'number', getValue: c => c.climate },
  { key: 'terrain', label: 'Terrain', unit: '', section: 'Geography', numeric: false, tip: 'The physical landscape — mountains, plains, deserts, etc.', format: 'number', getValue: c => c.terrain },
  { key: 'natural_resources', label: 'Natural Resources', unit: '', section: 'Geography', numeric: false, tip: 'Raw materials found in this country (oil, minerals, timber, etc).', format: 'number', getValue: c => c.natural_resources },
];

/** Metrics that can be used in the quiz (numeric, meaningful to compare) */
export const QUIZ_METRICS = METRICS.filter(m =>
  m.numeric && !['area_km2', 'pop_growth_pct', 'gdp_growth_pct'].includes(m.key)
);

/** Numeric metrics for chart selectors */
export const CHART_METRICS = METRICS.filter(m => m.numeric);

/** Sortable metrics for table sorting */
export const SORTABLE_METRICS = METRICS.filter(m => m.numeric).map(m => ({ key: m.key, label: m.label }));

export function formatMetricValue(value: any, format: MetricDef['format']): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(n) && typeof value === 'string') return value;
  if (isNaN(n)) return '—';

  switch (format) {
    case 'bigNumber':
      if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
      if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
      if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
      if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
      return n.toLocaleString('en-US');
    case 'bigDollar':
      if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
      if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
      return `$${n.toLocaleString('en-US')}`;
    case 'dollar':
      return `$${n.toLocaleString('en-US')}`;
    case 'pct':
      return `${n}%`;
    case 'decimal':
      return n.toFixed(1);
    default:
      return typeof value === 'number' ? n.toLocaleString('en-US') : String(value);
  }
}

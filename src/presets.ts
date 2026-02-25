export interface ComparisonPreset {
  name: string;
  codes: string[];
  desc: string;
}

export const COMPARISON_PRESETS: ComparisonPreset[] = [
  { name: 'G7 Economies', codes: ['USA', 'GBR', 'FRA', 'DEU', 'ITA', 'JPN', 'CAN'], desc: "World's largest advanced economies" },
  { name: 'BRICS Nations', codes: ['BRA', 'RUS', 'IND', 'CHN', 'ZAF'], desc: 'Major emerging economies' },
  { name: 'Scandinavian Model', codes: ['NOR', 'SWE', 'FIN', 'DNK', 'ISL'], desc: 'Nordic welfare states' },
  { name: 'Middle East', codes: ['SAU', 'IRN', 'IRQ', 'ISR', 'ARE', 'TUR'], desc: 'Key Middle Eastern nations' },
  { name: 'Latin America', codes: ['BRA', 'MEX', 'ARG', 'COL', 'CHL', 'PER', 'VEN'], desc: 'Major Latin American nations' },
  { name: 'East Asia', codes: ['CHN', 'JPN', 'KOR', 'TWN'], desc: 'East Asian powerhouses' },
  { name: 'Southeast Asia', codes: ['IDN', 'THA', 'VNM', 'PHL', 'MYS', 'SGP'], desc: 'ASEAN nations' },
  { name: 'Population Giants', codes: ['CHN', 'IND', 'USA', 'IDN', 'PAK', 'BRA', 'NGA', 'BGD'], desc: 'Countries with 150M+ people' },
  { name: 'English Speaking', codes: ['USA', 'GBR', 'CAN', 'AUS', 'NZL', 'IRL'], desc: 'Major English-speaking nations' },
  { name: 'Post-Soviet', codes: ['RUS', 'UKR', 'KAZ', 'UZB', 'GEO'], desc: 'Former Soviet republics' },
  { name: 'Sub-Saharan Africa', codes: ['NGA', 'ZAF', 'KEN', 'ETH', 'GHA', 'TZA', 'COD'], desc: 'Major African economies' },
  { name: 'Oceania', codes: ['AUS', 'NZL', 'PNG', 'FJI'], desc: 'Pacific region nations' },
];

/** Base country list item used on the home page search/filter UI. */
export interface CountrySearchItem {
  code: string;
  name_common: string;
  flag_url: string;
  flag_emoji: string;
  region: string;
  capital: string;
}

/** One Factbook field inside a section. */
export interface FactbookEntry {
  label: string;
  value: string;
}

/** Nested CIA World Factbook sections (Introduction, Geography, …). */
export type FactbookSections = Record<string, FactbookEntry[]>;

/**
 * Full country profile as stored in data/all-countries.json.
 * Base metadata comes from mledoze/countries; `factbook` is merged from
 * factbook/factbook.json by `npm run build:data`.
 */
export interface CountryProfile {
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
  /** Null when no Factbook profile exists or a mismatch was rejected. */
  factbook: FactbookSections | null;
}

/**
 * Numeric/text metrics for compare / quiz / daily features
 * (data/comparison-data.json), parsed from Factbook free text.
 */
export interface ComparisonCountry {
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

export interface CountryProfile {
  code: string;
  name_common: string;
  name_official: string;
  flag_url: string;
  flag_alt: string;
  region: string;
  subregion: string;
  capital: string;
  area_km2: number;
  population: number;
  population_density_per_km2: number;
  languages: string[];
  demonym: string;
  currency: string;
  gdp_usd_billions: number | null;
  gdp_per_capita_usd: number | null;
  inflation_cpi_percent: number | null;
  unemployment_percent: number | null;
  life_expectancy_years: number | null;
  median_age_years: number | null;
  urban_population_percent: number | null;
  government_type: string;
  head_of_state: string;
  head_of_government: string;
  legislature: string;
  internet_tld: string[];
  calling_code: string;
  timezones: string[];
  updated_at: string;
  sources: Array<{ label: string; url: string }>;
}

export interface CountrySearchItem {
  code: string;
  name_common: string;
  flag_url: string;
  region: string;
}

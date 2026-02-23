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
}

export interface CountrySearchItem {
  code: string;
  name_common: string;
  flag_url: string;
  flag_emoji: string;
  region: string;
  capital: string;
}

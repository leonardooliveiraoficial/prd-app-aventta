export type Local = {
  id: string;
  cidade: string;
  estado?: string;
  pais: string; // ISO alpha-2 para badge (ex.: "BR")
  lat: number;
  lng: number;
  createdAt: string; // ISO
  updatedAt?: string;
};

export type AppPreferences = {
  theme: 'dark' | 'light';
  clustering: boolean;
  clusterDensity: number;
  language: 'pt-BR' | 'en-US';
  rightClickSuggestion: boolean;
};

export type DrawerSection = 'inicio' | 'locais' | 'adicionar' | 'importar' | 'preferencias' | 'ajuda';

export type MapInteraction = {
  type: 'rightClick' | 'markerClick';
  lat?: number;
  lng?: number;
  localId?: string;
};

export type ValidationError = {
  field: string;
  message: string;
};

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type CountryCode = 'BR' | 'PY' | 'AR' | 'US' | 'CA' | 'MX' | 'FR' | 'ES' | 'IT' | 'DE' | 'UK' | 'JP' | 'CN' | 'IN' | 'AU';

export const COUNTRY_FLAGS: Record<CountryCode, string> = {
  BR: '🇧🇷',
  PY: '🇵🇾',
  AR: '🇦🇷',
  US: '🇺🇸',
  CA: '🇨🇦',
  MX: '🇲🇽',
  FR: '🇫🇷',
  ES: '🇪🇸',
  IT: '🇮🇹',
  DE: '🇩🇪',
  UK: '🇬🇧',
  JP: '🇯🇵',
  CN: '🇨🇳',
  IN: '🇮🇳',
  AU: '🇦🇺',
};

export const COUNTRIES = [
  { code: 'BR' as CountryCode, name: 'Brasil' },
  { code: 'PY' as CountryCode, name: 'Paraguai' },
  { code: 'AR' as CountryCode, name: 'Argentina' },
  { code: 'US' as CountryCode, name: 'Estados Unidos' },
  { code: 'CA' as CountryCode, name: 'Canadá' },
  { code: 'MX' as CountryCode, name: 'México' },
  { code: 'FR' as CountryCode, name: 'França' },
  { code: 'ES' as CountryCode, name: 'Espanha' },
  { code: 'IT' as CountryCode, name: 'Itália' },
  { code: 'DE' as CountryCode, name: 'Alemanha' },
  { code: 'UK' as CountryCode, name: 'Reino Unido' },
  { code: 'JP' as CountryCode, name: 'Japão' },
  { code: 'CN' as CountryCode, name: 'China' },
  { code: 'IN' as CountryCode, name: 'Índia' },
  { code: 'AU' as CountryCode, name: 'Austrália' },
];
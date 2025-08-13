// Constantes para o sistema de localização

export const STORAGE_KEY = 'travel-locations';
export const OLD_STORAGE_KEY = 'locations';

// Configurações padrão
export const DEFAULT_MAP_CENTER = { lat: -14.235, lng: -51.9253 }; // Centro do Brasil
export const DEFAULT_MAP_ZOOM = 4;

// Limites de validação
export const MAX_LOCATIONS = 1000;
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;

// Configurações de duplicatas
export const DUPLICATE_THRESHOLD = 0.001; // ~100 metros
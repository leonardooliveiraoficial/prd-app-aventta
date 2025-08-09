import { Local, ValidationError, CountryCode, COUNTRY_FLAGS } from '../types';

// Função para calcular distância entre dois pontos usando fórmula de Haversine
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

// Normalização de nomes de cidades
export function normalizeCityName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, ' '); // Normaliza espaços
}

// Validação de coordenadas
export function validateCoordinates(lat: number, lng: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (isNaN(lat) || lat < -90 || lat > 90) {
    errors.push({
      field: 'lat',
      message: 'Latitude deve estar entre -90 e 90 graus',
    });
  }

  if (isNaN(lng) || lng < -180 || lng > 180) {
    errors.push({
      field: 'lng',
      message: 'Longitude deve estar entre -180 e 180 graus',
    });
  }

  return errors;
}

// Validação de local completo
export function validateLocal(local: Partial<Local>, existingLocals: Local[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!local.cidade?.trim()) {
    errors.push({
      field: 'cidade',
      message: 'Nome da cidade é obrigatório',
    });
  }

  if (!local.pais?.trim()) {
    errors.push({
      field: 'pais',
      message: 'País é obrigatório',
    });
  }

  if (local.lat !== undefined && local.lng !== undefined) {
    errors.push(...validateCoordinates(local.lat, local.lng));
  } else {
    errors.push({
      field: 'coordinates',
      message: 'Coordenadas são obrigatórias',
    });
  }

  // Verificar duplicidade por nome
  if (local.cidade && local.pais) {
    const normalizedCity = normalizeCityName(local.cidade);
    const normalizedState = local.estado ? normalizeCityName(local.estado) : '';
    const normalizedCountry = normalizeCityName(local.pais);

    const duplicate = existingLocals.find(existing => {
      if (existing.id === local.id) return false; // Ignorar o próprio item ao editar
      
      const existingCity = normalizeCityName(existing.cidade);
      const existingState = existing.estado ? normalizeCityName(existing.estado) : '';
      const existingCountry = normalizeCityName(existing.pais);

      return (
        existingCity === normalizedCity &&
        existingState === normalizedState &&
        existingCountry === normalizedCountry
      );
    });

    if (duplicate) {
      errors.push({
        field: 'cidade',
        message: 'Este local já foi cadastrado',
      });
    }
  }

  // Verificar proximidade geográfica (≤3km)
  if (local.lat !== undefined && local.lng !== undefined) {
    const nearbyLocal = existingLocals.find(existing => {
      if (existing.id === local.id) return false; // Ignorar o próprio item ao editar
      
      const distance = calculateDistance(local.lat!, local.lng!, existing.lat, existing.lng);
      return distance <= 3;
    });

    if (nearbyLocal) {
      errors.push({
        field: 'coordinates',
        message: `Existe um local muito próximo (${nearbyLocal.cidade}) a menos de 3km`,
      });
    }
  }

  return errors;
}

// Gerar ID único
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Formatação de data
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

// Obter bandeira do país
export function getCountryFlag(countryCode: string): string {
  return COUNTRY_FLAGS[countryCode as CountryCode] || '🏳️';
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Filtrar locais por busca
export function filterLocals(locals: Local[], searchTerm: string): Local[] {
  if (!searchTerm.trim()) return locals;

  const normalizedSearch = normalizeCityName(searchTerm);
  
  return locals.filter(local => {
    const normalizedCity = normalizeCityName(local.cidade);
    const normalizedState = local.estado ? normalizeCityName(local.estado) : '';
    const normalizedCountry = normalizeCityName(local.pais);

    return (
      normalizedCity.includes(normalizedSearch) ||
      normalizedState.includes(normalizedSearch) ||
      normalizedCountry.includes(normalizedSearch)
    );
  });
}

// Estatísticas dos locais
export function getLocalsStats(locals: Local[]) {
  const cidades = locals.length;
  const estados = new Set(locals.map(l => l.estado).filter(Boolean)).size;
  const paises = new Set(locals.map(l => l.pais)).size;

  return { cidades, estados, paises };
}

// Exportar/Importar dados
export function exportLocalsToJSON(locals: Local[]): string {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    locals,
  };
  return JSON.stringify(data, null, 2);
}

export function validateImportData(jsonString: string): { isValid: boolean; locals?: Local[]; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.locals || !Array.isArray(data.locals)) {
      return { isValid: false, error: 'Formato inválido: propriedade "locals" não encontrada' };
    }

    const locals = data.locals as Local[];
    
    // Validar estrutura básica de cada local
    for (const local of locals) {
      if (!local.id || !local.cidade || !local.pais || 
          typeof local.lat !== 'number' || typeof local.lng !== 'number') {
        return { isValid: false, error: 'Formato inválido: dados de local incompletos' };
      }
    }

    return { isValid: true, locals };
  } catch {
    return { isValid: false, error: 'JSON inválido' };
  }
}

// Mesclar locais importados com existentes
export function mergeLocals(existing: Local[], imported: Local[]): { merged: Local[]; duplicates: Local[] } {
  const duplicates: Local[] = [];
  const merged = [...existing];

  for (const importedLocal of imported) {
    const isDuplicate = existing.some(existingLocal => {
      const sameLocation = normalizeCityName(existingLocal.cidade) === normalizeCityName(importedLocal.cidade) &&
                          (existingLocal.estado || '') === (importedLocal.estado || '') &&
                          normalizeCityName(existingLocal.pais) === normalizeCityName(importedLocal.pais);
      
      const nearbyLocation = calculateDistance(
        existingLocal.lat, existingLocal.lng,
        importedLocal.lat, importedLocal.lng
      ) <= 3;

      return sameLocation || nearbyLocation;
    });

    if (isDuplicate) {
      duplicates.push(importedLocal);
    } else {
      merged.push({
        ...importedLocal,
        id: generateId(), // Gerar novo ID para evitar conflitos
        createdAt: new Date().toISOString(),
      });
    }
  }

  return { merged, duplicates };
}
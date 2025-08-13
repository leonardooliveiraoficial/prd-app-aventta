// Função para obter código do país
export function getCountryCode(country: string): string {
  const countryMap: { [key: string]: string } = {
    'Brasil': 'BR',
    'Brazil': 'BR',
    'Argentina': 'AR',
    'Chile': 'CL',
    'Peru': 'PE',
    'Uruguai': 'UY',
    'Uruguay': 'UY',
    'Paraguai': 'PY',
    'Paraguay': 'PY',
    'Bolívia': 'BO',
    'Bolivia': 'BO',
    'Colômbia': 'CO',
    'Colombia': 'CO',
    'Venezuela': 'VE',
    'Equador': 'EC',
    'Ecuador': 'EC',
    'Guiana': 'GY',
    'Guyana': 'GY',
    'Suriname': 'SR',
    'Guiana Francesa': 'GF',
    'French Guiana': 'GF'
  };
  return countryMap[country] || 'BR';
}

// Função para obter bandeira do país
export function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Função para verificar se é duplicado
export function isDuplicate(newLocation: { lat: number; lng: number }, existingLocations: { lat: number; lng: number }[]): boolean {
  const threshold = 0.001; // ~100m de precisão
  return existingLocations.some(loc => 
    Math.abs(loc.lat - newLocation.lat) < threshold && 
    Math.abs(loc.lng - newLocation.lng) < threshold
  );
}
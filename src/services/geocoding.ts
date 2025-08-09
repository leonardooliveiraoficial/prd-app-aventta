export interface GeocodingResult {
  id: string;
  name: string;
  displayName: string;
  country: string;
  state?: string;
  city?: string;
  latitude: number;
  longitude: number;
  type: 'city' | 'state' | 'country' | 'place';
  importance: number;
}

export interface Country {
  name: string;
  code: string;
  capital?: string;
  region: string;
  subregion: string;
  latitude?: number;
  longitude?: number;
}

class GeocodingService {
  private readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
  private readonly COUNTRIES_API_URL = 'https://restcountries.com/v3.1';
  private readonly REQUEST_DELAY = 1000; // Nominatim requires 1 second between requests
  private lastRequestTime = 0;
  private countriesCache: Country[] | null = null;

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async ensureRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      await this.delay(this.REQUEST_DELAY - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
  }

  private normalizeType(osmType: string, osmClass: string, address?: Record<string, unknown>): GeocodingResult['type'] {
    // Priorizar classificação baseada no endereço se disponível
    if (address) {
      const hasCity = address.city || address.town || address.village || address.municipality;
      const hasState = address.state || address.province || address.region;
      const hasCountry = address.country;
      
      // Se tem cidade no endereço, é provavelmente uma cidade
      if (hasCity) {
        return 'city';
      }
      
      // Se tem estado mas não cidade, é provavelmente um estado
      if (hasState && !hasCity) {
        return 'state';
      }
      
      // Se só tem país, é um país
      if (hasCountry && !hasState && !hasCity) {
        return 'country';
      }
    }
    
    // Classificação baseada no tipo OSM
    if (osmClass === 'place') {
      if (osmType === 'city' || osmType === 'town' || osmType === 'village' || osmType === 'municipality') {
        return 'city';
      }
      if (osmType === 'state' || osmType === 'province') {
        return 'state';
      }
      if (osmType === 'country') {
        return 'country';
      }
    }
    
    // Boundaries administrativas podem ser estados ou cidades dependendo do nível
    if (osmClass === 'boundary' && osmType === 'administrative') {
      // Se tem informações de cidade no endereço, é uma cidade
      if (address && (address.city || address.town || address.village || address.municipality)) {
        return 'city';
      }
      return 'state';
    }
    
    return 'place';
  }

  async searchPlaces(query: string, limit: number = 10): Promise<GeocodingResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      await this.ensureRateLimit();

      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: limit.toString(),
        'accept-language': 'pt-BR,pt,en',
        countrycodes: '', // Buscar em todos os países
        dedupe: '1',
        extratags: '1',
        namedetails: '1'
      });

      const response = await fetch(`${this.NOMINATIM_BASE_URL}/search?${params}`, {
        headers: {
          'User-Agent': 'MapaLugaresVisitados/1.0 (https://github.com/user/repo)'
        }
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();

      return data.map((item: Record<string, unknown>, index: number) => {
        const address = (item.address as Record<string, unknown>) || {};
        const country = (address.country as string) || '';
        const state = (address.state as string) || (address.province as string) || (address.region as string) || '';
        const city = (address.city as string) || (address.town as string) || (address.village as string) || (address.municipality as string) || '';
        
        return {
          id: `${item.place_id}-${index}`,
          name: (item.name as string) || (item.display_name as string).split(',')[0],
          displayName: item.display_name as string,
          country,
          state,
          city,
          latitude: parseFloat(item.lat as string),
          longitude: parseFloat(item.lon as string),
          type: this.normalizeType(item.type as string, item.class as string, address),
          importance: parseFloat((item.importance as string) || '0')
        };
      }).sort((a: GeocodingResult, b: GeocodingResult) => b.importance - a.importance);

    } catch (error) {
      console.error('Erro ao buscar lugares:', error);
      return [];
    }
  }

  async getCountries(): Promise<Country[]> {
    if (this.countriesCache) {
      return this.countriesCache;
    }

    try {
      const response = await fetch(`${this.COUNTRIES_API_URL}/all?fields=name,cca2,capital,region,subregion,latlng`);
      
      if (!response.ok) {
        throw new Error(`Countries API error: ${response.status}`);
      }

      const data = await response.json();

      this.countriesCache = data.map((country: Record<string, unknown>) => ({
        name: (country.name as Record<string, unknown>).common as string,
        code: country.cca2 as string,
        capital: (country.capital as string[])?.[0],
        region: country.region as string,
        subregion: country.subregion as string,
        latitude: (country.latlng as number[])?.[0],
        longitude: (country.latlng as number[])?.[1]
      })).sort((a: Country, b: Country) => a.name.localeCompare(b.name));

      return this.countriesCache;
    } catch (error) {
      console.error('Erro ao buscar países:', error);
      return [];
    }
  }

  async searchCountries(query: string): Promise<GeocodingResult[]> {
    const countries = await this.getCountries();
    
    if (!query || query.length < 2) {
      return [];
    }

    const filtered = countries.filter(country => 
      country.name.toLowerCase().includes(query.toLowerCase()) ||
      (country.capital && country.capital.toLowerCase().includes(query.toLowerCase()))
    );

    return filtered.map((country, index) => ({
      id: `country-${country.code}-${index}`,
      name: country.name,
      displayName: `${country.name} (País)`,
      country: country.name,
      latitude: country.latitude || 0,
      longitude: country.longitude || 0,
      type: 'country' as const,
      importance: 1
    }));
  }

  async searchCombined(query: string, limit: number = 10): Promise<GeocodingResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      // Buscar em paralelo nos países e no Nominatim
      const [countryResults, placeResults] = await Promise.all([
        this.searchCountries(query),
        this.searchPlaces(query, Math.max(5, limit - 3))
      ]);

      // Combinar resultados, priorizando países se a busca for específica
      const combined = [...countryResults.slice(0, 3), ...placeResults];
      
      // Remover duplicatas baseado no nome e país
      const unique = combined.filter((item, index, arr) => 
        arr.findIndex(other => 
          other.name.toLowerCase() === item.name.toLowerCase() && 
          other.country.toLowerCase() === item.country.toLowerCase()
        ) === index
      );

      // Ordenar por relevância
      return unique
        .sort((a, b) => {
          // Priorizar correspondências exatas
          const aExact = a.name.toLowerCase() === query.toLowerCase();
          const bExact = b.name.toLowerCase() === query.toLowerCase();
          
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          
          // Depois por importância
          return b.importance - a.importance;
        })
        .slice(0, limit);

    } catch (error) {
      console.error('Erro na busca combinada:', error);
      return [];
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult | null> {
    try {
      await this.ensureRateLimit();

      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        format: 'json',
        addressdetails: '1',
        'accept-language': 'pt-BR,pt,en'
      });

      const response = await fetch(`${this.NOMINATIM_BASE_URL}/reverse?${params}`, {
        headers: {
          'User-Agent': 'MapaLugaresVisitados/1.0 (https://github.com/user/repo)'
        }
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding error: ${response.status}`);
      }

      const data = await response.json();

      if (!data || data.error) {
        return null;
      }

      const address = data.address || {};
      const country = address.country || '';
      const state = address.state || address.province || address.region || '';
      const city = address.city || address.town || address.village || address.municipality || '';

      return {
        id: `reverse-${data.place_id}`,
        name: data.name || data.display_name.split(',')[0],
        displayName: data.display_name,
        country,
        state,
        city,
        latitude,
        longitude,
        type: this.normalizeType(data.type, data.class, address),
        importance: parseFloat(data.importance || '0')
      };

    } catch (error) {
      console.error('Erro no reverse geocoding:', error);
      return null;
    }
  }
}

export const geocodingService = new GeocodingService();
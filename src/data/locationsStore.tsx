/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getCountryCode, isDuplicate } from '../utils/locationUtils';

// Interface para localização
export interface Location {
  id: string;
  label: string;
  countryCode: string;
  state?: string;
  city?: string;
  lat: number;
  lng: number;
  createdAt: string;
}

// Interface para criação de nova localização
export interface CreateLocationInput extends Omit<Location, 'id' | 'createdAt'> {}

// Interface para atualização de localização
export interface UpdateLocationInput extends Partial<CreateLocationInput> {}

// Actions do reducer
type LocationAction =
  | { type: 'SET_LOCATIONS'; payload: Location[] }
  | { type: 'ADD_LOCATION'; payload: Location }
  | { type: 'UPDATE_LOCATION'; payload: { id: string; data: UpdateLocationInput } }
  | { type: 'REMOVE_LOCATION'; payload: string }
  | { type: 'IMPORT_LOCATIONS'; payload: Location[] };

// Estado do contexto
interface LocationState {
  locations: Location[];
}

// Interface do contexto
interface LocationContextType {
  locations: Location[];
  addLocation: (location: CreateLocationInput) => boolean;
  updateLocation: (id: string, data: UpdateLocationInput) => boolean;
  removeLocation: (id: string) => boolean;
  exportLocations: () => string;
  importLocations: (jsonData: string) => boolean;
  getLocationById: (id: string) => Location | undefined;
}

// Reducer
function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'SET_LOCATIONS':
      return { locations: action.payload };
    case 'ADD_LOCATION':
      return { locations: [...state.locations, action.payload] };
    case 'UPDATE_LOCATION':
      return {
        locations: state.locations.map(loc =>
          loc.id === action.payload.id
            ? { ...loc, ...action.payload.data }
            : loc
        )
      };
    case 'REMOVE_LOCATION':
      return {
        locations: state.locations.filter(loc => loc.id !== action.payload)
      };
    case 'IMPORT_LOCATIONS':
      return { locations: action.payload };
    default:
      return state;
  }
}

// Interface para dados antigos
interface OldLocationData {
  cidade?: string;
  label?: string;
  pais?: string;
  country?: string;
  estado?: string;
  state?: string;
  city?: string;
  lat: number;
  lng: number;
  createdAt?: string;
}

// Função para migrar dados antigos
function migrateOldLocations(oldLocations: OldLocationData[]): Location[] {
  return oldLocations.map(loc => ({
    id: uuidv4(),
    label: loc.cidade || loc.label || 'Local sem nome',
    countryCode: getCountryCode(loc.pais || loc.country || 'BR'),
    state: loc.estado || loc.state,
    city: loc.cidade || loc.city,
    lat: loc.lat,
    lng: loc.lng,
    createdAt: new Date().toISOString()
  }));
}



// Dados iniciais migrados
const initialLocations = [
  // Minas Gerais
  { cidade: "Serra do Cipó", estado: "MG", pais: "Brasil", lat: -19.3861, lng: -43.5873 },
  { cidade: "São Roque de Minas", estado: "MG", pais: "Brasil", lat: -20.2455, lng: -46.3669 },
  { cidade: "Serra da Canastra", estado: "MG", pais: "Brasil", lat: -20.2514, lng: -46.3939 },
  { cidade: "Piumhi", estado: "MG", pais: "Brasil", lat: -20.4766, lng: -45.9597 },
  { cidade: "Belo Horizonte", estado: "MG", pais: "Brasil", lat: -19.9167, lng: -43.9345 },
  { cidade: "Três Pontas", estado: "MG", pais: "Brasil", lat: -21.3697, lng: -45.5103 },
  { cidade: "Conceição do Mato Dentro", estado: "MG", pais: "Brasil", lat: -19.0332, lng: -43.4229 },
  { cidade: "Brumadinho", estado: "MG", pais: "Brasil", lat: -20.1433, lng: -44.2007 },
  { cidade: "Ouro Preto", estado: "MG", pais: "Brasil", lat: -20.3856, lng: -43.5033 },
  { cidade: "Ouro Branco", estado: "MG", pais: "Brasil", lat: -20.5237, lng: -43.6958 },
  { cidade: "Lagoa Santa", estado: "MG", pais: "Brasil", lat: -19.6273, lng: -43.8935 },
  { cidade: "Senhora dos Remédios", estado: "MG", pais: "Brasil", lat: -21.035, lng: -43.5819 },
  { cidade: "Araxá", estado: "MG", pais: "Brasil", lat: -19.5902, lng: -46.9438 },
  { cidade: "Oliveira", estado: "MG", pais: "Brasil", lat: -20.6982, lng: -44.8291 },
  { cidade: "Pouso Alegre", estado: "MG", pais: "Brasil", lat: -22.226, lng: -45.9389 },
  { cidade: "São Gonçalo do Sapucaí", estado: "MG", pais: "Brasil", lat: -21.8907, lng: -45.5942 },
  { cidade: "Varginha", estado: "MG", pais: "Brasil", lat: -21.5556, lng: -45.4364 },
  { cidade: "Nepomuceno", estado: "MG", pais: "Brasil", lat: -21.2327, lng: -45.2351 },
  // Outros estados
  { cidade: "Floripa", estado: "SC", pais: "Brasil", lat: -27.5954, lng: -48.548 },
  { cidade: "Foz do Iguaçu", estado: "PR", pais: "Brasil", lat: -25.5161, lng: -54.5856 },
  { cidade: "Blumenau", estado: "SC", pais: "Brasil", lat: -26.9221, lng: -49.0661 },
  { cidade: "Bombinhas", estado: "SC", pais: "Brasil", lat: -27.1444, lng: -48.5177 },
  { cidade: "Formosa", estado: "GO", pais: "Brasil", lat: -15.538, lng: -47.337 },
  { cidade: "Rio de Janeiro", estado: "RJ", pais: "Brasil", lat: -22.9068, lng: -43.1729 },
  // Fora do Brasil
  { cidade: "Ciudad del Este", estado: "PR", pais: "Paraguai", lat: -25.5167, lng: -54.6167 },
  { cidade: "Puerto Iguazú", estado: "MN", pais: "Argentina", lat: -25.6011, lng: -54.5781 },
];

const STORAGE_KEY = 'locations-data';

// Contexto
const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Provider
export function LocationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(locationReducer, { locations: [] });

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        // Verificar se é o formato novo ou antigo
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          if (parsedData[0].id && parsedData[0].createdAt) {
            // Formato novo
            dispatch({ type: 'SET_LOCATIONS', payload: parsedData });
          } else {
            // Formato antigo - migrar
            const migratedData = migrateOldLocations(parsedData);
            dispatch({ type: 'SET_LOCATIONS', payload: migratedData });
          }
        } else {
          // Dados vazios ou inválidos - usar dados iniciais
          const migratedData = migrateOldLocations(initialLocations);
          dispatch({ type: 'SET_LOCATIONS', payload: migratedData });
        }
      } else {
        // Primeira execução - migrar dados iniciais
        const migratedData = migrateOldLocations(initialLocations);
        dispatch({ type: 'SET_LOCATIONS', payload: migratedData });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      // Em caso de erro, usar dados iniciais
      const migratedData = migrateOldLocations(initialLocations);
      dispatch({ type: 'SET_LOCATIONS', payload: migratedData });
    }
  }, []);

  // Salvar no localStorage sempre que locations mudar
  useEffect(() => {
    if (state.locations.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.locations));
      } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
      }
    }
  }, [state.locations]);

  // Função para adicionar localização
  const addLocation = (locationData: CreateLocationInput): boolean => {
    try {
      // Verificar duplicatas
      if (isDuplicate({ lat: locationData.lat, lng: locationData.lng }, state.locations)) {
        console.warn('Local duplicado detectado (mesmas coordenadas)');
        return false;
      }

      const newLocation: Location = {
        id: uuidv4(),
        ...locationData,
        createdAt: new Date().toISOString()
      };

      dispatch({ type: 'ADD_LOCATION', payload: newLocation });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar localização:', error);
      return false;
    }
  };

  // Função para atualizar localização
  const updateLocation = (id: string, data: UpdateLocationInput): boolean => {
    try {
      // Se lat/lng estão sendo atualizados, verificar duplicatas
      if (data.lat !== undefined && data.lng !== undefined) {
        if (isDuplicate({ lat: data.lat, lng: data.lng }, state.locations.filter(loc => loc.id !== id))) {
          console.warn('Local duplicado detectado (mesmas coordenadas)');
          return false;
        }
      }

      dispatch({ type: 'UPDATE_LOCATION', payload: { id, data } });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
      return false;
    }
  };

  // Função para remover localização
  const removeLocation = (id: string): boolean => {
    try {
      dispatch({ type: 'REMOVE_LOCATION', payload: id });
      return true;
    } catch (error) {
      console.error('Erro ao remover localização:', error);
      return false;
    }
  };

  // Função para exportar localizações
  const exportLocations = (): string => {
    try {
      return JSON.stringify(state.locations, null, 2);
    } catch (error) {
      console.error('Erro ao exportar localizações:', error);
      return '[]';
    }
  };

  // Função para importar localizações
  const importLocations = (jsonData: string): boolean => {
    try {
      const parsedData = JSON.parse(jsonData);
      if (!Array.isArray(parsedData)) {
        console.error('Dados de importação devem ser um array');
        return false;
      }

      // Validar estrutura dos dados
      const validLocations = parsedData.filter(loc => {
        return loc && 
               typeof loc.lat === 'number' && 
               typeof loc.lng === 'number' && 
               (loc.label || loc.cidade) &&
               (loc.countryCode || loc.pais);
      });

      if (validLocations.length === 0) {
        console.error('Nenhuma localização válida encontrada nos dados de importação');
        return false;
      }

      // Migrar dados se necessário
      const migratedData = validLocations.map(loc => {
        if (loc.id && loc.createdAt) {
          return loc; // Já está no formato novo
        } else {
          // Migrar formato antigo
          return {
            id: uuidv4(),
            label: loc.label || loc.cidade || 'Local importado',
            countryCode: loc.countryCode || getCountryCode(loc.pais || 'BR'),
            state: loc.state || loc.estado,
            city: loc.city || loc.cidade,
            lat: loc.lat,
            lng: loc.lng,
            createdAt: new Date().toISOString()
          };
        }
      });

      dispatch({ type: 'IMPORT_LOCATIONS', payload: migratedData });
      return true;
    } catch (error) {
      console.error('Erro ao importar localizações:', error);
      return false;
    }
  };

  // Função para buscar localização por ID
  const getLocationById = (id: string): Location | undefined => {
    return state.locations.find(loc => loc.id === id);
  };

  const value: LocationContextType = {
    locations: state.locations,
    addLocation,
    updateLocation,
    removeLocation,
    exportLocations,
    importLocations,
    getLocationById
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

// Hook para usar o contexto
export function useLocations(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocations deve ser usado dentro de um LocationProvider');
  }
  return context;
}
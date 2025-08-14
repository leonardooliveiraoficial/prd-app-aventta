/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { isDuplicate } from '../utils/locationUtils';

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
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Estado do contexto
interface LocationState {
  locations: Location[];
  loading: boolean;
  error: string | null;
}

// Interface do contexto
interface LocationContextType {
  locations: Location[];
  loading: boolean;
  error: string | null;
  addLocation: (location: CreateLocationInput) => Promise<boolean>;
  updateLocation: (id: string, data: UpdateLocationInput) => Promise<boolean>;
  removeLocation: (id: string) => Promise<boolean>;
  exportLocations: () => string;
  importLocations: (jsonData: string) => Promise<boolean>;
  getLocationById: (id: string) => Location | undefined;
  refreshLocations: () => Promise<void>;
}

// Reducer
function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'SET_LOCATIONS':
      return { ...state, locations: action.payload };
    case 'ADD_LOCATION':
      return { ...state, locations: [...state.locations, action.payload] };
    case 'UPDATE_LOCATION':
      return {
        ...state,
        locations: state.locations.map(loc =>
          loc.id === action.payload.id
            ? { ...loc, ...action.payload.data }
            : loc
        )
      };
    case 'REMOVE_LOCATION':
      return {
        ...state,
        locations: state.locations.filter(loc => loc.id !== action.payload)
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Função para converter dados do Supabase para o formato da aplicação
function convertFromSupabase(data: any): Location {
  return {
    id: data.id,
    label: data.label,
    countryCode: data.country_code,
    state: data.state,
    city: data.city,
    lat: data.lat,
    lng: data.lng,
    createdAt: data.created_at
  };
}

// Função para converter dados da aplicação para o formato do Supabase
function convertToSupabase(location: CreateLocationInput) {
  return {
    label: location.label,
    country_code: location.countryCode,
    state: location.state || null,
    city: location.city || null,
    lat: location.lat,
    lng: location.lng
  };
}

const initialState: LocationState = {
  locations: [],
  loading: false,
  error: null
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function SupabaseLocationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(locationReducer, initialState);

  // Carregar localizações do Supabase
  const loadLocations = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const locations = data?.map(convertFromSupabase) || [];
      dispatch({ type: 'SET_LOCATIONS', payload: locations });
    } catch (error) {
      console.error('Erro ao carregar localizações:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar localizações' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadLocations();
  }, []);

  // Adicionar localização
  const addLocation = async (location: CreateLocationInput): Promise<boolean> => {
    // Verificar duplicatas
    if (isDuplicate(location, state.locations)) {
      dispatch({ type: 'SET_ERROR', payload: 'Esta localização já existe' });
      return false;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const newLocation = {
        id: uuidv4(),
        ...location,
        createdAt: new Date().toISOString()
      };

      const { error } = await supabase
        .from('locations')
        .insert([convertToSupabase(location)]);

      if (error) throw error;

      dispatch({ type: 'ADD_LOCATION', payload: newLocation });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar localização:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao adicionar localização' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Atualizar localização
  const updateLocation = async (id: string, data: UpdateLocationInput): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const updateData = convertToSupabase(data as CreateLocationInput);
      
      const { error } = await supabase
        .from('locations')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_LOCATION', payload: { id, data } });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar localização' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Remover localização
  const removeLocation = async (id: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'REMOVE_LOCATION', payload: id });
      return true;
    } catch (error) {
      console.error('Erro ao remover localização:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover localização' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Exportar localizações
  const exportLocations = (): string => {
    return JSON.stringify(state.locations, null, 2);
  };

  // Importar localizações
  const importLocations = async (jsonData: string): Promise<boolean> => {
    try {
      const importedLocations = JSON.parse(jsonData);
      
      if (!Array.isArray(importedLocations)) {
        throw new Error('Formato inválido');
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Inserir todas as localizações no Supabase
      const supabaseData = importedLocations.map(loc => convertToSupabase(loc));
      
      const { error } = await supabase
        .from('locations')
        .insert(supabaseData);

      if (error) throw error;

      // Recarregar dados
      await loadLocations();
      return true;
    } catch (error) {
      console.error('Erro ao importar localizações:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao importar localizações' });
      return false;
    }
  };

  // Buscar localização por ID
  const getLocationById = (id: string): Location | undefined => {
    return state.locations.find(loc => loc.id === id);
  };

  // Atualizar localizações
  const refreshLocations = async (): Promise<void> => {
    await loadLocations();
  };

  const value: LocationContextType = {
    locations: state.locations,
    loading: state.loading,
    error: state.error,
    addLocation,
    updateLocation,
    removeLocation,
    exportLocations,
    importLocations,
    getLocationById,
    refreshLocations
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useSupabaseLocations(): LocationContextType {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useSupabaseLocations deve ser usado dentro de um SupabaseLocationProvider');
  }
  return context;
}
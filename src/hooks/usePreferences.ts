import { useState, useEffect } from 'react';
import { AppPreferences } from '../types';

const PREFERENCES_KEY = 'mapa-rotas-preferences';

const defaultPreferences: AppPreferences = {
  theme: 'dark',
  clustering: true,
  language: 'pt-BR',
  rightClickSuggestion: true,
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar preferências do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.warn('Erro ao carregar preferências:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar preferências no localStorage
  const updatePreferences = (updates: Partial<AppPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
    }
  };

  // Resetar preferências para padrão
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    try {
      localStorage.removeItem(PREFERENCES_KEY);
    } catch (error) {
      console.error('Erro ao resetar preferências:', error);
    }
  };

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    isLoading,
  };
}
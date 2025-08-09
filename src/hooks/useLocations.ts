import { useState, useEffect, useCallback } from 'react';
import { Local } from '../types';
import { generateId, validateLocal, getLocalsStats } from '../utils';

const STORAGE_KEY = 'mapa-rotas-locais';

export function useLocations() {
  const [locals, setLocals] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedLocals = JSON.parse(stored) as Local[];
        
        // Validar se os dados estão no formato correto
        if (Array.isArray(parsedLocals)) {
          const validLocals = parsedLocals.filter(local => 
            local && 
            typeof local === 'object' &&
            local.id && 
            local.cidade && 
            local.pais &&
            typeof local.lat === 'number' &&
            typeof local.lng === 'number'
          );
          
          if (validLocals.length !== parsedLocals.length) {
            console.warn('Alguns locais inválidos foram removidos:', parsedLocals.length - validLocals.length);
          }
          
          setLocals(validLocals);
        } else {
          console.warn('Dados do localStorage não são um array válido, limpando...');
          localStorage.removeItem(STORAGE_KEY);
          setLocals([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar locais do localStorage:', error);
      // Se houver erro, limpar localStorage corrompido
      localStorage.removeItem(STORAGE_KEY);
      setLocals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar no localStorage sempre que locals mudar
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(locals));
      } catch (error) {
        console.error('Erro ao salvar locais no localStorage:', error);
      }
    }
  }, [locals, loading]);

  // Adicionar novo local
  const addLocal = useCallback((localData: Omit<Local, 'id' | 'createdAt'>) => {
    const errors = validateLocal(localData, locals);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const newLocal: Local = {
      ...localData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    setLocals(prev => [newLocal, ...prev]);
    return newLocal;
  }, [locals]);

  // Atualizar local existente
  const updateLocal = useCallback((id: string, updates: Partial<Local>) => {
    const localToUpdate = locals.find(l => l.id === id);
    if (!localToUpdate) {
      throw new Error('Local não encontrado');
    }

    const updatedLocal = { ...localToUpdate, ...updates, updatedAt: new Date().toISOString() };
    const errors = validateLocal(updatedLocal, locals);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    setLocals(prev => prev.map(local => 
      local.id === id ? updatedLocal : local
    ));

    return updatedLocal;
  }, [locals]);

  // Remover local
  const deleteLocal = useCallback((id: string) => {
    setLocals(prevLocals => prevLocals.filter(local => local.id !== id));
  }, []);

  // Obter local por ID
  const getLocalById = useCallback((id: string) => {
    return locals.find(local => local.id === id);
  }, [locals]);

  // Importar locais
  const importLocals = useCallback((newLocals: Local[], replaceAll = false) => {
    if (replaceAll) {
      setLocals(newLocals);
    } else {
      setLocals(prev => [...newLocals, ...prev]);
    }
  }, []);

  // Limpar todos os locais
  const clearAllLocals = useCallback(() => {
    setLocals([]);
  }, []);

  // Estatísticas
  const stats = getLocalsStats(locals);

  return {
    locals,
    loading,
    addLocal,
    updateLocal,
    deleteLocal,
    importLocals,
  };
}
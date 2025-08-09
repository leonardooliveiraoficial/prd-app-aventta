import { useState } from 'react';
import { ChakraProvider, useDisclosure, Box } from '@chakra-ui/react';
import { HamburgerButton } from './components/HamburgerButton';
import { AppDrawer } from './components/AppDrawer';
import { MapView } from './components/MapView';
import { useLocations } from './hooks/useLocations';
import { usePreferences } from './hooks/usePreferences';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useMapInteractions } from './hooks/useMapInteractions';
import theme from './theme';
import { Local } from './types';
import { getLocalsStats } from './utils';

function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const {
    locals,
    addLocal,
    updateLocal,
    deleteLocal,
    importLocals,
  } = useLocations();

  const {
    preferences,
    updatePreferences,
    isLoading: preferencesLoading,
  } = usePreferences();

  const {
    pendingCoordinates,
    setPendingCoordinates,
    clearPendingCoordinates,
  } = useMapInteractions();

  // Calcular estatísticas
  const stats = getLocalsStats(locals);

  // Atalhos de teclado globais
  useKeyboardShortcuts({
    onToggleMenu: () => {
      if (isOpen) {
        onClose();
      } else {
        onOpen();
      }
    },
  });

  // Handlers para o mapa
  const handleRightClick = (lat: number, lng: number) => {
    if (preferences.rightClickSuggestion) {
      setPendingCoordinates({ lat, lng });
      onOpen(); // Abrir drawer para adicionar local
    }
  };

  const handleLocationClick = (lat: number, lng: number) => {
    setFocusLocation({ lat, lng });
  };

  const handleAddLocation = (localData: Omit<Local, 'id' | 'createdAt'>) => {
    addLocal(localData);
    clearPendingCoordinates();
  };

  const handleEditLocation = (id: string, updates: Partial<Local>) => {
    updateLocal(id, updates);
  };

  const handleDeleteLocation = (id: string) => {
    deleteLocal(id);
  };

  const handleImportLocals = (importedLocals: Local[], replaceAll = false) => {
    importLocals(importedLocals, replaceAll);
  };

  // Aguardar carregamento das preferências
  if (preferencesLoading) {
    return (
      <ChakraProvider theme={theme}>
        <Box w="100vw" h="100vh" bg="brand.bg" />
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Box position="relative" w="100vw" h="100vh" bg="brand.bg">
        {/* Botão hambúrguer */}
        <HamburgerButton onClick={onOpen} />

        {/* Mapa */}
        <MapView
          locals={locals}
          onRightClick={handleRightClick}
          onEditLocation={() => {
            // Implementar edição via popup do mapa se necessário
          }}
          onDeleteLocation={handleDeleteLocation}
          focusLocation={focusLocation}
          clustering={preferences.clustering}
          rightClickSuggestion={preferences.rightClickSuggestion}
        />

        {/* Drawer principal */}
        <AppDrawer
          isOpen={isOpen}
          onClose={onClose}
          locals={locals}
          stats={stats}
          onLocationClick={handleLocationClick}
          onAddLocation={handleAddLocation}
          onEditLocation={handleEditLocation}
          onDeleteLocation={handleDeleteLocation}
          onImportLocals={handleImportLocals}
          suggestedCoordinates={pendingCoordinates}
          preferences={preferences}
          onUpdatePreferences={updatePreferences}
        />
      </Box>
    </ChakraProvider>
  );
}

export default App;

import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Divider,
  Box,
  useDisclosure,
  Switch,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import {
  Search,
  Plus,
  MapPin,
  Download,
  Upload,

  Moon,
  Sun,
  Globe,
  Layers,
} from 'lucide-react';
import { useState, useRef, useMemo } from 'react';
import { Local, AppPreferences } from '../types';
import { TopStats } from './TopStats';
import { LocationsList } from './LocationsList';
import { AddLocationModal } from './AddLocationModal';
import { filterLocals, debounce, exportLocalsToJSON, validateImportData, mergeLocals } from '../utils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locals: Local[];
  stats: { cidades: number; estados: number; paises: number };
  onLocationClick: (lat: number, lng: number) => void;
  onAddLocation: (local: Omit<Local, 'id' | 'createdAt'>) => void;
  onEditLocation: (id: string, updates: Partial<Local>) => void;
  onDeleteLocation: (id: string) => void;
  onImportLocals: (locals: Local[], replaceAll?: boolean) => void;
  suggestedCoordinates?: { lat: number; lng: number } | null;
  preferences: AppPreferences;
  onUpdatePreferences: (preferences: Partial<AppPreferences>) => void;
}

export function AppDrawer({
  isOpen,
  onClose,
  locals,
  stats,
  onLocationClick,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
  onImportLocals,
  suggestedCoordinates,
  preferences,
  onUpdatePreferences,
}: AppDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [editingLocal, setEditingLocal] = useState<Local | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const {
    isOpen: isAddModalOpen,
    onOpen: onOpenAddModal,
    onClose: onCloseAddModal,
  } = useDisclosure();

  // Filtrar locais baseado no termo de busca
  const filteredLocals = useMemo(() => {
    if (!searchTerm.trim()) {
      return locals;
    }
    
    return locals.filter(local => 
      local.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      local.pais.toLowerCase().includes(searchTerm.toLowerCase()) ||
      local.estado?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [locals, searchTerm]);

  // Debounced search
  const debouncedSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  const handleSearchChange = (value: string) => {
    debouncedSearch(value);
  };

  const handleAddLocation = () => {
    setEditingLocal(null);
    onOpenAddModal();
  };

  const handleEditLocation = (local: Local) => {
    setEditingLocal(local);
    onOpenAddModal();
  };

  const handleSaveLocation = (localData: Omit<Local, 'id' | 'createdAt'>) => {
    if (editingLocal) {
      onEditLocation(editingLocal.id, localData);
    } else {
      onAddLocation(localData);
    }
    setEditingLocal(null);
  };

  const handleExport = () => {
    try {
      const jsonData = exportLocalsToJSON(locals);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mapa-rotas-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Dados exportados',
        description: 'Arquivo JSON baixado com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Função de debug temporária
  const handleDebugLocalStorage = () => {
    const stored = localStorage.getItem('mapa-rotas-locais');
    console.log('LocalStorage data:', stored);
    
    toast({
      title: 'Debug LocalStorage',
      description: stored ? `Dados encontrados: ${JSON.parse(stored).length} locais` : 'Nenhum dado encontrado',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  // Função para limpar completamente os dados
  const handleClearAllData = () => {
    if (window.confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os seus locais salvos. Esta ação não pode ser desfeita. Tem certeza?')) {
      localStorage.removeItem('mapa-rotas-locais');
      localStorage.removeItem('mapa-rotas-preferences');
      window.location.reload();
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const validation = validateImportData(content);

        if (!validation.isValid) {
          toast({
            title: 'Erro na importação',
            description: validation.error,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        if (validation.locals) {
          const { merged, duplicates } = mergeLocals(locals, validation.locals);
          onImportLocals(merged, false);

          toast({
            title: 'Dados importados',
            description: `${validation.locals.length - duplicates.length} locais importados. ${duplicates.length} duplicatas ignoradas.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch {
        toast({
          title: 'Erro na importação',
          description: 'Arquivo inválido ou corrompido.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    reader.readAsText(file);
    
    // Limpar input
    event.target.value = '';
  };

  // Atalhos de teclado
  useKeyboardShortcuts({
    onFocusSearch: () => searchInputRef.current?.focus(),
    onOpenAddLocation: handleAddLocation,
  });

  return (
    <>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="md">
        <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <DrawerContent maxW="420px">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor="brand.border">
            <Text fontSize="xl" fontWeight="700">
              Menu de Navegação
            </Text>
          </DrawerHeader>

          <DrawerBody p={0}>
            <Tabs index={activeTab} onChange={setActiveTab} variant="soft-rounded" colorScheme="cyan">
              <TabList p={4} bg="brand.surface">
                <Tab fontSize="sm">Início</Tab>
                <Tab fontSize="sm">Locais</Tab>
                <Tab fontSize="sm">Importar</Tab>
                <Tab fontSize="sm">Config</Tab>
                <Tab fontSize="sm">Ajuda</Tab>
              </TabList>

              <TabPanels>
                {/* Aba Início */}
                <TabPanel p={4}>
                  <VStack spacing={6} align="stretch">
                    <TopStats {...stats} />

                    <Button
                      variant="gradient"
                      size="lg"
                      leftIcon={<Plus size={20} />}
                      onClick={handleAddLocation}
                      w="full"
                    >
                      Adicionar Local
                    </Button>

                    <Divider borderColor="brand.border" />

                    <Box>
                      <Text fontSize="sm" fontWeight="600" mb={3} color="brand.text">
                        Busca Rápida
                      </Text>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Search size={16} color="#9CA3AF" />
                        </InputLeftElement>
                        <Input
                          ref={searchInputRef}
                          placeholder="Buscar cidades, estados ou países..."
                          onChange={(e) => handleSearchChange(e.target.value)}
                        />
                      </InputGroup>
                      <Text fontSize="xs" color="brand.muted" mt={2}>
                        Pressione Ctrl+K para focar aqui
                      </Text>
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Aba Locais */}
                <TabPanel p={4}>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="lg" fontWeight="600">
                        Locais Visitados
                      </Text>
                      <Text fontSize="sm" color="brand.muted">
                        {filteredLocals.length} de {locals.length}
                      </Text>
                    </HStack>

                    <LocationsList
                      locals={filteredLocals}
                      onLocationClick={onLocationClick}
                      onEditLocation={handleEditLocation}
                      onDeleteLocation={onDeleteLocation}
                      height={400}
                    />
                  </VStack>
                </TabPanel>

                {/* Aba Importar/Exportar */}
                <TabPanel p={4}>
                  <VStack spacing={6} align="stretch">
                    <Box>
                      <Text fontSize="lg" fontWeight="600" mb={4}>
                        Backup dos Dados
                      </Text>
                      
                      <VStack spacing={3}>
                        <Button
                          leftIcon={<Download size={16} />}
                          onClick={handleExport}
                          w="full"
                          variant="outline"
                        >
                          Exportar Dados (JSON)
                        </Button>

                        <Button
                          leftIcon={<Upload size={16} />}
                          onClick={() => fileInputRef.current?.click()}
                          w="full"
                          variant="outline"
                        >
                          Importar Dados
                        </Button>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                          style={{ display: 'none' }}
                        />
                      </VStack>
                    </Box>

                    <Box
                      p={4}
                      bg="brand.surfaceHover"
                      borderRadius="8px"
                      border="1px solid"
                      borderColor="brand.border"
                    >
                      <Text fontSize="sm" color="brand.muted" lineHeight="1.4">
                        <strong>Importante:</strong> O backup inclui todos os seus locais
                        visitados. Ao importar, locais duplicados serão automaticamente
                        ignorados.
                      </Text>
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Aba Configurações */}
                <TabPanel p={4}>
                  <VStack spacing={6} align="stretch">
                    <Text fontSize="lg" fontWeight="600">
                      Preferências
                    </Text>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="theme-switch" mb="0" flex={1}>
                        <HStack>
                          {preferences.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                          <Text>Tema Escuro</Text>
                        </HStack>
                      </FormLabel>
                      <Switch
                        id="theme-switch"
                        isChecked={preferences.theme === 'dark'}
                        onChange={(e) => onUpdatePreferences({ theme: e.target.checked ? 'dark' : 'light' })}
                        colorScheme="cyan"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="clustering-switch" mb="0" flex={1}>
                        <HStack>
                          <Layers size={16} />
                          <Text>Agrupar Marcadores</Text>
                        </HStack>
                      </FormLabel>
                      <Switch
                        id="clustering-switch"
                        isChecked={preferences.clustering}
                        onChange={(e) => onUpdatePreferences({ clustering: e.target.checked })}
                        colorScheme="cyan"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="rightclick-switch" mb="0" flex={1}>
                        <HStack>
                          <MapPin size={16} />
                          <Text>Clique direito para coordenadas</Text>
                        </HStack>
                      </FormLabel>
                      <Switch
                        id="rightclick-switch"
                        isChecked={preferences.rightClickSuggestion}
                        onChange={(e) => onUpdatePreferences({ rightClickSuggestion: e.target.checked })}
                        colorScheme="cyan"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>
                        <HStack>
                          <Globe size={16} />
                          <Text>Idioma</Text>
                        </HStack>
                      </FormLabel>
                      <Select
                        value={preferences.language}
                        onChange={(e) => onUpdatePreferences({ language: e.target.value as 'pt-BR' | 'en-US' })}
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                      </Select>
                    </FormControl>

                    <Divider borderColor="brand.border" />

                    <Box>
                      <Text fontSize="md" fontWeight="600" mb={3}>
                        Debug
                      </Text>
                      <VStack spacing={2}>
                        <Button
                          onClick={handleDebugLocalStorage}
                          size="sm"
                          variant="outline"
                          colorScheme="orange"
                          w="full"
                        >
                          Verificar LocalStorage
                        </Button>
                        <Button
                          onClick={handleClearAllData}
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          w="full"
                        >
                          🗑️ Limpar Todos os Dados
                        </Button>
                      </VStack>
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Aba Ajuda */}
                <TabPanel p={4}>
                  <VStack spacing={6} align="stretch">
                    <Text fontSize="lg" fontWeight="600">
                      Ajuda & Atalhos
                    </Text>

                    <Box>
                      <Text fontSize="md" fontWeight="600" mb={3}>
                        Atalhos de Teclado
                      </Text>
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm">Abrir/fechar menu</Text>
                          <Text fontSize="sm" color="brand.muted" fontFamily="mono">M</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Adicionar local</Text>
                          <Text fontSize="sm" color="brand.muted" fontFamily="mono">A</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Focar busca</Text>
                          <Text fontSize="sm" color="brand.muted" fontFamily="mono">Ctrl+K</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Salvar formulário</Text>
                          <Text fontSize="sm" color="brand.muted" fontFamily="mono">Ctrl+S</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Fechar modal</Text>
                          <Text fontSize="sm" color="brand.muted" fontFamily="mono">Esc</Text>
                        </HStack>
                      </VStack>
                    </Box>

                    <Divider borderColor="brand.border" />

                    <Box>
                      <Text fontSize="md" fontWeight="600" mb={3}>
                        Sobre o App
                      </Text>
                      <VStack spacing={2} align="start">
                        <Text fontSize="sm" color="brand.muted">
                          Versão: 2.0.0
                        </Text>
                        <Text fontSize="sm" color="brand.muted">
                          Mapas: © OpenStreetMap contributors
                        </Text>
                        <Text fontSize="sm" color="brand.muted">
                          Desenvolvido com React + TypeScript + Chakra UI
                        </Text>
                      </VStack>
                    </Box>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <AddLocationModal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        onSave={handleSaveLocation}
        editingLocal={editingLocal}
        suggestedCoordinates={suggestedCoordinates}
        existingLocals={locals}
      />
    </>
  );
}
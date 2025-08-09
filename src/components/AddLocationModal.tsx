import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Select,
  VStack,
  HStack,
  Text,
  Alert,
  useToast,
  Tooltip,
  Box,
  Badge,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToken,

} from '@chakra-ui/react';
import { MapPin, Save, X, Search, Zap, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Local, COUNTRIES } from '../types';
import { validateLocal, validateCoordinates } from '../utils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import PlaceSearchInput from './PlaceSearchInput';
import { type GeocodingResult } from '../services/geocoding';

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (local: Omit<Local, 'id' | 'createdAt'>) => void;
  editingLocal?: Local | null;
  suggestedCoordinates?: { lat: number; lng: number } | null;
  existingLocals: Local[];
}

export function AddLocationModal({
  isOpen,
  onClose,
  onSave,
  editingLocal,
  suggestedCoordinates,
  existingLocals,
}: AddLocationModalProps) {
  const [formData, setFormData] = useState({
    cidade: '',
    estado: '',
    pais: '',
    lat: '',
    lng: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useSmartSearch, setUseSmartSearch] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const toast = useToast();
  const [accentColor, errorColor] = useToken('colors', ['brand.accent.from', 'red.500']);

  // Preencher formulário quando modal abrir
  useEffect(() => {
    if (isOpen) {
      if (editingLocal) {
        // Modo edição
        setFormData({
          cidade: editingLocal.cidade,
          estado: editingLocal.estado || '',
          pais: editingLocal.pais,
          lat: editingLocal.lat.toString(),
          lng: editingLocal.lng.toString(),
        });
      } else if (suggestedCoordinates) {
        // Coordenadas sugeridas do clique direito
        setFormData({
          cidade: '',
          estado: '',
          pais: 'BR', // Padrão Brasil
          lat: suggestedCoordinates.lat.toFixed(6),
          lng: suggestedCoordinates.lng.toFixed(6),
        });
      } else {
        // Formulário limpo
        setFormData({
          cidade: '',
          estado: '',
          pais: 'BR',
          lat: '',
          lng: '',
        });
      }
      setErrors([]);
    }
  }, [isOpen, editingLocal, suggestedCoordinates]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erros quando usuário começar a digitar
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handlePlaceSelect = (place: GeocodingResult) => {
    // Determinar o nome da cidade baseado nos dados disponíveis
    const cidadeNome = place.city || place.name;

    // Preencher automaticamente os campos com os dados do lugar selecionado
    setFormData(prev => ({
      ...prev,
      cidade: cidadeNome,
      estado: place.state || '',
      pais: place.country === 'Brasil' ? 'BR' :
            place.country === 'United States' ? 'US' :
            place.country === 'Argentina' ? 'AR' :
            place.country === 'Chile' ? 'CL' :
            place.country === 'Uruguay' ? 'UY' :
            place.country === 'Paraguay' ? 'PY' :
            place.country === 'Bolivia' ? 'BO' :
            place.country === 'Peru' ? 'PE' :
            place.country === 'Colombia' ? 'CO' :
            place.country === 'Venezuela' ? 'VE' :
            place.country === 'Ecuador' ? 'EC' :
            place.country === 'Guyana' ? 'GY' :
            place.country === 'Suriname' ? 'SR' :
            place.country === 'French Guiana' ? 'GF' :
            'BR', // Padrão Brasil se não encontrar
      lat: place.latitude.toFixed(6),
      lng: place.longitude.toFixed(6),
    }));

    setSearchValue('');
    setErrors([]);

    toast({
      title: 'Local encontrado!',
      description: `${place.name} foi preenchido automaticamente`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors([]);

    try {
      // Validar dados
      const lat = parseFloat(formData.lat);
      const lng = parseFloat(formData.lng);

      if (isNaN(lat) || isNaN(lng)) {
        setErrors(['Coordenadas devem ser números válidos']);
        return;
      }

      const localData = {
        cidade: formData.cidade.trim(),
        estado: formData.estado.trim() || undefined,
        pais: formData.pais,
        lat,
        lng,
        ...(editingLocal && { id: editingLocal.id }),
      };

      const validationErrors = validateLocal(localData, existingLocals);
      if (validationErrors.length > 0) {
        setErrors(validationErrors.map(e => e.message));
        return;
      }

      // Salvar
      onSave(localData);
      
      toast({
        title: editingLocal ? 'Local atualizado' : 'Local adicionado',
        description: `${localData.cidade} foi ${editingLocal ? 'atualizado' : 'adicionado'} com sucesso!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setErrors([message]);
      
      toast({
        title: 'Erro ao salvar',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atalhos de teclado
  useKeyboardShortcuts({
    onSave: handleSubmit,
    onCloseModal: onClose,
  });

  const coordinateErrors = validateCoordinates(
    parseFloat(formData.lat) || 0,
    parseFloat(formData.lng) || 0
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <MapPin size={24} color={accentColor} />
            <Text>
              {editingLocal ? 'Editar Local' : 'Adicionar Novo Local'}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4}>
            {errors.length > 0 && (
              <Alert status="error" borderRadius="8px">
              <AlertTriangle size={16} color={errorColor} style={{ marginRight: 8, flexShrink: 0 }} />
                <VStack align="start" spacing={1}>
                  {errors.map((error, index) => (
                    <Text key={index} fontSize="sm">
                      {error}
                    </Text>
                  ))}
                </VStack>
              </Alert>
            )}

            {/* Busca Inteligente */}
            {useSmartSearch && !editingLocal && (
              <Box w="full">
                <Flex justify="space-between" align="center" mb={3}>
                  <HStack>
                    <Search size={16} color={accentColor} />
                    <Text fontSize="md" fontWeight="semibold" color="brand.text">
                      Busca Inteligente
                    </Text>
                    <Badge colorScheme="green" variant="subtle" fontSize="xs">
                      <Zap size={10} style={{ marginRight: 4 }} />
                      Novo
                    </Badge>
                  </HStack>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setUseSmartSearch(false)}
                    color="brand.muted"
                  >
                    Usar formulário manual
                  </Button>
                </Flex>

                <PlaceSearchInput
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Digite o nome da cidade, estado ou país..."
                  value={searchValue}
                  onChange={setSearchValue}
                />

                <Text fontSize="xs" color="brand.muted" mt={2} lineHeight="1.4">
                  💡 Digite o nome do lugar e selecione da lista. As coordenadas serão preenchidas automaticamente!
                </Text>

                <Box 
                  height="1px" 
                  bg="brand.border" 
                  my={4} 
                  width="100%" 
                />

                <Flex justify="center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setUseSmartSearch(false)}
                    leftIcon={<MapPin size={14} />}
                    color="brand.muted"
                  >
                    Ou preencher manualmente
                  </Button>
                </Flex>
              </Box>
            )}

            {/* Formulário Manual */}
            {(!useSmartSearch || editingLocal) && (
              <>
                {!editingLocal && (
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="md" fontWeight="semibold" color="brand.text">
                      Preenchimento Manual
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setUseSmartSearch(true)}
                      leftIcon={<Search size={12} />}
                      color="brand.accent.from"
                    >
                      Usar busca inteligente
                    </Button>
                  </Flex>
                )}

                <FormControl isRequired>
                  <FormLabel>Nome da cidade</FormLabel>
                  <Input
                    placeholder="Ex: Belo Horizonte"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    autoFocus={!useSmartSearch}
                    bg="brand.surface"
                    border="1px solid"
                    borderColor="brand.border"
                    _hover={{ borderColor: 'brand.primary' }}
                    _focus={{
                      borderColor: 'brand.primary',
                      boxShadow: '0 0 0 1px var(--chakra-colors-brand-primary)',
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Estado</FormLabel>
                  <Input
                    placeholder="Ex: Minas Gerais ou MG"
                    value={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    bg="brand.surface"
                    border="1px solid"
                    borderColor="brand.border"
                    _hover={{ borderColor: 'brand.primary' }}
                    _focus={{
                      borderColor: 'brand.primary',
                      boxShadow: '0 0 0 1px var(--chakra-colors-brand-primary)',
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>País</FormLabel>
                  <Select
                    value={formData.pais}
                    onChange={(e) => handleInputChange('pais', e.target.value)}
                    bg="brand.surface"
                    border="1px solid"
                    borderColor="brand.border"
                    _hover={{ borderColor: 'brand.primary' }}
                    _focus={{
                      borderColor: 'brand.primary',
                      boxShadow: '0 0 0 1px var(--chakra-colors-brand-primary)',
                    }}
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <HStack spacing={4} w="full">
                  <FormControl
                    isRequired
                    isInvalid={coordinateErrors.some(e => e.field === 'lat')}
                    flex={1}
                  >
                    <FormLabel>
                      <Tooltip label="Latitude deve estar entre -90 e 90 graus">
                        Latitude *
                      </Tooltip>
                    </FormLabel>
                    <Input
                      type="number"
                      step="any"
                      placeholder="-19.9167"
                      value={formData.lat}
                      onChange={(e) => handleInputChange('lat', e.target.value)}
                      bg="brand.surface"
                      border="1px solid"
                      borderColor={coordinateErrors.some(e => e.field === 'lat') ? 'red.500' : 'brand.border'}
                      _hover={{ borderColor: 'brand.primary' }}
                      _focus={{
                        borderColor: 'brand.primary',
                        boxShadow: '0 0 0 1px var(--chakra-colors-brand-primary)',
                      }}
                    />
                    <FormErrorMessage fontSize="xs">
                      {coordinateErrors.find(e => e.field === 'lat')?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isRequired
                    isInvalid={coordinateErrors.some(e => e.field === 'lng')}
                    flex={1}
                  >
                    <FormLabel>
                      <Tooltip label="Longitude deve estar entre -180 e 180 graus">
                        Longitude *
                      </Tooltip>
                    </FormLabel>
                    <Input
                      type="number"
                      step="any"
                      placeholder="-43.9345"
                      value={formData.lng}
                      onChange={(e) => handleInputChange('lng', e.target.value)}
                      bg="brand.surface"
                      border="1px solid"
                      borderColor={coordinateErrors.some(e => e.field === 'lng') ? 'red.500' : 'brand.border'}
                      _hover={{ borderColor: 'brand.primary' }}
                      _focus={{
                        borderColor: 'brand.primary',
                        boxShadow: '0 0 0 1px var(--chakra-colors-brand-primary)',
                      }}
                    />
                    <FormErrorMessage fontSize="xs">
                      {coordinateErrors.find(e => e.field === 'lng')?.message}
                    </FormErrorMessage>
                  </FormControl>
                </HStack>

                <Box
                  p={3}
                  bg="brand.surfaceHover"
                  borderRadius="8px"
                  border="1px solid"
                  borderColor="brand.border"
                  w="full"
                >
                  <Text fontSize="sm" color="brand.muted" lineHeight="1.4">
                    💡 <strong>Dica:</strong> Use a busca inteligente acima para encontrar lugares automaticamente,
                    ou clique com o botão direito no mapa para sugerir coordenadas.
                  </Text>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="ghost"
              onClick={onClose}
              leftIcon={<X size={16} />}
            >
              Cancelar
            </Button>
            <Button
              variant="gradient"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Salvando..."
              leftIcon={<Save size={16} />}
              isDisabled={!formData.cidade || !formData.pais || !formData.lat || !formData.lng}
            >
              {editingLocal ? 'Atualizar' : 'Adicionar'} Local
            </Button>
          </HStack>
          
          <Text fontSize="xs" color="brand.muted" mt={2}>
            Pressione Ctrl+S para salvar rapidamente
          </Text>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
import {
  VStack,
  HStack,
  Text,
  IconButton,
  Badge,
  Box,
} from '@chakra-ui/react';
import { Edit, Trash2, MapPin } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import { Local } from '../types';
import { getCountryFlag, formatDate } from '../utils';

interface LocationsListProps {
  locals: Local[];
  onLocationClick: (lat: number, lng: number) => void;
  onEditLocation: (local: Local) => void;
  onDeleteLocation: (id: string) => void;
  height?: number;
}

interface LocationItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    locals: Local[];
    onLocationClick: (lat: number, lng: number) => void;
    onEditLocation: (local: Local) => void;
    onDeleteLocation: (id: string) => void;
  };
}

function LocationItem({ index, style, data }: LocationItemProps) {
  const { locals, onLocationClick, onEditLocation, onDeleteLocation } = data;
  const local = locals[index];

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja remover ${local.cidade}?`)) {
      onDeleteLocation(local.id);
    }
  };

  return (
    <Box style={style} px={4}>
      <HStack
        p={3}
        borderRadius="8px"
        bg="brand.surfaceHover"
        border="1px solid"
        borderColor="brand.border"
        spacing={3}
        _hover={{
          bg: 'brand.surface',
          borderColor: 'brand.accent.from',
        }}
        transition="all 0.2s ease-out"
        cursor="pointer"
        onClick={() => onLocationClick(local.lat, local.lng)}
      >
        {/* Indicador visual */}
        <Box
          w={2}
          h={2}
          bg="brand.accent.from"
          borderRadius="full"
          flexShrink={0}
        />

        {/* Informações do local */}
        <VStack align="start" spacing={1} flex={1} minW={0}>
          <HStack spacing={2} w="full">
            <Text
              fontSize="md"
              fontWeight="700"
              color="brand.text"
              noOfLines={1}
              flex={1}
            >
              {local.cidade}
            </Text>
            <Badge
              variant="outline"
              colorScheme="cyan"
              fontSize="xs"
              borderRadius="6px"
            >
              {local.pais}
            </Badge>
          </HStack>
          
          <HStack spacing={2} w="full">
            {local.estado && (
              <Text fontSize="sm" color="brand.muted" noOfLines={1}>
                {local.estado}
              </Text>
            )}
            <Text fontSize="xs" color="brand.muted" ml="auto">
              {formatDate(local.createdAt)}
            </Text>
          </HStack>
        </VStack>

        {/* Bandeira do país */}
        <Text fontSize="lg" flexShrink={0}>
          {getCountryFlag(local.pais)}
        </Text>

        {/* Botões de ação */}
        <HStack spacing={2}>
          <IconButton
            aria-label="Ver no mapa"
            icon={<MapPin size={16} />}
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onLocationClick(local.lat, local.lng);
            }}
          />
          
          <IconButton
            aria-label="Editar"
            icon={<Edit size={16} />}
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEditLocation(local);
            }}
          />
          
          <IconButton
             aria-label="Remover"
             icon={<Trash2 size={16} />}
             size="sm"
             variant="ghost"
             color="red.400"
             onClick={(e) => {
               e.stopPropagation();
               handleDelete();
             }}
           />
        </HStack>
      </HStack>


    </Box>
  );
}

export function LocationsList({
  locals,
  onLocationClick,
  onEditLocation,
  onDeleteLocation,
  height = 400,
}: LocationsListProps) {
  
  if (locals.length === 0) {
    return (
      <VStack spacing={4} py={8} color="brand.muted">
        <Text fontSize="4xl">🗺️</Text>
        <Text fontSize="lg" fontWeight="600" textAlign="center">
          Nenhum local cadastrado
        </Text>
        <Text fontSize="sm" textAlign="center" maxW="250px">
          Comece adicionando o primeiro local que você visitou!
        </Text>
      </VStack>
    );
  }

  const itemData = {
    locals,
    onLocationClick,
    onEditLocation,
    onDeleteLocation,
  };

  return (
    <Box>
      <List
        height={height}
        itemCount={locals.length}
        itemSize={80}
        itemData={itemData}
        style={{ scrollbarWidth: 'thin' }}
      >
        {LocationItem}
      </List>
    </Box>
  );
}
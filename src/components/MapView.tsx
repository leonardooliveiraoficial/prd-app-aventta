import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Portal,
  Button,
  HStack,
  Text,
  ChakraProvider,
  useToken,
} from '@chakra-ui/react';
import { MapPin, X, Check } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { Local } from '../types';
import { getCountryFlag } from '../utils';
import theme from '../theme';

// Fix para ícones do Leaflet
delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  locals: Local[];
  onRightClick?: (lat: number, lng: number) => void;
  onEditLocation?: (local: Local) => void;
  onDeleteLocation?: (id: string) => void;
  focusLocation?: { lat: number; lng: number } | null;
  clustering?: boolean;
  rightClickSuggestion?: boolean;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  lat: number;
  lng: number;
}

export function MapView({
  locals,
  onRightClick,
  onEditLocation,
  onDeleteLocation,
  focusLocation,
  clustering = true,
  rightClickSuggestion = true,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.MarkerClusterGroup | L.LayerGroup | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    lat: 0,
    lng: 0,
  });
  const [accentColor] = useToken('colors', ['brand.accent.from']);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-19.9167, -43.9345], // Belo Horizonte como centro padrão
      zoom: 6,
      zoomControl: true,
    });

    // Adicionar tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Configurar clique direito
    if (rightClickSuggestion) {
      map.on('contextmenu', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const containerPoint = map.latLngToContainerPoint(e.latlng);
        
        setTooltip({
          visible: true,
          x: containerPoint.x,
          y: containerPoint.y,
          lat,
          lng,
        });
      });

      // Fechar tooltip ao clicar no mapa
      map.on('click', () => {
        setTooltip(prev => ({ ...prev, visible: false }));
      });
    }

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [rightClickSuggestion]);

  // Atualizar marcadores
  useEffect(() => {
    if (!mapRef.current) return;

    // Remover marcadores existentes
    if (markersRef.current) {
      mapRef.current.removeLayer(markersRef.current);
    }

    // Criar novo grupo de marcadores
    const markerGroup = clustering
      ? L.markerClusterGroup({
          chunkedLoading: true,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          maxClusterRadius: 50,
        })
      : L.layerGroup();

    // Adicionar marcadores
    locals.forEach((local) => {
      const marker = L.marker([local.lat, local.lng]);
      const flag = getCountryFlag(local.pais);

      const popupNode = document.createElement('div');
      const root = createRoot(popupNode);

      const PopupContent = () => (
        <Box minW="200px">
          <HStack mb={2} spacing={2} align="center">
            <Text fontSize="lg">{flag}</Text>
            <Text fontSize="md" fontWeight="semibold" color="brand.text">
              {local.cidade}
            </Text>
          </HStack>
          <Text color="brand.muted" fontSize="sm" mb={3}>
            {local.estado ? `${local.estado}, ` : ''}{local.pais}
          </Text>
          <HStack spacing={2}>
            <Button size="xs" variant="gradient" onClick={() => onEditLocation?.(local)}>
              Editar
            </Button>
            <Button
              size="xs"
              colorScheme="red"
              onClick={() => onDeleteLocation?.(local.id)}
            >
              Remover
            </Button>
          </HStack>
        </Box>
      );

      root.render(
        <ChakraProvider theme={theme}>
          <PopupContent />
        </ChakraProvider>
      );

      marker.bindPopup(popupNode, {
        maxWidth: 300,
        className: 'custom-popup',
      });

      marker.on('popupclose', () => root.unmount());
      markerGroup.addLayer(marker);
    });

    // Adicionar ao mapa
    mapRef.current.addLayer(markerGroup);
    markersRef.current = markerGroup;

    // Ajustar visualização se houver marcadores
    if (locals.length > 0) {
      const group = new L.FeatureGroup(
        locals.map(local => L.marker([local.lat, local.lng]))
      );
      mapRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
    }
  }, [locals, clustering]);

  // Focar em localização específica
  useEffect(() => {
    if (!mapRef.current || !focusLocation) return;

    mapRef.current.setView([focusLocation.lat, focusLocation.lng], 12, {
      animate: true,
      duration: 1,
    });
  }, [focusLocation]);

  // Configurar callbacks globais para popups
  useEffect(() => {
    (window as Record<string, unknown>).editLocation = (id: string) => {
      const local = locals.find(l => l.id === id);
      if (local && onEditLocation) {
        onEditLocation(local);
      }
    };

    (window as Record<string, unknown>).deleteLocation = (id: string) => {
      if (onDeleteLocation) {
        onDeleteLocation(id);
      }
    };

    return () => {
      delete (window as Record<string, unknown>).editLocation;
      delete (window as Record<string, unknown>).deleteLocation;
    };
  }, [locals, onEditLocation, onDeleteLocation]);

  const handleConfirmCoordinates = () => {
    if (onRightClick) {
      onRightClick(tooltip.lat, tooltip.lng);
    }
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const handleCancelCoordinates = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <>
      <Box
        ref={mapContainerRef}
        w="100%"
        h="100vh"
        position="relative"
        sx={{
          '.leaflet-popup-content-wrapper': {
            background: 'brand.surface',
            color: 'brand.text',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'brand.border',
          },
          '.leaflet-popup-tip': {
            background: 'brand.surface',
            borderColor: 'brand.border',
          },
          '.leaflet-container': {
            background: 'brand.bg',
          },
          '.marker-cluster-small, .marker-cluster-medium, .marker-cluster-large': {
            background:
              'linear-gradient(135deg, var(--chakra-colors-brand-accent-from), var(--chakra-colors-brand-accent-to))',
            border: '2px solid',
            borderColor: 'brand.surface',
          },
          '.marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div': {
            background:
              'linear-gradient(135deg, var(--chakra-colors-brand-accent-from), var(--chakra-colors-brand-accent-to))',
            color: 'white',
            fontWeight: '600',
          },
        }}
      />

      {/* Tooltip de coordenadas */}
      {tooltip.visible && (
        <Portal>
          <Box
            position="fixed"
            left={`${tooltip.x + 10}px`}
            top={`${tooltip.y - 10}px`}
            bg="brand.surface"
            border="1px solid"
            borderColor="brand.border"
            borderRadius="8px"
            p={3}
            boxShadow="lg"
            zIndex={10000}
            minW="200px"
          >
            <HStack spacing={2} mb={3}>
              <MapPin size={16} color={accentColor} />
              <Text fontSize="sm" fontWeight="600">
                Definir coordenadas aqui?
              </Text>
            </HStack>
            
            <Text fontSize="xs" color="brand.muted" mb={3}>
              Lat: {tooltip.lat.toFixed(6)}, Lng: {tooltip.lng.toFixed(6)}
            </Text>

            <HStack spacing={2}>
              <Button
                size="sm"
                variant="gradient"
                leftIcon={<Check size={14} />}
                onClick={handleConfirmCoordinates}
                flex={1}
              >
                Sim
              </Button>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<X size={14} />}
                onClick={handleCancelCoordinates}
                flex={1}
              >
                Cancelar
              </Button>
            </HStack>
          </Box>
        </Portal>
      )}
    </>
  );
}
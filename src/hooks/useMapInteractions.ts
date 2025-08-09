import { useState, useCallback, useRef } from 'react';
import * as L from 'leaflet';

export function useMapInteractions() {
  const [pendingCoordinates, setPendingCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [showRightClickTooltip, setShowRightClickTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapRef = useRef<L.Map | null>(null);

  // Lidar com clique direito no mapa
  const handleRightClick = useCallback((lat: number, lng: number, clientX: number, clientY: number) => {
    setPendingCoordinates({ lat, lng });
    setTooltipPosition({ x: clientX, y: clientY });
    setShowRightClickTooltip(true);
  }, []);

  // Confirmar uso das coordenadas do clique direito
  const confirmRightClickCoordinates = useCallback(() => {
    setShowRightClickTooltip(false);
    return pendingCoordinates;
  }, [pendingCoordinates]);

  // Cancelar tooltip de clique direito
  const cancelRightClick = useCallback(() => {
    setShowRightClickTooltip(false);
    setPendingCoordinates(null);
  }, []);

  // Limpar coordenadas pendentes
  const clearPendingCoordinates = useCallback(() => {
    setPendingCoordinates(null);
    setShowRightClickTooltip(false);
  }, []);

  // Obter centro atual do mapa
  const getMapCenter = useCallback(() => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      return { lat: center.lat, lng: center.lng };
    }
    return { lat: -19.9167, lng: -43.9345 }; // Fallback para BH
  }, []);

  // Focar no local específico
  const focusOnLocation = useCallback((lat: number, lng: number, zoom = 12) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], zoom);
    }
  }, []);

  // Ajustar zoom para mostrar todos os locais
  const fitBounds = useCallback((locations: Array<{ lat: number; lng: number }>) => {
    if (mapRef.current && locations.length > 0) {
      const bounds = locations.map(loc => [loc.lat, loc.lng] as [number, number]);
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, []);

  return {
    mapRef,
    pendingCoordinates,
    setPendingCoordinates,
    showRightClickTooltip,
    tooltipPosition,
    handleRightClick,
    confirmRightClickCoordinates,
    cancelRightClick,
    clearPendingCoordinates,
    getMapCenter,
    focusOnLocation,
    fitBounds,
  };
}
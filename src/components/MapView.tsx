import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useLocations, CreateLocationInput, UpdateLocationInput, Location } from '../data/locationsStore';
import { useToast } from '../hooks/useToast';
import LocationModal from '../components/LocationModal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Sidebar from './Sidebar';

// Corrige ícones padrão do Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente auxiliar para mudar centro/zoom
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Componente para capturar cliques no mapa
function MapClickHandler({ 
  onMapClick, 
  tempMarker 
}: { 
  onMapClick: (lat: number, lng: number) => void;
  tempMarker: { lat: number; lng: number } | null;
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });

  return tempMarker ? (
    <Marker 
      position={[tempMarker.lat, tempMarker.lng]}
      icon={L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        className: 'temp-marker'
      })}
    >
      <Popup>
        <div style={{ textAlign: 'center' }}>
          <strong>Novo Local</strong><br />
          <small>Clique em "Adicionar" para salvar</small>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

export default function MapView() {
  const [center, setCenter] = useState<[number, number]>([-20, -45]);
  const [zoom, setZoom] = useState(5);
  const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | undefined>(undefined);
  
  const { locations, addLocation, updateLocation, removeLocation } = useLocations();
  const { showToast } = useToast();

  // Função chamada ao clicar na cidade
  function handleCityClick(lat: number, lng: number) {
    setCenter([lat, lng]);
    setZoom(12); // Zoom mais afastado ao clicar
  }

  // Função para capturar clique no mapa
  function handleMapClick(lat: number, lng: number) {
    setTempMarker({ lat, lng });
    setEditingLocation(undefined);
    setIsModalOpen(true);
  }

  // Função para salvar nova localização
  function handleSaveLocation(locationData: CreateLocationInput | UpdateLocationInput) {
    try {
      if (editingLocation) {
        // Editando localização existente
        updateLocation(editingLocation.id, locationData);
        showToast('Local atualizado com sucesso!', 'success');
      } else {
        // Adicionando nova localização
        const newLocation: CreateLocationInput = {
          ...locationData,
          label: locationData.label ?? 'Novo Local',
          countryCode: locationData.countryCode ?? 'BR',
          lat: tempMarker?.lat ?? locationData.lat ?? 0,
          lng: tempMarker?.lng ?? locationData.lng ?? 0,
        };
        addLocation(newLocation);
        showToast('Local adicionado com sucesso!', 'success');
      }
      
      setIsModalOpen(false);
      setTempMarker(null);
      setEditingLocation(undefined);
    } catch {
      showToast('Erro ao salvar local. Tente novamente.', 'error');
    }
  }

  // Função para editar localização
  function handleEditLocation(location: Location) {
    setEditingLocation(location);
    setTempMarker(null);
    setIsModalOpen(true);
  }

  // Função para remover localização
  function handleRemoveLocation(locationId: string) {
    if (window.confirm('Tem certeza que deseja remover este local?')) {
      removeLocation(locationId);
      showToast('Local removido com sucesso!', 'success');
    }
  }

  // Função para fechar modal
  function handleCloseModal() {
    setIsModalOpen(false);
    setTempMarker(null);
    setEditingLocation(undefined);
  }

  // Limites do mundo (latitude: -85 a 85, longitude: -180 a 180)
  const bounds: L.LatLngBoundsExpression = [[-85, -180], [85, 180]];
  return (
    <div>
      <Sidebar onCityClick={handleCityClick} />
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={true}
        minZoom={3}
        maxZoom={17}
        maxBounds={bounds}
        preferCanvas={true}
        style={{
          height: '100vh',
          width: '100vw',
          zIndex: 1,
          position: 'fixed',
          left: 0,
          top: 0,
          background: '#242424'
        }}
        className="leaflet-container"
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={handleMapClick} tempMarker={tempMarker} />
        
        {locations.map((location) => (
          <Marker 
            key={location.id} 
            position={[location.lat, location.lng]}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                updateLocation(location.id, {
                  lat: position.lat,
                  lng: position.lng
                });
                showToast('Coordenadas atualizadas!', 'success');
              },
            }}
          >
            <Popup>
              <div style={{ minWidth: '200px', textAlign: 'center' }}>
                <strong style={{ fontSize: '16px', color: '#333' }}>{location.label}</strong><br />
                <div style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                  {location.city && `${location.city}, `}
                  {location.state && `${location.state}, `}
                  {location.countryCode}
                </div>
                <div style={{ margin: '8px 0', color: '#888', fontSize: '12px' }}>
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginTop: '12px',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditLocation(location);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: '1px solid #007bff',
                      background: '#007bff',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontFamily: 'Sora, Arial, sans-serif'
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveLocation(location.id);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: '1px solid #dc3545',
                      background: '#dc3545',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontFamily: 'Sora, Arial, sans-serif'
                    }}
                  >
                    🗑️ Remover
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Modal para adicionar/editar localização */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveLocation}
        onRemove={handleRemoveLocation}
        editingLocation={editingLocation}
        initialData={editingLocation || (tempMarker ? {
          lat: tempMarker.lat,
          lng: tempMarker.lng
        } : undefined)}
      />
    </div>
  );
}
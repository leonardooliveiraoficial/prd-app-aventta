import React, { useState, useEffect, useRef } from 'react';
import { CreateLocationInput, Location } from '../data/locationsStore';
import { COUNTRIES } from '../constants/countries';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: CreateLocationInput) => void;
  onRemove?: (locationId: string) => void;
  initialData?: Partial<CreateLocationInput>;
  editingLocation?: Location;
  title?: string;
  isLoading?: boolean;
}

interface FormErrors {
  label?: string;
  countryCode?: string;
  lat?: string;
  lng?: string;
  state?: string;
  city?: string;
}

interface ReverseGeocodingData {
  city?: string;
  state?: string;
  countryCode?: string;
}

export default function LocationModal({
  isOpen,
  onClose,
  onSave,
  onRemove,
  initialData,
  editingLocation,
  title,
  isLoading = false
}: LocationModalProps) {
  const [formData, setFormData] = useState<CreateLocationInput>({
    label: '',
    countryCode: 'BR',
    state: '',
    city: '',
    lat: 0,
    lng: 0
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Atualizar dados do formulário quando props mudarem
  useEffect(() => {
    if (editingLocation) {
      setFormData({
        label: editingLocation.label,
        countryCode: editingLocation.countryCode,
        state: editingLocation.state || '',
        city: editingLocation.city || '',
        lat: editingLocation.lat,
        lng: editingLocation.lng
      });
    } else if (initialData) {
      setFormData({
        label: initialData.label || '',
        countryCode: initialData.countryCode || 'BR',
        state: initialData.state || '',
        city: initialData.city || '',
        lat: initialData.lat || 0,
        lng: initialData.lng || 0
      });
    } else {
      setFormData({
        label: '',
        countryCode: 'BR',
        state: '',
        city: '',
        lat: 0,
        lng: 0
      });
    }
    setErrors({});
  }, [editingLocation, initialData, isOpen]);

  // Focus trap e ESC para fechar
  useEffect(() => {
    if (isOpen) {
      // Focus no primeiro input quando abrir
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);

      // Listener para ESC
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  // Reverse geocoding usando Nominatim
  const performReverseGeocoding = async (lat: number, lng: number): Promise<ReverseGeocodingData> => {
    try {
      setIsGeocodingLoading(true);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'MapaLugaresVisitados/1.0 (contato@exemplo.com)'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro na resposta do Nominatim');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const address = data.address || {};
      
      return {
        city: address.city || address.town || address.village || address.municipality || '',
        state: address.state || address.region || '',
        countryCode: address.country_code?.toUpperCase() || 'BR'
      };
    } catch (error) {
      console.warn('Erro no reverse geocoding:', error);
      return {}; // Fallback silencioso
    } finally {
      setIsGeocodingLoading(false);
    }
  };

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Nome do local agora é opcional
    // if (!formData.label.trim()) {
    //   newErrors.label = 'Nome do local é obrigatório';
    // }

    if (!formData.countryCode.trim()) {
      newErrors.countryCode = 'Código do país é obrigatório';
    } else if (formData.countryCode.length !== 2) {
      newErrors.countryCode = 'Código do país deve ter 2 letras';
    }

    if (!formData.state?.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }

    if (!formData.city?.trim()) {
      newErrors.city = 'Cidade é obrigatório';
    }

    if (formData.lat === 0 || formData.lat === null || formData.lat === undefined) {
      newErrors.lat = 'Latitude é obrigatória';
    } else if (formData.lat < -90 || formData.lat > 90) {
      newErrors.lat = 'Latitude deve estar entre -90 e 90';
    }

    if (formData.lng === 0 || formData.lng === null || formData.lng === undefined) {
      newErrors.lng = 'Longitude é obrigatória';
    } else if (formData.lng < -180 || formData.lng > 180) {
      newErrors.lng = 'Longitude deve estar entre -180 e 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler para mudanças nos inputs
  const handleInputChange = (field: keyof CreateLocationInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handler para mudanças em lat/lng com reverse geocoding
  const handleCoordinateChange = async (field: 'lat' | 'lng', value: number) => {
    handleInputChange(field, value);
    
    // Se ambas as coordenadas estão válidas, fazer reverse geocoding
    const newLat = field === 'lat' ? value : formData.lat;
    const newLng = field === 'lng' ? value : formData.lng;
    
    if (newLat >= -90 && newLat <= 90 && newLng >= -180 && newLng <= 180) {
      const geoData = await performReverseGeocoding(newLat, newLng);
      
      if (geoData.city || geoData.state || geoData.countryCode) {
        setFormData(prev => ({
          ...prev,
          city: geoData.city || prev.city,
          state: geoData.state || prev.state,
          countryCode: geoData.countryCode || prev.countryCode
        }));
      }
    }
  };

  // Handler para submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  // Handler para clique no overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: window.innerWidth < 480 ? '12px' : '20px'
      }}
    >
      <div 
        ref={modalRef}
        className="modal-content"
        style={{
          background: 'rgba(22, 22, 28, 0.98)',
          borderRadius: window.innerWidth < 480 ? '16px' : '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          color: '#fff',
          padding: window.innerWidth < 480 ? '20px' : window.innerWidth < 768 ? '24px' : '32px',
          width: '100%',
          maxWidth: window.innerWidth < 480 ? '95vw' : '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          fontFamily: 'Sora, Arial, sans-serif',
          border: '1.5px solid rgba(80, 80, 120, 0.18)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: window.innerWidth < 480 ? '16px' : '24px',
          flexWrap: window.innerWidth < 480 ? 'wrap' : 'nowrap',
          gap: window.innerWidth < 480 ? '8px' : '0'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: window.innerWidth < 480 ? '18px' : window.innerWidth < 768 ? '20px' : '24px', 
            fontWeight: 700,
            color: '#fff',
            flex: window.innerWidth < 480 ? '1' : 'none'
          }}>
            {title || (editingLocation ? 'Editar Local' : 'Adicionar Local')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(120, 20, 40, 0.68)',
              border: '1.5px solid rgba(180, 40, 60, 0.18)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              color: '#fff',
              fontSize: '22px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s, color 0.2s',
              boxShadow: '0 2px 12px 0 rgba(120,20,40,0.22)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              padding: 0,
              lineHeight: 1
            }}
            onMouseOver={e => {
              (e.target as HTMLElement).style.background = 'rgba(180, 40, 60, 0.88)';
            }}
            onMouseOut={e => {
              (e.target as HTMLElement).style.background = 'rgba(120, 20, 40, 0.68)';
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Nome do Local */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 600,
              fontSize: '14px',
              color: '#d1d5db'
            }}>
              Nome do Local (opcional)
            </label>
            <input
              ref={firstInputRef}
              type="text"
              value={formData.label}
              onChange={e => handleInputChange('label', e.target.value)}
              placeholder="Ex: Serra do Cipó"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: errors.label ? '2px solid #ef4444' : '1px solid rgba(80, 80, 120, 0.3)',
                background: 'rgba(32, 32, 44, 0.8)',
                color: '#fff',
                fontSize: '16px',
                fontFamily: 'Sora, Arial, sans-serif',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={e => {
                if (!errors.label) {
                  e.target.style.borderColor = 'rgba(38, 230, 255, 0.6)';
                }
              }}
              onBlur={e => {
                if (!errors.label) {
                  e.target.style.borderColor = 'rgba(80, 80, 120, 0.3)';
                }
              }}
            />
            {errors.label && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {errors.label}
              </span>
            )}
          </div>

          {/* Coordenadas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 600,
                fontSize: '14px',
                color: '#d1d5db'
              }}>
                Latitude *
              </label>
              <input
                type="number"
                step="any"
                value={formData.lat}
                onChange={e => handleCoordinateChange('lat', parseFloat(e.target.value) || 0)}
                placeholder="-19.3861"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errors.lat ? '2px solid #ef4444' : '1px solid rgba(80, 80, 120, 0.3)',
                  background: 'rgba(32, 32, 44, 0.8)',
                  color: '#fff',
                  fontSize: '16px',
                  fontFamily: 'Sora, Arial, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={e => {
                  if (!errors.lat) {
                    e.target.style.borderColor = 'rgba(38, 230, 255, 0.6)';
                  }
                }}
                onBlur={e => {
                  if (!errors.lat) {
                    e.target.style.borderColor = 'rgba(80, 80, 120, 0.3)';
                  }
                }}
              />
              {errors.lat && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {errors.lat}
                </span>
              )}
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 600,
                fontSize: '14px',
                color: '#d1d5db'
              }}>
                Longitude *
              </label>
              <input
                type="number"
                step="any"
                value={formData.lng}
                onChange={e => handleCoordinateChange('lng', parseFloat(e.target.value) || 0)}
                placeholder="-43.5873"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errors.lng ? '2px solid #ef4444' : '1px solid rgba(80, 80, 120, 0.3)',
                  background: 'rgba(32, 32, 44, 0.8)',
                  color: '#fff',
                  fontSize: '16px',
                  fontFamily: 'Sora, Arial, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={e => {
                  if (!errors.lng) {
                    e.target.style.borderColor = 'rgba(38, 230, 255, 0.6)';
                  }
                }}
                onBlur={e => {
                  if (!errors.lng) {
                    e.target.style.borderColor = 'rgba(80, 80, 120, 0.3)';
                  }
                }}
              />
              {errors.lng && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {errors.lng}
                </span>
              )}
            </div>
          </div>

          {/* Loading do geocoding */}
          {isGeocodingLoading && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '16px',
              color: '#26e6ff',
              fontSize: '14px'
            }}>
              🌍 Buscando informações do local...
            </div>
          )}

          {/* Código do País */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 600,
              fontSize: '14px',
              color: '#d1d5db'
            }}>
              País *
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={formData.countryCode}
                onChange={e => handleInputChange('countryCode', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errors.countryCode ? '2px solid #ef4444' : '1px solid rgba(80, 80, 120, 0.3)',
                  background: 'rgba(32, 32, 44, 0.8)',
                  color: 'transparent',
                  fontSize: '16px',
                  fontFamily: 'Sora, Arial, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  appearance: 'none'
                }}
                onFocus={e => {
                  if (!errors.countryCode) {
                    e.target.style.borderColor = 'rgba(38, 230, 255, 0.6)';
                  }
                }}
                onBlur={e => {
                  if (!errors.countryCode) {
                    e.target.style.borderColor = 'rgba(80, 80, 120, 0.3)';
                  }
                }}
              >
                {COUNTRIES.map(country => (
                  <option 
                    key={country.code} 
                    value={country.code}
                    style={{
                      background: 'rgba(32, 32, 44, 0.95)',
                      color: '#fff'
                    }}
                  >
                    {country.flag} - {country.name}
                  </option>
                ))}
              </select>
              {/* Exibir sigla, bandeira e nome do país no campo */}
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#fff',
                fontSize: '16px',
                fontFamily: 'Sora, Arial, sans-serif',
                lineHeight: '1',
                display: 'flex',
                alignItems: 'center'
              }}>
                {(() => {
                  const selectedCountry = COUNTRIES.find(c => c.code === formData.countryCode);
                  return selectedCountry ? `${selectedCountry.code} - ${selectedCountry.name}` : '';
                })()}
              </div>
              {/* Seta do select */}
              <div style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#fff'
              }}>
                ▼
              </div>
            </div>
            {errors.countryCode && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {errors.countryCode}
              </span>
            )}
          </div>

          {/* Estado e Cidade */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 600,
                fontSize: '14px',
                color: '#d1d5db'
              }}>
                Estado * (2 letras)
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={e => handleInputChange('state', e.target.value)}
                placeholder="MG"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errors.state ? '2px solid #ef4444' : '1px solid rgba(80, 80, 120, 0.3)',
                  background: 'rgba(32, 32, 44, 0.8)',
                  color: '#fff',
                  fontSize: '16px',
                  fontFamily: 'Sora, Arial, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={e => {
                  if (!errors.state) {
                    e.target.style.borderColor = 'rgba(38, 230, 255, 0.6)';
                  }
                }}
                onBlur={e => {
                  if (!errors.state) {
                    e.target.style.borderColor = 'rgba(80, 80, 120, 0.3)';
                  }
                }}
              />
              {errors.state && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Estado é obrigatório
                </span>
              )}
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 600,
                fontSize: '14px',
                color: '#d1d5db'
              }}>
                Cidade *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={e => handleInputChange('city', e.target.value)}
                placeholder="Belo Horizonte"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: errors.city ? '2px solid #ef4444' : '1px solid rgba(80, 80, 120, 0.3)',
                  background: 'rgba(32, 32, 44, 0.8)',
                  color: '#fff',
                  fontSize: '16px',
                  fontFamily: 'Sora, Arial, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={e => {
                  if (!errors.city) {
                    e.target.style.borderColor = 'rgba(38, 230, 255, 0.6)';
                  }
                }}
                onBlur={e => {
                  if (!errors.city) {
                    e.target.style.borderColor = 'rgba(80, 80, 120, 0.3)';
                  }
                }}
              />
              {errors.city && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Cidade é obrigatório
                </span>
              )}
            </div>
          </div>

          {/* Botões */}
          <div style={{ 
            position: 'relative',
            display: 'flex', 
            justifyContent: 'flex-end',
            gap: window.innerWidth < 480 ? '8px' : '12px'
          }}>
            {/* Botão Remover - posicionado no canto inferior esquerdo */}
            {editingLocation && onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm('Tem certeza que deseja remover este local?')) {
                    onRemove(editingLocation.id);
                    onClose();
                  }
                }}
                disabled={isLoading}
                style={{
                  position: 'absolute',
                  left: '0',
                  bottom: '0',
                  padding: window.innerWidth < 480 ? '8px 12px' : window.innerWidth < 768 ? '10px 16px' : '12px 20px',
                  borderRadius: '8px',
                  border: '1px solid #dc3545',
                  background: 'rgba(220, 53, 69, 0.8)',
                  color: '#fff',
                  fontSize: window.innerWidth < 480 ? '13px' : window.innerWidth < 768 ? '14px' : '15px',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Sora, Arial, sans-serif',
                  transition: 'all 0.2s',
                  opacity: isLoading ? 0.5 : 1,
                  minWidth: 'auto',
                  width: 'auto',
                  height: window.innerWidth < 480 ? '33px' : window.innerWidth < 768 ? '37px' : '41px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={e => {
                  if (!isLoading) {
                    (e.target as HTMLElement).style.background = 'rgba(220, 53, 69, 1)';
                  }
                }}
                onMouseOut={e => {
                  if (!isLoading) {
                    (e.target as HTMLElement).style.background = 'rgba(220, 53, 69, 0.8)';
                  }
                }}
              >
                🗑️
              </button>
            )}
            
            {/* Botões Cancelar e Salvar */}
            <div style={{ 
              display: 'flex', 
              gap: window.innerWidth < 480 ? '8px' : '12px'
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  padding: window.innerWidth < 480 ? '8px 12px' : window.innerWidth < 768 ? '10px 16px' : '12px 20px',
                  borderRadius: '8px',
                  border: '1px solid rgba(80, 80, 120, 0.3)',
                  background: 'rgba(32, 32, 44, 0.8)',
                  color: '#d1d5db',
                  fontSize: window.innerWidth < 480 ? '13px' : window.innerWidth < 768 ? '14px' : '15px',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Sora, Arial, sans-serif',
                  transition: 'all 0.2s',
                  opacity: isLoading ? 0.5 : 1,
                  minWidth: window.innerWidth < 480 ? '70px' : '80px',
                  flex: window.innerWidth < 480 ? '1' : 'none'
                }}
                onMouseOver={e => {
                  if (!isLoading) {
                    (e.target as HTMLElement).style.background = 'rgba(60, 60, 80, 0.8)';
                  }
                }}
                onMouseOut={e => {
                  if (!isLoading) {
                    (e.target as HTMLElement).style.background = 'rgba(32, 32, 44, 0.8)';
                  }
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || isGeocodingLoading}
                style={{
                  padding: window.innerWidth < 480 ? '8px 12px' : window.innerWidth < 768 ? '10px 16px' : '12px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isLoading || isGeocodingLoading 
                    ? 'rgba(80, 80, 120, 0.5)' 
                    : 'linear-gradient(90deg, #8f5fe8 60%, #26e6ff 100%)',
                  color: '#fff',
                  fontSize: window.innerWidth < 480 ? '13px' : window.innerWidth < 768 ? '14px' : '15px',
                  fontWeight: 600,
                  cursor: isLoading || isGeocodingLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Sora, Arial, sans-serif',
                  transition: 'all 0.2s',
                  opacity: isLoading || isGeocodingLoading ? 0.7 : 1,
                  minWidth: window.innerWidth < 480 ? '70px' : '80px',
                  flex: window.innerWidth < 480 ? '1' : 'none'
                }}
                onMouseOver={e => {
                  if (!isLoading && !isGeocodingLoading) {
                    (e.target as HTMLElement).style.background = 'linear-gradient(90deg, #6c3fdc 60%, #26e6ff 100%)';
                  }
                }}
                onMouseOut={e => {
                  if (!isLoading && !isGeocodingLoading) {
                    (e.target as HTMLElement).style.background = 'linear-gradient(90deg, #8f5fe8 60%, #26e6ff 100%)';
                  }
                }}
              >
                {isLoading ? 'Salvando...' : isGeocodingLoading ? 'Carregando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useMemo, useState, useRef } from 'react';
import { useLocations, CreateLocationInput } from '../data/locationsStore';
import { getCountryFlag } from '../utils/locationUtils';
import { useToast } from '../hooks/useToast';
import LocationModal from './LocationModal';

type Props = {
  onCityClick?: (lat: number, lng: number) => void;
};

const SIDEBAR_STYLE = (open: boolean, screenWidth: number) => {
  const isMobile = screenWidth <= 480;
  const isTablet = screenWidth > 480 && screenWidth <= 768;
  
  return {
    position: 'fixed' as const,
    top: isMobile ? 16 : 24,
    left: isMobile ? 16 : 24,
    zIndex: 1500,
    width: isMobile ? 'calc(100vw - 32px)' : isTablet ? 'calc(100vw - 48px)' : 'calc(100vw - 48px)',
    maxWidth: isMobile ? 'none' : isTablet ? '450px' : '500px',
    minHeight: 100,
    background: 'rgba(22,22,28,0.98)',
    borderRadius: isMobile ? 24 : isTablet ? 30 : 36,
    boxShadow: '0 8px 32px 0 rgba(0,0,0,0.32)',
    color: '#fff',
    padding: isMobile ? 16 : isTablet ? 18 : 20,
    fontFamily: 'Sora, Arial, sans-serif',
    height: undefined,
    maxHeight: isMobile ? '85vh' : isTablet ? '75vh' : '600px',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    transition: 'all 0.3s cubic-bezier(.77,.2,.24,1) 0s',
    boxSizing: 'border-box' as const,
    opacity: open ? 1 : 0,
    transform: open ? 'translateX(0)' : 'translateX(-40px)',
    gap: isMobile ? 12 : isTablet ? 14 : 16,
  };
};

const CLOSE_BTN_STYLE = (screenWidth: number) => {
  const isMobile = screenWidth <= 480;
  const isTablet = screenWidth > 480 && screenWidth <= 768;
  
  return {
    position: 'absolute' as const,
    top: isMobile ? -10 : -12,
    right: isMobile ? -10 : -12,
    zIndex: 2001,
    width: isMobile ? 32 : isTablet ? 35 : 38,
    height: isMobile ? 32 : isTablet ? 35 : 38,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    background: 'rgba(120, 20, 40, 0.68)',
    boxShadow: '0 2px 12px 0 rgba(120,20,40,0.22)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1.5px solid rgba(180, 40, 60, 0.18)',
    borderRadius: '50%',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
    padding: 0,
    lineHeight: 1,
    touchAction: 'manipulation' as const,
    fontSize: isMobile ? 18 : isTablet ? 20 : 22,
  };
};

const CARD_TOP_STYLE = (screenWidth: number) => {
  const isMobile = screenWidth <= 480;
  const isTablet = screenWidth > 480 && screenWidth <= 768;
  
  return {
    borderRadius: isMobile ? 16 : isTablet ? 18 : 20,
    background: 'rgba(32, 32, 44, 0.78)',
    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.28)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1.5px solid rgba(80, 80, 120, 0.18)',
    padding: isMobile ? '14px 8px 8px 8px' : isTablet ? '18px 16px 10px 16px' : '22px 22px 12px 22px',
    marginBottom: isMobile ? 10 : isTablet ? 14 : 18,
    fontWeight: 700,
    fontSize: isMobile ? 20 : isTablet ? 24 : 28,
    textShadow: '0 2px 6px #0005',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
};

const TITLE_STYLE = (screenWidth: number) => {
  const isMobile = screenWidth <= 480;
  const isTablet = screenWidth > 480 && screenWidth <= 768;
  
  return {
    fontWeight: 900,
    fontSize: isMobile ? 18 : isTablet ? 21 : 24,
    letterSpacing: 0.5,
    color: '#fff',
    textAlign: 'center' as const,
    lineHeight: 1.15,
    fontFamily: 'Sora, Arial, sans-serif',
  };
};

const SUBTITLE_STYLE = (screenWidth: number) => {
  const isMobile = screenWidth <= 480;
  const isTablet = screenWidth > 480 && screenWidth <= 768;
  
  return {
    fontWeight: 400,
    fontSize: isMobile ? 12 : isTablet ? 14 : 16,
    marginTop: isMobile ? 5 : 7,
    color: '#d1d5db',
    textAlign: 'center' as const,
    marginBottom: isMobile ? 3 : isTablet ? 6 : 8,
    fontFamily: 'Sora, Arial, sans-serif',
  };
};

const LIST_TITLE_STYLE = (screenWidth: number) => {
  const isMobile = screenWidth <= 480;
  const isTablet = screenWidth > 480 && screenWidth <= 768;
  
  return {
    marginBottom: isMobile ? 5 : isTablet ? 8 : 10,
    fontWeight: 400,
    fontSize: isMobile ? 14 : isTablet ? 16 : 18,
    letterSpacing: 0.2,
    textAlign: 'left' as const,
    color: '#fff',
    fontFamily: 'Sora, Arial, sans-serif',
  };
};

const UL_STYLE = (screenWidth: number) => {
  const isMobile = screenWidth <= 480;
  const isTablet = screenWidth > 480 && screenWidth <= 768;
  
  return {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    maxHeight: isMobile ? '60vh' : isTablet ? '65vh' : 400,
    minHeight: isMobile ? 60 : 80,
    overflowY: 'auto' as const,
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
    gap: isMobile ? 1 : isTablet ? 3 : 4,
  };
};

const LI_STYLE = (screenWidth: number) => {
  const isMobile = screenWidth <= 480;
  const isTablet = screenWidth > 480 && screenWidth <= 768;
  
  return {
    padding: isMobile ? '6px 4px' : isTablet ? '8px 8px' : '10px 12px',
    borderBottom: '1px solid #222',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: isMobile ? 4 : isTablet ? 7 : 10,
    cursor: 'pointer',
    transition: 'background 0.25s',
    borderRadius: isMobile ? 4 : 6,
    marginBottom: isMobile ? 0.5 : isTablet ? 1 : 2,
    position: 'relative' as const,
    fontWeight: 600,
    background: undefined,
  };
};

const DOT_STYLE = (screenWidth: number) => {
  const isMobile = screenWidth <= 480;
  const isTablet = screenWidth > 480 && screenWidth <= 768;
  
  return {
    width: isMobile ? 5 : 7,
    height: isMobile ? 5 : 7,
    background: '#26e6ff',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: isMobile ? 6 : isTablet ? 9 : 12,
  };
};

const CITY_STYLE = (screenWidth: number) => {
  const isMobile = screenWidth <= 480;
  const isTablet = screenWidth > 480 && screenWidth <= 768;
  
  return {
    fontWeight: 700,
    fontSize: isMobile ? 13 : isTablet ? 14 : 16,
    color: '#fff',
    marginRight: isMobile ? 2 : 4,
    fontFamily: 'Sora, Arial, sans-serif',
  };
};

const STATE_STYLE = (screenWidth: number) => {
  const isMobile = screenWidth <= 480;
  const isTablet = screenWidth > 480 && screenWidth <= 768;
  
  return {
    color: '#d1d5db',
    fontWeight: 400,
    fontSize: isMobile ? 11 : isTablet ? 12 : 14,
    marginRight: isMobile ? 2 : 4,
    fontFamily: 'Sora, Arial, sans-serif',
  };
};

const COUNTRY_FLAG_STYLE = (screenWidth: number) => {
  const isMobile = screenWidth <= 480;
  const isTablet = screenWidth > 480 && screenWidth <= 768;
  
  return {
    fontSize: isMobile ? 16 : isTablet ? 19 : 22,
    marginLeft: 'auto',
    marginRight: isMobile ? 2 : 4,
    filter: 'drop-shadow(0 1px 4px #26e6ff44)',
    userSelect: 'none' as const,
  };
};



export default function Sidebar({ onCityClick }: Props) {
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { locations, addLocation, exportLocations, importLocations } = useLocations();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Detecta tamanhos de tela dinamicamente
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const isMobile = screenWidth <= 480;
  const isTablet = screenWidth > 480 && screenWidth <= 768;

  const total = locations.length;
  const estados = useMemo(() => Array.from(new Set(locations.map(l => l.state).filter(e => e && e.trim() !== ''))), [locations]);
  const paises = useMemo(() => Array.from(new Set(locations.map(l => l.countryCode))), [locations]);

  function handleCityClick(lat: number, lng: number) {
    setOpen(false);
    onCityClick?.(lat, lng);
  }

  // Função para salvar novo local
  const handleSaveLocation = (locationData: CreateLocationInput) => {
    const success = addLocation(locationData);
    if (success) {
      setIsModalOpen(false);
      showToast('Local adicionado com sucesso!', 'success');
    } else {
      showToast('Erro: Local duplicado ou inválido', 'error');
    }
  };

  // Função para exportar localizações
  const handleExport = () => {
    try {
      const jsonData = exportLocations();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meus-locais-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Locais exportados com sucesso!', 'success');
    } catch {
      showToast('Erro ao exportar locais', 'error');
    }
  };

  // Função para importar localizações
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = importLocations(jsonData);
        if (success) {
          showToast('Locais importados com sucesso!', 'success');
        } else {
          showToast('Erro: Arquivo inválido ou sem dados válidos', 'error');
        }
      } catch {
        showToast('Erro ao ler arquivo', 'error');
      }
    };
    reader.readAsText(file);
    
    // Limpar input para permitir reimportar o mesmo arquivo
    event.target.value = '';
  };
  return (
    <>
      {!open && (
        <button
          style={{
            position: 'fixed',
            top: isMobile ? 16 : 24,
            left: isMobile ? 12 : 16,
            zIndex: 2000,
            width: isMobile ? 44 : isTablet ? 48 : 52,
            height: isMobile ? 44 : isTablet ? 48 : 52,
            background: 'linear-gradient(90deg, #8f5fe8 60%, #26e6ff 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: isMobile ? 10 : 12,
            fontSize: isMobile ? 24 : isTablet ? 26 : 28,
            boxShadow: '0 4px 14px #0008',
            cursor: 'pointer',
            transition: 'background 0.2s, box-shadow 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setOpen(true)}
          aria-label="Abrir lista de cidades"
          onMouseOver={e => {
            e.currentTarget.style.background = 'linear-gradient(90deg, #6c3fdc 60%, #26e6ff 100%)';
            e.currentTarget.style.boxShadow = '0 4px 22px #26e6ff44';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'linear-gradient(90deg, #8f5fe8 60%, #26e6ff 100%)';
            e.currentTarget.style.boxShadow = '0 4px 14px #0008';
          }}
          onTouchStart={e => {
            (e.currentTarget as HTMLElement).style.background = 'linear-gradient(90deg, #6c3fdc 60%, #26e6ff 100%)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 22px #26e6ff44';
          }}
          onTouchEnd={e => {
            (e.currentTarget as HTMLElement).style.background = 'linear-gradient(90deg, #8f5fe8 60%, #26e6ff 100%)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px #0008';
          }}
        >
          <span style={{ color: '#fff', fontSize: isMobile ? 30 : isTablet ? 32 : 34, fontWeight: 700, lineHeight: 1 }}>≡</span>
        </button>
      )}
      {open && (
        <aside style={SIDEBAR_STYLE(open, screenWidth)}>
          <button
            onClick={() => setOpen(false)}
            style={CLOSE_BTN_STYLE(screenWidth)}
            aria-label="Fechar lista"
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(180, 40, 60, 0.88)';
              e.currentTarget.style.boxShadow = '0 2px 16px 0 rgba(180,40,60,0.32)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(120, 20, 40, 0.68)';
              e.currentTarget.style.boxShadow = '0 2px 12px 0 rgba(120,20,40,0.22)';
            }}
            onTouchStart={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(180, 40, 60, 0.88)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px 0 rgba(180,40,60,0.32)';
            }}
            onTouchEnd={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(120, 20, 40, 0.68)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px 0 rgba(120,20,40,0.22)';
            }}
          >
            <span style={{fontSize: 'var(--font-xl)', fontWeight: 700, textShadow: '0 2px 6px #0005'}}>×</span>
          </button>
          <div style={CARD_TOP_STYLE(screenWidth)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: isMobile ? 18 : isTablet ? 24 : 28, marginRight: 2 }}>🌎</span>
              <span style={TITLE_STYLE(screenWidth)}>Meu Mapa de Rotas</span>
            </div>
            <div style={SUBTITLE_STYLE(screenWidth)}>
              Eu já visitei <span style={{ color: '#fff', fontWeight: 700 }}>{total}</span> cidades, <span style={{ color: '#fff', fontWeight: 700 }}>{estados.length}</span> estados e <span style={{ color: '#fff', fontWeight: 700 }}>{paises.length}</span> países.
            </div>
            
            {/* Botões de ação */}
            <div style={{ 
              display: 'flex', 
              gap: isMobile ? 6 : isTablet ? 10 : 12, 
              marginTop: isMobile ? 10 : isTablet ? 14 : 16,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  padding: isMobile ? '6px 12px' : isTablet ? '8px 16px' : '10px 20px',
                  borderRadius: isMobile ? '6px' : '8px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #8f5fe8 60%, #26e6ff 100%)',
                  color: '#fff',
                  fontSize: isMobile ? 11 : isTablet ? 12 : 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Sora, Arial, sans-serif',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 4 : 6
                }}
                onMouseOver={e => {
                  (e.target as HTMLElement).style.background = 'linear-gradient(90deg, #6c3fdc 60%, #26e6ff 100%)';
                  (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                }}
                onMouseOut={e => {
                  (e.target as HTMLElement).style.background = 'linear-gradient(90deg, #8f5fe8 60%, #26e6ff 100%)';
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <span>+</span> Adicionar
              </button>
              
              <button
                onClick={handleExport}
                style={{
                  padding: isMobile ? '6px 10px' : isTablet ? '8px 12px' : '10px 16px',
                  borderRadius: isMobile ? '6px' : '8px',
                  border: '1px solid rgba(80, 80, 120, 0.3)',
                  background: 'rgba(32, 32, 44, 0.8)',
                  color: '#d1d5db',
                  fontSize: isMobile ? 11 : isTablet ? 12 : 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Sora, Arial, sans-serif',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 3 : 4
                }}
                onMouseOver={e => {
                  (e.target as HTMLElement).style.background = 'rgba(60, 60, 80, 0.8)';
                  (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                }}
                onMouseOut={e => {
                  (e.target as HTMLElement).style.background = 'rgba(32, 32, 44, 0.8)';
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <span>📤</span> Exportar
              </button>
              
              <button
                onClick={handleImport}
                style={{
                  padding: isMobile ? '6px 10px' : isTablet ? '8px 12px' : '10px 16px',
                  borderRadius: isMobile ? '6px' : '8px',
                  border: '1px solid rgba(80, 80, 120, 0.3)',
                  background: 'rgba(32, 32, 44, 0.8)',
                  color: '#d1d5db',
                  fontSize: isMobile ? 11 : isTablet ? 12 : 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Sora, Arial, sans-serif',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 3 : 4
                }}
                onMouseOver={e => {
                  (e.target as HTMLElement).style.background = 'rgba(60, 60, 80, 0.8)';
                  (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                }}
                onMouseOut={e => {
                  (e.target as HTMLElement).style.background = 'rgba(32, 32, 44, 0.8)';
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <span>📥</span> Importar
              </button>
            </div>
          </div>
          <div style={LIST_TITLE_STYLE(screenWidth)}>
            Lista de cidades, estados e países:
          </div>
          <ul style={UL_STYLE(screenWidth)}>
            {locations
              .filter(loc => loc.city)
              .sort((a, b) => a.city!.localeCompare(b.city!, 'pt-BR', { sensitivity: 'base' }))
              .map((loc, i) => (
              <li
                key={i}
                style={{
                  ...LI_STYLE(screenWidth),
                  borderBottom: i < locations.length - 1 ? '1px solid #222' : 'none',
                }}
                onClick={() => handleCityClick(loc.lat, loc.lng)}
                title="Ver no mapa"
                onMouseOver={e => {
                  if (onCityClick) (e.currentTarget as HTMLElement).style.background = '#232323';
                }}
                onMouseOut={e => {
                  if (onCityClick) (e.currentTarget as HTMLElement).style.background = '';
                }}
              >
                <span style={DOT_STYLE(screenWidth)}></span>
                <span style={CITY_STYLE(screenWidth)}>{loc.city}</span>
                {loc.state && (
                  <span style={STATE_STYLE(screenWidth)}>{loc.state}</span>
                )}
                <span style={COUNTRY_FLAG_STYLE(screenWidth)}>{getCountryFlag(loc.countryCode)}</span>
              </li>
            ))}
          </ul>
        </aside>
      )}
      <style>{`
        ul::-webkit-scrollbar {
          width: 7px;
          background: transparent;
        }
        ul::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 6px;
        }
        ul::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
      
      {/* Modal para adicionar nova localização */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLocation}
      />
      
      {/* Input oculto para importar arquivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
}
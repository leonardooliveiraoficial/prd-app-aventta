import { useEffect, useCallback } from 'react';

type ShortcutHandlers = {
  onToggleMenu?: () => void;
  onOpenAddLocation?: () => void;
  onCloseModal?: () => void;
  onFocusSearch?: () => void;
  onSave?: () => void;
};

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorar se estiver digitando em um input/textarea
    const target = event.target as HTMLElement;
    const isInputFocused = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true';

    // Esc - sempre funciona
    if (event.key === 'Escape') {
      event.preventDefault();
      handlers.onCloseModal?.();
      return;
    }

    // Ctrl/Cmd + S - salvar (funciona mesmo em inputs)
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      handlers.onSave?.();
      return;
    }

    // Ctrl/Cmd + K - focar busca (funciona mesmo em inputs)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      handlers.onFocusSearch?.();
      return;
    }

    // Outros atalhos só funcionam quando não estiver digitando
    if (isInputFocused) return;

    switch (event.key.toLowerCase()) {
      case 'm':
        event.preventDefault();
        handlers.onToggleMenu?.();
        break;
      case 'a':
        event.preventDefault();
        handlers.onOpenAddLocation?.();
        break;
    }
  }, [handlers]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Hook para atalhos específicos de um componente
export function useComponentShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isModified = event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
      
      // Ignorar se estiver digitando ou usando modificadores
      const target = event.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || 
                            target.tagName === 'TEXTAREA' || 
                            target.contentEditable === 'true';
      
      if (isInputFocused || isModified) return;

      if (shortcuts[key]) {
        event.preventDefault();
        shortcuts[key]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
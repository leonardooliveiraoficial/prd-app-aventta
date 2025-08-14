import MapView from './components/MapView';
import { SupabaseLocationProvider } from './data/supabaseLocationsStore';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';

function AppContent() {
  const { toasts, removeToast } = useToast();
  
  return (
    <>
      <MapView />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

function App() {
  return (
    <SupabaseLocationProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </SupabaseLocationProvider>
  );
}

export default App;

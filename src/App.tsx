import MapView from './components/MapView';
import { LocationProvider } from './data/locationsStore';
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
    <LocationProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </LocationProvider>
  );
}

export default App;

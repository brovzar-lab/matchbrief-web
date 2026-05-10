import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isDemoMode } from './lib/demo';
import { useAppStore } from './lib/store';
import DemoBanner from './components/DemoBanner';
import ToastContainer from './components/ToastContainer';
import PaywallModal from './components/PaywallModal';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import NewSynthesisScreen from './screens/NewSynthesisScreen';
import SynthesisDetailScreen from './screens/SynthesisDetailScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function App(): JSX.Element {
  const user = useAppStore((s) => s.user);
  const showPaywall = useAppStore((s) => s.showPaywall);
  const setShowPaywall = useAppStore((s) => s.setShowPaywall);

  return (
    <BrowserRouter>
      {isDemoMode && <DemoBanner />}
      <ToastContainer />
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthScreen />} />
        <Route path="/" element={user ? <HomeScreen /> : <Navigate to="/auth" replace />} />
        <Route
          path="/new"
          element={user ? <NewSynthesisScreen /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/synthesis/:id"
          element={user ? <SynthesisDetailScreen /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/settings"
          element={user ? <SettingsScreen /> : <Navigate to="/auth" replace />}
        />
        <Route path="*" element={<Navigate to={user ? '/' : '/auth'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

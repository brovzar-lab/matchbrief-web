import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isDemoMode } from './lib/demo';
import { useAppStore } from './lib/store';
import DemoBanner from './components/DemoBanner';
import ToastContainer from './components/ToastContainer';
import PaywallModal from './components/PaywallModal';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import ScanningScreen from './screens/ScanningScreen';
import EditItemsScreen from './screens/EditItemsScreen';
import AssignGroupScreen from './screens/AssignGroupScreen';
import ClaimItemsScreen from './screens/ClaimItemsScreen';
import SummaryScreen from './screens/SummaryScreen';
import HistoryScreen from './screens/HistoryScreen';
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
      <div className="min-h-screen">
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthScreen />} />

          <Route path="/" element={user ? <HomeScreen /> : <Navigate to="/auth" replace />} />
          <Route path="/camera" element={user ? <CameraScreen /> : <Navigate to="/auth" replace />} />
          <Route path="/settings" element={user ? <SettingsScreen /> : <Navigate to="/auth" replace />} />

          <Route
            path="/session/:id/scanning"
            element={user ? <ScanningScreen /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/session/:id/edit"
            element={user ? <EditItemsScreen /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/session/:id/assign"
            element={user ? <AssignGroupScreen /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/session/:id/claim"
            element={user ? <ClaimItemsScreen /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/session/:id/summary"
            element={user ? <SummaryScreen /> : <Navigate to="/auth" replace />}
          />

          <Route
            path="/group/:groupId/history"
            element={user ? <HistoryScreen /> : <Navigate to="/auth" replace />}
          />

          <Route path="*" element={<Navigate to={user ? '/' : '/auth'} replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

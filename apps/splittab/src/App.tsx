import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isDemoMode } from './lib/demo';
import { useAppStore } from './lib/store';
import DemoBanner from './components/DemoBanner';
import ToastContainer from './components/ToastContainer';
import AuthScreen from './screens/AuthScreen';
import UploadScreen from './screens/UploadScreen';
import ScanningScreen from './screens/ScanningScreen';
import EditItemsScreen from './screens/EditItemsScreen';
import QRDisplayScreen from './screens/QRDisplayScreen';
import LiveClaimView from './screens/LiveClaimView';
import SplitSummaryScreen from './screens/SplitSummaryScreen';
import JoinScreen from './screens/JoinScreen';
import ClaimItemsScreen from './screens/ClaimItemsScreen';
import PersonalSummaryScreen from './screens/PersonalSummaryScreen';

export default function App(): JSX.Element {
  const user = useAppStore((s) => s.user);

  return (
    <BrowserRouter>
      {isDemoMode && <DemoBanner />}
      <ToastContainer />
      <div className="min-h-screen">
        <Routes>
          {/* Guest flow — no host auth required */}
          <Route path="/join/:sessionId" element={<JoinScreen />} />
          <Route path="/join/:sessionId/claim" element={<ClaimItemsScreen />} />
          <Route path="/join/:sessionId/pay" element={<PersonalSummaryScreen />} />

          {/* Auth screen */}
          <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthScreen />} />

          {/* Host flow — requires auth */}
          <Route path="/" element={user ? <UploadScreen /> : <Navigate to="/auth" replace />} />
          <Route
            path="/session/:id/scan"
            element={user ? <ScanningScreen /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/session/:id/edit"
            element={user ? <EditItemsScreen /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/session/:id/qr"
            element={user ? <QRDisplayScreen /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/session/:id/claims"
            element={user ? <LiveClaimView /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/session/:id/summary"
            element={user ? <SplitSummaryScreen /> : <Navigate to="/auth" replace />}
          />

          <Route path="*" element={<Navigate to={user ? '/' : '/auth'} replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

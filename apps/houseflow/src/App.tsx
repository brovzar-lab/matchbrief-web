import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isDemoMode } from './lib/demo';
import { useAppStore } from './lib/store';
import DemoBanner from './components/DemoBanner';
import ToastContainer from './components/ToastContainer';
import PaywallModal from './components/PaywallModal';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import IncomeScreen from './screens/IncomeScreen';
import ExpenseScreen from './screens/ExpenseScreen';
import SplitCalculatorScreen from './screens/SplitCalculatorScreen';
import GoalTrackerScreen from './screens/GoalTrackerScreen';
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

          <Route path="/" element={user ? <DashboardScreen /> : <Navigate to="/auth" replace />} />
          <Route path="/income" element={user ? <IncomeScreen /> : <Navigate to="/auth" replace />} />
          <Route path="/expenses" element={user ? <ExpenseScreen /> : <Navigate to="/auth" replace />} />
          <Route path="/split" element={user ? <SplitCalculatorScreen /> : <Navigate to="/auth" replace />} />
          <Route path="/goals" element={user ? <GoalTrackerScreen /> : <Navigate to="/auth" replace />} />
          <Route path="/settings" element={user ? <SettingsScreen /> : <Navigate to="/auth" replace />} />

          <Route path="*" element={<Navigate to={user ? '/' : '/auth'} replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

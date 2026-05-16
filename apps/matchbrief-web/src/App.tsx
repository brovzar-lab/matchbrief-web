import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './lib/store';
import { isDemoMode } from './lib/config';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import AnalyzerScreen from './screens/AnalyzerScreen';
import ResultsScreen from './screens/ResultsScreen';
import SettingsScreen from './screens/SettingsScreen';
import BottomNav from './components/BottomNav';

function AppShell() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden flex flex-col">
        <Routes>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/analyze" element={<AnalyzerScreen />} />
          <Route path="/results" element={<ResultsScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  const user = useStore((s) => s.user);

  useEffect(() => {
    if (isDemoMode) return;
    let unsub: (() => void) | undefined;
    import('./lib/firebase').then(({ initFirebase }) => {
      unsub = initFirebase();
    });
    return () => unsub?.();
  }, []);

  return (
    <BrowserRouter>
      {user ? <AppShell /> : <AuthScreen />}
    </BrowserRouter>
  );
}

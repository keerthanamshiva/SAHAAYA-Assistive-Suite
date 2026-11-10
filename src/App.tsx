import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import HearPage from './pages/HearPage';
import SpeakPage from './pages/SpeakPage';
import SeePage from './pages/SeePage';
import HealthcarePage from './pages/HealthcarePage';
import NavigatePage from './pages/NavigatePage';
import EmergencyPage from './pages/EmergencyPage';
import SettingsPage from './pages/SettingsPage';
import SignConnectPage from './pages/SignConnectPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authenticated / Core App Flow with AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/hear" element={<HearPage />} />
            <Route path="/speak" element={<SpeakPage />} />
            <Route path="/see" element={<SeePage />} />
            <Route path="/sign-connect" element={<SignConnectPage />} />
            <Route path="/healthcare" element={<HealthcarePage />} />
            <Route path="/navigate" element={<NavigatePage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

import { Navigate, Route, Routes } from 'react-router-dom';
import Fish3DOverlay from './components/Fish3DOverlay';
import GlobalNavbar from './components/GlobalNavbar';
import LegacyPage from './LegacyPage';
import FishDetectPage from './pages/FishDetectPage';
import HomePage from './pages/HomePage';
import SosPage from './pages/SosPage';
import WeatherPage from './pages/WeatherPage';

function NotFoundPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#fff' }}>
      <h1>404 - Page not found</h1>
    </main>
  );
}

export default function App() {
  return (
    <div className="app-root">
      <div className="water-bg" aria-hidden="true" />
      <div className="fish-gif-bg" aria-hidden="true" />
      <Fish3DOverlay />
      <GlobalNavbar />
      <div className="route-layer">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/index.html" element={<HomePage />} />
          <Route path="/sos/sos-emergency.html" element={<SosPage />} />
          <Route path="/wether/index.html" element={<WeatherPage />} />
          <Route path="/fish_detect/index.html" element={<FishDetectPage />} />
          <Route path="/dashoardfinal/*" element={<LegacyPage />} />
          <Route path="/dashboard-main/*" element={<LegacyPage />} />
          <Route path="/fish-zone/*" element={<LegacyPage />} />
          <Route path="/fish-population/*" element={<LegacyPage />} />
          <Route path="/fish deseases/*" element={<LegacyPage />} />
          <Route path="/fish%20deseases/*" element={<LegacyPage />} />
          <Route path="/legacy/*" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
}

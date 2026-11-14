import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/shell/AppShell';
import LoginPage from './pages/LoginPage';
import VisualMapAndSearchPage from './pages/VisualMapAndSearchPage';
import CapturePage from './pages/CapturePage';
import PrivacyPage from './pages/PrivacyPage';

// One shell (skip link, header, <nav>, <main>) around every team screen:
//   Map / Search → Faris · Input → Tyra · Privacy → Yusif
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route path="/map" element={<VisualMapAndSearchPage key="map" initialTab="map" />} />
        <Route path="/search" element={<VisualMapAndSearchPage key="search" initialTab="search" />} />
        <Route path="/input" element={<CapturePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/map" replace />} />
    </Routes>
  );
}

import { Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import BottomNav from './BottomNav'
import OfflineBanner from './OfflineBanner';
import RouteAnnouncer from './RouteAnnouncer';
import './shell.css';

/** Frame for every signed-in screen: skip link → top bar → page → tabs. */
export default function AppShell() {
  const { t } = useTranslation();
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">{t('app.skipToContent')}</a>
      <Navbar />
      <OfflineBanner />
      <RouteAnnouncer />
      <BottomNav />
      <main id="main" tabIndex={-1} className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

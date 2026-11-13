import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/** App-wide offline state under the top bar; a short "back online" note after. */
export default function OfflineBanner() {
  const { t } = useTranslation();
  const [mode, setMode] = useState(() => (navigator.onLine ? 'online' : 'offline')); // online | offline | restored

  useEffect(() => {
    let timer;
    const up = () => {
      setMode('restored');
      timer = setTimeout(() => setMode('online'), 4000);
    };
    const down = () => {
      clearTimeout(timer);
      setMode('offline');
    };
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="offline-region">
      {mode === 'offline' && <p className="offline-banner">{t('offline.banner')}</p>}
      {mode === 'restored' && <p className="online-banner">{t('offline.restored')}</p>}
    </div>
  );
}

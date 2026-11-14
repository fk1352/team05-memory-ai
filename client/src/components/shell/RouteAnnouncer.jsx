import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PAGE_KEYS = { '/map': 'pages.map', '/search': 'pages.search', '/input': 'pages.input', '/privacy': 'pages.privacy' };

/**
 * In a single-page app, switching tabs doesn't reload the page, so screen
 * readers hear nothing. This updates <title> and announces the new screen
 * in a polite live region (WCAG 4.1.3 Status Messages, 2.4.2 Page Titled).
 */
export default function RouteAnnouncer() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const [message, setMessage] = useState('');
  const firstRender = useRef(true);

  useEffect(() => {
    const key = PAGE_KEYS[pathname];
    if (!key) return undefined;
    const page = t(key);
    document.title = t('app.pageTitle', { page });
    if (firstRender.current) {
      firstRender.current = false; // the screen reader already reads the page on load
      return undefined;
    }
    // Clear first so the same text is announced again when revisiting a tab.
    setMessage('');
    const id = setTimeout(() => setMessage(t('app.pageLoaded', { page })), 100);
    return () => clearTimeout(id);
  }, [pathname, t, i18n.language]);

  return (
    <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </p>
  );
}

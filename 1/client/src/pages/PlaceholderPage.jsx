import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/** Stand-in for screens teammates are still building (Map, Search, Input, Privacy). */
export default function PlaceholderPage({ titleKey }) {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = t('app.pageTitle', { page: t(titleKey) });
  }, [t, titleKey]);

  return (
    <section className="card">
      <h1>{t(titleKey)}</h1>
      <p className="muted">{t('placeholder.body')}</p>
    </section>
  );
}

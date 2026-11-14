import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import VisualMapAndSearchPage from './pages/VisualMapAndSearchPage';
import PrivacyPage from './pages/PrivacyPage';

export default function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('map');

  const changeLocale = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('memory_ai_locale', lng);
    document.documentElement.lang = lng;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
      {/* Shared Top Header + Locale Switcher (EN / HR / DE) */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #cbd5e1', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }} aria-hidden="true">🧠</span>
          <strong style={{ fontSize: '1.15rem' }}>{t('appTitle')}</strong>
        </div>

        {/* Navigation Tabs */}
        <nav aria-label="Main navigation" style={{ display: 'flex', gap: '8px' }}>
          {['map', 'search', 'privacy'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #0f172a',
                background: activeTab === tab ? '#0f172a' : '#ffffff',
                color: activeTab === tab ? '#ffffff' : '#0f172a',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {t(`nav.${tab}`)}
            </button>
          ))}
        </nav>

        {/* Locale Switcher (Requirement F5 & Section 6) */}
        <div role="group" aria-label="Language switcher" style={{ display: 'flex', gap: '4px' }}>
          {['en', 'hr', 'de'].map((lng) => (
            <button
              key={lng}
              type="button"
              onClick={() => changeLocale(lng)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #64748b',
                background: i18n.language === lng ? '#2563eb' : '#f8fafc',
                color: i18n.language === lng ? '#ffffff' : '#0f172a',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {lng}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '20px 12px' }}>
        {activeTab === 'privacy' ? <PrivacyPage /> : <VisualMapAndSearchPage initialTab={activeTab} />}
      </main>
    </div>
  );
}
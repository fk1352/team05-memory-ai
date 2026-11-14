import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAuditLogs, getMemories, getSettings, updateSettings } from './api';
import { errorKey, formatRelative } from './i18n-privacy';

export default function PrivacyDashboard({ userId = 1, onNavigate }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'en';

  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [memories, setMemories] = useState([]);
  const [lastEvent, setLastEvent] = useState(null);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [mems, logs, prefs] = await Promise.all([getMemories(), getAuditLogs(1), getSettings(userId)]);
      setMemories(Array.isArray(mems) ? mems : []);
      setLastEvent(logs?.[0] ?? null);
      setSettings(prefs);
      setStatus('ready');
    } catch (err) {
      setError(err.code);
      setStatus('error');
    }
  }, [userId]);

  useEffect(() => {
    Promise.resolve().then(fetchData);
  }, [fetchData]);

  function load() {
    setStatus('loading');
    fetchData();
  }

  async function togglePause() {
    const next = !settings.memory_paused;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateSettings(userId, { memory_paused: next });
      setSettings(updated);
      setAnnouncement(t(next ? 'privacy.dashboard.savedPaused' : 'privacy.dashboard.savedResumed'));
    } catch (err) {
      setSaveError(err.code);
    } finally {
      setSaving(false);
    }
  }

  const number = new Intl.NumberFormat(locale);
  const facts = memories.filter((m) => m.memory_type === 'fact').length;
  const inferences = memories.length - facts;

  return (
    <section aria-labelledby="pv-dash-heading">
      <h2 id="pv-dash-heading">{t('privacy.dashboard.heading')}</h2>
      <p>{t('privacy.dashboard.intro')}</p>

      {status === 'loading' && (
        <div className="pv-state" role="status">
          {t('privacy.loading')}
        </div>
      )}

      {status === 'error' && (
        <div className="pv-alert pv-alert-error" role="alert">
          <span>{t(errorKey(error))}</span>
          <button type="button" className="pv-btn" onClick={load}>
            {t('privacy.retry')}
          </button>
        </div>
      )}

      {status === 'ready' && (
        <>
          <div className="pv-card">
            <dl className="pv-stats">
              <div className="pv-stat">
                <dt>{t('privacy.dashboard.total')}</dt>
                <dd>{number.format(memories.length)}</dd>
              </div>
              <div className="pv-stat">
                <dt>{t('privacy.dashboard.facts')}</dt>
                <dd>{number.format(facts)}</dd>
              </div>
              <div className="pv-stat">
                <dt>{t('privacy.dashboard.inferences')}</dt>
                <dd>{number.format(inferences)}</dd>
              </div>
              <div className="pv-stat">
                <dt>{t('privacy.dashboard.lastActivity')}</dt>
                <dd style={{ fontSize: '1rem' }}>
                  {lastEvent ? (
                    <time dateTime={lastEvent.created_at_utc}>{formatRelative(lastEvent.created_at_utc, locale)}</time>
                  ) : (
                    t('privacy.dashboard.noActivity')
                  )}
                </dd>
              </div>
            </dl>
            <div className="pv-links">
              <button type="button" className="pv-btn" onClick={() => onNavigate?.('forget')}>
                {t('privacy.dashboard.manageLink')}
              </button>
              <button type="button" className="pv-btn" onClick={() => onNavigate?.('audit')}>
                {t('privacy.dashboard.auditLink')}
              </button>
            </div>
          </div>

          <div className="pv-card">
            <h3>{t('privacy.dashboard.permissions')}</h3>
            <div className="pv-switch-row">
              <div>
                <span id="pv-pause-label" style={{ fontWeight: 600 }}>
                  {t('privacy.dashboard.pauseLabel')}
                </span>
                <p id="pv-pause-help" style={{ margin: '4px 0 0' }}>
                  {t('privacy.dashboard.pauseHelp')}
                </p>
                <p className="pv-status">
                  <span aria-hidden="true">{settings.memory_paused ? '⏸' : '●'}</span>
                  {settings.memory_paused ? t('privacy.dashboard.statusPaused') : t('privacy.dashboard.statusOn')}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                className="pv-switch"
                aria-checked={settings.memory_paused}
                aria-labelledby="pv-pause-label"
                aria-describedby="pv-pause-help"
                disabled={saving}
                onClick={togglePause}
              />
            </div>
            {saveError && (
              <div className="pv-alert pv-alert-error" role="alert" style={{ marginBlockStart: 12 }}>
                <span>{t(errorKey(saveError))}</span>
                <button type="button" className="pv-btn" onClick={togglePause}>
                  {t('privacy.retry')}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <p className="pv-sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAuditLogs } from './api';
import { errorKey, formatDateTime, formatRelative } from './i18n-privacy';

const KNOWN_ACTIONS = ['created', 'updated', 'verified', 'flagged', 'deleted', 'paused', 'resumed'];

export default function AuditLogTimeline() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'en';

  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await getAuditLogs(100);
      setEvents(Array.isArray(data) ? data : []);
      setStatus('ready');
    } catch (err) {
      setError(err.code);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(fetchData);
  }, [fetchData]);

  function load() {
    setStatus('loading');
    fetchData();
  }

  const actionLabel = (action) =>
    KNOWN_ACTIONS.includes(action) ? t(`privacy.audit.actions.${action}`) : action;

  return (
    <section aria-labelledby="pv-audit-heading">
      <div className="pv-event-head" style={{ alignItems: 'center' }}>
        <h2 id="pv-audit-heading">{t('privacy.audit.heading')}</h2>
        <button type="button" className="pv-btn" onClick={load} disabled={status === 'loading'}>
          {t('privacy.audit.refresh')}
        </button>
      </div>
      <p>{t('privacy.audit.intro')}</p>

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

      {status === 'ready' && events.length === 0 && (
        <div className="pv-state">
          <h3>{t('privacy.audit.emptyTitle')}</h3>
          <p>{t('privacy.audit.emptyText')}</p>
        </div>
      )}

      {status === 'ready' && events.length > 0 && (
        <ol className="pv-timeline">
          {events.map((event) => {
            const open = openId === event.id;
            const detailsId = `pv-event-${event.id}`;
            return (
              <li key={event.id} className="pv-event" data-action={event.action_type}>
                <div className="pv-event-head">
                  <span className="pv-event-title">{actionLabel(event.action_type)}</span>
                  <time dateTime={event.created_at_utc} title={formatDateTime(event.created_at_utc, locale)}>
                    {formatRelative(event.created_at_utc, locale)}
                  </time>
                </div>
                {event.memory_statement && <div dir="auto">{event.memory_statement}</div>}
                <button
                  type="button"
                  className="pv-details-btn"
                  aria-expanded={open}
                  aria-controls={detailsId}
                  onClick={() => setOpenId(open ? null : event.id)}
                >
                  {open ? t('privacy.audit.hideDetails') : t('privacy.audit.showDetails')}
                  <span className="pv-sr-only">: {actionLabel(event.action_type)}</span>
                </button>
                {open && (
                  <dl id={detailsId} className="pv-event-details">
                    <dt>{t('privacy.audit.eventId', { id: event.id })}</dt>
                    <dd>{actionLabel(event.action_type)}</dd>
                    <dt>{t('privacy.audit.timeLabel')}</dt>
                    <dd>{formatDateTime(event.created_at_utc, locale)}</dd>
                    <dt>{t('privacy.audit.memoryRef')}</dt>
                    <dd>{event.memory_statement ?? t('privacy.audit.memoryGone')}</dd>
                    {event.details && (
                      <>
                        <dt>{t('privacy.audit.detailsLabel')}</dt>
                        <dd dir="auto">{event.details}</dd>
                      </>
                    )}
                  </dl>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

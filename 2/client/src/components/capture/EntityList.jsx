import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../lib/api';

function languageName(code, uiLang) {
  return new Intl.DisplayNames([uiLang], { type: 'language' }).of(code) ?? code;
}

function relativeTime(iso, lang) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  return new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }).format(minutes, 'minute');
}

/**
 * Entity chips + Wikipedia context (GET /api/enrich). The first entity loads
 * automatically; the others load when selected. Every non-ideal state has
 * its own message: loading, not found, ambiguous, timeout (retry),
 * error (retry), offline (waits and reloads when the connection returns).
 * Faris can reuse this on the memory detail view: <EntityList entities={[...]} />.
 */
export default function EntityList({ entities }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const panelId = useId();
  const headingId = useId();
  const [selected, setSelected] = useState(null);
  const [state, setState] = useState({ status: 'idle' });
  const requestRef = useRef(null);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // The chosen chip, or the first entity while the sentence changes.
  const active = entities?.includes(selected) ? selected : (entities?.[0] ?? null);

  const load = useCallback(
    async (term) => {
      requestRef.current?.abort();
      if (!term) return setState({ status: 'idle' });
      if (!navigator.onLine) return setState({ status: 'offline', term });
      const controller = new AbortController();
      requestRef.current = controller;
      setState({ status: 'loading', term });
      try {
        const data = await apiFetch(`/api/enrich?term=${encodeURIComponent(term)}&lang=${lang}`, {
          timeoutMs: 7000,
          signal: controller.signal,
        });
        setState({ status: data.status, term, data });
      } catch (err) {
        if (controller.signal.aborted) return undefined; // replaced by a newer request
        if (err.code === 'notFound') setState({ status: 'not_found', term });
        else if (err.code === 'timeout') setState({ status: 'timeout', term });
        else if (!navigator.onLine) setState({ status: 'offline', term });
        else setState({ status: 'error', term });
      }
      return undefined;
    },
    [lang],
  );

  // Debounced so we don't call Wikipedia on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => load(active), 600);
    return () => clearTimeout(id);
  }, [active, load]);

  // Going offline cancels the lookup; back online reloads what the user was looking at.
  useEffect(() => {
    const up = () => {
      if (stateRef.current.status === 'offline') load(stateRef.current.term);
    };
    const down = () => {
      if (stateRef.current.status === 'loading') {
        requestRef.current?.abort();
        setState({ status: 'offline', term: stateRef.current.term });
      }
    };
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, [load]);

  useEffect(() => () => requestRef.current?.abort(), []);

  if (!entities?.length) return null;
  const { status, term, data } = state;

  return (
    <div className="entities">
      <h3 id={headingId}>{t('capture.entitiesLabel')}</h3>
      <p className="muted small">{t('enrich.chipsHelp')}</p>
      <ul className="entity-chips" aria-labelledby={headingId}>
        {entities.map((name) => (
          <li key={name}>
            <button
              type="button"
              className="entity-chip"
              aria-pressed={active === name}
              aria-controls={panelId}
              aria-label={t('enrich.showContext', { term: name })}
              onClick={() => setSelected(name)}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>

      <section id={panelId} className={`context-panel is-${status}`} aria-live="polite" aria-busy={status === 'loading'}>
        <h4 className="context-title">{t('enrich.title')}</h4>

        {status === 'loading' && (
          <div className="context-loading">
            <p>{t('enrich.loading', { term })}</p>
            <div className="skeleton" aria-hidden="true"><span /><span /><span /></div>
          </div>
        )}

        {(status === 'found' || status === 'ambiguous') && (
          <article className="context-body" lang={data.lang} dir={data.dir}>
            {data.thumbnail && <img src={data.thumbnail} alt="" width="72" height="72" loading="lazy" />}
            <div>
              <p className="context-name">{data.title}</p>
              {data.description && <p className="context-description">{data.description}</p>}
              {status === 'ambiguous' ? <p lang={lang}>{t('enrich.ambiguous', { term })}</p> : <p>{data.extract}</p>}
            </div>
          </article>
        )}
        {(status === 'found' || status === 'ambiguous') && (
          <div className="context-meta muted small">
            {data.fallback && <p>{t('enrich.fallback')}</p>}
            <p>
              {t('enrich.meta', {
                source: t('enrich.source', { language: languageName(data.lang, lang) }),
                fetched: t('enrich.fetched', { time: relativeTime(data.fetchedAt, lang) }),
              })}
            </p>
            {data.url && (
              <a href={data.url} target="_blank" rel="noopener noreferrer">
                {t('enrich.readMore')} <span className="sr-only">{t('enrich.newTab')}</span>
              </a>
            )}
          </div>
        )}

        {status === 'not_found' && <p className="context-empty">{t('enrich.notFound', { term })}</p>}

        {(status === 'timeout' || status === 'error') && (
          <div className="context-error" role="alert">
            <p>{t(`enrich.${status}`)}</p>
            <button type="button" className="secondary-button" onClick={() => load(term)}>
              {t('enrich.retry')}
            </button>
          </div>
        )}

        {status === 'offline' && <p className="context-offline">{t('enrich.offline')}</p>}
      </section>
    </div>
  );
}

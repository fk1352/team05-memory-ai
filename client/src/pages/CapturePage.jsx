import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { extractMemory, MAX_STATEMENT } from '../lib/extractMemory';
import PreviewCard from '../components/capture/PreviewCard';
import EntityList from '../components/capture/EntityList';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import '../components/capture/capture.css';

/** D1 "Add memory" / Real-Time Capture: type → preview → correct → save (POST /api/memories). */
export default function CapturePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const online = useOnlineStatus();
  const ids = { input: useId(), hint: useId(), count: useId(), error: useId(), preview: useId() };
  const inputRef = useRef(null);
  const previewRef = useRef(null);

  const [text, setText] = useState('');
  const [draft, setDraft] = useState(null); // extracted + user corrections
  const [inputError, setInputError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [save, setSave] = useState({ status: 'idle' }); // idle | saving | saved | error

  useEffect(() => {
    document.title = t('app.pageTitle', { page: t('pages.input') });
  }, [t]);

  // Real-time extraction while typing (debounced so the preview doesn't flicker).
  useEffect(() => {
    const id = setTimeout(() => {
      setDraft(extractMemory(text));
    }, 250);
    return () => clearTimeout(id);
  }, [text]);

  const remaining = MAX_STATEMENT - text.length;

  function onExtract(e) {
    e.preventDefault();
    const result = extractMemory(text);
    if (!result) {
      setInputError('capture.errors.statementRequired');
      inputRef.current.focus();
      return;
    }
    setInputError('');
    setDraft(result);
    setAnnouncement(
      t('capture.previewUpdated', { type: t(`capture.type.${result.memory_type}`), category: t(`categories.${result.category}`) }),
    );
    previewRef.current?.focus();
  }

  function onClear() {
    setText('');
    setDraft(null);
    setInputError('');
    setSave({ status: 'idle' });
    inputRef.current.focus();
  }

  async function onSave() {
    if (!draft?.statement.trim()) {
      setInputError('capture.errors.statementRequired');
      inputRef.current.focus();
      return;
    }
    setSave({ status: 'saving' });
    const today = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium' }).format(new Date());
    try {
      const memory = await apiFetch('/api/memories', {
        method: 'POST',
        body: {
          user_id: user.id,
          statement: draft.statement,
          category: draft.category,
          memory_type: draft.memory_type,
          confidence_score: draft.confidence_score,
          source_info: t('capture.sourceInfo', { date: today }),
          rationale: draft.reasons.map((r) => t(r.key, r.values)).join(' '),
        },
      });
      setSave({ status: 'saved', memory });
      setText('');
      setDraft(null);
    } catch (err) {
      const code = ['paused', 'network', 'validation'].includes(err.code) ? err.code : 'server';
      setSave({ status: 'error', code });
    }
  }

  const statusRef = useRef(null);
  useEffect(() => {
    if (save.status === 'saved' || save.status === 'error') statusRef.current?.focus();
  }, [save.status]);

  const describedBy = useMemo(
    () => [ids.hint, ids.count, inputError && ids.error].filter(Boolean).join(' '),
    [ids.hint, ids.count, ids.error, inputError],
  );

  return (
    <section className="capture" aria-labelledby="capture-title">
      <h1 id="capture-title">{t('capture.title')}</h1>
      <p className="muted">{t('capture.subtitle')}</p>

      {save.status === 'saved' && (
        <div ref={statusRef} tabIndex={-1} role="status" className="notice success">
          <h2>{t('capture.success.title')}</h2>
          <p>
            {t('capture.success.body', {
              type: t(`capture.type.${save.memory.memory_type}`),
              category: t(`categories.${save.memory.category}`),
            })}
          </p>
          <p className="saved-statement">{t('capture.success.quoted', { text: save.memory.statement })}</p>
          <button type="button" className="secondary-button" onClick={onClear}>{t('capture.success.another')}</button>
        </div>
      )}

      {save.status === 'error' && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="notice error">
          <p>{t(`capture.errors.${save.code}`)}</p>
          {save.code === 'paused' ? (
            <Link to="/privacy">{t('capture.errors.pausedLink')}</Link>
          ) : (
            <button type="button" className="secondary-button" onClick={onSave}>{t('capture.retry')}</button>
          )}
        </div>
      )}

      <form className="card capture-form" onSubmit={onExtract} noValidate>
        <label htmlFor={ids.input} className="field-label">{t('capture.inputLabel')}</label>
        <p id={ids.hint} className="muted small">{t('capture.inputHint')}</p>
        <textarea
          ref={inputRef}
          id={ids.input}
          rows={3}
          maxLength={MAX_STATEMENT}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (save.status !== 'saving') setSave({ status: 'idle' });
          }}
          placeholder={t('capture.inputPlaceholder')}
          aria-invalid={!!inputError}
          aria-describedby={describedBy}
        />
        <div className="input-meta">
          {inputError ? <p id={ids.error} className="field-error">{t(inputError)}</p> : <span />}
          <p id={ids.count} className={`muted small ${remaining < 20 ? 'warn' : ''}`}>
            {t('capture.charsLeft', { count: remaining })}
          </p>
        </div>

        <div className="examples">
          <span className="muted small">{t('capture.examplesLabel')}</span>
          {['example1', 'example2', 'example3'].map((key) => (
            <button key={key} type="button" className="chip" onClick={() => setText(t(`capture.${key}`))}>
              {t(`capture.${key}`)}
            </button>
          ))}
        </div>

        <div className="actions">
          <button type="submit" className="primary-button">{t('capture.extract')}</button>
          <button type="button" className="secondary-button" onClick={onClear}>{t('capture.clear')}</button>
        </div>
      </form>

      <section className="card preview" aria-labelledby={ids.preview} ref={previewRef} tabIndex={-1}>
        <h2 id={ids.preview}>{t('capture.previewTitle')}</h2>
        {draft ? (
          <>
            <PreviewCard draft={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}>
              <EntityList entities={draft.entities} />
            </PreviewCard>
            <button
              type="button"
              className="primary-button save-button"
              onClick={onSave}
              disabled={save.status === 'saving' || !online}
              aria-busy={save.status === 'saving'}
              aria-describedby={online ? undefined : 'offline-save-hint'}
            >
              {save.status === 'saving' ? t('capture.saving') : t('capture.save')}
            </button>
            {!online && <p id="offline-save-hint" className="muted small">{t('offline.banner')}</p>}
          </>
        ) : (
          <p className="empty">{t('capture.previewEmpty')}</p>
        )}
      </section>

      <p role="status" aria-live="polite" className="sr-only">{announcement}</p>
    </section>
  );
}

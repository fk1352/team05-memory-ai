import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteMemories, getMemories } from './api';
import { errorKey, formatConfidence } from './i18n-privacy';

const PREVIEW_LIMIT = 5;

function ConfirmDeleteModal({ memories, busy, onCancel, onConfirm }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const count = memories.length;
  const hidden = count - PREVIEW_LIMIT;

  useEffect(() => {
    const opener = document.activeElement;
    cancelRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  function onKeyDown(event) {
    if (event.key === 'Escape' && !busy) {
      event.stopPropagation();
      onCancel();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = dialogRef.current.querySelectorAll('button:not([disabled])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="pv-backdrop" onKeyDown={onKeyDown}>
      <div
        ref={dialogRef}
        className="pv-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="pv-modal-title"
        aria-describedby="pv-modal-body"
      >
        <h3 id="pv-modal-title">{t('privacy.modal.title', { count })}</h3>
        <p id="pv-modal-body">{t('privacy.modal.body')}</p>
        <ul>
          {memories.slice(0, PREVIEW_LIMIT).map((m) => (
            <li key={m.id} dir="auto">{m.statement}</li>
          ))}
          {hidden > 0 && <li>{t('privacy.modal.more', { count: hidden })}</li>}
        </ul>
        <div className="pv-modal-actions">
          <button ref={cancelRef} type="button" className="pv-btn" onClick={onCancel} disabled={busy}>
            {t('privacy.modal.cancel')}
          </button>
          <button type="button" className="pv-btn pv-btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? t('privacy.modal.deleting') : t('privacy.modal.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SelectiveForgetting() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'en';

  const [memories, setMemories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await getMemories();
      setMemories(Array.isArray(data) ? data : []);
      setSelected((prev) => new Set([...prev].filter((id) => data.some((m) => m.id === id))));
      setStatus('ready');
    } catch (err) {
      setLoadError(err.code);
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

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  const collator = new Intl.Collator(locale, { sensitivity: 'base' });
  const sorted = [...memories].sort((a, b) => collator.compare(a.category, b.category) || collator.compare(a.statement, b.statement));
  const selectedMemories = sorted.filter((m) => selected.has(m.id));
  const allSelected = memories.length > 0 && selected.size === memories.length;
  const count = selected.size;

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(memories.map((m) => m.id)));
  }

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteMemories([...selected]);
      const gone = new Set(result.ids);
      setMemories((prev) => prev.filter((m) => !gone.has(m.id)));
      setSelected(new Set());
      setConfirming(false);
      setToast(result.deleted);
    } catch (err) {
      setConfirming(false);
      setDeleteError(err.code);
      if (err.code === 'notFound') load();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section aria-labelledby="pv-forget-heading">
      <h2 id="pv-forget-heading">{t('privacy.forget.heading')}</h2>
      <p>{t('privacy.forget.intro')}</p>

      {deleteError && (
        <div className="pv-alert pv-alert-error" role="alert">
          <span>
            <strong>{t('privacy.result.failedTitle')}</strong>
            {t(errorKey(deleteError))}
          </span>
          {deleteError !== 'notFound' && (
            <button type="button" className="pv-btn" onClick={() => setConfirming(true)} disabled={count === 0}>
              {t('privacy.retry')}
            </button>
          )}
        </div>
      )}

      {status === 'loading' && (
        <div className="pv-state" role="status">
          {t('privacy.loading')}
        </div>
      )}

      {status === 'error' && (
        <div className="pv-alert pv-alert-error" role="alert">
          <span>{t(errorKey(loadError))}</span>
          <button type="button" className="pv-btn" onClick={load}>
            {t('privacy.retry')}
          </button>
        </div>
      )}

      {status === 'ready' && memories.length === 0 && (
        <div className="pv-state">
          <h3>{t('privacy.forget.emptyTitle')}</h3>
          <p>{t('privacy.forget.emptyText')}</p>
        </div>
      )}

      {status === 'ready' && memories.length > 0 && (
        <>
          <div className="pv-toolbar">
            <label className="pv-check-label">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              {t('privacy.forget.selectAll')}
            </label>
            <span aria-live="polite" aria-atomic="true">
              {t('privacy.forget.selectedCount', { count })}
            </span>
            <div className="pv-toolbar-actions">
              {count > 0 && (
                <button type="button" className="pv-btn" onClick={() => setSelected(new Set())}>
                  {t('privacy.forget.clear')}
                </button>
              )}
              <button
                type="button"
                className="pv-btn pv-btn-danger"
                disabled={count === 0}
                onClick={() => {
                  setDeleteError(null);
                  setConfirming(true);
                }}
              >
                {t('privacy.forget.deleteSelected')}
              </button>
            </div>
          </div>

          <ul className="pv-list" aria-label={t('privacy.forget.listLabel')}>
            {sorted.map((m) => (
              <li key={m.id} className="pv-item">
                <label>
                  <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggle(m.id)} />
                  <span className="pv-item-body">
                    <span dir="auto">{m.statement}</span>
                    <span className="pv-meta">
                      <span className={`pv-badge pv-badge-${m.memory_type}`}>
                        {m.memory_type === 'fact' ? t('privacy.forget.typeFact') : t('privacy.forget.typeInference')}
                      </span>
                      <span>{t(`privacy.categories.${m.category}`, { defaultValue: m.category })}</span>
                      <span>· {t('privacy.forget.confidence', { value: formatConfidence(m.confidence_score, locale) })}</span>
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}

      {confirming && (
        <ConfirmDeleteModal
          memories={selectedMemories}
          busy={deleting}
          onCancel={() => setConfirming(false)}
          onConfirm={confirmDelete}
        />
      )}

      <div className="pv-toast" role="status" aria-live="polite">
        {toast !== null && (
          <div className="pv-alert pv-alert-success">
            <span>{t('privacy.result.success', { count: toast })}</span>
            <button type="button" className="pv-btn" onClick={() => setToast(null)} aria-label={t('privacy.result.dismiss')}>
              ×
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORIES, MAX_STATEMENT } from '../../lib/extractMemory';

/**
 * Extracted Fact / Inference card from D1. Everything the extractor guessed
 * can be corrected here before saving: text, category and type.
 * `children` is where the entity context (Wikipedia) panel plugs in.
 */
export default function PreviewCard({ draft, onChange, children }) {
  const { t, i18n } = useTranslation();
  const ids = { statement: useId(), category: useId(), typeHelp: useId() };
  const percent = new Intl.NumberFormat(i18n.resolvedLanguage, { style: 'percent', maximumFractionDigits: 0 });
  const isFact = draft.memory_type === 'fact';

  return (
    <div className={`preview-card ${isFact ? 'is-fact' : 'is-inference'}`}>
      <div className="preview-badges">
        <span className="type-badge">{t(`capture.type.${draft.memory_type}`)}</span>
        {!isFact && <span className="confidence">{t('capture.confidence', { value: percent.format(draft.confidence_score) })}</span>}
      </div>

      <label htmlFor={ids.statement}>{t('capture.statementLabel')}</label>
      <input
        id={ids.statement}
        type="text"
        maxLength={MAX_STATEMENT}
        value={draft.statement}
        onChange={(e) => onChange({ statement: e.target.value })}
      />

      <div className="preview-row">
        <div>
          <label htmlFor={ids.category}>{t('capture.categoryLabel')}</label>
          <select id={ids.category} value={draft.category} onChange={(e) => onChange({ category: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`categories.${c}`)}</option>
            ))}
          </select>
        </div>

        <fieldset aria-describedby={ids.typeHelp}>
          <legend>{t('capture.typeLegend')}</legend>
          <div className="segmented">
            {['fact', 'inference'].map((type) => (
              <label key={type} className="segment">
                <input
                  type="radio"
                  name={`${ids.category}-type`}
                  value={type}
                  checked={draft.memory_type === type}
                  onChange={() => onChange({ memory_type: type, confidence_score: type === 'fact' ? 1 : Math.min(draft.confidence_score, 0.75) })}
                />
                <span>{t(`capture.type.${type}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <p id={ids.typeHelp} className="muted small">{t(`capture.typeHelp.${draft.memory_type}`)}</p>

      <details className="why">
        <summary>{t('capture.whyTitle')}</summary>
        <ul>
          {draft.reasons.map((r) => (
            <li key={r.key}>{t(r.key, r.values)}</li>
          ))}
        </ul>
      </details>

      {children}
    </div>
  );
}

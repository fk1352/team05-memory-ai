import { useTranslation } from 'react-i18next';

/** Names and topics found in the sentence (Wikipedia context is added in #9). */
export default function EntityList({ entities }) {
  const { t } = useTranslation();
  if (!entities?.length) return null;
  return (
    <div className="entities">
      <h3>{t('capture.entitiesLabel')}</h3>
      <ul className="entity-chips">
        {entities.map((name) => (
          <li key={name} className="entity-chip">{name}</li>
        ))}
      </ul>
    </div>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../privacy/i18n-privacy';
import '../privacy/privacy.css';
import PrivacyDashboard from '../privacy/PrivacyDashboard';
import SelectiveForgetting from '../privacy/SelectiveForgetting';
import AuditLogTimeline from '../privacy/AuditLogTimeline';

const SECTIONS = ['dashboard', 'forget', 'audit'];

export default function PrivacyPage({ userId = 1 }) {
  const { t } = useTranslation();
  const [section, setSection] = useState('dashboard');

  return (
    <div className="pv">
      <nav aria-label={t('privacy.sectionsLabel')}>
        <ul className="pv-tabs">
          {SECTIONS.map((key) => (
            <li key={key}>
              <button
                type="button"
                className="pv-tab"
                aria-current={section === key ? 'page' : undefined}
                onClick={() => setSection(key)}
              >
                {t(`privacy.sections.${key}`)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {section === 'dashboard' && <PrivacyDashboard userId={userId} onNavigate={setSection} />}
      {section === 'forget' && <SelectiveForgetting />}
      {section === 'audit' && <AuditLogTimeline />}
    </div>
  );
}

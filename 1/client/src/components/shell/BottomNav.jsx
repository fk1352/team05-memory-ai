import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { InputIcon, MapIcon, SearchIcon, ShieldIcon } from './Icons';

// The 4 tabs from D1. Labels reuse the keys from Faris's i18n setup.
const TABS = [
  { to: '/map', labelKey: 'mapTab', Icon: MapIcon },
  { to: '/search', labelKey: 'searchTab', Icon: SearchIcon },
  { to: '/input', labelKey: 'inputTab', Icon: InputIcon },
  { to: '/privacy', labelKey: 'privacyTab', Icon: ShieldIcon },
];

/** Bottom tab bar on phones, side rail on wider screens. NavLink adds aria-current="page". */
export default function BottomNav() {
  const { t } = useTranslation();
  return (
    <nav className="bottom-nav" aria-label={t('nav.label')}>
      <ul>
        {TABS.map(({ to, labelKey, Icon }) => (
          <li key={to}>
            <NavLink to={to}>
              <span className="tab-icon"><Icon /></span>
              <span>{t(labelKey)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { InputIcon, MapIcon, SearchIcon, ShieldIcon } from './Icons';

// The 4 tabs from D1 (labels use Faris's nav.* keys).
const TABS = [
  { to: '/map', labelKey: 'nav.map', Icon: MapIcon },
  { to: '/search', labelKey: 'nav.search', Icon: SearchIcon },
  { to: '/input', labelKey: 'nav.input', Icon: InputIcon },
  { to: '/privacy', labelKey: 'nav.privacy', Icon: ShieldIcon },
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

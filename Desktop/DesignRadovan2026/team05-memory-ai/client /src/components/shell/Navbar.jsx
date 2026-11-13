import { useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LocaleSwitcher from './LocaleSwitcher';
import UserMenu from './UserMenu';
import { BookmarkIcon, BrainIcon, HomeIcon, SearchIcon } from './Icons';

/** Top bar from D1: app icon · search · home · saved · language · account. */
export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const searchId = useId();

  function onSearch(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  return (
    <header className="navbar">
      <Link to="/map" className="icon-link brand" aria-label={t('header.brandLabel')}>
        <BrainIcon />
      </Link>

      <form role="search" className="header-search" onSubmit={onSearch}>
        <label htmlFor={searchId} className="sr-only">{t('header.searchLabel')}</label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
        />
        <button type="submit" aria-label={t('header.searchSubmit')}>
          <SearchIcon />
        </button>
      </form>

      <div className="navbar-actions">
        <Link to="/map" className="icon-link hide-mobile" aria-label={t('header.home')}>
          <HomeIcon />
        </Link>
        <Link to="/search?saved=1" className="icon-link" aria-label={t('header.saved')}>
          <BookmarkIcon />
        </Link>
        <LocaleSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}

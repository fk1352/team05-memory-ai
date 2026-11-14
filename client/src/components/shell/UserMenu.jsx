import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const initials = (name) => name.split(/\s+/).slice(0, 2).map((p) => p[0].toLocaleUpperCase()).join('');

/** Account button + dropdown. Escape or clicking outside closes it. */
export default function UserMenu() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onClick);
    };
  }, [open]);

  if (!user) {
    return <Link to="/login" className="signin-link">{t('user.signIn')}</Link>;
  }

  const unread = user.unreadNotifications ?? 0;

  function handleLogout() {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div ref={wrapperRef} className="user-menu">
      <button
        ref={buttonRef}
        type="button"
        className="avatar-button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true" className="avatar">{initials(user.name)}</span>
        {unread > 0 && (
          <span aria-hidden="true" className="badge">
            {new Intl.NumberFormat(i18n.resolvedLanguage).format(unread)}
          </span>
        )}
        {/* Name comes from content (not aria-label), so the unread count is read too */}
        <span className="sr-only">{t('user.menuButton', { name: user.name })}</span>
        {unread > 0 && <span className="sr-only"> {t('notifications.unread', { count: unread })}</span>}
      </button>

      <div id={menuId} hidden={!open} className="user-dropdown">
        <p className="user-name">{user.name}</p>
        <p className="user-email">{user.email}</p>
        {unread > 0 && <p className="user-unread">{t('notifications.unread', { count: unread })}</p>}
        <button type="button" className="menu-item" onClick={handleLogout}>{t('user.signOut')}</button>
      </div>
    </div>
  );
}

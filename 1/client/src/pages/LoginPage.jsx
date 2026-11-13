import { useEffect, useId, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { DEMO_CREDENTIALS, DEMO_ENABLED } from '../context/demoAuth';
import LocaleSwitcher from '../components/shell/LocaleSwitcher';
import { BrainIcon } from '../components/shell/Icons';
import '../components/shell/shell.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** D1 "Sign in" screen. */
export default function LoginPage() {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const ids = { email: useId(), password: useId(), emailErr: useId(), passwordErr: useId(), remember: useId() };
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [email, setEmail] = useState(DEMO_ENABLED ? DEMO_CREDENTIALS.email : '');
  const [password, setPassword] = useState(DEMO_ENABLED ? DEMO_CREDENTIALS.password : '');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = t('app.pageTitle', { page: t('pages.login') });
  }, [t]);

  if (user) return <Navigate to="/map" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');
    const found = {};
    if (!email.trim()) found.email = 'auth.errors.emailRequired';
    else if (!EMAIL_RE.test(email.trim())) found.email = 'auth.errors.emailInvalid';
    if (!password) found.password = 'auth.errors.passwordRequired';
    setErrors(found);
    if (found.email) return emailRef.current.focus();
    if (found.password) return passwordRef.current.focus();

    setSubmitting(true);
    try {
      await login({ email, password, remember });
      navigate('/map', { replace: true });
    } catch {
      setFormError('auth.errors.invalidCredentials');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <header className="auth-header">
        <span className="auth-brand"><BrainIcon /> {t('app.name')}</span>
        <LocaleSwitcher />
      </header>

      <main id="main" className="auth-card">
        <h1>{t('auth.title')}</h1>
        <p className="muted">{t('auth.subtitle')}</p>

        {formError && <p role="alert" className="form-error">{t(formError)}</p>}

        <form noValidate onSubmit={onSubmit}>
          <label htmlFor={ids.email}>{t('auth.email')}</label>
          <input
            ref={emailRef}
            id={ids.email}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? ids.emailErr : undefined}
          />
          {errors.email && <p id={ids.emailErr} className="field-error">{t(errors.email)}</p>}

          <label htmlFor={ids.password}>{t('auth.password')}</label>
          <div className="password-row">
            <input
              ref={passwordRef}
              id={ids.password}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? ids.passwordErr : undefined}
            />
            <button type="button" className="text-button" aria-pressed={showPassword} onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            </button>
          </div>
          {errors.password && <p id={ids.passwordErr} className="field-error">{t(errors.password)}</p>}

          <div className="checkbox-row">
            <input id={ids.remember} type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <label htmlFor={ids.remember}>{t('auth.remember')}</label>
          </div>

          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? t('auth.submitting') : t('auth.submit')}
          </button>
        </form>

        {DEMO_ENABLED && <p className="demo-hint">{t('auth.demoHint', DEMO_CREDENTIALS)}</p>}
      </main>
    </div>
  );
}

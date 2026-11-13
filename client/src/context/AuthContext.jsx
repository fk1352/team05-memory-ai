import { createContext, useContext, useState } from 'react';
import { DEMO_CREDENTIALS, DEMO_ENABLED, DEMO_USER } from './demoAuth';

const AuthContext = createContext(null);
const SESSION_KEY = 'amm.session';

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);

  /** Resolves with the user, or throws Error('invalidCredentials'). */
  async function login({ email, password, remember }) {
    const ok =
      DEMO_ENABLED &&
      email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password;
    if (!ok) throw new Error('invalidCredentials');
    try {
      (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(DEMO_USER));
    } catch {
      /* ignore */
    }
    setUser(DEMO_USER);
    return DEMO_USER;
  }

  function logout() {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

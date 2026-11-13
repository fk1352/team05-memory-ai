// TEMPORARY until the server has POST /api/auth/login:
// with VITE_DEMO_AUTH=true (see .env.example) the seed user can sign in.
// Only the public profile is ever stored, never the password.
export const DEMO_ENABLED = import.meta.env.VITE_DEMO_AUTH === 'true';
export const DEMO_CREDENTIALS = { email: 'tyra@team05.test', password: 'memory-demo-2026' };
export const DEMO_USER = { id: 1, name: 'Tyra Vladić', email: DEMO_CREDENTIALS.email, unreadNotifications: 12 };

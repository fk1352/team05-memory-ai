const BASE = '/api';
const TIMEOUT_MS = 8000;

export class ApiError extends Error {
  constructor(code, status) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

async function request(path, options = {}) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new ApiError('offline', 0);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      signal: controller.signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(data?.error || (res.status >= 500 ? 'network' : 'server'), res.status);
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === 'AbortError') throw new ApiError('timeout', 0);
    throw new ApiError('network', 0);
  } finally {
    clearTimeout(timer);
  }
}

export const getMemories = () => request('/memories');

export const deleteMemories = (ids) =>
  request('/memories', { method: 'DELETE', body: JSON.stringify({ ids }) });

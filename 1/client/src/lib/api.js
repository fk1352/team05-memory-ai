// Small fetch wrapper: tells "server said no" (ApiError) apart from
// "server unreachable / offline / too slow" (NetworkError, TimeoutError).
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error ?? `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.error ?? 'server';
    this.body = body;
  }
}
export class NetworkError extends Error {
  constructor() {
    super('network');
    this.name = 'NetworkError';
    this.code = 'network';
  }
}
export class TimeoutError extends Error {
  constructor() {
    super('timeout');
    this.name = 'TimeoutError';
    this.code = 'timeout';
  }
}

export async function apiFetch(path, { method = 'GET', body, timeoutMs = 8000, signal } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), timeoutMs);
  signal?.addEventListener('abort', () => controller.abort('cancelled'));
  let res;
  try {
    res = await fetch(path, {
      method,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (controller.signal.reason === 'timeout') throw new TimeoutError();
    if (controller.signal.reason === 'cancelled') throw err;
    throw new NetworkError();
  } finally {
    clearTimeout(timer);
  }
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // An HTML page back (e.g. dev proxy with the API not running) = server unreachable
    throw new NetworkError();
  }
  if (!res.ok) {
    // The Vite dev proxy answers 500/502/504 when the API process is down
    if ([502, 503, 504].includes(res.status) && !data?.error) throw new NetworkError();
    throw new ApiError(res.status, data);
  }
  return data;
}

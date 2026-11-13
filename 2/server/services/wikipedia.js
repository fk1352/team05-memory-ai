// Wikipedia REST API (page/summary) with a 10-minute in-memory cache.
// Docs: https://en.wikipedia.org/api/rest_v1/#/Page%20content/get_page_summary__title_
// No API key is needed. Wikimedia asks for a descriptive User-Agent.

const SUPPORTED_LANGS = ['en', 'hr', 'de'];
const DEFAULT_BASE = 'https://{lang}.wikipedia.org/api/rest_v1/page/summary';
const MAX_TERM = 100;
const MAX_EXTRACT = 600;

class EnrichError extends Error {
  constructor(code) {
    super(code);
    this.name = 'EnrichError';
    this.code = code; // 'timeout' | 'upstream' | 'rateLimited'
  }
}

/** Works with the .env value whether it has {lang} or a fixed "en." host. */
function summaryUrl(base, lang, title) {
  const root = base.includes('{lang}') ? base.replace('{lang}', lang) : base.replace(/^https:\/\/[a-z-]+\./, `https://${lang}.`);
  return `${root.replace(/\/$/, '')}/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}

function normaliseTerm(raw) {
  return String(raw ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * Croatian nouns change their ending ("u Zagrebu", "u Barcelonu"), but the
 * article is under the base form. Try a few likely base forms, in order.
 */
function candidatesFor(term, lang) {
  const list = [term];
  if (lang === 'hr' && term.length > 4) {
    const stem1 = term.slice(0, -1);
    const stem2 = term.slice(0, -2);
    if (/u$/.test(term)) list.push(stem1, `${stem1}a`); // Zagrebu → Zagreb, Barcelonu → Barcelona
    if (/i$/.test(term)) list.push(`${stem1}a`, stem1); // Splitu/Rijeci-ish forms
    if (/(om|em)$/.test(term)) list.push(stem2); // Zagrebom → Zagreb
    if (/e$/.test(term)) list.push(`${stem1}a`); // Barcelone → Barcelona
  }
  return [...new Set(list)].slice(0, 3);
}

function shorten(text) {
  if (!text || text.length <= MAX_EXTRACT) return text ?? '';
  const cut = text.slice(0, MAX_EXTRACT);
  const lastStop = cut.lastIndexOf('. ');
  return `${lastStop > 200 ? cut.slice(0, lastStop + 1) : cut.trimEnd()}…`;
}

function createEnricher({
  fetchImpl = globalThis.fetch,
  base = process.env.WIKIPEDIA_API_BASE || DEFAULT_BASE,
  ttlMs = Number(process.env.ENRICH_CACHE_TTL_MS) || 10 * 60 * 1000,
  timeoutMs = Number(process.env.ENRICH_TIMEOUT_MS) || 4000,
  userAgent = process.env.WIKIPEDIA_USER_AGENT || 'Team05MemoryAI/1.0 (ISTE-260 student project)',
  maxEntries = 500,
  now = () => Date.now(),
} = {}) {
  const cache = new Map(); // key → { expires, value }
  let upstreamCalls = 0;

  async function fetchSummary(lang, title) {
    upstreamCalls += 1;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res;
    try {
      res = await fetchImpl(summaryUrl(base, lang, title), {
        headers: { Accept: 'application/json', 'User-Agent': userAgent, 'Api-User-Agent': userAgent },
        signal: controller.signal,
        redirect: 'follow',
      });
    } catch {
      throw new EnrichError(controller.signal.aborted ? 'timeout' : 'upstream');
    } finally {
      clearTimeout(timer);
    }
    if (res.status === 404) return null;
    if (res.status === 429) throw new EnrichError('rateLimited');
    if (!res.ok) throw new EnrichError('upstream');
    let data;
    try {
      data = await res.json();
    } catch {
      throw new EnrichError('upstream');
    }
    return data;
  }

  function toPayload(data, term, lang, fallback) {
    return {
      status: data.type === 'disambiguation' ? 'ambiguous' : 'found',
      term,
      lang: data.lang || lang,
      dir: data.dir || 'ltr',
      title: data.title,
      description: data.description ?? null,
      extract: shorten(data.extract),
      thumbnail: data.thumbnail?.source ?? null,
      url: data.content_urls?.desktop?.page ?? null,
      fallback,
      fetchedAt: new Date(now()).toISOString(),
    };
  }

  /** @returns {Promise<{ value: object, cache: 'HIT'|'MISS' }>} value.status: found | ambiguous | not_found */
  async function lookup(rawTerm, rawLang) {
    const term = normaliseTerm(rawTerm);
    const lang = SUPPORTED_LANGS.includes(rawLang) ? rawLang : 'en';
    const key = `${lang}:${term.toLocaleLowerCase()}`;

    const hit = cache.get(key);
    if (hit && hit.expires > now()) return { value: hit.value, cache: 'HIT' };
    if (hit) cache.delete(key);

    let value = null;
    for (const title of candidatesFor(term, lang)) {
      const data = await fetchSummary(lang, title); // errors bubble up and are NOT cached
      if (data) {
        value = toPayload(data, term, lang, false);
        break;
      }
    }
    // Nothing in the user's language → try English once, and say so in the UI.
    if (!value && lang !== 'en') {
      const data = await fetchSummary('en', term);
      if (data) value = toPayload(data, term, 'en', true);
    }
    if (!value) value = { status: 'not_found', term, lang, fetchedAt: new Date(now()).toISOString() };

    if (cache.size >= maxEntries) cache.delete(cache.keys().next().value); // drop oldest
    cache.set(key, { expires: now() + ttlMs, value });
    return { value, cache: 'MISS' };
  }

  return {
    lookup,
    stats: () => ({ entries: cache.size, upstreamCalls }),
    clear: () => cache.clear(),
  };
}

module.exports = { createEnricher, EnrichError, candidatesFor, summaryUrl, SUPPORTED_LANGS, MAX_TERM };

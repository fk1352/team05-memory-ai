const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createEnricher, candidatesFor, summaryUrl } = require('../services/wikipedia');
const { createApp } = require('../app');
const { open } = require('../db');

// Shape of a real page/summary response (trimmed).
const ZAGREB_HR = {
  type: 'standard',
  title: 'Zagreb',
  description: 'glavni grad Republike Hrvatske',
  extract: 'Zagreb je glavni i najveći grad Republike Hrvatske.',
  lang: 'hr',
  dir: 'ltr',
  thumbnail: { source: 'https://upload.wikimedia.org/zagreb.jpg', width: 320, height: 213 },
  content_urls: { desktop: { page: 'https://hr.wikipedia.org/wiki/Zagreb' } },
};

const json = (status, body) => ({ status, ok: status >= 200 && status < 300, json: async () => body });

/** Fake fetch: answers from a {url: response} table and records calls. */
function fakeFetch(table) {
  const calls = [];
  const fn = async (url, opts) => {
    calls.push(url);
    const entry = table[url];
    if (typeof entry === 'function') return entry(opts);
    return entry ?? json(404, { type: 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found' });
  };
  fn.calls = calls;
  return fn;
}

const BASE = 'https://{lang}.wikipedia.org/api/rest_v1/page/summary';
const url = (lang, t) => summaryUrl(BASE, lang, t);

test('builds the localized URL, also from the old fixed-en .env value', () => {
  assert.equal(url('hr', 'New York'), 'https://hr.wikipedia.org/api/rest_v1/page/summary/New_York');
  assert.equal(
    summaryUrl('https://en.wikipedia.org/api/rest_v1/page/summary', 'de', 'Köln'),
    'https://de.wikipedia.org/api/rest_v1/page/summary/K%C3%B6ln',
  );
});

test('Croatian case endings: "Zagrebu" finds the "Zagreb" article', async () => {
  assert.deepEqual(candidatesFor('Zagrebu', 'hr'), ['Zagrebu', 'Zagreb', 'Zagreba']);
  const fetchImpl = fakeFetch({ [url('hr', 'Zagreb')]: json(200, ZAGREB_HR) });
  const { value } = await createEnricher({ fetchImpl, base: BASE }).lookup('Zagrebu', 'hr');
  assert.equal(value.status, 'found');
  assert.equal(value.title, 'Zagreb');
  assert.equal(value.lang, 'hr');
  assert.equal(value.url, 'https://hr.wikipedia.org/wiki/Zagreb');
});

test('second lookup within 10 minutes is served from cache; after TTL it refetches', async () => {
  let clock = 0;
  const fetchImpl = fakeFetch({ [url('hr', 'Zagreb')]: json(200, ZAGREB_HR) });
  const enricher = createEnricher({ fetchImpl, base: BASE, now: () => clock });
  assert.equal((await enricher.lookup('Zagreb', 'hr')).cache, 'MISS');
  clock += 9 * 60 * 1000;
  assert.equal((await enricher.lookup('  zagreb ', 'hr')).cache, 'HIT');
  assert.equal(fetchImpl.calls.length, 1);
  clock += 2 * 60 * 1000; // now 11 minutes
  assert.equal((await enricher.lookup('Zagreb', 'hr')).cache, 'MISS');
  assert.equal(fetchImpl.calls.length, 2);
});

test('not found in hr → falls back to English and flags it', async () => {
  const fetchImpl = fakeFetch({
    [url('en', 'Barcelona')]: json(200, { ...ZAGREB_HR, title: 'Barcelona', lang: 'en', description: 'City in Spain' }),
  });
  const { value } = await createEnricher({ fetchImpl, base: BASE }).lookup('Barcelona', 'hr');
  assert.equal(value.status, 'found');
  assert.equal(value.lang, 'en');
  assert.equal(value.fallback, true);
});

test('nothing anywhere → not_found (and that result is cached too)', async () => {
  const fetchImpl = fakeFetch({});
  const enricher = createEnricher({ fetchImpl, base: BASE });
  assert.equal((await enricher.lookup('Xqzzt', 'de')).value.status, 'not_found');
  const before = fetchImpl.calls.length;
  assert.equal((await enricher.lookup('Xqzzt', 'de')).cache, 'HIT');
  assert.equal(fetchImpl.calls.length, before);
});

test('timeout, 5xx and 429 become error codes and are NOT cached', async () => {
  const slow = (opts) =>
    new Promise((_, reject) => opts.signal.addEventListener('abort', () => reject(opts.signal.reason)));
  for (const [response, code] of [[slow, 'timeout'], [json(503, {}), 'upstream'], [json(429, {}), 'rateLimited']]) {
    const fetchImpl = fakeFetch({ [url('en', 'Coffee')]: response });
    const enricher = createEnricher({ fetchImpl, base: BASE, timeoutMs: 50 });
    await assert.rejects(enricher.lookup('Coffee', 'en'), { code });
    assert.equal(enricher.stats().entries, 0);
  }
});

test('network failure (DNS / offline server) → upstream', async () => {
  const fetchImpl = async () => {
    throw new TypeError('fetch failed');
  };
  await assert.rejects(createEnricher({ fetchImpl, base: BASE }).lookup('Coffee', 'en'), { code: 'upstream' });
});

test('GET /api/enrich maps results to HTTP statuses', async () => {
  const db = open(':memory:');
  await db.ready;
  const fetchImpl = fakeFetch({
    [url('hr', 'Zagreb')]: json(200, ZAGREB_HR),
    [url('en', 'Slow')]: json(502, {}),
  });
  const server = createApp(db, { enricher: createEnricher({ fetchImpl, base: BASE }) }).listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api/enrich`;
  try {
    let res = await fetch(`${base}?term=Zagreb&lang=hr`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('x-cache'), 'MISS');
    assert.equal((await res.json()).description, 'glavni grad Republike Hrvatske');
    res = await fetch(`${base}?term=Zagreb&lang=hr`);
    assert.equal(res.headers.get('x-cache'), 'HIT');

    res = await fetch(`${base}?term=Nope&lang=en`);
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { error: 'notFound', term: 'Nope', lang: 'en' });

    res = await fetch(`${base}?term=Slow&lang=en`);
    assert.equal(res.status, 502);
    assert.deepEqual(await res.json(), { error: 'upstream' });

    res = await fetch(`${base}?term=`);
    assert.equal(res.status, 400);
    res = await fetch(`${base}?term=${'x'.repeat(101)}`);
    assert.deepEqual(await res.json(), { error: 'termTooLong' });

    res = await fetch(`${base}?term=Zagreb&lang=xx`); // unknown lang → en
    assert.equal(res.status, 404);
  } finally {
    server.close();
    await db.close();
  }
});

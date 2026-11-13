// GET /api/enrich?term=Zagreb&lang=hr — Wikipedia context for an entity.
const express = require('express');
const { EnrichError, MAX_TERM } = require('../services/wikipedia');

const STATUS_FOR = { timeout: 504, upstream: 502, rateLimited: 503 };

function enrichRouter(enricher) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    const term = String(req.query.term ?? '').trim();
    if (!term) return res.status(400).json({ error: 'termRequired' });
    if (term.length > MAX_TERM) return res.status(400).json({ error: 'termTooLong' });

    try {
      const { value, cache } = await enricher.lookup(term, String(req.query.lang ?? 'en'));
      res.set('X-Cache', cache);
      if (value.status === 'not_found') return res.status(404).json({ error: 'notFound', term: value.term, lang: value.lang });
      res.set('Cache-Control', 'private, max-age=600');
      return res.json(value);
    } catch (err) {
      if (err instanceof EnrichError) return res.status(STATUS_FOR[err.code]).json({ error: err.code });
      return next(err);
    }
  });

  return router;
}

module.exports = { enrichRouter };

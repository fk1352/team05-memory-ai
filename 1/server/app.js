// Express app factory (separate from index.js so tests can use an in-memory DB).
const express = require('express');
const cors = require('cors');
const { memoriesRouter } = require('./routes/memories');

function createApp(db) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '20kb' }));

  // Basic test route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', message: 'Memory AI backend is running!' });
  });

  app.use('/api/memories', memoriesRouter(db));

  // Unknown /api route → JSON 404 (not Express's HTML page)
  app.use('/api', (req, res) => res.status(404).json({ error: 'notFound' }));

  // Last-resort error handler: log details, send only a code to the client.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'invalidJson' });
    console.error(err);
    return res.status(500).json({ error: 'server' });
  });

  return app;
}

module.exports = { createApp };

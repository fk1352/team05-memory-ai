const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { privacyRouter } = require('./routes/privacy');
const { wrap } = require('./db');
const { memoriesRouter } = require('./routes/memories');
const { enrichRouter } = require('./routes/enrich');
const { createEnricher } = require('./services/wikipedia');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'db', 'memory_ai.sqlite');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initDb();
  }
});

function initDb() {
  const schemaPath = path.join(__dirname, 'db', 'schema.sql');
  const seedPath = path.join(__dirname, 'db', 'seed.sql');

  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema, (err) => {
      if (err) console.error('Schema error:', err.message);
      db.get('SELECT COUNT(*) as count FROM memories', (err, row) => {
        if (!err && row && row.count === 0 && fs.existsSync(seedPath)) {
          const seed = fs.readFileSync(seedPath, 'utf8');
          db.exec(seed, (seedErr) => {
            if (seedErr) console.error('Seed error:', seedErr.message);
            else console.log('Seeded database successfully.');
          });
        }
      });
    });
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Memory AI backend is running!' });
});

// GET all memories with optional filters
app.get('/api/memories', (req, res) => {
  const { category, type, minConfidence, q } = req.query;
  let sql = 'SELECT * FROM memories WHERE 1=1';
  const params = [];

  if (category && category !== 'all') {
    sql += ' AND LOWER(category) = LOWER(?)';
    params.push(category);
  }
  if (type && type !== 'all') {
    sql += ' AND LOWER(memory_type) = LOWER(?)';
    params.push(type);
  }
  if (minConfidence) {
    const rawMin = Number(minConfidence);
    const normMin = rawMin > 1 ? rawMin / 100 : rawMin;
    sql += ' AND confidence_score >= ?';
    params.push(normMin);
  }
  if (q) {
    sql += ' AND (LOWER(statement) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?))';
    params.push(`%${q}%`, `%${q}%`);
  }

  sql += ' ORDER BY confidence_score DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// PUT update a memory (Edit Form / Verify / Flag as Incorrect)
app.put('/api/memories/:id', (req, res) => {
  const { id } = req.params;
  const { category, statement, memory_type, confidence_score, source_info } = req.body;
  const nowUtc = new Date().toISOString();
  const normConf =
    confidence_score !== undefined && confidence_score !== null
      ? Number(confidence_score) > 1
        ? Number(confidence_score) / 100
        : Number(confidence_score)
      : null;

  const sql = `
    UPDATE memories
    SET category = COALESCE(?, category),
        statement = COALESCE(?, statement),
        memory_type = COALESCE(?, memory_type),
        confidence_score = COALESCE(?, confidence_score),
        source_info = COALESCE(?, source_info),
        verified_at_utc = ?
    WHERE id = ?
  `;

  db.run(sql, [category, statement, memory_type, normConf, source_info, nowUtc, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run(
      `INSERT INTO audit_logs (memory_id, action_type, details, created_at_utc) VALUES (?, 'updated', ?, ?)`,
      [id, `Updated memory: ${statement}`, nowUtc]
    );
    res.json({ updated: this.changes, id: Number(id) });
  });
});

// Routes from the feature branches, all on the same SQLite connection:
//   POST /api/memories   → Tyra (routes/memories.js: validation, pause check, audit row)
//   GET  /api/enrich     → Tyra (routes/enrich.js + services/wikipedia.js, 10-min cache)
//   DELETE, audit logs, settings → Yusif (routes/privacy.js)
app.use('/api/memories', memoriesRouter(wrap(db)));
app.use('/api/enrich', enrichRouter(createEnricher()));
app.use('/api', privacyRouter(db));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
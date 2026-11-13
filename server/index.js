const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

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
    sql += ' AND confidence_score >= ?';
    params.push(Number(minConfidence));
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

  db.run(sql, [category, statement, memory_type, confidence_score, source_info, nowUtc, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run(
      `INSERT INTO audit_logs (memory_id, action_type, details, created_at_utc) VALUES (?, 'UPDATE', ?, ?)`,
      [id, `Updated memory: ${statement}`, nowUtc]
    );
    res.json({ updated: this.changes, id: Number(id) });
  });
});
// POST create a new memory (Tyra's Memory Capture & Extraction flow)
app.post('/api/memories', (req, res) => {
  const { user_id = 1, category = 'Work', statement, memory_type = 'fact', confidence_score = 90, source_info = 'Manual Input' } = req.body;
  if (!statement || !statement.trim()) {
    return res.status(400).json({ error: 'Memory statement is required' });
  }
  const nowUtc = new Date().toISOString();
  const sql = `INSERT INTO memories (user_id, category, statement, memory_type, confidence_score, source_info, created_at_utc, verified_at_utc) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [user_id, category, statement.trim(), memory_type, confidence_score, source_info, nowUtc, nowUtc], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    const newId = this.lastID;
    db.run(`INSERT INTO audit_logs (memory_id, action_type, details, created_at_utc) VALUES (?, 'CREATE', ?, ?)`, [newId, `Created memory: ${statement.trim()}`, nowUtc]);
    res.status(201).json({ id: newId, user_id, category, statement: statement.trim(), memory_type, confidence_score, source_info, created_at_utc: nowUtc });
  });
});

// Mount Tyra's Wikipedia enrichment route if present, plus built-in fallback
if (fs.existsSync(path.join(__dirname, 'routes', 'enrich.js'))) {
  try {
    app.use('/api/enrich', require('./routes/enrich'));
  } catch (e) {
    console.warn('Using fallback enrich endpoint:', e.message);
  }
}

app.get('/api/enrich', async (req, res) => {
  const topic = req.query.topic || req.query.q || 'Zagreb';
  const lang = (req.query.lang || 'en').slice(0, 2);
  try {
    const response = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
    if (!response.ok) return res.status(response.status).json({ error: 'Topic not found on Wikipedia' });
    const data = await response.json();
    res.json({ title: data.title, extract: data.extract, url: data.content_urls?.desktop?.page || '', thumbnail: data.thumbnail?.source || null });
  } catch (err) {
    res.status(503).json({ error: 'Wikipedia service unavailable' });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
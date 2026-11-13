// POST /api/memories — save a memory captured on the Input screen.
// (GET / PUT belong to Faris, DELETE to Yusif; they mount on the same router.)
const express = require('express');

const CATEGORIES = ['work', 'food', 'location', 'hobbies', 'travel', 'preferences', 'health'];
const TYPES = ['fact', 'inference'];
const MAX_STATEMENT = 280;
const MAX_TEXT = 500;

// Errors are machine-readable codes; the client translates them (no English in the UI).
function validate(body) {
  const errors = {};
  const statement = typeof body.statement === 'string' ? body.statement.trim() : '';
  if (!statement) errors.statement = 'required';
  else if (statement.length > MAX_STATEMENT) errors.statement = 'tooLong';

  if (!CATEGORIES.includes(body.category)) errors.category = 'invalid';
  if (!TYPES.includes(body.memory_type)) errors.memory_type = 'invalid';

  const confidence = body.confidence_score === undefined ? 1 : Number(body.confidence_score);
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) errors.confidence_score = 'outOfRange';

  for (const field of ['source_info', 'rationale']) {
    if (body[field] != null && (typeof body[field] !== 'string' || body[field].length > MAX_TEXT)) errors[field] = 'invalid';
  }

  const userId = Number(body.user_id ?? 1);
  if (!Number.isInteger(userId) || userId < 1) errors.user_id = 'invalid';

  return {
    errors,
    value: {
      user_id: userId,
      category: body.category,
      statement,
      memory_type: body.memory_type,
      confidence_score: body.memory_type === 'fact' ? 1 : confidence,
      source_info: body.source_info?.trim() || null,
      rationale: body.rationale?.trim() || null,
    },
  };
}

function memoriesRouter(db) {
  const router = express.Router();

  router.post('/', async (req, res, next) => {
    const { errors, value } = validate(req.body ?? {});
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'validation', fields: errors });
    }

    try {
      const user = await db.get('SELECT id, memory_paused FROM users WHERE id = ?', [value.user_id]);
      if (!user) return res.status(404).json({ error: 'userNotFound' });
      // Respect the "Pause memory saving" toggle from the Privacy dashboard.
      if (user.memory_paused) return res.status(403).json({ error: 'paused' });

      // Fact = user said it → verified now. Inference = AI guess → unverified.
      const verifiedAt = value.memory_type === 'fact' ? new Date().toISOString().replace(/\.\d{3}Z$/, 'Z') : null;

      await db.exec('BEGIN');
      const { lastID } = await db.run(
        `INSERT INTO memories
           (user_id, category, statement, memory_type, confidence_score, source_info, rationale, verified_at_utc)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [value.user_id, value.category, value.statement, value.memory_type, value.confidence_score,
          value.source_info, value.rationale, verifiedAt],
      );
      await db.run('INSERT INTO audit_logs (memory_id, action_type, details) VALUES (?, ?, ?)', [
        lastID,
        'created',
        `Captured on Input screen (${value.memory_type}, ${Math.round(value.confidence_score * 100)}%)`,
      ]);
      await db.exec('COMMIT');

      const memory = await db.get('SELECT * FROM memories WHERE id = ?', [lastID]);
      return res.status(201).location(`/api/memories/${lastID}`).json(memory);
    } catch (err) {
      await db.exec('ROLLBACK').catch(() => {});
      return next(err);
    }
  });

  return router;
}

module.exports = { memoriesRouter, validate, CATEGORIES, MAX_STATEMENT };

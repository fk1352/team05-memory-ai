const express = require('express');

function promisify(db) {
  return {
    run: (sql, params = []) =>
      new Promise((resolve, reject) =>
        db.run(sql, params, function onRun(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        }),
      ),
    get: (sql, params = []) =>
      new Promise((resolve, reject) => db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)))),
    all: (sql, params = []) =>
      new Promise((resolve, reject) => db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows || [])))),
    exec: (sql) => new Promise((resolve, reject) => db.exec(sql, (err) => (err ? reject(err) : resolve()))),
  };
}

const nowUtc = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function privacyRouter(rawDb) {
  const db = promisify(rawDb);
  const router = express.Router();

  async function deleteMemories(ids) {
    const placeholders = ids.map(() => '?').join(', ');
    const found = await db.all(`SELECT id, statement FROM memories WHERE id IN (${placeholders})`, ids);
    if (!found.length) return { deleted: [], notFound: ids };

    await db.exec('BEGIN');
    try {
      for (const memory of found) {
        await db.run(
          'INSERT INTO audit_logs (memory_id, action_type, details, created_at_utc) VALUES (?, ?, ?, ?)',
          [memory.id, 'deleted', `User deleted memory: "${memory.statement}"`, nowUtc()],
        );
        await db.run('DELETE FROM memories WHERE id = ?', [memory.id]);
      }
      await db.exec('COMMIT');
    } catch (err) {
      await db.exec('ROLLBACK').catch(() => {});
      throw err;
    }

    const deleted = found.map((m) => m.id);
    return { deleted, notFound: ids.filter((id) => !deleted.includes(id)) };
  }

  router.delete('/memories/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalidId' });
    try {
      const result = await deleteMemories([id]);
      if (!result.deleted.length) return res.status(404).json({ error: 'notFound' });
      return res.json({ deleted: 1, ids: result.deleted });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'server' });
    }
  });

  router.delete('/memories', async (req, res) => {
    const raw = req.body?.ids;
    if (!Array.isArray(raw) || raw.length === 0 || raw.length > 100) {
      return res.status(400).json({ error: 'validation', fields: { ids: 'invalid' } });
    }
    const ids = [...new Set(raw.map(parseId))];
    if (ids.includes(null)) return res.status(400).json({ error: 'invalidId' });

    try {
      const result = await deleteMemories(ids);
      if (!result.deleted.length) return res.status(404).json({ error: 'notFound' });
      return res.json({ deleted: result.deleted.length, ids: result.deleted, notFound: result.notFound });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'server' });
    }
  });

  return router;
}

module.exports = { privacyRouter };

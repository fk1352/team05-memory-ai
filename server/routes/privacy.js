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

  router.get('/audit-logs', async (req, res) => {
    const limit = Math.min(parseId(req.query.limit) || 50, 200);
    const memoryId = req.query.memory_id ? parseId(req.query.memory_id) : null;
    if (req.query.memory_id && !memoryId) return res.status(400).json({ error: 'invalidId' });

    let sql = `
      SELECT a.id, a.memory_id, a.action_type, a.details, a.created_at_utc,
             m.statement AS memory_statement, m.category AS memory_category
      FROM audit_logs a
      LEFT JOIN memories m ON m.id = a.memory_id`;
    const params = [];
    if (memoryId) {
      sql += ' WHERE a.memory_id = ?';
      params.push(memoryId);
    }
    sql += ' ORDER BY a.id DESC LIMIT ?';
    params.push(limit);

    try {
      return res.json(await db.all(sql, params));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'server' });
    }
  });

  const readUser = (id) => db.get('SELECT id, full_name, locale_pref, memory_paused FROM users WHERE id = ?', [id]);
  const toJson = (user) => ({ ...user, memory_paused: Boolean(user.memory_paused) });

  router.get('/users/settings', async (req, res) => {
    const userId = parseId(req.query.user_id ?? 1);
    if (!userId) return res.status(400).json({ error: 'invalidId' });
    try {
      const user = await readUser(userId);
      if (!user) return res.status(404).json({ error: 'userNotFound' });
      return res.json(toJson(user));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'server' });
    }
  });

  router.patch('/users/settings', async (req, res) => {
    const body = req.body ?? {};
    const userId = parseId(body.user_id ?? 1);
    if (!userId) return res.status(400).json({ error: 'invalidId' });

    const fields = {};
    if (body.memory_paused !== undefined) {
      if (typeof body.memory_paused !== 'boolean') {
        return res.status(400).json({ error: 'validation', fields: { memory_paused: 'invalid' } });
      }
      fields.memory_paused = body.memory_paused ? 1 : 0;
    }
    if (body.locale_pref !== undefined) {
      if (!['en', 'hr', 'de'].includes(body.locale_pref)) {
        return res.status(400).json({ error: 'validation', fields: { locale_pref: 'invalid' } });
      }
      fields.locale_pref = body.locale_pref;
    }
    if (!Object.keys(fields).length) return res.status(400).json({ error: 'nothingToUpdate' });

    try {
      const user = await readUser(userId);
      if (!user) return res.status(404).json({ error: 'userNotFound' });

      await db.exec('BEGIN');
      const sets = Object.keys(fields).map((key) => `${key} = ?`).join(', ');
      await db.run(`UPDATE users SET ${sets} WHERE id = ?`, [...Object.values(fields), userId]);
      if (fields.memory_paused !== undefined && fields.memory_paused !== user.memory_paused) {
        const action = fields.memory_paused ? 'paused' : 'resumed';
        await db.run(
          'INSERT INTO audit_logs (memory_id, action_type, details, created_at_utc) VALUES (NULL, ?, ?, ?)',
          [action, `User ${userId} ${action} memory saving`, nowUtc()],
        );
      }
      await db.exec('COMMIT');

      return res.json(toJson(await readUser(userId)));
    } catch (err) {
      await db.exec('ROLLBACK').catch(() => {});
      console.error(err);
      return res.status(500).json({ error: 'server' });
    }
  });

  return router;
}

module.exports = { privacyRouter };

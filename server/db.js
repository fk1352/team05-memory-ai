// SQLite connection + first-run setup.
// On first start (no `memories` table yet) it runs Yusif's schema.sql and
// seed.sql, so a fresh clone has realistic data. After that the file on disk
// is the source of truth and survives restarts.
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');

const SERVER_DIR = __dirname;
const REPO_ROOT = path.resolve(SERVER_DIR, '../../../..');

function resolveDbPath() {
  const fromEnv = process.env.DB_PATH;
  if (fromEnv === ':memory:') return fromEnv;
  if (!fromEnv) return path.join(SERVER_DIR, 'db', 'memory_ai.sqlite');
  // .env.example uses ./server/db/… relative to the project folder
  return path.isAbsolute(fromEnv) ? fromEnv : path.resolve(SERVER_DIR, '..', fromEnv);
}

// schema.sql / seed.sql currently live in the repo-root server/db folder
// (and schema is committed as "schema.sql."). Look in both places until the
// team moves everything into one project folder.
function findSqlFile(name) {
  const dirs = [process.env.SQL_DIR, path.join(SERVER_DIR, 'db'), path.join(REPO_ROOT, 'server', 'db')].filter(Boolean);
  for (const dir of dirs) {
    for (const candidate of [name, `${name}.`]) {
      const file = path.join(dir, candidate);
      if (fs.existsSync(file)) return file;
    }
  }
  throw new Error(`Could not find ${name} in ${dirs.join(', ')}`);
}

function open(dbPath = resolveDbPath()) {
  if (dbPath !== ':memory:') fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const raw = new sqlite3.Database(dbPath);
  const db = wrap(raw);
  db.ready = (async () => {
    await db.exec('PRAGMA foreign_keys = ON;');
    const table = await db.get("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'memories'");
    if (!table) {
      await db.exec(fs.readFileSync(findSqlFile('schema.sql'), 'utf8'));
      await db.exec(fs.readFileSync(findSqlFile('seed.sql'), 'utf8'));
      console.log('Database created from schema.sql + seed.sql');
    }
    return db;
  })();
  return db;
}

/** Promise helpers around a plain sqlite3 connection (index.js shares one connection). */
function wrap(raw) {
  return {
    raw,
    run: (sql, params = []) =>
      new Promise((resolve, reject) =>
        raw.run(sql, params, function onRun(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        }),
      ),
    get: (sql, params = []) =>
      new Promise((resolve, reject) => raw.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)))),
    all: (sql, params = []) =>
      new Promise((resolve, reject) => raw.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))),
    exec: (sql) => new Promise((resolve, reject) => raw.exec(sql, (err) => (err ? reject(err) : resolve()))),
    close: () => new Promise((resolve) => raw.close(() => resolve())),
  };
}

module.exports = { open, wrap, resolveDbPath };

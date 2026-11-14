const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const PORT = 5099;
const BASE = `http://localhost:${PORT}/api`;
const DB_PATH = path.join(os.tmpdir(), `memory_ai_test_${process.pid}.sqlite`);
let server;

function startServer() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['index.js'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: String(PORT), DB_PATH },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const timer = setTimeout(() => reject(new Error('server did not start')), 10000);
    child.stdout.on('data', async (chunk) => {
      if (!String(chunk).includes('running')) return;
      for (let i = 0; i < 50; i += 1) {
        try {
          const res = await fetch(`${BASE}/memories`);
          if (res.ok && (await res.json()).length > 0) {
            clearTimeout(timer);
            return resolve(child);
          }
        } catch {
          /* not ready yet */
        }
        await new Promise((r) => setTimeout(r, 100));
      }
    });
    child.on('error', reject);
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (!server || server.exitCode !== null) return resolve();
    server.once('exit', resolve);
    server.kill();
  });
}

const api = async (method, url, body) => {
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};

const latestLog = async () => (await api('GET', '/audit-logs?limit=1')).body[0];

before(async () => {
  fs.rmSync(DB_PATH, { force: true });
  server = await startServer();
});

after(async () => {
  await stopServer();
  fs.rmSync(DB_PATH, { force: true });
});

test('seed data loads with UTF-8 text intact', async () => {
  const { body } = await api('GET', '/memories');
  assert.equal(body.length, 10);
  assert.ok(body.some((m) => m.statement === 'Omiljena hrana: Ćevapi i štrukli'));
  assert.ok(body.some((m) => m.statement.includes('Straßenbahn')));
  assert.ok(body.some((m) => m.statement === 'تفضل القهوة العربية في الصباح'));
});

test('CREATE: POST /api/memories writes a "created" audit entry', async () => {
  const res = await api('POST', '/memories', {
    user_id: 1, category: 'hobbies', statement: 'Igra šah nedjeljom', memory_type: 'fact', confidence_score: 1,
  });
  assert.equal(res.status, 201, `POST failed: ${JSON.stringify(res.body)}`);
  const log = await latestLog();
  assert.equal(log.action_type, 'created');
  assert.equal(log.memory_id, res.body.id);
});

test('UPDATE: PUT /api/memories/:id writes an "updated" audit entry', async () => {
  const res = await api('PUT', '/memories/2', { statement: 'Likes morning meetings' });
  assert.equal(res.status, 200);
  const log = await latestLog();
  assert.equal(log.action_type, 'updated');
  assert.equal(log.memory_id, 2);
});

test('DELETE: deleting a memory writes "deleted" and the entry survives the deletion', async () => {
  const res = await api('DELETE', '/memories', { ids: [4] });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.ids, [4]);
  const log = await latestLog();
  assert.equal(log.action_type, 'deleted');
  assert.equal(log.memory_id, null);
  assert.match(log.details, /Trešnjevka/);
  const again = await api('DELETE', '/memories/4');
  assert.equal(again.status, 404);
});

test('SETTINGS: pausing memory saving writes "paused"', async () => {
  const res = await api('PATCH', '/users/settings', { user_id: 1, memory_paused: true });
  assert.equal(res.status, 200);
  assert.equal(res.body.memory_paused, true);
  assert.equal((await latestLog()).action_type, 'paused');
  await api('PATCH', '/users/settings', { user_id: 1, memory_paused: false });
  assert.equal((await latestLog()).action_type, 'resumed');
});

test('PERSISTENCE (F2): data survives a server restart', async () => {
  await stopServer();
  server = await startServer();
  const { body } = await api('GET', '/memories');
  assert.ok(!body.some((m) => m.id === 4), 'deleted memory came back after restart');
  const logs = (await api('GET', '/audit-logs?limit=200')).body;
  assert.ok(logs.some((l) => l.action_type === 'deleted' && /Trešnjevka/.test(l.details)));
});

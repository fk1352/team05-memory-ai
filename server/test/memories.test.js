const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { open } = require('../db');
const { createApp } = require('../app');

let db;
let server;
let base;

before(async () => {
  db = open(':memory:');
  await db.ready;
  server = createApp(db).listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  server.close();
  await db.close();
});

const post = (body) =>
  fetch(`${base}/api/memories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('creates a memory, keeps UTF-8 and writes an audit log', async () => {
  const res = await post({
    statement: 'Imam jutarnje sastanke od 9 do 11 u Zagrebu — čćđšž',
    category: 'work',
    memory_type: 'fact',
    source_info: 'Input screen',
    user_id: 1,
  });
  assert.equal(res.status, 201);
  const memory = await res.json();
  assert.equal(memory.statement, 'Imam jutarnje sastanke od 9 do 11 u Zagrebu — čćđšž');
  assert.equal(memory.confidence_score, 1);
  assert.match(memory.verified_at_utc, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  const log = await db.get('SELECT * FROM audit_logs WHERE memory_id = ?', [memory.id]);
  assert.equal(log.action_type, 'created');
});

test('inference keeps its confidence and stays unverified', async () => {
  const res = await post({ statement: 'Probably likes coffee', category: 'food', memory_type: 'inference', confidence_score: 0.7 });
  assert.equal(res.status, 201);
  const memory = await res.json();
  assert.equal(memory.confidence_score, 0.7);
  assert.equal(memory.verified_at_utc, null);
});

test('rejects invalid input with field codes', async () => {
  const res = await post({ statement: '   ', category: 'nope', memory_type: 'guess', confidence_score: 3 });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), {
    error: 'validation',
    fields: { statement: 'required', category: 'invalid', memory_type: 'invalid', confidence_score: 'outOfRange' },
  });
});

test('respects paused memory saving (seed user 3)', async () => {
  const res = await post({ statement: 'Test', category: 'food', memory_type: 'fact', user_id: 3 });
  assert.equal(res.status, 403);
  assert.deepEqual(await res.json(), { error: 'paused' });
});

test('broken JSON gets a 400 code, not a crash', async () => {
  const res = await fetch(`${base}/api/memories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{oops' });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'invalidJson' });
});

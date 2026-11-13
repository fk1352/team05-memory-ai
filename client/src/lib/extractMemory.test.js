// Run with: npm test (node --test, no extra libraries)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractMemory } from './extractMemory.js';

test('the D2 example becomes a work fact with Zagreb as entity', () => {
  const m = extractMemory('I have morning meetings from 9 to 11 in Zagreb');
  assert.equal(m.category, 'work');
  assert.equal(m.memory_type, 'fact');
  assert.equal(m.confidence_score, 1);
  assert.deepEqual(m.entities, ['Zagreb']);
});

test('hedged sentence becomes an inference with lower confidence', () => {
  const m = extractMemory('I usually drink coffee before work');
  assert.equal(m.memory_type, 'inference');
  assert.equal(m.confidence_score, 0.8);
  assert.ok(m.entities.includes('coffee'));
});

test('Croatian with diacritics', () => {
  const m = extractMemory('možda ću ljeti putovati vlakom u Split');
  assert.equal(m.statement, 'Možda ću ljeti putovati vlakom u Split');
  assert.equal(m.category, 'travel');
  assert.equal(m.memory_type, 'inference');
  assert.deepEqual(m.entities, ['Split']);
});

test('German: nouns are capitalised but only names become entities', () => {
  const m = extractMemory('Ich fliege im Sommer nach Barcelona');
  assert.equal(m.category, 'travel');
  assert.equal(m.memory_type, 'fact');
  assert.deepEqual(m.entities, ['Barcelona']);
  assert.deepEqual(extractMemory('Ich habe Besprechungen von 9 bis 11 in Zagreb').entities, ['Zagreb']);
});

test('multi-word names stay together', () => {
  assert.deepEqual(extractMemory('My sister lives in New York').entities, ['New York']);
});

test('too short or empty → null (empty state)', () => {
  assert.equal(extractMemory(''), null);
  assert.equal(extractMemory('  hi '), null);
});

test('no first person and no hedge → inference at 60 %', () => {
  const m = extractMemory('Coffee after lunch');
  assert.equal(m.memory_type, 'inference');
  assert.equal(m.confidence_score, 0.6);
});

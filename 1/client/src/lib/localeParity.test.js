// Every locale file must have the same keys as English, and Croatian needs
// one / few / other for every plural.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const dir = new URL('../locales/', import.meta.url);
const PLURAL = /_(one|few|other)$/;
const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => (typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
const load = (lng, file) => JSON.parse(readFileSync(new URL(`${lng}/${file}`, dir), 'utf8'));

for (const file of readdirSync(new URL('en/', dir))) {
  const base = (keys) => [...new Set(keys.map((k) => k.replace(PLURAL, '')))].sort();
  const enKeys = flatten(load('en', file));
  for (const lng of ['hr', 'de']) {
    test(`${lng}/${file} has the same keys as en`, () => {
      assert.deepEqual(base(flatten(load(lng, file))), base(enKeys));
    });
  }
  test(`hr/${file} plurals have one/few/other`, () => {
    const keys = flatten(load('hr', file));
    for (const plural of new Set(keys.filter((k) => PLURAL.test(k)).map((k) => k.replace(PLURAL, '')))) {
      for (const form of ['one', 'few', 'other']) assert.ok(keys.includes(`${plural}_${form}`), `${plural}_${form}`);
    }
  });
}

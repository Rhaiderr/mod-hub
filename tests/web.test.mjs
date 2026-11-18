import test from 'node:test';
import assert from 'node:assert/strict';
import { mods, filterMods } from '../web/catalog.mjs';
import { readFileSync, existsSync } from 'node:fs';

test('catalog filters combine game, category and normalized search', () => {
  assert.equal(filterMods(mods).length, 3);
  assert.equal(filterMods(mods, {game:'ats'}).length, 2);
  assert.deepEqual(filterMods(mods, {game:'ats', category:'clima'}), []);
  assert.equal(filterMods(mods, {query:'  BRASILEIRO  '})[0].id, 'clima-real');
  assert.equal(filterMods(mods, {query:'quilometro'})[0].id, 'tire-wear');
  assert.deepEqual(filterMods(mods, {sort:'name'}).map(mod => mod.name), ['Clima Real','Tire Wear','Truck Dirt']);
  assert.equal(mods[0].id, 'tire-wear');
});
test('preview uses local assets and has no live download or payment destination', () => {
  for (const mod of mods) assert.ok(existsSync(new URL('../web/'+mod.image, import.meta.url)));
  const html = readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
  assert.ok(!/href="https?:/.test(html));
  assert.match(html, /PRÉVIA VISUAL/);
  assert.match(html, /aria-live="polite"/);
});

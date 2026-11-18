import test from 'node:test';
import assert from 'node:assert/strict';
import { mods, filterMods } from '../web/catalog.mjs';
import { readFileSync, existsSync } from 'node:fs';

test('catalog filters combine game, category and normalized search', () => {
  assert.equal(filterMods(mods).length, 4);
  assert.equal(filterMods(mods, {game:'ats'}).length, 2);
  assert.deepEqual(filterMods(mods, {game:'ats', category:'clima'}), []);
  assert.equal(filterMods(mods, {query:'  BRASILEIRO  '})[0].id, 'clima-real');
  assert.equal(filterMods(mods, {query:'quilometro'})[0].id, 'tire-wear');
  assert.deepEqual(filterMods(mods, {sort:'name'}).map(mod => mod.name), ['Carreta Guerra','Clima Real','Tire Wear','Truck Dirt']);
  assert.equal(mods[0].id, 'tire-wear');
});
test('preview uses local assets and has no live download or payment destination', () => {
  for (const mod of mods) assert.ok(existsSync(new URL('../web/'+mod.image, import.meta.url)));
  const html = readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
  assert.ok(!/href="https?:/.test(html));
  assert.match(html, /PRÉVIA VISUAL/);
  assert.match(html, /aria-live="polite"/);
});

test('Carreta Guerra is ETS2-only and previews Steam Workshop without a live link', () => {
  const [guerra] = filterMods(mods, {category:'carretas'});
  assert.equal(guerra.id, 'carreta-guerra');
  assert.deepEqual(guerra.games, ['ets2']);
  assert.equal(guerra.distribution, 'steam');
  assert.equal(filterMods(mods, {game:'ats', category:'carretas'}).length, 0);
  assert.equal(filterMods(mods, {query:'guerra'})[0], guerra);
  for (const mod of mods) {
    assert.equal(mod.url, undefined);
    assert.equal(mod.downloadUrl, undefined);
    assert.equal(mod.workshopUrl, undefined);
  }
});

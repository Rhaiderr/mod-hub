import test from 'node:test';
import assert from 'node:assert/strict';
import { detectLanguage, englishPage, englishAttributes, englishMods, ui } from '../web/i18n.mjs';
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


test('language detection respects preferred browser locale and saved choice', () => {
  assert.equal(detectLanguage(null, ['pt-BR', 'en-US']), 'pt-BR');
  assert.equal(detectLanguage(null, ['PT_br']), 'pt-BR');
  for (const languages of [[], ['en-US', 'pt-BR'], ['pt-PT'], ['pt'], ['es-ES']]) {
    assert.equal(detectLanguage(null, languages), 'en');
  }
  assert.equal(detectLanguage('en', ['pt-BR']), 'en');
  assert.equal(detectLanguage('pt-BR', ['en-US']), 'pt-BR');
  assert.equal(detectLanguage('invalid', ['pt-BR']), 'pt-BR');
});

test('English covers every mod, dynamic label and accessible attribute', () => {
  assert.deepEqual(Object.keys(englishMods).sort(), mods.map(mod => mod.id).sort());
  for (const mod of mods) {
    const translated = englishMods[mod.id];
    for (const key of ['label', 'alt', 'description', 'compatibility', 'installation']) {
      assert.ok(translated[key]?.length, `${mod.id}: ${key}`);
    }
    assert.equal(translated.requirements.length, mod.requirements.length);
    assert.ok(translated.requirements.every(value => value.length));
  }
  assert.deepEqual(Object.keys(ui.en), Object.keys(ui['pt-BR']));
  assert.equal(ui.en.results(1), '1 mod found.');
  assert.equal(ui.en.results(4), '4 mods found.');
  assert.match(ui.en.steamLabel('Guerra'), /Steam Workshop/);
  assert.ok(englishPage.length > 40);
  assert.ok(englishAttributes.some(([selector, attribute]) => selector === '#search' && attribute === 'placeholder'));
  const translated = mods.map(mod => ({...mod, ...englishMods[mod.id]}));
  assert.equal(filterMods(translated, {query:'blowouts', locale:'en'})[0].id, 'tire-wear');
  assert.equal(filterMods(translated, {game:'ats', category:'carretas', locale:'en'}).length, 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { detectLanguage, englishPage, englishAttributes, ui } from '../web/i18n.mjs';
import { fromCatalog, filterMods } from '../web/catalog.mjs';
import { readFileSync, existsSync } from 'node:fs';

const catalog = JSON.parse(readFileSync(new URL('../web/catalog.json', import.meta.url), 'utf8'));
const mods = fromCatalog(catalog);

test('catalog filters combine game, category and normalized search', () => {
  assert.equal(filterMods(mods).length, 5);
  assert.equal(filterMods(mods, {game:'ats'}).length, 3);
  assert.deepEqual(filterMods(mods, {game:'ats', category:'clima'}), []);
  assert.equal(filterMods(mods, {query:'  BRASILEIRO  '})[0].id, 'clima-real');
  assert.equal(filterMods(mods, {query:'quilometro'})[0].id, 'tire-wear');
  assert.deepEqual(filterMods(mods, {sort:'name'}).map(mod => mod.name), ['Brake Fade','Carreta Guerra','Clima Real','Tire Wear','Truck Dirt']);
  assert.deepEqual(mods.map(mod => mod.id), ['truck-dirt', 'brake-fade', 'tire-wear', 'carreta-guerra', 'clima-real']);
});
test('public site uses local artwork and accessible status', () => {
  for (const mod of mods) assert.ok(existsSync(new URL('../web/'+mod.image, import.meta.url)));
  const html = readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
  const support = 'https://buymeacoffee.com/leonardoarouck';
  const external = Array.from(html.matchAll(/href="(https?:[^"]+)"/g), match => match[1]);
  assert.deepEqual(external.sort(), [support, support, 'https://github.com/Rhaiderr'].sort());
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${id}"`));
  assert.doesNotMatch(html, /PRÉVIA VISUAL/);
  assert.match(html, /aria-live="polite"/);
});

test('Carreta Guerra is ETS2-only and links to its Steam Workshop item', () => {
  const [guerra] = filterMods(mods, {category:'carretas'});
  assert.equal(guerra.id, 'carreta-guerra');
  assert.deepEqual(guerra.games, ['ets2']);
  assert.equal(guerra.distribution, 'steam');
  assert.equal(filterMods(mods, {game:'ats', category:'carretas'}).length, 0);
  assert.equal(filterMods(mods, {query:'guerra'})[0], guerra);
  assert.equal(guerra.workshopUrl, 'https://steamcommunity.com/sharedfiles/filedetails/?id=3841679426');
  assert.equal(guerra.downloadUrl, undefined);
  assert.ok(mods.filter(mod => mod !== guerra).every(mod => !mod.workshopUrl));
});


test('public mod downloads and README links come from the published catalog', () => {
  const publicMods = mods.filter(mod => mod.downloadUrl);
  assert.deepEqual(publicMods.map(mod => mod.id), ['truck-dirt', 'brake-fade', 'tire-wear', 'clima-real']);
  for (const mod of publicMods) {
    const entry = catalog.mods.find(item => item.id === mod.id);
    const release = entry.stable ?? entry.beta;
    assert.equal(mod.beta, !entry.stable);
    assert.equal(mod.version, release.version);
    assert.equal(mod.downloadUrl, release.download_url);
    assert.equal(mod.repositoryUrl, `https://github.com/${entry.repository}`);
  }
  assert.deepEqual(catalog.mods.filter(mod => mod.kind === 'plugin').map(mod => mod.dll), ['ets2_truck_dirt.dll', 'brake_fade_br.dll', 'ets2_tire_wear.dll']);
});

test('new catalog entries appear without code changes and unreleased ones stay hidden', () => {
  const added = structuredClone(catalog.mods[0]);
  Object.assign(added, { id: 'novo-plugin', name: 'Novo Plugin' });
  const unreleased = { ...structuredClone(catalog.mods[0]), id: 'em-breve', stable: null, beta: null };
  const result = fromCatalog({ ...catalog, mods: [...catalog.mods, added, unreleased] });
  assert.ok(result.some(mod => mod.id === 'novo-plugin'));
  assert.ok(!result.some(mod => mod.id === 'em-breve'));
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
  const translated = fromCatalog(catalog, 'en');
  for (const mod of translated) {
    for (const key of ['label', 'alt', 'description', 'compatibility', 'installation']) {
      assert.ok(mod[key]?.length, `${mod.id}: ${key}`);
    }
    assert.equal(mod.requirements.length, mods.find(item => item.id === mod.id).requirements.length);
  }
  assert.deepEqual(Object.keys(ui.en), Object.keys(ui['pt-BR']));
  assert.equal(ui.en.results(1), '1 mod found.');
  assert.equal(ui.en.results(4), '4 mods found.');
  assert.match(ui.en.steamLabel('Guerra'), /Steam Workshop/);
  assert.ok(englishPage.some(([selector, label]) => selector === '.support h2' && label === 'Taking these mods on the road?'));
  assert.ok(englishAttributes.some(([selector, attribute]) => selector === '#search' && attribute === 'placeholder'));
  assert.equal(filterMods(translated, {query:'blowouts', locale:'en'})[0].id, 'tire-wear');
  assert.equal(filterMods(translated, {game:'ats', category:'carretas', locale:'en'}).length, 0);
});

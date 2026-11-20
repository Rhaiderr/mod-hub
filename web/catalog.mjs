// Turns the published catalog.json into card data. Stable wins; beta only when no stable exists; unreleased entries stay hidden.
export function fromCatalog(catalog, language = 'pt-BR') {
  return catalog.mods.filter(mod => mod.stable || mod.beta || mod.workshop_url).map(mod => ({
    ...mod.text[language === 'en' ? 'en' : 'pt-BR'],
    id: mod.id, kind: mod.kind, name: mod.name, category: mod.category, games: mod.games, image: mod.image,
    version: (mod.stable ?? mod.beta)?.version ?? mod.version, beta: !mod.stable && Boolean(mod.beta),
    downloadUrl: (mod.stable ?? mod.beta)?.download_url,
    repositoryUrl: mod.repository && `https://github.com/${mod.repository}`,
    workshopUrl: mod.workshop_url,
    distribution: mod.workshop_url ? 'steam' : undefined
  }));
}

export function filterMods(items, { game = 'all', category = 'all', query = '', sort = 'featured', locale = 'pt-BR' } = {}) {
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase(locale);
  const search = normalize(query.trim());
  const result = items.filter(mod => (game === 'all' || mod.games.includes(game)) && (category === 'all' || mod.category === category) && normalize(mod.name + ' ' + mod.description).includes(search));
  return sort === 'name' ? result.sort((a, b) => a.name.localeCompare(b.name, locale)) : result;
}

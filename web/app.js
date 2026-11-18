(async () => {
  const { mods, filterMods } = await import('./catalog.mjs');
  const { detectLanguage, englishPage, englishAttributes, englishMods, ui } = await import('./i18n.mjs');
  let savedLanguage;
  try { savedLanguage = localStorage.getItem('mod-hub-language'); } catch { /* Storage can be unavailable in private browsing. */ }
  let language = detectLanguage(savedLanguage, navigator.languages?.length ? navigator.languages : [navigator.language]);
  const pageTranslations = englishPage.map(([selector, en]) => {
    const node = document.querySelector(selector);
    return { node, en, pt: node.innerHTML };
  });
  const attributeTranslations = englishAttributes.map(([selector, attribute, en]) => {
    const node = document.querySelector(selector);
    return { node, attribute, en, pt: node.getAttribute(attribute) };
  });
  const text = () => ui[language];
  const localizedMods = () => mods.map(mod => language === 'en' ? { ...mod, ...englishMods[mod.id] } : mod);
  const state = { game: 'all', category: 'all', query: '', sort: 'featured' };
  const cards = document.querySelector('#cards');
  const details = document.querySelector('#details');
  const demo = document.querySelector('#demo');
  let returnFocus;

  function openDialog(dialog) {
    returnFocus = document.activeElement;
    dialog.showModal();
  }
  function showDemo(action) {
    document.querySelector('#demo-message').textContent = text().demo(action);
    openDialog(demo);
  }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function showDetails(mod) {
    const content = document.querySelector('#dialog-content');
    content.replaceChildren();
    content.append(element('p', 'eyebrow', mod.label.toUpperCase()));
    const title = element('h2', '', mod.name);
    title.id = 'dialog-title';
    content.append(title, element('p', '', `v${mod.version} · ${mod.games.map(game => game.toUpperCase()).join(' / ')}`), element('p', '', mod.description));
    content.append(element('h3', '', text().before));
    const list = element('ul');
    mod.requirements.forEach(requirement => list.append(element('li', '', requirement)));
    content.append(list, element('h3', '', text().install), element('p', '', mod.installation), element('p', 'dialog-note', text().note));
    const button = mod.downloadUrl
      ? element('a', 'button primary', text().download)
      : element('button', 'button primary', mod.distribution === 'steam' ? text().steam : text().downloadDemo);
    if (mod.downloadUrl) button.href = mod.downloadUrl;
    else button.addEventListener('click', () => { details.close(); showDemo(text().action(mod)); });
    content.append(button);
    if (mod.repositoryUrl) {
      const repository = element('a', 'button', text().repository);
      repository.href = mod.repositoryUrl;
      content.append(repository);
    }
    openDialog(details);
  }
  function render() {
    const visible = filterMods(localizedMods(), { ...state, locale: language });
    cards.replaceChildren();
    visible.forEach(mod => {
      const card = element('article', 'card');
      const visual = element('div', 'card-image');
      const image = element('img');
      image.src = mod.image;
      image.alt = mod.alt;
      image.width = 640;
      image.height = 376;
      image.loading = 'lazy';
      visual.append(image, element('span', `card-tag${mod.beta ? ' beta' : ''}`, mod.beta ? 'BETA' : mod.distribution === 'steam' ? 'STEAM WORKSHOP' : text().free));
      const games = element('div', 'card-games');
      mod.games.forEach(game => games.append(element('span', '', game.toUpperCase())));
      visual.append(games);
      const body = element('div', 'card-body');
      const row = element('div', 'card-title-row');
      row.append(element('h3', '', mod.name), element('span', 'card-version', `v${mod.version}`));
      body.append(element('p', 'card-category', mod.label), row, element('p', 'card-description', mod.description), element('div', 'card-compat', mod.compatibility));
      const bottom = element('div', 'card-bottom');
      const detail = element('button', 'detail-button', text().details);
      detail.setAttribute('aria-label', text().detailsLabel(mod.name));
      detail.addEventListener('click', () => showDetails(mod));
      const download = element(mod.downloadUrl ? 'a' : 'button', 'download-button', mod.distribution === 'steam' ? text().steam : text().download);
      if (mod.downloadUrl) {
        download.href = mod.downloadUrl;
        download.setAttribute('aria-label', text().action(mod));
      } else {
        download.setAttribute('aria-label', mod.distribution === 'steam' ? text().steamLabel(mod.name) : text().downloadLabel(mod.name));
        download.addEventListener('click', () => showDemo(text().action(mod)));
      }
      bottom.append(detail, download);
      if (mod.repositoryUrl) {
        bottom.classList.add('public-card-actions');
        const repository = element('a', 'github-button', 'GitHub ↗');
        repository.href = mod.repositoryUrl;
        repository.setAttribute('aria-label', `${text().repository} — ${mod.name}`);
        bottom.append(repository);
      }
      body.append(bottom);
      card.append(visual, body);
      cards.append(card);
    });
    document.querySelector('#empty').hidden = visible.length !== 0;
    document.querySelector('#results-status').textContent = text().results(visible.length);
  }
  for (const field of ['game', 'category']) {
    document.querySelectorAll(`[data-${field}]`).forEach(button => button.addEventListener('click', () => {
      state[field] = button.dataset[field];
      document.querySelectorAll(`[data-${field}]`).forEach(peer => {
        const selected = peer === button;
        peer.classList.toggle('selected', selected);
        peer.setAttribute('aria-pressed', String(selected));
      });
      render();
    }));
  }
  document.querySelector('#search').addEventListener('input', event => { state.query = event.target.value; render(); });
  document.querySelector('#sort').addEventListener('change', event => { state.sort = event.target.value; render(); });
  document.querySelector('#clear').addEventListener('click', () => {
    Object.assign(state, { game: 'all', category: 'all', query: '', sort: 'featured' });
    document.querySelector('#search').value = '';
    document.querySelector('#sort').value = 'featured';
    for (const field of ['game', 'category']) document.querySelector(`[data-${field}="all"]`).click();
    document.querySelector('#search').focus();
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]') && returnFocus?.isConnected) returnFocus.focus(); });
  });
  document.querySelector('#demo-ok').addEventListener('click', () => demo.close());
  function applyLanguage() {
    document.documentElement.lang = language;
    for (const { node, en, pt } of pageTranslations) node.innerHTML = language === 'en' ? en : pt;
    for (const { node, attribute, en, pt } of attributeTranslations) node.setAttribute(attribute, language === 'en' ? en : pt);
    document.querySelector('#language').value = language;
    document.querySelector('#total-count').textContent = String(mods.length).padStart(2, '0');
    render();
  }
  document.querySelector('#language').addEventListener('change', event => {
    language = detectLanguage(event.target.value);
    try { localStorage.setItem('mod-hub-language', language); } catch { /* Keep the selection for this visit when storage is blocked. */ }
    applyLanguage();
  });
  applyLanguage();
})().catch(() => {
  document.querySelector('#cards').textContent = document.documentElement.lang === 'en' ? 'The catalog could not be loaded. Refresh the page to try again.' : 'Não foi possível carregar o catálogo. Atualize a página para tentar novamente.';
});

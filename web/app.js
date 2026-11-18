(async () => {
  const { mods, filterMods } = await import('./catalog.mjs');
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
    document.querySelector('#demo-message').textContent = `${action}: esta ação ainda é demonstrativa e não inicia nenhum download ou pagamento.`;
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
    content.append(element('h3', '', 'Antes de pegar a estrada'));
    const list = element('ul');
    mod.requirements.forEach(requirement => list.append(element('li', '', requirement)));
    content.append(list, element('h3', '', 'Instalação manual'), element('p', '', mod.installation), element('p', 'dialog-note', 'Prévia para validação visual. Versões e compatibilidade são referências do catálogo e ainda serão revisadas. A imagem é ilustrativa.'));
    const button = element('button', 'button primary', 'Download demonstrativo ↗');
    button.addEventListener('click', () => { details.close(); showDemo(`Baixar ${mod.name}`); });
    content.append(button);
    openDialog(details);
  }
  function render() {
    const visible = filterMods(mods, state);
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
      visual.append(image, element('span', `card-tag${mod.beta ? ' beta' : ''}`, mod.beta ? 'BETA' : 'GRATUITO'));
      const games = element('div', 'card-games');
      mod.games.forEach(game => games.append(element('span', '', game.toUpperCase())));
      visual.append(games);
      const body = element('div', 'card-body');
      const row = element('div', 'card-title-row');
      row.append(element('h3', '', mod.name), element('span', 'card-version', `v${mod.version}`));
      body.append(element('p', 'card-category', mod.label), row, element('p', 'card-description', mod.description), element('div', 'card-compat', mod.compatibility));
      const bottom = element('div', 'card-bottom');
      const detail = element('button', 'detail-button', 'Ver detalhes →');
      detail.setAttribute('aria-label', `Ver detalhes de ${mod.name}`);
      detail.addEventListener('click', () => showDetails(mod));
      const download = element('button', 'download-button', 'Download ↓');
      download.setAttribute('aria-label', `Download demonstrativo de ${mod.name}`);
      download.addEventListener('click', () => showDemo(`Baixar ${mod.name}`));
      bottom.append(detail, download);
      body.append(bottom);
      card.append(visual, body);
      cards.append(card);
    });
    document.querySelector('#empty').hidden = visible.length !== 0;
    document.querySelector('#results-status').textContent = `${visible.length} ${visible.length === 1 ? 'mod encontrado' : 'mods encontrados'}.`;
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
  document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', () => showDemo(button.dataset.demo)));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]') && returnFocus?.isConnected) returnFocus.focus(); });
  });
  document.querySelector('#demo-ok').addEventListener('click', () => demo.close());
  render();
})().catch(() => {
  document.querySelector('#cards').textContent = 'Não foi possível carregar o catálogo. Atualize a página para tentar novamente.';
});

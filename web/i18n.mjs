export function detectLanguage(saved, languages = []) {
  if (saved === 'pt-BR' || saved === 'en') return saved;
  return languages[0]?.replace('_', '-').toLowerCase() === 'pt-br' ? 'pt-BR' : 'en';
}

// Translation HTML is authored here, never supplied by catalog or user input.
export const englishPage = [
  ['title', 'Rhaider Mod Hub — More miles. More realism.'],
  ['.skip', 'Skip to catalog'],
  ['.nav-active', 'Explore mods'],
  ['.header nav a:last-child', 'How it works'],
  ['.section-heading .eyebrow', 'EURO TRUCK SIMULATOR 2 &amp; AMERICAN TRUCK SIMULATOR'],
  ['#catalog-title', 'Mods for your<br>next journey<span>.</span>'],
  ['.catalog-intro', 'Projects by Rhaider to bring more realism to your ETS2 and ATS journeys.'],
  ['.count', '<span id="total-count">04</span> MODS IN THE CATALOG'],
  ['[data-game="all"]', 'All games'],
  ['[data-category="all"]', 'All'],
  ['[data-category="realismo"]', 'Realism'],
  ['[data-category="visual"]', 'Visual'],
  ['[data-category="clima"]', 'Weather'],
  ['[data-category="carretas"]', 'Trailers'],
  ['#sort-label', 'Sort by'],
  ['#sort option[value="featured"]', 'Featured'],
  ['#sort option[value="name"]', 'Name A–Z'],
  ['#empty h3', 'No mods found.'],
  ['#empty p', 'Try another name or a different combination of filters.'],
  ['#clear', 'Clear filters'],
  ['.catalog-foot > span:first-child', '<span class="status-dot"></span> A small catalog. Care in every detail.'],
  ['.catalog-foot > span:last-child a', 'DEVELOPED BY RHAIDERR <span aria-hidden="true">↗</span>'],
  ['.how-intro .eyebrow', 'LESS HASSLE. MORE SIMULATION.'],
  ['#how-title', 'From discovery<br>to the road.'],
  ['.how-intro > p:last-child', 'Your mods, straight from the source.<br>No middlemen along the way.'],
  ['.steps li:nth-child(1) h3', 'Find your mod'],
  ['.steps li:nth-child(1) p', 'Explore the catalog and check the games, requirements and details of each project.'],
  ['.steps li:nth-child(2) h3', 'Check before you set off'],
  ['.steps li:nth-child(2) p', 'Check the version and instructions. Each mod has its own installation steps.'],
  ['.steps li:nth-child(3) h3', 'Get back on the road'],
  ['.steps li:nth-child(3) p', 'Download Tire Wear, Truck Dirt and Clima Real from the catalog. Subscribe to Carreta Guerra on Steam Workshop.'],
  ['.support .eyebrow', 'SUPPORT DEVELOPMENT'],
  ['.support h2', 'Taking these mods on the road?'],
  ['.support p:last-child', 'A coffee helps me keep the mods updated. Thanks for your support!'],
  ['.footer p', 'An independent project. Not affiliated with SCS Software.'],
  ['#demo .eyebrow', 'AVAILABILITY'],
  ['#demo-title', 'Link available soon.'],
  ['#demo > p:last-of-type', 'You can already check the details and requirements for this mod in the catalog.'],
  ['#demo-ok', 'Got it <span aria-hidden="true">✓</span>']
];

export const englishAttributes = [
  ['meta[name="description"]', 'content', 'Rhaider Mod Hub: more realism in every mile. Explore mods for Euro Truck Simulator 2 and American Truck Simulator.'],
  ['.header .brand', 'aria-label', 'Rhaider Mod Hub, home'],
  ['.header nav', 'aria-label', 'Main navigation'],
  ['.game-tabs', 'aria-label', 'Filter by game'],
  ['.categories', 'aria-label', 'Filter by category'],
  ['#search', 'placeholder', 'Search for a mod…'],
  ['#search', 'aria-label', 'Search mods'],
  ['#sort', 'aria-label', 'Sort mods'],
  ['#details .dialog-close', 'aria-label', 'Close details'],
  ['#demo .dialog-close', 'aria-label', 'Close notice']
];

export const ui = {
  'pt-BR': {
    before: 'Antes de pegar a estrada', install: 'Como instalar', repository: 'Ver README no GitHub ↗',
    note: 'Confira os requisitos antes de instalar. A imagem é ilustrativa.',
    steam: 'Steam em breve', workshop: 'Steam Workshop ↗', download: 'Download ↓', downloadDemo: 'Download demonstrativo ↗', free: 'GRATUITO', details: 'Ver detalhes →',
    detailsLabel: name => `Ver detalhes de ${name}`,
    downloadLabel: name => `Download demonstrativo de ${name}`,
    steamLabel: name => `Disponibilidade de ${name} na Steam Workshop`,
    action: mod => mod.distribution === 'steam' ? `Abrir ${mod.name} na Steam Workshop` : `Baixar ${mod.name}`,
    demo: action => `${action}: o link ainda não foi disponibilizado.`,
    results: count => `${count} ${count === 1 ? 'mod encontrado' : 'mods encontrados'}.`,
    support: 'Apoiar o projeto', coffee: 'Apoiar o desenvolvimento',
    error: 'Não foi possível carregar o catálogo. Atualize a página para tentar novamente.'
  },
  en: {
    before: 'Before you hit the road', install: 'How to install', repository: 'View README on GitHub ↗',
    note: 'Check the requirements before installing. The image is illustrative.',
    steam: 'Steam coming soon', workshop: 'Steam Workshop ↗', download: 'Download ↓', downloadDemo: 'Demo download ↗', free: 'FREE', details: 'View details →',
    detailsLabel: name => `View details for ${name}`,
    downloadLabel: name => `Demo download for ${name}`,
    steamLabel: name => `Availability of ${name} on Steam Workshop`,
    action: mod => mod.distribution === 'steam' ? `Open ${mod.name} on Steam Workshop` : `Download ${mod.name}`,
    demo: action => `${action}: the link is not available yet.`,
    results: count => `${count} ${count === 1 ? 'mod found' : 'mods found'}.`,
    support: 'Support the project', coffee: 'Support development',
    error: 'The catalog could not be loaded. Refresh the page to try again.'
  }
};

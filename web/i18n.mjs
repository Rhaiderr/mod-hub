export function detectLanguage(saved, languages = []) {
  if (saved === 'pt-BR' || saved === 'en') return saved;
  return languages[0]?.replace('_', '-').toLowerCase() === 'pt-br' ? 'pt-BR' : 'en';
}

// Translation HTML is authored here, never supplied by catalog or user input.
export const englishPage = [
  ['title', 'Mod Hub — More miles. More realism.'],
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
  ['.steps li:nth-child(3) p', 'Download Tire Wear, Truck Dirt and Clima Real from the catalog. The Steam Workshop button is a demo.'],
  ['.support .eyebrow', 'SUPPORT DEVELOPMENT'],
  ['.support h2', 'Taking these mods on the road?'],
  ['.support p:last-child', 'A coffee helps me keep the mods updated. Thanks for your support!'],
  ['.footer p', 'An independent project. Not affiliated with SCS Software.'],
  ['.preview-badge', 'VISUAL PREVIEW · v0.1'],
  ['#demo .eyebrow', 'VISUAL PREVIEW'],
  ['#demo-title', 'A quick pit stop.'],
  ['#demo > p:last-of-type', 'We are reviewing the look of Mod Hub. Destinations will be checked before the final version.'],
  ['#demo-ok', 'Got it <span aria-hidden="true">✓</span>']
];

export const englishAttributes = [
  ['meta[name="description"]', 'content', 'Mod Hub: more realism in every mile. Explore mods for Euro Truck Simulator 2 and American Truck Simulator.'],
  ['.header .brand', 'aria-label', 'Mod Hub, home'],
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
    note: 'Prévia para validação visual. Versões e compatibilidade são referências do catálogo e ainda serão revisadas. A imagem é ilustrativa.',
    steam: 'Ver na Steam ↗', download: 'Download ↓', downloadDemo: 'Download demonstrativo ↗', free: 'GRATUITO', details: 'Ver detalhes →',
    detailsLabel: name => `Ver detalhes de ${name}`,
    downloadLabel: name => `Download demonstrativo de ${name}`,
    steamLabel: name => `Ver ${name} na Steam Workshop (demonstrativo)`,
    action: mod => mod.distribution === 'steam' ? `Abrir ${mod.name} na Steam Workshop` : `Baixar ${mod.name}`,
    demo: action => `${action}: esta ação ainda é demonstrativa e não inicia nenhum download ou pagamento.`,
    results: count => `${count} ${count === 1 ? 'mod encontrado' : 'mods encontrados'}.`,
    support: 'Apoiar o projeto', coffee: 'Apoiar o desenvolvimento',
    error: 'Não foi possível carregar o catálogo. Atualize a página para tentar novamente.'
  },
  en: {
    before: 'Before you hit the road', install: 'How to install', repository: 'View README on GitHub ↗',
    note: 'Visual preview. Versions and compatibility are catalog references and still need review. The image is illustrative.',
    steam: 'View on Steam ↗', download: 'Download ↓', downloadDemo: 'Demo download ↗', free: 'FREE', details: 'View details →',
    detailsLabel: name => `View details for ${name}`,
    downloadLabel: name => `Demo download for ${name}`,
    steamLabel: name => `View ${name} on Steam Workshop (demo)`,
    action: mod => mod.distribution === 'steam' ? `Open ${mod.name} on Steam Workshop` : `Download ${mod.name}`,
    demo: action => `${action}: this is a demonstration and does not start any download or payment.`,
    results: count => `${count} ${count === 1 ? 'mod found' : 'mods found'}.`,
    support: 'Support the project', coffee: 'Support development',
    error: 'The catalog could not be loaded. Refresh the page to try again.'
  }
};

export const englishMods = {
  'tire-wear': {
    label: 'Realism & physics', alt: 'Illustrative artwork of truck tires, from new to worn',
    description: 'Every mile leaves its mark. Visual tire wear and blowouts you can feel through the wheel.',
    compatibility: 'ETS2 / ATS · tested on 1.61',
    requirements: ['Windows 10/11 64-bit and DirectX 11.', 'Single player. Modded tires do not show visual wear.', 'Compatibility follows the documentation; review pending.'],
    installation: 'With the game closed, copy the DLL and INI to bin/win_x64/plugins. Keep your existing INI if you have your own settings.'
  },
  'truck-dirt': {
    label: 'Visuals & immersion', alt: 'Illustrative artwork of a truck with road dust and mud',
    description: 'Dust, mud and stories from the road. Your truck gets dirty as you drive, following the road surface and weather.',
    compatibility: 'ETS2 / ATS · tested on 1.62',
    requirements: ['Windows 10/11 64-bit and DirectX 11.', 'Single player; rendering is disabled in multiplayer.', 'Compatibility follows the documentation; review pending.'],
    installation: 'With the game closed, copy everything in the ZIP’s plugins folder, including the premap maps, to bin/win_x64/plugins. Keep your existing INI.'
  },
  'clima-real': {
    label: 'Weather & environment', alt: 'Illustrative artwork of a truck crossing a Brazilian landscape',
    description: 'The Brazilian summer follows your route. Regional temperatures and smooth transitions for the BR Brasil map.',
    compatibility: 'ETS2 1.62 · BR Brasil 6.1',
    requirements: ['Euro Truck Simulator 2 1.62 with BR Brasil 6.1.', 'BR Brasil is required and is not included.', 'No ATS support; compatibility with other weather mods is untested.'],
    installation: 'Back up your profile. Copy the SCS file to the mod folder and activate Clima Real above the BR Brasil packages in the Mod Manager.'
  },
  'carreta-guerra': {
    label: 'Trailers & combinations', alt: 'Illustrative Guerra BR artwork with grain trailers: 4-axle, Vanderléia, bitrem and rodotrem',
    description: 'The weight and presence of Brazilian roads. Four Guerra combinations: 4-axle, Vanderléia, bitrem and rodotrem.',
    compatibility: 'ETS2 · tested on 1.62',
    requirements: ['Euro Truck Simulator 2 1.62.', 'No DLC or other trailer mod required.', 'No ATS support; multiplayer is untested.'],
    installation: 'In the final version, open the Steam Workshop item, subscribe and activate Guerra BR in the ETS2 Mod Manager. The Steam link is still under review in this preview.'
  }
};

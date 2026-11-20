# Mod Hub — ETS2 / ATS

**Prévia visual:** https://Rhaiderr.github.io/mod-hub/

Um catálogo independente de mods para Euro Truck Simulator 2 e American Truck Simulator. Tema escuro, busca, filtros por jogo/categoria e detalhes de cada mod, adaptados para telas pequenas.

> Truck Dirt, Brake Fade, Tire Wear e Clima Real têm downloads oficiais e links para os READMEs públicos. Os botões de apoio e da Steam Workshop são demonstrativos.

## Idiomas

O seletor no cabeçalho alterna entre PT-BR e inglês, incluindo cards, detalhes, filtros e avisos acessíveis. Na primeira visita, `navigator.languages[0]` (ou `navigator.language`) determina o idioma: `pt-BR` usa português; os demais usam inglês. Não consulta IP nem localização. A escolha manual fica em `localStorage`; se o armazenamento estiver bloqueado, continua funcionando durante a visita. A arte das capas permanece original.

## Ver a página localmente

A página é HTML/CSS/JavaScript estático, sem build ou dependências de frontend.

```sh
python3 -m http.server 8765 --directory web
```

Abra `http://localhost:8765`. A página lê `web/catalog.json`; `http://localhost:8765/#tire-wear` abre direto os detalhes de um mod (destino do botão do Mod Hub no jogo). As capas são ilustrativas; Carreta Guerra usa a arte Guerra BR já aprovada para Steam e os demais cards usam as capas dos repositórios públicos; o desenho do caminhão no destaque é SVG. A tipografia usa Google Fonts com fontes locais como fallback.

```sh
node --test tests/web.test.mjs
```

## Catálogo de distribuição

Python 3.9+ com JSON Schema:

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m unittest discover -s tests -v
.venv/bin/python hub.py validate
.venv/bin/python hub.py sync
```

Sincronização reproduzível sem rede: `.venv/bin/python hub.py sync --fixtures tests`.

`catalog/plugins.json` é a fonte curada e o allowlist: id, tipo (`plugin` ou `mod`), data de entrada (`added`), textos PT/EN, capa, jogos, repositório e asset (ou versão e link da Steam Workshop) e, para plugins, o nome da DLL. O `sync` junta esses dados às versões stable/beta, datas, URLs versionadas e SHA-256 declarados pelo GitHub e grava `web/catalog.json`, validado por `catalog/schema.json`. O site e o Mod Hub dentro do jogo leem esse mesmo arquivo. Compatibilidade é referência documentada, não afirmação de que versões futuras foram testadas.

O gerador consulta apenas os repositórios `Rhaiderr/*` listados em `plugins.json`, ignora drafts e exige pacote com SHA-256. Uma versão já publicada que reaparece com outro hash bloqueia o sync. Qualquer falha preserva o catálogo anterior. O site mostra o estável; sem estável, mostra o beta marcado como BETA; sem nenhum release, o item fica oculto.

### Adicionar um plugin ou mod

1. Colocar a capa em `web/assets/` e a entrada em `catalog/plugins.json`.
2. Enviar para `main`. O workflow sincroniza, faz commit de `web/catalog.json` e publica o site; plugins já instalados passam a listar o item sem novo release. Pré-lançamentos SemVer permanecem no canal beta mesmo quando a flag no GitHub discorda. Notas completas ficam nos Releases originais.

Verificação de um pacote baixado manualmente:

```sh
.venv/bin/python hub.py verify --file /caminho/pacote.zip --sha256 HASH_DO_MANIFESTO
```

## Publicação

GitHub Pages publica exclusivamente `web/` após os testes de frontend. O workflow do catálogo executa testes Python e, em `main`, a cada push e de hora em hora (cron do GitHub Actions), roda o `sync`: se algo mudou, faz commit direto de `web/catalog.json` e dispara o deploy do Pages. Nenhum segredo é incluído no cliente.

Pendentes: revisão dos destinos, cliente de atualizações, cache offline, integração com a interface nativa, inventário de instalados e testes no Windows. Os binários dos mods não são distribuídos neste repositório.

Este projeto não é afiliado à SCS Software. ETS2 e ATS são marcas de seus respectivos titulares.

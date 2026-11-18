# Mod Hub — ETS2 / ATS

**Prévia visual:** https://Rhaiderr.github.io/mod-hub/

Um catálogo independente de mods para Euro Truck Simulator 2 e American Truck Simulator. Tema escuro, busca, filtros por jogo/categoria e detalhes de cada mod, adaptados para telas pequenas.

> Esta versão é para validação visual. Os botões de download e apoio são demonstrativos, não iniciam downloads nem pagamentos. Carreta Guerra exibe um destino demonstrativo para a Steam Workshop, também sem link ativo. Links oficiais e compatibilidade serão revisados antes da versão funcional. Não há instalação automática nem integração com o jogo nesta página.

## Idiomas

O seletor no cabeçalho alterna entre PT-BR e inglês, incluindo cards, detalhes, filtros e avisos acessíveis. Na primeira visita, `navigator.languages[0]` (ou `navigator.language`) determina o idioma: `pt-BR` usa português; os demais usam inglês. Não consulta IP nem localização. A escolha manual fica em `localStorage`; se o armazenamento estiver bloqueado, continua funcionando durante a visita. A arte das capas permanece original.

## Ver a página localmente

A página é HTML/CSS/JavaScript estático, sem build ou dependências de frontend.

```sh
python3 -m http.server 8765 --directory web
```

Abra `http://localhost:8765`. O catálogo visual está em `web/catalog.mjs`, separado do manifesto de distribuição durante a revisão. As capas são ilustrativas; Carreta Guerra usa a arte Guerra BR já aprovada para Steam e os demais cards usam as capas dos repositórios públicos; o desenho do caminhão no destaque é SVG. A tipografia usa Google Fonts com fontes locais como fallback.

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

`catalog/plugins.json` guarda metadados curados. `catalog/manifest.json` contém versões stable/beta, datas, URLs versionadas e SHA-256 declarados pelo GitHub, validado por `catalog/schema.json`. Os metadados de compatibilidade são referências documentadas, não uma afirmação de que versões futuras foram testadas.

O gerador consulta apenas os três repositórios públicos incluídos, ignora drafts e exige pacote com SHA-256. Uma falha preserva o manifesto anterior. Pré-lançamentos SemVer permanecem no canal beta mesmo quando a flag no GitHub discorda. Notas completas ficam nos Releases originais.

Verificação de um pacote baixado manualmente:

```sh
.venv/bin/python hub.py verify --file /caminho/pacote.zip --sha256 HASH_DO_MANIFESTO
```

## Publicação

GitHub Pages publica exclusivamente `web/` após os testes de frontend. O workflow do catálogo executa testes Python; sincronização por PR permanece **manual** durante a revisão dos links. Nenhum segredo é incluído no cliente.

Pendentes: revisão dos destinos, cliente de atualizações, cache offline, integração com a interface nativa, inventário de instalados e testes no Windows. Os binários dos mods não são distribuídos neste repositório.

Este projeto não é afiliado à SCS Software. ETS2 e ATS são marcas de seus respectivos titulares.

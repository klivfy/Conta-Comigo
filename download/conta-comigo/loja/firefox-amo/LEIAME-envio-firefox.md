# Envio ao Firefox Add-ons (AMO) — Conta Comigo v2.6.0

## 1. O arquivo a enviar

`download/conta-comigo-firefox-2.6.0.zip` (≈ 136 KB, `manifest.json` na raiz)

Gerado por `python3 scripts/build_packages.py`. Não contém `demo.html`, `web/`
nem `loja/`. Não há minificação, transpilação nem bibliotecas de terceiros, então
**não é preciso enviar o código-fonte à parte** (no formulário: "Preciso enviar
o código-fonte? → Não").

## 2. Versão mínima do Firefox: 128.0 (ESR)

| Item | Valor |
|---|---|
| Firefox desktop (`gecko.strict_min_version`) | **128.0** |
| Firefox para Android (`gecko_android.strict_min_version`) | **128.0** |

Por que 128 e não o 109 que estava no build:

- O `background` do Firefox é uma *event page* MV3 (`background.scripts`). A
  Mozilla só trata esse modelo como estável a partir do **Firefox 121**; antes
  disso o MV3 no Firefox tinha comportamento incompleto ([MDN — background](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background)).
  O "109+" do guia anterior não tinha base.
- O CSS do jogo usa `dvh` (Firefox 101+) e `backdrop-filter` (103+); o JS não usa
  nada além de recursos antigos. Esses pisos ficam abaixo de 121, então quem manda
  é o MV3.
- 128 é a linha ESR: cobre usuários corporativos/escolares que ficam no ESR e
  evita prometer suporte a versões 121–127 que não foram testadas.

## 3. Declaração de dados (obrigatória)

Desde 03/11/2025 o AMO exige `data_collection_permissions` em extensões novas
([anúncio da Mozilla](https://blog.mozilla.org/addons/2025/10/23/data-collection-consent-changes-for-new-firefox-extensions/)).
O build já declara:

```json
"data_collection_permissions": { "required": ["none"] }
```

Quando a extensão passa a usar a chave, precisa mantê-la nas versões seguintes —
o `build_packages.py` já a inclui sempre.

## 3.1 Idioma: português do Brasil como padrão

O AMO só reconhecia inglês (EUA) porque o pacote não tinha `_locales` nem
`default_locale`. Agora:

- `manifest.json` declara `default_locale: "pt_BR"` e usa `__MSG_*__` em nome,
  descrição, título do botão e descrição do atalho;
- `_locales/pt_BR`, `_locales/en` e `_locales/es` têm esses textos (descrição
  ≤ 132 caracteres). O AMO lê esses idiomas e usa pt-BR como padrão da listagem;
  o Firefox mostra o nome na língua da interface do usuário;
- o jogo escolhe o idioma no **primeiro uso** pelos idiomas preferidos do
  navegador (`navigator.languages`), depois pelo idioma da interface; se nenhum
  for pt, en ou es, abre em português. Depois disso vale o que a pessoa escolher
  nas opções. Quem já tinha o jogo instalado mantém o idioma salvo.

No Firefox 128 real: pt-BR abre em português, es-ES em espanhol e en-US em inglês.

## 4. O que foi validado (e o que não foi)

Validado em 27/10/2026:

- `web-ext lint` (validador da Mozilla) sobre o pacote: **0 erros, 0 avisos de
  manifesto, 20 avisos** `UNSAFE_VAR_ASSIGNMENT` (uso de `innerHTML` em
  `js/ui.js` e `js/options.js`). São avisos, não bloqueiam a assinatura, mas o
  revisor pode perguntar — ver notas abaixo.
- **Firefox 128.0 ESR real** (Linux, headless), extensão instalada a partir do
  pacote: o jogo abriu, uma rodada completa foi jogada (17 respostas até a tela
  de fim de rodada), Comparar, Loja e Conquistas abriram, e o console registrou
  **0 erros**. Os prints da pasta `capturas/` vêm dessa execução.
- A **página de nova aba** abriu e o botão "Conta Comigo" dela criou uma segunda
  janela com o `game.html` (`chrome.windows.create`, o mesmo caminho do ícone),
  sem erros de console.

**Não** validado (não há como fazer aqui):

- Versões do Firefox entre 121 e 127 (por isso o mínimo 128).
- Windows/macOS e Firefox para Android reais.
- O clique no **ícone da barra** (`action.onClicked`) e o atalho Ctrl+Shift+U
  em si — só o código que eles chamam foi exercitado — e o aviso que o Firefox
  mostra ao instalar uma extensão que troca a nova aba.
- A narração: o teste foi sem placa de som/vozes. A Web Speech API usa as vozes
  instaladas no sistema; no Linux depende de `speech-dispatcher`.
- Instalação do pacote já **assinado** pelo AMO.

## 5. Passo a passo no AMO

1. <https://addons.mozilla.org/developers/> → **Enviar um novo complemento**.
2. Distribuição: **"Neste site"** (listado publicamente).
3. Enviar `conta-comigo-firefox-2.6.0.zip`. A validação deve terminar sem erros
   (com os avisos de `innerHTML`).
4. Código-fonte: **Não** (ver item 1).
5. Preencher a listagem com `listagem-firefox-amo.md` (pt-BR; en e es opcionais).
6. Capturas: `anuncio/anuncio-01…06.png` (1280×800).
7. Licença: **All Rights Reserved** (o projeto é proprietário — ver `LICENSE`).
8. Política de privacidade: colar o texto de `../politica-de-privacidade.md`
   no campo próprio (o GitHub Pages ainda não está ativo, então não há URL
   pública estável).
9. Notas para o revisor: colar o texto do item 6 abaixo.
10. Enviar para revisão. Extensão nova costuma passar por revisão manual.

## 6. Notas para o revisor (colar no formulário, em inglês)

> Conta Comigo is an offline math game for children aged 4+.
>
> - The package is the plain source: no build step, no minification, no
>   third-party libraries, no remote code, no network requests.
> - Permission: `storage` only, to keep game progress locally. Optional sync
>   (off by default) uses `storage.sync`, i.e. the user's own Firefox account.
> - `chrome_url_overrides.newtab`: the add-on replaces the new tab page with a
>   quick math challenge. This is disclosed in the listing, and the user can
>   turn the challenge off on that page or disable/remove the add-on.
> - `background.scripts` is a non-persistent event page that only opens the game
>   window when the toolbar button or the Ctrl+Shift+U command is used.
> - The linter reports `innerHTML` assignments in `js/ui.js` and `js/options.js`.
>   They render the game's own UI templates; player names are escaped before
>   rendering and imported backups are validated on load.
> - `data_collection_permissions` is `none`: the add-on collects and transmits
>   no data.
> - Tested on Firefox ESR 128.0.

## 7. Pendências conhecidas

- **Os 20 usos de `innerHTML` não foram auditados um a um nesta etapa.** A frase
  sobre "nomes escapados" nas notas reflete o endurecimento feito na Fase 1
  (`escHtml` e validação do backup). Se o revisor pedir, o caminho é trocar
  `innerHTML` por `textContent`/`createElement` nesses pontos.
- A **nova aba** é o ponto mais sensível para revisão e para a percepção de
  quem instala (a opção do jogo desliga o desafio, mas não devolve a aba padrão
  do Firefox). Se o AMO ou os usuários reclamarem, remover `chrome_url_overrides`
  só do build do Firefox é uma alteração pequena em `build_packages.py`.
- A janela do jogo é guardada em memória (`gameWinId`) na event page. Se o
  Firefox descarregar a página em repouso, um segundo clique no ícone abre outra
  janela em vez de focar a existente. Não bloqueia o envio.

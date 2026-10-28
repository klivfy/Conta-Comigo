# Conta Comigo — guia para agentes

Jogo de matemática para crianças de 4 a 8 anos, 100% offline, em pt-BR, en e es. Escreva código, comentários, commits e documentos em **português do Brasil**. Produto e público: `PRODUCT.md`. Design system: `DESIGN.md`. Histórico de decisões: `PLANO-DE-ACAO.md`.

## Stack
- JavaScript puro, sem bundler e sem dependências em tempo de execução. Os scripts são globais e carregam nesta ordem: `js/i18n.js` → `js/engine.js` → `js/ui.js` (ou `options.js` / `newtab.js`).
- `engine.js`: estado (`DB`, `P()`, `G()`), armazenamento, validação do backup (`parseDB`/`normalizeDB`), voz, senha (PBKDF2) e geradores de questões. Também guarda as **regras de recompensa** (estrelas, pontos, missões, conquistas, fim de rodada), em funções sem DOM.
- `ui.js`: só tela, som e comemoração. Regra de jogo nova vai para o engine, com teste.
- CSS único em `css/style.css`, em três camadas de tokens (primitivos → semânticos por tema → derivados em `body`).

## Fonte única e pacotes
Tudo sai de `download/conta-comigo/`. Os builds (`download/conta-comigo-pwa/` e `download/conta-comigo-firefox/`) são gerados e ficam fora do Git.
- `python scripts/build_packages.py`: zips da Chrome e do Firefox (`download/*.zip`). O manifest do Firefox é montado no script.
- `python scripts/build_pwa.py`: a PWA, que também é a base do Windows (Electron, em `native/windows/`) e do iOS (Capacitor, via `scripts/build_ios_www.py`).
- `python scripts/build_android_www.py`: o jogo para o app Android (Capacitor, em `native/android/`), com ícones e abertura; depois `npx cap sync android`. O jogo vai dentro do APK/AAB, sem depender do site. Keystore **nunca** entra no Git.

## Variantes de página
`game.html` (página cheia, `body.page-mode`), `popup.html` (popup 400×600 da extensão) e `web/index.html` (versão para escolas, com caminhos `../`) têm **a mesma marcação** dentro do `<body>`. `scripts/sync_check.cjs` confere isso. Também existem `options.html` (painel dos responsáveis, atrás da senha), `newtab.html` e `demo.html`.

## Regras que não podem quebrar
- **CSP** `script-src 'self'`: nada de script inline nem `onclick` no HTML.
- **innerHTML**: só texto fixo, números ou `escHtml(...)`. O backup importado é entrada não confiável: campo novo no perfil precisa de validação em `normalizeDB` e de teste.
- **Senha dos responsáveis**: fica só no aparelho. Hash, sal e lembrete nunca vão para o backup, a cópia ou o sync (`shareableDB` / `keepLocalSecrets`).
- **Textos**: toda chave em pt, en e es (`scripts/i18n_check.cjs`).
- **Tamanhos**: texto em `rem`; ícones e ilustrações em emoji em `px`. Alvos de toque com no mínimo 44×44px. Cores vêm dos tokens semânticos (`--ink`, `--accent-text`…).
- **Workflows**: `.github/workflows/*.yml` e `download/kit-fase1/workflows/*.yml` são cópias idênticas.
- **Identificador**: `com.klivfy.conta.comigo.matematica` em todas as plataformas (Android, iPhone, iPad, Mac, Windows, Linux). Exceções e motivos em `IDENTIFICADORES.md`; o Firefox continua `conta-comigo@klivfy.com`. O `sync_check.cjs` confere.
- **Versão**: ao mudar a do `manifest.json`, atualize todos os lugares que `scripts/sync_check.cjs` lista.

## Verificação (rode antes de abrir PR)
```bash
for f in download/conta-comigo/js/*.js download/conta-comigo/background.js; do node --check "$f"; done
node --test tests/*.test.cjs        # motor: senha, backup, geradores, regras
node scripts/i18n_check.cjs
node scripts/sync_check.cjs
python scripts/build_packages.py && python scripts/build_pwa.py
python scripts/scan_csp.py          # CSP: sem script/evento inline, javascript: ou eval
node scripts/a11y_check.cjs         # axe; precisa de playwright e axe-core
node scripts/resp_check.cjs         # 8 aparelhos × 15 telas
CC_TEXTO=200 node scripts/resp_check.cjs
```
O CI (`.github/workflows/ci.yml`) roda tudo isso. O Playwright do CI usa a localidade en-US, então teste também em inglês: os textos ficam mais longos.

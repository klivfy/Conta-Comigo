# Plano de ação — Conta Comigo

Baseado na auditoria estrutural (code-review, security, design-system, a11y, apple-design, design-critique, impeccable) + pendências anteriores.
Legenda: **[eu]** código na branch · **[você]** ação em conta/GitHub/loja.

## Fase 0 — Emergência de segurança
- [ ] 0.1 [você] Gerar novo keystore fora do repo e guardar em GitHub Secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASS`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASS`)
- [x] 0.2 [eu] Remover `upload.jks`, `sha256.txt` e senhas do repo; ignorar `native/android/keystore/`
- [x] 0.3 [eu] Gradle e workflow Android leem o keystore de secrets/variáveis de ambiente
- [ ] 0.4 [você] Revogar o token pessoal usado no primeiro push, que foi compartilhado numa sessão anterior (os workflows já estão em `.github/workflows/` — 2.6)
- [ ] 0.5 [você] Decidir hospedagem do `assetlinks.json` na raiz do domínio (repo `klivfy.github.io` ou domínio próprio)

## Fase 1 — Bugs que quebram o produto
- [x] 1.1 PWA: incluir `options.html`/`options.js`/`boot.js` (`build_pwa.py:74-75`)
- [x] 1.2 Escapar nome/avatar (`ui.js`, `options.js`)
- [x] 1.3 Validar schema na importação de backup (`engine.js parseDB`)
- [x] 1.4 CSP no PWA/site/Electron
- [x] 1.5 Contraste dos botões de resposta (`style.css:264-271`); remover verde fixo do 2º botão

> Nota: com o item 2.4, qualquer mudança nos arquivos gera um novo cache do service worker — as correções chegam a quem já instalou.

## Fase 2 — Build e CI confiáveis
- [x] 2.1 Caminhos relativos nos scripts (`scripts/cc_build.py`) · [x] 2.2 versão a partir do manifest · [x] 2.3 fonte dos ícones empacotada (`scripts/fonts/`)
- [x] 2.4 Service worker (cache por versão + hash do conteúdo, só `res.ok`, fallback só para navegação; zips antigos da PWA removidos)
- [x] 2.5 Gradle `rootProject.name` sem espaço · [x] 2.6 workflows em `.github/workflows/` (ci, pages, android, windows, ios) · [x] 2.7 `download/conta-comigo/` como fonte única (Firefox/PWA fora do Git) · [x] 2.8 axe-core no CI (`scripts/a11y_check.cjs` + baseline; workflow `ci.yml` no kit) · [x] 2.9 [eu] script de teste SHA-256 (`scripts/test_sha_cc.js`, substituído na v2.6.2 por `tests/engine.test.cjs`)

## Fase 3 — Acessibilidade WCAG 2.1 AA
- [x] 3.1 aria-labels textuais via i18n (`data-i18n-label`, pt/en/es) · [x] 3.2 labels em todos os campos do painel e do onboarding (`for`/`aria-labelledby`) · [x] 3.3 modal com `role=dialog`, fundo `inert`, foco preso e devolvido; popover de perfis com `aria-expanded` e Esc
- [x] 3.4 região `aria-live` (pergunta, cena, elogios, avisos) + nome acessível da cena (“5 🍎 (2 riscados)”) · [x] 3.5 anel de foco na cor do texto (≥3:1 em todos os temas) · [x] 3.6 alvos ≥44px no jogo e no painel · [x] 3.7 `prefers-reduced-motion` também no painel, nos confetes e ao vivo · [x] 3.8 contrastes restantes (texto secundário dos 7 temas, botões azuis/verdes, vermelhos, cartões bloqueados)
- Check de CI cobre início, perfis, loja, conquistas, rodada, portão e painel nos temas claro, escuro e alto contraste — baseline zerado.

## Fase 4 — Experiência da criança
- [x] 4.1 "Jogar" acima da dobra: os modos vêm logo após a marca (1º jogo em y≈190 em vez de 741 num celular de 844px; popup 515→154); topbar numa linha de 320 a 1024px (tela cheia sai no app instalado e em celulares ≤430px, versão fica no painel)
- [x] 4.2 só os modos desbloqueados + um card "Próximo prêmio" com barra de estrelas (no 1º uso: 3 modos + 1 prêmio em vez de 10 cadeados); tocar fala quanto falta
- [x] 4.3 senha adiada: sem modal no primeiro uso — o portão do ⚙️ cria a senha quando o adulto entrar; até lá o ⚙️ tem um ponto e o nome "senha ainda não criada"
- [x] 4.4 calendário de missões: dias pelo `Intl` no idioma do app ("Seg Ter Qua…"/"Mon Tue…"), hoje com anel, dia sem jogo como círculo vazado e texto por extenso para leitor de tela
- [x] 4.5 fonte própria empacotada: Nunito variável (OFL, subconjunto latino, 39 KB) em `css/fonts/`, também no cache do service worker
- Bônus: o balão do mascote ficava preso na tela do jogo e nunca aparecia na inicial (saudação e avisos só por voz) — agora aparece na tela ativa

## Fase 5 — Design system
- [x] 5.1 **Tokens semânticos** em três camadas no topo de `css/style.css`:
  - Primitivos: matizes, `--ans-*`, `--on-accent`, `--on-yellow`, `--glow`, `--scrim` e as escalas.
  - Semânticos por tema: `--ink`, `--card`, `--line`, `--tint`, `--pick-*`, `--sel-bg`, `--success-bg/-text`, `--attention`, `--link` e `--danger-text`.
  - Derivados em `body`, que resolvem com o tema ativo: `--lift-0..4`, `--float-1..3` e `--track`.
  - Cada tema e o `body.hc` redefinem só a camada semântica. Saíram as regras `body.hc .x` e `[data-theme=espaco] .x` que repintavam componentes.
- [x] 5.2 **Escalas**:
  - Tipografia `--fs-2xs..display` (10/11/12,5/14/16/19/24/28/40), aplicada a todo texto de interface fora dos overrides por breakpoint.
  - Raio `--r-xs..pill` (8/12/16/20/24/999), aplicado em 100% das regras do CSS e das páginas.
  - Sombra `--lift-*`/`--float-*`, em 100%.
  - Movimento `--dur-1..3`, em todas as `transition`.
  - Espaço `--sp-1..8`, definido e documentado.
  - Os tamanhos de emoji e de número do jogo ficam fora, porque são ilustração.
- [x] 5.3 **Cores soltas eliminadas**. Hex só nas prévias de tema da loja (`.swatch`) e nos confetes por tema.
  - Sobre `--yellow` o texto agora é `--on-yellow`.
  - Os botões da nova aba usavam `--green`/`--orange` com texto branco (cerca de 2:1) e agora usam `--ans-1..4`.
  - `.big-btn` e o botão da demo passaram de `--blue` para `--ans-1`.
  - Correção: o fundo dos grupos de objetos no alto contraste era creme com tinta branca; agora é preto.
  - O selo da versão web virou a classe `.web-stamp`.
  - Inputs e seleção seguem o tema (`accent-color`, `::selection`), e o `color-scheme` é escuro no Espaço e no alto contraste.
- [x] 5.4 **`prefers-color-scheme`**:
  - Novo tema `auto`, padrão de perfis novos: Clássico no claro, Espaço no escuro (os dois grátis).
  - Ele troca ao vivo, sem recarregar, e quem já escolheu um tema continua nele.
  - Fica em `applyTheme()`/`resolvedTheme()` em `engine.js`, usado no jogo, no painel e na nova aba. A nova aba antes ignorava o tema.
  - O painel ganhou a opção "Automático" e mostra o tema comprado (Oceano, Doces, Neve) em vez de deixar o seletor em branco. A loja marca "em uso" o tema resolvido.
- [x] 5.5 **`/impeccable init` e documentação**:
  - `PRODUCT.md`: usuários, propósito, restrições e princípios, confirmados nas respostas.
  - `DESIGN.md`: North Star "A Caixa de Brinquedos", tokens no frontmatter e regras nomeadas, com o sidecar `.impeccable/design.json`.
  - Polish:
    - O botão "Salvar senha" do painel mostrava `ob_create`, chave removida por engano na Fase 4.
    - `fixed_lbl` (chip de nível com dificuldade fixa) e `t_2x2` (enunciado de estrela = 5 reais) nunca tinham existido.
    - As chaves `pp_*` faltavam em espanhol.
    - A nova aba no alto contraste ficou sem contorno do cartão.
    - Novo `scripts/i18n_check.cjs`, já incluído no `kit-fase1/workflows/ci.yml`, impede chave faltando em pt/en/es.
  - Verificado:
    - axe color-contrast com 0 violações nos 8 modos de cor × 5 páginas;
    - `a11y_check` com 0;
    - teclado OK;
    - topbar sem estouro de 320 a 1024px;
    - antes/depois nos 7 temas e no alto contraste, com variação de no máximo ±1px de texto.

## Fase 6 — Funcionalidade e distribuição
- [x] 6.1 [eu] **"Fase A": voz e armazenamento bimodais** (`js/engine.js`):
  - **Detecção:** `capPlugin()` reconhece o app Capacitor sem bundler.
  - **Armazenamento:**
    - No app, o progresso vai para o **Preferences** nativo, que o sistema não recolhe. O `localStorage` fica como 2ª cópia, e na leitura vale a cópia gravada por último.
    - `clearSavedState()` apaga todas as camadas antes do reset do painel recarregar.
    - Na PWA instalada, `navigator.storage.persist()` pede armazenamento persistente.
  - **Voz:**
    - No app, usa o **AVSpeechSynthesizer** via plugin TextToSpeech, com a mesma escolha de voz, velocidade, tonalidade e prosódia.
    - O contador `gen` impede que uma fala cancelada avance a fila.
    - No Safari do iOS, há um `cancel()` antes de cada `speak()`.
  - **Tela cheia:** o botão some no app e nos navegadores sem a API (iPhone).
  - **Teste:** fiz com um Capacitor simulado. Passaram evicção do `localStorage`, cópia mais nova, voz nativa com a voz 🌟, cancelamento no meio e reset. A web, a extensão e a PWA não mudaram: a11y, teclado, topbar e contraste continuam iguais.
- [ ] 6.2 [você] ativar o Pages · 6.3 [você] AAB assinado e teste em aparelho
- [ ] 6.4 [você] testar os instaladores do Windows
- [x] 6.5 [eu] **iOS/Capacitor ("Fase B")** em `native/ios/`:
  - **Projeto:** Capacitor 8 com Swift Package Manager e os plugins Preferences e TextToSpeech, gerado e versionado.
  - **`scripts/build_ios_www.py`:**
    - parte da PWA, sem service worker nem manifest;
    - gera o ícone 1024 sem alfa e a splash na cor da marca;
    - copia a versão do jogo para o `MARKETING_VERSION`.
  - **Info.plist:** pt-BR/en/es, `ITSAppUsesNonExemptEncryption=false` e arm64.
  - **`kit-fase1/workflows/ios.yml`:** em macOS-15, compila para o Simulador e para aparelho sem assinatura e publica o `.app` do Simulador.
  - O ícone do PWA passou para `cc_build.draw_icon()` e saiu byte a byte igual.
  - Guia em `native/ios/README.md`.
  - **Falta:** compilar de verdade no Xcode, que só roda no CI macOS ou num Mac. A assinatura e o TestFlight dependem da conta Apple ("Fase C").
- [ ] 6.6 [você] contas de loja e política de privacidade:
  - **Lojas:** Google Play (US$ 25), Microsoft Store e Apple (US$ 99/ano).
  - **Política de privacidade:** já sai no Pages.
  - **Kids Category da Apple:** o app não tem links externos nem compras, então não precisa de portão extra.

## Fase 7 — Responsivo por natureza (testes manuais em celular)
Disparada pelos testes manuais: distorções e botões fora do lugar. Auditoria com `/apple-design` e `/design-system`, medida em 8 aparelhos emulados × 25 telas.
- [x] 7.1 **Correções críticas** (`css/style.css`):
  - **Estouro horizontal:** a faixa dos 7 dias usava largura de desktop e saía da tela em 320px e 280px. Agora os dias dividem a largura.
  - **Celular deitado:** a home em 2 colunas empurrava cartões e botões para fora de uma tela de 568px (agora só a partir de 700px). O jogo ganhou duas colunas, com respostas à direita.
  - **Popover de perfis:** passou de 403px numa tela de 320px e ficava inalcançável. Agora é `fixed`, com altura pela tela real e rolagem interna.
  - **Comparar:** o lado B estourava e ficava cortado. Os dois lados dividem a largura por igual.
  - **Loja:** os botões ficavam desalinhados e quebravam o rótulo. Agora têm a mesma altura e ficam na base.
  - **Alvos de toque:** o `@media (hover: none)` reduzia o `.mini-btn` para 40px e desfazia o mínimo de 44px da Fase 3. Também subiram para 44px o `.big-btn`, o `.ans`, os botões da home, o OK do modal e os objetos tocáveis.
  - **Texto:** nenhum abaixo de 11px (havia 9, 9,5, 10 e 10,5px).
  - **Altura:** `dvh` com reserva e jogo em duas colunas até 820px de altura, o que também vale para iPad e notebook.
  - **Topbar:** o selo de versão sai abaixo de 560px.
- [x] 7.2a **Teste de regressão** `scripts/resp_check.cjs` no CI. Com o CSS antigo ele acusa 300 problemas, e com o novo passa.
- [ ] 7.2 **Dívida do design system** (a fazer; mexe em muito CSS, então precisa de rodada própria):
  - **Faixas de largura:** são 12 faixas de largura; o ideal é consolidar em 4 ou 5 classes de tamanho.
  - **Popup vs página cheia:** 235 seletores `body.page-mode` duplicam cada regra. O ideal é um só conjunto de regras fluidas, em que o popup seja só uma janela pequena.
  - **Tokens `--sp-*`:** estão definidos e têm 0 usos.
  - **Valores soltos:** 247 valores soltos de padding/margin/gap e 124 tamanhos de fonte em px nos overrides.
  - **Tipografia:** passar a escala para `clamp()`.
- [ ] 7.3 **Testar em aparelho real:** notch e Dynamic Island (`safe-area`), barra de URL dinâmica e fonte grande do sistema (Android/iOS). O emulador não reproduz esses três.

## Fase 8 — Auditoria de outubro (v2.6.2)
Auditoria de segurança, estrutura e design com `/security-review`, `/anthropic-skills:secure-ai-devsecops`, `/code-review`, `/apple-design`, `/impeccable audit` e `/setup-engine`. As letras seguem o plano de ação da auditoria.
- [ ] 8.A [você] nova upload key do Android e os 4 secrets (item 0.1). Depois, [eu] troco o fingerprint em `assetlinks.json`, `strings.xml` e `twa-manifest.json`, e o CI passa a recusar o antigo.
- [x] 8.B **Dados e senha:**
  - **Backup importado:** os cartões de revisão aceitam só os campos de cada gerador, como inteiros. Os mapas do perfil, o tema e o idioma também são validados.
  - **Senha dos responsáveis:** usa PBKDF2-SHA-256 (600 mil rodadas), com migração no próximo acesso e mínimo de 6 caracteres.
  - **Segredos:** hash, sal e lembrete não vão no backup nem no sync.
  - **PWA:** o zip 2.6.0 da PWA, que era sem CSP, saiu.
- [x] 8.C **Acessibilidade:**
  - **Texto:** fica em rem e segue o tamanho do sistema, inclusive o Dynamic Type no iOS. Nada sai da tela com o texto a 200%, e o CI verifica isso.
  - **Windows:** zoom até 300%, e a janela abre na cor do tema.
  - **Contraste e perfil:** novo token `--accent-text`; o perfil atual ganha `aria-current` e ✓.
  - **Preferências do sistema:** o alto contraste segue o `prefers-contrast` e o `prefers-reduced-transparency` tira o desfoque da barra.
  - **Cronômetro e web:** o cronômetro tem nome acessível, e `web/index.html` foi sincronizado.
- [ ] 8.C2 [você] decidir se o cronômetro de pontos começa desligado para perfis novos.
- [x] 8.D **Dependências:**
  - **Windows:** Electron 44.9.2 e electron-builder 26.18.0. O npm audit passou de 14 avisos para 0.
  - **Automação:** Dependabot ativo, com espera de 14 dias, e `gradle/actions` fixada por commit.
  - **iOS:** o `@capacitor/cli` fica para o Dependabot, porque os avisos são de build e a correção é desta semana.
- [ ] 8.D3 [você] proteger a `main`: PR com CI verde antes do merge.
- [x] 8.E **Estrutura:**
  - **Regras no engine:** estrelas, pontos, missões, conquistas e fim de rodada viraram funções sem DOM, com 19 testes `node:test` no CI.
  - **Guarda de cópias:** `scripts/sync_check.cjs` confere a tela do jogo, os workflows do kit e a versão.
  - **`CLAUDE.md`:** novo, com a stack, as regras e os comandos de verificação.
  - **Correções de comportamento:** o combo zera no erro, e a medalha do Contra o Tempo sai na mesma rodada.
- [ ] 8.E4 Juntar popup e `page-mode` num CSS só e aplicar a escala tipográfica aos ajustes por breakpoint (item 7.2). Precisa de rodada própria com revisão visual.
- [x] 8.F **Polimento:**
  - O toast não deixa mais o ⭐ sozinho na linha.
  - Os enfeites saem durante a rodada.
  - O movimento reduzido esmaece em vez de cortar.
  - O ícone de tela cheia virou 📺.

## Fase 9 — Publicação nas lojas (v2.6.3)

- [x] 9.1 Pacote das 5 lojas (Chrome, Edge, Firefox, Microsoft Store, Google Play) em pt, en e es: roteiros, 117 capturas, imagens promocionais, política trilíngue e vídeo.
- [x] 9.2 Identificador único `com.klivfy.conta.comigo.matematica` (`IDENTIFICADORES.md`), conferido pelo `sync_check`.
- [x] 9.3 Android: minSdk 24, targetSdk 36, R8 com mapping, AGP 8.13.2, Gradle 8.14.3; scripts de assinatura para Linux/macOS e Windows.
- [x] 9.4 Contagem por toque no idioma do jogo.
- [ ] 9.5 [você] ligar o GitHub Pages; criar o app novo no Play Console; identidade da Partner Center; conta Apple.
- [ ] 9.6 Moeda do modo Dinheiro por região e voz es-419 (lacunas L1 e L3 de `PLATAFORMAS-E-MERCADOS.md`).
- [x] 9.7 Limpeza do repositório: 155 arquivos sem uso fora (geradores de estudos com caminho de outra máquina, scripts avulsos de versões antigas, PDFs intermediários, guia de push manual, capturas `qa/` e `qa2/`), 16 chaves de texto sem uso nos 3 idiomas, e `scripts/scan_csp.py` consertado e no CI.

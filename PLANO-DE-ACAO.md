# Plano de ação — Conta Comigo

Baseado na auditoria estrutural (code-review, security, design-system, a11y, apple-design, design-critique, impeccable) + pendências anteriores.
Legenda: **[eu]** código na branch · **[você]** ação em conta/GitHub/loja.

## Fase 0 — Emergência de segurança
- [ ] 0.1 [você] Gerar novo keystore fora do repo e guardar em GitHub Secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASS`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASS`)
- [x] 0.2 [eu] Remover `upload.jks`, `sha256.txt` e senhas do repo; ignorar `native/android/keystore/`
- [x] 0.3 [eu] Gradle e workflow Android leem o keystore de secrets/variáveis de ambiente
- [ ] 0.4 [você] Revogar o token pessoal usado no primeiro push, que foi compartilhado numa sessão anterior (os workflows já estão em `.github/workflows/` — 2.6)
- [x] 0.5 ~~Decidir hospedagem do `assetlinks.json` na raiz do domínio~~ — não é mais preciso: desde 9.8 o app Android leva o jogo dentro do pacote

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
  - [x] **Tokens `--sp-*`:** 211 valores soltos de padding/margin/gap que casavam com a escala (2, 4, 6, 8, 12, 16, 24 e 36px) viraram `var(--sp-N)`, e 30 `font-size` em rem viraram `var(--fs-*)`. Conferido por pixel (`scripts/visual_diff.cjs`: 10 tamanhos de tela × 15 telas, mais o popup, também com texto a 200%), sem nenhuma mudança visível. `scripts/tokens_check.cjs` trava a volta dos valores soltos.
  - [x] **Tamanhos de fonte em px:** os 54 que restam são todos emoji e ilustração (`.obj`, `.mascot`, `.mode-emoji`…), que a regra do projeto manda ficar em px. Os "124" da contagem anterior misturavam isso com texto; não há texto de interface em px.
  - [ ] **Valores soltos fora da escala:** 137 (10px, 14px, 18px…). Trocar exige escolher o degrau mais próximo, o que mexe no visual; fica para a rodada com revisão humana.
  - **Tipografia:** passar a escala para `clamp()`.
- [ ] 7.3 **Testar em aparelho real:** notch e Dynamic Island (`safe-area`), barra de URL dinâmica e fonte grande do sistema (Android/iOS). O emulador não reproduz esses três.

## Fase 8 — Auditoria de outubro (v2.6.2)
Auditoria de segurança, estrutura e design com `/security-review`, `/anthropic-skills:secure-ai-devsecops`, `/code-review`, `/apple-design`, `/impeccable audit` e `/setup-engine`. As letras seguem o plano de ação da auditoria.
- [ ] 8.A [você] nova upload key do Android e os 4 secrets (item 0.1). Com o app Capacitor (9.8) não há fingerprint para trocar no repositório; sem os secrets o CI gera o AAB sem assinatura, para assinar com `scripts/assinar_aab.ps1`.
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
- [ ] 8.E4 Juntar popup e `page-mode` num CSS só e consolidar as faixas de largura (item 7.2). Medido em 29/10/2026: as 235 regras `body.page-mode` (93 seletores) não são cópias; só 4 de 135 declarações repetem o valor do CSS base, então não há o que apagar sem mudar o visual. É redesenho fluido (`clamp()`), e precisa de pessoa olhando. A rede de segurança já existe: `node scripts/visual_diff.cjs salvar <pasta>` antes e `comparar <pasta>` depois.
- [x] 8.F **Polimento:**
  - O toast não deixa mais o ⭐ sozinho na linha.
  - Os enfeites saem durante a rodada.
  - O movimento reduzido esmaece em vez de cortar.
  - O ícone de tela cheia virou 📺.

## Fase 9 — Publicação nas lojas (v2.6.3 e 2.6.4)

- [x] 9.1 Pacote das 5 lojas (Chrome, Edge, Firefox, Microsoft Store, Google Play) em pt, en e es: roteiros, 117 capturas, imagens promocionais, política trilíngue e vídeo.
- [x] 9.2 Identificador único `com.klivfy.conta.comigo.matematica` (`IDENTIFICADORES.md`), conferido pelo `sync_check`.
- [x] 9.3 Android: minSdk 24, targetSdk 36, R8 com mapping, AGP 8.13.2, Gradle 8.14.3; scripts de assinatura para Linux/macOS e Windows.
- [x] 9.4 Contagem por toque no idioma do jogo.
- [ ] 9.5 [você] ligar o GitHub Pages (política de privacidade e PWA; o app Android não depende mais dele); criar o app novo no Play Console; identidade da Partner Center; conta Apple.
- [x] 9.6a Moeda do modo Dinheiro por região (L1): real, euro, dólar, libra e peso mexicano pela região do aparelho; sem região conhecida, só "moedas". Escolha no painel (`currency`), validada em `normalizeDB`.
- [x] 9.6b Espanhol por região (L3): a voz pedida e a escolhida seguem a região do aparelho (es-ES, es-MX, es-US; as demais da América Latina caem em es-MX), e a pergunta do troco diz "cambio" ou "vuelto" conforme o país. Voz robótica não ganha por região, e a escolha manual dos responsáveis continua valendo.
- [x] 9.7 Limpeza do repositório: 155 arquivos sem uso fora (geradores de estudos com caminho de outra máquina, scripts avulsos de versões antigas, PDFs intermediários, guia de push manual, capturas `qa/` e `qa2/`), 16 chaves de texto sem uso nos 3 idiomas, e `scripts/scan_csp.py` consertado e no CI.
- [x] 9.8 **Android com o jogo dentro do app (Capacitor 8), no lugar da TWA.** A TWA abria `klivfy.github.io/Conta-Comigo/` e mostrava 404: o Pages nunca publicou, o `assetlinks.json` precisava estar na raiz do domínio (outro repositório) e o fingerprint era o da chave vazada. Agora o jogo é servido de dentro do APK/AAB:
  - **Projeto:** `native/android/` (como o iOS): `scripts/build_android_www.py` gera o `www`, o ícone adaptativo (com monocromático) e a abertura; `npx cap sync android` liga os plugins. O CI compila também nos PRs e, sem os secrets, publica o AAB sem assinatura.
  - **Plugins:** Preferences (progresso), TextToSpeech (voz), Filesystem + Share (backup pela folha de compartilhar, porque o WebView não baixa `blob:`), App (botão Voltar). Os ícones das barras do sistema ficam claros nos temas escuros.
  - **Nome traduzido** no Android: Count With Me e Cuenta Conmigo (lacuna L5).
  - **Fora:** `twa-manifest.json`, `assetlinks.json` e a cópia dele no Pages, a conferência de fingerprint no CI e a parte Android de `scripts/fase1_icons.py`.
- [ ] 9.9 [você] testar o AAB num aparelho pelo teste fechado (lista no fim de `loja/lojas/google-play.md`): esta sessão não tem emulador Android.
- [x] 9.10 No repositório: o vídeo promocional (`loja/video/`, mp4 e legenda) e o gerador dele (`scripts/video/`, com caminhos relativos), e `scripts/app_check.cjs` no CI (Voltar do Android, backup pela folha de compartilhar e barras do sistema, com uma ponte Capacitor simulada).
- [ ] 9.11 [você] decidir entre os dois workflows do GitHub Pages: o `jekyll-gh-pages.yml` publica o README e deixa a política em `/docs/…`; o `pages.yml` publica o jogo e a política na URL das lojas. Os dois rodam a cada push na `main`.
- [x] 9.12 **Versão 2.6.4** (29/10/2026): sobe de 2.6.3 porque o PR #13 muda o comportamento (progresso entre páginas, sync por perfil, acessibilidade, moeda e voz por região) e uma loja recusa pacote com o mesmo número. `versionCode` 264; zips, notas de versão em pt, en e es, política (campo de versão) e changelogs atualizados; o `sync_check` confere os 13 lugares. Nenhum envio às lojas foi feito.
- [x] 9.13 **Áudio, Android local, canais e cookies** **Versão 2.7.0**, `versionCode` 270 (29/10/2026): sobe de 2.6.4 porque as lojas recusam número repetido; o AAB 2.6.4 que estava sendo assinado fica sem estas mudanças.
  - **Efeitos sonoros**: timbre de caixinha de música (fundamental + harmônicos), ataque macio, filtro, reverberação curta e compressor; notas na escala pentatônica, com variação mínima de afinação e tempo; o "errou" virou um "ops" suave. Corrigido: o interruptor "Efeitos sonoros" (`sfxOn`) existia nas opções, mas o motor nunca o lia.
  - **Voz**: padrão novo de tom 1,02 e ritmo 0,92 (o 1,15 soava fino; quem nunca mexeu nos controles recebe o novo, quem escolheu mantém); entonação por tipo de frase (pergunta sobe, exclamação anima, afirmação desce) e pausas menores; sem internet, voz que depende de rede perde para a instalada; as opções sugerem instalar um pacote de voz quando a melhor voz é comum. Limite honesto: a voz continua sendo a do sistema. Voz realmente natural e igual em todo aparelho exige gravações ou um modelo neural dentro do app (decisão de tamanho, licença e custo).
  - **Android sem PWA**: o pacote da PWA deixou de se chamar "android" (`conta-comigo-pwa-<versão>.zip`, `leia-me.md`); em navegador Android a página remove o manifesto e o service worker (não oferece instalar); o app do Android segue 100% local no AAB. README, PRODUCT, demo e `download/README.md` ajustados.
  - **Canais e crédito**: Privacidade, Termos de Uso e Suporte (`klivfy.com`) e o © 2026 Klivfy no rodapé da tela inicial e no painel dos responsáveis. Criança não abre link sozinha: conferência para adultos (conta de multiplicar) antes de qualquer link.
  - **Cookies e rastreamento**: aviso discreto com Aceitar tudo, Recusar tudo e Personalizar; botão "Personalizar aceites" sempre no rodapé e cartão "Sobre e privacidade" nas opções. Recusar é imediato; ligar qualquer coisa exige o adulto. Sem escolha, tudo opcional fica desligado. A escolha vale só no aparelho (nunca entra em backup ou sync). Hoje o app não usa nenhum rastreador: as chaves `Consent.allows('stats'|'track')` existem para qualquer recurso futuro respeitar a escolha.
  - [você] confirmar que `klivfy.com/privacidade`, `/termos-de-uso` e `/suporte` estão no ar; atualizar a política e o formulário "Segurança dos dados" da Play com o que o aviso diz; testar a voz e os efeitos num aparelho real; decidir se tira a permissão `INTERNET` do AAB depois do teste em aparelho (o jogo não precisa dela; abrir link usa o navegador do sistema).

## Fase 10 — Revisão de design de 29/10/2026 (taste-skill, impeccable, apple-design, emil-design-eng)
Detalhe, evidência e critérios de validação em `docs/revisoes/rodada-2026-10-29-design.md`. Notas: jogo 6,8/10 (taste), heurísticas 25/40 e auditoria técnica 14/20 (impeccable).
- [x] 10.0 [eu] **Feito na 2.7.1** (versionCode 271). Correções: **nova aba trava no primeiro acerto e não conta a ofensiva** (`confetti` não existe em `newtab.html`); nova aba e versão web fora dos testes de navegador; nome padrão "Jogador" em en/es; toast e balão cobrindo controles; "+" fora do lugar no celular; "Suas respostas" órfão; hover grudado no toque; contraste do selo web; botão da nova aba sem nome; nota interna no painel. Achado ao testar e também corrigido: **histórias e dicas em inglês e espanhol traziam o nome do objeto em português** ("Ana had 3 maçãs"); a lista `ITEMS` ganhou nomes e gênero em en/es. Teste novo `scripts/pages_check.cjs` no CI (nova aba, versão web, portão do painel); 53 testes do motor.
- [~] 10.1 [eu] Coerência com "nunca pune". **Feito (2.7.2):** cronômetro de tom único e desligado por padrão; loja mostra o caminho (tem/preço, barra, "Junte mais N ⭐!"); "Comprado! Desfazer" por 5 s; conquistas trancadas legíveis; aviso de cookies só no painel. **Lote D (feito, ainda 2.8.0):** mapa de domínio só dá veredito com 20 questões no modo (`masteryLabel`: "Poucos dados (5/20)", "Começando", "Praticando", "Domina", sempre em texto, nunca "ruim"); pontos de nível com texto para leitor de tela; "Precisão" vira "—" até 20 questões; semanas como "18/10 a 24/10" e "esta semana" (`weekRange`, com teste e semanas parciais na virada do ano); campo de importar sem "JSON".
- [x] 10.2 [eu] **Feito (2.7.3):** curvas próprias (`tokens_check` falha sem curva), som no `pointerdown`, diálogos sem quique, modo calmo que mantém o press, mascote quica 3 vezes, timer em `scaleX`, tracking negativo. **Dívida:** `attention` e `pulse` ainda animam `box-shadow` em loop (lote A).
- [~] 10.3 [eu] Tipografia e composição. **Feito (2.7.4):** piso de 12 a 13px na escala de rem, objetos do palco crescem em tela grande, 🏠 duplicado fora, selo de versão fora da barra infantil. **Lote A (em andamento):** grade da home sem órfão (10.3.2), órfãos (10.3.4), dobra a 200% no iPhone SE (10.3.7), consolidar os tamanhos em px e corrigir o `DESIGN.md` (10.3.1), `box-shadow` em loop.
- [x] 10.4 [eu] Painel: ~~conferência de adulto antes de criar a senha~~ (**feito na 2.7.1**, 10.4.1). **Lote C (feito, ainda 2.8.0):** resumo da semana em uma frase com a próxima ação (`parentSummary`, com teste: só afirma com 3 respostas recentes; mistar e tempo nunca viram sugestão) · barra de 9 âncoras fixa (Progresso a Dados) · um primário por seção (secundários em contorno; links legais viram links; Aceitar e Recusar com o mesmo peso) · zona de perigo própria em vermelho com aviso de backup · desktop: rótulo limitado a 340px · emoji dos títulos escondido do leitor de tela, título do portão sem repetição, botão de voz por jogador com texto "Voz". Achado: a barra de âncoras alargava a página a 444px em 390px (corrigido com `width:100%`; `pages_check` agora mede isso).
- [~] 10.5 [eu] Novas funcionalidades. **Feito (2.8.0):** N1 boas-vindas com nome falado · N2 fim de rodada com barra "faltam N ⭐", fichas com emoji e conta errada por voz (as estrelas voando ficam para depois) · N3 "Jogar agora". **Lote B (feito, ainda 2.8.0):** N6 loja ordenada pelo que já é dela e depois pelo que falta menos (`shopSort`, com teste), voz "Faltam 5 ⭐ para comprar: Óculos escuros" e botão "Ver" com prévia do tema por 4 s, sem salvar · N7 missões e conquistas viram botões que falam objetivo e progresso, e o aviso diz qual missão fechou. **Lote F (feito, ainda 2.8.0):** N4 arrastar para contar, protótipo só em Contar: a cesta 🧺 recebe o objeto arrastado (captura de ponteiro, borda que segura com no máximo 48px de excesso, volta com ease-out ao soltar fora, sem animar no modo calmo) e fala o número. Alternativas sem arrastar (WCAG 2.5.7): tocar ou Enter no objeto conta como antes, e a própria cesta é um botão que põe o próximo objeto. A cesta não muda resposta nem pontuação (nenhum campo novo no perfil). `dragResist` e `dropHit` no motor, com teste; `pages_check` cobre mouse, toque e teclado. **Lote E (feito no código, ainda 2.8.0; falta o teste no aparelho):** N5 háptica com `@capacitor/haptics` 8.0.2 (Android e iOS; lock files e arquivos de plugin do Gradle e do SPM atualizados à mão no formato do `cap sync`). Acertar vibra "sucesso", tocar e errar dão o toque leve (errar nunca usa a notificação de erro), estrela dá toque médio; no máximo um toque a cada 60 ms; independe do som; **desligada no modo calmo e em "reduzir movimentos"**. Opção "Vibração leve" no painel (`hapticsOn`, padrão ligado, validada no `parseDB` com teste), só aparece nos apps. **[você]** ao gerar o AAB: rodar `npm install` e `npx cap sync android` em `native/android` (e `ios`), conferir que o manifesto mesclado ganha `VIBRATE` (permissão comum, sem declaração na Play) e sentir o toque num aparelho real. **Pendentes:** N8 voz neural embarcada (projeto próprio, fora dos lotes).
- [ ] 10.L [eu] **Lotes de trabalho sem subir versão (decisão de 29/10/2026):** o trabalho novo acumula na 2.8.0 (PR #13); `manifest.json`, `versionCode`, notas de loja, README e zips só mudam quando o responsável decidir fechar a versão. Ordem: **A** fechar a 10.3 · **B** loja e narração (N6, N7) · **C** painel (10.4.2 a 10.4.5) · **D** dados do painel (10.1.5, 10.1.6) · **E** háptica (N5, precisa de teste no aparelho) · **F** arrastar para contar (N4). Critério de cada lote: testes do motor, a11y, `pages_check`, `resp_check` normal e a 200%, `app_check`, CSP, tokens, i18n e CI verdes; lotes de CSS com `visual_diff`.
- [x] 10.D [você] Decisões de 29/10/2026: **D1** aviso de cookies sai da home e aparece na primeira abertura do painel ("Personalizar aceites" continua no rodapé) · **D2** cronômetro desligado por padrão em perfil novo, barra de um tom só · **D3** só "Auto" na home, níveis 1 a 5 no painel. Execução nas fases 10.1 e 10.3. D4 (mascote no primeiro dia) segue em aberto.

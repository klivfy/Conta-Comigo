# Plano de ação — Conta Comigo

Baseado na auditoria estrutural (code-review, security, design-system, a11y, apple-design, design-critique, impeccable) + pendências anteriores.
Legenda: **[eu]** código na branch · **[você]** ação em conta/GitHub/loja.

## Fase 0 — Emergência de segurança
- [ ] 0.1 [você] Gerar novo keystore fora do repo e guardar em GitHub Secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASS`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASS`)
- [x] 0.2 [eu] Remover `upload.jks`, `sha256.txt` e senhas do repo; ignorar `native/android/keystore/`
- [x] 0.3 [eu] Gradle e workflow Android leem o keystore de secrets/variáveis de ambiente
- [ ] 0.4 [você] Revogar o token antigo exposto (os workflows já estão em `.github/workflows/` — 2.6)
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
- [x] 2.5 Gradle `rootProject.name` sem espaço · [x] 2.6 workflows em `.github/workflows/` (ci, pages, android, windows, ios) · [x] 2.7 `download/conta-comigo/` como fonte única (Firefox/PWA fora do Git) · [x] 2.8 axe-core no CI (`scripts/a11y_check.cjs` + baseline; workflow `ci.yml` no kit)

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

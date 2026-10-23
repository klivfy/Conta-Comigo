---
name: Conta Comigo
description: Matemática lúdica para crianças de 4 a 8 anos — offline, trilíngue, sem coleta de dados.
colors:
  ink: "#33355c"
  ink-soft: "#60647c"
  card: "#ffffff"
  line: "#e3e6f2"
  sky-bg: "#eaf6ff"
  cream-bg: "#fff7e8"
  blush-bg: "#fff0f4"
  answer-blue: "#2f5ce0"
  answer-blue-edge: "#1f3f9e"
  answer-teal: "#0e7c86"
  answer-teal-edge: "#0a5960"
  answer-amber: "#b85500"
  answer-amber-edge: "#8a4000"
  answer-violet: "#6b3fd4"
  answer-violet-edge: "#4b2a9e"
  success-strong: "#15803d"
  success-strong-edge: "#0f5c2c"
  danger: "#c62828"
  link: "#2f5ce0"
  sun-yellow: "#ffc93c"
  on-yellow: "#5c4300"
  fox-orange: "#ff9a3d"
  brand-a: "#ff8a3d"
  brand-b: "#ff5e7e"
  warm-tint: "#fff4dc"
  pick-bg: "#fff8e0"
  success-bg: "#e6fbe9"
  success-text: "#1c7c3d"
  space-ink: "#eaf0ff"
  space-card: "#273159"
  space-bg: "#131a33"
  hc-black: "#000000"
  hc-yellow: "#ffff00"
typography:
  display:
    fontFamily: "Conta (Nunito variável, empacotada), Nunito, Segoe UI, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "2px"
  headline:
    fontFamily: "Conta, Nunito, Segoe UI, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.2
  title:
    fontFamily: "Conta, Nunito, Segoe UI, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 800
    lineHeight: 1.3
  body:
    fontFamily: "Conta, Nunito, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.45
  label:
    fontFamily: "Conta, Nunito, Segoe UI, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1.3
rounded:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  pill: "999px"
spacing:
  "1": "2px"
  "2": "4px"
  "3": "6px"
  "4": "8px"
  "5": "12px"
  "6": "16px"
  "7": "24px"
  "8": "36px"
components:
  answer-button:
    backgroundColor: "{colors.answer-blue}"
    textColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "14px 0 12px"
  answer-button-correct:
    backgroundColor: "{colors.success-strong}"
    textColor: "{colors.card}"
    rounded: "{rounded.lg}"
  big-button:
    backgroundColor: "{colors.answer-blue}"
    textColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "13px"
  big-button-alt:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "13px"
  mini-button:
    backgroundColor: "{colors.answer-blue}"
    textColor: "{colors.card}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
    height: "44px"
  mode-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "8px 6px 7px"
  chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 10px"
  chip-selected:
    backgroundColor: "{colors.pick-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
  badge:
    backgroundColor: "{colors.sun-yellow}"
    textColor: "{colors.on-yellow}"
    rounded: "{rounded.pill}"
    padding: "2px 7px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 13px"
    height: "44px"
---

# Design System: Conta Comigo

> Fonte da verdade no código: `download/conta-comigo/css/style.css`, onde estão as três camadas de tokens no topo do arquivo. Os valores do frontmatter acima são os do tema **Clássico**. Os outros temas redefinem só os tokens semânticos (veja **Colors › Temas**).

## Overview

**Creative North Star: "A Caixa de Brinquedos"**

Cada controle é uma peça grossa e arredondada, do tamanho de um dedo de criança. Ele tem uma aresta inferior sólida e afunda quando é tocado, como bloco de montar ou botão de brinquedo. As cores funcionam como peças de encaixe: quatro cores firmes nas respostas, um amarelo-sol para "olha aqui" e o laranja da raposa como assinatura. Os fundos são degradês de céu claro, para que as peças sejam o que salta à vista.

A interface fala com quem ainda não lê. O emoji é a ilustração (🦊 mascote, 🍎 objetos de contagem). A voz do sistema narra cada pergunta. O texto é curto e grosso (peso 700–900), e nada depende só da leitura. A densidade é baixa: poucos elementos por tela e alvos de 44px ou mais. Tocar e acertar é o primeiro passo em qualquer tela.

O sistema é tátil e fofinho, não "flat". Ele nunca pune: o erro vira dica, e o tempo só tira o bônus. O movimento é alegre (pop, bounce, confete), mas sempre desligável pelo modo calmo, pelo "reduzir movimento" do painel ou pelo `prefers-reduced-motion`.

**Key Characteristics:**
- Botões em 3D: aresta sólida (`0 Npx 0`) da própria cor, mais escura, que some no `:active` com `translateY`.
- Raios generosos (12–24px) e pílulas para chips e contadores.
- Quatro cores de resposta com texto branco de no mínimo 4,5:1. O verde é reservado para "acertou".
- Sete temas compráveis e um modo de alto contraste, todos pela mesma camada de tokens semânticos.
- Fonte própria empacotada (Nunito variável, OFL, como `Conta`) e emojis do sistema como ilustração.

## Colors

A paleta é de brinquedo: matizes saturados para enfeite e identidade, versões escurecidas para tudo que carrega texto, e fundos pastel em degradê.

### Primary
- **Azul Resposta** (#2f5ce0): primeira resposta, botão principal (`.big-btn`), `.mini-btn` e links. Aresta em #1f3f9e.
- **Laranja Raposa** (#ff9a3d): assinatura e atenção (ponto de "falta configurar", barra do próximo prêmio, recorde). É só enfeite, nunca fundo de texto. O degradê do título vai de #ff8a3d a #ff5e7e.

### Secondary
- **Verde-Petróleo** (#0e7c86), **Âmbar Queimado** (#b85500) e **Violeta Brinquedo** (#6b3fd4): respostas 2 a 4, cada uma com a sua aresta (#0a5960, #8a4000, #4b2a9e).
- **Verde Acerto** (#15803d): exclusivo do feedback de acerto e do estado "em uso".

### Tertiary
- **Amarelo-Sol** (#ffc93c): selos ("Próximo prêmio"), combo, dica pulsante e brilho (`--glow`). Texto sobre ele sempre em **Marrom-Mel** (#5c4300).
- **Matizes de enfeite** (`--blue`, `--green`, `--orange`, `--red`, `--purple`, `--cyan`, `--pink`, `--violet`, `--gold`, `--teal`, `--brown`): só na faixa superior dos cartões de modo, nos pontos de progresso e nos confetes. Nunca em texto.

### Neutral
- **Tinta Noturna** (#33355c): texto principal e anel de foco (`--focus` = `--ink`).
- **Tinta Suave** (#60647c): texto secundário. Tem no mínimo 4,5:1 sobre o cartão e sobre todos os fundos do tema.
- **Cartão** (#ffffff) e **Borda Nuvem** (#e3e6f2): superfície e contorno.
- **Céu, Creme e Rosado** (#eaf6ff → #fff7e8 → #fff0f4): degradê vertical do fundo.
- **Tinta Morna** (#fff4dc): fundo dos grupos de objetos contáveis.

### Temas
Cada tema redefine só os tokens semânticos: `--ink`, `--ink-soft`, `--sh` (cor da sombra), `--bg-a/b/c`, `--card`, `--line` e, quando precisa, `--tint`, `--success-*`, `--link` e `--danger-text`.
- **Clássico** e **Espaço**. Espaço é escuro: #131a33, cartão #273159, tinta #eaf0ff e `color-scheme: dark`.
- **Jardim**, **Arco-íris**, **Oceano**, **Doces** e **Neve**.

O **Alto contraste** (`body.hc`) tem fundo #000, tinta #fff, secundário e foco #ffff00, e borda branca em todo componente interativo.

O tema `auto` é o padrão de perfis novos: segue `prefers-color-scheme` ao vivo, Clássico no claro e Espaço no escuro.

### Named Rules
**The Enfeite-Não-Lê Rule.** Os matizes de marca (`--blue`, `--green`, `--orange`…) nunca levam texto em cima nem são cor de texto. Texto colorido usa `--ans-*`, `--success-strong`, `--danger`/`--danger-text` ou `--link`, que estão verificados em 4,5:1.

**The Verde-É-Acerto Rule.** O verde forte só aparece quando a criança acerta, ou num item "em uso". Nenhuma posição de resposta é verde por padrão.

**The Token-Antes-de-Hex Rule.** Componente usa token. Hex solto só existe nas prévias de tema da loja (`.swatch`), nos confetes por tema e na definição dos próprios tokens.

## Typography

**Fonte de exibição e de texto:** Conta (Nunito variável 200–1000, subconjunto latino, empacotada em `css/fonts/`), com Nunito, Segoe UI e system-ui como fallback.
**Fonte para dislexia** (opcional, `body.dys`): Trebuchet MS, Verdana ou Comic Sans MS, com espaçamento extra.

**Character:** é uma sans arredondada e pesada, amigável como letra de livro infantil. Os pesos ficam altos (700 a 900) para os traços aguentarem tela pequena e leitor iniciante.

### Hierarchy
Escala `--fs-*` para texto de interface: 10, 11, 12,5, 14, 16, 19, 24, 28 e 40px.
- **Display** (900, `--fs-display` 40px, que vai a 64px na página cheia): a equação e o número das respostas.
- **Headline** (800–900, `--fs-3xl` 28px): título "Conta Comigo" em degradê e título da tela final.
- **Title** (800–900, `--fs-xl`/`--fs-2xl`, 19–24px): títulos de tela (Loja, Duelo), botões grandes e modais.
- **Body** (700, `--fs-md`/`--fs-lg`, 14–16px): histórias, mensagens e campos.
- **Label** (800, `--fs-2xs`–`--fs-sm`, 10–12,5px): nome e descrição dos modos, chips, missões e selos.

Emojis e números do jogo (`.mascot`, `.obj`, `.mode-emoji`, `.ans`, `#equation`) têm tamanhos próprios, porque são ilustração e não texto de interface. Os ajustes por breakpoint (`body.page-mode` e `@media`) também continuam em px calibrados.

### Named Rules
**The Peso-Mínimo-700 Rule.** Nenhum texto de interface fica abaixo de 700. Leitor iniciante precisa de traço grosso.

## Layout

**Responsivo por natureza: o arranjo é decidido pelo espaço disponível, nunca pelo aparelho** (HIG › Layout: "Determine layout based on size classes, not device type or orientation"). As funções são as mesmas em qualquer tamanho; muda só o arranjo.

- **Popup** (400×600, extensão): coluna única com rolagem interna, sem `page-mode`.
- **Página cheia** (`body.page-mode`, que cobre PWA, Electron, extensão em tela cheia e web): contêiner de até 1120px (1320px a partir de 1500px).
- **Ordem no HTML:** jogar vem primeiro, com os modos logo depois da marca. No celular o primeiro modo aparece a cerca de 190px do topo.
- **Faixas de tamanho** (largura): ≤329 · ≤350 · ≤380 · ≤430 (celular) · ≤560 · ≤760 (tablet retrato) · ≥761 (2 colunas na home) · ≥1500.
- **Faixas de altura:**
  - ≤500px de altura em paisagem: modo compacto (celular deitado), com topbar estática.
  - ≤820px de altura, paisagem e ≥560px de largura (celular deitado, iPad, notebook): **o jogo vira duas colunas**, com visual e conta à esquerda e respostas e "ouvir" à direita. Nada rola.
  - ≤600px de altura em retrato (iPhone SE): espaços verticais enxutos.
- **Home em paisagem curta:** 2 colunas só a partir de 700px de largura. Abaixo disso segue em coluna única, e os cartões de status quebram linha em vez de se espremer.
- **Unidades:** `dvh` com `vh` de reserva (barras do navegador móvel), `clamp()` na tipografia do jogo, `env(safe-area-inset-*)` nas bordas e no popover.
- **Alvos de toque:** nenhum controle com menos de 44×44px (botões, chips, objetos tocáveis). Texto de interface nunca abaixo de 11px.
- **Elementos flutuantes** (popover, balão, modal) ficam sempre dentro da tela: `max-height` pela altura real e rolagem interna.
- **Ritmo:** escala `--sp-*` de 2, 4, 6, 8, 12, 16, 24 e 36px. (Ainda definida, mas pouco aplicada: veja o item 7.2 do plano.)
- **Teste:** `scripts/resp_check.cjs` mede 8 aparelhos emulados × 15 telas e roda no CI.

## Elevation & Depth

A profundidade é **estrutural e tátil**, não ambiente. Superfícies em repouso têm uma aresta inferior sólida, sem desfoque, tingida pela cor de sombra do tema (`--sh`). A aresta diminui no `:active`, e a peça "afunda". Sombras desfocadas ficam só para o que flutua sobre a tela: balão de fala, popover e modal.

### Shadow Vocabulary
- **lift-0** (`0 1px 0 rgba(var(--sh), .12)`): botão pressionado.
- **lift-1** (`0 2px 0 rgba(var(--sh), .08)`): chips, pílulas e selos.
- **lift-2** (`0 3px 0 rgba(var(--sh), .12)`): botões de ícone, contadores e cartões pequenos.
- **lift-3** (`0 4px 0 rgba(var(--sh), .1)`): cartões de modo e painéis.
- **lift-4** (`0 6px 0 rgba(var(--sh), .15)`): botão grande secundário.
- **Aresta colorida** (`0 6px 0 var(--ans-N-edge)`): botões de resposta e botão principal.
- **float-1** (`0 6px 14px rgba(0,0,0,.15)`): balão de fala.
- **float-2** (`0 10px 26px rgba(0,0,0,.22)`): popover de perfis.
- **float-3** (`0 12px 30px rgba(0,0,0,.3)`): modal, sobre o véu `--scrim`.

### Named Rules
**The Aresta-Afunda Rule.** Todo botão tocável tem aresta sólida e responde ao `:active` com `translateY` igual à aresta perdida. Peça que não afunda parece desenho, não brinquedo.

## Shapes

Os cantos são generosos e nada é pontudo. Escala `--r-*`:
- 8px: foco e miniaturas;
- 12px: inputs, chips de dificuldade e avatares;
- 16px: cartões pequenos e grupos;
- 20px: botões grandes e respostas;
- 24px: modal e cartões grandes;
- 999px: pílulas e contadores.

As bordas são de 2px em `--line`. O tracejado indica algo "ainda não seu": próximo prêmio, conquista secreta e guia de vozes. Os cartões de modo levam uma faixa superior de 5px na cor do modo.

## Components

### Buttons
- **Resposta** (`.ans`): 30px/900 branco sobre `--ans-1..4` por posição, raio de 20px e aresta de 6px da mesma família. Ao acertar fica `--success-strong` com pop. Ao errar, opacidade .45 com tremida. A dica é um contorno amarelo pulsante.
- **Principal** (`.big-btn`): 19px/800 branco sobre o Azul Resposta, raio de 20px e aresta `--ans-1-edge`.
  - `.alt`: cartão com tinta e `lift-4`.
- **Mini** (`.mini-btn`): pílula com altura mínima de 44px. Fica verde quando "em uso".
- **Ícone** (`.icon-btn`): quadrado de 44px, raio de 12px e `lift-2`.
- **Foco:** anel de 3–4px em `--focus` (a própria tinta, ou amarelo no alto contraste), com offset de 2px.

### Chips
- **Contadores** (estrelas, ofensiva, nível): pílula de cartão com `lift-2` e peso 800, sem quebra de linha.
- **Dificuldade** (`.diff-chip`): na escolha ganha borda amarela, `--pick-bg` e sombra amarela (`--glow`).
- **Missão:** pílula pequena que, cumprida, fica `--success-bg`/`--success-text`.

### Cards / Containers
- **Cartão de modo:** cartão branco, raio de 20px, faixa superior de 5px na cor do modo, emoji, nome (800) e descrição (`--ink-soft`).
- **Próximo prêmio:** borda tracejada, cadeado no emoji e barra de progresso (`--track`/`--attention`).
- **Visual do jogo** (`#visual`): cartão de 24px que agrupa os objetos sobre `--tint`.

### Inputs / Fields
Borda de 2–2,5px em `--line`, fundo `--card`, raio de 12px e altura mínima de 44px. No foco, contorno de 3px em `--focus`. Erro em `--danger-text`, 800.

### Navigation
A barra superior fica numa linha só, com casa, perfis, contadores, som, tela cheia e engrenagem. Na página cheia ela é sticky, com vidro (`backdrop-filter`). Abaixo de 430px, os itens secundários saem.

### Mascote e balão (assinatura)
A raposa (🥚 → 🐣 → 🦊, com chapéu da loja) quica em loop. O balão de fala (`#bubble`, `float-1`) aparece na tela ativa e é narrado pela voz do sistema.

## Do's and Don'ts

### Do:
- **Do** use os tokens semânticos (`--ink`, `--card`, `--line`, `--tint`, `--success-*`, `--attention`, `--on-accent`, `--on-yellow`) e deixe o tema decidir a cor.
- **Do** dê a todo controle tocável no mínimo 44×44px e uma aresta que afunda no `:active`.
- **Do** teste cada mudança visual nos 8 modos de cor (7 temas mais alto contraste), no popup 400×600 e em celulares e tablets emulados, retrato e paisagem (`node scripts/resp_check.cjs`).
- **Do** mantenha `game.html`, `popup.html` e `web/index.html` com a mesma marcação da tela inicial.
- **Do** desligue animação em `body.calmo`, `body.rm` e `prefers-reduced-motion`.

### Don't:
- **Don't** use os matizes de enfeite (`--green` #2ed573, `--blue` #4c7dff, `--orange` #ff9a3d) como fundo de texto branco: ficam abaixo de 4,5:1.
- **Don't** pinte uma posição de resposta de verde nem use vermelho como "errado". O erro é dica, não castigo.
- **Don't** carregue fonte, imagem ou script de fora. O jogo é 100% offline e sem coleta (COPPA, LGPD-K e GDPR-K).
- **Don't** decida layout pela orientação ou pelo aparelho: use largura e altura disponíveis. Não dê a um controle largura fixa de desktop sem `min-width: 0` e `flex`, que estoura em 320px.
- **Don't** crie hex novo num componente. Se falta um papel, crie um token semântico e defina-o em todos os temas e no `body.hc`.
- **Don't** troque o emoji por ilustração rasterizada sem decisão de marca: o 🦊 e os emojis do sistema são a identidade.

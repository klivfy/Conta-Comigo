# Revisão de design · 29/10/2026 · Conta Comigo 2.7.0

Quatro skills aplicadas ao jogo e ao painel dos responsáveis, todas em modo de leitura (nenhum código
alterado nesta rodada):

| Skill | O que mediu | Resultado |
| --- | --- | --- |
| `design-taste-frontend` | lint (`--app`), inspeção no Chromium a 1440, 768 e 390px, crítica de 11 telas × 2 larguras | jogo 6,8/10 · painel 5,8/10 |
| `impeccable` (critique + audit) | avaliação A (design) e B (detector, axe, `resp_check`, overlay) em subagentes isolados | heurísticas 25/40 · auditoria técnica 14/20 ("Bom") |
| `apple-design` | resposta ao toque, molas, origem espacial, materiais, multimodal, movimento reduzido, tipografia | 12 achados |
| `emil-design-eng` | curvas, durações, frequência, interrupção, origem, detalhes invisíveis | 14 linhas Antes/Depois |

Evidência: capturas em `.taste-skill/screens/` e `.taste-skill/before/` (fora do Git), notas por skill em
`.taste-skill/critica-*.md`. Todo achado P0 a P2 abaixo foi conferido no código (arquivo:linha).

## Leitura geral

**O jogo tem identidade própria.** Os botões de resposta com aresta que afunda, as quatro cores firmes, os
objetos contáveis em grupos e o erro que vira dica com o objeto da questão ("Vamos contar os pintinhos
juntos?") formam a "Caixa de Brinquedos" do DESIGN.md. Acessibilidade estrutural séria: axe 0 nas telas do
CI, região viva, foco visível, alto contraste e dislexia, movimento reduzido em três camadas.

**O painel dos responsáveis é genérico.** Formulário de configurações de 4.176px (desktop) a 5.456px
(celular) sem resumo, sem navegação e com o mapa de domínio exagerando o progresso.

**O ponto mais fraco é o fim.** A tela final (o "fim" da regra pico-fim) tem duas estrelas e "Muito bem!",
mais de 60% vazia, sem o mascote, sem o avanço para o próximo prêmio.

**Regras das skills que NÃO entram no plano.** A taste-skill proíbe emoji, sombras e degradês; o detector
da impeccable marca título em degradê, aresta 3D e quique do mascote. São decisões documentadas do produto
(DESIGN.md: emoji é a ilustração, "Aresta-Afunda", nome da marca em degradê como logotipo). Ficam como estão.

## Plano de ação

Severidade: P0 bloqueia · P1 grave · P2 incômodo · P3 polimento. Esforço: P (horas), M (1 a 2 dias),
G (semana). Fonte: T taste · I impeccable · A apple-design · E emil.

### Fase 10.0: correções (bugs medidos)

| # | Sev. | Item | Onde | Fonte | Esforço |
| --- | --- | --- | --- | --- | --- |
| 10.0.1 | **P1** | **Nova aba trava no primeiro acerto e nunca conta a ofensiva.** `newtab.js:37` chama `confetti(18)`, que só existe em `ui.js:170`; `newtab.html` não carrega `ui.js`. Erro `confetti is not defined`, as linhas 38 a 42 (ofensiva) nunca rodam, a pergunta não volta. | `js/newtab.js` | I | P |
| 10.0.2 | P1 | Nenhum teste de navegador abre `newtab.html` nem `web/index.html`; os achados reais desta rodada estão justamente nelas. Incluir as duas no `a11y_check` e no `app_check`. | `scripts/` | I | P |
| 10.0.3 | P1 | Nome padrão "Jogador" fixo em português: aparece "Egg · Jogador" em inglês e espanhol, e a voz chama a criança de "Jogador". | `engine.js:88, 233, 265, 446`, `options.js:413` | T, I | P |
| 10.0.4 | P2 | Toast cobre "Ouvir de novo" (1440) e cartões da loja (390); balão do mascote cobre "Questão 1 de 5" e os pontos de progresso. | `style.css:500`, `#bubble` | T, I, E | P |
| 10.0.5 | P2 | O "+" fica ao lado do primeiro grupo quando os grupos empilham no celular. | visual de soma | T | P |
| 10.0.6 | P2 | Tela final: "Suas respostas:" aparece órfão com histórico vazio (`ui.js:845`); mascote cortado pela barra no desktop. | `ui.js:819-851` | T, I | P |
| 10.0.7 | P2 | `.mode-card:hover` sem `@media (hover: hover)`: em tablet o cartão fica "levantado" depois do toque. | `style.css:269` | E | P |
| 10.0.8 | P2 | Selo da versão web com 3,04:1 (opacity .7 em 11px). | `style.css:943-947` | I | P |
| 10.0.9 | P2 | Botão liga/desliga da nova aba sem nome nem estado (`⏻` nos dois estados). Nova aba sem `<main>` e sem `<h1>`. | `newtab.js:62, 68`, `newtab.html` | I | P |
| 10.0.10 | P3 | Nota interna visível aos pais: "Material de publicação (S35) incluído na pasta loja/". | `options.html`, `store_note` | T | P |

**Validação:** teste que abre `newtab.html`, acerta e confere `streak` e a próxima pergunta; `a11y_check`
cobrindo nova aba e web; captura 390/1440 sem toast nem balão sobre controle; capturas em en e es sem
"Jogador".

### Fase 10.1: coerência com "nunca pune" e "sem pressão"

| # | Sev. | Item | Fonte | Esforço |
| --- | --- | --- | --- | --- |
| 10.1.1 | P1 | **Cronômetro em semáforo** (verde, amarelo, vermelho em `style.css:311-313`) contradiz "Verde-É-Acerto" e "vermelho não é errado". Barra de um tom só que esvazia; desligado por padrão para 4 e 5 anos (ver decisão D2). | I | P |
| 10.1.2 | P1 | **Loja como vitrine de frustração**: com 8 ⭐ todo item mostra "Comprar 60⭐" em azul cheio, e tocar responde 😢 (`ui.js:945`). Item ainda caro vira cartão tracejado com "8/60 ⭐"; resposta da raposa: "Junte mais 52 ⭐!". | I, T | M |
| 10.1.3 | P1 | **Compra em um toque, sem volta** (`ui.js:942-975`). Aviso "Comprado! Desfazer" por 5 s (ou segurar para comprar) e prévia do tema antes de comprar. | A, E | M |
| 10.1.4 | P2 | Conquistas trancadas com opacidade .55: título ~3,2:1, descrição ~2,4:1 (abaixo de 4,5:1). Texto em `--ink-soft` cheio, emoji-alvo em silhueta, progresso visível ("10/50 ⭐"). | I, T | P |
| 10.1.5 | P2 | Mapa de domínio exagera: a barra é a precisão (`options.js:232`), uma rodada 5/5 aparece "cheia"; "Precisão 100%" após uma rodada. Mínimo de evidência (ex.: 20 questões), rótulo em texto ("começando", "praticando", "domina"), pontos de nível com texto e não só cor. | I, T | M |
| 10.1.6 | P2 | "S44" na evolução semanal; "Cole aqui o JSON". Semanas como "27/10 a 2/11"; textos de dados em linguagem de pais. | I | P |

**Validação:** captura da loja com 8 ⭐ sem botão de compra ativo para item inalcançável; axe nas conquistas
sem `color-contrast`; perfil novo com uma rodada não mostra barra cheia no mapa.

### Fase 10.2: movimento, toque e materiais

| # | Sev. | Item | Fonte | Esforço |
| --- | --- | --- | --- | --- |
| 10.2.1 | P2 | **Curvas próprias**: as 22 transições usam o `ease` padrão. Tokens `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` e `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` em `:root`. | E | P |
| 10.2.2 | P2 | **Som e imagem no mesmo frame**: o visual afunda no pressionar, o `SFX.tap()` só toca no `click`. Som e press no `pointerdown`; ação no `click`. | A | P |
| 10.2.3 | P2 | **Diálogos estruturais sem quique**: `pop` de `scale(.5)` a `1.15` em todo modal, inclusive adulto, cookies e confirmação. Estrutural: `scale(.95)` + opacidade, 200 a 250 ms; quique só na comemoração. | A, E | P |
| 10.2.4 | P2 | **Modo calmo destrói feedback**: `body.calmo *` zera toda transição (`style.css:149`), inclusive o afundar. Calmo tira loops e quiques, mantém press e fades curtos. | A, E, I | P |
| 10.2.5 | P3 | Loops constantes: `.deco` `floaty 6s infinite` (~0,17 Hz, faixa vestibular) e `.mascot-main` `bounce 2.2s infinite`. Quicar ao chegar e ao ganhar estrela; parado no resto. | A, E | P |
| 10.2.6 | P3 | Origem espacial: nenhum `transform-origin`. Popover de perfis nasce do botão; balão nasce do mascote; modais continuam centrados. | A, E | P |
| 10.2.7 | P3 | Performance: timer anima `width` a cada 200 ms; `attention` e `pulse` animam `box-shadow` em loop. Trocar por `scaleX` e por pseudo-camada com opacidade. | A, E, I | P |
| 10.2.8 | P3 | Toast: saída mais rápida que a entrada (180 ms contra 300 ms) e pausa com a aba oculta; acerto `pop .5s` para ~300 ms (acontece dezenas de vezes por sessão). | E | P |
| 10.2.9 | P3 | Tipografia: tracking positivo de 2px na equação (maior texto, até 64px) e +0,5px no título. Texto grande pede -0,01 a -0,02em. | A | P |

**Validação:** gravação em câmera lenta (DevTools Animations a 10%) de press, acerto, modal e toast; `body.calmo`
ainda afunda o botão; nenhum `transition` sem curva no `tokens_check` (regra nova).

### Fase 10.3: tipografia e composição

| # | Sev. | Item | Fonte | Esforço |
| --- | --- | --- | --- | --- |
| 10.3.1 | P2 | **15 tamanhos de fonte em uso** (11 a 92px) e corpo medido em 12,5px/1,35. `--fs-2xs` e `--fs-xs` valem os dois 11px (29 usos), e o DESIGN.md diz 10px. Juntar os dois, subir o piso da interface infantil para 12 a 13px, reduzir a escala visível a 5 ou 6 degraus e corrigir o DESIGN.md. É o item 7.2 já previsto. | T, I | M |
| 10.3.2 | P2 | Home desktop: modos ocupam 2/3 e deixam buraco sob o painel lateral; textos com 4 alinhamentos diferentes; a dica "Toque em um modo" fica 150 px abaixo dos modos. Modos na largura toda abaixo do herói, dica junto da grade. | T, I | M |
| 10.3.3 | P2 | Cartão visual do jogo com ~60% de área branca no desktop; objetos pequenos para o palco. Objetos escalam com o palco. | T | P |
| 10.3.4 | P3 | Órfãos: chip "🚀 5" sozinho na segunda linha a 390px; avatares do duelo 7+3; tema "Neve" sozinho na loja; KPI "Modos jogados" sozinho no painel. | T, I | P |
| 10.3.5 | P3 | Dois botões 🏠 na loja, nas conquistas e no duelo (barra e cabeçalho). Manter só o da barra. | T, I, A | P |
| 10.3.6 | P3 | Selo `v2.7.0` na barra da criança; mover para o painel. | T, I | P |
| 10.3.7 | P3 | Celular a 200% de texto: respostas e "Ouvir de novo" abaixo da dobra no iPhone SE (10 avisos do `resp_check`). | I | M |

**Validação:** `inspect.mjs --app` com no máximo 6 tamanhos de fonte e corpo ≥ 14px; `resp_check` normal e a
200% sem os avisos de dobra nas telas de jogo; captura 1440 da home sem coluna vazia.

### Fase 10.4: painel dos responsáveis (tela de trabalho)

| # | Sev. | Item | Fonte | Esforço |
| --- | --- | --- | --- | --- |
| 10.4.1 | P1 | **Criança cria a senha dos adultos.** A engrenagem com ponto laranja convida ao toque e leva direto a "Crie uma senha". Conferência para adultos (a mesma `adultCheck` da 2.7.0) antes de criar a senha. | I | P |
| 10.4.2 | P2 | **Resumo em uma frase com próxima ação** no topo: "Esta semana: 12 rodadas. Ótima em Contar. Sugestão: Comparar nível 2." O painel deixa de ser só relatório. | I, T | M |
| 10.4.3 | P2 | Navegação por seções (âncoras fixas: Progresso, Jogadores, Jogo, Som, Aparência, Tempo, Privacidade, Dados). | I, T | M |
| 10.4.4 | P2 | Acento em todo o chrome: 12+ botões azuis cheios; links legais desenhados como botões. Um primário por seção; links como links; "Dados" com exportar/importar agrupados e uma zona de perigo separada para "Apagar". | T, I | P |
| 10.4.5 | P3 | Rótulo à esquerda e controle a 900 px no desktop; título "Área dos responsáveis" repetido no portão; botão de voz por perfil sem rótulo visível; emoji dos títulos lido pelo leitor de tela (sem `aria-hidden`). | T, I | P |

**Validação:** `inspect.mjs --app` no painel sem órfãos; teste: primeira abertura da engrenagem pede a conta
de adulto antes do formulário de senha.

### Fase 10.5: novas funcionalidades

Ordenadas por valor para o PRODUCT.md (criança quer voltar todo dia; adulto vê progresso real) contra esforço.

| # | Funcionalidade | Por quê | Fonte | Esforço |
| --- | --- | --- | --- | --- |
| N1 | **Boas-vindas em 3 toques**: nome falado (a criança ouve o próprio nome), avatar, primeira conta. | O Positioning promete "chamada pelo nome"; hoje todos são "Jogador". Corrige 10.0.3 de vez. | I | M |
| N2 | **Fim de rodada como "baú da rodada"**: as estrelas voam até o mascote, barra "faltam N ⭐ para chocar", uma conta errada revista por voz, fichas ✅/🔁 com o emoji do objeto em vez de texto. | O fim é o elo mais fraco do pico-fim; criança que não lê entende fichas, não lista. | I, T | M |
| N3 | **"Jogar agora"**: um cartão grande na home com o modo recomendado pela revisão espaçada; os outros modos em segundo plano. | Home hoje tem ~20 alvos e 4 falhas de carga cognitiva; princípio 1 ("um toque"). | I | M |
| N4 | **Arrastar para contar e agrupar** (manipulação direta): levar objetos para a cesta, encaixe com mola, resistência na borda, captura de ponteiro. Modo novo ou variação de Contar e Somar. | O material concreto de matemática é arrastar; hoje só existe tocar em botão. | A, E | G |
| N5 | **Háptica nos apps** (`@capacitor/haptics`): toque leve no acerto e no "ops", desligável e mudo no modo calmo. | Causalidade multimodal; nenhuma háptica hoje. | A | P |
| N6 | **Loja "quase lá"**: ordenar pelo item mais perto, barra de progresso, voz ("faltam 12 estrelas para o boné"), prévia do tema e desfazer. | Recompensa antes da cobrança; resolve 10.1.2 e 10.1.3. | I, A, E | M |
| N7 | **Missões e conquistas narradas ao toque**; o toast diz qual missão foi cumprida. | Princípio 3: usar tudo por voz e ícone. | I | P |
| N8 | **Voz neural embarcada** (pendente da 2.7.0): pacote por idioma no app. | Única forma de voz natural igual em todo aparelho. | (2.7.0) | G |

### Decisões que são suas

| # | Decisão | Opções | Recomendação |
| --- | --- | --- | --- |
| D1 | **Aviso de cookies na tela da criança.** A avaliação A chamou de "teatro de consentimento": o app não rastreia nada, e o aviso é o primeiro obstáculo da criança e sugere ao adulto que publicidade é possível. | (a) manter como está; (b) aviso só na primeira abertura do painel, "Personalizar aceites" continua no rodapé; (c) trocar as chaves por "Nada sai deste aparelho" até existir algum recurso opcional | (b): preserva o pedido e tira o obstáculo da criança |
| D2 | Cronômetro para 4 e 5 anos | ligado como hoje; desligado por padrão em perfil novo; desligado e sem cor | desligado por padrão, tom único (une 8.C2 e 10.1.1) |
| D3 | Dificuldade (6 chips) na home da criança | manter; só no painel; "Auto" na home e o resto no painel | "Auto" na home, níveis no painel |
| D4 | Mascote no primeiro dia | ovo 🥚 como hoje; raposa 🦊 desde o início, com o ovo como "pet" | ovo com rosto/olhos na fala (balões e fim usam 🦊 em vez de 🙈, 😢, 🥳) |

### Ordem sugerida

1. **10.0** inteira (bugs, 1 a 2 dias) e **10.4.1**: são defeitos, não gosto.
2. **10.1.1 a 10.1.4** com as decisões D1 e D2: coerência com a promessa do produto.
3. **10.2** em um bloco só (tokens de movimento): baixo risco, toca só CSS e `ui.js`.
4. **N1, N2, N3**: as três funcionalidades que mais mexem em "querer voltar todo dia".
5. **10.3** (tipografia, com regressão visual por pixel como na 2.6.4) e **10.4.2 a 10.4.5**.
6. **N4 a N8** como versões próprias.

Cada fase sobe a versão própria (2.7.1 para 10.0; 2.8.0 para as funcionalidades), com `sync_check` e as
notas de loja em pt, en e es.


## Andamento e plano dos próximos lotes (atualizado em 29/10/2026)

Decisão: **sem subir versão por enquanto.** O trabalho novo acumula na 2.8.0 (PR #13). Versão, `versionCode`, notas
de loja, README e zips só mudam quando o responsável decidir fechar a versão.

| Fase | Estado | Entregue em |
| --- | --- | --- |
| 10.0 e 10.4.1 | feitas | 2.7.1 |
| 10.1.1 a 10.1.4 (D1, D2) | feitas | 2.7.2 |
| 10.2 | feita (dívida: `box-shadow` em loop em `attention` e `pulse`) | 2.7.3 |
| 10.3.1 (rem), 10.3.3, 10.3.5, 10.3.6 | feitas | 2.7.4 |
| N1, N2, N3 | feitas (N2 sem as estrelas voando) | 2.8.0 |

### Lotes pendentes

| Lote | Conteúdo | Esforço | Risco |
| --- | --- | --- | --- |
| A | Fechar a 10.3: grade da home sem órfão (10.3.2), órfãos (10.3.4), dobra a 200% no iPhone SE (10.3.7), tamanhos em px consolidados e `DESIGN.md` corrigido (10.3.1), `box-shadow` em loop trocado por pseudo-camada | M | médio (CSS inteiro; regressão visual) |
| B | N6 loja "quase lá" (ordem por proximidade, voz, prévia do tema) e N7 missões e conquistas narradas | M | baixo |
| C | Painel: resumo com próxima ação, âncoras por seção, um primário por seção, zona de perigo, desktop e leitor de tela (10.4.2 a 10.4.5) | M | médio |
| D | Mapa de domínio com mínimo de 20 questões e rótulo em texto, semanas legíveis, textos de pais (10.1.5, 10.1.6) | M | baixo (teste de motor) |
| E | N5 háptica nos apps (`@capacitor/haptics`), com interruptor e mudo no modo calmo | P | médio (sem teste em CI; exige aparelho) |
| F | N4 arrastar para contar: protótipo só em Contar, com alternativa por toque e teclado | G | alto (acessibilidade) |

N8 (voz neural embarcada) fica fora dos lotes: pacote por idioma e licença de voz pedem projeto próprio.

**Critério de cada lote:** testes do motor (um novo por regra), `a11y_check`, `pages_check`, `resp_check` normal e a 200%,
`app_check`, `scan_csp`, `tokens_check`, `i18n_check` e CI verdes; lotes de CSS com `visual_diff` antes e depois.

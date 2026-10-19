# Worklog

---
Task ID: 1
Agent: Z.ai (agente principal)
Task: Criar mini jogo educativo como extensão de navegador (Chromium + Firefox) para ensinar cálculos simples a crianças a partir de 4 anos.

Work Log:
- Classificado como Type 3 (desenvolvimento web interativo — extensão de navegador com arquivos estáticos MV3).
- Criada estrutura /home/z/my-project/download/conta-comigo/ com manifest.json (Manifest V3, permissions: storage, browser_specific_settings.gecko para Firefox).
- Implementado popup.html + popup.css: interface infantil 400×600, mascote 🦊, 4 cartões de modo, balão de fala, confetes em CSS, botões grandes táteis.
- Implementado popup.js: 4 modos (Contar, Somar, Subtrair, Multiplicar em grupos), dificuldade adaptativa em 3 níveis (sobe com ≥80% de acertos de primeira, desce com ≤40%), TTS pt-BR via speechSynthesis lê as perguntas, efeitos sonoros sintetizados via Web Audio API, sistema de estrelas (2 por acerto de primeira / 1 após errar), 5 perguntas por rodada, persistência via chrome.storage.local com fallback para localStorage.
- Ícones 16/32/48/128 px gerados via /home/z/my-project/scripts/gen_icons.py (PIL, gradiente laranja-rosa, "123" + estrela).
- demo.html criado: página com prévia jogável em iframe e instruções de instalação para Chromium e Firefox.
- QA com agent-browser: tela inicial, modo Contar (fluxo erro→acerto com balão, confete e estrela), rodada completa (tela final com 9 estrelas e subida de nível), modos Somar/Subtrair/Multiplicar validados visualmente, sem erros de console. Ajuste no ✖ dos itens riscados da subtração (z-index, text-shadow branco).
- Empacotado conta-comigo-extension.zip (~40 KB).

Stage Summary:
- Extensão "Conta Comigo — Matemática para Crianças" v1.0.0 pronta: /home/z/my-project/download/conta-comigo/ (pasta para "Carregar sem compactação" no Chromium) e /home/z/my-project/download/conta-comigo-extension.zip.
- Instalação Firefox: about:debugging#/runtime/this-firefox → Carregar add-on temporário → manifest.json.
- Compatível com MV3 (Chrome/Edge/Brave/Opera e Firefox 109+); funciona offline; sem permissões sensíveis (apenas storage).

---
Task ID: 2
Agent: Z.ai (agente principal)
Task: Verificar viabilidade de tela cheia, adicionar dificuldade manual e estudar/implementar novas operações conforme a dificuldade.

Work Log:
- Pesquisa técnica de tela cheia: popups de extensão são limitados a 800×600 (impossível fullscreen neles). Solução: nova página interna game.html + game.css (layout responsivo escalável com clamp/vmin), aberta via chrome.windows.create({state:'fullscreen', type:'popup'}) a partir do botão ⛶ no popup; em página própria/demo usa Fullscreen API com fallback. Sem necessidade de permissões novas (tabs/windows.create não exigem).
- Adicionado seletor manual de dificuldade na tela inicial (chips 🤖 Auto / 🌱 Fácil / 🌿 Médio / 🌳 Difícil), persistido em cc_state.difficulty; S.difficulty !== 'auto' fixa o nível (activeLevel()), progressão orgânica continua registrada para uso futuro; end-msg indica "dificuldade fixa" ou "modo automático"; chip "Nível X · auto/fixo" exibido durante o jogo (#level-chip).
- Novas operações e escalonamento por nível: genDividir (divisão exata com grupos visuais, "total ÷ grupos"), modo 🎲 Mistão (sorteia operações liberadas: L1 contar+somar; L2 +subtrair; L3 +multiplicar+dividir), somar/subtrair até 20 no nível 3 (itens "small" quando total > 10), contar até 15 no nível 3.
- Corrigido bug encontrado no QA: saveState não gravava "difficulty" (dificuldade fixada perdia após reabrir) — incluído no objeto persistido e revalidado (localStorage mostra difficulty:3 e S.difficulty=3 após reload).
- Corrigido TTS da divisão para usar numWord(g) ("dividido por três" em vez de "3").
- popup.html/game.html: topbar com botões ⛶ (tela cheia) e ✕ (fechar, apenas em game.html); grid 2×3 de modos com Dividir e Mistão; home compactada (mascote 60px, cards menores).
- demo.html: tabela "Dificuldade e operações" (conteúdo por nível), link "⛶ Abrir em tela cheia", iframe com allowfullscreen, recursos atualizados.
- manifest: version 1.1.0; descrição atualizada com divisão.
- QA agent-browser: home v2 (chips + 6 modos), Mistão em nível difícil sorteou contar/dividir/dividir/subtrair/somar(17+3), divisão visual "9 ÷ 3" com 3 grupos, game.html em 1440×900 com layout escalado, Fullscreen API confirmada (document.fullscreenElement=true), persistência da dificuldade validada, sem erros de console.
- Reempacotado conta-comigo-extension.zip (13 arquivos, ~57 KB).

Stage Summary:
- Extensão v1.1.0: tela cheia real (popup→janela fullscreen nativa; game.html com Fullscreen API), dificuldade manual (Auto/Fácil/Médio/Difícil) persistida, divisão visual + modo Mistão + operações liberadas por nível.
- Arquivos: download/conta-comigo/ (game.html e game.css novos) e download/conta-comigo-extension.zip.

---
Task ID: 3
Agent: Z.ai (agente principal)
Task: Analisar o conceito da extensão Conta Comigo e propor ao menos 31 sugestões de melhorias ou novas funcionalidades (documento entregável).

Work Log:
- Revisados worklog (v1.1.0: tela cheia, dificuldade manual, divisão, Mistão) e código atual (popup.js 591 linhas: 6 modos, adaptação ±80%/40%, estrelas 2/1, TTS pt-BR, Web Audio, storage duplo).
- Carregada skill docx com cadeia completa: routes/create.md, scenes/report.md, references/design-system.md (R1 + WM-1), common-rules.md, toc.md, docx-js-core.md.
- Elaboradas 36 propostas numeradas S01–S36 em 6 categorias (pedagógico, adaptação, gamificação, acessibilidade, família/segurança, plataforma), cada uma com impacto × esforço; matriz de 4 quadrantes e roadmap em 4 ondas (v1.1.x, v1.2, v1.3, v2.0).
- Gerados scripts: scripts/analise_data.js (conteúdo PT-BR) e scripts/gen_analise_conta_comigo.js (capa R1/WM-1, 3 seções: capa margem 0, sumário romanos, corpo arábicos reiniciado; 10 tabelas horizontal-only com tableHeader/cantSplit/keepNext).
- Pós-processamento: add_toc_placeholders.py --auto (21 entradas, exit 0) + scripts/patch_docx_footers.py (criado: remove pgNumType vazio, corrige instrText PAGE \* ROMAN / \* arabic por mapeamento de sectPr→rels, remove hyperlink duplicado na 1ª entrada do campo TOC).
- Correções de QA: quebra de página dupla (PageBreak do TOC + NEXT_PAGE) eliminada; larguras de coluna das tabelas de propostas ajustadas para 7/22/45/13/13 (evitar quebra de "S07", "Impacto", "Esforço").
- Validação: postcheck.py 9/9 (0 erros, 0 avisos); conversão PDF 15 páginas inspecionada visualmente (capa, sumário limpo, corpo, tabelas, encerramento natural).

Stage Summary:
- Entregável: /home/z/my-project/download/Conta-Comigo-Analise-de-Conceito-e-Propostas-de-Melhorias.docx (~29 KB, 15 páginas, PT-BR).
- Conteúdo: sumário executivo; visão do produto com tabela de funcionalidades v1.1.0; diagnóstico (pontos fortes, limitações, SWOT); metodologia de priorização; 36 propostas (S01–S36) com impacto/esforço; matriz de priorização (9 ganhos rápidos); roadmap v1.1.x→v2.0; conclusões.
- Scripts reutilizáveis: analise_data.js, gen_analise_conta_comigo.js, patch_docx_footers.py.



---
Task ID: 4
Agent: Z.ai (agente principal)
Task: Implantar as 36 sugestões (S01–S36) do relatório de melhorias na extensão Conta Comigo (versão 2.0.0).

Work Log:
- Rearquitetura completa: css/style.css compartilhado, js/i18n.js (3 idiomas), js/engine.js (motor), js/ui.js (telas), js/options.js, js/newtab.js; shells popup.html (400×600) e game.html (página dedicada, classe page-mode + html.html-page para liberar o tamanho do <html>).
- Pedagógicos: S01 Faltante (3+?=7), S02 Comparar (A/B/=, objetos até nv.2 e números até 500), S03 Sequências (crescentes/decrescentes), S04 Dobro e metade, S05 Histórias narradas com plurais corretos, S06 Dinheiro (moedas, cédulas de 5 e troco) — 12 modos com desbloqueio por estrelas (0–120).
- Adaptação: S07 janela móvel de 5 respostas por modo (sobe ≥4/5, desce ≤1/5) com celebração de nível; S08 revisão espaçada de erros (caixas Leitner 1/2/4/8/16 dias, cartões com dados forçados nos geradores, mistar grava o modo subjacente); S09 mapa de domínio no painel (modo × níveis 1-5 coloridos por precisão); S10 detector de fadiga (3 erros → respiração guiada com 2 ciclos); S11 metas diárias (0/1/2/3/5 rodadas, +5⭐); S12 avaliação inicial de 8 questões em escada sugerindo nível 1-5.
- Gamificação: S13 mascote evolutiva (🥚<30, 🐣 30-99, 🦊 100+) com adereços; S14 12 conquistas (+5⭐ cada, vitrine); S15 ofensiva diária com faixa semanal D-S-T-Q-Q-S-S; S16 3 missões diárias determinísticas por data (+3⭐); S17 loja (tema arco-íris 60⭐, boné/laço/coroa, figurinhas 5⭐ com álbum 24 e duplicata +2⭐); S18 Desafio-chefe a cada 5 rodadas (10 questões, sem dicas, estrelas ×2); S30 Duelo para 2 jogadores (10 questões alternadas, placar no chip, avatares).
- Acessibilidade: S19 alto contraste + fonte dislexia; S20 teclado (1-4 respostas, R repetir, H início, M mudo, Enter em overlays, foco visível); S21 pt/en/es (UI + narração + numWord 0-59 nos 3 idiomas); S22 voz com velocidade/tom/voz do sistema e volume; S23 temas Clássico/Espaço(noturno)/Jardim; S24 modo calmo (segue prefers-reduced-motion ou manual) limitando confetes e animações.
- Família: S25 portão parental (multiplicação aleatória 6-9×4-9); S26 painel (estrelas, ofensiva, rodadas, tempo, precisão, semanas); S27 até 4 perfis com avatar/nome e troca no popover; S28 limite de sessão (0/10/15/20/30 min) com pausa gentil; S29 exportar (arquivo/área de transferência) e importar (texto/arquivo) com validação parseDB.
- Plataforma: S31 options.html como options_ui open_in_tab; S32 sync opcional via chrome.storage.sync (adota carimbo mais recente + onChanged); S33 chrome_url_overrides.newtab → newtab.html com continha rápido, +1⭐ e interruptor liga/desliga na própria página; S34 commands Ctrl+Shift+U (Mac ⌘⇧U) + background.js service worker abrindo janela nativa fullscreen (Chromium e FF 121+); S35 pasta loja/ (README-publicacao, listagem trilíngue, política de privacidade, 6 capturas 1440×900); S36 web/index.html (versão web para escolas, mesmo motor + selo).
- Migração v1→v2: cc_state antigo (totalStars/mute/difficulty/levels) vira perfil "Jogador" com estrelas e níveis preservados; diffMode 1-3 mapeado.
- QA agent-browser (~30 verificações): layout wide 1440×900 e popup 400×600 no iframe do demo; rodada completa com +2⭐/+1⭐, combo bônus, missões, conquistas a1/a5; desbloqueios por estrelas; revisão espaçada (box 2, due +2d); fadiga→respiração; duelo até empate com placar; avaliação 8/8 → nível 5; chefe ×2⭐; loja (figurinha, boné no mascote, tema arco-íris); portão (erro mostra mensagem); painel com 12 modos e semanas; i18n EN/ES ao vivo; temas + HC + dislexia; newtab com +1⭐; teclado; limite de sessão; perfis (novo jogador ovo 0⭐); stress test dos 12 geradores × 5 níveis × 60 iterações (0 falhas fora do mistar com forced, que é esperado).
- Correções durante o QA: html 400px na página dedicada; .hidden genérico no CSS; AVATARS movido p/ engine (options quebrava); applyLang movido p/ i18n (newtab quebrava); addReviewCard não era chamado; duelo sem modo por questão; diagOK não incrementado; portão apagava o erro; LANG não aplicado nas opções; rótulo do botão repetir; plurais (balões/estrelas) e frases neutras em st_3/st_4.
- Empacotado conta-comigo-extension.zip v2.0.0 (33 arquivos, ~570 KB) com manifest na raiz; capturas em loja/capturas/.

Stage Summary:
- Conta Comigo v2.0.0 entrega as 36 propostas S01–S36 implementadas e testadas.
- Pasta: /home/z/my-project/download/conta-comigo/ · Pacote: /home/z/my-project/download/conta-comigo-extension.zip · Demo: demo.html (prévia + lista das 36 + instalação Chromium/Firefox).
- Observações: nova aba vem ativada por padrão (desligável na própria página e nas opções); atalho global sem efeito no Firefox 109-120 (sem service worker); sincronização desativada por padrão.

---
Task ID: 5
Agent: Z.ai (agente principal)
Task: v2.1.0 — Otimizar a disposição das informações na tela e fazer a extensão abrir SEMPRE em tela cheia (nunca popup); corrigir erros de CSP reportados pelo Chrome.

Work Log:
- Diagnóstico-raiz: o <script> inline do <head> (que adicionava html-page ao <html>) era bloqueado pela CSP MV3 ('script-src 'self'', hash sha256-pR1/... reportado pelo Chrome). Sem a classe, html ficava preso em 400×600 overflow:hidden → conteúdo espremido numa coluna de ~400px à esquerda na janela tela-cheia (print do usuário). CSP e layout eram o MESMO bug.
- Criado js/boot.js (classe html-page antes do CSS) e substituído o script inline em game.html, newtab.html, options.html, demo.html e web/index.html → zero scripts inline no pacote.
- Removidos onclick="closeOverlay()" gerados no ui.js (levelUpOverlay, buySticker) → data-close="1" + delegação de evento em bindStatic; validado no QA (overlay abre e fecha).
- manifest v2.1.0: removido action.default_popup; background dual {"service_worker","scripts"} (Chromium usa SW; Firefox MV3 usa event page → ícone também funciona no FF).
- background.js reescrito: chrome.action.onClicked + commands → openGame() = windows.create({type:'popup', state:'fullscreen'}) com reforço de fullscreen no callback (compatibilidade Firefox); se a janela do jogo já existe, foca e re-maximiza (onRemoved limpa o id); fallback final = aba normal (nunca popup).
- Layout otimizado (css/style.css + markup dos 3 shells game/popup/web): tela inicial reestruturada em .home-hero (grade 2 colunas: marca+mascote à esquerda; cartões "mascote/status" e "missões+semana" à direita), .home-controls (Revisar/Chefe/Duelo/Meu nível + dificuldade numa única faixa), .sec-title "Escolha um jogo" (i18n pick_game pt/en/es) e grade de modos auto-fill minmax(158px,1fr) → 6 colunas em 1440px (12 modos em 2 linhas); topbar sticky translúcida com blur; botões de dificuldade sem quebra de linha; link-row centralizada.
- Popup 400×600 preservado e compacto (herói empilhado, chips de dificuldade cabem numa linha).
- Adicionado botão ✕ (btn-close) na topbar: visível só em page-mode+extensão; window.close() com fallback chrome.windows.remove; i18n close.
- renderMascot atualiza #mascot-side; renderMissions não injeta mais m-title (estático no card); espaço após ✅/🔸 nas missões.
- web/index.html: caminhos corrigidos para ../css e ../js (estava quebrado), selo v2.1.
- newtab.js: botão do jogo agora abre janela nativa fullscreen em vez de navegar a aba.
- demo.html: painel "✨ Novidades da v2.1" + textos atualizados; loja/README-publicacao.md para v2.1; captura-1-home.png atualizada com o novo layout.
- QA agent-browser (1440×900 e 400×600, file://): html-page aplicado, #app 1120px, herói 2 colunas, modos 6 colunas, topbar sticky; rodada completa de Contar (+12⭐ com combo), overlay data-close OK, home re-render OK (mascote 🦊, 3 missões, título não duplicado); popup 400×600 íntegro; options (portão), newtab (questão + 4 respostas) e web (CSS ../ carregado) sem erros; console/erros limpos — nenhuma violação de CSP.
- Reempacotado conta-comigo-extension.zip v2.1.0 (34 arquivos, ~576 KB, manifest na raiz, capturas incluídas).

Stage Summary:
- Conta Comigo v2.1.0: extensão abre SEMPRE em janela nativa em tela cheia (ícone ou Ctrl+Shift+U, Chromium e Firefox), nunca popup; layout da tela inicial reorganizado (herói, cartões, faixa de controles, grade fluida); CSP 100% limpa (sem scripts/handlers inline).
- Arquivos alterados: manifest.json, background.js, js/boot.js (novo), js/ui.js, js/i18n.js, js/newtab.js, css/style.css, game.html, popup.html, newtab.html, options.html, demo.html, web/index.html, loja/.
- Pacote: /home/z/my-project/download/conta-comigo-extension.zip · QA: /home/z/my-project/qa/v21-0*.png

---
Task ID: 6
Agent: Z.ai (agente principal)
Task: v2.1.1 — Corrigir os 3 erros reportados pelo Chrome: (1) 'background.scripts' requires manifest version of 2 or lower; (2)/(3) inline script bloqueado pela CSP 'script-src 'self'' (hash sha256-pR1/EfeZuQm7Lt8tShLqHetTXNYDMjbthabvdMMXhjY=).

Work Log:
- Evidência forense: sha256("document.documentElement.classList.add(\"html-page\");") = pR1/EfeZuQm7Lt8tShLqHetTXNYDMjbthabvdMMXhjY= — o hash reportado é EXATAMENTE o script inline da v2.0.0 (aspas duplas), já removido na v2.1. Os dois erros de CSP (duas variantes de directiva = CSP padrão de extensão antes/depois do Chrome 130) vêm da build ANTIGA ainda carregada no navegador do usuário. Scanner (scripts/scan_csp.py) confirmou: pasta e zip v2.1.0 com ZERO scripts inline.
- Erro 1 era real no pacote v2.1.0: manifest com background dual {"service_worker","scripts"} — Chrome MV3 rejeita a chave 'scripts' (mostra erro em chrome://extensions, embora funcione via SW).
- Solução (padrão da indústria p/ MV3 dual-browser): builds SEPARADAS. scripts/build_packages.py gera: conta-comigo/ (Chromium: só service_worker, sem gecko id) e conta-comigo-firefox/ (event page scripts + browser_specific_settings.gecko), idênticos no restante; background.js único compatível com os dois.
- manifest v2.1.1 nas duas builds; zip antigo conta-comigo-extension.zip REMOVIDO (evita reinstalar a build com background dual); criados conta-comigo-chrome-2.1.1.zip e conta-comigo-firefox-2.1.1.zip (~54 KB, manifest na raiz, demo/web/loja fora do pacote de instalação).
- background.js: cabeçalho atualizado (explica as builds separadas); nenhuma mudança de comportamento.
- demo.html: painel "Novidades da v2.1.1" (substitui feat "background dual"), instalação Chromium com passo 0 "REMOVA a versão antiga antes de carregar" e zip novo; instalação Firefox com zip próprio.
- loja/README-publicacao.md: checklist atualizado (zip por loja; nota de compatibilidade FF 109+ via event page).
- QA agent-browser: scan CSP limpo nas 2 pastas e 2 zips; game.html Chromium 1440×900 (html-page aplicado, #app 1120px, grade 6 colunas), rodada completa de Contar até a tela final "Incrível! 🏆" com +12⭐ e combo; demo.html com iframe OK; game.html da build Firefox OK; node --check em background.js das duas builds; manifests validados por json+assert (sem chave proibida em nenhuma build); console sem erros/violações em todas as páginas.
- QA: /home/z/my-project/qa/v211-01..05.png

Stage Summary:
- Causa-raiz: erro de background.scripts era do manifest dual (corrigido com builds separadas); erros de CSP eram da v2.0.0 ainda instalada no Chrome do usuário (o pacote atual já estava limpo) — a instrução-chave ao usuário é REMOVER a extensão antiga e carregar o zip 2.1.1.
- Entregáveis: download/conta-comigo/ (pasta Chromium), download/conta-comigo-firefox/ (pasta Firefox), conta-comigo-chrome-2.1.1.zip, conta-comigo-firefox-2.1.1.zip.
- Scripts reutilizáveis: scripts/build_packages.py (build dual), scripts/scan_csp.py (auditoria de CSP com hash).

---
Task ID: 7
Agent: Z.ai (agente principal)
Task: v2.2.0 — (a) mecânica de tempo entre respostas com pontuação por rapidez e precisão; (b) estudo amplo de cadastro/login/logout + competição sem contato direto (Google via Supabase) + acessibilidade, usabilidade e segurança cibernética (documento entregável).

Work Log:
- Implementado no jogo (v2.2.0): Timer (barra suave por questão, orçamento 30..22s por nível, +6s nos modos Contar/Histórias/Dinheiro/Dividir), pausa automática em overlays/aba oculta/tela inativa, timeout NUNCA pune (só zera bônus de rapidez, balão gentil); pontuação: acerto de primeira 100×nível + até 60×nível por tempo restante, após erro 40×nível, chefe ×2, diag/duelo não pontuam no perfil; chip ⚡ no jogo, pts-pop flutuante, end-pts com recorde por modo, ⚡ total no painel dos responsáveis e no popover de perfis; toggle "Cronômetro de pontos" na área dos responsáveis (DEFAULT_SETTINGS.timer=true); migração normalizeDB (points/bestPts) em parseDB/initDB.
- Bugs corrigidos no QA: ratio() com estado velho quando timer desligado no meio da rodada (pontos fantasma 148 em vez de 100) — start() zera totalMs/leftMs; recorde gravado em memória após saveState(true) do endRound — saveState(true) extra no bloco do recorde.
- i18n pt/en/es (end_pts, end_record, time_over, d_points, s_timer, s_timer_note); game.html/popup.html com #pts-chip/#timer-wrap/#end-pts; CSS (barra green→yellow→red, pts-pop, page-mode, hc); options.js v2.2.0.
- QA agent-browser: timer visível e contando, +142⚡ em resposta rápida, timeout→balão+100 base, toggle off→100 exatos, duelo sem timer/sem pontos, rodada completa ⚡795 + "Novo recorde", recorde persistido, painel ⚡, portão, i18n EN/ES, popup 400×600 íntegro; zero erros de console.
- Pacotes: build_packages.py VERSION=2.2.0 → conta-comigo-chrome-2.2.0.zip e conta-comigo-firefox-2.2.0.zip (57 KB cada), scan CSP limpo, zips 2.1.1 removidos; demo.html (Novidades v2.2 + zips novos) e loja/README-publicacao.md atualizados.
- Estudo (documento): skill docx recarregada com cadeia completa (create.md, design-system.md R1/WM-1/calcTitleLayout/calcCoverSpacing/tabelas horizontal-only, common-rules.md, toc.md, report.md, docx-js-core.md); fig1-curva-pontos.png via scripts/gen_chart_bonus.py (matplotlib, paleta WM-1, ylim corrigido p/ nível 5=800).
- Conteúdo PT-BR em scripts/estudo_data.js (9 capítulos, 11 tabelas: pontuação, orçamento de tempo, schema Supabase, política de dados, custos, riscos, backlog a11y WCAG 2.2, heurísticas usabilidade, STRIDE, endurecimento P0/P1/P2, roteiro por ondas); scripts/gen_estudo_conta_comigo.js (R1+WM-1, 3 seções: capa margem 0 / sumário romanos / corpo arábicos, Figura 1 embutida com proporção real).
- Pós-processamento: scripts/postprocess_estudo.py (novo, reutilizável): rodapés PAGE \* ROMAN/arabic, remove pgNumType, FUNDE begin+instr+separate do campo TOC com a 1ª entrada limpa (elimina a duplicata "1. Sumário Executivo" sem número que o docx-js gera dentro do sdt); corrigido bug de compactação que quebrava atributos XML (regenerado do zero).
- add_toc_placeholders.py --auto: 31 entradas, exit 0; postcheck 8/9 (0 erros; 1 aviso de espaçamento por células de tabela a 276 — intencional); PDF 22 páginas inspecionado (capa R1/WM-1, sumário limpo, tabelas teal, Figura 1, conclusões).

Stage Summary:
- Extensão v2.2.0: pontos por rapidez e precisão implementados e testados (sem punição, desligável, acessível) — pacotes chrome/firefox 2.2.0 atualizados.
- Estudo entregue: download/Conta-Comigo-Estudo-de-Expansao-e-Seguranca.docx (~126 KB, 22 páginas, PT-BR): viabilidade Google-via-Supabase no MV3 (empacotar supabase-js, chrome.identity/browser.identity + PKCE, id estável via key), arquitetura cliente-não-confiável (RLS, edge function, view pública sem PII), proteção infantil (LGPD art. 14, COPPA, minimização, exclusão), antifraude em camadas, backlog a11y/usabilidade priorizado e plano de segurança STRIDE/OWASP; roteiro em 4 ondas (v2.3→v3.0).
- Scripts reutilizáveis: estudo_data.js, gen_estudo_conta_comigo.js, postprocess_estudo.py, gen_chart_bonus.py.
- QA: /home/z/my-project/qa/v22-01..02.png e qa/fig1-curva-pontos.png

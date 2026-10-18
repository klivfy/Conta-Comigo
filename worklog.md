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


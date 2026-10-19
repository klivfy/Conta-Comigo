# Conta Comigo — Arquivos gerados

Extensão de navegador (Chrome + Firefox) de matemática lúdica para crianças a partir de 4 anos.
Versão atual: **v2.5.0**

## ⚠️ A extensão parece igual? Como atualizar e confirmar

Versões carregadas manualmente **não se atualizam sozinhas** — se o jogo parece o de antes, o navegador provavelmente ainda está com a build antiga. Para confirmar em 1 segundo: abra o jogo e olhe o **topo da tela** — desde a v2.4.1 há um **selo de versão** (ex.: `v2.5.0`) ao lado de 🔥. Sem selo = build anterior à 2.4.1.

**Importante sobre o progresso:** recarregar a extensão (botão ↻ em `chrome://extensions`) **preserva** estrelas, conquistas e perfis; **remover e reinstalar apaga**. Antes de remover, baixe o **backup datado** no botão 💾 da tela de Conquistas ou no painel dos responsáveis — depois reimporte no mesmo painel.

**Atualizar (Chrome/Edge/Brave):** com a extensão ainda instalada, clique em ↻ Recarregar no cartão da extensão e escolha a pasta nova descompactada (preserva tudo). Ou: backup → remover → carregar o zip novo → importar o backup.
**Atualizar (Firefox):** `about:debugging#/runtime/this-firefox` → *Recarregar*.

## Novidades da v2.5.0

- **Contra o Tempo** — novo desafio: 60 segundos de fôlego com recorde próprio por perfil.
- **Baús de recompensa** por ofensiva (3/7/14/21/30 dias): estrelas + figurinha garantida.
- **5 mascotes adultas** na loja (raposa, panda, dino, unicórnio, robô) + 3 temas novos (Oceano, Doces, Neve) + 3 acessórios novos.
- **Álbum com 36 figurinhas** (+12) e **20 conquistas** (2 secretas).
- **Persistência reforçada**: backup datado de um clique (vitrine de conquistas e painel), lembrete da idade do backup, estado blindado contra migrações.
- **Android**: pacote **PWA instalável e offline** (`conta-comigo-pwa-android-2.5.0.zip`), build Firefox com `gecko_android` (Firefox 113+) e rota Play Store via TWA documentada.
- Estudo completo: `Conta-Comigo-Estudo-Funcoes-Recompensas-e-Android.pdf` (30 funções: 10 alta / 10 média / 10 baixa).

## Extensão (instalação manual)

| Arquivo | Uso |
|---|---|
| `conta-comigo-chrome-2.5.0.zip` | Pacote para Chrome/Edge/Brave (Manifest V3, service worker) |
| `conta-comigo-firefox-2.5.0.zip` | Pacote para Firefox computador **e Android** (event page + `gecko_android` 113+) |
| `conta-comigo-pwa-android-2.5.0.zip` | **Android/PWA**: jogo instalável e offline (manifest + service worker + ícones maskable) — hospedar em https e "Adicionar à tela inicial" |
| `conta-comigo-pwa/` | Pasta do PWA pronta para hospedar (mesmo conteúdo do zip) |

- Instalação e novidades: abra `conta-comigo/demo.html` no navegador.
- Pasta `conta-comigo/` = código-fonte da build Chromium; pasta `conta-comigo-firefox/` = build Firefox.
- Novo na v2.4.1: **selo de versão visível no topo do jogo** (confirmação instantânea da build) e versão dinâmica nas opções.
- O que há de novo na v2.4.0: **voz cordial (Fase 1 do estudo)** — seleção automática de vozes naturais/neurais do sistema, prosódia por pontuação, biblioteca de falas afetuosas com o nome da criança (PT/EN/ES), voz por perfil, botão ouvir amostra, narração/efeitos separados, tempo extra por questão, reduzir movimentos, medalhas de persistência e modo sem loja.
- O que houve na v2.3.0: portão parental por senha (criada pelo adulto responsável em onboarding na primeira sessão, com lembrete de segurança, bloqueio progressivo após erros, troca de senha e redefinição de emergência) — a central de configurações deixou de ser aberta por conta de multiplicação.

## Estudos e documentos (PT-BR)

| Arquivo | Conteúdo |
|---|---|
| `Conta-Comigo-Estudo-Funcoes-Recompensas-e-Android.pdf` | 30 funções idealizadas (10 alta / 10 média / 10 baixa complexidade): desafios, prêmios, colecionáveis, temas, mascotes, loja, persistência das conquistas — e os 3 caminhos Android (PWA, Firefox AMO, Play via TWA) |
| `Conta-Comigo-Estudo-Voz-Natural-e-Cordial.pdf` | Estudo de voz humana/cordial para o público infantil: 4 caminhos (motor local aprimorado, vozes neurais do sistema, nuvem, pacote gravado) e recomendação em 3 fases (v2.4 → v3.x) |
| `Conta-Comigo-Estudo-de-Expansao-e-Seguranca.docx` | Estudo de expansão e segurança: pontuação por rapidez (implementada na v2.2.0), login Google via Supabase no MV3 (sem qualquer chat/troca de mensagens), LGPD/COPPA, acessibilidade WCAG, usabilidade e plano STRIDE |
| `Conta-Comigo-Analise-de-Conceito-e-Propostas-de-Melhorias.docx` | Análise de conceito e primeiras propostas de melhorias |
| `Conta-Comigo-750-Melhorias.xlsx` | Levantamento com **750 melhorias**: 250 de alto, 250 de médio e 250 de baixo impacto, em 23 domínios, com esforço, faixa de versão e Resumo com fórmulas vivas |
| `Conta-Comigo-150-Melhorias.xlsx` | Edição complementar **inédita** com mais 150 melhorias (50 alto / 50 médio / 50 baixo), sem sobreposição com a de 750 |

## Loja

- `conta-comigo/loja/` — checklist de publicação, listagem das lojas, política de privacidade e capturas de tela.

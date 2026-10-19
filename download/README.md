# Conta Comigo — Arquivos gerados

Extensão de navegador (Chrome + Firefox) de matemática lúdica para crianças a partir de 4 anos.
Versão atual: **v2.4.0**

## Extensão (instalação manual)

| Arquivo | Uso |
|---|---|
| `conta-comigo-chrome-2.4.0.zip` | Pacote para Chrome/Edge/Brave (Manifest V3, service worker) |
| `conta-comigo-firefox-2.4.0.zip` | Pacote para Firefox (event page + `browser_specific_settings`) |

- Instalação e novidades: abra `conta-comigo/demo.html` no navegador.
- Pasta `conta-comigo/` = código-fonte da build Chromium; pasta `conta-comigo-firefox/` = build Firefox.
- O que há de novo na v2.4.0: **voz cordial (Fase 1 do estudo)** — seleção automática de vozes naturais/neurais do sistema, prosódia por pontuação, biblioteca de falas afetuosas com o nome da criança (PT/EN/ES), voz por perfil, botão ouvir amostra, narração/efeitos separados, tempo extra por questão, reduzir movimentos, medalhas de persistência e modo sem loja.
- O que houve na v2.3.0: portão parental por senha (criada pelo adulto responsável em onboarding na primeira sessão, com lembrete de segurança, bloqueio progressivo após erros, troca de senha e redefinição de emergência) — a central de configurações deixou de ser aberta por conta de multiplicação.

## Estudos e documentos (PT-BR)

| Arquivo | Conteúdo |
|---|---|
| `Conta-Comigo-Estudo-Voz-Natural-e-Cordial.pdf` | Estudo de voz humana/cordial para o público infantil: 4 caminhos (motor local aprimorado, vozes neurais do sistema, nuvem, pacote gravado) e recomendação em 3 fases (v2.4 → v3.x) |
| `Conta-Comigo-Estudo-de-Expansao-e-Seguranca.docx` | Estudo de expansão e segurança: pontuação por rapidez (implementada na v2.2.0), login Google via Supabase no MV3 (sem qualquer chat/troca de mensagens), LGPD/COPPA, acessibilidade WCAG, usabilidade e plano STRIDE |
| `Conta-Comigo-Analise-de-Conceito-e-Propostas-de-Melhorias.docx` | Análise de conceito e primeiras propostas de melhorias |
| `Conta-Comigo-750-Melhorias.xlsx` | Levantamento com **750 melhorias**: 250 de alto, 250 de médio e 250 de baixo impacto, em 23 domínios, com esforço, faixa de versão e Resumo com fórmulas vivas |
| `Conta-Comigo-150-Melhorias.xlsx` | Edição complementar **inédita** com mais 150 melhorias (50 alto / 50 médio / 50 baixo), sem sobreposição com a de 750 |

## Loja

- `conta-comigo/loja/` — checklist de publicação, listagem das lojas, política de privacidade e capturas de tela.

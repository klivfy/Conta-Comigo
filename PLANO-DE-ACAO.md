# Plano de ação — Conta Comigo

Baseado na auditoria estrutural (code-review, security, design-system, a11y, apple-design, design-critique, impeccable) + pendências anteriores.
Legenda: **[eu]** código na branch · **[você]** ação em conta/GitHub/loja.

## Fase 0 — Emergência de segurança
- [ ] 0.1 [você] Gerar novo keystore fora do repo e guardar em GitHub Secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASS`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASS`)
- [x] 0.2 [eu] Remover `upload.jks`, `sha256.txt` e senhas do repo; ignorar `native/android/keystore/`
- [x] 0.3 [eu] Gradle e workflow Android leem o keystore de secrets/variáveis de ambiente
- [ ] 0.4 [você] Revogar token antigo; criar novo com escopo Workflows → mover `download/kit-fase1/workflows/` para `.github/workflows/`
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
- [x] 2.5 Gradle `rootProject.name` sem espaço · [ ] 2.6 workflows em `.github/` (depende do token — 0.4) · [x] 2.7 `download/conta-comigo/` como fonte única (Firefox/PWA fora do Git) · [x] 2.8 axe-core no CI (`scripts/a11y_check.cjs` + baseline; workflow `ci.yml` no kit)

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
- [ ] 5.1 tokens semânticos · 5.2 escalas (tipografia/espaço/raio/motion) · 5.3 eliminar cores soltas · 5.4 prefers-color-scheme · 5.5 `/impeccable init` + polish

## Fase 6 — Funcionalidade e distribuição
- [ ] 6.1 [eu] Fase A: voz/armazenamento bimodais · 6.2 [você] ativar Pages · 6.3 [você] AAB assinado + teste em aparelho
- [ ] 6.4 [você] testar instaladores Windows · 6.5 [eu] iOS/Capacitor (Preferences, speechSynthesis) · 6.6 [você] contas de loja + política de privacidade

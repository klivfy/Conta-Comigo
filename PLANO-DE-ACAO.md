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

> Nota: a versão segue 2.6.0 — o service worker só entrega atualizações a quem já instalou depois do item 2.4 (cache por hash) ou de um bump de versão.

## Fase 2 — Build e CI confiáveis
- [ ] 2.1 Caminhos relativos nos scripts · 2.2 versão a partir do manifest · 2.3 fonte empacotada
- [ ] 2.4 Service worker (cache por hash, só `res.ok`, limpar versões antigas)
- [ ] 2.5 Gradle `rootProject.name` sem espaço · 2.6 workflows em `.github/` · 2.7 `download/` como fonte única · 2.8 axe-core no CI

## Fase 3 — Acessibilidade WCAG 2.1 AA
- [ ] 3.1 aria-labels textuais via i18n · 3.2 labels nos campos de senha · 3.3 semântica/foco de modais
- [ ] 3.4 aria-live + nome acessível da cena · 3.5 foco ≥3:1 · 3.6 alvos ≥44px · 3.7 prefers-reduced-motion · 3.8 contrastes restantes

## Fase 4 — Experiência da criança
- [ ] 4.1 "Jogar" acima da dobra no celular · 4.2 só modos desbloqueados + próximo prêmio · 4.3 adiar senha · 4.4 calendário de missões · 4.5 fonte própria

## Fase 5 — Design system
- [ ] 5.1 tokens semânticos · 5.2 escalas (tipografia/espaço/raio/motion) · 5.3 eliminar cores soltas · 5.4 prefers-color-scheme · 5.5 `/impeccable init` + polish

## Fase 6 — Funcionalidade e distribuição
- [ ] 6.1 [eu] Fase A: voz/armazenamento bimodais · 6.2 [você] ativar Pages · 6.3 [você] AAB assinado + teste em aparelho
- [ ] 6.4 [você] testar instaladores Windows · 6.5 [eu] iOS/Capacitor (Preferences, speechSynthesis) · 6.6 [você] contas de loja + política de privacidade

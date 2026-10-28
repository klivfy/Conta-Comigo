# Versões nativas — Android (TWA), Windows (Electron) e iOS (Capacitor)

> Estudo de viabilidade completo: `download/Conta-Comigo-Estudo-Viabilidade-Nativas-Android-Windows.pdf`
> Veredito: **Android VIÁVEL (TWA)** · **Windows VIÁVEL (Electron)** — sem reescrita do jogo.

## Arquitetura (Fase 1 — implementada)

```
download/conta-comigo/          ← fonte única do jogo (motor compartilhado)
        │  scripts/build_pwa.py
        ▼
download/conta-comigo-pwa/      ← PWA autocontida (gerada; fora do Git)
        │
        ├─► GitHub Pages ──► https://klivfy.github.io/Conta-Comigo/
        │                      (workflow: .github/workflows/pages.yml)
        │
        ├─► native/android/   ← TWA (Gradle + androidbrowserhelper)
        │                      (workflow: .github/workflows/android.yml → APK + AAB)
        │
        ├─► native/windows/   ← Electron + electron-builder
        │                      (workflow: .github/workflows/windows.yml → instalador NSIS + portable)
        │
        └─► native/ios/       ← Capacitor 8 (voz e armazenamento nativos) — Fase 6.5
                               (workflow: .github/workflows/ios.yml → build de teste sem assinatura)
```

O jogo tem **uma única fonte** — correções e recursos valem para as 5
plataformas (Chrome, Firefox, Web/PWA, Android, Windows) numa tacada só.

## Como o CI gera os pacotes

| Workflow | Gatilho | Saída (aba *Actions* → artefatos) |
|---|---|---|
| `Android (TWA)` | push em `native/android/**` ou manual | `conta-comigo-android-2.6.0` — APK (sideload) + AAB (Play Console) |
| `Windows (Electron)` | push em `native/windows/**` ou manual | `conta-comigo-windows-2.6.0` — instalador NSIS + portable (x64) |
| `iOS (Capacitor)` | push em `native/ios/**`, no jogo ou manual | `conta-comigo-ios-simulator-2.6.0` — app para o Simulador (assinatura e TestFlight: Fase C) |
| `Site (GitHub Pages)` | push em `download/conta-comigo/**` ou manual | site PWA com `.well-known/assetlinks.json` + política de privacidade |

Requisito de uma única vez para o Pages: **Settings → Pages → Build and
deployment → Source: "GitHub Actions"** (exige conta com permissão de
Administração no repositório — clique manual, sem custo).

## TWA Android — por que tela cheia sem barra de URL

O `assetlinks.json` publicado no site (`/.well-known/`) declara o pacote
`com.conta.comigo.matematica.klivfy.com` (Android) + fingerprint SHA256 da upload key, que fica fora do
repositório (GitHub Secrets no CI). O workflow Android confere a cada build
que o fingerprint bate — se divergir, falha cedo com mensagem clara.

O Android só lê `/.well-known/assetlinks.json` na **raiz do domínio**
(`https://klivfy.github.io/.well-known/…`), não em `/Conta-Comigo/.well-known/`.
Enquanto não houver um repositório `klivfy.github.io` ou domínio próprio, o
TWA abre com barra de URL.

Detalhes e rotação de chave: `native/android/keystore/README.md`.

## Windows — privacidade e offline

O Electron carrega o jogo via `file://` com `contextIsolation` e `sandbox`
ativados, navegação externa bloqueada e sem chamadas de rede — o mesmo
comportamento offline das outras plataformas. O progresso fica no
`localStorage` do perfil do aplicativo.

## Publicação nas lojas (Fases seguintes)

1. **Google Play**: conta de desenvolvedor (US$ 25, única) → enviar o AAB →
   Data Safety ("não coletamos nada") → programa **Families** (declarar
   público infantil; o zero-coleta do app facilita a aprovação).
2. **Microsoft Store**: conta de desenvolvedor (individual grátis) → enviar o
   instalador/MSIX gerado do Electron → política de crianças da Microsoft.
3. **App Store**: Apple Developer Program (US$ 99/ano) → Kids Category →
   etiqueta "Dados não coletados" → TestFlight → revisão. Detalhes em
   `native/ios/README.md`.
4. Atualizações: novas versões do jogo → push em `main` → CI regenera tudo
   (no iOS cada versão passa pela revisão da Apple; não há atualização "pela web").

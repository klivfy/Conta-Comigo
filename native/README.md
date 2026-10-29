# Versões nativas — Android e iOS (Capacitor) e Windows (Electron)

> Estudo de viabilidade completo: `download/Conta-Comigo-Estudo-Viabilidade-Nativas-Android-Windows.pdf`
> Veredito: **Android VIÁVEL** · **Windows VIÁVEL (Electron)** — sem reescrita do jogo.
> Desde 28/10/2026 o Android usa o **Capacitor** (o jogo vai dentro do app), no lugar da TWA. Motivo na seção "Android" abaixo.

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
        ├─► native/android/   ← Capacitor 8, jogo dentro do APK/AAB (voz, armazenamento e backup nativos)
        │                      (workflow: .github/workflows/android.yml → APK + AAB)
        │
        ├─► native/windows/   ← Electron + electron-builder
        │                      (workflow: .github/workflows/windows.yml → instalador NSIS + portable)
        │
        └─► native/ios/       ← Capacitor 8 (voz e armazenamento nativos) — Fase 6.5
                               (workflow: .github/workflows/ios.yml → build de teste sem assinatura)
```

O jogo tem **uma única fonte** — correções e recursos valem para as 6
plataformas (Chrome, Firefox, Web/PWA, Android, Windows, iOS) numa tacada só.

## Como o CI gera os pacotes

| Workflow | Gatilho | Saída (aba *Actions* → artefatos) |
|---|---|---|
| `Android (Capacitor)` | push ou PR em `native/android/**`, no jogo ou manual | `conta-comigo-android-2.7.1` — APK (sideload) + AAB (Play Console); sem os secrets da chave, `…-sem-assinatura` |
| `Windows (Electron)` | push em `native/windows/**` ou manual | `conta-comigo-windows-2.7.1` — instalador NSIS + portable (x64) |
| `iOS (Capacitor)` | push em `native/ios/**`, no jogo ou manual | `conta-comigo-ios-simulator-2.7.1` — app para o Simulador (assinatura e TestFlight: Fase C) |
| `Site (GitHub Pages)` | push em `download/conta-comigo/**` ou manual | site PWA + política de privacidade |

Requisito de uma única vez para o Pages: **Settings → Pages → Build and
deployment → Source: "GitHub Actions"** (exige conta com permissão de
Administração no repositório — clique manual, sem custo).

## Android — o jogo dentro do app (Capacitor)

```
native/android/
├── package.json             Capacitor 8 + plugins: Preferences, TextToSpeech, Filesystem, Share, App
├── capacitor.config.json    appId com.klivfy.conta.comigo.matematica · webDir www · barras do sistema
├── www/                     o jogo (gerado por scripts/build_android_www.py; fora do Git)
├── keystore/README.md       upload key (o .jks nunca entra no Git)
└── android/                 projeto Gradle (AGP 8.13.2, compileSdk/targetSdk 36, minSdk 24, R8)
```

**Por que saiu a TWA.** A TWA abria `https://klivfy.github.io/Conta-Comigo/` e dependia de três coisas fora do app: o site publicado no GitHub Pages, o `assetlinks.json` na **raiz** do domínio (`klivfy.github.io/.well-known/`, que exige outro repositório) e o fingerprint da chave de assinatura do Google nesse arquivo. Sem as três, o app abria uma página 404 com barra de endereço. No Capacitor o jogo é servido de dentro do pacote (`https://localhost`), então funciona offline desde a primeira abertura e não depende de site, domínio ou fingerprint.

Dentro do app, `engine.js` detecta o Capacitor e usa os plugins nativos:

| | Na web / extensão / Electron | No app Android |
|---|---|---|
| **Progresso** | `localStorage` (e `chrome.storage` na extensão) | **Preferences** (SharedPreferences), que o sistema não recolhe; o `localStorage` fica como segunda cópia |
| **Voz** | Web Speech API | **TextToSpeech** do Android pelo plugin, com a mesma escolha de voz e prosódia (o iOS usa os mesmos dois plugins, Preferences e TextToSpeech) |
| **Backup** | download do `.json` | o arquivo vai para o cache do app (**Filesystem**) e sai pela folha de compartilhar (**Share**): Arquivos, Drive, e-mail… |
| **Voltar** | — | botão Voltar do Android (**App**): fecha o balão, volta da tela para o início e, no início, minimiza o app. Com um aviso aberto não faz nada (a pausa de descanso não pode ser pulada) |
| **Barras do sistema** | — | o jogo fica de borda a borda e respeita `env(safe-area-inset-*)`; os ícones das barras ficam claros nos temas escuros (Espaço, alto contraste) |

Gerar e abrir (precisa de JDK 21 e do Android SDK 36; o Android Studio traz os dois):

```bash
python3 scripts/build_android_www.py   # PWA → native/android/www, ícones e abertura da marca
cd native/android
npm ci
npx cap sync android                   # copia www para o projeto Gradle e liga os plugins
npx cap open android                   # abre no Android Studio → ▶ num aparelho ou emulador
cd android && ./gradlew bundleRelease  # AAB em app/build/outputs/bundle/release/
```

Assinatura e envio ao Play: `native/android/keystore/README.md`.

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

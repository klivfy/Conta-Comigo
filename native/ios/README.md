# iOS — casco Capacitor do Conta Comigo

> Estudo: `download/Conta-Comigo-Estudo-Viabilidade-Nativa-Android-iOS-Windows.pdf`.
> A rota escolhida é o Capacitor no iOS e, desde 28/10/2026, também no Android (`native/android/`). O Windows continua no Electron.

## O que tem aqui

```
native/ios/
├── package.json             Capacitor 8 + @capacitor/preferences + @capacitor-community/text-to-speech
├── capacitor.config.json    appId com.klivfy.conta.comigo.matematica · webDir www
├── resources/icon-1024.png  ícone da App Store (gerado, RGB sem alfa)
├── www/                     o jogo (gerado; fora do Git)
└── ios/                     projeto Xcode (Swift Package Manager, sem CocoaPods)
```

O jogo é o mesmo motor de `download/conta-comigo/`. Dentro do app, `engine.js` detecta o Capacitor e muda duas coisas sozinho:

| | Na web / extensão / Electron | No app iOS |
|---|---|---|
| **Progresso** | `localStorage` (e `chrome.storage` na extensão) | **Preferences** nativo, que o sistema não recolhe. O `localStorage` fica como segunda cópia e vale a cópia gravada por último. |
| **Voz** | Web Speech API. No Safari do iOS, faz `cancel()` antes de cada fala. | **AVSpeechSynthesizer** pelo plugin TextToSpeech, com a mesma escolha de voz (🌟 Luciana Melhorada e outras), a mesma velocidade e a mesma prosódia por pontuação. |

O backup de um clique do painel dos responsáveis continua disponível como cinto de segurança.

## Gerar e abrir (precisa de Mac com Xcode 16+)

```bash
python3 scripts/build_ios_www.py   # PWA → native/ios/www, ícone, splash e versão
cd native/ios
npm ci
npx cap sync ios                   # copia www para o projeto e liga os plugins
npx cap open ios                   # abre no Xcode → ▶ no Simulador
```

Sem Mac, o workflow **iOS (Capacitor)** (`download/kit-fase1/workflows/ios.yml`) compila para o Simulador e para aparelho, sem assinatura. Ele publica o `.app` do Simulador como artefato.

## Publicar (Fase C: depende da conta Apple, US$ 99/ano)

1. Entrar no Apple Developer Program e criar o App ID `com.klivfy.conta.comigo.matematica` (o mesmo vale para iPhone, iPad e Mac; ver `IDENTIFICADORES.md`).
2. No App Store Connect:
   - categoria **Educação** e **Kids Category, 5 anos ou menos**;
   - etiqueta de privacidade **"Dados não coletados"**;
   - URL da política de privacidade.
3. Assinatura no CI com os secrets do certificado de distribuição e do perfil, e envio ao TestFlight. É um job novo no `ios.yml`, que só entra quando a conta existir.

## Por que não há service worker no app

O WKWebView do Capacitor serve os arquivos de dentro do pacote (`capacitor://localhost`), então o jogo já funciona offline. Por isso o `build_ios_www.py` tira o registro do service worker e o `manifest.webmanifest`.

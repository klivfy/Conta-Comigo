# Conta Comigo — plataformas e mercados

Relatório de presença futura · 28/10/2026 · versão do jogo 2.6.4

## 1. Resumo

O Conta Comigo é um jogo em HTML, CSS e JavaScript puro, sem servidor, que funciona offline e fala português, inglês e espanhol. Esse formato é a maior vantagem que ele tem para ganhar mercados: o mesmo código já vira extensão de navegador, app Android, app Windows e app de iPhone e iPad. Com pouco trabalho extra ele também vira app de Mac, Linux, TV e quiosque escolar.

- **Hoje (prontos ou quase):** Chrome, Edge, Firefox (computador e Android), Microsoft Store, Google Play, versão web/PWA e o projeto de iPhone e iPad (compila no CI, ainda sem conta Apple).
- **Bloqueios atuais, todos de configuração e não de código:**
  1. GitHub Pages desligado: a política de privacidade e a PWA dependem dele. O app Android não depende mais: desde 28/10/2026 o jogo vai dentro do app (Capacitor).
  2. Chave de upload do Android a criar.
  3. App novo no Play Console com o pacote `com.klivfy.conta.comigo.matematica`.
  4. Identidade da Partner Center para o pacote da Microsoft Store.
  5. Conta Apple (US$ 99/ano).
- **Maior lacuna para crescer nos mercados de língua inglesa e espanhola:** o modo **Dinheiro** sempre usa **reais**, inclusive em inglês e espanhol. Num jogo que ensina dinheiro a crianças de 4 a 8 anos, isso é um erro de conteúdo nos EUA, na Espanha, no México e em todo país que não usa o real. Ver a seção 5.
- **Plataformas viáveis que ainda não foram definidas: 30**, na seção 7. As de melhor custo-benefício são:
  1. Opera (reusa o zip do Chrome).
  2. Ligar o Mac no App Store Connect (zero código).
  3. Windows ARM64 (só um alvo a mais no build).
  4. winget.
  5. Linux em Flathub e AppImage.
  6. Samsung Galaxy Store.
  7. Canais escolares (Google Admin, Apple School Manager, Intune).
  8. TVs com Android TV e Google TV.

## 2. Regra de nomes (aplicada nesta versão)

Detalhes em [`IDENTIFICADORES.md`](IDENTIFICADORES.md). Em resumo:

- **Identificador único:** `com.klivfy.conta.comigo.matematica` para Android, iPhone, iPad, Mac, Windows e Linux. O `sync_check.cjs` confere 8 lugares no CI.
- **Exceções:**
  - O Firefox fica com `conta-comigo@klivfy.com`, porque já foi enviado ao AMO e trocar cria outro add-on.
  - Chrome e Edge geram o próprio ID.
  - A identidade MSIX vem da Partner Center.
  - A PWA é identificada pela URL.
- **Arquivos:** `conta-comigo-<plataforma>-<versão>[-<arquitetura>][-<variante>].<ext>`. Os do Windows foram renomeados nesta versão, de `Conta-Comigo-2.6.2-x64.exe` para `conta-comigo-windows-2.6.4-x64-instalador.exe`.

## 3. Estado atual por plataforma

| Plataforma | Pacote | Identificador | Nome exibido | Idiomas da listagem | Estado |
|---|---|---|---|---|---|
| **Chrome / Chromium** | `conta-comigo-chrome-2.6.4.zip` (MV3, service worker) | gerado pela loja | `_locales`: pt-BR (padrão), en, es | textos e imagens prontos nos 3 | Pronto para enviar |
| **Edge** | o mesmo zip | gerado pela Microsoft | igual ao Chrome | prontos nos 3 | Pronto para enviar |
| **Firefox computador e Android** | `conta-comigo-firefox-2.6.4.zip` (event page, Firefox 128+) | `conta-comigo@klivfy.com` (fixo) | `_locales` nos 3 | prontos nos 3 | 2.6.1 já enviada; 2.6.4 pronta |
| **Windows 10/11** | Electron 44: instalador NSIS, portátil e MSIX/APPX (x64) | `appId` = `com.klivfy.conta.comigo.matematica`; MSIX pela Partner Center | "Conta Comigo" (o pacote não traduz o nome; a listagem da loja traduz) | prontos nos 3 | Build verde; falta a identidade da Partner Center |
| **Android (Google Play)** | Capacitor 8 com o jogo dentro do app, `.aab` minSdk 24 / target 36 | `com.klivfy.conta.comigo.matematica` | "Conta Comigo", "Count With Me" e "Cuenta Conmigo" (segue o idioma do aparelho) | prontos nos 3 | `.aab` gerado sem assinatura; falta a chave e o app novo no Console |
| **iPhone e iPad** | Capacitor 8, iOS 15+, família 1,2 | `com.klivfy.conta.comigo.matematica` | "Conta Comigo" | não preparados | Compila no CI; falta conta Apple |
| **Mac** | o app de iPad roda em Mac com Apple silicon | mesmo App ID | — | — | Possível sem código; não ligado |
| **Web / PWA** | `download/conta-comigo-pwa/` e `web/index.html` (escolas) | URL | nos 3 | — | Pages desligado; o site não está no ar |
| **Linux** | **nenhum** | regra pronta: Flatpak `com.klivfy.conta.comigo.matematica`, Snap `conta-comigo-matematica` | — | — | Não existe build |

**Linux em detalhe.** O código do Electron em `native/windows/main.js` não depende de Windows, então o mesmo projeto gera AppImage, `.deb`, `.rpm`, Flatpak e Snap pelo electron-builder. Faltam:

1. Ícones PNG de 512 e 256 px (hoje só existe o `.ico`).
2. Um alvo `linux` no `package.json`.
3. Um job no CI.

No Flathub, o ID `com.klivfy...` exige provar que a Klivfy controla o domínio `klivfy.com`, publicando um token em `https://klivfy.com/.well-known/org.flathub.VerifiedApps.txt`. Se esse domínio não for da Klivfy, o ID precisa usar um domínio que ela tenha. O Flathub não aceita mais apps novos com o prefixo `io.github`.

## 4. Mercados por idioma

O jogo já tem os 3 idiomas e escolhe sozinho pelo idioma do navegador ou do sistema. Os números de população são estimativas arredondadas, só para ordenar prioridades.

### Português (~265 milhões de falantes)

| País | Observação para o produto |
|---|---|
| Brasil (~213 mi) | Mercado principal. Android domina; Chromebooks e Windows nas redes públicas. Conteúdo, voz (pt-BR) e moeda (real) corretos. **ECA Digital** em vigor (ver seção 6). |
| Portugal (~10,7 mi) | Usa **pt-PT**: "ecrã", "telemóvel", tratamento por "tu", euro. A listagem e a voz pt-BR soam estrangeiras para crianças pequenas. |
| Angola (~37 mi), Moçambique (~34 mi) | Norma europeia na escola; muitos Android de entrada e conexão cara. O jogo offline e leve é vantagem real. Moedas: kwanza e metical. |
| Cabo Verde, Guiné-Bissau, São Tomé e Príncipe, Timor-Leste, Guiné Equatorial (cooficial), Macau | Mercados pequenos; mesma observação de norma europeia. |

### Espanhol (~500 milhões de nativos)

| Região | Observação |
|---|---|
| México (~130 mi), Colômbia, Argentina, Peru, Venezuela, Chile, Equador, Guatemala, Cuba, Bolívia, República Dominicana, Honduras, Paraguai, El Salvador, Nicarágua, Costa Rica, Panamá, Uruguai, Porto Rico | Usam **es-419**. "Vuelto" (palavra do jogo) é comum no Cone Sul e nos Andes; no México diz-se "cambio". A voz é **es-ES** fixa: soa espanhola da Espanha. Cada país tem moeda própria (peso, sol, colón, quetzal, dólar…). |
| Espanha (~49 mi) | es-ES; "cambio"; euro. |
| EUA (~42 mi de hispanofalantes nativos) | Escolas bilíngues; dólar. Forte demanda por material educativo em espanhol. |
| Guiné Equatorial | Espanhol oficial. |

**Cuba:** a Play Store e a App Store não vendem nem distribuem apps lá, por sanções. Só a PWA ou o APK direto chegam.

### Inglês (~1,5 bilhão de falantes, ~380 mi nativos)

| Região | Observação |
|---|---|
| EUA, Canadá | en-US; dólar; **COPPA** (EUA). Canadá também em francês, que está fora do escopo. |
| Reino Unido, Irlanda | en-GB: "maths", libra ou euro; **Children's Code** (ICO). |
| Austrália, Nova Zelândia | en-AU; dólar local. |
| Índia, Nigéria, Filipinas, África do Sul, Quênia, Gana, Paquistão etc. | Inglês como língua de ensino; Android de entrada; moedas locais. |

## 5. Lacunas de localização que limitam mercados

| # | Lacuna | Onde | Impacto | Correção sugerida |
|---|---|---|---|---|
| L1 ✅ | **Modo Dinheiro sempre em reais** (resolvido na 2.6.4: moeda pela região do aparelho, com escolha no painel) ("How many reais…", "¿Cuántos reales…", `R$ ?`) | `engine.js` (`R$`), `i18n.js` (`t_m_coins`, `t_2x2`, `t_change`) | Conteúdo errado para crianças fora do Brasil; revisores de loja e professores percebem | Moeda por região (BRL, EUR, USD, GBP, MXN…) a partir do idioma do sistema, com escolha no painel dos responsáveis; ou moeda genérica ("moedas") como padrão em en e es |
| L2 | Só existe **pt-BR** | `i18n.js` | Portugal e África lusófona | Variante pt-PT (vocabulário, "tu", voz pt-PT) |
| L3 ✅ | Voz **es-ES fixa** e vocabulário misto (resolvido na 2.6.4: voz e "cambio"/"vuelto" pela região do aparelho; o resto do vocabulário misto, como "computadoras", ficou) | `TTS_LANG` em `i18n.js` | Fala com sotaque da Espanha para a América Latina | Escolher es-MX/es-US/es-419 pela localidade do sistema; "cambio" ou "vuelto" por região |
| L4 | Voz **en-US fixa** | `TTS_LANG` | Pequeno no Reino Unido e na Austrália | Usar en-GB/en-AU quando o sistema estiver nessa localidade |
| L5 | Nome no Windows não traduzido ("Conta Comigo"). **No Android já resolvido** (`values-en`/`values-es`, 28/10/2026) | `native/windows/package.json` | Ícone em português para quem usa o Windows em inglês ou espanhol | O MSIX aceita `DisplayName` por idioma |
| L6 | Listagens das lojas sem pt-PT, en-GB e es-ES separados | `loja/lojas/*.md` | Menor conversão local | Duplicar com ajustes de vocabulário depois de L1 a L3 |

## 6. Regras de cada mercado para apps infantis

| Mercado | Norma | Situação do Conta Comigo |
|---|---|---|
| Brasil | **ECA Digital** (Lei 15.211/2025, regulada pelo Decreto 12.880/2026): proíbe caixas de recompensa em jogos para crianças, pede supervisão parental e proteção por padrão. **LGPD** art. 14 (dados de crianças). | Sem coleta de dados e com portão parental. O **baú de recompensas** dá uma figurinha **aleatória** por ofensiva, sem pagamento. A proibição mira caixas que se compram, mas a definição legal precisa ser lida com um advogado. Para tirar qualquer dúvida, o baú pode entregar a próxima figurinha em ordem em vez de sortear. |
| EUA | COPPA | Atende: nada é coletado. |
| União Europeia (Portugal, Espanha) | RGPD art. 8; Portugal fixa 13 anos, Espanha 14 | Atende: nada é coletado. |
| Reino Unido | Age Appropriate Design Code | Atende: privacidade por padrão, sem rastreamento. |
| Google Play | Política *Para a família*; Segurança dos dados | Textos prontos. "Nenhum dado coletado". |
| Apple | Kids Category: sem anúncios ou análise de terceiros, portão parental antes de links e compras | Atende. Escolher **uma** faixa: "5 anos ou menos" ou "6–8 anos". |
| Microsoft Store | IARC + política para menores | Atende. |

## 7. Plataformas que o jogo pode atender e que ainda não foram definidas

Esforço: **B** = horas a 2 dias · **M** = 1 a 2 semanas · **A** = mais de 2 semanas ou reescrita parcial. As taxas citadas são as conhecidas até esta data; confirme no portal de cada loja.

### 7.1 Navegadores e extensões

| # | Plataforma | Como | Esforço | Custo | Alcance pt/en/es | Observações |
|---|---|---|---|---|---|---|
| 1 | **Opera add-ons** | O mesmo zip do Chrome | B | Grátis | Opera e Opera GX, fortes no Brasil e na América Latina | A revisão é manual e pode demorar. |
| 2 | **Safari (Mac e iPhone/iPad)** — Safari Web Extension | `xcrun safari-web-extension-converter` sobre o pacote do Chrome; app contêiner com bundle `com.klivfy.conta.comigo.matematica.extensao` | M | Conta Apple | Todo usuário Apple | Precisa de Mac e Xcode; o conversor só faz a base. Pode vir junto do app de iPhone e iPad (mesma conta). |
| 3 | **Vivaldi, Brave, Yandex, Samsung Internet (computador)** | Instalam pela Chrome Web Store | — | — | Automático | Só testar. |
| 4 | **Firefox ESR em escolas** | Política corporativa `ExtensionSettings` com o zip do AMO | B | Grátis | Redes escolares com Linux | Documentar para as secretarias. |

### 7.2 Apple

| # | Plataforma | Como | Esforço | Custo | Observações |
|---|---|---|---|---|---|
| 5 | **App Store — iPhone e iPad** | Projeto Capacitor já pronto (`native/ios`) | M (assinatura, TestFlight, listagem) | US$ 99/ano | Já previsto, mas não lançado. Precisa da listagem nos 3 idiomas e de capturas de iPhone 6,9" e iPad 13". |
| 6 | **Mac (Apple silicon) — app de iPad no Mac** | Opção em App Store Connect com o mesmo App ID | B | Incluído | Zero código; testar teclado e janela. |
| 7 | **Mac Catalyst** (app Mac de verdade) | Ligar `SUPPORTS_MACCATALYST` no projeto Xcode, com *Universal Purchase* | M | Incluído | Atende Macs Intel e dá janela redimensionável. Testar o plugin de voz. |
| 8 | **Mac fora da App Store** | Electron `--mac dmg` (arm64 e x64) | M | Notarização exige a conta Apple | Para escolas que distribuem por MDM. |
| 9 | **Apple Vision Pro** | Apps de iPad rodam no visionOS em modo compatível | B | Incluído | Só não desativar; mercado pequeno. |
| 10 | **Apple School Manager / Apps e Livros** | Distribuição em volume do app do item 5 | B | Grátis para apps gratuitos | Escolas privadas no Brasil, em Portugal, na Espanha e nos EUA. |

### 7.3 Windows

| # | Plataforma | Como | Esforço | Observações |
|---|---|---|---|---|
| 11 | **Windows em ARM64** (Copilot+ PC, Surface) | `arch: ["x64","arm64"]` no electron-builder | B | Sem isso o x64 roda emulado e fica mais lento. |
| 12 | **winget** | Manifesto no repositório `microsoft/winget-pkgs` apontando para o instalador | B | Grátis; Intune e escolas instalam por linha de comando. Exige o instalador hospedado (GitHub Releases). |
| 13 | **Microsoft Intune / Store para escolas** | O app da Microsoft Store já aparece no Intune | — | Documentar para as redes. |
| 14 | **Versão PWA na Microsoft Store** (alternativa ao Electron) | PWABuilder gera MSIX a partir da PWA | B | Pacote de ~1 MB contra ~100 MB do Electron; depende do Pages no ar. Avaliar como versão "leve". |
| 15 | **Chocolatey / Scoop** | Pacote comunitário | B | Opcional. |

### 7.4 Linux (distribuição universal)

| # | Plataforma | Como | Esforço | Observações |
|---|---|---|---|---|
| 16 | **AppImage** (universal, sem instalação) | Electron `--linux AppImage` | B | Publicar no GitHub Releases e no AppImageHub. |
| 17 | **Flathub** (Flatpak, universal) | Manifesto Flatpak com o build Electron | M | ID `com.klivfy.conta.comigo.matematica`; verificação do domínio klivfy.com; Metainfo com capturas e descrição nos 3 idiomas; classificação OARS (toda "none"). |
| 18 | **Snap Store** (Ubuntu) | `snapcraft` ou electron-builder `snap` | B | Nome `conta-comigo-matematica`. |
| 19 | **.deb e .rpm** | electron-builder | B | Para repositórios de distros. |
| 20 | **Distribuições educativas** (Edubuntu; LliureX na Comunidade Valenciana; EducaAndOS na Andaluzia; MAX em Madri; distros estaduais no Brasil) | Pacote `.deb` e contato com cada equipe | M | Muitas foram descontinuadas ou mudaram; **verificar quais seguem ativas** antes de investir. |

### 7.5 Android além do Google Play

Desde 28/10/2026 o app Android é um **build com WebView local** (Capacitor), com o jogo dentro do APK. Ele não depende do Chrome nem dos serviços do Google, então o mesmo APK serve às lojas abaixo. Antes de cada envio, vale testar num aparelho da loja: o WebView do Fire OS e de alguns Huawei é mais antigo.

| # | Plataforma | Como | Esforço | Alcance | Observações |
|---|---|---|---|---|---|
| 21 | **Samsung Galaxy Store** | O mesmo APK/AAB do Google Play | B | Forte no Brasil e na América Latina | Conta gratuita na Samsung Seller Portal. |
| 22 | **Amazon Appstore — tablets Fire (incluindo Fire Kids)** | O mesmo APK (WebView local) | B | Fire Kids é muito usado nos EUA e no Reino Unido | Desde 20/08/2025 a Amazon Appstore só existe em aparelhos Fire (Fire Tablet e Fire TV); saiu dos Android comuns. |
| 23 | **Huawei AppGallery** | O mesmo APK (sem serviços do Google) | B | Pequeno nos mercados-alvo | HarmonyOS NEXT não roda APK; vale só para aparelhos com HMS e Android. |
| 24 | **Xiaomi GetApps, Uptodown, Aptoide** | O mesmo APK | B | Xiaomi tem fatia relevante na América Latina; a Uptodown é espanhola | Lojas alternativas aceitam o mesmo APK. |
| 25 | **ChromeOS (Chromebooks escolares)** | Já atendido pelo Play, pela PWA e pela extensão; falta **instalação forçada pelo Google Admin** | B | Escolas públicas do Brasil, da América Latina e dos EUA | Documentar o ID da extensão e a URL da PWA para os administradores do Google Workspace for Education. |
| 26 | **F-Droid** | — | — | — | **Não se aplica**: exige licença livre e o Conta Comigo é proprietário (`LICENSE`). |

### 7.6 TV, consoles e outros dispositivos

| # | Plataforma | Como | Esforço | Observações |
|---|---|---|---|---|
| 27 | **Android TV / Google TV** | Build Android com intenção `LEANBACK_LAUNCHER`, banner 320×180 e navegação pelo controle (o jogo já é jogável por teclado) | M | Família toda na sala; forte no Brasil. |
| 28 | **Samsung Smart TV (Tizen) e LG (webOS)** | Empacotar o mesmo HTML como web app (`.wgt` e `.ipk`) | M | As duas TVs rodam apps web; precisa de navegação pelo controle remoto e de aprovação em cada loja (Samsung Seller Office, LG Seller Lounge). |
| 29 | **Meta Quest** | O APK como app 2D (com os ajustes de manifesto que a Meta pede) ou a PWA no navegador do Quest | B | Público pequeno e a idade mínima do Quest é 10 anos: **baixa prioridade**. |
| 30 | **KaiOS (celulares de teclado)** | Web app empacotado | M | Relevante em Angola e Moçambique; navegação por teclado numérico. Verificar a situação atual da KaiStore. |

**Fora de alcance sem reescrita:**
- Apple TV (tvOS não tem WebView).
- Roku.
- Nintendo Switch e PlayStation, que exigem SDK nativo e licenciamento.
- Xbox, que exige o programa ID@Xbox e adaptação ao controle. Vale avaliar só depois do item 27.

### 7.7 Canais de distribuição (não são plataformas, mas trazem usuários)

| Canal | Como | Observação |
|---|---|---|
| **itch.io** | Versão HTML5 jogável no navegador + downloads Windows, Mac e Linux | Grátis; comunidade de jogos educativos. |
| **Steam** | Electron (Windows, Mac, Linux, Steam Deck) | US$ 100 por app; público infantil pequeno: **baixa prioridade**. |
| **Portais de jogos web (Poki, CrazyGames)** | — | **Não recomendados**: vivem de anúncios, o que contraria a proposta "sem anúncios". |
| **Repositórios públicos de recursos educativos** | Cadastro do link da versão web e dos apps | Brasil: Plataforma MEC RED. Portugal: Recursos Educativos Digitais (DGE). Espanha: Procomún (INTEF). Argentina: Educ.ar. Uruguai: Ceibal. Chile: Aprendo en Línea. Colômbia: Colombia Aprende. Peru: PerúEduca. **Verificar as regras de envio de cada um.** |
| **Avaliações independentes** | Common Sense Media / Common Sense Education (EUA), selo *Teacher Approved* do Google Play | Dão destaque na Play Store e confiança a pais e professores. |
| **Site próprio com domínio** | Domínio da Klivfy apontando para o Pages | Dá URL estável para a política, as lojas e a verificação do Flathub. |

## 8. Ordem sugerida

| Fase | O que | Depende de |
|---|---|---|
| **0 — destravar (dias)** | Ligar o GitHub Pages (política de privacidade e PWA); criar a chave Android e o app novo no Play Console; identidade da Partner Center; enviar Chrome, Edge e Firefox 2.6.4 | Você |
| **1 — conteúdo (1 a 2 semanas)** | L1 (moeda por região) e L3 (voz es-419); baú com figurinha em ordem (ECA Digital); nome traduzido no Windows (L5) | Código |
| **2 — mais lojas com o mesmo código (1 a 2 semanas)** | Opera (1), Windows ARM64 (11), winget (12), AppImage, Flathub e Snap (16–18), Galaxy Store (21), guias para Google Admin, Intune e Apple School Manager (25, 13, 10) | Fase 0 |
| **3 — Apple (2 a 3 semanas)** | App Store iPhone e iPad (5) + Mac (6) + Safari (2) | Conta Apple |
| **4 — novos aparelhos (3 a 6 semanas)** | O APK do Capacitor em Fire (22), Huawei (23), Xiaomi e Uptodown (24); Android TV (27); Tizen e webOS (28) | Fase 2 |
| **5 — novos idiomas regionais** | pt-PT (L2), en-GB e es-ES separados nas listagens (L6) | Fase 1 |

## 9. O que só a Klivfy pode decidir ou fazer

1. Ligar o **GitHub Pages** e, se quiser, apontar um **domínio próprio**. O domínio `klivfy.com` precisa ser da Klivfy para o ID do Flathub.
2. Criar o **app novo no Play Console** com `com.klivfy.conta.comigo.matematica`. O app antigo, preso a `com.conta.comigo.matematica.klivfy.com`, fica sem uso.
3. Contas: Apple (US$ 99/ano), Samsung Seller Portal, Amazon Developer, Opera, Snapcraft, Flathub (via GitHub).
4. Escolher a faixa etária da Apple Kids: "5 anos ou menos" ou "6–8".
5. Validar com advogado o baú de recompensas diante do ECA Digital (art. 20) e decidir se ele passa a dar figurinhas em ordem.
6. Definir como o modo Dinheiro escolhe a moeda: pela região ou com uma moeda genérica.

## Fontes consultadas

- Amazon Appstore fora dos Android comuns em 20/08/2025: [Amazon Developer Blog](https://developer.amazon.com/apps-and-games/blogs/2025/02/upcoming-changes-to-amazon-appstore-for-android-devices-and-coins-program), [Android Authority](https://www.androidauthority.com/amazon-shuts-down-android-app-store-3528170).
- ID e verificação de domínio no Flathub: [Flathub — verificação](https://docs.flathub.org/docs/for-app-authors/verification), [convenções do Flatpak](https://docs.flatpak.org/de/latest/conventions.html).
- Conversão de extensão para o Safari: [Apple — Packaging a web extension for Safari](https://developer.apple.com/documentation/safariservices/packaging-a-web-extension-for-safari.md), [WWDC21 — Safari Web Extensions no iOS](https://developer.apple.com/wwdc21/10104/).
- Apps web em TVs Samsung e LG: [Samsung Tizen — web apps](https://samsungtizenos.com/knowledge-hub/developing-submitting-web-applications-tizen-tv-7494), [Nagra — Tizen e webOS](https://docs.nagra.vision/connect-player-sdk-5-for-browsers/5.20.x/Default/tizen-and-webos-smart-tv-apps).
- ECA Digital e caixas de recompensa: [Demarest](https://www.demarest.com.br/protecao-de-criancas-e-adolescentes-no-ambiente-digital/), [Poder360](https://www.poder360.com.br/poder-governo/eca-digital-entra-em-vigor-nesta-3a-feira-entenda-o-que-muda/), [Nota Técnica MJSP](https://www.gov.br/mj/pt-br/assuntos/noticias-1/mjsp-pede-a-anpd-que-monitore-jogos-eletronicos-com-caixas-de-recompensa-que-nao-implementaram-verificacao-de-idade/NotaTcnican55.pdf).

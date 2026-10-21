# -*- coding: utf-8 -*-
"""Conteúdo do Estudo de Viabilidade — Versões Nativas (parte A, capítulos 1-5).
Série de estudos Conta Comigo — Klivfy Tecnologia."""

DOC_TITLE = "Estudo de Viabilidade — Versões Nativas Android e Windows"
FOOTER_META = "Klivfy Tecnologia · Conta Comigo · Estudo de Viabilidade — Nativas Android e Windows · v2.6.0"

SECTIONS_A = [
    ("h1", "1. Sumário Executivo"),
    ("p", "Este estudo avalia a viabilidade técnica e operacional de produzir duas versões nativas do jogo Conta Comigo: uma para <b>Android</b> (pacote APK/AAB, apto ao Google Play e à distribuição direta) e uma para <b>Windows 10/11</b> (executável e/ou pacote MSIX, apto à Microsoft Store e à distribuição direta). A conclusão central é positiva: <b>ambas as versões são viáveis sem reescrever nenhuma linha do jogo</b>. Como todo o gameplay já roda em JavaScript puro, sem dependências externas e com persistência local, as rotas recomendadas consistem em embrulhar a aplicação existente em camadas nativas maduras, mantendo o motor do jogo intacto como base única de código."),
    ("p", "Para Android, a rota recomendada é a <b>TWA (Trusted Web Activity)</b> gerada pelo Bubblewrap, ferramenta oficial do Google, sobre a PWA já existente hospedada publicamente. Essa rota preserva integralmente a síntese de voz — descoberta crítica desta pesquisa: a API de voz <b>não funciona no WebView Android</b> (defeito confirmado no rastreador do Chromium), o que tornaria a rota Capacitor dependente de um plugin de TTS nativo. Para Windows, a rota recomendada é o <b>Electron</b> empacotado automaticamente pelo GitHub Actions, que produz um executável autossuficiente com o Chromium embutido e voz funcionando pelas vozes do sistema."),
    ("p", "A verificação da aplicação nesta rodada confirmou a integridade da v2.6.0: jogo funcional nas extensões e na PWA, selo de versão visível, portão dos responsáveis operante, feedback falado com o nome do perfil e nenhum erro de JavaScript. O custo inicial do plano é baixo — hospedagem gratuita no GitHub Pages, compilação gratuita no GitHub Actions e, quando chegar a hora das lojas, uma única taxa de US$ 25 do Google Play (a conta individual da Microsoft Store deixou de cobrar taxa no fluxo atual). As próximas ações concretas estão detalhadas no roadmap de quatro fases do capítulo 9."),
    ("callout", "100% do jogo aproveitado — nenhuma reescrita do gameplay é necessária"),
    ("callout", "Android: VIÁVEL pela rota TWA · Windows 10/11: VIÁVEL pela rota Electron"),

    ("h1", "2. Verificação Atual da Aplicação (v2.6.0)"),
    ("p", "Antes de planejar as versões nativas, a aplicação foi verificada de ponta a ponta nesta rodada, no estado atual do repositório (v2.6.0). O teste foi executado em navegador real sobre os arquivos da extensão Chrome e da PWA Android, cobrindo tanto a abertura e o fluxo de primeira execução quanto uma rodada completa de jogo. Os resultados confirmam que a base sobre a qual as camadas nativas serão construídas está sólida, estável e sem regressões."),
    ("p", "O comportamento observado foi o esperado em todos os pontos testados. O jogo abre corretamente até por caminho local de arquivos (o mecanismo de fallback para localStorage funciona), o selo de versão v2.6.0 aparece no topo em todas as telas, o fluxo de onboarding exibe o portão dos responsáveis com criação de senha adiável, e uma rodada do modo Contar respondeu com correção gentil falada, chamando a criança pelo nome do perfil — exatamente o comportamento definido nas versões 2.4.0 e 2.4.1. Em viewport móvel de 360 pixels não houve transbordo da barra superior, confirmando o trabalho de responsividade da v2.6.0. A API de síntese de voz está presente no ambiente de teste (sem vozes instaladas, o que é normal em navegador sem interface gráfica), e nenhum erro de JavaScript foi registrado durante toda a sessão."),
    ("table", {
        "header": ["Verificação executada", "Resultado"],
        "widths": [0.62, 0.38],
        "rows": [
            ["Abertura do jogo (extensão, caminho file:// e PWA)", "OK — carrega e persiste estado"],
            ["Selo de versão no topo (v2.6.0)", "OK — visível em todas as telas"],
            ["Onboarding: portão dos responsáveis", "OK — criação/adiamento de senha"],
            ["Rodada completa de Contar com feedback falado", "OK — elogio com nome do perfil"],
            ["Viewport 360 px (celular pequeno)", "OK — sem transbordo"],
            ["API speechSynthesis presente", "OK — 0 vozes no ambiente de teste (esperado)"],
            ["Erros de JavaScript na sessão", "Nenhum"],
        ],
        "caption": "Tabela 1 — Verificação da aplicação realizada nesta rodada (v2.6.0).",
    }),
    ("p", "Do ponto de vista de portabilidade, a arquitetura atual é uma aliada rara: JavaScript vanilla sem etapa de build, zero dependências de bibliotecas, caminhos relativos entre arquivos, e uma camada de persistência que já abstrai a diferença entre chrome.storage e localStorage. Em outras palavras, o jogo não sabe — e não precisa saber — se roda dentro de uma extensão, de um navegador, de um WebView ou de um executável. A única área que exige atenção especial nas camadas nativas é a síntese de voz, tratada em profundidade no próximo capítulo."),

    ("h1", "3. O Fator Crítico: Síntese de Voz por Camada"),
    ("p", "O Conta Comigo é dirigido a crianças a partir de 4 anos — majoritariamente pré-leitoras. Para esse público, a narração falada não é um enfeite: é a interface principal, responsável por instruções, correções e celebrações. Qualquer rota nativa que quebre a síntese de voz quebra o jogo. Por isso, o primeiro critério de seleção de tecnologia não é tamanho de pacote nem modismo técnico, e sim: <b>onde a voz funciona?</b>"),
    ("p", "A pesquisa desta rodada confirmou um fato técnico decisivo e ainda pouco conhecido: a API Web Speech (speechSynthesis) <b>não está disponível no WebView do Android</b>. O defeito está registrado no rastreado oficial do Chromium (issue 40417848) e afeta diretamente qualquer embrulho baseado em WebView — caso do Capacitor, do Cordova e de genéricos de conversão de site em app. Felizmente, as rotas que preservam a voz existem e são justamente as mais leves: a TWA executa a PWA dentro do Chrome completo (o mesmo motor do navegador, com as vozes do Google TTS), e o Electron embute um Chromium completo no Windows, expondo as vozes de síntese do sistema (família Microsoft/SAPI, com vozes em português como a Maria). A Tauri 2, que usa o WebView2 do Windows, opera em terreno intermediário e precisa de validação prática em prova de conceito."),
    ("table", {
        "header": ["Camada de execução", "Motor", "speechSynthesis", "Vozes PT-BR típicas", "Impacto no jogo"],
        "widths": [0.22, 0.15, 0.15, 0.25, 0.23],
        "rows": [
            ["Chrome/Edge desktop (extensão e PWA)", "Chromium", "Sim", "Edge Natural (rede), Google, Microsoft", "Voz plena"],
            ["Firefox (extensão)", "Gecko", "Sim (menos vozes)", "Vozes do sistema", "Voz reduzida"],
            ["PWA no Chrome Android", "Chromium", "Sim", "Google TTS PT-BR", "Voz plena"],
            ["TWA (Bubblewrap)", "Chrome completo", "Sim", "Google TTS PT-BR", "Voz plena"],
            ["Capacitor (WebView do sistema)", "WebView Chromium", "Não (issue 40417848)", "não se aplica", "Quebra sem plugin de TTS"],
            ["Electron", "Chromium embutido", "Sim", "Microsoft/SAPI (ex.: Maria)", "Voz plena"],
            ["Tauri 2 (WebView2)", "Edge WebView2", "A validar", "não se aplica", "Risco a validar em PoC"],
        ],
        "caption": "Tabela 2 — Disponibilidade da síntese de voz por camada de execução (pesquisa desta rodada).",
    }),
    ("p", "A implicação prática é direta: se um dia optarmos por Capacitor (por exemplo, para integrar recursos nativos profundos), o módulo de voz do engine.js precisará de um segundo back-end via plugin nativo de TTS — um trabalho de adaptação de dias, não de semanas, porque a v2.4.0 já concentrou a fala em um único ponto de decisão com preferências por perfil. Mas, com as rotas TWA e Electron, essa adaptação se torna desnecessária na primeira fase, e a criança ouve exatamente a mesma voz que já conhece."),

    ("h1", "4. Android — Análise de Rotas Nativas"),
    ("p", "Foram avaliadas quatro rotas para produzir uma aplicação Android nativa ou nativamente distribuída: TWA via Bubblewrap, Capacitor com plugin de TTS, reescrita nativa em Kotlin e reescrita em Flutter/React Native. O critério de desempate, como explicado, é a preservação da voz; seguem-se esforço, tamanho de pacote, pré-requisitos e adequação ao programa infantil do Google Play."),
    ("h2", "4.1 TWA (Trusted Web Activity) via Bubblewrap — rota recomendada"),
    ("p", "A TWA é o mecanismo oficial do Google para publicar uma PWA na Play Store como aplicação nativa. O Bubblewrap gera um pequeno projeto Android que abre o jogo em tela cheia dentro do próprio Chrome do aparelho — sem barra de navegador e sem WebView. Como o motor é o Chrome completo, <b>toda a camada de voz funciona sem alterações</b>, inclusive o detector de vozes naturais da v2.6.0. O pacote resultante é minúsculo (2 a 4 MB, pois não carrega motor algum) e a experiência é indistinguível de um app nativo para a criança e a família."),
    ("p", "Os pré-requisitos são documentais, não técnicos: a PWA precisa estar publicada em HTTPS (o <b>GitHub Pages</b> resolve de graça, no endereço klivfy.github.io/Conta-Comigo — o repositório já existe), com manifesto, service worker e ícones válidos — todos já prontos na v2.6.0 — e um arquivo de verificação assetlinks.json publicado no domínio para eliminar a barra de URL. A compilação do APK/AAB pode rodar inteiramente no <b>GitHub Actions</b>, que já oferece o JDK necessário nos executores Ubuntu, dispensando qualquer instalação local. A limitação honesta da rota: como o app depende do Chrome do aparelho, a primeira abertura requer conexão para o Chrome validar a associação; depois, o service worker garante o jogo offline já existente."),
    ("h2", "4.2 Capacitor com plugin nativo de TTS — alternativa autossuficiente"),
    ("p", "O Capacitor gera um projeto Android real com o jogo embutido e um WebView do sistema como tela. Sua vantagem é ser autossuficiente: um único APK carrega tudo, sem depender de hospedagem nem do Chrome do aparelho, e abre caminho para recursos nativos profundos (notificações locais dos baús de ofensiva, por exemplo). Sua desvantagem é exatamente o fator crítico do capítulo 3: o WebView não expõe speechSynthesis, exigindo a integração do plugin comunitário de Text-to-Speech e uma pequena adaptação do módulo de voz do engine.js para escolher o back-end conforme o ambiente. O esforço estimado sobe para 8 a 12 dias e o pacote, para 8 a 15 MB. É uma rota perfeitamente viável — apenas mais cara em trabalho, e por isso posicionada como evolução, não como primeiro passo."),
    ("h2", "4.3 e 4.4 Reescrita nativa (Kotlin/Compose e Flutter) — não recomendadas"),
    ("p", "Reescrever o jogo em Kotlin/Compose ou Flutter significaria reimplementar, em outra linguagem, todo o motor pedagógico construído e validado em nove versões: geração de questões por nível, modos de jogo, duelos, figurinhas, conquistas, loja, temas, mascotes, portão dos responsáveis e a camada de voz. O esforço estimado é de 40 a 80 dias, com risco alto de regressões e de divergência entre versões. Nenhuma funcionalidade exigida pelo pedido — estar na Play Store e rodar como app Android — depende dessa reescrita. As rotas de embrulho entregam o mesmo resultado com o jogo intacto."),
    ("table", {
        "header": ["Critério", "TWA (Bubblewrap)", "Capacitor + TTS", "Nativo Kotlin"],
        "widths": [0.28, 0.26, 0.25, 0.21],
        "rows": [
            ["Esforço estimado", "3-5 dias", "8-12 dias", "40-80 dias"],
            ["Tamanho do pacote", "2-4 MB", "8-15 MB", "15-40 MB"],
            ["Voz (speechSynthesis)", "Preservada (Chrome)", "Requer plugin nativo", "Nativa (TextToSpeech)"],
            ["Pré-requisitos", "PWA hospedada + assetlinks", "Adaptar camada de voz", "Reescrita total"],
            ["Play Store", "Pronto (Play App Signing)", "Pronto", "Pronto"],
            ["Reescrita do jogo", "Nenhuma", "Só a camada de voz", "Total"],
            ["Risco", "Baixo", "Médio", "Alto"],
        ],
        "caption": "Tabela 3 — Matriz comparativa das rotas Android.",
    }),

    ("h1", "5. Windows 10/11 — Análise de Rotas Nativas"),
    ("p", "No Windows, o leque é diferente: não há dependência de loja de aplicativos para distribuir um executável, mas há exigências próprias — compatibilidade com Windows 10 e 11, funcionamento offline, e a barreira prática do aviso do SmartScreen para binários não assinados. Foram avaliadas quatro rotas: Electron, Tauri 2 com WebView2, PWA publicada na Microsoft Store e reescrita nativa em WinUI."),
    ("h2", "5.1 Electron — rota recomendada"),
    ("p", "O Electron embute um Chromium completo num executável Windows autossuficiente: a janela do jogo abre exatamente como no navegador, com speechSynthesis funcionando pelas vozes de síntese do Windows (família SAPI, com vozes em português instaladas por padrão no Windows 10/11). O empacotamento é o grande trunfo operacional: ferramentas consolidadas (electron-builder, electron-packager) <b>não exigem compilação nativa</b> para produzir o pacote win32, o que permite compilar no GitHub Actions a partir de um executor Linux e baixar o ZIP pronto — o mesmo padrão de CI já recomendado para o Android. O contraponto é o tamanho: 90 a 150 MB, pois cada aplicação carrega o motor. Para um jogo educativo instalado uma única vez em computadores de família, esse custo é amplamente aceitável; a otimização de tamanho pode vir depois com a Tauri."),
    ("h2", "5.2 Tauri 2 com WebView2 — otimização futura"),
    ("p", "A Tauri 2 produz binários minúsculos (5 a 10 MB) reaproveitando o WebView2, runtime do Edge já presente no Windows 10/11 atualizado. O jogo em si não muda nada. Porém, a rota exige toolchain Rust no ambiente de compilação e, sobretudo, exige validar na prática a lista de vozes exposta pelo WebView2 ao speechSynthesis — relatos da comunidade variam entre versões do runtime, e a voz é inegociável neste projeto. Por isso, a recomendação é tratá-la como otimização de segunda geração: primeiro entregar com Electron (risco baixo, voz garantida), depois, validada a Tauri em prova de conceito, migrar o embrulho se o tamanho importar."),
    ("h2", "5.3 PWA publicada na Microsoft Store — complemento de baixo custo"),
    ("p", "A Microsoft aceita publicar PWAs diretamente na loja, por URL ou convertidas em MSIX pelo PWABuilder, sem mudança de código — e o fluxo atual de 2026 <b>dispensou a taxa de registro para desenvolvedores individuais</b> (contas de organização pagam US$ 19 uma única vez). Como essa rota depende da mesma hospedagem HTTPS exigida pela TWA Android, ela sai praticamente de graça depois da Fase 1 do roadmap. É um complemento de alcance, não a rota principal: cobre quem já usa a Store, mas não substitui o executável direto para famílias que baixam fora de loja."),
    ("h2", "5.4 Reescrita nativa em WinUI 3 — não recomendada"),
    ("p", "Pelos mesmos argumentos do capítulo 4.3: meses de trabalho para replicar o que já existe, sem ganho funcional para o usuário final. Descartada."),
    ("table", {
        "header": ["Critério", "Electron", "Tauri 2 (WebView2)", "PWA na Store", "Nativo WinUI"],
        "widths": [0.24, 0.20, 0.20, 0.20, 0.16],
        "rows": [
            ["Esforço", "4-6 dias", "6-8 dias", "2-3 dias (após hospedagem)", "40-80 dias"],
            ["Tamanho", "90-150 MB", "5-10 MB", "Instalação via Store", "20-60 MB"],
            ["Voz", "Sim (Chromium + SAPI)", "A validar em PoC", "Sim (WebView2/Edge)", "Nativa"],
            ["Pré-requisitos", "CI com Node", "Toolchain Rust", "Hospedagem + conta Store", "Reescrita total"],
            ["Windows 10 e 11", "Sim", "Sim", "Sim", "Sim"],
            ["Reescrita do jogo", "Nenhuma", "Nenhuma", "Nenhuma", "Total"],
            ["Risco", "Baixo", "Médio", "Baixo-médio", "Alto"],
        ],
        "caption": "Tabela 4 — Matriz comparativa das rotas Windows 10/11.",
    }),
]

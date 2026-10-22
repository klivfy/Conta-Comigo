# -*- coding: utf-8 -*-
"""Conteúdo do Estudo de Viabilidade II — Instalação Nativa Android, iOS e Windows
(parte A, capítulos 1-6). Série de estudos Conta Comigo — Klivfy Tecnologia."""

DOC_TITLE = "Estudo de Viabilidade II — Instalação Nativa Android, iOS e Windows"
FOOTER_META = "Klivfy Tecnologia · Conta Comigo · Estudo de Viabilidade II — Nativa Android, iOS e Windows · v2.6.0"

SECTIONS_A = [
    ("h1", "1. Sumário Executivo"),
    ("p", "A nova demanda da Klivfy Tecnologia amplia o alcance do pedido anterior: em vez de apenas Android e Windows, o Conta Comigo deve poder ser <b>instalado como aplicativo nativo nos três grandes sistemas operacionais</b> — Android, iOS e Windows 10/11 — a partir de um caminho distinto da distribuição web atual. Este estudo II avalia a viabilidade técnica dessa extensão e conclui, com margem confortável, que ela é <b>viável para os três sistemas sem reescrever o jogo</b>. O motor pedagógico validado até a v2.6.0 continua sendo a única base de código; as plataformas nativas passam a ser cascos de instalação e distribuição em volta dele."),
    ("p", "A peça genuinamente nova é o <b>iOS</b>, que não tinha sido coberto pelo estudo anterior e é o caso mais restritivo dos três: não existe TWA no ecossistema Apple, não existe sideload oficial e o único canal de distribuição em escala é a App Store, exigindo conta do Apple Developer Program (US$ 99 por ano) e aprovação da revisão da Apple. A rota recomendada para o iOS é o <b>Capacitor</b>, que gera um projeto iOS real (Swift/Xcode) executando o jogo em WKWebView, com duas adaptações pequenas e já mapeadas no motor: um segundo back-end de voz (plugin nativo de síntese, pois a voz web no iOS tem particularidades documentadas no capítulo 4) e um adaptador de armazenamento persistente (a API Preferences, pois o localStorage em WKWebView pode ser recolhido pelo sistema)."),
    ("p", "Android e Windows não exigem trabalho novo imediato: a TWA e o Electron já foram implementados na Fase 1 e compilam no GitHub Actions. O estudo analisa, contudo, a alternativa de <b>unificar o celular em um único Capacitor</b> (Android e iOS) e recomenda <b>manter a pilha dupla</b> — TWA no Android, Capacitor só no iOS — porque a TWA preserva a voz plena do Chrome, pesa 2 a 4 MB e permite atualizar o jogo sem reenviar pacote à loja, enquanto a rota Capacitor Android obrigaria plugin de TTS, pacote maior e nova revisão a cada atualização. O custo adicional do plano de três lojas é concentrado numa única despesa nova: a taxa anual da Apple; o restante permanece próximo de zero."),
    ("callout", "100% do jogo aproveitado — a expansão para iOS não reescreve nenhuma linha do gameplay"),
    ("callout", "Android: VIÁVEL (TWA em produção) · iOS: VIÁVEL (Capacitor + adaptações mapeadas) · Windows: VIÁVEL (Electron em produção)"),

    ("h1", "2. O Que \"Instalação Nativa\" Significa nos Três Sistemas"),
    ("p", "Antes de comparar rotas, é preciso fixar o que cada sistema entende por instalação de aplicativo, porque os três ecossistemas impõem regras muito diferentes. No <b>Android</b>, um aplicativo é um pacote APK/AAB instalado pela Play Store ou diretamente pelo arquivo (sideload, permitido de fábrica com confirmação do usuário). No <b>Windows 10/11</b>, a instalação nativa é um executável com instalador (NSIS/MSIX), distribuído pela Microsoft Store ou pelo download direto — sem qualquer gate corporativo. Já no <b>iOS</b>, a regra é única e rígida: o iPhone só executa aplicativos assinados pela Apple, distribuídos pela App Store (ou TestFlight, para testes), e não há sideload oficial — em nenhuma versão atual, incluindo o iOS 26."),
    ("p", "Essa assimetria define a arquitetura da resposta. Para Android e Windows, o caminho distinto que o pedido descreve — \"instalação nativa\" — já está materializado pela Fase 1: a TWA é um pacote Android de verdade publicado na Play, e o Electron é um executável Windows de verdade. Para o iOS, \"instalação nativa\" significa, obrigatoriamente, <b>passar pela App Store</b> com um projeto Xcode assinado — daí a escolha do Capacitor, que gera exatamente esse projeto a partir da mesma base web. Existe ainda no iOS a pseudo-instalação por \"web app da Tela de Início\" (ícone na tela inicial que abre o jogo em tela cheia, padrão desde o iOS 26), útil como atalho provisório e sem custo, mas que não é um aplicativo da App Store e herda as limitações do Safari — ela é analisada como rota complementar no capítulo 6."),
    ("table", {
        "header": ["Aspecto", "Android", "iOS", "Windows 10/11"],
        "widths": [0.22, 0.26, 0.26, 0.26],
        "rows": [
            ["Formato do pacote", "APK / AAB", "IPA (Xcode, assinado)", "EXE (NSIS) / MSIX"],
            ["Canal oficial", "Play Store", "App Store (única em escala)", "Microsoft Store + download direto"],
            ["Sideload oficial", "Sim (com confirmação)", "Não (TestFlight para testes)", "Sim (download direto)"],
            ["Wrapper web oficial", "TWA (Chrome completo)", "Não existe equivalente", "WebView2 / Electron"],
            ["Taxa de desenvolvedor", "US$ 25 (única)", "US$ 99 / ano", "R$ 0 (individual, fluxo 2026)"],
            ["Status no projeto", "TWA implementada (Fase 1)", "A criar — rota Capacitor", "Electron implementado (Fase 1)"],
        ],
        "caption": "Tabela 1 — O que significa instalar um aplicativo em cada sistema (estado atual, 2026).",
    }),

    ("h1", "3. iOS — O Território Novo"),
    ("h2", "3.1 App Store, Kids Category e TestFlight"),
    ("p", "Publicar no iOS significa subir um IPA para a App Review dentro de um programa pago: o <b>Apple Developer Program custa US$ 99 por ano</b>, com renovação anual, e inclui TestFlight (distribuição beta para até 10 mil testadores), App Store Connect e os certificados de assinatura. É a única despesa recorrente introduzida por esta expansão — o Google Play cobra US$ 25 uma única vez, e a Microsoft Store, no fluxo atual para desenvolvedores individuais, não cobra registro. Para um jogo infantil, a Apple oferece a <b>Kids Category</b> (faixas de 5 anos ou menos, 6-8 e 9-11 — o Conta Comigo se encaixa na primeira), cuja diretriz 1.3 proíbe links para fora do app, compras e distrações fora de um portão parental, além de <b>proibir analytics e publicidade de terceiros</b>."),
    ("p", "Esse conjunto de exigências, que derruba muitos aplicativos concorrentes, é exatamente o que o Conta Comigo já pratica por construção desde a origem: zero coleta, zero telemetria, zero anúncios, zero SDKs de terceiros, portão dos responsáveis implementado desde a v2.3 e política de privacidade publicada em URL própria. Em 2025 a Apple ainda reforçou o aparato de idade (API Declared Age Range, em que responsáveis compartilham faixas etárias em vez de datas de nascimento), reforçando justamente o modelo sem coleta que o jogo adota. A expectativa razoável, portanto, é de revisão tranquila — com o formulário de etiquetas de privacidade respondendo \"não coletamos dados\", a variante mais simples possível."),
    ("h2", "3.2 A diretriz 4.2 (funcionalidade mínima) e a defesa do jogo"),
    ("p", "O risco de revisão mais citado para aplicativos que embrulham conteúdo web é a diretriz <b>4.2 — Minimum Functionality</b>, usada pela Apple para rejeitar \"sites empacotados\" sem valor agregado de aplicativo. A defesa do Conta Comigo é estrutural, e não cosmética: o jogo <b>roda integralmente no aparelho</b>, com motor pedagógico próprio (geração de questões por nível, duelos, conquistas, loja, mascotes), persistência local no aparelho, funcionamento offline total e nenhuma página web espelhada — não há um \"site do jogo\" que o app apenas exiba. Além disso, a versão nativa iOS acrescentará capacidades genuínas de plataforma: síntese de voz pelo sintetizador nativo do sistema (AVSpeechSynthesizer), armazenamento persistente pela API nativa, ícone, splash e comportamento standalone."),
    ("p", "A literatura de rejeições da 4.2 concentra-se em apps que apenas carregam um endereço remoto em WebView. Aqui o binário carrega o jogo inteiro embutido (os assets vão dentro do IPA), o que o aproxima muito mais de um jogo offline tradicional do que de um wrapper. Como mitigação operacional, o plano usa o <b>TestFlight antes da submissão</b>: a mesma build é validada por famílias reais, e os metadados da loja descrevem o jogo como aplicativo educativo offline — nunca como \"versão web\". Caso a revisão peça ajustes, o ciclo TestFlight-correção é curto e não bloqueia as demais plataformas."),
    ("h2", "3.3 Web apps da Tela de Início — o atalho provisório"),
    ("p", "Desde o iOS 16.4 os web apps instalados ganharam notificações push, e o iOS 26 tornou o comportamento padrão: <b>todo site adicionado à Tela de Início abre como web app</b> em tela cheia, com ícone próprio. A Apple chegou a anunciar a remoção desse recurso na União Europeia sob a DMA (início de 2024) e <b>reverteu a decisão semanas depois</b>, mantendo o suporte. Para o Conta Comigo, esse atalho custa dois dias (a PWA do GitHub Pages já é instalável) e zero recorrente, mas fica fora da App Store, depende do Safari e herda as restrições de voz e armazenamento descritas no próximo capítulo — por isso é tratado como rota provisória de alcance, não como resposta ao pedido."),

    ("h1", "4. Fatores Críticos no iOS/WebKit — Voz e Armazenamento"),
    ("p", "Dois fatores técnicos concentram praticamente todo o risco da rota iOS, e ambos têm mitigação conhecida, barata e já planejada como código do motor. O princípio do estudo I continua valendo e se intensifica no iOS: para um público pré-leitor de 4 anos, a narração é a interface; e o progresso acumulado (36 figurinhas, 20 conquistas, perfis) não pode evaporar. O capítulo seguinte descreve cada fator, o comportamento real observado na plataforma e a adaptação correspondente no engine.js."),
    ("h2", "4.1 Voz: a API web funciona, mas o iOS tem particularidades"),
    ("p", "Ao contrário do WebView Android (onde a API não existe — achado crítico do estudo I), o <b>iOS expõe speechSynthesis no Safari e no WKWebView desde 2018</b>, e é plataforma de referência da API no MDN. Porém, a experiência documentada pela comunidade mostra particularidades que o motor precisa tratar: a primeira fala deve ocorrer após um gesto do usuário (padrão que o jogo já segue, pois toda narração responde a um toque); em versões do iOS a fila de fala <b>silencia chamadas se não houver cancel() prévio</b> — a receita comunitária é cancelar antes de cada speak(); a <b>lista de vozes varia entre versões</b> (o iOS 18 removeu vozes que o 18.2 restituiu; o iOS 17 falhou com certos textos); e as vozes naturais em português (família Luciana/Francisca) dependem de estarem instaladas no aparelho."),
    ("p", "A mitigação é estrutural e definitiva: a v2.4.0 já concentra toda a fala num único ponto de decisão, então o plano adiciona ao motor um <b>segundo back-end de voz</b> acionado quando o jogo roda dentro do Capacitor — o plugin nativo de síntese (família capacitor-speech-synthesis / Text-to-Speech), que usa o AVSpeechSynthesizer do iOS e o TextToSpeech do Android, com as vozes do sistema e comportamento estável entre versões. A detecção é automática em tempo de execução: no Chrome/Edge/Firefox/Electron usa a API web como hoje; no Capacitor, o plugin nativo; se o plugin faltar, cai na web com as proteções do parágrafo anterior. Esforço estimado: 2 a 3 dias de adaptação, cobertos pela Fase A."),
    ("h2", "4.2 Armazenamento: localStorage transiente em WKWebView"),
    ("p", "A documentação oficial do Capacitor é explícita: no iOS, o <b>localStorage e o IndexedDB de um WKWebView devem ser considerados transitórios</b>, porque o sistema pode recolher esse armazenamento quando o aparelho estiver com pouco espaço; no Android vale regra parecida para o WKWebView, embora a API de persistência do navegador permita marcar dados como persistentes. Para um jogo cujo progresso é o ativo mais valioso da família, isso não é aceitável como única camada."),
    ("p", "A mitigação é o <b>adaptador de armazenamento</b>: quando o jogo detecta o ambiente Capacitor, grava por meio da API <b>Preferences</b> (armazenamento nativo do app, fora do alcance da evicção de WebView), mantendo o localStorage como fallback nas demais plataformas — a arquitetura de persistência já é abstrata (chrome.storage no Chrome, localStorage na web), então o adaptador entra na mesma costura. Como cinta de segurança, o backup de um clique do painel dos responsáveis (v2.5) continua disponível para a família exportar o progresso a qualquer momento. Esforço estimado: 2 dias."),
    ("h2", "4.3 Ícone, splash, safe-area e apresentação"),
    ("p", "Os demais requisitos de apresentação do iOS são trabalho de configuração, não de pesquisa: o Capacitor gera os tamanhos de ícone e as telas de splash a partir dos assets existentes (a PWA já tem ícones 192/512 e maskable), e a v2.6.0 já trata áreas seguras (viewport-fit=cover, dvh e safe-area) e funciona em modo standalone — exatamente o modo em que o WKWebView do Capacitor executa o jogo. A orientação \"qualquer\" do manifesto é respeitada. Não há fator crítico conhecido nesta camada; a validação prática acontece na Fase B, em aparelho real."),
    ("table", {
        "header": ["Fator", "Comportamento no iOS", "Mitigação no motor", "Esforço"],
        "widths": [0.20, 0.34, 0.32, 0.14],
        "rows": [
            ["Voz (speechSynthesis)", "Disponível desde 2018, com particularidades: fila silencia sem cancel(); vozes variam por versão (17/18); gesto obrigatório", "cancel() antes de speak(); 2º back-end nativo (AVSpeechSynthesizer) via plugin, com detecção automática", "2-3 dias"],
            ["Armazenamento", "localStorage/IndexedDB de WKWebView são transitórios (evicção sob pressão de espaço)", "Adaptador para Preferences API (nativo, sem evicção); backup 1-clique como cinta", "2 dias"],
            ["Apresentação", "Ícone, splash e standalone exigem projeto Xcode", "Capacitor gera a partir dos assets existentes; safe-area já tratada na v2.6.0", "Configuração"],
            ["Assinatura/distribuição", "Só Apple assina; App Store/TestFlight; conta anual", "Apple Developer Program US$ 99/ano; secrets no CI; TestFlight para beta", "Administrativo"],
        ],
        "caption": "Tabela 2 — Fatores críticos do iOS/WebKit e mitigações correspondentes.",
    }),

    ("h1", "5. Android e Windows — Reaproveitar o Que Já Existe"),
    ("p", "A Fase 1, executada nesta mesma série de entregas, deixou Android e Windows cobertos: a <b>TWA compila no GitHub Actions e gera APK/AAB assinados</b> com verificação automática do assetlinks.json, e o <b>Electron gera instalador NSIS e versão portable</b> pelo mesmo pipeline. Nenhum dos dois precisa ser refeito para atender ao pedido de instalação nativa — eles já são pacotes nativos nos respectivos sistemas. A pergunta que resta é arquitetural: vale a pena <b>unificar o celular num único Capacitor</b> (um só projeto Android+iOS), abandonando a TWA, para reduzir a variedade de ferramentas? A resposta recomendada é não, por três razões objetivas."),
    ("p", "Primeiro, a <b>voz</b>: na TWA o jogo roda no Chrome completo, com o sintetizador do Google e as vozes que a família já conhece; no Capacitor Android, a API web não existe no WebView (issue 40417848 do Chromium) e a voz passaria a depender do plugin nativo — funcional, mas com outro sintetizador e outro comportamento. Segundo, a <b>atualização</b>: com a TWA, o jogo servido pelo GitHub Pages é atualizado num push; com o Capacitor os assets ficam embutidos no APK, exigindo novo pacote e nova revisão do Play a cada mudança — no iOS essa passagem pela revisão é inevitável (não há alternativa), no Android ela é evitável e vale evitá-la. Terceiro, o <b>peso e o esforço</b>: 2-4 MB e zero dias contra 8-15 MB e cerca de 12 dias. A TWA permanece como rota Android; o Capacitor entra apenas onde é necessário, no iOS."),
    ("table", {
        "header": ["Critério", "TWA (mantida) + Capacitor iOS", "Capacitor unificado (Android + iOS)"],
        "widths": [0.28, 0.36, 0.36],
        "rows": [
            ["Voz no Android", "Plena — Chrome completo (rota atual)", "Plugin nativo (outro sintetizador)"],
            ["Atualização do jogo no Android", "Push no Pages, sem nova revisão", "Novo APK/AAB + revisão do Play"],
            ["Ferramentas de mobile", "2 (Bubblewrap + Capacitor)", "1 (só Capacitor)"],
            ["Esforço incremental", "Zero dias no Android (feito)", "cerca de 12 dias"],
            ["Peso no Android", "2-4 MB", "8-15 MB"],
            ["Risco", "Baixo (rota validada)", "Médio (voz e revisão por update)"],
        ],
        "caption": "Tabela 3 — Pilha dupla (recomendada) versus unificação mobile em Capacitor.",
    }),

    ("h1", "6. Rotas iOS Comparadas"),
    ("p", "Quatro rotas foram avaliadas para o iOS, com o mesmo critério de desempate da série: preservar a voz e o progresso da criança, minimizar reescrita e encaixar no pipeline de CI já existente. A <b>rota recomendada é o Capacitor com o plugin nativo de TTS</b>: gera um projeto iOS real (o que a App Store exige), embute o jogo no IPA, e as duas adaptações do motor (voz e armazenamento) são pequenas e beneficiam todas as plataformas. O <b>web app da Tela de Início</b> entra como complemento de custo zero: em dois dias dá para instruir famílias iOS a instalar o atalho pela PWA publicada, útil enquanto a conta Apple e a revisão não acontecem — mas não atende ao pedido de instalação nativa, pois não é um app da loja e herda as restrições do Safari."),
    ("p", "As reescritas completas repetem o diagnóstico dos estudos anteriores e do capítulo 5: <b>Flutter</b> ou <b>React Native</b> exigiriam reimplementar o motor pedagógico inteiro (40 a 80 dias) para produzir o mesmo comportamento, com risco de divergência permanente entre versões; <b>Cordova</b>, embora tecnicamente capaz de gerar o projeto iOS, é geração legada com comunidade em declínio, sem vantagem sobre o Capacitor (que é, na prática, seu sucessor mantido pela mesma equipe do Ionic). Nenhuma funcionalidade pedida justifica qualquer uma dessas rotas."),
    ("table", {
        "header": ["Critério", "Capacitor + TTS", "PWA Tela de Início", "Flutter/React Native", "Cordova"],
        "widths": [0.24, 0.21, 0.20, 0.19, 0.16],
        "rows": [
            ["Esforço", "8-12 dias", "2 dias", "40-80 dias", "15-25 dias"],
            ["App Store", "Sim", "Não (fora da loja)", "Sim", "Sim"],
            ["Voz", "Nativa (AVSpeech) + fallback web", "Web com particularidades", "Nativa", "Plugin legado"],
            ["Progresso persistente", "Preferences nativo", "Sujeito a evicção", "Nativo", "Plugin"],
            ["Custo recorrente", "US$ 99/ano", "R$ 0", "US$ 99/ano", "US$ 99/ano"],
            ["Maturidade", "Alta (Ionic/Capacitor)", "Padrão Apple", "Alta", "Em declínio"],
            ["Veredito", "Recomendada", "Complemento provisório", "Descartada", "Descartada"],
        ],
        "caption": "Tabela 4 — Matriz comparativa das rotas iOS.",
    }),
]

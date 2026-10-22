# -*- coding: utf-8 -*-
"""Conteúdo do Estudo de Viabilidade II — Instalação Nativa Android, iOS e Windows
(parte B, capítulos 7-12)."""

SECTIONS_B = [
    ("h1", "7. Conformidade Infantil nas Três Lojas"),
    ("p", "A disciplina arquitetural do projeto — zero coleta, zero telemetria, zero anúncios, zero SDKs de terceiros, portão adulto no painel dos responsáveis e política de privacidade publicada — continua sendo a maior vantagem regulatória do plano, agora em três audits simultâneos. No <b>Google Play</b>, o programa Families e o formulário Data Safety recebem a resposta mais simples possível (nenhum dado coletado, nenhuma SDK). Na <b>App Store</b>, a Kids Category da diretriz 1.3 proíbe exatamente o que o jogo não tem: analytics e publicidade de terceiros, links para fora e compras fora de portão parental; as etiquetas de privacidade (Privacy Nutrition Labels) respondem \"dados não coletados\", e a Declared Age Range da Apple reforça o modelo sem coleta de dados de crianças. Na <b>Microsoft Store</b>, a certificação pede a mesma tríade: declaração de privacidade, público honesto e ausência de coleta invisível."),
    ("p", "Vale destacar o único detalhe operacional novo que a Kids Category exige e o jogo precisa demonstrar na revisão: <b>portão parental</b> em qualquer área que leve para fora da experiência infantil. O painel dos responsáveis já é protegido por verificação adulta desde a v2.3, e a versão iOS não terá links externos no fluxo da criança — a página de privacidade vive na web, acessada pelos responsáveis pelos metadados da loja, não por botão dentro da tela do jogo. O classificatório etário sai do questionário IARC (Play), do questionário da Apple (4+, com Kids Category 5 anos ou menos) e do questionário da Microsoft — todas as respostas derivam da mesma ficha pedagógica já escrita."),
    ("table", {
        "header": ["Requisito", "Google Play", "App Store (iOS)", "Microsoft Store"],
        "widths": [0.26, 0.25, 0.26, 0.23],
        "rows": [
            ["Conta de desenvolvedor", "US$ 25 (única)", "US$ 99 / ano", "R$ 0 individual; US$ 19 organização"],
            ["Programa infantil", "Families Policy", "Kids Category (diretriz 1.3)", "Certificação padrão"],
            ["Faixa etária declarada", "IARC: 3+/4+ (Livre)", "4+ (Kids: 5 anos ou menos)", "IARC: 3+/4+ (Livre)"],
            ["Analytics/anúncios de 3º", "Proibidos (Families)", "Proibidos (1.3)", "Restritos na certificação"],
            ["Formulário de dados", "Data Safety: nenhum", "Labels: não coletamos", "Declaração de privacidade"],
            ["Portão parental", "Painel protegido (v2.3)", "Exigido — já implementado", "Recomendado — já implementado"],
            ["Política de privacidade", "URL já publicada", "URL obrigatória (a mesma)", "URL obrigatória (a mesma)"],
        ],
        "caption": "Tabela 5 — Requisitos infantis das três lojas frente ao estado atual do jogo.",
    }),

    ("h1", "8. Custos, Contas e Cronograma"),
    ("p", "O custo do plano de três lojas permanece concentrado numa única despesa nova: a <b>taxa anual da Apple</b>. Todo o resto segue gratuito para repositório público — hospedagem no GitHub Pages, compilação no GitHub Actions (os executores macOS, necessários para produzir o IPA, são gratuitos em repositórios públicos), keystore Android já versionado e conta Microsoft sem taxa para desenvolvedores individuais. Somando as três lojas, o primeiro ano custa aproximadamente <b>US$ 124 (cerca de R$ 650)</b>: US$ 25 únicos do Play mais US$ 99 da Apple; do segundo ano em diante, apenas a renovação anual da Apple. A distribuição fora de loja — APK direto para famílias Android e instalador Windows — segue sem qualquer custo ou conta."),
    ("table", {
        "header": ["Item", "Custo", "Papel no plano"],
        "widths": [0.40, 0.24, 0.36],
        "rows": [
            ["GitHub Pages + Actions (repo público)", "R$ 0", "Hospedagem da PWA e compilação de todos os pacotes"],
            ["Executores macOS (build do IPA)", "R$ 0 em repo público", "Compila o projeto iOS no CI, sem Mac local"],
            ["Conta Google Play", "US$ 25 (única)", "Publicar a TWA na Play Store"],
            ["Apple Developer Program", "US$ 99 / ano", "TestFlight + App Store (única despesa nova e recorrente)"],
            ["Conta Microsoft Store (individual)", "R$ 0 no fluxo 2026", "Publicar o Electron na Store"],
            ["Certificado de código Windows (opcional)", "US$ 100-400 / ano", "Remove aviso do SmartScreen; Fase D+"],
            ["Total do 1º ano (3 lojas)", "cerca de US$ 124", "Somente Play + Apple; Microsoft não cobra"],
        ],
        "caption": "Tabela 6 — Custos e contas do plano de instalação nativa nos três sistemas.",
    }),
    ("p", "Em calendário, o plano cabe em cerca de <b>cinco a oito semanas de esforço total</b>, das quais apenas uma depende de trabalho no motor: uma semana para a Fase A (adaptações de voz e armazenamento), duas para a Fase B (scaffold iOS e CI, incluindo validação em aparelho por TestFlight se a conta já existir), e duas a quatro de calendário para a Fase C (conta Apple, preenchimento de App Store Connect e ciclo de revisão — o tempo da Apple, não o nosso). Android e Windows não consomem semanas novas neste plano: já estão em produção pela Fase 1 do estudo anterior."),

    ("h1", "9. Veredito e Esforço por Rota"),
    ("p", "A Figura 1 atualiza o mapa de esforço do estudo I com as rotas iOS. As barras escuras marcam o que <b>já está implementado</b> (TWA Android e Electron Windows) — a expansão pedida se resume à barra do Capacitor iOS e às adaptações do motor. As rotas de reescrita (Swift nativo, Flutter multiplataforma) permanecem ordens de magnitude mais caras sem qualquer ganho para o usuário final, e seguem descartadas."),
    ("chart", {
        "kind": "effort",
        "caption": "Figura 1 — Esforço estimado por rota, em dias de desenvolvimento (estimativas deste estudo II; barras escuras = já implementadas na Fase 1).",
    }),
    ("p", "O veredito consolidado: <b>Android VIÁVEL (TWA, em produção) · iOS VIÁVEL (Capacitor com voz e armazenamento nativos, adaptações de 4-5 dias) · Windows VIÁVEL (Electron, em produção)</b>. A recomendação operacional em uma frase: manter a TWA e o Electron como estão, preparar o motor com os dois adaptadores (Fase A), criar o projeto Capacitor iOS com CI macOS (Fase B) e abrir a conta Apple para TestFlight e App Store quando o iOS virar prioridade de publicação (Fase C)."),
    ("callout", "Plano em uma frase: TWA Android + Electron Windows mantidos + Capacitor iOS com voz e armazenamento nativos, tudo compilado no GitHub Actions"),

    ("h1", "10. Plano de Ação em Fases"),
    ("p", "O plano de ação está dividido em quatro fases com entregáveis verificáveis e dependências explícitas. A <b>Fase A é executável imediatamente</b>, neste ambiente e no repositório da Klivfy, sem conta nova e sem custo — ela deixa o motor pronto para qualquer casco nativo e já melhora a robustez da voz no iOS web (o cancel() preventivo). A Fase B também não exige dinheiro, apenas o scaffold e o CI; só a Fase C depende da decisão comercial de pagar a taxa anual da Apple. As fases podem ser pausadas entre si sem retrabalho."),
    ("table", {
        "header": ["Fase", "Escopo", "Entregáveis verificáveis", "Custo"],
        "widths": [0.20, 0.40, 0.26, 0.14],
        "rows": [
            ["Fase A — Motor bimodal (1 semana)", "Adaptador de voz (cancel() preventivo + back-end nativo via plugin quando em Capacitor) e adaptador de armazenamento (Preferences quando em Capacitor); regressão completa nas 5 plataformas atuais", "Engine v2.7.0 validado; QA em Chrome, Firefox, PWA, TWA e Electron", "R$ 0"],
            ["Fase B — Scaffold iOS + CI (2 semanas)", "Projeto Capacitor iOS no repositório (appId com.klivfy.contacomigo), ícone/splash, assets embutidos, workflow macOS no Actions gerando IPA (não assinado) como artefato", "IPA de teste na aba Actions; instruções de sideload via Xcode/TestFlight", "R$ 0"],
            ["Fase C — Conta Apple + lojas (2-4 semanas de calendário)", "Apple Developer Program; assinatura via secrets; TestFlight com famílias beta; App Store Connect (Kids 5-, labels, metadados); publicar também Play/Store se pendentes", "App aprovado na App Store; builds beta via TestFlight", "US$ 99/ano"],
            ["Fase D — Evolução (contínua)", "Notificações locais dos baús de ofensiva, atalhos e widgets opcionais; unificação Capacitor Android se algum dia valer a pena; domínio próprio", "Recursos nativos incrementais por release", "Opcional"],
        ],
        "caption": "Tabela 7 — Plano de ação em fases com entregáveis e custos.",
    }),

    ("h1", "11. Riscos e Mitigações"),
    ("p", "Nenhum risco identificado compromete a viabilidade; todos têm mitigação conhecida, e os dois de maior impacto (voz e armazenamento no iOS) são tratados estruturalmente na Fase A, antes mesmo do scaffold existir. O risco regulatório mais citado — a diretriz 4.2 da Apple — tem defesa forte porque o jogo roda localmente com motor próprio e ganha capacidades nativas reais no casco. Os riscos operacionais (ciclo de revisão, dependência de Mac, manutenção de mais um wrapper) são típicos de publicação e absorvidos pelo CI."),
    ("table", {
        "header": ["Risco", "Probabilidade", "Impacto", "Mitigação"],
        "widths": [0.32, 0.14, 0.12, 0.42],
        "rows": [
            ["Voz com particularidades no iOS (fila silenciosa, vozes variáveis entre versões)", "Média", "Alto", "Fase A: cancel() antes de cada speak() + segundo back-end nativo (AVSpeechSynthesizer) com detecção automática"],
            ["Evicção de localStorage no WKWebView", "Média", "Alto", "Fase A: adaptador Preferences (nativo, sem evicção); backup 1-clique do painel dos responsáveis como cinta"],
            ["Rejeição pela diretriz 4.2 (funcionalidade mínima)", "Baixa-média", "Alto", "Jogo roda local com motor próprio e assets embutidos; capacidades nativas reais; TestFlight antes da submissão"],
            ["Ciclo de revisão da Apple com rejeições iterativas", "Média", "Baixo", "Metadados completos, labels de privacidade simples (zero coleta); iteração por TestFlight; Play/Store não dependem disso"],
            ["Dependência de Mac para compilar/assinar iOS", "Certa (sem CI)", "Baixo", "Build no GitHub Actions com executor macOS (grátis em repo público); assinatura via secrets"],
            ["Manutenção de mais um wrapper nativo", "Média", "Baixo", "Fonte única do jogo; wrappers finos versionados e compilados no CI; TWA/Capacitor/Electron desacoplados"],
            ["Taxa anual da Apple em caso de pausa do projeto", "Certa", "Baixo", "iOS entra em produção só na Fase C; até lá, web app da Tela de Início mantém famílias iOS atendidas sem custo"],
        ],
        "caption": "Tabela 8 — Riscos identificados e mitigações (estudo II).",
    }),

    ("h1", "12. Conclusão"),
    ("p", "O pedido de instalação nativa nos três sistemas é <b>viável, de custo controlado e sem reescrita do jogo</b>. A assimetria entre os ecossistemas define o desenho: no Android e no Windows a instalação nativa já existe (TWA e Electron, produzidos pelo CI desde a Fase 1); no iOS, o único caminho em escala é a App Store, e o Capacitor o alcança com o motor intacto, ao preço de duas adaptações pequenas e bem delimitadas — a voz, que ganha um segundo back-end nativo, e o armazenamento, que ganha persistência real pela API Preferences. Ambas melhoram o motor em todas as plataformas, e nenhuma introduz dependência nova de runtime."),
    ("p", "A recomendação imediata é aprovar a execução da <b>Fase A</b>, que é gratuita, cabe em uma semana e deixa o motor v2.7.0 pronto para qualquer casco nativo — inclusive com a voz mais robusta no iOS web já hoje. Em seguida, a Fase B materializa o projeto iOS e o pipeline macOS, entregando um IPA de teste sem qualquer gasto; a Fase C fica condicionada à decisão comercial de contratar o Apple Developer Program (US$ 99/ano), com o atalho gratuito da Tela de Início cobrindo famílias iOS enquanto essa decisão amadurece. Ao fim da Fase C, o Conta Comigo estará instalável como aplicativo nativo nos três grandes sistemas, com a mesma base de código e o mesmo compromisso de privacidade que o caracteriza desde a origem."),
]

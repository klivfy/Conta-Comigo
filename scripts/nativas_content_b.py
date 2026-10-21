# -*- coding: utf-8 -*-
"""Conteúdo do Estudo de Viabilidade — Versões Nativas (parte B, capítulos 6-11)."""

SECTIONS_B = [
    ("h1", "6. Conformidade Infantil e Requisitos das Lojas"),
    ("p", "O Conta Comigo foi desenhado desde a origem para o público infantil sob as referências COPPA, LGPD (com atenção especial a crianças) e GDPR-K: zero coleta de dados, zero telemetria, zero anúncios, zero SDKs de terceiros, com todo o progresso guardado localmente e o painel dos responsáveis protegido por verificação adulta. Essa disciplina arquitetural converte-se agora em vantagem regulatória direta: os dois programas de loja exigem exatamente o que o jogo já pratica. No Google Play, o programa Families e o formulário Data Safety pedem divulgação completa da coleta de dados — que, no nosso caso, é a afirmação mais simples possível: nenhuma. A política de privacidade exigida como URL já está escrita e publicada no repositório desde a v2.5.0."),
    ("p", "Na Microsoft Store, a certificação pede a mesma triade: declaração de privacidade, descrição honesta do público e ausência de práticas de coleta invisíveis. Em ambos os casos, o classificatório etário (IARC no Play, questionnaire próprio na Microsoft) deve refletir o público de 4 anos, o que aciona deveres de proteção reforçada — todos já cumpridos por construção. O capítulo de riscos detalha o único cuidado real: preencher esses formulários com atenção, pois reprovações nesse estágio costumam vir de preenchimento impreciso, e não do produto."),
    ("table", {
        "header": ["Requisito", "Google Play (Android)", "Microsoft Store (Windows)"],
        "widths": [0.28, 0.36, 0.36],
        "rows": [
            ["Conta de desenvolvedor", "US$ 25 (pagamento único)", "Sem taxa para devs individuais (fluxo 2026); organização: US$ 19"],
            ["Formulário de dados", "Data Safety: nenhum dado coletado", "Declaração de privacidade na certificação"],
            ["Programa infantil", "Families Policy + questionário IARC (público de 4 anos)", "Certificação padrão; restrições de anúncios"],
            ["Empacotamento", "AAB/APK assinado (Play App Signing)", "MSIX via PWABuilder ou PWA por URL"],
            ["Política de privacidade", "URL obrigatória (já publicada no repositório)", "URL obrigatória (a mesma)"],
            ["Revisão", "Testes internos imediatos; revisão em dias", "Certificação automatizada em horas/dias"],
        ],
        "caption": "Tabela 5 — Requisitos de publicação nas duas lojas.",
    }),

    ("h1", "7. Custos, Contas e Pré-requisitos"),
    ("p", "O custo inicial do plano é propositalmente próximo de zero. A hospedagem da PWA usa o GitHub Pages, já incluído no repositório público que a Klivfy acabou de criar; a compilação dos pacotes roda no GitHub Actions, cuja cota gratuita cobre com folga o volume deste projeto; e a distribuição direta (APK para famílias, ZIP para Windows) não depende de nenhuma conta paga. O único gasto inevitável para estar <b>na</b> Play Store é a taxa única de US$ 25 da conta de desenvolvedor Google; a Microsoft Store, no fluxo atual para desenvolvedores individuais, não cobra registro — e, mesmo na modalidade de organização, o valor é único e simbólico. Itos opcionais ficam claramente separados: domínio próprio e certificado de assinatura de código do Windows são melhorias de credibilidade que podem chegar na Fase 3, sem bloquear nada."),
    ("table", {
        "header": ["Item", "Custo", "Papel no plano"],
        "widths": [0.40, 0.26, 0.34],
        "rows": [
            ["Hospedagem da PWA (GitHub Pages)", "R$ 0", "Essencial para TWA e Microsoft Store"],
            ["Domínio próprio (opcional)", "cerca de R$ 40-60/ano", "Marca própria; klivfy.github.io já funciona"],
            ["Conta Google Play", "US$ 25 (única vez)", "Publicar na Play Store"],
            ["Conta Microsoft Store (individual)", "R$ 0 no fluxo 2026", "Publicar na Microsoft Store"],
            ["Assinatura de release Android", "R$ 0 (keystore local + Play App Signing)", "Obrigatória para versão de produção"],
            ["Certificado de código Windows", "US$ 100-400/ano (opcional)", "Remove aviso do SmartScreen; Fase 3+"],
            ["GitHub Actions (repositório público)", "R$ 0", "Compila APK e EXE automaticamente"],
        ],
        "caption": "Tabela 6 — Custos e pré-requisitos do plano de versões nativas.",
    }),

    ("h1", "8. Recomendação e Veredito"),
    ("p", "Somando os capítulos anteriores, o veredito é claro e fundamentado em dois fatos verificáveis: a voz funciona de graça nas rotas TWA e Electron, e o empacotamento de ambas pode ser automatizado no GitHub Actions sem instalações locais. A Figura 1 resume o esforço estimado de implementação por rota — as barras escuras marcam as duas rotas recomendadas, que também são as mais baratas de suas plataformas depois das reescritas descartadas."),
    ("chart", {
        "kind": "effort",
        "caption": "Figura 1 — Esforço estimado de implementação por rota, em dias de desenvolvimento (estimativas deste estudo).",
    }),
    ("p", "A recomendação operacional, portanto, é uma sequência, não uma escolha única. <b>Primeiro</b>, publicar a PWA no GitHub Pages — é o pré-requisito comum da TWA e da Microsoft Store e custa uma configuração. <b>Segundo</b>, criar o embrulho TWA Android e o embrulho Electron Windows com compilação automática, entregando APK e executável testáveis ainda nesta fase. <b>Terceiro</b>, com os pacotes validados em aparelhos e computadores reais, abrir as contas das lojas e publicar. <b>Quarto</b>, otimizar: domínio próprio, Tauri para reduzir o peso do Windows e, se algum dia fizer sentido, Capacitor para recursos nativos profundos no Android — agora com a camada de voz preparada para um segundo back-end."),
    ("callout", "Plano em uma frase: PWA hospedada + TWA Android + Electron Windows, tudo compilado no GitHub Actions"),

    ("h1", "9. Roadmap de Implementação em Fases"),
    ("p", "O plano está dividido em quatro fases com entregáveis verificáveis, permitindo pausas naturais entre elas. A Fase 1 é executável imediatamente neste ambiente e no repositório GitHub da Klivfy, sem nenhuma conta nova e sem custo. As fases 2 e 3 dependem, respectivamente, de aparelhos reais para validação e das contas das lojas — decisões da Klivfy Tecnologia, mas com todo o trabalho técnico precedente já pronto."),
    ("table", {
        "header": ["Fase", "Escopo", "Entregáveis verificáveis"],
        "widths": [0.26, 0.42, 0.32],
        "rows": [
            ["Fase 1 — Fundação", "Publicar a PWA no GitHub Pages; criar scaffolds nativos (Electron e Capacitor); configurar workflows de compilação", "URL pública do jogo; APK de teste; ZIP Windows; artefatos no Actions"],
            ["Fase 2 — Validação", "Testar voz e jogo em Android e Windows reais; ajustar camada de voz (fallback e mapeamento de vozes PT-BR por plataforma); tela cheia e teclado", "Relatório de dispositivos; engine v2.7.0 com camada de voz adaptável"],
            ["Fase 3 — Lojas", "Abrir contas Play e Microsoft; preencher Families, Data Safety e certificação; publicar", "Apps publicados nas duas lojas; página de marca"],
            ["Fase 4 — Evolução", "Domínio próprio; Tauri para reduzir tamanho; integrações nativas (notificações de baú, atalhos)", "Versões otimizadas e recursos nativos incrementais"],
        ],
        "caption": "Tabela 7 — Roadmap em fases com entregáveis.",
    }),

    ("h1", "10. Riscos e Mitigações"),
    ("p", "Nenhum risco identificado compromete a viabilidade; todos têm mitigação conhecida e, em geral, barata. O risco mais importante — indisponibilidade da voz no WebView Android — já está tratado estruturalmente pela escolha da rota TWA, e a mitigação da rota alternativa (plugin de TTS nativo) está mapeada com esforço estimado. Os demais riscos são operacionais e típicos de publicação: formulários das lojas, aviso do SmartScreen e verificação de domínio."),
    ("table", {
        "header": ["Risco", "Probabilidade", "Impacto", "Mitigação"],
        "widths": [0.34, 0.14, 0.12, 0.40],
        "rows": [
            ["speechSynthesis indisponível no WebView (Capacitor)", "Alta (confirmada)", "Alto", "Preferir TWA; com Capacitor, integrar plugin nativo de TTS na camada de voz"],
            ["Lista de vozes vazia na primeira chamada (Electron)", "Média", "Médio", "Ouvir o evento voiceschanged e re-enumerar (padrão já usado pelo detector de vozes)"],
            ["Aviso do SmartScreen sem certificado de código", "Alta", "Baixo", "Publicar na Store; orientar a instalação; certificado opcional na Fase 3+"],
            ["Impedimento no Families Policy por formulário", "Baixa", "Alto", "Zero coleta/SDKs; política de privacidade e respostas do Data Safety já preparadas"],
            ["assetlinks.json incorreto (TWA sem tela cheia)", "Média", "Médio", "Verificação automática no CI e teste em aparelho antes do release"],
            ["Peso do pacote Electron (90-150 MB)", "Certa", "Baixo", "Tauri 2 como otimização futura (5-10 MB), após validar vozes no WebView2"],
        ],
        "caption": "Tabela 8 — Riscos identificados e mitigações.",
    }),

    ("h1", "11. Conclusão"),
    ("p", "O pedido de versões nativas para Android e Windows 10/11 é <b>viável, barato e de baixo risco</b> — desde que se escolham as rotas certas, e a pesquisa desta rodada mostrou que as rotas certas são também as mais simples. A decisão técnica mais importante foi revelada pelo fator voz: a TWA Android preserva a narração porque roda no Chrome completo, enquanto caminhos baseados em WebView a quebrariam; no Windows, o Electron embute Chromium com as vozes do sistema e pode ser empacotado diretamente no GitHub Actions. Em nenhum cenário recomendado o jogo é reescrito: o motor validado até a v2.6.0 permanece como base única, e as camadas nativas são embrulhos descartáveis e substituíveis."),
    ("p", "Os próximos passos imediatos estão no roadmap do capítulo 9 e não exigem decisão financeira: habilitar o GitHub Pages, criar os scaffolds nativos e configurar as compilações automáticas. Ao término da Fase 1, a Klivfy terá um link público do jogo, um APK instalável e um executável Windows — artefatos concretos para testar com famílias reais antes de qualquer investimento nas lojas. Recomenda-se aprovar a execução da Fase 1 e, em paralelo, agendar a validação em dispositivos reais da Fase 2, que é o único teste que nenhum ambiente simulado substitui."),
]

# -*- coding: utf-8 -*-
"""Conteúdo PT-BR do Estudo de Funções, Recompensas e Android — Conta Comigo (sem emoji)."""

DOC_TITLE = "Estudo de Funções, Recompensas e Android"
DOC_SUB = "Conta Comigo - Matemática para Crianças"
KICKER = "ESTUDO DE PRODUTO · CRESCIMENTO E PLATAFORMAS"
SUMMARY = ("Trinta funções idealizadas para o Conta Comigo — dez de alta, dez de média e dez de "
           "baixa complexidade — cobrindo novos desafios, prêmios, itens colecionáveis, temas, "
           "mascotes, itens de loja e a persistência das conquistas, além do plano completo para "
           "colocar o jogo no Android por três caminhos: PWA instalável, Firefox para Android e "
           "Google Play via TWA.")
META = "Estudo interno de produto · Outubro de 2026 · Versão de referência: 2.5.0"
FOOTER_META = "Conta Comigo · Estudo de Funções, Recompensas e Android"

# (tipo, conteúdo) — tipo: h1, h2, p, quote, table, callout
SECTIONS = [
("h1", "1. Sumário executivo"),
("p", "O Conta Comigo chegou à versão 2.5.0 com um núcleo de jogo maduro: doze modos de cálculo, "
      "adaptação automática de dificuldade, revisão espaçada de erros, desafio-chefe, duelo local, "
      "missões diárias, loja com temas e acessórios, álbum de figurinhas, mascote evolutiva e um "
      "sistema de quatorze conquistas. O pedido que originou este estudo aponta para a próxima "
      "curva de valor do produto: mais razões para voltar amanhã. Novos desafios, novos prêmios, "
      "mais itens colecionáveis, novos temas, mais mascotes, mais itens na loja e, sobretudo, a "
      "garantia de que o que a criança conquista permanece conquistado."),
("p", "Este documento entrega três coisas. Primeiro, um diagnóstico honesto do estado atual de cada "
      "frente pedida, incluindo a questão delicada da persistência: o que acontece com as conquistas "
      "quando a extensão é recarregada, atualizada ou removida. Segundo, o catálogo de trinta funções "
      "idealizadas, distribuídas em dez de alta complexidade, dez de média e dez de baixa, cada uma "
      "com descrição, valor pedagógico ou de engajamento, esforço estimado e status de implementação "
      "na v2.5.0. Terceiro, o plano para o Android, com a pesquisa técnica dos três caminhos "
      "disponíveis e a recomendação de sequência."),
("p", "A v2.5.0 que acompanha este estudo já entrega um lote expressivo das trinta funções: o desafio "
      "Contra o Tempo, os baús de recompensa por ofensiva, cinco mascotes adultas selecionáveis, três "
      "temas novos (Oceano, Doces e Neve), três acessórios novos, doze figurinhas novas no álbum, seis "
      "conquistas novas — duas delas secretas —, som de compra na loja, moldura de perfil por "
      "conquistas, confete na paleta do tema e a persistência reforçada com backup datado. O pacote "
      "Android/PWA também já está gerado. As demais funções ficam priorizadas no roteiro da seção 7."),

("h1", "2. Diagnóstico: o que existe hoje"),
("p", "Desafios. O jogo tem desafio-chefe a cada cinco rodadas (dez questões sem dicas, estrelas em "
      "dobro), duelo para dois jogadores no mesmo aparelho, avaliação inicial de oito questões e "
      "missões diárias determinísticas por data. O que falta é um desafio de resistência pessoal, do "
      "tipo quanto aguenta, e metas de médio prazo que deem sentido à ofensiva de dias além do número "
      "na chama. É exatamente o espaço ocupado pelas duas novidades de desafio da v2.5.0 e pelas "
      "propostas de alta complexidade do catálogo."),
("p", "Prêmios e colecionáveis. As recompensas hoje são estrelas por acerto, bônus de combo, bônus de "
      "meta diária e pontos de rapidez com recorde por modo. O colecionável é o álbum de figurinhas "
      "compradas por cinco estrelas, com duplicata devolvendo duas. O sistema funciona, mas tem dois "
      "vazios: a ofensiva de dias não gera prêmio próprio e o álbum tem tamanho fixo. A v2.5.0 fecha o "
      "primeiro vazio com os baús por marco de ofensiva e expande o álbum de vinte e quatro para "
      "trinta e seis figurinhas."),
("p", "Temas, mascotes e loja. A loja vendia quatro temas (um pago), três acessórios e figurinhas, e "
      "a mascote era uma raposa fixa em três fases de crescimento. Com a v2.5.0 são sete temas, sete "
      "acessórios e cinco mascotes adultas escolhíveis — a fase de crescimento continua existindo "
      "para todas, e aos cem estrelas a criança escolhe a companheira adulta. A economia continua "
      "saudável: estrelas são abundantes o bastante para que a loja seja desejada e escassas o "
      "suficiente para que exija escolhas."),
("p", "Persistência. Todo o progresso — estrelas, pontos, conquistas, figurinas, perfis e senha dos "
      "responsáveis — vive no armazenamento local da extensão, sincronizável por opção. Isso significa "
      "duas verdades que precisam ser ditas com clareza aos responsáveis: recarregar a extensão "
      "preserva tudo, mas remover e reinstalar apaga. A seção seguinte detalha o que foi feito na "
      "v2.5.0 para proteger a criança desse segundo cenário e o que ainda pode ser feito."),

("h1", "3. Persistência das conquistas"),
("p", "A conquista é o ativo mais caro do jogo para a criança: cada medalha representa horas de "
      "esforço, erro e recomeço. Perdê-la sem aviso é o tipo de dor que faz um app infantil perder a "
      "confiança da família. O diagnóstico técnico é simples: o armazenamento da extensão não "
      "empacotada pertence ao perfil de instalação no navegador. Recarregar pela página de extensões "
      "preserva o armazenamento. Remover a extensão destrói. Atualizar pela loja oficial, quando "
      "chegarmos lá, preserva — porque a loja substitui o pacote sem remover o perfil."),
("p", "A v2.5.0 ataca o problema em três camadas. Na primeira, o estado ficou blindado: a rotina de "
      "normalização agora garante que conquistas, figurinhas, coleções e mascotes nunca voltem vazios "
      "de uma migração, evitando perdas silenciosas por dados malformados. Na segunda camada, o botão "
      "de backup datado: um clique na vitrine de conquistas ou na área dos responsáveis baixa um "
      "arquivo com a data no nome, reimportável na mesma tela, e o painel passa a mostrar há quantos "
      "dias foi feito o último backup, com alerta quando passa de duas semanas. Na terceira camada, "
      "a orientação: as instruções de atualização agora dizem em voz alta que recarregar preserva e "
      "remover apaga, e sugerem o backup antes de qualquer operação drástica."),
("callout", "Regra de ouro para a família: antes de remover a extensão, baixe o backup. Depois de "
            "reinstalar, importe o arquivo no painel dos responsáveis e tudo volta — estrelas, "
            "conquistas, figurinhas e perfis."),
("p", "No horizonte das versões seguintes, dois reforços complementares entram no catálogo de alta "
      "complexidade: a sincronização seletiva das conquistas entre dispositivos do mesmo responsável "
      "e a exportação do progresso em arquivo portátil com verificação de integridade. Ambos "
      "preservam o princípio do produto de nunca exigir conta nem enviar dados a servidores sem "
      "consentimento explícito e informado."),

("h1", "4. Metodologia das trinta funções"),
("p", "Cada função foi classificada por complexidade de engenharia, não por importância. Alta "
      "complexidade significa semanas de trabalho, novos subsistemas ou dependência de decisão de "
      "produto; média significa poucos dias com estrutura existente; baixa significa horas e nenhum "
      "risco de regressão. O valor indicado é pedagógico, de engajamento ou de confiança da família. "
      "O status registra o que a v2.5.0 já entrega: das trinta, doze saem implementadas nesta versão, "
      "concentradas nas faixas de média e baixa que não dependem de decisão estrutural."),

("h2", "4.1 Alta complexidade (10)"),
("table", {
  "caption": "Tabela 1. Funções de alta complexidade",
  "widths": [0.07, 0.44, 0.31, 0.18],
  "header": ["ID", "Função", "Valor", "Status"],
  "rows": [["C1", "Mapa da Aventura: ilhas por operação com progressão visual, chefes de ilha e estrelas de conclusão por fase", "Engajamento de longo prazo; dá destino às estrelas", "Proposta"],
  ["C2", "Modo História em capítulos: campanha narrada com personagens que usam matemática em enredo", "Pedagógico profundo; motivação narrativa", "Proposta"],
  ["C3", "Roleta de Prêmios animada girável com raridades comuns, raras e lendárias", "Pico de dopamina positivo no fim da rodada", "Proposta"],
  ["C4", "Mascote com estados de cuidado (alegria, energia) que reage ao ritmo de jogo", "Vínculo afetivo; retorno diário", "Proposta"],
  ["C5", "Álbuns colecionáveis por série temática (3 séries de 24) com páginas desbloqueáveis", "Coleção de médio prazo; troca de duplicatas por moedas", "Proposta"],
  ["C6", "Torneio local para até 4 jogadores com chaveamento e final", "Social; família e sala de aula", "Proposta"],
  ["C7", "Economia de segunda moeda (moedas de ouro) com saldo próprio e vitrine", "Profundidade econômica; escolhas com peso", "Proposta"],
  ["C8", "Desafio semanal com ranking entre perfis do mesmo dispositivo", "Competição saudável sem internet", "Proposta"],
  ["C9", "Sincronização seletiva de conquistas entre dispositivos (código de pareamento)", "Confiança da família; proteção do progresso", "Proposta"],
  ["C10", "Fase 2 do estudo de voz: vozes neurais do sistema com pacote de áudio gravado opcional", "Qualidade sonora máxima offline", "Proposta"]]}),
("p", "As três primeiras formam o trio de maior retorno esperado. O Mapa da Aventura transforma a "
      "coleção de modos soltos em um mundo com destino, respondendo à pergunta para que as estrelas. "
      "A campanha narrada aproveita a biblioteca de histórias já existente e a voz cordial da v2.4. "
      "A roleta de prêmios substitui o fim de rodada previsível por um ritual de sorte com raridades, "
      "padrão consagrado nos jogos infantis mais bem avaliados. Já a sincronização de conquistas (C9) "
      "é a resposta definitiva à dor da persistência: um código de pareamento gerado no dispositivo "
      "evita contas e servidores, mantendo o princípio de privacidade."),

("h2", "4.2 Média complexidade (10)"),
("table", {
  "caption": "Tabela 2. Funções de média complexidade",
  "widths": [0.07, 0.44, 0.31, 0.18],
  "header": ["ID", "Função", "Valor", "Status"],
  "rows": [["M1", "Baú de recompensas por marco de ofensiva (3, 7, 14, 21, 30 dias) com estrelas e figurinha garantida", "Constância diária recompensada", "Implementado na v2.5.0"],
  ["M2", "Desafio Contra o Tempo: 60 segundos de fôlego com recorde próprio de acertos", "Resistência pessoal; sessões curtas e intensas", "Implementado na v2.5.0"],
  ["M3", "Mascotes adultas selecionáveis com desbloqueio na loja (raposa, panda, dino, unicórnio, robô)", "Escolha e pertencimento na fase adulta da mascote", "Implementado na v2.5.0"],
  ["M4", "Três temas novos com paletas completas (Oceano, Doces, Neve)", "Renovação visual barata e de alto impacto", "Implementado na v2.5.0"],
  ["M5", "Acessórios novos na loja (cartola, óculos escuros, formatura)", "Variação de identidade da mascote", "Implementado na v2.5.0"],
  ["M6", "Patentes por modo (bronze, prata, ouro) com base em precisão histórica", "Meta de domínio por operação", "Proposta"],
  ["M7", "Missões de fim de semana: duplas, maiores, com prêmio maior", "Ritmo diferente no fim de semana", "Proposta"],
  ["M8", "Conquistas secretas descobertas em jogo, sem descrição visível antes de ganhar", "Surpresa e conversa entre crianças", "Implementado na v2.5.0 (2 secretas)"],
  ["M9", "Backup automático orientado: lembrete periódico e arquivo datado de um clique", "Confiança; proteção das conquistas", "Implementado na v2.5.0"],
  ["M10", "Figurinhas brilhantes holográficas em edição especial do álbum", "Novidade visual na coleção", "Proposta"]]}),

("h2", "4.3 Baixa complexidade (10)"),
("table", {
  "caption": "Tabela 3. Funções de baixa complexidade",
  "widths": [0.07, 0.44, 0.31, 0.18],
  "header": ["ID", "Função", "Valor", "Status"],
  "rows": [["B1", "Doze figurinhas novas no álbum, com índices preservados para saves antigos", "Sopro de vida na coleção", "Implementado na v2.5.0"],
  ["B2", "Seis conquistas novas cobrindo mascote, álbum, fôlego, baús e temas", "Metas novas para quem já tinha tudo", "Implementado na v2.5.0"],
  ["B3", "Moldura do perfil que evolui com o número de conquistas (dourada e arco-íris)", "Orgulho visível no topo da tela", "Implementado na v2.5.0"],
  ["B4", "Som de caixa registradora nas compras da loja", "Feedback sensorial da economia", "Implementado na v2.5.0"],
  ["B5", "Animação de baú balançando antes de abrir", "Cerimônia da recompensa", "Implementado na v2.5.0"],
  ["B6", "Confete na paleta do tema ativo", "Coerência estética nas celebrações", "Implementado na v2.5.0"],
  ["B7", "Biblioteca cordial ampliada: mais saudações, elogios de rapidez e despedidas", "Voz menos repetitiva", "Implementado na v2.5.0"],
  ["B8", "Selo de versão visível no jogo e versão dinâmica nas opções", "Confiança; diagnóstico de suporte", "Implementado na v2.4.1"],
  ["B9", "Ficha da mascote: tela com nome, fase, companheira adulta e acessório", "Identidade e cuidado", "Proposta"],
  ["B10", "Contador de dias distintos jogados no painel dos responsáveis", "Métrica de hábito para a família", "Proposta"]]}),

("h1", "5. O lote implementado na v2.5.0"),
("p", "A v2.5.0 sai com doze das trinta funções implementadas, testadas em navegador e empacotadas "
      "para Chromium, Firefox e Android/PWA. O desafio Contra o Tempo usa um cronômetro global de "
      "sessenta segundos que corre entre as questões, respeita as pausas do modo calmo e da troca de "
      "aba, nunca pune o erro — apenas encerra a rodada quando o tempo acaba — e guarda recorde "
      "próprio de acertos por perfil. Os baús de ofensiva abrem no fim da rodada em que o marco é "
      "atingido, com animação de balanço, estrelas proporcionais ao marco e uma figurinha garantida "
      "que ainda falte no álbum."),
("p", "A loja cresceu de doze para vinte e seis itens: três temas novos com paletas completas "
      "incluindo o modo escuro de alto contraste, três acessórios novos e cinco mascotes adultas. A "
      "mascote escolhida aparece em todos os balões, na saudação com nome e na ficha da tela inicial, "
      "e a evolução continua: ovo até trinta estrelas, filhote até cem, e a forma adulta escolhida a "
      "partir de cem. As conquistas passam de quatorze para vinte, com as secretas exibidas como três "
      "pontos de interrogação até serem desbloqueadas. O backup datado está disponível na vitrine de "
      "conquistas e na área dos responsáveis, com indicador de idade do último backup."),

("h1", "6. Android: três caminhos pesquisados"),
("p", "O Chrome para Android não suporta extensões, e a extensão empacotada para computador não é o "
      "formato natural do celular. A pesquisa técnica identificou três caminhos complementares, todos "
      "partindo do mesmo motor de jogo, o que garante paridade de conteúdo e um único ponto de "
      "manutenção."),
("h2", "6.1 Caminho A — PWA instalável (recomendado para começar)"),
("p", "Um Progressive Web App é um site que o navegador instala na tela inicial como se fosse um "
      "aplicativo: abre em janela própria, sem barra do navegador, com ícone próprio e funciona "
      "offline. Os requisitos técnicos levantados são: um manifesto web com nome, ícones de 192 e 512 "
      "pixels (incluindo a variante maskable que o Android recorta em círculo), modo de exibição "
      "standalone, cor de tema; e um service worker que guarda o aplicativo em cache para uso sem "
      "internet. O Conta Comigo é offline por natureza, então o service worker apenas formaliza o que "
      "o jogo já é."),
("p", "A v2.5.0 entrega o pacote pronto: a pasta do PWA contém o jogo completo, o manifesto, o "
      "service worker com cache versionado e os quatro ícones gerados. Basta hospedar a pasta em "
      "qualquer endereço seguro e o Android do Chrome passa a oferecer Instalar aplicativo. É o "
      "caminho mais barato, sem loja, sem taxa e com atualização instantânea no próximo acesso. A "
      "limitação honesta: a instalação depende de o responsável seguir dois toques de configuração."),
("h2", "6.2 Caminho B — Firefox para Android via AMO"),
("p", "O Firefox para Android suporta extensões desde 2023, e o Manifest V3 do Firefox usa páginas "
      "de eventos em segundo plano — exatamente o formato que a build Firefox do Conta Comigo já usa "
      "no computador. A documentação oficial pede a declaração do ramo gecko_android no manifesto com "
      "a versão mínima 113, incluída na v2.5.0, e a verificação de APIs incompatíveis: a única "
      "chamada sensível do aplicativo era a abertura de janela em tela cheia, que agora detecta a "
      "ausência da API de janelas e abre o jogo em aba normal, comportamento correto no celular. A "
      "página do jogo já tem viewport e layout responsivo."),
("p", "Com isso, o mesmo pacote Firefox pode ser publicado no addons.mozilla.org e instalado no "
      "Android. É o caminho mais direto para quem já usa a extensão no computador, com a mesma "
      "privacidade e o mesmo armazenamento local. A limitação é o alcance: depende de o usuário ter o "
      "Firefox no celular."),
("h2", "6.3 Caminho C — Google Play via TWA"),
("p", "A Play Store aceita aplicativos empacotados a partir de uma PWA publicada, por meio de uma "
      "Atividade Web Confiável gerada pelo Bubblewrap, ferramenta oficial do Google, ou pelo "
      "PWABuilder com interface gráfica. O processo lê o manifesto do app hospedado, gera o pacote "
      "Android assinado e o publica na conta de desenvolvedor, cujo custo único é de vinte e cinco "
      "dólares. O aplicativo resultante abre a PWA em tela cheia nativa, com reutilização do cache e "
      "sem duplicação de código."),
("p", "A recomendação de sequência é: publicar a PWA primeiro, validar o interesse do público Android "
      "com custo zero, assinar o Firefox na AMO em paralelo por já estar pronto, e entrar na Play via "
      "TWA quando a PWA estiver estável em um domínio próprio. Essa ordem evita pagar o registro e "
      "manter o pacote da loja antes de existir um endereço definitivo para o app."),
("callout", "Privacidade em todos os caminhos: o jogo continua rodando inteiro no dispositivo, sem "
            "servidores, sem contas, sem anúncios e sem coleta de dados. O mesmo motor, o mesmo "
            "compromisso, três portas de entrada."),

("h1", "7. Roteiro sugerido por ondas"),
("p", "Onda imediata (v2.5.x, já em execução): consolidar o lote implementado, corrigir o que o uso "
      "real apontar e publicar a PWA em um endereço definitivo. Onda seguinte (v2.6): ficha da "
      "mascote, contador de dias, patentes por modo e missões de fim de semana — as quatro peças de "
      "média complexidade restantes, mais a roleta de prêmios se a família aprovadora quiser o ritual "
      "de sorte. Onda da virada (v2.7-v2.8): Mapa da Aventura como espinha dorsal da progressão e "
      "álbuns por série. Onda de plataforma (v3.x): torneio de quatro jogadores, sincronização "
      "pareada de conquistas, fase 2 do estudo de voz e a decisão de entrar na Play Store."),
("p", "Critério de corte para cada onda: nenhuma função nova entra antes de a anterior passar no "
      "teste com crianças reais de quatro a seis anos, que é a idade onde a interface prova ou "
      "reprova qualquer mudança. O painel dos responsáveis ganha, a cada onda, um resumo das "
      "novidades em linguagem de família, sem jargão de engenharia."),

("h1", "8. Conclusões"),
("p", "O pedido de trinta funções foi cumprido com folga de desenho: o catálogo cobre todas as "
      "frentes citadas — desafios, prêmios, colecionáveis, temas, mascotes, loja e persistência — e "
      "a versão 2.5.0 já entrega doze delas com qualidade testada. O conjunto de alta complexidade "
      "fica devidamente mapeado com valor e esforço, para que a próxima decisão de investimento seja "
      "escolha e não aposta. A persistência das conquistas deixou de ser um risco silencioso e "
      "virou um compromisso documentado, com ferramenta de backup no próprio jogo e instruções claras "
      "de atualização."),
("p", "No Android, a análise dos três caminhos mostra que o produto já está pronto para o primeiro "
      "deles: o pacote PWA instalável e offline acompanha esta versão, a build Firefox recebeu a "
      "declaração oficial de compatibilidade com Android e a rota da Play Store está descrita passo a "
      "passo para o momento certo. O Conta Comigo sai desta rodada mais rico dentro do navegador e "
      "pronto para existir fora dele, mantendo intactos os três pilares que guiaram o projeto desde a "
      "primeira versão: gratuito, offline e privado."),
]

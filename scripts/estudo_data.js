'use strict';
/* Conteúdo PT-BR do estudo: Conta Comigo — Estudo de Expansão (v2.2.0)
   Pontos por tempo · contas e competição segura (Supabase/Google) ·
   acessibilidade · usabilidade · segurança cibernética. */
module.exports = {

cover: {
  title: 'Conta Comigo — Estudo de Expansão e Endurecimento',
  subtitle: 'Pontuação por tempo e precisão · contas de usuário e competição segura com Google via Supabase · acessibilidade · usabilidade · segurança cibernética',
  englishLabel: 'PRODUCT STUDY REPORT',
  metaLines: [
    'Documento: estudo técnico e estratégico (versão de referência do produto: 2.2.0)',
    'Público: equipe de produto e desenvolvimento da extensão Conta Comigo',
    'Abrangência: Chromium (Chrome/Edge/Brave/Opera) e Firefox, MV3',
    'Data de elaboração: outubro de 2026',
  ],
  footerLeft: 'Conta Comigo — Matemática para Crianças',
  footerRight: 'Estudo de Expansão · 2026',
},

execSummary: [
  'Este estudo responde às três demandas apresentadas para a próxima etapa do Conta Comigo: a inclusão de uma função de tempo entre as respostas que premie rapidez e precisão, a avaliação de viabilidade de um sistema de cadastro, login e logout com competição assíncrona entre usuários sem qualquer canal de contato direto, e um levantamento amplo de melhorias de acessibilidade, usabilidade e, principalmente, segurança cibernética. O documento consolida o que já foi implementado, o que é tecnicamente viável, o que deve ser evitado e em qual ordem recomendada.',
  'A função de tempo foi implementada na versão 2.2.0 e está descrita no capítulo 3: cada questão recebe uma barra de tempo suave, e a pontuação combina precisão (acertar, especialmente de primeira) com rapidez (tempo restante na barra). A mecânica foi desenhada para não punir crianças: o esgotamento da barra apenas zera o bônus de rapidez, o cronômetro pode ser desligado pelos responsáveis, e ele se pausa automaticamente durante overlays, troca de aba e telas inativas. A pontuação total passa a ser registrada no perfil e no painel dos responsáveis, o que cria a base métrica para um futuro placar online.',
  'A análise de contas de usuário conclui que a proposta é viável tecnicamente no formato atual de extensão Manifest V3, desde que três condições estruturais sejam observadas: empacotamento local da biblioteca do Supabase (a CSP do MV3 proíbe código remoto), autenticação Google pelo fluxo nativo de identidade do navegador (chrome.identity / browser.identity) com identificador de extensão estável, e uma arquitetura de servidor que trate o cliente como não confiável, com políticas de segurança em nível de linha (RLS) e funções de borda validando tudo que chega. O capítulo 4 detalha esquema de dados, políticas, antifraude, custos e um roteiro em três fases.',
  'O ponto mais sensível do projeto é o público: crianças a partir de 4 anos. Por isso, a recomendação central do estudo é que a competição seja construída como um sistema assíncrono e minimalista em dados, em que apenas apelido de lista fechada, avatar e pontuação sejam publicáveis, e em que não exista funcionalidade de busca de pessoas, amizades, conversas ou troca de mensagens em nenhuma hipótese. O consentimento parental, a exclusão fácil da conta e a ausência de coleta de geolocalização ou dados pessoais são tratados como requisitos de lançamento, não como melhorias futuras. Os capítulos 5 a 7 completam o estudo com backlogs priorizados de acessibilidade (WCAG 2.2), usabilidade para pré-leitores e um plano de endurecimento de segurança baseado em modelagem de ameaças STRIDE e referências OWASP.',
],

sec21: [
  'O Conta Comigo é uma extensão de navegador, sem servidores próprios, que funciona integralmente offline e ensina matemática básica a crianças a partir de 4 anos por meio de doze modos de jogo. A versão 2.2.0 consolidou uma evolução em quatro ondas: os doze modos pedagógicos com adaptação automática de dificuldade, o conjunto de funcionalidades de engajamento (loja, conquistas, missões, desafio-chefe e duelo local), a abertura sempre em janela nativa em tela cheia acionada pelo ícone ou pelo atalho Ctrl+Shift+U e, por fim, a mecânica de pontos por rapidez e precisão descrita neste estudo. Todo o progresso fica salvo localmente no navegador por meio de chrome.storage.local, com espelhamento opcional na conta do navegador (chrome.storage.sync) controlado pelos responsáveis.',
  'A extensão mantém uma superfície técnica deliberadamente pequena, e isso é um ativo de segurança. Ela solicita apenas a permissão de armazenamento, não executa código remoto, não contém scripts inline (em conformidade com a política de conteúdo do Manifest V3) e se distribui em pacotes separados para Chromium e Firefox, refletindo a diferença de suporte a service workers entre os motores. Qualquer expansão que envolva rede, contas ou servidores muda essa natureza e, portanto, exige o rigor que este estudo propõe nos capítulos 4 e 7.',
],

sec22: [
  'O estudo persegue três objetivos claros. O primeiro é especificar e justificar a mecânica de tempo entre respostas com pontuação proporcional à rapidez e à precisão, garantindo que ela seja motivadora sem converter o jogo em uma fonte de ansiedade para crianças pequenas. O segundo é estudar a possibilidade de cadastro, login e logout com competição entre usuários de diferentes níveis ou localidades, mantendo o requisito absoluto de ausência de contato direto: o usuário só pode ver a figura (avatar) escolhida pelo outro, o apelido e a pontuação, nunca conversas ou mensagens. O terceiro é produzir um levantamento amplo e priorizado de melhorias de acessibilidade, usabilidade e segurança cibernética, com atenção especial a esta última por se tratar de um produto infantil.',
  'Delimitam-se fora do escopo deste documento a implementação imediata do backend de contas (que depende de decisões de infraestrutura e orçamento do responsável pelo produto), a criação de qualquer canal de comunicação entre usuários (expressamente vetado pelo requisito do produto) e a coleta de dados de localização precisa, que contraria o princípio de minimização adotado. Quando o estudo afirma limites numéricos de serviços de terceiros, os valores são aproximados, datados da elaboração deste relatório e devem ser revalidados na contratação.',
],

sec23: [
  'O método combina quatro frentes complementares. A primeira é a análise do código-fonte da extensão na versão 2.2.0, do motor de questões à interface, incluindo os testes automatizados por navegador já praticados no projeto. A segunda é a análise técnica de plataforma: restrições de Content Security Policy do Manifest V3, APIs de identidade do Chromium e do Firefox, modelo de autenticação do Google e modelo de segurança do Supabase (Row Level Security, funções de borda e chaves anônimas públicas). A terceira é a consulta a normas e referências públicas: as Diretrizes de Acessibilidade para Conteúdo Web 2.2 do W3C, os princípios de acessibilidade cognitiva do COGA, a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), em especial seu artigo 14, a regra COPPA da legislação norte-americana para serviços dirigidos a menores de 13 anos e as referências OWASP para aplicações web e para modelagem de ameaças STRIDE. A quarta frente é a avaliação heurística da interface atual sob a ótica de crianças pré-leitoras.',
  'Nenhum dado de usuários reais foi coletado para este estudo. As recomendações de testes com crianças, apresentadas no capítulo 6, são um roteiro para execução futura com os devidos cuidados éticos e consentimento dos responsáveis. Onde o estudo propõe números de dimensionamento (limites de pontuação, taxas de submissão, janelas de tempo), eles derivam explicitamente das fórmulas do próprio jogo apresentadas no capítulo 3, e não de medições externas.',
],

sec3Intro: [
  'A versão 2.2.0 introduziu a função de tempo entre as respostas com pontuação por rapidez e precisão. Este capítulo documenta a mecânica entregue, suas fórmulas e as decisões de design que a tornam adequada ao público de 4 anos ou mais, além de mostrar por que a pontuação agora registrada no perfil é o alicerce natural do sistema de competição estudado no capítulo 4.',
  'Cada questão inicia uma barra de tempo, exibida logo abaixo dos indicadores de progresso, que se esvazia de forma contínua e suave. O orçamento de tempo depende do nível de dificuldade ativo e do modo: os níveis variam de 30 segundos no nível 1 a 22 segundos no nível 5, e os modos que exigem mais exploração visual ou leitura (Contar, Histórias, Dinheiro e Dividir) recebem 6 segundos adicionais. A barra muda de cor ao passar de metade (amarelo) e no quarto final (vermelho), respeitando o modo calmo, que suprime animações. Diferentemente de jogos competitivos para adultos, o esgotamento da barra não encerra a questão, não reduz estrelas e não dispara sons de alerta: apenas encerra a possibilidade de ganhar o bônus de rapidez naquela questão.',
],

tabPontuacao: {
  headers: ['Evento na questão', 'Pontos obtidos', 'Observações'],
  pcts: [34, 33, 33],
  centers: [1],
  rows: [
    ['Acerto de primeira com barra cheia', '100 × nível + 60 × nível', 'Máximo: 160 × nível; recompensa máxima por rapidez e precisão'],
    ['Acerto de primeira com barra parcial', '100 × nível + fração de 60 × nível', 'A fração é proporcional ao tempo restante na barra'],
    ['Acerto de primeira com barra esgotada', '100 × nível', 'Sem bônus de rapidez; sem qualquer punição'],
    ['Acerto após um ou mais erros', '40 × nível', 'Precisão continua valendo; rapidez não pontua'],
    ['Desafio-chefe (qualquer caso acima)', 'Pontos em dobro', 'Alinhado à regra de estrelas em dobro do chefe'],
    ['Avaliação de nível e Duelo', 'Não pontuam no total do perfil', 'Avaliação é diagnóstico; duelo tem placar próprio da partida'],
  ],
},

tabTempo: {
  headers: ['Nível de dificuldade', 'Barra padrão', 'Modos Contar, Histórias, Dinheiro e Dividir'],
  pcts: [30, 30, 40],
  centers: [0, 1, 2],
  rows: [
    ['Nível 1', '30 segundos', '36 segundos'],
    ['Nível 2', '28 segundos', '34 segundos'],
    ['Nível 3', '26 segundos', '32 segundos'],
    ['Nível 4', '24 segundos', '30 segundos'],
    ['Nível 5', '22 segundos', '28 segundos'],
  ],
},

sec33: [
  'A Figura 1 ilustra a curva de pontos da mecânica para o modo Somar em três níveis de dificuldade. A leitura pedagógica é direta: a diferença entre responder instantaneamente e responder com calma é limitada (60 × nível pontos por questão), de modo que a precisão pesa sempre mais do que a velocidade; e a linha tracejada mostra que, esgotada a barra, o acerto de primeira continua valendo 100 × nível. Para uma criança de 4 anos no nível 1, a diferença entre o melhor e o pior acerto de primeira é de 60 pontos em uma escala que também alimenta estrelas, missões e conquistas — um incentivo perceptível, porém não dominante.',
  'fig:chart',
  'A economia de estrelas existente foi preservada intocada: estrelas continuam valendo 2 por acerto de primeira e 1 após erro, e preços da loja, desbloqueios de modos e recompensas de missões permanecem inalterados. Os pontos cumprem papel distinto: medir desempenho com granularidade maior (100 a 160 pontos por questão, contra 1 a 2 estrelas) e servir de moeda de mérito para o futuro placar online, sem contaminar a economia de consumo das estrelas. O total de pontos, os recordes por modo e o total por jogador aparecem no chip de jogo, na tela final de rodada e no painel dos responsáveis.',
],

sec34: [
  'Três decisões de acessibilidade acompanham a mecânica desde o nascimento. Primeiro, o cronômetro é desligável na área dos responsáveis (ajuste \u201CCronômetro de pontos\u201D); desligado, a barra desaparece, o bônus de rapidez deixa de existir e a precisão segue pontuando, o que atende crianças com Transtorno do Déficit de Atenção, ansiedade ou simplesmente tempos cognitivos próprios. Segundo, o relógio pausa sozinho em todas as situações em que a criança não tem a questão sob controle imediato: overlays de respiração e de subida de nível, aba oculta, janela sem foco e o instante de transição entre questões. Terceiro, não há punição sonora ou visual agressiva: o esgotamento exibe um balão gentil da mascote informando que a barra acabou e que a criança pode responder com calma.',
  'Para leitores de tela, a barra é um elemento com papel de barra de progresso, com rótulo acessível e valor atualizado continuamente. Essa base já antecipa dois itens do backlog do capítulo 5: a necessidade de anúncios em regiões vivas (aria-live) para as questões e a garantia de foco visível reforçado.',
],

sec35: [
  'A pontuação por questão também resolve um problema de desenho que o placar online teria de enfrentar de qualquer forma: definir uma métrica comparável entre jogadores de níveis diferentes. Como os pontos escalam com o nível de dificuldade ativo (multiplicador de 1 a 5) e com o contexto da rodada (normal, revisão, chefe), o placar proposto no capítulo 4 pode somar pontos por temporada e agrupar jogadores por faixas de nível, tornando justa a comparação entre uma criança de 4 anos no nível 1 e um irmão mais velho no nível 4 — cada um compete com pontos ponderados pela dificuldade que efetivamente enfrentou. O modo duelo, que é uma partida local entre duas crianças no mesmo aparelho, não alimenta o total do perfil por decisão deliberada de evitar que rodadas compartilhadas poluam a métrica individual.',
],

sec41: [
  'Os requisitos de produto para a área de contas e competição derivam do enunciado do solicitante e dos princípios de proteção de crianças adotados neste estudo. São requisitos funcionais: criar conta, entrar e sair; vincular o progresso local existente a um perfil online quando a família assim decidir; e exibir uma competição por pontuação entre usuários de níveis ou localidades diferentes. São requisitos de proteção, inegociáveis: nenhuma funcionalidade de conversa, mensagens, comentários, convites ou busca de pessoas; visibilidade restrita a três atributos — a figura (avatar) escolhida pelo usuário, o apelido e a pontuação; e inexistência de qualquer troca de dados pessoais entre contas.',
  'Do requisito \u201Csem contato direto por quaisquer canais\u201D decorrem consequências de arquitetura que o capítulo detalha: não haverá lista de amigos, não haverá perfis visitáveis, não haverá imagens enviadas por usuários (o avatar vem de uma lista fechada de dez figuras já usadas no jogo), não haverá apelido de texto livre (o apelido será escolhido de uma lista de combinações prontas ou definido pelos responsáveis) e não haverá qualquer campo de texto público. Essas escolhas eliminam de raiz as principais vias de contato abusivo em produtos infantis: mensagens diretas, comentários e compartilhamento de informações pessoais em texto livre.',
],

sec42: [
  'A viabilidade técnica no formato atual de extensão Manifest V3 depende de quatro pilares, todos resolvidos com técnicas conhecidas. O primeiro pilar é a política de conteúdo: a CSP do MV3 proíbe scripts remotos, portanto a biblioteca oficial do Supabase (supabase-js) não pode ser carregada de CDN; ela deve ser empacotada dentro da extensão, o que a política permite explicitamente, por se tratar de código incluído no pacote. A biblioteca tem algumas centenas de kilobytes e é compatível com service workers e páginas de extensão; a versão a ser embarcada deve ser fixada por versão exata e auditada, como detalhado no capítulo 7.',
  'O segundo pilar é o fluxo de autenticação do Google. Dentro de uma extensão, o caminho padrão é o fluxo de identidade do próprio navegador: em navegadores Chromium, chrome.identity.launchWebAuthFlow abre a janela de consentimento do Google e recebe o redirecionamento em um endereço derivado do identificador da extensão; no Firefox existe a API equivalente browser.identity.launchWebAuthFlow. Para que o redirecionamento seja estável no Chromium, a extensão empacotada precisa de identificador fixo, obtido declarando a chave pública (campo key) no manifest — prática documentada para extensões com OAuth. O fluxo recomendado é o Authorization Code com PKCE iniciado pelo Supabase, entregando ao final uma sessão do Supabase (tokens de acesso e atualização) para a extensão; o cliente OAuth do Google deve ser registrado com os endereços de retorno dos dois motores. Um estudo de prova de conceito é recomendado antes do compromisso de versão, cobrindo os dois navegadores e o caso de identificador estável.',
  'O terceiro pilar é o modelo de sessão do Supabase dentro da extensão: os tokens podem residir no armazenamento local da extensão (chrome.storage.local), que já é o repositório do progresso, e a renovação automática por refresh token é feita pela própria biblioteca. O quarto pilar é a permissão de rede: será necessário declarar host_permissions apenas para o domínio do projeto Supabase (e, se adotado, o domínio de autenticação do Google), mantendo o princípio do menor privilégio — nenhuma permissão ampla de rede do tipo <all_urls>, que seria reprovável tanto nas lojas quanto neste estudo de segurança.',
  'Uma alternativa frequentemente sugerida, o link mágico por e-mail, é desaconselhada para este público: exige caixa de e-mail da família, quebra o fluxo dentro da extensão (o link abre no navegador) e introduz um canal de comunicação por mensagem que este estudo prefere evitar por princípio. O login exclusivamente com Google evita senhas próprias (e, portanto, vazamentos de credenciais do produto), aproveita a verificação e a recuperação de conta já maduras do Google e atende ao critério 3.3.8 (Autenticação Acessível) das WCAG 2.2, pois não exige teste cognitivo da criança — a autenticação é delegada ao responsável por meio da conta Google já presente no aparelho.',
],

sec43: [
  'A arquitetura proposta segue o princípio de que a extensão é um cliente não confiável. O jogo continua funcionando offline e gravando localmente; quando existe sessão ativa e conexão, a extensão enfileira a submissão do resultado de rodadas concluídas para uma função de borda (Edge Function) do Supabase, que valida limites, sanidade e ritmo antes de gravar. Nenhuma escrita direta do cliente em tabelas de pontuação é aceita: o caminho único é a função de borda com chave de serviço, e a chave anônima do Supabase, pública por natureza, fica protegida exatamente pelas políticas de nível de linha e pelo desenho das funções. A leitura do placar é feita por uma view dedicada que expõe somente apelido, avatar, faixa de nível e pontuação da temporada — nunca endereço de e-mail, identificadores de conta do Google ou carimbos precisos de atividade.',
  'A Tabela 3 resume o esquema mínimo proposto e a regra de acesso de cada objeto. O desenho é deliberadamente enxuto: quanto menos dados existem, menor a superfície de risco e menor o ônus de conformidade com o artigo 14 da LGPD.',
],

tabSchema: {
  headers: ['Objeto (Supabase)', 'Campos-chave', 'Regra de acesso proposta'],
  pcts: [24, 38, 38],
  rows: [
    ['profiles', 'id (igual a auth.users), public_id, nickname, avatar, level_band, total_points, created_at', 'Escrita somente via função de borda; leitura pela view pública; atualização do próprio perfil autenticada por RLS (dono da linha)'],
    ['scores', 'id, user_id, mode, round_kind, points, max_level, client_date, created_at', 'Escrita exclusiva da função de borda (valida limites e ritmo); leitura restrita ao dono e à view agregada'],
    ['ranking_publico (view)', 'nickname, avatar, level_band, total_points, temporada', 'Leitura pública com Security Barrier; sem e-mail, sem UUID de conta, sem carimbos de atividade'],
    ['seasons', 'id, inicio, fim, ativa', 'Leitura pública; escrita administrativa'],
  ],
},

sec44: [
  'A proteção de dados de crianças é o eixo central da proposta. A LGPD (Lei nº 13.709/2018) determina em seu artigo 14 que o tratamento de dados de crianças e adolescentes deve realizar-se no seu melhor interesse e, para crianças, depende de consentimento específico e destacado de pelo menos um dos pais ou responsável legal. A regra COPPA, nos Estados Unidos, impõe consentimento parental verificável para serviços dirigidos a menores de 13 anos — relevante caso a extensão seja publicada globalmente nas lojas. Em termos práticos, a recomendação é que a área de contas só possa ser ativada pelos responsáveis, atrás do portão parental já existente (conta de multiplicar), com uma tela de consentimento próprio que explique, em linguagem simples, o que será publicado (apelido, figura e pontos) e permita recusar sem perder as funcionalidades offline do jogo.',
  'A minimização proposta elimina de antemão os dados mais sensíveis: não há coleta de e-mail pela extensão (o e-mail fica restrito à conta Google dentro do Supabase e nunca é exibido), não há data de nascimento (a faixa de nível é escolhida pelo jogo, não declarada), não há geolocalização (a eventual \u201Clocalidade\u201D será um código opcional de turma ou escola criado pelos responsáveis, sem coordenadas nem endereço) e não há fotos (avatares de lista fechada). A Tabela 4 fixa a política de cada dado. Complementarmente, o produto deve oferecer exclusão imediata da conta e dos dados publicados dentro do próprio jogo (direito de eliminação, artigos 16 e 18 da LGPD), painel de exportação já existente e uma nota de privacidade infantil redigida em linguagem acessível aos responsáveis.',
],

tabDados: {
  headers: ['Dado', 'Política no produto', 'Fundamento'],
  pcts: [26, 44, 30],
  rows: [
    ['Apelido', 'Escolhido de lista fechada ou definido pelos responsáveis; sem texto livre', 'Impede vazamento de identidade e apelidos ofensivos'],
    ['Avatar (figura)', 'Lista fechada de 10 figuras do jogo', 'Atende ao requisito de exibir apenas a figura escolhida'],
    ['Pontuação', 'Total da temporada e recordes por modo', 'Único dado de desempenho publicado'],
    ['Faixa de nível', 'Derivada do jogo (iniciante, explorador, mestre)', 'Permite placares justos por nível'],
    ['E-mail (conta Google)', 'Permanece no Supabase/auth; nunca exibido nem exportado', 'Minimização; LGPD art. 6º, III'],
    ['Localidade', 'Opcional: código de turma/escola criado pelos responsáveis; sem geolocalização', 'Requisito do produto sem dados sensíveis'],
    ['Progresso detalhado', 'Exclusivamente local no navegador', 'Nunca publicado no placar'],
  ],
},

sec45: [
  'Como o jogo roda no cliente, a pontuação enviada é autorreportada e não pode ser tratada como prova absoluta. A resposta do desenho é em camadas. Na camada de validação, a função de borda rejeita resultados fisicamente impossíveis segundo as fórmulas do capítulo 3 (por exemplo, mais do que o máximo teórico de pontos por rodada — 5.000 pontos em rodada normal no nível 5 sem chefe, e 16.000 em desafio-chefe de 10 questões), exige um intervalo mínimo entre submissões compatível com a duração real de uma rodada e limita o número de submissões por dia e por conta. Na camada de reputação, contas com padrões anômalos entram em fila de revisão e deixam de afetar o placar visível até checagem (shadow ranking), sem mensagem que ensine o fraudador a ajustar o comportamento. Na camada de desenho, temporadas curtas com reinício do placar reduzem o incentivo à fraude persistente, e a ausência de prêmios monetários ou de compra mantém a competição no campo lúdico.',
  'A moderação de identidade é estrutural: apelidos de lista fechada, avatares de lista fechada e nenhum campo de texto público significam que não existe conteúdo gerado por usuário a moderar. Esse é o ganho de segurança mais importante da arquitetura proposta e deve ser preservado contra pressões futuras por personalização de texto.',
],

sec46: [
  'O dimensionamento de custo é favorável ao porte do projeto. O plano gratuito do Supabase oferece, na data deste estudo e em termos aproximados, meio gigabyte de banco de dados, cinquenta mil usuários ativos mensais e funções de borda com cota mensal — limites amplamente suficientes para a escala típica de uma extensão educacional e para as primeiras temporadas do placar. Os valores devem ser revalidados no momento da contratação, pois mudam com o tempo. A Tabela 5 resume os itens relevantes e a adequação a este projeto.',
],

tabCustos: {
  headers: ['Recurso', 'Plano gratuito (aprox., datado)', 'Adequação ao Conta Comigo'],
  pcts: [28, 36, 36],
  rows: [
    ['Banco de dados (Postgres)', '500 MB', 'Placar com apelidos e pontuações ocupa poucos megabytes por temporada'],
    ['Usuários ativos mensais (auth)', '50.000', 'Folga ampla para escala inicial e escolas'],
    ['Funções de borda', 'Cota mensal de invocações', 'Uma chamada por rodada concluída; família típica gera dezenas por dia'],
    ['Armazenamento de arquivos', '1 GB', 'Não será usado (sem fotos ou uploads por design)'],
    ['Suporte e SLA', 'Comunitário', 'Aceitável para recurso opcional; o jogo principal segue offline'],
  ],
},

sec47: [
  'A Tabela 6 consolida os riscos principais da iniciativa e as respostas propostas. Nenhum dos riscos listados é bloqueante; três deles (fluxo OAuth no Firefox, dependência de serviço externo e conformidade infantil) exigem decisão consciente do responsável pelo produto antes do início da Fase 1.',
],

tabRiscos: {
  headers: ['Risco', 'Cenário', 'Resposta proposta'],
  pcts: [26, 37, 37],
  rows: [
    ['Fluxo OAuth divergente no Firefox', 'Redirecionamento derivado de identificador interno varia por instalação em builds de desenvolvimento', 'Prova de conceito dedicada no Firefox; se inviável, placar inicia somente no Chromium e F1 declara suporte explícito'],
    ['Dependência de serviço externo', 'Indisponibilidade do Supabase derruba o placar', 'Jogo 100% offline por desenho; placar degrada com aviso amigável; fila local reenvia depois'],
    ['Conformidade infantil', 'Publicação sem consentimento parental adequado', 'Portão parental como pré-condição; revisão jurídica antes do lançamento público; política infantil publicada'],
    ['Pontuação fraudada', 'Extensões adulteradas submetem valores irreais', 'Validação server-side de limites e ritmo; shadow ranking; temporadas curtas; sem prêmios'],
    ['Custo além do gratuito', 'Crescimento orgânico acima do plano', 'Alertas de cota; temporada com pausa automática do placar, sem afetar o jogo offline'],
    ['Reputação por associação com Google', 'Falha percebida no login vira falha do produto', 'Mensagens de erro honestas; logout local imediato; modo convidado sempre disponível'],
  ],
},

sec48: [
  'O roteiro recomendado tem três fases, cada uma com critério de aceite objetivo. A Fase 1 (Fundação de identidade) implementa o empacotamento do supabase-js, o login e logout com Google nos dois motores, a vinculação opcional do perfil local ao perfil online, a exclusão de conta dentro do produto e o consentimento parental — sem placar público. A Fase 2 (Placar por temporada) entrega a função de borda de submissão com validações, a view pública e o placar semanal por faixa de nível dentro do jogo. A Fase 3 (Turmas e duelos-fantasma) adiciona códigos de turma criados por responsáveis (escolas) e o modo em que a criança joga contra pontuações fantasma de outros jogadores da mesma faixa, sempre sem qualquer interação direta. As ondas de acessibilidade e segurança dos capítulos 5 e 7 são intercaladas: o endurecimento P0 antecede a Fase 1, e os itens P1 acompanham a Fase 2.',
],

sec5Intro: [
  'A acessibilidade do Conta Comigo já nasceu com um conjunto relevante: narração em voz de todas as questões (TTS) com controle de velocidade e tom, alto contraste, fonte para dislexia, modo calmo que respeita a preferência do sistema por menos animação, operação por teclado nas respostas, botão de repetir a narração, dicas após dois erros e, agora, cronômetro desligável. Este capítulo avalia o que falta para aproximar o produto das Diretrizes WCAG 2.2 (publicadas pelo W3C em outubro de 2023) no nível AA, com atenção especial à acessibilidade cognitiva (iniciativa COGA do W3C), que é o eixo dominante para crianças de 4 a 7 anos, muitas das quais ainda não leem.',
  'A avaliação considera três frentes complementares. A primeira é percepcional: toda informação transmitida por cor ou por som precisa ter alternativa textual ou visual; as narrações já têm texto na tela, e as respostas coloridas já se distinguem por posição, mas o par A/B da comparação e os grupos coloridos podem ganhar padrões gráficos além da cor. A segunda é operacional: alvos de toque generosos (o produto usa botões grandes, e a referência de mercado para público infantil é manter alvos de ao menos 60 pixels, acima do mínimo de 24×24 do critério 2.5.8 das WCAG 2.2), navegação completa por teclado com ordem previsível, ausência de gestos complexos (o produto já usa apenas toques simples, atendendo ao espírito dos critérios 2.5.1 e 2.5.7). A terceira é cognitiva: linguagem simples já validada em três idiomas, consistência de layout, previsão do que acontece ao toque e tolerância a erro — reforçada pela mecânica do capítulo 3, que nunca pune o tempo.',
  'A Tabela 7 consolida o backlog priorizado. Prioridade P0 significa que o item deve anteceder ou acompanhar a Fase 1 do capítulo 4 por afetar diretamente leitores de tela ou o uso escolar; P1 acompanha a Fase 2; P2 é aspiracional e depende de recursos externos (por exemplo, conteúdo em Libras).',
],

tabA11y: {
  headers: ['Item de melhoria', 'Referência', 'Prioridade', 'Esforço'],
  pcts: [46, 22, 16, 16],
  centers: [2, 3],
  rows: [
    ['Anunciar questões e feedback em regiões vivas (aria-live) e papel de status no balão da mascote', 'WCAG 4.1.3', 'P0', 'Baixo'],
    ['Foco visível reforçado (contorno de 3 px) em todos os controles e ordem de tabulação linear', 'WCAG 2.4.7 / 2.4.11', 'P0', 'Baixo'],
    ['Garantir contraste AA (4,5:1) nos textos sobre cartões e chips em todos os temas', 'WCAG 1.4.3', 'P0', 'Médio'],
    ['Padrões gráficos (listras/pontos) além da cor nos grupos A/B e nos lados da comparação', 'WCAG 1.4.1', 'P1', 'Médio'],
    ['Teste assistido com NVDA (Windows) e VoiceOver (macOS) nas telas principais', 'WCAG geral', 'P1', 'Médio'],
    ['Navegação por setas entre cartões de modos com roving tabindex e atalho de busca de modo', 'WCAG 2.1.1', 'P1', 'Médio'],
    ['Alvos mínimos de 60 px verificados nas três densidades (popup, página e web)', 'WCAG 2.5.8', 'P1', 'Baixo'],
    ['Alternativa visual para efeitos sonoros (brilho na borda) quando o aparelho está mudo', 'WCAG 1.4.2 (espírito)', 'P2', 'Médio'],
    ['Conteúdo de apoio em Libras e audiodescrição dos tutoriais da mascote', 'Boas práticas COGA', 'P2', 'Alto'],
    ['Modo de uma mão (respostas concentradas na metade inferior) para aparelhos grandes', 'Boas práticas', 'P2', 'Médio'],
  ],
},

sec5Close: [
  'Duas observações transversais completam o capítulo. Primeiro, acessibilidade cognitiva para pré-leitores é, na prática, a decisão de design mais influente do produto: manter a regra \u201Cuma pergunta, uma ação\u201D em todas as telas novas (incluída a futura área de contas) é tão importante quanto qualquer critério técnico. Segundo, os itens P0 são de baixo custo e alto impacto e devem ser tratados como débito imediato da próxima versão, pois não dependem do backend e não alteram o visual do jogo para quem não usa tecnologias assistivas.',
],

sec6Intro: [
  'A usabilidade do Conta Comigo deve ser avaliada contra seu usuário mais exigente: a criança de 4 anos que ainda não lê, tem motricidade em formação e alterna momentos de atenção plena e distração total. O princípio que rege o desenho atual — e que este estudo recomenda transformar em regra formal de produto — é que nenhuma tarefa essencial dependa de leitura: toda instrução tem voz (TTS) e ícone, toda ação primária é um botão grande e único na tela, e toda sequência pode ser interrompida sem perder progresso. A avaliação heurística a seguir adapta as heurísticas clássicas de Nielsen ao contexto de pré-leitores e confronta cada princípio com a situação atual do produto.',
],

tabUsab: {
  headers: ['Heurística (adaptada a crianças)', 'Situação atual', 'Recomendação'],
  pcts: [30, 35, 35],
  rows: [
    ['Visibilidade do estado do jogo', 'Pontos de progresso, chip de nível, barra de tempo e combo', 'Manter; padronizar os chips entre popup e página dedicada'],
    ['Correspondência com o mundo da criança', 'Objetos ilustrados, números falados, mascote que reage', 'Estender as reações da mascote à área de contas para reduzir ansiedade'],
    ['Controle do usuário e liberdade', 'Repetir narração, voltar ao início, modo calmo, limite de sessão', 'Adicionar desfazer visual na escolha de perfil (confirmação tátil)'],
    ['Consistência e padrões', 'Mesmos botões e cores nas telas; duelo e loja seguem o padrão', 'Manter; o placar futuro deve reutilizar cartões e chips existentes'],
    ['Prevenção de erros', 'Sem texto livre na criança; respostas discretas; dica após 2 erros', 'Preservar sem texto livre também no apelido online'],
    ['Reconhecimento em vez de memorização', 'Modos com ícone e nome; dificuldade com chips visuais', 'Adicionar miniatura do último modo jogado na tela inicial'],
    ['Flexibilidade e eficiência', 'Atalhos de teclado; dificuldade manual; revisão espaçada', 'Perfis com dificuldade inicial sugerida pela avaliação já cobre'],
    ['Estética minimalista e alegre', 'Cartões grandes, poucos textos, animações moderadas', 'Manter; evitar banners ou barras extras na tela de jogo'],
    ['Ajuda reconhecível', 'Balões da mascote; dica sinalizada', 'Adicionar demonstração guiada de 30 segundos no primeiro uso'],
    ['Recuperação de erros', 'Erro não encerra nada; barra não pune; respiração na fadiga', 'Manter; incluir na tela final o total de pontos explicado em voz'],
  ],
},

sec6Close: [
  'Para validar as melhorias, recomenda-se um protocolo de teste com crianças em duas faixas (4 a 5 anos e 6 a 7 anos), com cinco a oito participantes por faixa, conduzido com consentimento dos responsáveis e na presença de um adulto de confiança. A técnica indicada é a caixa divertida (fun toolkit) com tarefas curtas: entrar no jogo, escolher um modo, responder três questões com a barra ativa, terminar uma rodada e — quando a Fase 1 existir — pedir ajuda ao responsável para criar a conta. As métricas mínimas são taxa de conclusão por tarefa, número de pedidos de ajuda, tempo até a primeira resposta e sinais de frustração ou encantamento (observação estruturada). Uma sessão-piloto com três crianças calibra o roteiro antes da rodada definitiva; os resultados alimentam a priorização das ondas P1 e P2.',
  'Um detalhe operacional merece destaque: o teste deve incluir aparelhos de mão e mesas com tela grande, pois o jogo já atende três densidades distintas (popup de 400 pixels, página dedicada e versão web para escolas), e comportamentos de toque acidental (palma da mão apoiada) só aparecem em aparelhos reais. A descoberta mais comum em produtos desse tipo é um botão acionado por engano durante a comemoração — a área dos confetes deve permanecer livre de controles essenciais.',
],

sec7Intro: [
  'A segurança cibernética é o eixo prioritário deste estudo porque o produto é dirigido a crianças e porque a evolução pretendida adiciona, pela primeira vez, rede e identidade a uma extensão até hoje totalmente offline. O método aplicado é duplo: modelagem de ameaças STRIDE (falsificação, adulteração, repúdio, divulgação de informação, negação de serviço e elevação de privilégio) sobre a superfície atual e futura, e verificação de conformidade com referências OWASP — em especial o Top 10 para aplicações web adaptado ao caso (o backend do placar é uma aplicação web) e as orientações específicas para extensões de navegador. A premissa de trabalho, repetida em todo o capítulo, é que o cliente é não confiável: qualquer regra que importe deve valer no servidor, e qualquer dado que não precise existir não deve existir.',
  'O inventário atual favorece o endurecimento. A extensão não solicita permissões de rede, não executa código remoto, não contém scripts ou manipuladores inline (conformidade CSP do MV3 verificada por varredura automatizada em cada versão), não usa avaliação dinâmica de código (eval ou Function), mantém a CSP padrão sem relaxation e armazena localmente apenas dados de jogo — sem dados pessoais sensíveis no cliente. O progresso sincronizado entre computadores é opcional, fica desligado por padrão e trafega pela infraestrutura de sincronização do próprio navegador, sem servidores do produto. Esse inventário é a base sobre a qual as lacunas a seguir devem ser corrigidas antes da Fase 1 do capítulo 4.',
],

tabStride: {
  headers: ['Ameaça (STRIDE)', 'Exemplo concreto no projeto', 'Controle proposto'],
  pcts: [22, 39, 39],
  rows: [
    ['Falsificação (Spoofing)', 'Extensão clone publicada com visual igual; phishing na tela de login Google', 'Publicação apenas nas lojas oficiais; identidade visual própria; a tela de consentimento é sempre do Google, nunca embutida; comunicação clara na listagem'],
    ['Adulteração (Tampering)', 'Resultado de rodada alterado antes da submissão; biblioteca supabase-js substituída', 'Validação server-side na função de borda; dependência fixada por versão exata com checksum no lockfile; auditoria de pacotes no CI'],
    ['Repúdio (Repudiation)', 'Discussão sobre quem submeteu pontuação indevida', 'Registro mínimo na função de borda (conta, carimbo, veredito) sem dados pessoais extras; retenção curta e definida'],
    ['Divulgação de informação', 'View pública expondo e-mail ou padrão de atividade; log com dados de criança', 'View com whitelist de colunas; nenhum carimbo preciso publicado; e-mail restrito ao auth; sem logs com conteúdo de jogadas'],
    ['Negação de serviço (DoS)', 'Enchente de submissões falsas à função de borda', 'Limites por conta e por IP na edge; fila com degradação amigável; jogo offline nunca afetado'],
    ['Elevação de privilégio', 'Política RLS mal configurada permite escrita em scores alheios', 'RLS testada com matriz de casos; escrita em scores somente via função de borda; revisão por pares de políticas SQL'],
  ],
},

sec73: [
  'A comparação entre o estado atual e a meta de segurança da Fase 1 identifica dez lacunas concretas, priorizadas na Tabela 9. Três merecem justificativa imediata. A primeira é a sanitização de saída: o código atual usa construção de HTML para templates próprios (seguro hoje porque todo conteúdo é do próprio jogo), mas a chegada de apelidos e pontuações vindas do servidor exige que qualquer dado externo seja inserido apenas por criação de nós de texto (textContent), nunca por concatenação em HTML — a regra deve virar padrão de revisão de código. A segunda é a cadeia de suprimentos: a dependência única prevista (supabase-js) deve entrar com versão exata, lockfile commitado, varredura de vulnerabilidades no fluxo de build e revisão do tamanho do pacote; a extensão hoje não tem dependências externas, e mantê-la assim onde possível é política. A terceira é a gestão de tokens: a sessão do Supabase deve viver no armazenamento local da extensão, nunca em localStorage de páginas web, e o logout deve revogar tokens no servidor, não apenas apagá-los localmente.',
],

tabEndurecimento: {
  headers: ['Ação de endurecimento', 'Prioridade', 'Esforço', 'Referência'],
  pcts: [46, 14, 12, 28],
  centers: [1, 2],
  rows: [
    ['Regra de código e revisão: dado externo entra na tela somente por textContent; proibida concatenação de HTML com dados externos', 'P0', 'Baixo', 'OWASP XSS Prevention'],
    ['Varredura CSP automatizada no empacotamento (sem inline, sem remote, sem eval) já praticada — formalizar no CI', 'P0', 'Baixo', 'MV3 platform guidance'],
    ['Permissões mínimas: host_permissions somente para domínios do projeto (Supabase/auth)', 'P0', 'Baixo', 'Menor privilégio'],
    ['Consentimento parental como pré-condição da área de contas, atrás do portão existente', 'P0', 'Médio', 'LGPD art. 14 / COPPA'],
    ['Fixar supabase-js por versão com lockfile, npm audit no build e revisão de pacote', 'P0', 'Médio', 'OWASP Supply Chain'],
    ['Tokens de sessão apenas no storage da extensão; logout com revogação server-side', 'P1', 'Médio', 'OAuth 2.0 BCP'],
    ['Matriz de testes de RLS (dono, anônimo, outra conta) executada no deploy do backend', 'P1', 'Médio', 'OWASP A01'],
    ['Limites e ritmo na função de borda com resposta honesta de erro sem detalhes internos', 'P1', 'Médio', 'OWASP A04'],
    ['Plano de resposta a incidentes simplificado: cancelar temporada, revogar chaves, comunicar famílias', 'P1', 'Baixo', 'Boas práticas'],
    ['Revisão jurídica externa da política infantil e do fluxo de consentimento antes do lançamento público', 'P2', 'Médio', 'LGPD / COPPA'],
    ['Exclusão de conta em dois cliques dentro do produto, com efeito em servidor e cliente', 'P0', 'Médio', 'LGPD arts. 16 e 18'],
    ['Backup/restauração do progresso local já existente (exportar/importar) mantido como recurso de recuperação', 'P2', 'Baixo', 'Resiliência'],
  ],
},

sec75: [
  'A preparação operacional fecha o capítulo. A extensão é atualizada pelas lojas, o que dá ao produto um canal rápido de correção; recomenda-se versionar o placar com um interruptor remoto simples (uma flag de temporada que desliga a competição sem precisar de nova versão da extensão), de modo que um problema de backend nunca contamine o jogo principal. O plano de resposta a incidentes em três atos — conter (desligar a temporada e revogar chaves), corrigir (atualizar função de borda ou extensão) e comunicar (nota às famílias em linguagem simples) — deve ser escrito antes do lançamento, ainda que em uma página, e ensaiado uma vez. Finalmente, a rotina de segurança viva inclui três hábitos baratos: rodar a varredura de CSP e a auditoria de dependências a cada versão, rever as políticas de RLS a cada mudança de esquema e reler a lista de dados coletados a cada nova funcionalidade com uma única pergunta: esta criança precisa que este dado exista?',
],

sec8Intro: [
  'A matriz consolidada reúne, em uma única visão, as ondas de trabalho resultantes dos capítulos anteriores, combinando a mecânica entregue (v2.2.0), a fundação de contas e competição, os backlogs de acessibilidade e usabilidade e o plano de segurança. A ordenação segue um princípio simples e não negociável: segurança e consentimento infantil antecedem qualquer exposição pública; acessibilidade P0 acompanha a fundação; usabilidade e recursos lúdicos evoluem em ciclos curtos com validação com crianças.',
],

tabRoadmap: {
  headers: ['Onda', 'Versão-alvo', 'Entregas principais', 'Critério de aceite'],
  pcts: [14, 14, 44, 28],
  centers: [0, 1],
  rows: [
    ['Onda 0', 'v2.2.0 (concluída)', 'Pontos por rapidez e precisão, barra suave desligável, recordes por modo, painel com total de pontos', 'QA em navegador nos dois motores; mecânica sem punição verificada'],
    ['Onda 1', 'v2.3.0', 'Itens P0 de acessibilidade (aria-live, foco visível, contraste AA), regra textContent no código, varreduras no CI, exclusão/local de dados revistos', 'Leitor de tela anuncia questões; varredura CSP e auditoria verdes'],
    ['Onda 2', 'v2.4.0', 'Fase 1 do capítulo 4: login/logout Google via Supabase nos dois motores, consentimento parental, exclusão de conta, prova de conceito do fluxo no Firefox', 'Conta criada e excluída dentro do produto; nenhum dado pessoal publicado'],
    ['Onda 3', 'v2.5.0', 'Fase 2 do capítulo 4: placar semanal por faixa de nível com validação server-side; itens P1 de acessibilidade e segurança (tokens, RLS, limites)', 'Placar resistente a submissões inválidas na matriz de testes'],
    ['Onda 4', 'v3.0.0', 'Fase 3: turmas de escola por código dos responsáveis e duelos-fantasma; itens P2 selecionados; revisão jurídica externa concluída', 'Competição ativa sem qualquer canal de contato direto'],
  ],
},

sec8Close: [
  'Cada onda deve ser precedida de uma verificação rápida de risco e seguida de um registro de lições, mantendo o caderno de decisões do produto. As ondas não são rígidas quanto a datas: são sequências de dependências — a Onda 2 não começa sem as varreduras da Onda 1, e a Onda 3 não publica nada sem a matriz de testes de RLS. O produto permanece útil e completo em qualquer ponto da sequência, pois o jogo principal nunca depende das ondas seguintes.',
],

sec9: [
  'Quanto à função de tempo entre respostas, a resposta do estudo é a implementação já realizada na versão 2.2.0, com fórmulas explícitas, não punição por tempo esgotado, interruptor parental e pausa automática em overlays — uma mecânica que recompensa rapidez e precisão na medida certa para o público. Quanto ao sistema de cadastro, login e logout com competição, a conclusão é de viabilidade técnica com condições: código do Supabase empacotado, fluxo de identidade nativo do navegador com identificador estável, backend com validação server-side e RLS, e um conjunto de requisitos de proteção infantil (consentimento, minimização, exclusão fácil, ausência total de canais de contato) tratados como critério de lançamento. A recomendação é iniciar pela Fase 1 apenas após a Onda 1 de endurecimento.',
  'Quanto à acessibilidade, o produto parte de uma base sólida e tem um backlog curto e barato no nível P0 (anúncios em regiões vivas, foco visível, contraste AA) que deve ser atendido na próxima versão; os níveis P1 e P2 elevam o produto a um padrão raro em extensões infantis. Quanto à usabilidade, a regra de ouro para pré-leitores — uma pergunta, uma ação, nada depende de leitura — deve continuar orientando cada tela nova, e o protocolo de teste com crianças proposto dá ao produto um método próprio de validação contínua.',
  'Quanto à segurança cibernética, o estudo deixa três legados permanentes: a premissa de que o cliente é não confiável, que agora estrutura o desenho do backend; a regra de sanitização (dado externo entra na tela somente por textContent), que protege o futuro placar contra injeção; e o hábito de varrer CSP e dependências a cada versão, que transforma a segurança de evento em rotina. Com essas bases, o Conta Comigo pode evoluir de um jogo local exemplar para uma experiência competitiva segura entre crianças — na qual o único que atravessa a tela entre um jogador e outro é aquilo que o produto decidiu deixar passar: uma figura, um apelido e uma pontuação.',
],

};


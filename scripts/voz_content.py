# -*- coding: utf-8 -*-
"""Conteúdo PT-BR do Estudo de Voz Natural e Cordial — Conta Comigo (sem emoji)."""

DOC_TITLE = "Estudo de Voz Natural e Cordial"
DOC_SUB = "Conta Comigo - Matemática para Crianças"
KICKER = "ESTUDO DE PRODUTO · EXPERIÊNCIA SONORA"
SUMMARY = ("Como tornar a narração do Conta Comigo mais humana, calorosa e acolhedora "
           "para crianças e adolescentes: diagnóstico do motor atual, quatro caminhos "
           "técnicos comparados e um roteiro de adoção em três fases.")
META = "Estudo interno de produto · Outubro de 2026 · Versão do app analisada: 2.3.0"
FOOTER_META = "Conta Comigo · Estudo de Voz Natural e Cordial"

# (tipo, conteúdo) — tipo: h1, h2, p, quote, table, callout
SECTIONS = [
("h1", "1. Sumário executivo"),
("p", "O público do Conta Comigo é formado por crianças a partir de quatro anos e adolescentes, "
      "uma faixa em que a voz do aplicativo não é um detalhe de acabamento: ela é a principal "
      "companheira de aprendizagem. Quem ainda não lê com fluência depende inteiramente da narração "
      "para entender a pergunta, perceber que errou de forma tranquila e celebrar a conquista. "
      "Este estudo responde à pergunta colocada pelos responsáveis pelo produto: existe possibilidade "
      "de acrescentar uma voz mais humana, com tom mais cordial? A resposta é sim, e existem quatro "
      "caminhos técnicos complementares para chegar lá, com custos, riscos e esforços muito diferentes."),
("p", "O caminho A aprimora o motor já presente no aplicativo, a Web Speech API do navegador, "
      "com escolha automática de vozes naturais, prosódia emulada por pontuação e uma biblioteca "
      "de falas afetuosas. O caminho B aproveita vozes neurais que o próprio sistema operacional "
      "oferece gratuitamente. O caminho C avalia a síntese em nuvem (Google, Microsoft, Amazon e "
      "ElevenLabs), com melhor qualidade acústica porém custos recorrentes, dependência de rede e "
      "exigências de privacidade próprias de um produto infantil. O caminho D propõe áudio humano "
      "pré-gravado para as frases centrais do jogo, o auge do calor humano, com latência zero e "
      "funcionamento offline."),
("p", "A recomendação é uma trilha em três fases: implementar o caminho A na v2.4 (custo zero, "
      "privacidade intacta), oferecer o pacote gravado do caminho D como opção na v2.5 e reservar "
      "a nuvem do caminho C para a era v3.x, apenas com consentimento dos responsáveis e com as "
      "chaves de API protegidas em um servidor. Ao final, o aplicativo ganha uma voz que acolhe, "
      "elogia com conteúdo específico e nunca humilha, sem abrir mão dos três pilares atuais: "
      "gratuito, offline e privado."),

("h1", "2. Diagnóstico da voz atual"),
("p", "Desde a v2.0 o Conta Comigo narra perguntas e feedbacks com a API speechSynthesis do "
      "navegador, uma síntese local que funciona sem internet e sem custo. O motor atual expõe "
      "controles honestos na área dos responsáveis: velocidade, tom, volume e escolha manual da voz "
      "do sistema. Os valores padrão já foram pensados para crianças (velocidade 0,95 e tom 1,15, "
      "levemente agudo), e o idioma da narração acompanha a interface em português, inglês e "
      "espanhol. É uma base sólida: zero permissões de rede, zero dados enviados e funcionamento "
      "idêntico em qualquer computador com navegador moderno."),
("p", "As limitações, porém, são sentidas na escuta. A qualidade acústica depende inteiramente da "
      "voz que o sistema operacional instala: em máquinas sem vozes modernas, a narração soa "
      "robótica e entediante, com entonação plana que não distingue pergunta de festa. A seleção "
      "automática pega a primeira voz portuguesa encontrada, que raramente é a mais bonita do "
      "sistema. As frases de elogio e incentivo são curtas e pouco variadas, e não há pausas "
      "prosódicas planejadas, de modo que frases compostas saem corridas. Nada disso exige trocar "
      "de tecnologia: são melhorias que cabem no motor atual, e é exatamente por onde o caminho A "
      "começa."),
("table", {
  "caption": "Tabela 1. Parâmetros da narração: estado atual e proposta",
  "widths": [0.30, 0.34, 0.36],
  "header": ["Aspecto", "Hoje (v2.3)", "Proposta (v2.4)"],
  "rows": [
    ["Velocidade", "0,95 fixa, ajustável", "0,90 para perfis até 6 anos; ajustável por perfil"],
    ["Tom", "1,15 fixo, ajustável", "Manter 1,15; ajuste por perfil na loja/ajustes"],
    ["Seleção de voz", "Primeira voz do idioma", "Heurística que prefere vozes naturais/neurais"],
    ["Prosódia", "Frase única corrida", "Pausas por pontuação e frases divididas"],
    ["Elogios", "5 frases genéricas", "Biblioteca contextual com dezenas de falas"],
    ["Empatia no erro", "Frases neutras", "Falas de acolhimento sem julgamento"],
  ]}),

("h1", "3. O que torna uma voz humana e cordial"),
("p", "Humanidade, em síntese de voz, é menos uma propriedade acústica e mais uma experiência de "
      "conversa. Três ingredientes dominam a percepção: prosódia expressiva (a melodia da frase, "
      "com subidas em perguntas e descidas em afirmações), ritmo adequado à idade (crianças pequenas "
      "processam fala melhor quando ela é cerca de dez a vinte por cento mais lenta que a conversa "
      "adulta) e calor afetivo (vocabulário carinhoso, elogios específicos e paciência diante do "
      "erro). Uma voz com timbre sintético, mas com boa prosódia e atitude afetuosa, é percebida "
      "como mais humana do que uma voz acusticamente perfeita que lê tudo no mesmo tom."),
("p", "Para o público específico do Conta Comigo, somam-se três princípios de design. Primeiro, "
      "reforço positivo com conteúdo: dizer exatamente o que foi bom (que resposta rápida, você "
      "contou todos os morangos) ensina mais que um simples muito bem, e a literatura de feedback "
      "educacional é consistente quanto a isso. Segundo, erro tratado como parte do caminho: a voz "
      "deve acolher, sugerir tentar de novo e jamais soar decepcionada; sarcasmo, ironia e tom de "
      "cansaço são proibidos por padrão editorial. Terceiro, identidade de personagem: a raposa da "
      "mascote pode ganhar uma voz fixa, apresentada às crianças como uma amiga que brinca de "
      "contar junto, o que aumenta o vínculo e a constância entre dispositivos."),
("p", "Há ainda um cuidado de inclusão que o estudo recomenda transformar em regra: afeto não é "
      "volume emocional máximo. Crianças autistas, com transtornos de processamento auditivo ou "
      "simplesmente mais sensíveis podem preferir entonação calma. Por isso os ajustes manuais de "
      "velocidade, tom e voz existentes continuam acessíveis, e a biblioteca de falas terá variações "
      "calmas por padrão, com intensidade festiva reservada a marcos grandes, como subir de nível ou "
      "vencer o desafio-chefe."),

("h1", "4. Caminho A - Aprimorar a voz local (recomendado na v2.4)"),
("p", "O primeiro pacote de melhorias não adiciona nenhuma dependência: é engenharia carinhosa "
      "sobre a API que já usamos. A peça central é uma heurística de seleção automática de voz. "
      "Hoje o app pega a primeira voz do idioma; a proposta é ranquear todas as vozes portuguesas "
      "do sistema por uma pontuação: nomes que contêm Natural, Neural ou Online recebem bônus "
      "grande; nomes com Google ou Microsoft recebem bônus médio; vozes Locais ganham preferência "
      "de estabilidade; e a escolha manual do responsável sempre vence a heurística. No Microsoft "
      "Edge e em sistemas bem equipados, essa heurística sozinha já eleva a narração a vozes "
      "neurais de qualidade comercial, sem custo algum."),
("p", "A segunda peça é prosódia emulada. A Web Speech API não suporta SSML (a linguagem de "
      "marcação de fala) nos navegadores atuais, mas a pontuação comum produz pausas reais: vírgula "
      "pausa pouco, ponto pausa mais, reticências criam suspense e interrogação levanta a entonação. "
      "O motor passará a formatar as falas pensando nisso e, para frases compostas, a enfileirar "
      "duas ou três utterances com pausas calculadas entre elas, algo que o objeto de fala já "
      "permite fazer em sequência. O resultado é uma narração com respiração, em vez do bloco "
      "contínuo atual."),
("p", "A terceira peça é a biblioteca de falas cordiais, ampliada e contextual. Em vez de cinco "
      "elogios genéricos, dezenas de frases organizadas por situação: acerto com muita rapidez, "
      "combo, acerto depois de errar (valorizando a persistência), fim de rodada com recorde, "
      "subida de nível, incentivo antes do desafio-chefe e acolhimento no erro. As frases citam o "
      "nome do perfil e os elementos da questão (maçãs, balões, moedas) quando possível, o que dá "
      "à criança a sensação de conversa real. A Tabela 5 no fim deste estudo traz exemplos antes e "
      "depois. Por fim, velocidade e tom passam a ser salvos por perfil de jogador, porque o ritmo "
      "ideal de uma criança de quatro anos não é o de um irmão de nove."),
("callout", "Custo: zero. Rede: nenhuma. Privacidade: intacta. Esforço: pequeno-médio. Impacto: alto."),

("h1", "5. Caminho B - Vozes neurais do sistema (grátis, sem código novo)"),
("p", "Este caminho é, na prática, um complemento do anterior. Os sistemas atuais já trazem vozes "
      "neurais sem custo: o Microsoft Edge expõe as vozes Online Natural da Azure (como a Francisca "
      "natural em português do Brasil) diretamente na speechSynthesis; o Windows oferece pacotes de "
      "vozes naturais instaláveis nas configurações; o macOS traz vozes Siri de alta qualidade; e o "
      "Android distribui o Google TTS com vozes modernas. Como todas aparecem na mesma lista de "
      "vozes que o aplicativo já consulta, a heurística do caminho A as encontra automaticamente, "
      "sem uma linha de código adicional."),
("p", "As ressalvas são três. Primeiro, vozes marcadas como Online precisam de conexão ativa para "
      "sintetizar, embora a chamada continue sendo feita pelo sistema operacional, sem qualquer "
      "acesso do aplicativo ao tráfego; o motor deve detectar falha e cair silenciosamente para uma "
      "voz local. Segundo, o Firefox expõe apenas vozes locais do sistema em muitas plataformas, "
      "portanto a experiência varia entre navegadores, o que já acontece hoje e não piora. Terceiro, "
      "a disponibilidade depende do sistema do usuário: cabe ao aplicativo oferecer, na área dos "
      "responsáveis, um botão ouvir amostra para a família escolher a melhor voz instalada. Com "
      "isso, o caminho B entrega o melhor custo-benefício do mercado: qualidade neural, custo zero "
      "e nenhuma mudança de arquitetura."),

("h1", "6. Caminho C - Síntese em nuvem (adiar para a era v3.x)"),
("p", "As APIs de nuvem produzem as vozes mais naturais disponíveis hoje, com estilos emocionais "
      "escolhíveis, como alegre e calmo. Para um produto infantil, porém, este caminho carrega "
      "exigências que o momento atual do projeto não justifica. A primeira é a chave de API: síntese "
      "em nuvem exige credenciais, e credenciais dentro de uma extensão são, por definição, "
      "expostas ao cliente; a arquitetura correta usa uma função serverless como proxy (o estudo de "
      "expansão de v2.2 já desenhou esse caminho com Supabase Edge Functions), o que pressupõe "
      "infraestrutura, custos variáveis e monitoramento. A segunda é privacidade e conformidade: "
      "embora apenas o texto das frases seja enviado, enviar qualquer dado de uma criança para "
      "serviços de terceiros exige base legal e consentimento dos responsáveis, além de avaliação "
      "dos termos de cada provedor para uso infantil (COPPA nos Estados Unidos, LGPD artigo 14 no "
      "Brasil). A terceira é a dependência de rede, que fere o pilar offline do produto."),
("table", {
  "caption": "Tabela 2. Provedores de síntese em nuvem (valores aproximados; confirmar preços atuais)",
  "widths": [0.20, 0.28, 0.18, 0.34],
  "header": ["Provedor", "Vozes pt-BR de destaque", "Preço indicativo", "Observações para o produto"],
  "rows": [
    ["Google Cloud TTS", "Neural2/Studio pt-BR", "baixo a médio por milhão de caracteres", "Qualidade excelente; Studio tem timbres mais naturais e preço bem maior"],
    ["Microsoft Azure Speech", "Francisca, Thalita, Elza (neurais)", "médio por milhão de caracteres", "Estilos falados (alegre/calmo); mesma família das vozes Natural do Edge"],
    ["Amazon Polly", "Camila, Luciana", "médio por milhão de caracteres", "Boa qualidade; contexto de fala conversacional"],
    ["ElevenLabs", "Clonagem e vozes comunitárias", "assinatura mensal", "Qualidade máxima percebida; custo por uso e termos exigem análise jurídica para crianças"],
  ]}),
("p", "A recomendação técnica é clara: manter o caminho C fora do escopo imediato, mas deixar a "
      "porta aberta. O desenho futuro saudável é um modo opt-in na área dos responsáveis, com "
      "consentimento explícito, narração enviada como texto puro sem qualquer identificador da "
      "criança, cache local das frases já sintetizadas para reduzir custo e funcionamento parcial "
      "offline, e um limite mensal de caracteres configurável. Quando o ranking online da v3.x "
      "existir (com a infraestrutura do estudo anterior), o custo marginal de oferecer voz em nuvem "
      "cai muito, pois o proxy já estará lá."),

("h1", "7. Caminho D - Áudio humano pré-gravado (o calor máximo)"),
("p", "Nenhuma síntese supera, em afeto percebido, uma voz humana de verdade gravada com carinho. "
      "O caminho D propõe produzir um pacote de áudio oficial do Conta Comigo: uma atriz de voz "
      "(ou voz própria da equipe) gravando as falas centrais do jogo nas três saudações, nos "
      "elogios contextuais, nos incentivos e nos avisos, em interpretação cordial e calma. São "
      "cerca de oitenta a cento e vinte frases curtas. Compressão moderna Ogg Opus, mono, em "
      "qualidade de fala, ocupa poucos quilobytes por segundo, de modo que o pacote completo cabe "
      "em três a oito megabytes, perfeitamente aceitável dentro de uma extensão ou como "
      "complemento opcional."),
("p", "A arquitetura recomendada é híbrida: as frases fixas tocam do arquivo gravado com latência "
      "zero e funcionamento offline, enquanto os trechos dinâmicos (números da questão, nomes dos "
      "itens) continuam na síntese local do sistema. Splicing de números gravados um a um soa "
      "recortado e deve ser evitado; a mistura frase gravada mais número sintético, com pequena "
      "pausa entre eles, soa natural e é técnica consolidada. O custo é único de produção (sessão "
      "de estúdio, edição e revisão), sem mensalidades e sem riscos de privacidade, pois nenhum "
      "dado sai do dispositivo. A manutenção exige regravação quando surgirem novos modos de jogo, "
      "o que é previsível e barato se a biblioteca de falas do caminho A for bem organizada."),
("callout", "Pacote estimado: 80 a 120 frases · 3 a 8 MB em Ogg Opus · latência zero · 100% offline."),

("h1", "8. Recomendação, riscos e próximos passos"),
("p", "A trilha recomendada equilibra ganho imediato, custo e risco. A Fase 1 (v2.4) entrega o "
      "caminho A completo: heurística de vozes naturais, prosódia por pontuação e fila de frases, "
      "biblioteca cordial contextual e preferências de voz por perfil, além do botão ouvir amostra "
      "na área dos responsáveis. É a maior melhoria percebida por unidade de esforço de todo este "
      "estudo e não altera nenhuma garantia de privacidade. A Fase 2 (v2.5) produz o pacote gravado "
      "do caminho D para as frases centrais em português, com detecção automática do pacote e queda "
      "elegante para síntese quando ausente; versões em inglês e espanhol podem vir depois conforme "
      "adesão. A Fase 3 (v3.x) avalia a nuvem com o proxy do ranking online, apenas opt-in e com "
      "consentimento, mantendo a voz local como padrão de fábrica."),
("table", {
  "caption": "Tabela 3. Comparação dos quatro caminhos",
  "widths": [0.16, 0.21, 0.21, 0.21, 0.21],
  "header": ["Critério", "A: local melhorado", "B: vozes do sistema", "C: nuvem", "D: gravado"],
  "rows": [
    ["Qualidade", "boa a muito boa", "muito boa (quando presente)", "excelente", "excelente afeto"],
    ["Custo", "zero", "zero", "variável + infra", "único de produção"],
    ["Offline", "sim", "parcial", "não", "sim"],
    ["Privacidade", "nenhum dado sai", "nenhum dado sai (do app)", "requer consentimento", "nenhum dado sai"],
    ["Esforço", "pequeno-médio", "quase zero (herda A)", "grande", "médio"],
    ["Recomendação", "v2.4 agora", "v2.4 (automático)", "v3.x opt-in", "v2.5 opcional"],
  ]}),
("p", "Os riscos a monitorar são conhecidos e administráveis. Excesso de afeto pode soar artificial "
      "(vale testar com crianças reais e observar se a voz encanta ou distrai); festas sonoras "
      "frequentes podem cansar, por isso a intensidade é reservada a marcos; perfis sensoriais "
      "diversos pedem alternativa calma e controles manuais, que já existem; e qualquer migração "
      "para nuvem deve passar, antes, pela avaliação de privacidade descrita no estudo de expansão "
      "e segurança, incluindo política atualizada e registro do consentimento. Com essas guardas, "
      "a voz do Conta Comigo evolui de leitora de enunciados para aquilo que o produto sempre "
      "quis que ela fosse: uma amiga gentil que brinca de contar junto."),
("table", {
  "caption": "Tabela 4. Exemplos da biblioteca de falas (antes e depois)",
  "widths": [0.22, 0.34, 0.44],
  "header": ["Situação", "Fala atual", "Proposta cordial (Fase 1)"],
  "rows": [
    ["Acerto comum", "Isso mesmo!", "Isso mesmo, Ana! Você juntou tudo direitinho."],
    ["Resposta rápida", "(nenhuma)", "Uau, que mente rápida! Você nem esperou a barra descer."],
    ["Erro", "Quase! Tenta de novo.", "Quase! Conta os morangos comigo, um por um. Eu sei que você consegue."],
    ["Combo", "Combo x3!", "Três seguidas! A raposa está dançando de alegria com você."],
    ["Fim de rodada", "Você ganhou 12 estrelas!", "Doze estrelinhas! Guardamos todas no seu céu. Até amanhã, campeã."],
  ]}),
]

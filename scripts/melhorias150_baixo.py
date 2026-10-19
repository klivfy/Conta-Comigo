# -*- coding: utf-8 -*-
"""150 melhorias (edição 2026) — BAIXO impacto, 50 itens inéditos."""

BAIXO150 = [
# ---------- Interface e Navegação (14) ----------
("Interface e Navegação", "Numpad físico mapeado", "Garantir que as teclas do teclado numérico do notebook (0-9 e Enter) respondam igualmente às teclas da linha de cima nas respostas digitáveis.", "Pequeno", "v2.4-v2.5"),
("Interface e Navegação", "Telas ultra-wide", "Ajuste de largura máxima do contêiner principal para monitores ultralargos, evitando cartões esticados demais e mantendo o jogo centralizado e confortável.", "Pequeno", "v2.4-v2.5"),
("Interface e Navegação", "Margem segura para notch", "Respeitar safe-area-inset em telas recortadas e no modo tela cheia de tablets, para que nada fique escondido atrás de câmeras ou bordas do aparelho.", "Pequeno", "v2.4-v2.5"),
("Interface e Navegação", "Título da aba dinâmico", "O título da janela mostra o momento (12 estrelas · Conta Comigo, ou Pausado · Conta Comigo), ajudando a achar a janela certa entre muitas abas abertas.", "Pequeno", "v2.4-v2.5"),
("Interface e Navegação", "Layout compacto 1366px", "Preset de espaçamentos para notebooks comuns de 1366x768, garantindo que a tela inicial e o jogo caibam sem rolagem em uma das telas mais usadas nas escolas.", "Pequeno", "v2.4-v2.5"),
("Interface e Navegação", "Overlay de atalhos (tecla ?)", "Pressionar ? abre um cartão com todos os atalhos de teclado organizados por grupo, acessível também por um botão discreto nas opções.", "Pequeno", "v2.4-v2.5"),
("Interface e Navegação", "ESC fecha overlays", "Tecla ESC fecha qualquer sobreposição aberta (fim de rodada, dica, loja), comportamento padrão esperado por quem navega com o teclado.", "Pequeno", "v2.4-v2.5"),
("Interface e Navegação", "Busca de modos na home", "Campo discreto de busca que filtra os cartões de modo enquanto se digita (escrever dino já aponta para os modos de bicho), útil à medida que a lista crescer.", "Pequeno", "v2.6-v2.9"),
("Interface e Navegação", "Trocar perfil por teclado", "Ctrl+1 a Ctrl+4 alternam diretamente entre os perfis com aviso rápido de confirmação, para famílias que dividem o mesmo aparelho em sequência.", "Pequeno", "v2.6-v2.9"),
("Interface e Navegação", "Grade 3 colunas em telas médias", "Nos monitores entre 700 e 1000 pixels, a grade de modos usa 3 colunas equilibradas em vez de 2 ou 6, evitando cartões gigantes ou espremidos.", "Pequeno", "v2.4-v2.5"),
("Interface e Navegação", "Scroll suave no painel", "Rolagem com transição calma nas opções e no painel, evitando saltos bruscos ao alternar seções e mantendo a posição atual ao fechar cartões.", "Pequeno", "v2.6-v2.9"),
("Interface e Navegação", "Números tabulares nos placares", "Usar dígitos de largura fixa nos contadores de pontos e estrelas para que os números não dancem de lado ao atualizar durante o jogo.", "Pequeno", "v2.6-v2.9"),
("Interface e Navegação", "Nível no título da janela", "Ao subir de nível durante o jogo, o título da janela acompanha (Nível 3 · Conta Comigo), detalhe que ajuda as famílias a acompanharem de longe.", "Pequeno", "v2.6-v2.9"),
("Interface e Navegação", "Dica por inatividade gentil", "Depois de 30 segundos parado numa questão, a raposa oferece uma dica leve por voz (vamos contar juntos?), sem pontuar negativamente e com limite de vezes.", "Pequeno", "v2.6-v2.9"),
# ---------- Configurações Avançadas (5) ----------
("Configurações Avançadas", "Velocidade das animações", "Um único controle (0,5x a 1,5x) que acelera ou desacelera transições e confetes de forma global, para quem acha o jogo lento ou muito agitado.", "Pequeno", "v2.6-v2.9"),
("Configurações Avançadas", "Layout das respostas (2x2 ou 1x4)", "Escolher se as quatro respostas aparecem em grade quadrada ou em fileira, com memorização por perfil, respeitando preferências visuais e de alcance do braço.", "Pequeno", "v2.4-v2.5"),
("Configurações Avançadas", "Renomear modos", "A família pode dar apelidos aos modos (Somar vira Conta das balas), que aparecem nos cartões da tela inicial para aproximar o vocabulário da criança.", "Pequeno", "v2.4-v2.5"),
("Configurações Avançadas", "Questões por rodada configurável", "Escolher 3, 5 ou 8 questões por rodada nas preferências, mantendo 5 como padrão, para sessões curtas de atenção limitada ou treinos mais longos.", "Pequeno", "v2.4-v2.5"),
("Configurações Avançadas", "Sliders de volume separados", "Além dos ligar/desligar por tipo, controles independentes de narração, efeitos e ambiente, com teste ao vivo ao arrastar cada um deles.", "Pequeno", "v2.6-v2.9"),
# ---------- Segurança e Privacidade (3) ----------
("Segurança e Privacidade", "Cadeado que treme ao errar", "Feedback visual honesto no portão dos responsáveis: o cadeado balança e pisca vermelho ao recusar a senha, sem som agudo, deixando claro que a tentativa não foi aceita.", "Pequeno", "v2.4-v2.5"),
("Segurança e Privacidade", "Registro de acesso dos responsáveis", "No cartão de segurança, mostrar a data da última entrada bem-sucedida no portão, ajudando o adulto a perceber acessos inesperados ao painel.", "Pequeno", "v2.6-v2.9"),
# ---------- Relatórios e Acompanhamento (5) ----------
("Relatórios e Acompanhamento", "Sugestão de melhor horário", "Com base no histórico, o painel nota o horário de prática mais frequente e sugere encaixar o lembrete perto dele (você costuma jogar às 18h30).", "Pequeno", "v3.x"),
("Relatórios e Acompanhamento", "Dias desde a instalação", "Contador de companheirismo no painel (há 47 dias nessa jornada) com a data de instalação guardada no perfil, sem qualquer tom de cobrança.", "Pequeno", "v2.4-v2.5"),
("Relatórios e Acompanhamento", "Última jogada no perfil", "O popover de perfis mostra o dia da última partida de cada jogador (hoje, ontem, há 3 dias), facilitando a rodada da vez em casas com mais de uma criança.", "Pequeno", "v2.4-v2.5"),
("Relatórios e Acompanhamento", "Maior combo no painel", "Estrelinha de recorde de combo (sequência de acertos de primeira) ao lado das demais estatísticas, com a data do feito para um orgulho duradouro.", "Pequeno", "v2.4-v2.5"),
("Relatórios e Acompanhamento", "Lembrete mensal de backup", "Uma vez por mês, um aviso gentil no painel sugere exportar o progresso, com botão que faz o export em dois toques e opção de silenciar por seis meses.", "Pequeno", "v2.4-v2.5"),
# ---------- Polimento Visual (9) ----------
("Polimento Visual", "Balão com efeito máquina de escrever", "O texto do balão da raposa aparece letra por letra com som suave de tique (desligável), dando vida à fala sem atrasar a leitura.", "Pequeno", "v2.6-v2.9"),
("Polimento Visual", "Adereços no duelo", "Os avatares dos dois jogadores do duelo usam os chapéus e óculos comprados na loja, levando a personalidade de cada criança para a competição.", "Pequeno", "v2.6-v2.9"),
("Polimento Visual", "Coração no balão", "Ao acertar de primeira, um coraçãozinho pequeno sobe do balão da raposa junto com o +2, reforçando carinho no melhor resultado sem virar confete.", "Pequeno", "v2.4-v2.5"),
("Polimento Visual", "Transição de retorno com zoom", "Voltar da rodada para a tela inicial com um zoom suave para trás, conectando as telas e dando a sensação de um espaço contínuo.", "Pequeno", "v3.x"),
("Polimento Visual", "Ícone do modo no balão", "O balão da raposa exibe o ícone do modo atual ao lado do texto (moeda no Dinheiro, relógio nas Horas), ancorando visualmente o contexto da fala.", "Pequeno", "v2.6-v2.9"),
("Polimento Visual", "Raposa dorme na espera", "Depois de 2 minutos parados na tela inicial, a mascote boceja e dorme (zZz suaves) e acorda alegre ao primeiro toque, detalhe encantador de vida no app.", "Pequeno", "v2.6-v2.9"),
("Polimento Visual", "Tick sonoro de tecla", "Som curtinho e calmo ao navegar as respostas com o teclado, feedback para quem não enxerga o foco se mover, desligável junto com os efeitos.", "Pequeno", "v2.6-v2.9"),
("Polimento Visual", "Abertura pulável", "Animação curta de entrada com a raposa correndo (dois segundos) que roda só na primeira abertura do dia e é sempre ignorável com um toque.", "Pequeno", "v3.x"),
# ---------- Diversão e Easter Eggs (3) ----------
("Diversão e Easter Eggs", "Carinho na raposa", "Ficar dois segundos com o dedo sobre a mascote dispara um carinho (corações e ronronar suave), um mimo escondido que recompensa afeto e atenção.", "Pequeno", "v2.4-v2.5"),
("Diversão e Easter Eggs", "Sons sazonais", "Efeitos discretos por época do ano (grilos no inverno, fogos no réveillon, chuva em abril) ativados automaticamente no tema atual e desligáveis nas opções.", "Pequeno", "v2.6-v2.9"),
("Temas e Cosméticos", "Bandeira do idioma no chip", "O chip de idioma exibe a bandeirinha do idioma ativo, leitura imediata para famílias multilíngues que alternam entre português, inglês e espanhol.", "Pequeno", "v2.4-v2.5"),
("Temas e Cosméticos", "Tamanho do texto do balão", "Escolher entre três tamanhos para a fala da raposa (pequeno, normal, grande), ajudando leitores iniciantes e adaptações visuais individuais.", "Pequeno", "v2.6-v2.9"),
# ---------- Acessibilidade, Voz, Plataforma e Qualidade (11) ----------
("Acessibilidade e Inclusão", "Passe o mouse para ouvir", "No desktop, passar o cursor sobre um objeto ou resposta faz a raposa sussurrar o número (com pequeno atraso anti-ruído), apoio extra para pré-leitores.", "Pequeno", "v2.6-v2.9"),
("Acessibilidade e Inclusão", "Seguir o sistema", "Opção de tema e contraste que espelham automaticamente a preferência do aparelho (claro, escuro, alto contraste), incluindo troca ao vivo quando o sistema muda.", "Pequeno", "v2.4-v2.5"),
("Voz, Som e Narração", "Retry automático de voz", "Se a síntese falhar (voz removida, erro do motor), tentar a próxima voz compatível automaticamente e avisar só se todas falharem, em vez de simplesmente calar.", "Pequeno", "v2.4-v2.5"),
("Gamificação e Motivação", "Paginação do mural", "Dividir o mural de conquistas em páginas de 8 cartões com bolinhas de navegação, mantendo o espírito de vitrine sem virar uma parede infinita.", "Pequeno", "v2.4-v2.5"),
("Gamificação e Motivação", "Atalho de revisão pós-rodada", "Quando a rodada termina com 2 ou mais erros, o cartão final ganha o botão Revisar erros agora, que abre direto a fila de revisão daquele conteúdo.", "Pequeno", "v2.4-v2.5"),
("Gamificação e Motivação", "Botão repetir rodada no fim", "No cartão final, um botão secundário de jogar de novo com as mesmas configurações, sem voltar à tela inicial, encurtando o ciclo de prática.", "Pequeno", "v2.4-v2.5"),
("Acessibilidade e Inclusão", "Contagem por vibração", "Nos aparelhos compatíveis, cada item contado dispara uma vibração curtinha (uma por objeto), criando a correspondência tátil um-para-um para quem conta pelo toque e pela audição.", "Pequeno", "v2.6-v2.9"),
("Plataforma e Arquitetura", "Ícone 512px e versão mono", "Gerar ícone em 512 pixels para lojas que aceitam o tamanho maior e uma versão monocromática para barras de sistema que exigem ícone de contorno.", "Pequeno", "v2.4-v2.5"),
("Plataforma e Arquitetura", "Pedir avaliação com educação", "Depois de marcos positivos (nunca após erros), um cartão discreto convida a avaliar a extensão na loja, com opção de nunca mostrar de novo.", "Pequeno", "v2.6-v2.9"),
("Plataforma e Arquitetura", "Nota de acessibilidade na listagem", "Incluir na descrição da loja (e no guia de publicação) um resumo honesto dos recursos de acessibilidade e dos limites atuais, orientando famílias antes de instalar.", "Pequeno", "v2.4-v2.5"),
("Plataforma e Arquitetura", "Capturas da loja em HiDPI", "Script de capturas rodando com proporção de pixel 2 para imagens de listagem mais nítidas, atualizando o kit de publicação junto com cada versão.", "Pequeno", "v2.4-v2.5"),
("Qualidade e Ferramentas", "Parâmetros de depuração na URL", "Modo de teste por endereço (nivel=3, modo=somar, sem tempo) para acessar estados específicos sem navegar manualmente, acelerando o QA e as demonstrações.", "Pequeno", "v2.4-v2.5"),
]

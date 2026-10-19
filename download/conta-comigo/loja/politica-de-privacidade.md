# Política de Privacidade — Conta Comigo

Última atualização: 19 de outubro de 2026

## Princípio geral

O Conta Comigo é uma extensão de navegador educativa destinada a crianças. Ela
foi construída com **privacidade por arquitetura**: absolutamente nenhum dado
pessoal é coletado, transmitido, vendido ou compartilhado. Não existem
servidores do aplicativo, contas de usuário, anúncios, rastreadores ou
ferramentas de análise.

## Dados armazenados no seu dispositivo

Para funcionar, o jogo salva localmente no navegador — usando as APIs
`chrome.storage.local` (extensão) e `localStorage` (versão web) — o seguinte
conteúdo, exclusivamente no seu computador:

- **Progresso do jogo**: estrelas, níveis por operação, respostas certas e
  erradas, conquistas, figurinhas e itens comprados na loja do jogo;
- **Perfis de jogadores**: até 4 perfis locais, contendo apenas um nome
  (apelido) e um avatar de emoji escolhidos por quem usa;
- **Preferências**: idioma, tema, opções de som, voz e acessibilidade,
  dificuldade, metas e limites de sessão;
- **Dados de uso local**: tempo de jogo acumulado e resultados de rodadas,
  usados apenas para o painel dos responsáveis exibido dentro da própria
  extensão.

Esses dados **nunca saem do dispositivo** e podem ser apagados a qualquer
momento na área dos responsáveis ("Apagar tudo") ou desinstalando a extensão.

## Sincronização opcional

Por opção dos responsáveis, é possível ativar a sincronização do progresso entre
computadores. Nesse caso o jogo utiliza a API nativa `chrome.storage.sync` do
próprio navegador: os dados trafegam pela conta do usuário no navegador
(Chrome/Firefox), sob o controle daquele fornecedor, e continuam fora do alcance
do Conta Comigo — nenhum servidor nosso participa desse fluxo, porque não
existem servidores nossos.

## Permissões solicitadas

- **storage**: necessária para salvar o progresso e as preferências no
  navegador. É a única permissão do jogo.

## Crianças

O produto é destinado a famílias com crianças e está em conformidade com boas
práticas para produtos infantis: nenhuma coleta de dados de crianças, nenhuma
publicidade direcionada, nenhuma compra dentro do aplicativo e nenhuma
transferência para terceiros.

## Alterações desta política

Mudanças nesta política serão acompanhadas de nova data e de notas de versão na
loja em que a extensão estiver publicada.

## Contato

Dúvidas sobre privacidade podem ser tratadas com o publicador da extensão por
meio do canal indicado na página da loja em que ela foi instalada.

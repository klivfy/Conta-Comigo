# ADR-001: Progresso consistente entre páginas e sincronização dentro da cota

**Status:** Proposto
**Data:** 28/10/2026
**Quem decide:** Klivfy Tecnologia (produto) e quem mantém o `engine.js`

## Contexto

O progresso da criança (estrelas, níveis, conquistas, perfis) e as configurações ficam num único objeto `DB`, gravado inteiro por `saveState()` em `localStorage` (e, conforme a plataforma, em `chrome.storage.local`, `Preferences` no iOS e, se ligado, `chrome.storage.sync`).

Três páginas carregam esse objeto **uma vez** (`initDB`) e depois gravam a cópia que têm na memória:

| Página | Quando grava |
|---|---|
| Jogo (`game.html`, `popup.html`, PWA, Electron, iOS) | a cada resposta, fim de rodada, compra |
| Painel dos responsáveis (`options.html`) | a cada configuração alterada |
| Nova aba (`newtab.html`, só extensão) | ao acertar o desafio (+1 ⭐) |

Problemas confirmados na revisão de 28/10/2026:

1. **Perda de progresso.** Com o painel aberto desde antes, mudar o volume regravou o banco antigo: a criança tinha passado de 10 para 35 ⭐ e voltou a **10 ⭐** (reproduzido com Playwright). Uma nova aba deixada aberta faz o mesmo. No MV3, o service worker esquece a janela do jogo depois de ~30 s parado e abre uma segunda janela, o que piora o problema.
2. **Sincronização que falha em silêncio.** O banco vai num único item `cc_state_sync`. O `storage.sync` do Chrome e do Firefox aceita **8.192 bytes por item** (e 102.400 no total). Um perfil típico ocupa ~4,9 KB; quatro perfis, ~18,5 KB. Acima de 8 KB o `set` falha e o erro é descartado.

Forças em jogo:
- Sem servidor, sem conta e sem dependências em tempo de execução (`CLAUDE.md`).
- O mesmo `engine.js` roda em extensão, PWA, Electron e iOS.
- Os segredos da senha nunca saem do aparelho (`shareableDB` / `keepLocalSecrets`).
- O backup em arquivo continua sendo a garantia final.

## Decisão

1. **Ler, mudar e gravar.** Toda gravação passa por `mutate(fn)`, que relê o banco mais novo do `localStorage` (síncrono em todas as plataformas), aplica só a mudança da página e grava. O jogo, o painel e a nova aba deixam de gravar a cópia antiga.
2. **Ouvir as outras páginas.** Todas escutam o evento `storage` (mesma origem: abas da PWA e páginas da extensão) e adotam o banco mais novo quando não estão no meio de uma rodada. O jogo adota ao voltar para a tela inicial.
3. **Sincronização por perfil e com cota.** Trocar `cc_state_sync` por `cc_sync_meta` (configurações compartilháveis e lista de perfis) mais um item `cc_sync_<id>` por perfil. Cada item é cortado para caber em 7.500 bytes (revisões e semanas antigas saem primeiro). Conferir `chrome.runtime.lastError` e mostrar no painel "Sincronizado às 14:32" ou "Não coube: 9,1 KB".
4. **Janela única do jogo.** `background.js` procura a janela existente por URL (`chrome.tabs.query({ url: <game.html> })`) em vez de confiar na variável em memória.

## Opções consideradas

### Opção A: ler, mudar e gravar + evento `storage` (escolhida)
| Dimensão | Avaliação |
|---|---|
| Complexidade | Baixa: uma função `mutate(fn)`, um ouvinte e as chamadas trocadas nas 3 páginas |
| Custo | ~1–2 dias, com testes em `tests/` (dois contextos com o mesmo `localStorage`) |
| Escala | Suficiente: poucas páginas, gravações de poucos KB |
| Familiaridade | Alta: mesmo padrão de funções globais já usado |

**Prós:** resolve o caso real (gravações em momentos diferentes); funciona em todas as plataformas; não muda o formato do backup.
**Contras:** duas gravações no mesmo milissegundo em páginas diferentes ainda podem se cruzar (raro com uma criança por aparelho); cada mudança precisa ser escrita como função.

### Opção B: uma página dona do progresso (mensagens)
| Dimensão | Avaliação |
|---|---|
| Complexidade | Média/alta: `BroadcastChannel` ou `chrome.runtime` entre páginas, e um modo "sem dono" quando o jogo está fechado |
| Custo | ~4–5 dias |
| Escala | Boa |
| Familiaridade | Média |

**Prós:** uma única fonte de verdade enquanto o jogo está aberto.
**Contras:** dois caminhos de gravação (com e sem dono); mais código para iOS e Electron, que nem têm o problema.

### Opção C: registro de eventos com fusão (log + CRDT simples)
| Dimensão | Avaliação |
|---|---|
| Complexidade | Alta |
| Custo | > 1 semana, migração do formato do backup |
| Escala | A melhor (resolve também a sincronização entre aparelhos) |
| Familiaridade | Baixa |

**Prós:** nenhuma perda mesmo com gravações simultâneas, e a sincronização vira fusão de eventos.
**Contras:** muda o formato do banco e do backup (`normalizeDB` precisaria validar eventos); desproporcional para uma criança por aparelho.

### Opção D (sincronização): comprimir o banco num item só
**Prós:** pouca mudança. **Contras:** um JSON de 4 perfis comprimido ainda pode passar de 8 KB; exige biblioteca de compressão (o projeto não tem dependências em tempo de execução) e continua tudo-ou-nada.

## Análise dos trade-offs

O risco real hoje é **tempo**: uma página com cópia velha gravando minutos ou horas depois. A Opção A elimina esse risco com pouco código. A janela de colisão que sobra é de milissegundos, e o uso é de uma criança por aparelho. As opções B e C compram garantias que esse uso não pede, ao custo de mudar o formato do backup (C) ou de manter dois caminhos de gravação (B). Para a sincronização, dividir por perfil respeita a cota sem dependências e deixa a falha visível, que é o que mais pesa para os pais: hoje eles acreditam que está sincronizando.

## Consequências

- **Fica mais fácil:** abrir o painel com o jogo rodando; usar a nova aba; confiar na sincronização (ou saber que ela não coube).
- **Fica mais difícil:** gravar "por fora": toda mudança de estado passa por `mutate(fn)`. Uma regra de revisão de código cobre isso.
- **Rever depois:** se um dia houver várias crianças no mesmo aparelho ao mesmo tempo (escola), reavaliar a Opção C. Também conferir o limite total de 100 KB do `storage.sync` com 4 perfis.

## Ações

1. [ ] `engine.js`: `freshDB()` e `mutate(fn)`; `saveState` só grava o que `mutate` devolve.
2. [ ] `ui.js`, `options.js`, `newtab.js`: trocar mudanças diretas em `P()`/`G()` + `saveState()` por `mutate(...)`.
3. [ ] Ouvinte de `storage` nas 3 páginas, adotando o banco quando não houver rodada em andamento.
4. [ ] Sincronização por perfil (`cc_sync_meta`, `cc_sync_<id>`), corte a 7.500 bytes, `lastError` conferido e status no painel (chaves novas em pt, en e es).
5. [ ] `background.js`: achar a janela do jogo por URL.
6. [ ] Testes em `tests/`: duas páginas com o mesmo armazenamento (o caso das 10 → 35 → 10 ⭐), tamanho de cada item de sincronização com 4 perfis cheios e leitura do formato antigo `cc_state_sync`.
7. [ ] Atualizar a política de privacidade só se o texto sobre sincronização mudar (hoje ele continua correto).

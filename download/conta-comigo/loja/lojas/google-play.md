# Google Play — Conta Comigo 2.6.2 (Android)

Painel: <https://play.google.com/console> · Pacote: o **AAB** gerado por *Actions → Android* (`conta-comigo-android-2.6.2`), assinado com a chave de upload. Ative o **Play App Signing**.

## Antes do primeiro envio (obrigatório)

1. Gere a chave de upload nova e guarde-a fora do Git (veja `PLANO-DE-ACAO.md`, fase A) e configure os 4 *secrets* do workflow.
2. Depois do primeiro envio, em *Integridade do app → Assinatura de apps* copie o **SHA-256 da chave de assinatura do app** (a do Google) e acrescente **também** em `native/android/assetlinks.json`, `strings.xml` e `twa-manifest.json`. Sem isso a barra de endereço do navegador aparece dentro do app.
3. Conta de desenvolvedor (taxa única de US$ 25). Contas pessoais criadas depois de nov/2023 precisam de teste fechado com pelo menos 12 testadores por 14 dias antes da produção.

## Dados gerais

| Campo | Valor |
|---|---|
| Tipo | Aplicativo (não jogo) · Categoria **Educação** |
| Nome do pacote | `com.klivfy.contacomigo` |
| Preço | Gratuito, sem anúncios, sem compras no app |
| Idioma padrão | Português (Brasil) — pt-BR; adicionar en-US e es-419 (e es-ES) |
| URL da política de privacidade | https://klivfy.github.io/Conta-Comigo/politica-de-privacidade.html |
| Site | https://klivfy.github.io/Conta-Comigo/ |
| E-mail de contato (obrigatório, público) | **preencher com o e-mail de suporte da Klivfy** |
| Versão (versionName / versionCode) | 2.6.2 / 262 |
| minSdk | 24 (Android 7.0) — a Proteção Automática do Google Play exige 24 ou mais |

## Conteúdo do app (Política → Conteúdo do app)

| Declaração | Resposta |
|---|---|
| Anúncios | **Não contém anúncios** |
| Acesso ao app | Todas as funções disponíveis sem login nem credenciais |
| Público-alvo | Faixas **5 anos ou menos** e **6 a 8 anos** (atende à política *Para a família*). Não marcar 9+ |
| Apelo a crianças | Sim — o app é voltado a crianças; não tem anúncios, links externos, compras nem rede social |
| Classificação de conteúdo (IARC) | Questionário: categoria *Referência, notícias ou educação*; responder **Não** a violência, sexo, linguagem, drogas, jogos de azar, interação entre usuários e compartilhamento de localização. Resultado esperado: **Livre** |
| Apps de notícias / saúde / finanças / governo / COVID-19 | Não |
| Permissões sensíveis | Nenhuma |
| ID de publicidade | Não usa |
| Exclusão de dados | Não há conta nem dados em servidor; os dados ficam no aparelho (desinstalar ou limpar os dados do app apaga tudo) |

## Segurança dos dados (Data safety)

| Pergunta | Resposta |
|---|---|
| O app coleta ou compartilha algum dos tipos de dados exigidos? | **Não** |
| Os dados são criptografados em trânsito? | Não se aplica (nenhum dado é transmitido) |
| Os usuários podem pedir a exclusão dos dados? | Não se aplica (não há dados no servidor) |
| Compromete-se com a política *Para a família*? | Sim |

Resultado público: *"Nenhum dado coletado · Nenhum dado compartilhado"*.

## Imagens

| Item | Arquivo |
|---|---|
| Ícone 512×512 | `graficos/icones/play-icone-512x512.png` |
| Gráfico de recursos 1024×500 | `graficos/<idioma>/play-grafico-de-recursos-1024x500.png` |
| Capturas de celular 1080×1920 (2 a 8) | `imagens/<idioma>/celular-1080x1920/` — sugestão: 01 a 06 |
| Tablet 7" 1200×1920 | `imagens/<idioma>/tablet7-1200x1920/` |
| Tablet 10" 1600×2560 | `imagens/<idioma>/tablet10-1600x2560/` |

## Português (Brasil) — idioma principal (`pt-BR`)

**Nome do app (≤ 30):** Conta Comigo — Matemática  
_(25 caracteres)_

**Descrição curta (≤ 80):** Matemática de brincar para crianças de 4 a 8 anos. Offline e sem anúncios.  
_(74 caracteres)_

**Descrição completa (≤ 4000):** _(2033 caracteres)_

```text
O Conta Comigo transforma a prática de matemática em brincadeira para crianças a partir de 4 anos. A raposa mascote narra cada pergunta em voz alta e a criança responde tocando — sem precisar saber ler.

COMO É O JOGO
• 12 modos que crescem junto com a criança: contar objetos, somar, subtrair, número faltante, comparar quantidades, sequências, dobro e metade, multiplicar, dividir, problemas narrados, dinheiro e troco, e o Mistão, que sorteia tudo junto. Mais o desafio Contra o Tempo.
• Sem leitura obrigatória: cada pergunta é narrada em voz alta (com as vozes instaladas no aparelho) e os objetos podem ser tocados para contar de um em um.
• A dificuldade se adapta à criança e também pode ser fixada em 5 níveis, ou descoberta numa avaliação inicial.
• Os erros viram material de estudo: as questões perdidas voltam em revisões espaçadas até serem dominadas.

MOTIVAÇÃO
• Estrelas, pontos e recordes a cada rodada, missões diárias e calendário de ofensiva.
• 20 conquistas, álbum de figurinhas e Desafio-chefe com recompensa em dobro.
• Loja do jogo com temas, acessórios e mascotes — comprados só com as estrelas ganhas jogando. Não existem compras reais.

PARA OS RESPONSÁVEIS
• Área protegida por senha, com painel de progresso, mapa de domínio por operação e nível e evolução semanal.
• Até 4 perfis de jogadores, metas diárias, limite de sessão com pausa gentil e backup do progresso em arquivo.

ACESSIBILIDADE
• Temas claro, espaço, jardim e mais; alto contraste (acompanha o sistema); fonte amigável para dislexia; modo calmo com menos animações; o texto acompanha o tamanho de fonte do sistema; controles por teclado.
• Português, inglês e espanhol.

PRIVACIDADE
• Funciona 100% offline. Sem anúncios, sem compras, sem contas, sem rastreadores.
• Não coleta nem envia nenhum dado: o progresso fica só no seu aparelho.

NO ANDROID
• Instale e jogue: depois da primeira abertura o jogo funciona sem internet.
• Feito para toque, em celular ou tablet, em pé ou deitado.
• O texto acompanha o tamanho de fonte do sistema.
```

**O que há de novo (≤ 500):** _(158 caracteres)_

```text
Texto que acompanha o tamanho de fonte do sistema, alto contraste automático, destaques mais legíveis e senha dos responsáveis mais segura (e fora do backup).
```

## English (`en-US`)

**Nome do app (≤ 30):** Count With Me: Math for Kids  
_(28 caracteres)_

**Descrição curta (≤ 80):** Playful math for ages 4–8: count, add, compare and more. Offline, no ads.  
_(73 caracteres)_

**Descrição completa (≤ 4000):** _(1930 caracteres)_

```text
Count With Me turns math practice into playtime for children aged 4 and up. The fox mascot reads every question aloud and the child answers by tapping — no reading needed.

HOW IT PLAYS
• 12 game modes that grow with the child: counting objects, addition, subtraction, missing numbers, comparing quantities, sequences, doubles and halves, multiplication, division, story problems, money and change, and the Mix-up mode that draws them all together. Plus a Beat the Clock challenge.
• No reading required: every question is spoken aloud (using the voices installed on the device) and objects can be tapped to count one by one.
• Difficulty adapts to the child and can also be locked across 5 levels, or found with an initial assessment.
• Mistakes become study material: missed questions return in spaced review rounds until they are mastered.

MOTIVATION
• Stars, points and records every round, daily missions and a streak calendar.
• 20 achievements, a sticker album and a Boss Challenge with double rewards.
• An in-game shop with themes, accessories and pets — bought only with stars earned by playing. No real purchases.

FOR PARENTS
• A password-protected area with a progress dashboard, a mastery map by operation and level, and weekly evolution.
• Up to 4 player profiles, daily goals, a session limit with gentle breaks, and progress backup to a file.

ACCESSIBILITY
• Light, space, garden and more themes; high contrast (follows the system); a dyslexia-friendly font; calm mode with fewer animations; text follows the system font size; keyboard controls.
• Portuguese, English and Spanish.

PRIVACY
• Works 100% offline. No ads, no purchases, no accounts, no trackers.
• Collects and sends no data: progress stays on your device only.

ON ANDROID
• Install and play: after the first launch the game works without internet.
• Made for touch, on phone or tablet, portrait or landscape.
• Text follows the system font size.
```

**O que há de novo (≤ 500):** _(143 caracteres)_

```text
Text that follows the system font size, automatic high contrast, easier-to-read highlights and a safer parents' password (kept out of backups).
```

## Español (`es-419`)

**Nome do app (≤ 30):** Cuenta Conmigo: Matemática  
_(26 caracteres)_

**Descrição curta (≤ 80):** Matemática lúdica de 4 a 8 años. Sin conexión y sin anuncios.  
_(61 caracteres)_

**Descrição completa (≤ 4000):** _(2040 caracteres)_

```text
Cuenta Conmigo convierte la práctica de la matemática en un juego para niños desde los 4 años. La zorra mascota narra cada pregunta en voz alta y el niño responde tocando, sin necesidad de saber leer.

CÓMO SE JUEGA
• 12 modos que crecen con el niño: contar objetos, sumar, restar, número faltante, comparar cantidades, secuencias, doble y mitad, multiplicar, dividir, problemas narrados, dinero y vuelto, y la Mezcla, que sortea todo junto. Más el desafío Contra el Reloj.
• Sin lectura obligatoria: cada pregunta se narra en voz alta (con las voces instaladas en el dispositivo) y los objetos se pueden tocar para contar uno por uno.
• La dificultad se adapta al niño y también se puede fijar en 5 niveles, o descubrir con una evaluación inicial.
• Los errores se convierten en material de estudio: las preguntas falladas vuelven en repasos espaciados hasta dominarlas.

MOTIVACIÓN
• Estrellas, puntos y récords en cada ronda, misiones diarias y calendario de racha.
• 20 logros, álbum de cromos y Reto Jefe con recompensa doble.
• Tienda del juego con temas, accesorios y mascotas, comprados solo con las estrellas ganadas jugando. No hay compras reales.

PARA LAS FAMILIAS
• Área protegida con contraseña, con panel de progreso, mapa de dominio por operación y nivel y evolución semanal.
• Hasta 4 perfiles, metas diarias, límite de sesión con pausa amable y copia de seguridad del progreso en un archivo.

ACCESIBILIDAD
• Temas claro, espacio, jardín y más; alto contraste (sigue al sistema); fuente para dislexia; modo tranquilo con menos animaciones; el texto sigue el tamaño de fuente del sistema; control por teclado.
• Portugués, inglés y español.

PRIVACIDAD
• Funciona 100 % sin conexión. Sin anuncios, sin compras, sin cuentas, sin rastreadores.
• No recopila ni envía ningún dato: el progreso queda solo en tu dispositivo.

EN ANDROID
• Instala y juega: después del primer inicio el juego funciona sin internet.
• Hecho para tocar, en celular o tableta, vertical u horizontal.
• El texto sigue el tamaño de fuente del sistema.
```

**O que há de novo (≤ 500):** _(160 caracteres)_

```text
Texto que sigue el tamaño de fuente del sistema, alto contraste automático, destacados más legibles y contraseña de las familias más segura (fuera de la copia).
```

## Checklist de envio

1. Criar o app → preencher *Conteúdo do app* e *Segurança dos dados*.
2. *Listagem principal da loja*: pt-BR; *Traduções*: en-US e es-419 (copiar o mesmo es-419 para es-ES se desejar).
3. Subir o AAB numa faixa de **teste fechado**, convidar testadores, depois promover para produção.
4. Conferir no Android real que o app abre em tela cheia, sem barra de endereço (assetlinks correto).

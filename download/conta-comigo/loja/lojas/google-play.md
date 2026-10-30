# Google Play — Conta Comigo 2.8.0 (Android)

Painel: <https://play.google.com/console> · Pacote: o **AAB** gerado por *Actions → Android (Capacitor)* (`conta-comigo-android-2.8.0`), assinado com a chave de upload. Ative o **Play App Signing**. O jogo vai dentro do AAB: o app não depende do site no ar.

## Antes do primeiro envio (obrigatório)

1. Gere a chave de upload nova e guarde-a fora do Git (veja `PLANO-DE-ACAO.md`, fase A) e configure os 4 *secrets* do workflow.
2. Depois do primeiro envio, confira em *Integridade do app → Assinatura de apps* que o SHA-256 da **chave de upload** é o que o script de assinatura imprimiu. Não há `assetlinks.json` a atualizar: o jogo não é carregado de um site.
3. Conta de desenvolvedor (taxa única de US$ 25). Contas pessoais criadas depois de nov/2023 precisam de teste fechado com pelo menos 12 testadores por 14 dias antes da produção.

## Dados gerais

| Campo | Valor |
|---|---|
| Tipo | Aplicativo (não jogo) · Categoria **Educação** |
| Nome do pacote | `com.klivfy.conta.comigo.matematica` (crie um app novo no Play Console: o app antigo ficou preso a `com.conta.comigo.matematica.klivfy.com`) |
| Preço | Gratuito, sem anúncios, sem compras no app |
| Idioma padrão | Português (Brasil) — pt-BR; adicionar en-US e es-419 (e es-ES) |
| URL da política de privacidade | https://klivfy.github.io/Conta-Comigo/politica-de-privacidade.html |
| Site | https://klivfy.github.io/Conta-Comigo/ |
| E-mail de contato (obrigatório, público) | **preencher com o e-mail de suporte da Klivfy** |
| Versão (versionName / versionCode) | 2.8.0 / 280 |
| minSdk / targetSdk | 24 (Android 7.0; a Proteção Automática do Play exige 24+) / 36 (o Play exige 36) |

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

**Descrição completa (≤ 4000):** _(2051 caracteres)_

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
• Instale e jogue: o jogo vem dentro do app e funciona sem internet desde a primeira abertura.
• Feito para toque, em celular ou tablet, em pé ou deitado.
• O texto acompanha o tamanho de fonte do sistema.
```

**O que há de novo (≤ 500):** _(426 caracteres)_

```text
Novidades da 2.8.0: Jogar agora na tela inicial, boas-vindas com o nome da criança, estrelas que faltam para o mascote, loja que mostra primeiro o que já é da criança, arrastar para contar e backup com prévia e desfazer. Vibração leve ao acertar (pode ser desligada no painel). O jogo vem dentro do app e funciona sem internet; o botão Voltar leva ao início; o backup sai pela folha de compartilhar (Android 7.0 ou mais novo).
```

## English (`en-US`)

**Nome do app (≤ 30):** Count With Me: Math for Kids  
_(28 caracteres)_

**Descrição curta (≤ 80):** Playful math for ages 4–8: count, add, compare and more. Offline, no ads.  
_(73 caracteres)_

**Descrição completa (≤ 4000):** _(1954 caracteres)_

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
• Install and play: the game ships inside the app and works without internet from the first launch.
• Made for touch, on phone or tablet, portrait or landscape.
• Text follows the system font size.
```

**O que há de novo (≤ 500):** _(413 caracteres)_

```text
What's new in 2.8.0: Play now on the home screen, a spoken welcome with the child's name, stars left before the mascot changes, a shop that shows first what the child owns, drag to count, and a backup with preview and undo. Light vibration on correct answers (can be turned off in the panel). The game ships inside the app and works offline; Back goes home; the backup uses the share sheet (Android 7.0 or newer).
```

## Español (`es-419`)

**Nome do app (≤ 30):** Cuenta Conmigo: Matemática  
_(26 caracteres)_

**Descrição curta (≤ 80):** Matemática lúdica de 4 a 8 años. Sin conexión y sin anuncios.  
_(61 caracteres)_

**Descrição completa (≤ 4000):** _(2062 caracteres)_

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
• Instala y juega: el juego viene dentro de la app y funciona sin internet desde el primer inicio.
• Hecho para tocar, en celular o tableta, vertical u horizontal.
• El texto sigue el tamaño de fuente del sistema.
```

**O que há de novo (≤ 500):** _(463 caracteres)_

```text
Novedades de la 2.8.0: Jugar ya en la pantalla de inicio, bienvenida con el nombre dicho en voz alta, estrellas que faltan para la mascota, tienda que muestra primero lo que ya tiene, arrastrar para contar y copia de seguridad con vista previa y deshacer. Vibración suave al acertar (se puede desactivar en el panel). El juego viene dentro de la app y funciona sin internet; Atrás vuelve al inicio; la copia sale por el menú de compartir (Android 7.0 o superior).
```

## Checklist de envio

1. Criar o app → preencher *Conteúdo do app* e *Segurança dos dados*.
2. *Listagem principal da loja*: pt-BR; *Traduções*: en-US e es-419 (copiar o mesmo es-419 para es-ES se desejar).
3. Subir o AAB numa faixa de **teste fechado**, convidar testadores, depois promover para produção.
4. Conferir num Android real (de preferência pelo teste fechado): o app abre direto no jogo, inclusive sem internet; a voz fala; o Voltar volta ao início e, no início, minimiza o app; o backup abre a folha de compartilhar; o nome aparece em inglês e espanhol quando o aparelho está nesses idiomas.

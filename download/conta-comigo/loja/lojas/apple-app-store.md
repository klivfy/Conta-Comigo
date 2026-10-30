# Apple App Store (iPhone e iPad): Conta Comigo 2.8.0

Painel: <https://appstoreconnect.apple.com> · Pacote: *Archive* do Xcode do projeto `native/ios` (ou um job de CI com assinatura, que ainda não existe) enviado ao TestFlight. Identificador `com.klivfy.conta.comigo.matematica`, versão **2.8.0**, build **1**, iOS **15.0** ou mais novo, iPhone e iPad. O jogo vai dentro do app: não depende do site no ar.

## Bloqueios antes de enviar (leia primeiro)

Estes itens foram conferidos no código. Enquanto não forem resolvidos, não envie.

1. **Backup no iPhone: plugins adicionados, falta testar em aparelho.** O `native/ios` agora traz `@capacitor/filesystem` e `@capacitor/share` (como o Android), então `saveTextFile` grava o arquivo no cache e abre a folha de compartilhar. Só um iPhone real confirma; o aviso "salvo" só vale se o arquivo sair de fato.
2. **Falta o manifesto de privacidade do app** (`PrivacyInfo.xcprivacy`). O `@capacitor/preferences` usa `UserDefaults`, API de "motivo obrigatório" (motivo `CA92.1`). Os pacotes de plugin do projeto não trazem manifesto próprio. Sem a declaração, o App Store Connect avisa ou recusa o envio (erro `ITMS-91053`). No Mac: *Product → Archive → Generate Privacy Report* e declare o que aparecer.
3. **Capturas nos tamanhos da Apple.** As de `imagens/<idioma>/celular-1080x1920/` (Play) não servem. Preciso de iPhone 6,9" (1290×2796 ou 1320×2868) e iPad 13" (2064×2752 ou 2048×2732), em cada idioma.
4. **Conta Apple** (Apple Developer Program, US$ 99/ano), App ID, certificado de distribuição e perfil. Conta de organização pede número D-U-N-S; conta individual mostra o seu nome como vendedor.
5. **Teste num iPhone real** (TestFlight): voz, vibração, backup depois do item 1, e os três links do rodapé abrindo o Safari depois da conferência de adulto. No Windows e no Android esse mesmo caso já falhou antes; no iOS só foi lido no código.

## Dados gerais

| Campo | Valor |
|---|---|
| Nome do app e SKU | Conta Comigo: Matemática · SKU sugerido `conta-comigo-ios` |
| Idioma principal | Português (Brasil); adicionar English (U.S.) e Spanish (Spain e Mexico) |
| Categoria | Primária **Educação**. Secundária: deixe vazia |
| Kids Category | **Sim**, faixa **5 anos ou menos** (a Apple aceita só uma faixa; 4 a 5 anos é o núcleo do app). Alternativa: 6 a 8 |
| Classificação etária | **4+** (questionário: *Nenhum* em todos os itens) |
| Preço | Gratuito, sem compras no app, sem anúncios |
| URL da política de privacidade | https://klivfy.github.io/Conta-Comigo/politica-de-privacidade.html |
| URL de suporte | https://github.com/klivfy/Conta-Comigo/issues |
| URL de marketing | https://klivfy.github.io/Conta-Comigo/ |
| Direitos autorais | © 2026 Klivfy Tecnologia |
| Criptografia | `ITSAppUsesNonExemptEncryption = false` já no `Info.plist`: o app não cifra dados; só usa o sistema para verificar a senha dos responsáveis. Confirme na sua conta |
| Disponibilidade no Mac (Apple silicon) | **Desmarcar** na primeira versão: teclado e janela ainda não foram testados |
| Países | Todos (Cuba fica de fora por sanções) |

## Privacidade do app (App Privacy)

| Pergunta | Resposta |
|---|---|
| Coleta dados? | **Não**. Etiqueta pública: *"Dados não coletados"* |
| Rastreamento (ATT)? | Não. Não usa IDFA nem pede permissão de rastreamento |
| SDK de terceiros de análise ou anúncios? | Nenhum (exigência da Kids Category) |
| Portão parental | Conferência de adulto antes dos links externos (Privacidade, Termos e Suporte) |

## Imagens

| Item | Tamanho | Situação |
|---|---|---|
| Ícone | 1024×1024, sem transparência | pronto em `native/ios/resources/icon-1024.png` |
| Capturas iPhone 6,9" (até 10) | 1290×2796 ou 1320×2868 | **a gerar** (bloqueio 3) |
| Capturas iPad 13" (até 10) | 2064×2752 ou 2048×2732 | **a gerar** (bloqueio 3) |
| Prévia em vídeo | opcional | não usar sem refazer o vídeo em formato Apple |

Cenas sugeridas, na ordem: início com "Jogar agora", contar, comparar, história, dinheiro, fim de rodada, loja, painel dos responsáveis.


## Português (Brasil), idioma principal (`pt-BR`)

**Nome (≤ 30):** Conta Comigo: Matemática
_(24 caracteres)_

**Subtítulo (≤ 30):** Contar e somar de brincadeira
_(29 caracteres)_

**Texto promocional (≤ 170):** _(145 caracteres)_

```text
Matemática de brincar para crianças de 4 a 8 anos, com perguntas narradas em voz alta. Funciona sem internet, sem anúncios e sem coleta de dados.
```

**Descrição (≤ 4000):** _(2042 caracteres)_

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
• Temas claro, espaço, jardim e mais; alto contraste (acompanha o sistema); fonte amigável para dislexia; modo calmo com menos animações; controles por teclado.
• Português, inglês e espanhol.

PRIVACIDADE
• Funciona 100% offline. Sem anúncios, sem compras, sem contas, sem rastreadores.
• Não coleta nem envia nenhum dado: o progresso fica só no seu aparelho.

NO IPHONE E NO IPAD
• Instale e jogue: o jogo vem dentro do app e funciona sem internet desde a primeira abertura.
• Feito para toque, no iPhone ou no iPad, em pé ou deitado.
• No iPhone, vibração leve ao acertar (os responsáveis podem desligar no painel).
```

**Palavras-chave (≤ 100, separadas por vírgula, sem espaço depois da vírgula):** _(98 caracteres)_

```text
crianças,contar,somar,subtrair,educativo,pré-escola,números,tabuada,dinheiro,infantil,jogo,offline
```

**Novidades desta versão (≤ 4000):** _(451 caracteres; na primeira versão do app a Apple não mostra este campo)_

```text
Novidades da 2.8.0: botão Jogar agora na tela inicial, com a sugestão do dia; boas-vindas com o nome da criança falado; quantas estrelas faltam para o mascote mudar; a loja mostra primeiro o que já é da criança; missões e conquistas dizem o objetivo ao toque; no modo Contar, arraste o objeto para a cesta; no painel dos responsáveis, resumo da semana e backup com prévia e desfazer. No iPhone, vibração leve ao acertar (pode ser desligada no painel).
```


## English (`en-US`)

**Nome (≤ 30):** Count With Me: Math for Kids
_(28 caracteres)_

**Subtítulo (≤ 30):** Playful math for ages 4 to 8
_(28 caracteres)_

**Texto promocional (≤ 170):** _(107 caracteres)_

```text
Playful math for ages 4 to 8, with questions read aloud. Works offline, with no ads and no data collection.
```

**Descrição (≤ 4000):** _(1970 caracteres)_

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
• Light, space, garden and more themes; high contrast (follows the system); a dyslexia-friendly font; calm mode with fewer animations; keyboard controls.
• Portuguese, English and Spanish.

PRIVACY
• Works 100% offline. No ads, no purchases, no accounts, no trackers.
• Collects and sends no data: progress stays on your device only.

ON IPHONE AND IPAD
• Install and play: the game ships inside the app and works offline from the first launch.
• Made for touch, on iPhone or iPad, portrait or landscape.
• On iPhone, a light vibration on correct answers (parents can turn it off in the panel).
```

**Palavras-chave (≤ 100, separadas por vírgula, sem espaço depois da vírgula):** _(99 caracteres)_

```text
kids,counting,addition,subtraction,educational,preschool,numbers,money,times tables,offline,toddler
```

**Novidades desta versão (≤ 4000):** _(471 caracteres; na primeira versão do app a Apple não mostra este campo)_

```text
What's new in 2.8.0: a Play now button on the home screen, with today's suggestion; a spoken welcome with the child's name; stars left before the mascot changes; the shop shows first what the child already owns; missions and achievements say their goal when tapped; in Count mode, drag the object into the basket; in the parents' panel, a weekly summary and a backup with preview and undo. On iPhone, a light vibration on correct answers (can be turned off in the panel).
```


## Español (`es-ES`; use o mesmo texto em `es-MX`)

**Nome (≤ 30):** Cuenta Conmigo: Matemática
_(26 caracteres)_

**Subtítulo (≤ 30):** Contar y sumar jugando
_(22 caracteres)_

**Texto promocional (≤ 170):** _(127 caracteres)_

```text
Matemática lúdica de 4 a 8 años, con preguntas narradas en voz alta. Funciona sin conexión, sin anuncios y sin recopilar datos.
```

**Descrição (≤ 4000):** _(2061 caracteres)_

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
• Temas claro, espacio, jardín y más; alto contraste (sigue al sistema); fuente para dislexia; modo tranquilo con menos animaciones; control por teclado.
• Portugués, inglés y español.

PRIVACIDAD
• Funciona 100 % sin conexión. Sin anuncios, sin compras, sin cuentas, sin rastreadores.
• No recopila ni envía ningún dato: el progreso queda solo en tu dispositivo.

EN IPHONE Y IPAD
• Instala y juega: el juego viene dentro de la app y funciona sin internet desde el primer inicio.
• Hecho para tocar, en iPhone o iPad, en vertical u horizontal.
• En iPhone, una vibración suave al acertar (las familias pueden desactivarla en el panel).
```

**Palavras-chave (≤ 100, separadas por vírgula, sem espaço depois da vírgula):** _(96 caracteres)_

```text
niños,contar,sumar,restar,educativo,preescolar,números,tablas,dinero,infantil,juego,sin conexión
```

**Novidades desta versão (≤ 4000):** _(500 caracteres; na primeira versão do app a Apple não mostra este campo)_

```text
Novedades de la 2.8.0: botón Jugar ya en la pantalla de inicio, con la sugerencia del día; bienvenida con el nombre dicho en voz alta; cuántas estrellas faltan para que cambie la mascota; la tienda muestra primero lo que ya tiene; misiones y logros dicen su objetivo al tocarlos; en el modo Contar, arrastra el objeto a la cesta; en el panel de familiares, resumen de la semana y copia de seguridad con vista previa y deshacer. En iPhone, vibración suave al acertar (se puede desactivar en el panel).
```


## Informações para a análise (App Review Information)

Login obrigatório: **Não**. Os revisores leem em inglês: cole o texto abaixo no campo *Notes*. _(1167 caracteres, limite 4000)_

```text
Hello, and thank you for reviewing Conta Comigo.

NO LOGIN: there is no account, sign-in or server. Open the app, tap "Count" and answer a question.

OFFLINE: everything works without internet. The app makes no network requests and has no analytics, ads or third-party SDKs. Progress is saved only on the device.

KIDS CATEGORY AND PARENTAL GATE: the only external links are Privacy, Terms of Use and Support (klivfy.com). On the home screen they open Safari only after a parental gate (a grown-up math question a young child cannot solve). In the parents' panel they sit behind the parents' password.

PARENTS' AREA: tap the gear icon. The app first shows the same parental gate and then asks the adult to create a password. For review, any password works.

PURCHASES: there are no in-app purchases. The in-game shop uses stars earned by playing.

VOICE AND HAPTICS: questions are read aloud with the device's AVSpeechSynthesizer voices (check that the ringer/volume is on). On iPhone, a light haptic plays on correct answers; parents can turn it off in the panel.

PERMISSIONS: the app does not request any permission.

Contact: [preencher: nome, telefone e e-mail]
```

## Passo a passo

1. Resolva os bloqueios 1 e 2 (código) e gere as capturas (bloqueio 3).
2. Na conta Apple, crie o App ID e o app no App Store Connect com o nome, o idioma principal e o SKU acima.
3. No Mac, *Product → Archive* e envie ao TestFlight. Teste num iPhone real (bloqueio 5).
4. Preencha a listagem nos três idiomas, a privacidade do app, a Kids Category e a classificação.
5. Escolha o build, cole as notas de análise e envie para análise. Responda dentro de 24 horas a qualquer pergunta do revisor.

## Checklist rápido

- [ ] Backup salva um arquivo no iPhone (bloqueio 1)
- [ ] `PrivacyInfo.xcprivacy` no app e relatório de privacidade sem pendência (bloqueio 2)
- [ ] Capturas nos tamanhos da Apple, nos 3 idiomas (bloqueio 3)
- [ ] Conta, App ID e assinatura (bloqueio 4)
- [ ] Teste no iPhone: voz, vibração, backup e links (bloqueio 5)
- [ ] Kids Category e 4+ marcados; Mac desmarcado
- [ ] Contato preenchido nas notas de análise

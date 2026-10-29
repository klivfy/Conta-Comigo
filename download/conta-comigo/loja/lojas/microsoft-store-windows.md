# Microsoft Store (Windows 10/11) — Conta Comigo 2.6.4

Painel: <https://partner.microsoft.com/dashboard/apps-and-games/overview> · Pacote: o `.msix`/`.appx` gerado por **Actions → Windows (Electron)** (`conta-comigo-windows-2.6.4-x64-loja.appx`), não o instalador NSIS.

## Antes de enviar o pacote

1. Crie o app em *Apps e jogos → Novo produto → Aplicativo MSIX ou PWA* e reserve o nome **Conta Comigo** (e, se quiser, os nomes em inglês e espanhol).
2. Em *Gerenciamento de produtos → Identidade do produto* copie **Package/Identity/Name**, **Package/Identity/Publisher** e **PublisherDisplayName** e coloque nas variáveis `APPX_*` do repositório (hoje `native/windows/package.json` tem valores de exemplo: `Klivfy.ContaComigo` e `CN=00000000-…`). O pacote só é aceito se esses valores forem os da Partner Center.
3. Conta de desenvolvedor: individual (taxa única baixa) ou empresa.

## Dados gerais

| Campo | Valor |
|---|---|
| Categoria | Educação (subcategoria: *Ensino fundamental* / *Educação infantil*, se disponível) |
| Preço | Gratuito, sem compras no app, sem anúncios |
| Política de privacidade | https://klivfy.github.io/Conta-Comigo/politica-de-privacidade.html |
| Site | https://klivfy.github.io/Conta-Comigo/ |
| Informações de suporte | https://github.com/klivfy/Conta-Comigo/issues |
| Arquitetura | x64 |
| Famílias de dispositivos | Windows 10 e 11 (área de trabalho) |
| Idiomas do pacote | pt-BR, en-US, es-ES (já em `package.json` → `appx.languages`) |
| Direitos autorais | © 2026 Klivfy Tecnologia |
| Requisitos de hardware | Nenhum mínimo especial; 4 GB de RAM recomendado |
| Acessibilidade | Sim (alto contraste, teclado, zoom) |

## Classificação etária (questionário IARC)

Responda **Não** a todas as perguntas de violência, medo, sexo, linguagem imprópria, drogas, jogos de azar, compras, interação entre usuários, compartilhamento de localização e conteúdo gerado por usuário. Resultado esperado: **Para todos / 3+ (IARC)**. Declare que o app não coleta informações pessoais.

## Imagens

| Item | Arquivo |
|---|---|
| Capturas 1920×1080 (mínimo 4, até 10) | `imagens/<idioma>/desktop-1920x1080/` |
| Logotipo 300×300 (1:1) | `graficos/icones/msstore-logo-300x300.png` |
| Pôster 720×1080 (2:3) | `graficos/<idioma>/msstore-poster-720x1080.png` |
| Caixa 1080×1080 (1:1) | `graficos/<idioma>/msstore-caixa-1080x1080.png` |
| Imagem de destaque 1920×1080 (16:9) | `graficos/<idioma>/msstore-heroi-1920x1080.png` |

## Português (Brasil) — idioma principal

**Nome do produto (≤ 256):** Conta Comigo — Matemática para Crianças  
_(39 caracteres)_

**Descrição (≤ 10000):** _(2135 caracteres)_

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

NO WINDOWS
• Roda em janela ou em tela cheia, com toque, mouse ou teclado.
• Ctrl + / Ctrl − / Ctrl 0 aumentam, diminuem e restauram o tamanho (de 50% a 300%).
• Segue o tema claro ou escuro do Windows e o modo de alto contraste.
• Funciona sem internet: depois de instalado, não faz nenhuma conexão.
```

**Descrição curta (≤ 1000):** _(205 caracteres)_

```text
Matemática de brincar para crianças de 4 a 8 anos: contar, somar, comparar, dinheiro e muito mais, com perguntas narradas em voz alta. Funciona sem internet, sem anúncios, sem contas e sem coleta de dados.
```

**Recursos (até 20, cada um ≤ 200):**

- 12 modos de matemática que crescem com a criança, mais o desafio Contra o Tempo
- Perguntas narradas em voz alta: não precisa saber ler
- Dificuldade que se adapta, com revisão dos erros
- Estrelas, missões, 20 conquistas e figurinhas
- Área dos responsáveis com painel de progresso e até 4 perfis
- Acessibilidade: alto contraste, fonte para dislexia, modo calmo, zoom até 300%
- Português, inglês e espanhol
- 100% offline, sem anúncios, sem compras e sem coleta de dados

**Palavras-chave (até 7, cada uma ≤ 30):** matemática infantil; jogo educativo; contar; somar e subtrair; crianças; offline; pré-escola

**Novidades desta versão (≤ 1500):** _(384 caracteres)_

```text
Novidades da 2.6.4: o progresso não se perde mais quando o painel dos responsáveis ou outra aba está aberta; a sincronização funciona com vários perfis e mostra se deu certo; o leitor de tela não diz mais a resposta ao contar e dá para contar pelo teclado; o modo Dinheiro usa a moeda da sua região; e a voz em espanhol segue o seu país. O instalador do Windows ganhou um identificador novo: quem tinha a 2.6.2 instalada pelo instalador pode desinstalar a versão antiga em Aplicativos instalados; o progresso continua.
```

**Notas para a certificação (≤ 2000):** _(478 caracteres)_

```text
Não há login, conta nem serviço externo para testar: abra o app, toque em "Contar" e responda. O app é um pacote MSIX gerado com Electron (desktop bridge) e declara a capacidade runFullTrust, necessária para apps de área de trabalho empacotados. Ele não acessa a internet (nenhuma requisição de rede), não usa a conta Microsoft e não grava nada fora da própria pasta de dados do app. A área dos responsáveis (engrenagem) é protegida por senha criada pelo adulto no primeiro uso.
```

## English

**Nome do produto (≤ 256):** Count With Me — Math for Kids  
_(29 caracteres)_

**Descrição (≤ 10000):** _(2025 caracteres)_

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

ON WINDOWS
• Runs windowed or full screen, with touch, mouse or keyboard.
• Ctrl + / Ctrl − / Ctrl 0 zoom in, out and reset (50% to 300%).
• Follows the Windows light or dark theme and high contrast mode.
• Works without internet: once installed, it makes no network connections.
```

**Descrição curta (≤ 1000):** _(185 caracteres)_

```text
Playful math for children aged 4 to 8: counting, addition, comparing, money and more, with questions read aloud. Works without internet, with no ads, no accounts and no data collection.
```

**Recursos (até 20, cada um ≤ 200):**

- 12 math modes that grow with the child, plus the Beat the Clock challenge
- Questions read aloud: no reading needed
- Adaptive difficulty with review of mistakes
- Stars, missions, 20 achievements and stickers
- Parents' area with a progress dashboard and up to 4 profiles
- Accessibility: high contrast, dyslexia-friendly font, calm mode, zoom up to 300%
- Portuguese, English and Spanish
- 100% offline, no ads, no purchases and no data collection

**Palavras-chave (até 7, cada uma ≤ 30):** kids math; educational game; counting; addition; children; offline; preschool

**Novidades desta versão (≤ 1500):** _(362 caracteres)_

```text
What's new in 2.6.4: progress is no longer lost when the parents' panel or another tab is open; sync now works with several profiles and shows whether it worked; screen readers no longer announce the answer when counting, and counting works from the keyboard; Money mode uses your region's currency; and the Spanish voice follows your country. The Windows installer has a new identifier: if you installed 2.6.2 with the installer, you can uninstall the old copy in Installed apps; your progress is kept.
```

**Notas para a certificação (≤ 2000):** _(472 caracteres)_

```text
There is no login, account or external service needed to test: open the app, tap "Count" and answer. The app is an MSIX package built with Electron (desktop bridge) and declares the runFullTrust capability required for packaged desktop apps. It does not access the internet (no network requests), does not use the Microsoft account and writes nothing outside its own app data folder. The parents' area (gear icon) is protected by a password the adult creates on first use.
```

## Español

**Nome do produto (≤ 256):** Cuenta Conmigo — Matemática para Niños  
_(38 caracteres)_

**Descrição (≤ 10000):** _(2150 caracteres)_

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

EN WINDOWS
• Funciona en ventana o a pantalla completa, con toque, mouse o teclado.
• Ctrl + / Ctrl − / Ctrl 0 aumentan, reducen y restauran el tamaño (del 50 % al 300 %).
• Sigue el tema claro u oscuro de Windows y el modo de alto contraste.
• Funciona sin internet: una vez instalado, no hace ninguna conexión.
```

**Descrição curta (≤ 1000):** _(190 caracteres)_

```text
Matemática lúdica para niños de 4 a 8 años: contar, sumar, comparar, dinero y más, con preguntas narradas en voz alta. Funciona sin internet, sin anuncios, sin cuentas y sin recopilar datos.
```

**Recursos (até 20, cada um ≤ 200):**

- 12 modos de matemática que crecen con el niño, más el desafío Contra el Reloj
- Preguntas narradas en voz alta: no hace falta saber leer
- Dificultad adaptable, con repaso de los errores
- Estrellas, misiones, 20 logros y cromos
- Área de las familias con panel de progreso y hasta 4 perfiles
- Accesibilidad: alto contraste, fuente para dislexia, modo tranquilo, zoom hasta el 300 %
- Portugués, inglés y español
- 100 % sin conexión, sin anuncios, sin compras y sin recopilar datos

**Palavras-chave (até 7, cada uma ≤ 30):** matemática niños; juego educativo; contar; sumar y restar; niños; sin conexión; preescolar

**Novidades desta versão (≤ 1500):** _(401 caracteres)_

```text
Novedades de la 2.6.4: el progreso ya no se pierde cuando el panel de los responsables u otra pestaña está abierta; la sincronización funciona con varios perfiles y muestra si salió bien; el lector de pantalla ya no dice la respuesta al contar y se puede contar con el teclado; el modo Dinero usa la moneda de tu región; y la voz en español sigue tu país. El instalador de Windows tiene un identificador nuevo: si instalaste la 2.6.2 con el instalador, puedes desinstalar la copia antigua en Aplicaciones instaladas; el progreso se conserva.
```

**Notas para a certificação (≤ 2000):** _(485 caracteres)_

```text
No hace falta login, cuenta ni servicio externo para probar: abre la app, toca "Contar" y responde. La app es un paquete MSIX creado con Electron (desktop bridge) y declara la capacidad runFullTrust, necesaria para apps de escritorio empaquetadas. No accede a internet (ninguna solicitud de red), no usa la cuenta Microsoft y no escribe nada fuera de su propia carpeta de datos. El área de las familias (engranaje) está protegida por una contraseña que el adulto crea en el primer uso.
```

## Checklist de envio

1. Rodar o workflow **Windows (Electron)** com as variáveis `APPX_*` preenchidas e baixar o `.appx`.
2. *Envio → Pacotes*: arrastar o `.appx`; conferir que a Partner Center aceitou a identidade.
3. Preencher *Listagens* em pt-BR, en-US e es-ES (ou es-MX).
4. *Propriedades*, *Classificação etária*, *Preço e disponibilidade* (gratuito, todos os mercados).
5. Enviar. Certificação em geral de 1 a 3 dias úteis.

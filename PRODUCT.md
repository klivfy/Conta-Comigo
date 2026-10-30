# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Principal:** crianças de 4 a 8 anos jogando em casa, muitas vezes sozinhas, no celular, tablet ou navegador. Muitas ainda não leem com fluência, então a voz e os emojis carregam boa parte da instrução.
- **Secundário:** os responsáveis. Eles configuram perfis, senha, voz e tempo de tela, e acompanham o progresso no painel protegido.
- **Terciário:** escolas, pela versão web (`download/conta-comigo/web/`).

## Product Purpose
O jogo ensina os primeiros conceitos de matemática: contagem, comparação, adição, subtração, dinheiro e troco, problemas em histórias e sequências. Faz isso com desafios curtos, uma voz amigável e recompensas colecionáveis. Sucesso é a criança querer voltar todo dia (ofensiva, missões, álbum) e o adulto ver progresso real no mapa de domínio.

## Positioning
O jogo é trilíngue (PT/EN/ES), funciona 100% offline e não coleta dados. Cada criança tem perfil próprio, é chamada pelo nome e tem a sua voz preferida. A narração usa a síntese de voz do próprio sistema, escolhendo automaticamente a voz mais humana disponível.

## Operating Context
- Distribuído como extensão Chrome/Edge/Firefox (popup 400×600 e página cheia), app local no Android (sem PWA) e versão web/PWA para computador e iPhone.
- Uma única fonte em `download/conta-comigo/`, com três variantes de página que precisam ficar sincronizadas: `game.html`, `popup.html` e `web/index.html`.
- Sessões curtas de 5 a 10 perguntas. O modo calmo e o tempo de tela são definidos pelos responsáveis.

## Capabilities and Constraints
- JavaScript puro, sem framework e sem build de front-end. A PWA é montada por `scripts/build_pwa.py`.
- Funciona offline e não carrega nada de fora: sem CDN, fontes externas ou analytics. A fonte própria (Nunito, OFL) vai empacotada em `css/fonts/`. É exigência de COPPA, LGPD-K e GDPR-K.
- Os textos vivem em `js/i18n.js`, nos três idiomas.

## Brand Commitments
- O mascote é a raposa 🦊, e os emojis do sistema servem de ilustração. Não há arte rasterizada própria.
- A loja vende sete temas como recompensa: Clássico, Espaço, Jardim, Arco-íris, Oceano, Doces e Neve. Cada um precisa continuar visualmente distinto.
- A voz do produto é cordial e nunca pune: o erro vira dica, e o tempo só zera o bônus.

## Evidence on Hand
- Capturas em `download/conta-comigo/loja/capturas/`.
- Estudos e análises em `download/*.pdf|docx|xlsx`.
- Não há depoimentos, números de uso nem clientes, e nada disso deve ser inventado.

## Product Principles
1. Jogar vem primeiro: a criança chega a um desafio com um toque.
2. A recompensa vem antes da cobrança: sem punição, sem pressão e sem anúncios.
3. Uma criança que não lê deve conseguir usar tudo, por voz e por ícone.
4. O adulto decide, e a criança não precisa de um adulto para jogar.
5. Os dados ficam no aparelho.

## Accessibility & Inclusion
WCAG 2.1 AA:
- contraste de 4,5:1 no texto e de 3:1 em elementos gráficos;
- alvos de toque de 44px;
- foco visível e navegação completa por teclado.

O jogo também oferece alto contraste, fonte para dislexia, modo calmo e respeito ao `prefers-reduced-motion`. A checagem automática fica em `scripts/a11y_check.cjs`.

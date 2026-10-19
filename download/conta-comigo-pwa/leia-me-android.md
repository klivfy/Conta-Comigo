# Conta Comigo 2.5.0 — Android

Três caminhos para usar no Android (do mais simples ao mais completo):

## 1) PWA instalável (recomendado — Chrome ou Firefox no Android)
1. Hospede esta pasta em qualquer endereço **https** (GitHub Pages, Netlify, Vercel, servidor da escola…).
2. Abra o endereço no Chrome do Android.
3. Toque em **⋮ → Adicionar à tela inicial** (ou o aviso "Instalar app" do próprio Chrome).
4. O Conta Comigo abre em tela cheia, como um app nativo, e **funciona offline**
   (o service worker `sw.js` guarda todo o app no cache).

## 2) Extensão no Firefox para Android
- Use o pacote `conta-comigo-firefox-2.5.0.zip` publicado no **addons.mozilla.org (AMO)**.
- O manifest já declara `gecko_android` (Firefox 113+) e o jogo abre em aba normal no celular.
- Instale pelo Firefox do Android pesquisando "Conta Comigo" no AMO.

## 3) Google Play (TWA via PWA hospedada)
- Com a PWA publicada em https, gere o pacote Android com **Bubblewrap** (CLI oficial do Google)
  ou **PWABuilder.com** (interface gráfica): ambos leem o `manifest.webmanifest` e geram o AAB
  assinado para a Play Console (conta de desenvolvedor US$ 25 única).
- O app usa o mesmo código — atualizações do jogo valem para os 3 caminhos.

## Privacidade
Tudo roda **local no dispositivo** (sem servidores, sem contas, sem anúncios).
O progresso fica no armazenamento do app; em PWA, "Limpar dados do site" apaga —
use o backup nas opções do painel dos responsáveis.

## Conteúdo desta pasta
- `index.html` — o jogo (o mesmo motor das builds de extensão)
- `manifest.webmanifest` — identidade do app instalável
- `sw.js` — cache offline
- `icons/` — ícones 192/512 e maskable (Android adaptive)
- `css/`, `js/` — estilos e motor compartilhados

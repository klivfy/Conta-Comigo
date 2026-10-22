#!/usr/bin/env python3
"""v2.5 — gera o pacote Android/PWA do Conta Comigo.

Cria download/conta-comigo-pwa/ autocontido (sem paths ../), com:
  - index.html (jogo completo, meta tags PWA, registro de service worker)
  - css/ + js/ (motor completo compartilhado com as builds de extensão)
  - icons/ (192/512 + maskable 192/512 gerados por PIL)
  - manifest.webmanifest (instalável: standalone, ícones, theme-color)
  - sw.js (cache-first do app shell — funciona offline)
  - leia-me-android.md (3 caminhos de instalação no Android)

Saída: download/conta-comigo-pwa/ e conta-comigo-pwa-android-<VERSAO>.zip
"""
import glob, hashlib, json, os, math, shutil, sys, zipfile
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cc_build import DL, FONT_BOLD, SRC, version  # noqa: E402

OUT = os.path.join(DL, "conta-comigo-pwa")
VERSION = version()  # padrão: versão do manifest.json da fonte

# ---------- 0) pasta limpa ANTES de gerar ícones (o rmtree apagava os PNGs) ----------
if os.path.exists(OUT):
    shutil.rmtree(OUT)

# ---------- 1) ícones 192/512 (+ maskable com zona de segurança 80%) ----------
ICON_OUT = os.path.join(OUT, "icons")
os.makedirs(ICON_OUT, exist_ok=True)
TOP, BOT = (255, 154, 61), (255, 94, 126)
FONT_PATH = FONT_BOLD  # empacotada no repo: funciona em Linux, Windows e macOS

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def star_points(cx, cy, r_out, r_in, points=5, rot=-math.pi / 2):
    pts = []
    for i in range(points * 2):
        r = r_out if i % 2 == 0 else r_in
        a = rot + i * math.pi / points
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts

def draw_icon(size, maskable=False):
    img = Image.new('RGB', (size, size), lerp(TOP, BOT, 0.5))
    gd = ImageDraw.Draw(img)
    for y in range(size):
        gd.line([(0, y), (size, y)], fill=lerp(TOP, BOT, y / max(1, size - 1)))
    d = ImageDraw.Draw(img)
    # maskable: conteúdo dentro do círculo central de 80% do diâmetro
    k = 0.62 if maskable else 0.78
    d.polygon(star_points(size * 0.78, size * 0.22, size * 0.15 * k / 0.78, size * 0.07 * k / 0.78),
              fill=(255, 213, 74), outline=(255, 255, 255))
    fs = int(size * 0.40 * (k / 0.78))
    font = ImageFont.truetype(FONT_PATH, fs)
    bbox = d.textbbox((0, 0), '123', font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((size - tw) / 2 - bbox[0], size * 0.62 - th / 2 - bbox[1]), '123',
           font=font, fill=(255, 255, 255))
    return img

for size in (192, 512):
    draw_icon(size, maskable=False).save(os.path.join(ICON_OUT, f'icon-{size}.png'))
    draw_icon(size, maskable=True).save(os.path.join(ICON_OUT, f'icon-maskable-{size}.png'))
print("[OK] ícones 192/512 + maskable")

# ---------- 2) base = cópia autocontida ----------
os.makedirs(OUT, exist_ok=True)
shutil.copytree(os.path.join(SRC, "js"), os.path.join(OUT, "js"),
                ignore=shutil.ignore_patterns("newtab.js", "boot.js"))
shutil.copytree(os.path.join(SRC, "css"), os.path.join(OUT, "css"))
# boot.js do PWA: boot da extensão (html-page + ccVersion) + rota do jogo + service worker
boot_src = open(os.path.join(SRC, "js", "boot.js"), encoding="utf-8").read()
with open(os.path.join(OUT, "js", "boot.js"), "w", encoding="utf-8") as f:
    f.write(boot_src + """
/* PWA: o jogo é index.html (o “voltar” das opções usa esta rota) */
window.CC_GAME_URL = 'index.html';
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => { /* offline opcional */ });
  });
}
""")

# index.html do jogo a partir do game.html (paths relativos corrigidos)
game = open(os.path.join(SRC, "game.html"), encoding="utf-8").read()
game = game.replace('href="css/style.css"', 'href="css/style.css"')
game = game.replace('</title>', '</title>\n  <meta name="theme-color" content="#ff9a3d">\n  <meta name="cc-version" content="' + VERSION + '">\n  <meta name="mobile-web-app-capable" content="yes">\n  <link rel="manifest" href="manifest.webmanifest">\n  <link rel="icon" href="icons/icon-192.png">\n  <link rel="apple-touch-icon" href="icons/icon-192.png">')
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(game)

# options.html (painel dos responsáveis — aberto pelo ⚙️ do jogo)
opts = open(os.path.join(SRC, "options.html"), encoding="utf-8").read()
opts = opts.replace('</title>', '</title>\n  <meta name="theme-color" content="#ff9a3d">\n  <link rel="manifest" href="manifest.webmanifest">\n  <link rel="icon" href="icons/icon-192.png">', 1)
open(os.path.join(OUT, "options.html"), "w", encoding="utf-8").write(opts)

# ---------- 3) manifest.webmanifest ----------
manifest = {
    "name": "Conta Comigo — Matemática para Crianças",
    "short_name": "Conta Comigo",
    "id": "conta-comigo-pwa",
    "description": "Jogo educativo de matemática para crianças a partir de 4 anos: contar, somar, subtrair, multiplicar, dividir, desafios e colecionáveis.",
    "lang": "pt-BR",
    "start_url": "./index.html",
    "scope": "./",
    "display": "standalone",
    "orientation": "any",
    "theme_color": "#ff9a3d",
    "background_color": "#eaf6ff",
    "categories": ["education", "kids", "games"],
    "icons": [
        {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable"},
        {"src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ],
}
with open(os.path.join(OUT, "manifest.webmanifest"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
    f.write("\n")

# ---------- 4) sw.js (cache-first do app shell) ----------
ASSETS = ["./index.html", "./options.html", "./manifest.webmanifest", "./css/style.css",
          "./css/fonts/nunito-latin.woff2",
          "./js/boot.js", "./js/engine.js", "./js/ui.js", "./js/i18n.js", "./js/options.js",
          "./icons/icon-192.png", "./icons/icon-512.png",
          "./icons/icon-maskable-192.png", "./icons/icon-maskable-512.png"]
# chave do cache = versão + hash do conteúdo: qualquer mudança nos arquivos gera
# um sw.js diferente, o navegador instala o novo e o activate apaga o cache velho
digest = hashlib.sha256()
for a in ASSETS:
    with open(os.path.join(OUT, a[2:]), "rb") as fh:
        digest.update(a.encode() + b"\0" + fh.read())
CACHE_KEY = VERSION + "-" + digest.hexdigest()[:10]
sw = """'use strict';
/* Conta Comigo PWA — service worker (offline-first do app shell) */
const CACHE = 'conta-comigo-__VER__';
const ASSETS = __ASSETS__;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit ||
      fetch(e.request).then((res) => {
        // só guarda respostas válidas do próprio site (404/erros não ficam presos no cache)
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      }).catch(() => (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
    )
  );
});
""".replace('__VER__', CACHE_KEY).replace('__ASSETS__', json.dumps(ASSETS))
open(os.path.join(OUT, "sw.js"), "w", encoding="utf-8").write(sw)

# ---------- 5) leia-me-android.md ----------
readme = f"""# Conta Comigo {VERSION} — Android

Três caminhos para usar no Android (do mais simples ao mais completo):

## 1) PWA instalável (recomendado — Chrome ou Firefox no Android)
1. Hospede esta pasta em qualquer endereço **https** (GitHub Pages, Netlify, Vercel, servidor da escola…).
2. Abra o endereço no Chrome do Android.
3. Toque em **⋮ → Adicionar à tela inicial** (ou o aviso "Instalar app" do próprio Chrome).
4. O Conta Comigo abre em tela cheia, como um app nativo, e **funciona offline**
   (o service worker `sw.js` guarda todo o app no cache).

## 2) Extensão no Firefox para Android
- Use o pacote `conta-comigo-firefox-{VERSION}.zip` publicado no **addons.mozilla.org (AMO)**.
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
"""
open(os.path.join(OUT, "leia-me-android.md"), "w", encoding="utf-8").write(readme)

# ---------- 6) zip ----------
zip_path = os.path.join(DL, f"conta-comigo-pwa-android-{VERSION}.zip")
for old in glob.glob(os.path.join(DL, "conta-comigo-pwa-android-*.zip")):
    os.remove(old)  # mantém só o pacote da versão atual (como build_packages.py)
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(OUT):
        for f in sorted(files):
            fp = os.path.join(root, f)
            z.write(fp, os.path.relpath(fp, OUT))
print(f"[OK] PWA: {OUT}")
print(f"[OK] ZIP: {zip_path} ({os.path.getsize(zip_path)//1024} KB)")

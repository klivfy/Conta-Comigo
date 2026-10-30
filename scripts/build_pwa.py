#!/usr/bin/env python3
"""v2.7 — gera a PWA do Conta Comigo (web, escolas, base do Windows e do iPhone).

O Android NÃO é plataforma da PWA: lá o jogo roda como app local (Capacitor, dentro do
AAB), sem depender de site, de rede ou de service worker.

Cria download/conta-comigo-pwa/ autocontido (sem paths ../), com:
  - index.html (jogo completo, meta tags PWA, registro de service worker)
  - css/ + js/ (motor completo compartilhado com as builds de extensão)
  - icons/ (192/512 + maskable 192/512 gerados por PIL)
  - manifest.webmanifest (instalável: standalone, ícones, theme-color)
  - sw.js (cache-first do app shell — funciona offline)
  - leia-me.md (onde usar a PWA e por que o Android ficou de fora)

Saída: download/conta-comigo-pwa/ e conta-comigo-pwa-<VERSAO>.zip
"""
import glob, hashlib, json, os, math, shutil, sys, zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cc_build import DL, SRC, draw_icon, version  # noqa: E402

OUT = os.path.join(DL, "conta-comigo-pwa")
VERSION = version()  # padrão: versão do manifest.json da fonte

# ---------- 0) pasta limpa ANTES de gerar ícones (o rmtree apagava os PNGs) ----------
if os.path.exists(OUT):
    shutil.rmtree(OUT)

# ---------- 1) ícones 192/512 (+ maskable com zona de segurança 80%) ----------
ICON_OUT = os.path.join(OUT, "icons")
os.makedirs(ICON_OUT, exist_ok=True)
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
/* Android não é plataforma da PWA: lá o jogo é o app local da Google Play. Em navegador
   Android a página não oferece instalação e remove o service worker de quem já instalou. */
const ANDROID_WEB = /Android/i.test(navigator.userAgent || '');
if (ANDROID_WEB) {
  document.querySelectorAll('link[rel="manifest"], meta[name="mobile-web-app-capable"]').forEach((el) => el.remove());
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => { /* ignora */ });
  }
}
if ('serviceWorker' in navigator && !ANDROID_WEB) {
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

# ---------- 5) leia-me.md ----------
readme = f"""# Conta Comigo {VERSION} — PWA

Versão web instalável e offline do jogo, para navegadores de **computador** e para o
**iPhone/iPad** (Safari: Compartilhar, Adicionar à Tela de Início).

## E no Android?
O Android **não usa a PWA**. Lá o Conta Comigo é um app local da Google Play: o jogo vai
**dentro do pacote**, abre sem internet desde o primeiro toque e não depende deste site.
Em navegador Android esta página não oferece instalação e não guarda cache offline.

## Como hospedar
1. Publique esta pasta em um endereço **https** (GitHub Pages, Netlify, servidor da escola…).
2. Abra o endereço no navegador e use **Instalar** (Chrome/Edge) ou **Adicionar à Tela de Início** (Safari).
3. O service worker `sw.js` guarda o app no cache e ele passa a funcionar offline.

## Privacidade
Tudo roda **local no dispositivo** (sem servidores, sem contas, sem anúncios).
O progresso fica no armazenamento do navegador; "Limpar dados do site" apaga —
use o backup nas opções do painel dos responsáveis.

## Conteúdo desta pasta
- `index.html` — o jogo (o mesmo motor das builds de extensão)
- `manifest.webmanifest` — identidade do app instalável
- `sw.js` — cache offline
- `icons/` — ícones 192/512 e maskable
- `css/`, `js/` — estilos e motor compartilhados
"""
open(os.path.join(OUT, "leia-me.md"), "w", encoding="utf-8").write(readme)

# ---------- 6) zip ----------
zip_path = os.path.join(DL, f"conta-comigo-pwa-{VERSION}.zip")
for old in glob.glob(os.path.join(DL, "conta-comigo-pwa-*.zip")) + glob.glob(os.path.join(DL, "conta-comigo-pwa-android-*.zip")):
    os.remove(old)  # mantém só o pacote da versão atual (como build_packages.py)
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(OUT):
        for f in sorted(files):
            fp = os.path.join(root, f)
            z.write(fp, os.path.relpath(fp, OUT))
print(f"[OK] PWA: {OUT}")
print(f"[OK] ZIP: {zip_path} ({os.path.getsize(zip_path)//1024} KB)")

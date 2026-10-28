"""Caminhos e versão comuns aos scripts de build do Conta Comigo.

- ROOT: raiz do repositório (variável BASE sobrescreve, como no CI antigo).
- version(): VERSION=x.y.z nos argumentos ou, por padrão, a do manifest.json da fonte.
"""
import json, math, os, sys

ROOT = os.environ.get("BASE") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DL = os.path.join(ROOT, "download")
SRC = os.path.join(DL, "conta-comigo")
FONT_BOLD = os.path.join(ROOT, "scripts", "fonts", "DejaVuSans-Bold.ttf")


def manifest_version():
    with open(os.path.join(SRC, "manifest.json"), encoding="utf-8") as f:
        return json.load(f)["version"]


def version(argv=None):
    for a in (sys.argv[1:] if argv is None else argv):
        if a.upper().startswith("VERSION="):
            return a.split("=", 1)[1].strip()
    return manifest_version()


# ---------- ícone do app (PWA 192/512, iOS 1024): degradê laranja, estrela e "123" ----------
def _pil():
    from PIL import Image, ImageDraw, ImageFont
    return Image, ImageDraw, ImageFont


TOP, BOT = (255, 154, 61), (255, 94, 126)

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def star_points(cx, cy, r_out, r_in, points=5, rot=-math.pi / 2):
    pts = []
    for i in range(points * 2):
        r = r_out if i % 2 == 0 else r_in
        a = rot + i * math.pi / points
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts

def draw_icon(size, maskable=False, fit=1.0, background=True):
    """Ícone da marca. fit < 1 encolhe o desenho no centro (camada da frente do ícone
    adaptativo do Android); background=False deixa o fundo transparente."""
    Image, ImageDraw, ImageFont = _pil()
    if background:
        img = Image.new('RGB', (size, size), lerp(TOP, BOT, 0.5))
        gd = ImageDraw.Draw(img)
        for y in range(size):
            gd.line([(0, y), (size, y)], fill=lerp(TOP, BOT, y / max(1, size - 1)))
    else:
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    inner = size * fit
    off = (size - inner) / 2
    # maskable: conteúdo dentro do círculo central de 80% do diâmetro
    k = 0.62 if maskable else 0.78
    d.polygon(star_points(off + inner * 0.78, off + inner * 0.22, inner * 0.15 * k / 0.78, inner * 0.07 * k / 0.78),
              fill=(255, 213, 74), outline=(255, 255, 255))
    fs = int(inner * 0.40 * (k / 0.78))
    font = ImageFont.truetype(FONT_BOLD, fs)  # empacotada no repo: Linux, Windows e macOS
    bbox = d.textbbox((0, 0), '123', font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text((off + (inner - tw) / 2 - bbox[0], off + inner * 0.62 - th / 2 - bbox[1]), '123',
           font=font, fill=(255, 255, 255))
    return img


def gradient(w, h):
    """Só o degradê do ícone (fundo do ícone adaptativo do Android)."""
    Image, ImageDraw, _ = _pil()
    img = Image.new('RGB', (w, h))
    d = ImageDraw.Draw(img)
    for y in range(h):
        d.line([(0, y), (w, y)], fill=lerp(TOP, BOT, y / max(1, h - 1)))
    return img


# ---------- jogo para os apps Capacitor (iOS e Android) ----------
def capacitor_www(dest, plataforma):
    """Copia a PWA (build_pwa.py) para dest, sem o que não serve dentro do app:
    service worker, manifest, leia-me do Android, .well-known e política de privacidade.
    O WebView do Capacitor serve os arquivos de dentro do pacote, então o jogo já
    funciona offline sem service worker."""
    import re, shutil, subprocess
    pwa = os.path.join(DL, "conta-comigo-pwa")
    if not os.path.exists(os.path.join(pwa, "index.html")):
        subprocess.check_call([sys.executable, os.path.join(ROOT, "scripts", "build_pwa.py")])
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(pwa, dest, ignore=shutil.ignore_patterns(
        "sw.js", "manifest.webmanifest", "leia-me-android.md", ".well-known", "privacidade*"))
    # boot.js: tira o registro do service worker (bloco acrescentado pelo build_pwa.py)
    boot = os.path.join(dest, "js", "boot.js")
    src = open(boot, encoding="utf-8").read()
    src, n = re.subn(r"\nif \('serviceWorker' in navigator\) \{.*?\n\}\n", "\n", src, flags=re.S)
    assert n == 1, "registro do service worker não encontrado em boot.js"
    open(boot, "w", encoding="utf-8").write(
        src + "/* " + plataforma + " (Capacitor): sem service worker — os arquivos vêm do próprio app */\n")
    # páginas: sem <link rel="manifest">
    for page in ("index.html", "options.html"):
        p = os.path.join(dest, page)
        html = open(p, encoding="utf-8").read()
        html = re.sub(r'\s*<link rel="manifest" href="manifest.webmanifest">', "", html)
        open(p, "w", encoding="utf-8").write(html)

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

def draw_icon(size, maskable=False):
    Image, ImageDraw, ImageFont = _pil()
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
    font = ImageFont.truetype(FONT_BOLD, fs)  # empacotada no repo: Linux, Windows e macOS
    bbox = d.textbbox((0, 0), '123', font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((size - tw) / 2 - bbox[0], size * 0.62 - th / 2 - bbox[1]), '123',
           font=font, fill=(255, 255, 255))
    return img

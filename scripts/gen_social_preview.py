#!/usr/bin/env python3
"""Gera a imagem de social preview (1280x640) do Conta Comigo.
Composição: captura da tela inicial + overlay escuro + ícone + textos da marca."""
import os

from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1280, 640
BASE = "/home/z/my-project"
SHOT = f"{BASE}/download/conta-comigo/loja/capturas/captura-1-home.png"
ICON = f"{BASE}/download/conta-comigo-pwa/icons/icon-512.png"
OUT = f"{BASE}/download/social-preview-1280x640.png"

FONT_DIRS = [
    "/usr/share/fonts/truetype/english/Carlito-Bold.ttf",
    "/usr/share/fonts/truetype/english/Carlito-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]


def font(size, bold=True):
    order = [FONT_DIRS[0], FONT_DIRS[2]] if bold else [FONT_DIRS[1], FONT_DIRS[3]]
    for p in order:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    raise SystemExit("nenhuma fonte encontrada")


def center(draw, y, text, fnt, fill, shadow=True):
    bb = draw.textbbox((0, 0), text, font=fnt)
    x = (W - (bb[2] - bb[0])) // 2 - bb[0]
    if shadow:
        draw.text((x + 2, y + 4), text, font=fnt, fill=(0, 0, 0, 140))
    draw.text((x, y), text, font=fnt, fill=fill)


def main():
    # fundo: captura com cover-crop 1280x640
    base = Image.open(SHOT).convert("RGBA")
    r = max(W / base.width, H / base.height)
    bw, bh = int(base.width * r) + 1, int(base.height * r) + 1
    base = base.resize((bw, bh), Image.LANCZOS)
    x, y = (bw - W) // 2, (bh - H) // 2
    img = base.crop((x, y, x + W, y + H))

    # overlay azul-noite + leve desfoque para destacar o texto
    img = img.filter(ImageFilter.GaussianBlur(2))
    overlay = Image.new("RGBA", (W, H), (15, 23, 42, 158))
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)

    # ícone arredondado com sombra
    ISZ = 150
    icon = Image.open(ICON).convert("RGBA").resize((ISZ, ISZ), Image.LANCZOS)
    mask = Image.new("L", (ISZ, ISZ), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, ISZ, ISZ], radius=30, fill=255)
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(
        [(W - ISZ) // 2 + 4, 74, (W + ISZ) // 2 + 4, 74 + ISZ],
        radius=30, fill=(0, 0, 0, 110))
    img = Image.alpha_composite(img, sh)
    img.paste(icon, ((W - ISZ) // 2, 70), mask)
    d = ImageDraw.Draw(img)

    # textos
    center(d, 248, "Conta Comigo", font(88), (255, 255, 255))
    center(d, 372, "Matemática lúdica para crianças a partir de 4 anos",
           font(33, bold=False), (226, 232, 240))
    center(d, 438, "Chrome · Firefox · Android (PWA)   |   PT · EN · ES   |   100% offline",
           font(26, bold=False), (147, 197, 253))
    center(d, 548, "KLIVFY TECNOLOGIA", font(27), (255, 255, 255))

    img.convert("RGB").save(OUT, "PNG", optimize=True)
    print("OK:", OUT, f"{os.path.getsize(OUT) / 1024:.0f} KB, {W}x{H}")


if __name__ == "__main__":
    main()

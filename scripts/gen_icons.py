#!/usr/bin/env python3
"""Gera os ícones da extensão Conta Comigo (16/32/48/128 px)."""
import math
import os
from PIL import Image, ImageDraw, ImageFont

OUT = '/home/z/my-project/download/conta-comigo/icons'
os.makedirs(OUT, exist_ok=True)

TOP = (255, 154, 61)   # laranja
BOT = (255, 94, 126)   # rosa
STAR_FILL = (255, 213, 74, 255)
STAR_LINE = (255, 255, 255, 255)
FONT_PATH = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def star_points(cx, cy, r_out, r_in, points=5, rot=-math.pi / 2):
    pts = []
    for i in range(points * 2):
        r = r_out if i % 2 == 0 else r_in
        a = rot + i * math.pi / points
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


for size in (16, 32, 48, 128):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    grad = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grad)
    for y in range(size):
        gd.line([(0, y), (size, y)], fill=lerp(TOP, BOT, y / max(1, size - 1)) + (255,))

    mask = Image.new('L', (size, size), 0)
    md = ImageDraw.Draw(mask)
    radius = max(3, int(size * 0.24))
    try:
        md.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    except AttributeError:
        md.rectangle([0, 0, size - 1, size - 1], fill=255)
    img.paste(grad, (0, 0), mask)

    d = ImageDraw.Draw(img)
    if size >= 32:
        d.polygon(star_points(size * 0.76, size * 0.26, size * 0.17, size * 0.08),
                  fill=STAR_FILL, outline=STAR_LINE)

    fs = int(size * (0.40 if size >= 32 else 0.50))
    font = ImageFont.truetype(FONT_PATH, fs)
    bbox = d.textbbox((0, 0), '123', font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (size - tw) / 2 - bbox[0]
    ty = size * (0.60 if size >= 32 else 0.52) - th / 2 - bbox[1]
    d.text((tx, ty), '123', font=font, fill=(255, 255, 255, 255))

    img.save(os.path.join(OUT, f'icon{size}.png'))
    print('ok', size)

print('Ícones gerados em', OUT)

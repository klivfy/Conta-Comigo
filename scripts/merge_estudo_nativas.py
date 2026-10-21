# -*- coding: utf-8 -*-
"""Mescla capa (nativas_cover.pdf) + corpo (nativas_body.pdf) em
Conta-Comigo-Estudo-Viabilidade-Nativas-Android-Windows.pdf, normalizando A4."""
import io
from pypdf import PdfReader, PdfWriter, Transformation
from reportlab.lib.pagesizes import A4

W, H = A4
OUT = "/home/z/my-project/download/Conta-Comigo-Estudo-Viabilidade-Nativas-Android-Windows.pdf"
SOURCES = [
    "/home/z/my-project/scripts/nativas_cover.pdf",
    "/home/z/my-project/download/nativas_body.pdf",
]
TOL = 0.1

def pages_a4(reader):
    out = []
    for page in reader.pages:
        w = float(page.mediabox.width)
        h = float(page.mediabox.height)
        same = abs(w - W) <= TOL and abs(h - H) <= TOL
        if same:
            out.append(page)
            continue
        scale = min(W / w, H / h)
        tx = (W - w * scale) / 2
        ty = (H - h * scale) / 2
        buf = io.BytesIO()
        tmp = PdfWriter()
        tmp.add_page(page)
        tmp.write(buf)
        buf.seek(0)
        r2 = PdfReader(buf)
        pg = r2.pages[0]
        pg.add_transformation(Transformation().scale(scale).translate(tx, ty))
        pg.mediabox.lower_left = (0, 0)
        pg.mediabox.upper_right = (W, H)
        out.append(pg)
    return out

writer = PdfWriter()
for src in SOURCES:
    reader = PdfReader(src)
    for pg in pages_a4(reader):
        writer.add_page(pg)
writer.add_metadata({
    "/Title": "Estudo de Viabilidade — Versões Nativas Android e Windows (Conta Comigo)",
    "/Author": "Z.ai",
    "/Creator": "Z.ai",
})
with open(OUT, "wb") as f:
    writer.write(f)
print("OK merged:", OUT, "páginas:", len(writer.pages))

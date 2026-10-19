# -*- coding: utf-8 -*-
"""Mescla capa (voz2_cover.pdf) + corpo (voz2_body.pdf) em
Conta-Comigo-Estudo-Vozes-Humanizadas-v2.pdf, normalizando todas as
páginas para A4 estrito (595.276 x 841.890 pt, tolerância 0.1)."""
import io
from pypdf import PdfReader, PdfWriter, Transformation
from reportlab.lib.pagesizes import A4

W, H = A4  # 595.27 x 841.89
OUT = "/home/z/my-project/download/Conta-Comigo-Estudo-Vozes-Humanizadas-v2.pdf"
SOURCES = [
    "/home/z/my-project/scripts/voz2_cover.pdf",
    "/home/z/my-project/download/voz2_body.pdf",
]
TOL = 0.1

def pages_a4(reader):
    """Produz páginas normalizadas em A4 (escala + centralização quando preciso)."""
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
        c = None
        new_page = page
        from pypdf import PdfWriter as _PW
        tmp = _PW()
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
    "/Title": "Estudo de Vozes Humanizadas v2 — Conta Comigo",
    "/Author": "Z.ai",
    "/Creator": "Z.ai",
})
with open(OUT, "wb") as f:
    writer.write(f)
print("OK merged:", OUT, "páginas:", len(writer.pages))

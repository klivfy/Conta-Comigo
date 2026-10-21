#!/usr/bin/env python3
"""Fase 1 — ícones nativos do Conta Comigo.

1) Android mipmaps (ic_launcher.png) 512/192/144/96/72/48 px
   derivados do ícone PWA 512 (download/conta-comigo-pwa/icons/icon-512.png;
   fallback: gera via build_pwa.py rodando antes).
2) Windows icon.ico (16/24/32/48/64/128/256) para o electron-builder.
"""
import os
from PIL import Image

ROOT = "/home/z/my-project"
PWA_ICON = os.path.join(ROOT, "download/conta-comigo-pwa/icons/icon-512.png")
if not os.path.exists(PWA_ICON):
    raise SystemExit("ERRO: rode scripts/build_pwa.py antes (ícone 512 ausente)")

src = Image.open(PWA_ICON).convert("RGBA")

# ---------- Android mipmaps ----------
RES = os.path.join(ROOT, "native/android/app/src/main/res")
SIZES = {"mipmap-xxxhdpi": 192, "mipmap-xxhdpi": 144,
         "mipmap-xhdpi": 96, "mipmap-hdpi": 72, "mipmap-mdpi": 48}
for dpi, size in SIZES.items():
    d = os.path.join(RES, dpi)
    os.makedirs(d, exist_ok=True)
    src.resize((size, size), Image.LANCZOS).save(os.path.join(d, "ic_launcher.png"))
    print(f"[OK] {dpi}/ic_launcher.png {size}px")

# ---------- Windows icon.ico ----------
ICO_PATH = os.path.join(ROOT, "native/windows/build/icon.ico")
os.makedirs(os.path.dirname(ICO_PATH), exist_ok=True)
src.save(ICO_PATH, format="ICO",
         sizes=[(s, s) for s in (16, 24, 32, 48, 64, 128, 256)])
print(f"[OK] {ICO_PATH} ({os.path.getsize(ICO_PATH)//1024} KB)")

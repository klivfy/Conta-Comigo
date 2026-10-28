#!/usr/bin/env python3
"""Fase 1 — ícone do Windows (icon.ico 16/24/32/48/64/128/256) para o electron-builder,
derivado do ícone PWA 512 (download/conta-comigo-pwa/icons/icon-512.png; rode
build_pwa.py antes). Os ícones do Android saem de scripts/build_android_www.py.
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PWA_ICON = os.path.join(ROOT, "download/conta-comigo-pwa/icons/icon-512.png")
if not os.path.exists(PWA_ICON):
    raise SystemExit("ERRO: rode scripts/build_pwa.py antes (ícone 512 ausente)")

src = Image.open(PWA_ICON).convert("RGBA")

# ---------- Windows icon.ico ----------
ICO_PATH = os.path.join(ROOT, "native/windows/build/icon.ico")
os.makedirs(os.path.dirname(ICO_PATH), exist_ok=True)
src.save(ICO_PATH, format="ICO",
         sizes=[(s, s) for s in (16, 24, 32, 48, 64, 128, 256)])
print(f"[OK] {ICO_PATH} ({os.path.getsize(ICO_PATH)//1024} KB)")

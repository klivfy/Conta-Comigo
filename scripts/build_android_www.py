#!/usr/bin/env python3
"""Prepara o jogo para o app Android (Capacitor), com tudo dentro do APK/AAB.

Parte da PWA gerada por build_pwa.py (mesmo motor, mesmo index.html) e grava em
native/android/www/ uma cópia sem o que não serve dentro do app (capacitor_www em
cc_build.py, o mesmo do iOS). Depois o `npx cap sync android` copia essa pasta para
android/app/src/main/assets/public.

Também gera, no projeto Gradle (native/android/android/app/src/main/res):
  - ícone adaptativo: fundo com o degradê e frente com a estrela e o "123" dentro
    da zona segura (66 de 108 dp); a frente também serve de ícone monocromático;
  - ícones antigos (Android 7) quadrado arredondado e redondo;
  - abertura do Android 7 a 11 (splash.png em retrato e paisagem).
A abertura do Android 12+ vem do tema (styles.xml): fundo claro e o mesmo ícone.

Uso: python3 scripts/build_android_www.py   (roda o build_pwa.py antes, se preciso)
"""
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cc_build import ROOT, capacitor_www, draw_icon, gradient, version  # noqa: E402

AND = os.path.join(ROOT, "native", "android")
WWW = os.path.join(AND, "www")
RES = os.path.join(AND, "android", "app", "src", "main", "res")
BG = (0xea, 0xf6, 0xff)  # --bg-a do tema Clássico

capacitor_www(WWW, "Android")
print("[OK] Android www:", WWW)

if os.path.isdir(RES):
    from PIL import Image, ImageDraw

    def masked(img, shape):
        """Recorta o ícone quadrado em quadrado arredondado ou círculo (ícones antigos)."""
        n = img.size[0]
        mask = Image.new("L", (n, n), 0)
        d = ImageDraw.Draw(mask)
        if shape == "round":
            d.ellipse((0, 0, n - 1, n - 1), fill=255)
        else:
            d.rounded_rectangle((0, 0, n - 1, n - 1), radius=int(n * 0.2), fill=255)
        out = img.convert("RGBA")
        out.putalpha(mask)
        return out

    # mdpi = 1x; launcher 48 dp, camadas do adaptativo 108 dp
    for dens, mult in (("mdpi", 1), ("hdpi", 1.5), ("xhdpi", 2), ("xxhdpi", 3), ("xxxhdpi", 4)):
        folder = os.path.join(RES, "mipmap-" + dens)
        os.makedirs(folder, exist_ok=True)
        layer = int(108 * mult)
        gradient(layer, layer).save(os.path.join(folder, "ic_launcher_background.png"), optimize=True)
        # fit 0,55: estrela e número cabem no círculo seguro de 66 dp
        draw_icon(layer, fit=0.55, background=False).save(os.path.join(folder, "ic_launcher_foreground.png"), optimize=True)
        legacy = int(48 * mult)
        masked(draw_icon(legacy * 4), "square").resize((legacy, legacy), Image.LANCZOS).save(
            os.path.join(folder, "ic_launcher.png"), optimize=True)
        # no círculo os cantos somem: o desenho encolhe para a estrela não ser cortada
        masked(draw_icon(legacy * 4, fit=0.74), "round").resize((legacy, legacy), Image.LANCZOS).save(
            os.path.join(folder, "ic_launcher_round.png"), optimize=True)
    print("[OK] ícones (adaptativo, monocromático, quadrado e redondo)")

    # abertura do Android 7 a 11: o mesmo tamanho dos arquivos do modelo do Capacitor
    sizes = {"mdpi": (320, 480), "hdpi": (480, 800), "xhdpi": (720, 1280), "xxhdpi": (960, 1600), "xxxhdpi": (1280, 1920)}
    def splash(w, h):
        img = Image.new("RGB", (w, h), BG)
        n = int(min(w, h) * 0.32)
        mark = masked(draw_icon(n * 2), "square").resize((n, n), Image.LANCZOS)
        img.paste(mark, ((w - n) // 2, (h - n) // 2), mark)
        return img
    for dens, (w, h) in sizes.items():
        for orient, (sw, sh) in (("port", (w, h)), ("land", (h, w))):
            folder = os.path.join(RES, "drawable-%s-%s" % (orient, dens))
            os.makedirs(folder, exist_ok=True)
            splash(sw, sh).save(os.path.join(folder, "splash.png"), optimize=True)
    os.makedirs(os.path.join(RES, "drawable"), exist_ok=True)
    splash(480, 320).save(os.path.join(RES, "drawable", "splash.png"), optimize=True)
    print("[OK] abertura (splash.png) em retrato e paisagem")

print("[OK] versão do jogo:", version(), "(versionName/versionCode em android/app/build.gradle; o sync_check confere)")

#!/usr/bin/env python3
"""Fase 6.5 — prepara o jogo para o casco iOS (Capacitor).

Parte da PWA gerada por build_pwa.py (mesmo motor, mesmo index.html) e grava em
native/ios/www/ uma cópia sem o que não serve dentro do app (capacitor_www em
cc_build.py, o mesmo do Android):
  - sem service worker (o WKWebView do Capacitor já serve tudo do pacote, offline);
  - sem manifest e sem o leia-me.
Também grava native/ios/resources/icon-1024.png (ícone da App Store, sem alfa).

Uso: python3 scripts/build_ios_www.py   (roda o build_pwa.py antes, se preciso)
"""
import os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cc_build import ROOT, capacitor_www, draw_icon, version  # noqa: E402

IOS = os.path.join(ROOT, "native", "ios")
WWW = os.path.join(IOS, "www")

capacitor_www(WWW, "iOS")

os.makedirs(os.path.join(IOS, "resources"), exist_ok=True)
icon = draw_icon(1024)  # RGB: a App Store recusa ícone com alfa
icon.save(os.path.join(IOS, "resources", "icon-1024.png"))

# projeto Xcode (native/ios/ios, gerado por `npx cap add ios`): ícone e splash da marca
XC = os.path.join(IOS, "ios", "App", "App", "Assets.xcassets")
if os.path.isdir(XC):
    from PIL import Image
    icon.save(os.path.join(XC, "AppIcon.appiconset", "AppIcon-512@2x.png"))
    splash = Image.new("RGB", (2732, 2732), (0xea, 0xf6, 0xff))  # --bg-a do tema Clássico
    mark = draw_icon(512)
    splash.paste(mark, ((2732 - 512) // 2, (2732 - 512) // 2))
    for name in ("splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"):
        splash.save(os.path.join(XC, "Splash.imageset", name), optimize=True)
    print("[OK] ícone e splash no projeto Xcode")
    # versão da loja = versão do jogo (manifest.json da fonte)
    pbx = os.path.join(IOS, "ios", "App", "App.xcodeproj", "project.pbxproj")
    txt = open(pbx, encoding="utf-8").read()
    txt = re.sub(r"MARKETING_VERSION = [^;]+;", "MARKETING_VERSION = " + version() + ";", txt)
    open(pbx, "w", encoding="utf-8").write(txt)
    print("[OK] MARKETING_VERSION =", version())

print("[OK] iOS www:", WWW)
print("[OK] ícone 1024:", os.path.join(IOS, "resources", "icon-1024.png"))

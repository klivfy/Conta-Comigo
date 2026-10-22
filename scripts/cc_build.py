"""Caminhos e versão comuns aos scripts de build do Conta Comigo.

- ROOT: raiz do repositório (variável BASE sobrescreve, como no CI antigo).
- version(): VERSION=x.y.z nos argumentos ou, por padrão, a do manifest.json da fonte.
"""
import json, os, sys

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

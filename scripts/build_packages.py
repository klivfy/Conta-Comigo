#!/usr/bin/env python3
"""Build v2.1.1 — gera pacotes SEPARADOS por navegador.

Motivo: no MV3 o Chrome rejeita a chave 'background.scripts' (erro
"'background.scripts' requires manifest version of 2 or lower") e o
Firefox não suporta 'background.service_worker'. A declaração dupla no
mesmo manifest deixava uma mensagem de erro na página chrome://extensions
(ainda que o Chrome funcionasse usando o service worker).

Saída (em /home/z/my-project/download/):
  - conta-comigo/               → pasta p/ Chromium (service_worker only)
  - conta-comigo-firefox/       → pasta p/ Firefox (event page + gecko id)
  - conta-comigo-chrome-2.1.1.zip
  - conta-comigo-firefox-2.1.1.zip
  (o zip antigo conta-comigo-extension.zip é removido)
"""
import json, os, shutil, zipfile, sys

SRC = "/home/z/my-project/download/conta-comigo"
FF  = "/home/z/my-project/download/conta-comigo-firefox"
OUT = "/home/z/my-project/download"
OLD_ZIP = os.path.join(OUT, "conta-comigo-extension.zip")
VERSION = "2.2.0"
ZIP_CHROME = os.path.join(OUT, f"conta-comigo-chrome-{VERSION}.zip")
ZIP_FF     = os.path.join(OUT, f"conta-comigo-firefox-{VERSION}.zip")

# Pastas/arquivos que vão para os zips de extensão (manifest na raiz).
INCLUDE = [
    "manifest.json", "background.js", "game.html", "popup.html",
    "newtab.html", "options.html", "icons", "css", "js",
]
# demo.html, web/, loja/ ficam FORA do pacote de instalação das lojas.

def load_manifest(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def write_manifest(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

def zip_dir(src_dir, zip_path, include):
    if os.path.exists(zip_path):
        os.remove(zip_path)
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for item in include:
            p = os.path.join(src_dir, item)
            if os.path.isfile(p):
                z.write(p, item)
            elif os.path.isdir(p):
                for root, _, files in os.walk(p):
                    for f in sorted(files):
                        fp = os.path.join(root, f)
                        arc = os.path.relpath(fp, src_dir)
                        z.write(fp, arc)
    return zip_path

def main():
    # ---------- 1) Build CHROMIUM = pasta fonte (já com manifest corrigido)
    m = load_manifest(os.path.join(SRC, "manifest.json"))
    assert m["version"] == VERSION, f"versão da fonte: {m['version']}"
    assert "scripts" not in m["background"], "build Chromium não pode ter background.scripts"
    assert "browser_specific_settings" not in m, "build Chromium não deve ter gecko id"
    zip_dir(SRC, ZIP_CHROME, INCLUDE)
    print(f"[OK] Chromium: {ZIP_CHROME} ({os.path.getsize(ZIP_CHROME)//1024} KB)")

    # ---------- 2) Build FIREFOX = cópia + manifest event page
    if os.path.exists(FF):
        shutil.rmtree(FF)
    shutil.copytree(SRC, FF,
                    ignore=shutil.ignore_patterns("demo.html", "web", "loja"))
    mf_path = os.path.join(FF, "manifest.json")
    mf = load_manifest(mf_path)
    mf["background"] = {"scripts": ["background.js"]}          # event page MV3
    mf["browser_specific_settings"] = {
        "gecko": {"id": "conta-comigo@kidmath.app", "strict_min_version": "109.0"}
    }
    mf.pop("service_worker", None)
    write_manifest(mf_path, mf)
    zip_dir(FF, ZIP_FF, INCLUDE)
    print(f"[OK] Firefox:  {ZIP_FF} ({os.path.getsize(ZIP_FF)//1024} KB)")

    # ---------- 3) Remove zip antigo (build única com background dual)
    if os.path.exists(OLD_ZIP):
        os.remove(OLD_ZIP)
        print(f"[OK] removido pacote antigo: {OLD_ZIP}")

    # ---------- 4) Validação final
    for label, path, bg_must, top_must, must_not in [
        ("chrome",  os.path.join(SRC, "manifest.json"),
         {"service_worker"}, set(), ("scripts", "browser_specific_settings")),
        ("firefox", mf_path,
         {"scripts"}, {"browser_specific_settings"}, ("service_worker",)),
    ]:
        d = load_manifest(path)
        bg = d["background"]
        missing = (bg_must - set(bg)) | (top_must - set(d))
        leaked  = [k for k in must_not if k in d or k in bg]
        assert not missing, f"{label}: faltando {missing}"
        assert not leaked,  f"{label}: sobrando {leaked}"
        print(f"[OK] manifest {label} validado: background={bg}")
    print("[DONE] builds v" + VERSION + " geradas e validadas.")

if __name__ == "__main__":
    main()

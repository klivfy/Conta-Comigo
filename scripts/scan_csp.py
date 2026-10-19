#!/usr/bin/env python3
"""Escaneia HTMLs (pasta + zip) por violações de CSP MV3:
   - blocos <script> inline (sem src) + hash sha256-base64 (formato Chrome)
   - atributos de evento inline (onclick=, onload=, ...)
   - URLs javascript:
   Casa com o hash reportado pelo Chrome: pR1/EfeZuQm7Lt8tShLqHetTXNYDMjbthabvdMMXhjY=
"""
import base64, hashlib, re, sys, zipfile, os, io

TARGET_HASH = "pR1/EfeZuQm7Lt8tShLqHetTXNYDMjbthabvdMMXhjY="
BASE = "/home/z/my-project/download/conta-comigo"
FF = "/home/z/my-project/download/conta-comigo-firefox"
ZIPS = [
    "/home/z/my-project/download/conta-comigo-chrome-2.4.0.zip",
    "/home/z/my-project/download/conta-comigo-firefox-2.4.0.zip",
]

SCRIPT_RE = re.compile(r'<script\b([^>]*)>(.*?)</script>', re.S | re.I)
EVENT_RE = re.compile(r'\bon[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)', re.I)
JSURL_RE = re.compile(r'(href|src|action)\s*=\s*["\']javascript:', re.I)

def sha_b64(text: str) -> str:
    return base64.b64encode(hashlib.sha256(text.encode("utf-8")).digest()).decode()

def scan(name: str, html: str):
    hits = []
    for m in SCRIPT_RE.finditer(html):
        attrs, body = m.group(1), m.group(2)
        if re.search(r'\bsrc\s*=', attrs, re.I):
            continue  # script externo — ok
        h = sha_b64(body)
        flag = "  <<< HASH REPORTADO PELO CHROME" if h == TARGET_HASH else ""
        snippet = re.sub(r'\s+', ' ', body.strip())[:110]
        hits.append(f"  [SCRIPT-INLINE] hash=sha256-{h}{flag}\n    conteúdo: {snippet!r}")
    for m in EVENT_RE.finditer(html):
        # ignora se estiver dentro de <script> (falso positivo: código JS tipo 'on click')
        start = m.start()
        inside = any(mm.start() <= start < mm.end() for mm in SCRIPT_RE.finditer(html))
        if not inside:
            hits.append(f"  [EVENTO-INLINE] {m.group(0)[:120]}")
    for m in JSURL_RE.finditer(html):
        hits.append(f"  [JAVASCRIPT-URL] {m.group(0)}")
    return hits

def scan_zip(zip_path):
    print(f"===== ZIP: {zip_path}")
    if not os.path.exists(zip_path):
        print("  (zip não encontrado)")
        return
    with zipfile.ZipFile(zip_path) as z:
        for info in z.infolist():
            if not info.filename.lower().endswith((".html", ".htm")):
                continue
            html = z.read(info.filename).decode("utf-8", "replace")
            hits = scan(info.filename, html)
            print(f"--- {info.filename}")
            print("\n".join(hits) if hits else "  OK (sem violações)")

def scan_tree(base):
    print(f"===== PASTA: {base}")
    for root, _, files in os.walk(base):
        for f in sorted(files):
            if not f.lower().endswith((".html", ".htm")):
                continue
            p = os.path.join(root, f)
            html = io.open(p, encoding="utf-8", errors="replace").read()
            rel = os.path.relpath(p, base)
            hits = scan(rel, html)
            print(f"--- {rel}")
            print("\n".join(hits) if hits else "  OK (sem violações)")

if __name__ == "__main__":
    scan_tree(BASE)
    scan_tree(FF)
    print()
    for zp in ZIPS:
        scan_zip(zp)
        print()

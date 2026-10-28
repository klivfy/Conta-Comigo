#!/usr/bin/env python3
"""Confere a regra de CSP do jogo (script-src 'self', MV3) na fonte, nos builds e nos zips.

Falha (código 1) quando encontra:
  - <script> inline (sem src);
  - atributo de evento inline (onclick=, onload=, ...);
  - URL javascript: em href/src/action;
  - eval( ou new Function( no JavaScript (a CSP do MV3 bloqueia).

Uso: python scripts/scan_csp.py   (rode depois de build_packages.py e build_pwa.py para cobrir os builds)
"""
import glob, io, os, re, sys, zipfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DL = os.path.join(ROOT, "download")
TREES = [os.path.join(DL, d) for d in ("conta-comigo", "conta-comigo-pwa", "conta-comigo-firefox")]
SKIP_DIRS = {"loja"}  # material de loja, fora dos pacotes

SCRIPT_RE = re.compile(r"<script\b([^>]*)>(.*?)</script>", re.S | re.I)
EVENT_RE = re.compile(r"<[a-z][^>]*?\s(on[a-z]+)\s*=", re.I)
JSURL_RE = re.compile(r"(href|src|action)\s*=\s*[\"']\s*javascript:", re.I)
EVAL_RE = re.compile(r"(?<![\w.$])(eval\s*\(|new\s+Function\s*\()")
COMMENT_RE = re.compile(r"/\*.*?\*/|(?<![:'\"\\])//[^\n]*", re.S)


def scan_html(html):
    hits = []
    for m in SCRIPT_RE.finditer(html):
        if not re.search(r"\bsrc\s*=", m.group(1), re.I) and m.group(2).strip():
            hits.append("script inline: " + re.sub(r"\s+", " ", m.group(2).strip())[:80])
    sem_scripts = SCRIPT_RE.sub("", html)
    hits += ["evento inline: " + m.group(1) for m in EVENT_RE.finditer(sem_scripts)]
    hits += ["URL javascript: em " + m.group(1) for m in JSURL_RE.finditer(sem_scripts)]
    return hits


def scan_js(js):
    return ["uso de " + m.group(1).strip() for m in EVAL_RE.finditer(COMMENT_RE.sub("", js))]


def check(name, text, problems):
    hits = scan_html(text) if name.lower().endswith((".html", ".htm")) else scan_js(text) if name.endswith(".js") else []
    problems += [f"{name}: {h}" for h in hits]
    return 1 if name.lower().endswith((".html", ".htm", ".js")) else 0


def main():
    problems, n = [], 0
    for base in TREES:
        if not os.path.isdir(base):
            continue
        for root, dirs, files in os.walk(base):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for f in sorted(files):
                p = os.path.join(root, f)
                n += check(os.path.relpath(p, DL), io.open(p, encoding="utf-8", errors="replace").read(), problems)
    for zp in sorted(glob.glob(os.path.join(DL, "*.zip"))):
        with zipfile.ZipFile(zp) as z:
            for info in z.infolist():
                n += check(os.path.basename(zp) + ":" + info.filename, z.read(info.filename).decode("utf-8", "replace"), problems)
    if problems:
        print("FALHOU — violações da CSP:\n  " + "\n  ".join(problems))
        sys.exit(1)
    print(f"OK — {n} arquivos HTML/JS na fonte, nos builds e nos zips sem script inline, evento inline, javascript: ou eval")


if __name__ == "__main__":
    main()

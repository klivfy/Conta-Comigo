#!/usr/bin/env python3
"""Fase 1 — converte loja/politica-de-privacidade.md → docs/politica-de-privacidade.html
Página publicada no GitHub Pages (URL exigida nos cadastros da Play/Store)."""
import os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(ROOT, "download/conta-comigo/loja/politica-de-privacidade.md")
OUT = os.path.join(ROOT, "docs/politica-de-privacidade.html")

md = open(SRC, encoding="utf-8").read()
lines = md.split("\n")
html, in_list, in_para = [], False, False

def close():
    global in_list, in_para
    if in_list:
        html.append("</ul>")
        in_list = False
    if in_para:
        html.append("</p>")
        in_para = False

def inline(t):
    t = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"&lt;(https?://[^ ]+?)&gt;", r'<a href="\1">\1</a>', t)
    t = re.sub(r"\[([^\]]+)\]\((#[a-z]+)\)", r'<a href="\2">\1</a>', t)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    return t

for ln in lines:
    s = ln.rstrip()
    if not s:
        close()
        continue
    h = re.match(r"^(#{1,4})\s+(.*)$", s)
    if h:
        close()
        lvl = min(len(h.group(1)) + 1, 5)  # h1 do md vira h2 da página
        ids = {"Política de Privacidade": "pt", "Privacy Policy": "en", "Política de Privacidad": "es"}
        key = h.group(2).split(" — ")[0]
        idattr = f' id="{ids[key]}"' if len(h.group(1)) == 1 and key in ids else ""
        html.append(f"<h{lvl}{idattr}>{inline(h.group(2))}</h{lvl}>")
        continue
    li = re.match(r"^[-*]\s+(.*)$", s)
    if li:
        if not in_list:
            close()
            html.append("<ul>")
            in_list = True
        html.append(f"<li>{inline(li.group(1))}</li>")
        continue
    if in_list:
        html.append(f"<li>{inline(s.strip())}</li>")
        continue
    if in_para:
        html.append(" " + inline(s.strip()))
    else:
        html.append(f"<p>{inline(s.strip())}")
        in_para = True
close()

page = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Política de Privacidade · Privacy Policy · Política de Privacidad — Conta Comigo</title>
<style>
  body { margin:0; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
         background:#eaf6ff; color:#1f2937; line-height:1.65; }
  main { max-width: 800px; margin: 0 auto; padding: 32px 20px 64px;
         background:#fff; min-height:100vh; }
  h1, h2 { color:#c2410c; } h1 { font-size:1.6em; } h2 { font-size:1.25em; margin-top:1.6em; }
  code { background:#f3f4f6; border-radius:6px; padding:2px 6px; font-size:.92em; }
  a { color:#ea580c; }
  .selo { display:inline-block; background:#16a34a; color:#fff; font-weight:700;
          border-radius:999px; padding:6px 14px; font-size:.85em; margin-bottom:8px; }
  footer { text-align:center; font-size:.85em; color:#6b7280; padding:24px 0 40px; }
</style>
</head>
<body>
<main>
  <div class="selo">✓ 100% offline · zero coleta de dados</div>
""" + "\n".join(html) + """
  <footer>Conta Comigo © 2026 Klivfy Tecnologia · <a href="./index.html">Voltar ao jogo</a></footer>
</main>
</body>
</html>
"""
open(OUT, "w", encoding="utf-8").write(page)
print(f"[OK] {OUT} ({len(page)//1024} KB)")

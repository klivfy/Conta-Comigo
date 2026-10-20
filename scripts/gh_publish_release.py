#!/usr/bin/env python3
"""Cria a Release v2.6.0 no GitHub e anexa os 3 pacotes zip.
Token via variável de ambiente GH_TOKEN (não é gravado em arquivo)."""
import json
import os
import sys
import urllib.error
import urllib.request

REPO = "klivfy/Conta-Comigo"
API = f"https://api.github.com/repos/{REPO}"
TAG = "v2.6.0"
NAME = "v2.6.0 — Responsividade multi-tela + vozes humanizadas + PWA Android"
NOTES = "/home/z/my-project/scripts/release-notes-v2.6.0.md"
BASE = "/home/z/my-project/download"
ZIPS = [
    "conta-comigo-chrome-2.6.0.zip",
    "conta-comigo-firefox-2.6.0.zip",
    "conta-comigo-pwa-android-2.6.0.zip",
]


def req(url, data=None, headers=None, method=None):
    h = {"Authorization": f"Bearer {os.environ['GH_TOKEN']}",
         "Accept": "application/vnd.github+json"}
    h.update(headers or {})
    r = urllib.request.Request(url, data=data, headers=h, method=method)
    return urllib.request.urlopen(r, timeout=120)


def main():
    notes = open(NOTES, encoding="utf-8").read()
    body = json.dumps({"tag_name": TAG, "name": NAME, "body": notes}).encode()

    try:
        with req(f"{API}/releases", data=body, method="POST") as r:
            rel = json.load(r)
        print(f"Release criada: id={rel['id']}")
    except urllib.error.HTTPError as e:
        if e.code == 422:  # release já existe para a tag
            with req(f"{API}/releases/tags/{TAG}") as r:
                rel = json.load(r)
            patch = json.dumps({"name": NAME, "body": notes}).encode()
            with req(f"{API}/releases/{rel['id']}", data=patch, method="PATCH") as r:
                rel = json.load(r)
            print(f"Release já existia — notas atualizadas: id={rel['id']}")
        else:
            print(f"ERRO HTTP {e.code}: {e.read().decode()[:300]}")
            sys.exit(1)

    upload_url = rel["upload_url"].split("{")[0]
    existing = {a["name"] for a in rel.get("assets", [])}

    for name in ZIPS:
        path = os.path.join(BASE, name)
        if name in existing:
            print(f"asset já existe, pulando: {name}")
            continue
        data = open(path, "rb").read()
        with req(f"{upload_url}?name={name}", data=data,
                 headers={"Content-Type": "application/zip"}) as r:
            a = json.load(r)
        print(f"asset enviado: {a['name']} ({a['size'] / 1048576:.1f} MB)")
        print(f"  -> {a['browser_download_url']}")

    print(f"\nURL da release: {rel['html_url']}")


if __name__ == "__main__":
    main()

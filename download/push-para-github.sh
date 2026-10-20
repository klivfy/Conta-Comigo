#!/usr/bin/env bash
# ============================================================
#  Conta Comigo — Publicar no GitHub a partir do bundle
#
#  Uso:
#     ./push-para-github.sh conta-comigo-repo.bundle SEU_TOKEN usuario/nome-do-repo
#
#  Onde:
#     conta-comigo-repo.bundle  = arquivo do repositório (mesma pasta)
#     SEU_TOKEN                 = Personal Access Token (escopo Contents: Read and write)
#     usuario/nome-do-repo      = repositório JÁ CRIADO (pode ser vazio) no github.com
#
#  Requisitos: git instalado. Ex.:  sudo apt install git   |   https://git-scm.com
# ============================================================
set -euo pipefail

[ $# -eq 3 ] || { echo "Uso: $0 conta-comigo-repo.bundle SEU_TOKEN usuario/nome-do-repo"; exit 1; }

BUNDLE="$1"; TOKEN="$2"; REPO="$3"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "==> Clonando a partir do bundle..."
git clone -q "$BUNDLE" "$WORK/conta-comigo"
cd "$WORK/conta-comigo"
git branch -M main

echo "==> Enviando main + tags para github.com/$REPO ..."
# Nota: o token aparece apenas neste comando local; o remote é removido ao final.
git push -q "https://x-access-token:${TOKEN}@github.com/${REPO}.git" main --tags

echo ""
echo "✔ Publicado com sucesso: https://github.com/${REPO}"
echo "  (tag incluída: v2.6.0 — crie o Release a partir dela na aba Releases)"

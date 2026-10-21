#!/usr/bin/env bash
# Fase 1 — Conta Comigo: keystore Android estável (upload key do TWA)
# O fingerprint SHA256 desta chave entra no assetlinks.json (Digital Asset Links).
# AVISO: senha propositalmente documentada no repo (app offline sem backend;
# a Play usa a própria App Signing Key). Para produção, rotacione — ver native/README.md
set -euo pipefail
DIR=/home/z/my-project/native/android/keystore
mkdir -p "$DIR"

if [ ! -f "$DIR/upload.jks" ]; then
  keytool -genkeypair -v \
    -keystore "$DIR/upload.jks" -storetype JKS \
    -alias contacomico \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass contacomico-upload -keypass contacomico-upload \
    -dname "CN=Conta Comigo, OU=Klivfy Tecnologia, O=Klivfy Tecnologia, L=Sao Paulo, ST=SP, C=BR"
  echo "[OK] keystore criado"
else
  echo "[OK] keystore já existia"
fi

# fingerprint p/ assetlinks.json
keytool -list -v -keystore "$DIR/upload.jks" -storepass contacomico-upload -alias contacomico \
  | sed -n 's/.*SHA256: //p' | head -1 > "$DIR/sha256.txt"
echo "SHA256: $(cat "$DIR/sha256.txt")"

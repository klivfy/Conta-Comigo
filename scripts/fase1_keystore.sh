#!/usr/bin/env bash
# Conta Comigo — gera a upload key Android FORA do repositório.
# Uso: bash scripts/fase1_keystore.sh <caminho/upload.jks> [alias]
# Depois siga native/android/keystore/README.md (GitHub Secrets + assetlinks.json).
set -euo pipefail
KS=${1:?informe o caminho do keystore, ex.: ~/conta-comigo-keys/upload.jks}
ALIAS=${2:-contacomigo-upload}
REPO=$(cd "$(dirname "$0")/.." && pwd)

case "$(cd "$(dirname "$KS")" 2>/dev/null && pwd)/" in
  "$REPO"/*) echo "[ERRO] o keystore não pode ficar dentro do repositório"; exit 1 ;;
esac
[ -e "$KS" ] && { echo "[ERRO] $KS já existe"; exit 1; }
mkdir -p "$(dirname "$KS")"

read -rsp "Senha do keystore (mín. 12 caracteres): " PASS; echo
read -rsp "Repita a senha: " PASS2; echo
[ "$PASS" = "$PASS2" ] || { echo "[ERRO] senhas diferentes"; exit 1; }
[ ${#PASS} -ge 12 ] || { echo "[ERRO] senha curta demais"; exit 1; }
export PASS

keytool -genkeypair -v -keystore "$KS" -storetype PKCS12 -alias "$ALIAS" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass:env PASS -keypass:env PASS \
  -dname "CN=Conta Comigo, OU=Klivfy Tecnologia, O=Klivfy Tecnologia, L=Sao Paulo, ST=SP, C=BR"
chmod 600 "$KS"

echo
echo "Alias: $ALIAS"
echo "SHA256 (para assetlinks.json):"
keytool -list -v -keystore "$KS" -storepass:env PASS -alias "$ALIAS" | sed -n 's/.*SHA256: //p' | head -1
echo
echo "Secret ANDROID_KEYSTORE_BASE64:  base64 -w0 \"$KS\""

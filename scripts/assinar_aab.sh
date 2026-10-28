#!/usr/bin/env bash
# Conta Comigo — assina um .aab (sem assinatura) com a upload key, para enviar ao Google Play.
# Uso: bash scripts/assinar_aab.sh <app-release.aab> <caminho/upload.jks> [alias]
# A chave vem de scripts/fase1_keystore.sh. A senha é pedida aqui e não é gravada em lugar nenhum.
# Precisa do JDK (keytool e jarsigner). Gera <app-release>-assinado.aab ao lado do original.
set -euo pipefail
AAB=${1:?informe o .aab, ex.: conta-comigo-2.6.3-263-sem-assinatura.aab}
KS=${2:?informe o keystore, ex.: ~/conta-comigo-keys/upload.jks}
ALIAS=${3:-contacomigo-upload}
[ -f "$AAB" ] || { echo "[ERRO] $AAB não existe"; exit 1; }
[ -f "$KS" ] || { echo "[ERRO] $KS não existe — gere com: bash scripts/fase1_keystore.sh $KS"; exit 1; }
command -v jarsigner >/dev/null || { echo "[ERRO] jarsigner não encontrado (instale um JDK 17+)"; exit 1; }

OUT="${AAB%.aab}-assinado.aab"
[ -e "$OUT" ] && { echo "[ERRO] $OUT já existe"; exit 1; }
read -rsp "Senha do keystore: " PASS; echo
export PASS
cp "$AAB" "$OUT"
jarsigner -keystore "$KS" -storepass:env PASS -keypass:env PASS \
  -sigalg SHA256withRSA -digestalg SHA-256 "$OUT" "$ALIAS" >/dev/null
jarsigner -verify "$OUT" | grep -q "jar verified" || { echo "[ERRO] a assinatura não confere"; rm -f "$OUT"; exit 1; }

echo "[OK] $OUT"
echo "SHA256 da upload key (para conferir no Play Console):"
keytool -list -v -keystore "$KS" -storepass:env PASS -alias "$ALIAS" | sed -n 's/.*SHA256: //p' | head -1

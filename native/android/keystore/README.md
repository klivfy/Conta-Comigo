# Keystore Android — Conta Comigo (upload key)

O keystore **não fica no repositório**. A chave anterior (`upload.jks`, alias
`contacomico`) foi publicada junto com a senha e deve ser considerada
**comprometida**: não a use mais. Ela continua no histórico do Git, por isso a
única correção é a rotação abaixo.

## 1. Gerar a nova chave (fora do repositório)

```bash
bash scripts/fase1_keystore.sh ~/conta-comigo-keys/upload.jks
```

O script pede a senha (não a grava em lugar nenhum) e imprime o fingerprint SHA256.
Guarde o `.jks` e a senha num cofre (ex.: 1Password). Se perder a chave, o
Google Play permite resetar a upload key pelo suporte.

## 2. Cadastrar os GitHub Secrets

Em *Settings → Secrets and variables → Actions*:

| Secret                    | Valor                                              |
|---------------------------|----------------------------------------------------|
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 ~/conta-comigo-keys/upload.jks`        |
| `ANDROID_KEYSTORE_PASS`   | senha do keystore                                  |
| `ANDROID_KEY_ALIAS`       | alias (padrão do script: `contacomigo-upload`)     |
| `ANDROID_KEY_PASS`        | senha da chave (o script usa a mesma do keystore)  |

## 3. Atualizar o fingerprint

Troque o valor em `sha256_cert_fingerprints` de `native/android/assetlinks.json`
pelo fingerprint novo e republique o site. O workflow Android falha se o
keystore e o `assetlinks.json` divergirem.

## Build local

Exporte as mesmas variáveis antes do Gradle (ou defina `contaComigo.keystorePath`,
`contaComigo.keystorePass`, `contaComigo.keyAlias`, `contaComigo.keyPass` em
`~/.gradle/gradle.properties`):

```bash
export ANDROID_KEYSTORE_PATH=~/conta-comigo-keys/upload.jks
export ANDROID_KEYSTORE_PASS=... ANDROID_KEY_ALIAS=contacomigo-upload ANDROID_KEY_PASS=...
cd native/android && gradle assembleRelease bundleRelease
```

Sem essas variáveis o release é gerado **sem assinatura**.

## Enviar ao Google Play sem passar pelo GitHub Actions

Se ainda não há GitHub Secrets, dá para gerar o `.aab` sem assinatura (`cd native/android && gradle bundleRelease`, saída em `app/build/outputs/bundle/release/app-release.aab`) e assiná-lo no seu computador:

```bash
bash scripts/fase1_keystore.sh ~/conta-comigo-keys/upload.jks          # só na primeira vez
bash scripts/assinar_aab.sh app-release.aab ~/conta-comigo-keys/upload.jks
```

O resultado (`app-release-assinado.aab`) é o arquivo que o Play Console aceita. Na primeira vez, o Play registra essa chave como upload key; mantenha o `.jks` e a senha num cofre.

No **Windows (PowerShell)** não há `bash`: use `scripts/assinar_aab.ps1`, que cria a chave (se não existir) e assina de uma vez:

```powershell
powershell -ExecutionPolicy Bypass -File assinar_aab.ps1 -Aab app-release.aab
```

Precisa de um JDK 17+ (`winget install EclipseAdoptium.Temurin.21.JDK`). A chave fica em `%USERPROFILE%\conta-comigo-keys\upload.jks`.

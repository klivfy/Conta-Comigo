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

## 3. Conferir o fingerprint no Play Console

O app leva o jogo dentro do pacote, então não há `assetlinks.json` para atualizar. Basta
conferir, em *Play Console → Integridade do app → Assinatura de apps*, que o SHA-256 da
**chave de upload** é o mesmo que o script imprimiu.

## Build local

Exporte as mesmas variáveis antes do Gradle (ou defina `contaComigo.keystorePath`,
`contaComigo.keystorePass`, `contaComigo.keyAlias`, `contaComigo.keyPass` em
`~/.gradle/gradle.properties`):

```bash
export ANDROID_KEYSTORE_PATH=~/conta-comigo-keys/upload.jks
export ANDROID_KEYSTORE_PASS=... ANDROID_KEY_ALIAS=contacomigo-upload ANDROID_KEY_PASS=...
python3 scripts/build_android_www.py
cd native/android && npm ci && npx cap sync android
cd android && ./gradlew assembleRelease bundleRelease
```

Sem essas variáveis o release é gerado **sem assinatura**.

## Enviar ao Google Play sem passar pelo GitHub Actions

Se ainda não há GitHub Secrets, o workflow **Android (Capacitor)** gera o `.aab` sem assinatura (artefato `conta-comigo-android-<versão>-sem-assinatura`). Também dá para gerá-lo localmente (comandos acima, saída em `native/android/android/app/build/outputs/bundle/release/app-release.aab`). Depois, assine no seu computador:

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

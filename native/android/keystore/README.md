# Keystore Android — Conta Comigo (upload key)

| Campo       | Valor                    |
|-------------|--------------------------|
| Arquivo     | `upload.jks`             |
| Alias       | `contacomico`            |
| Store pass  | `contacomico-upload`     |
| Key pass    | `contacomico-upload`     |
| Validade    | 10.000 dias (até ~2053)  |
| SHA256      | `C7:33:72:0C:57:CC:9B:BA:9F:07:67:A9:A6:0C:EA:38:29:0A:49:5A:15:F0:79:A9:24:8B:45:BC:E4:C6:D7:E9` |

## Por que a chave está versionada no repositório?

Decisão consciente da Fase 1: o Conta Comigo é um app **100% offline, sem
servidores, sem contas e sem compras** — a chave não protege nada além da
assinatura do APK/AAB. Versioná-la permite que o **GitHub Actions gere builds
reprodutíveis** com o mesmo fingerprint, que é o que o `assetlinks.json`
(Digital Asset Links) exige para o TWA abrir em tela cheia sem barra de URL.

## Quando rotacionar?

Antes de publicar na Play Store com pretenção comercial, recomenda-se:

1. Gerar um novo keystore **fora** do repositório:
   ```bash
   keytool -genkeypair -v -keystore upload-prod.jks -alias contacomico-prod \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -storepass <SENHA_FORTE> -dname "CN=Conta Comigo, O=Klivfy Tecnologia, C=BR"
   ```
2. Salvar como **GitHub Secrets**: `ANDROID_KEYSTORE_BASE64`,
   `ANDROID_KEYSTORE_PASS`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASS`.
3. Atualizar `sha256_cert_fingerprints` no `assetlinks.json` e no
   `strings.xml` com o novo fingerprint (`keytool -list -v`).
4. Redeployar o site (workflow "Site (GitHub Pages)").

Na Play Store, o **App Signing do Google** assina o pacote final com chave
própria — a upload key apenas autentica quem envia; se vazar, é resetável
junto ao suporte do Google Play.

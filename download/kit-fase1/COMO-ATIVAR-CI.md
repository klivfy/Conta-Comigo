# Kit da Fase 1 — Ativação do CI (Android · Windows · GitHub Pages)

O código dos pacotes nativos **já está no GitHub** (commit `8af3947`):
`native/android/` (TWA), `native/windows/` (Electron), keystore + `assetlinks.json`.

Falta apenas enviar os **3 workflows** (commit local `b5f9e94`, já pronto) —
o GitHub exige um token com escopo **Workflows** para aceitar arquivos em
`.github/workflows/`, e o token atual (só Contents) não tem.

---

## Caminho A (recomendado — 2 minutos, tudo automático depois)

1. GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate new token
2. Permissões mínimas para o repo `klivfy/Conta-Comigo`:
   | Permissão      | Acesso | Para quê |
   |---|---|---|
   | **Contents**   | Read and write | push (já tinha) |
   | **Workflows**  | Read and write | enviar os 3 workflows |
   | **Administration** | Read and write *(opcional)* | habilitar Pages + About/topics pela API |
3. **Revogue o token antigo** (ele passou pelo histórico do chat).
4. Cole o novo token aqui no chat → eu envio o commit `b5f9e94` e o CI
   dispara sozinho os 3 builds.

## Caminho B (manual, sem novo token)

1. No GitHub, entre em **Add file → Create new file** (3 vezes) e cole o
   conteúdo dos arquivos deste kit:
   - `.github/workflows/pages.yml` ← `workflows/pages.yml`
   - `.github/workflows/android.yml` ← `workflows/android.yml`
   - `.github/workflows/windows.yml` ← `workflows/windows.yml`
   (commit direto no `main`)
2. Depois **apague o commit local duplicado**: me avise e eu sincronizo
   (`git pull --rebase`) — ou rode `git pull --rebase origin main`.

## Passo único obrigatório (qualquer caminho): habilitar o Pages

Repo → **Settings → Pages → Build and deployment → Source: "GitHub Actions"**
(exige permissão de administração no repositório; a API devolveu 403 com o
token atual — por isso é um clique manual).

Sem isso, o workflow "Site (GitHub Pages)" falha no deploy; Android e Windows
funcionam independentemente.

---

## O que acontece quando o CI rodar

| Workflow | Resultado (aba **Actions → artefatos**) |
|---|---|
| Android (TWA) | `conta-comigo-android-2.6.0`: APK (sideload) + AAB (Play Console) |
| Windows (Electron) | `conta-comigo-windows-2.6.0`: instalador NSIS + portable (x64) |
| Site (GitHub Pages) | https://klivfy.github.io/Conta-Comigo/ + `.well-known/assetlinks.json` + política de privacidade |

Fingerprint já validado localmente e conferido no CI a cada build:
`C7:33:72:0C:57:CC:9B:BA:9F:07:67:A9:A6:0C:EA:38:29:0A:49:5A:15:F0:79:A9:24:8B:45:BC:E4:C6:D7:E9`

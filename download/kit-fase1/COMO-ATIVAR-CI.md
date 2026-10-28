# Kit da Fase 1 — Ativação do CI (Android · Windows · GitHub Pages)

O código dos pacotes nativos **já está no GitHub** (commit `8af3947`):
`native/android/` (hoje Capacitor, com o jogo dentro do app; era TWA), `native/windows/` (Electron) e o guia do keystore.

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
   - `.github/workflows/ci.yml` ← `workflows/ci.yml` (build + acessibilidade em todo PR)
   (commit direto no `main`)
2. Depois **apague o commit local duplicado**: me avise e eu sincronizo
   (`git pull --rebase`) — ou rode `git pull --rebase origin main`.

## Passo único obrigatório (qualquer caminho): habilitar o Pages

Repo → **Settings → Pages → Build and deployment → Source: "GitHub Actions"**
(exige permissão de administração no repositório; a API devolveu 403 com o
token atual — por isso é um clique manual).

Sem isso, o workflow "Site (GitHub Pages)" falha no deploy; Android e Windows
funcionam independentemente.

## Secrets do Android (obrigatório para o workflow Android)

A upload key não fica mais no repositório. Cadastre `ANDROID_KEYSTORE_BASE64`,
`ANDROID_KEYSTORE_PASS`, `ANDROID_KEY_ALIAS` e `ANDROID_KEY_PASS` em
*Settings → Secrets and variables → Actions* — passo a passo em
`native/android/keystore/README.md`.

---

## O que acontece quando o CI rodar

| Workflow | Resultado (aba **Actions → artefatos**) |
|---|---|
| Android (Capacitor) | `conta-comigo-android-<versão>`: APK (sideload) + AAB (Play Console); sem os secrets, `…-sem-assinatura` |
| Windows (Electron) | `conta-comigo-windows-2.6.0`: instalador NSIS + portable (x64) |
| Site (GitHub Pages) | https://klivfy.github.io/Conta-Comigo/ + política de privacidade |

O app Android não usa mais `assetlinks.json` (o jogo vai dentro do pacote), então o CI não confere fingerprint. A chave antiga foi publicada e está **comprometida**: gere outra (`native/android/keystore/README.md`).

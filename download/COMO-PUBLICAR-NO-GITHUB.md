# Publicar o projeto "Conta Comigo" no GitHub

O repositório está pronto: histórico completo, commit `v2.6.0` e tag `v2.6.0` (12,4 MB, 100% compatível com o GitHub). Só falta a autenticação — **a conta é sua e nenhum assistente pode criá-la ou autenticar-se por você**. Escolha um dos 3 caminhos:

---

## Caminho A — Mais rápido: me envie o token (eu faço tudo)

1. Acesse **github.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
2. Em *Repository access*, escolha **"Only select repositories"** e selecione o repositório (ou crie um novo em github.com/new, pode ser vazio, sem README)
3. Em *Permissions → Contents*, marque **Read and write**
4. Validade curta (7 dias) → **Generate token** → copie (começa com `github_pat_…`)
5. Envie-me uma mensagem: **o token + `usuario/nome-do-repo`**

Eu adiciono o remote, envio `main` + tag `v2.6.0` e confirmo o link. Depois disso, **revogue o token** em Settings → Developer settings.

---

## Caminho B — Você mesmo, sem terminal (interface web)

1. Baixe `conta-comigo-repo.bundle` e instale o Git (https://git-scm.com/downloads)
2. Crie um repositório vazio em https://github.com/new (sem README/licença)
3. Numa pasta com o bundle, rode:
   ```bash
   git clone conta-comigo-repo.bundle conta-comigo
   cd conta-comigo
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
   git push -u origin main --tags     # pedirá login: use seu usuário + o token como senha
   ```

---

## Caminho C — Script automático

Com `conta-comigo-repo.bundle` e `push-para-github.sh` na mesma pasta:

```bash
chmod +x push-para-github.sh
./push-para-github.sh conta-comigo-repo.bundle SEU_TOKEN usuario/nome-do-repo
```

---

## Após publicar (recomendado)

- **Release**: aba *Releases → Draft a new release → escolha a tag `v2.6.0`* e anexe os zips `conta-comigo-chrome-2.6.0.zip`, `conta-comigo-firefox-2.6.0.zip` e `conta-comigo-pwa-android-2.6.0.zip`
- **Segurança**: se usou token em conversa ou terminal, revogue-o; tokens fine-grained limitados ao repositório minimizam risco
- **Autor dos commits**: para vincular os commits à sua conta, me informe seu nome/e-mail do GitHub que eu ajusto (`git config`)

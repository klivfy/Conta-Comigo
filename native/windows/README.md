# Conta Comigo — Windows (Electron)

Pacote nativo Windows 10/11 gerado pelo electron-builder a partir do mesmo
motor do jogo (PWA copiada para `app/` pelo CI).

## Estrutura

| Arquivo | Papel |
|---|---|
| `main.js` | janela do jogo (sandbox + contextIsolation, offline, sem menu) |
| `package.json` | dependências + config electron-builder (NSIS + portable) |
| `build/icon.ico` | ícone do app/exe/atalho (multi-tamanho 16–256 px) |
| `app/` | gerado no CI (PWA de `scripts/build_pwa.py`) — **não versionado** |

## Build no CI (recomendado)

Push em `native/windows/**` (ou aba Actions → "Windows (Electron)" → Run
workflow) → artefato `conta-comigo-windows-<versão>` com:

- `Conta-Comigo-2.6.0-x64.exe` — instalador NSIS (por usuário, atalhos, escolhe pasta)
- `Conta-Comigo-2.6.0-portable.exe` — executável único, sem instalação

## Build local (opcional)

```bash
python scripts/build_pwa.py                        # gera download/conta-comigo-pwa (versão do manifest)
mkdir -p native/windows/app
cp -r download/conta-comigo-pwa/* native/windows/app/
rm -f native/windows/app/leia-me-android.md
cd native/windows && npm ci && npm run dist         # saída em native/windows/dist/
```

## Notas técnicas

- Sem `nodeIntegration`; `sandbox: true`; navegação externa bloqueada
  (`setWindowOpenHandler` + `will-navigate`) — app 100% offline.
- `electron-builder --publish never`: nada é enviado a lojas automaticamente.
- Futuro (otimização): Tauri 2 reduz o binário de ~90 MB para < 10 MB —
  ver estudo de viabilidade, seção "Custo e esforço".

## Pacote da Microsoft Store (MSIX/APPX)

O build gera também `Conta-Comigo-<versão>-store.appx` (x64). Para enviar à loja:

1. No Partner Center, reserve o nome "Conta Comigo" e copie, em *Gerenciamento de produto > Identidade do produto*, os valores `Package/Identity/Name`, `Package/Identity/Publisher` e `PublisherDisplayName`.
2. No GitHub, em *Settings > Secrets and variables > Actions > Variables*, crie `APPX_IDENTITY_NAME`, `APPX_PUBLISHER` e `APPX_PUBLISHER_DISPLAY_NAME` com esses valores.
3. Rode o workflow "Windows" e baixe o `.appx` do artefato. Envie-o em *Envios > Pacotes*.

Sem as variáveis, o pacote sai com identidade de teste e só serve para validar o empacotamento. A loja assina o pacote, então não é preciso certificado próprio. Os `.exe` (NSIS/portable) são para distribuição direta e continuam sem assinatura.

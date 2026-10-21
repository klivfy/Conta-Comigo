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
python scripts/build_pwa.py VERSION=2.6.0          # gera download/conta-comigo-pwa
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

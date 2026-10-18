'use strict';
/* ==================== Conta Comigo v2.1 — background (MV3) ====================
   O ícone da extensão NÃO tem mais popup: o clique dispara
   chrome.action.onClicked e abre SEMPRE o jogo numa janela nativa própria
   em tela cheia (type:'popup' + state:'fullscreen'). Se a janela do jogo
   já existir, ela é focada e re-maximizada em tela cheia.
   O atalho global Ctrl+Shift+U / ⌘⇧U (S34) usa o mesmo caminho.
   Chromium lê background.service_worker; Firefox (MV3, 109+) lê
   background.scripts (event page) — o manifest declara os dois. */

let gameWinId = null;

function openGame() {
  const url = chrome.runtime.getURL('game.html');

  const focusOrFs = (win) => {
    if (!win || win.id == null) return;
    gameWinId = win.id;
    try {
      chrome.windows.update(win.id, { focused: true, state: 'fullscreen' }, () => { void chrome.runtime.lastError; });
    } catch (e) { /* ignora */ }
  };

  const create = () => {
    try {
      chrome.windows.create({ url, type: 'popup', focused: true, state: 'fullscreen' }, (win) => {
        void chrome.runtime.lastError;
        // Reforça tela cheia no callback (ajuda no Firefox, que pode
        // ignorar state:'fullscreen' no create).
        focusOrFs(win);
      });
    } catch (e) {
      // último recurso: abre como aba normal (nunca popup de extensão)
      try { chrome.tabs.create({ url }); } catch (e2) { /* ignora */ }
    }
  };

  if (gameWinId != null) {
    try {
      chrome.windows.get(gameWinId, (win) => {
        if (chrome.runtime.lastError || !win) { gameWinId = null; create(); return; }
        focusOrFs(win);
      });
    } catch (e) { create(); }
  } else {
    create();
  }
}

try {
  chrome.windows.onRemoved.addListener((id) => { if (id === gameWinId) gameWinId = null; });
} catch (e) { /* ignora */ }

try {
  chrome.action.onClicked.addListener(openGame);
} catch (e) { /* ignora */ }

try {
  chrome.commands.onCommand.addListener((cmd) => { if (cmd === 'abrir-conta-comigo') openGame(); });
} catch (e) { /* ignora */ }

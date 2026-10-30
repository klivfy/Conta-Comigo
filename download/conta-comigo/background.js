'use strict';
/* ==================== Conta Comigo v2.2 — background (MV3) ====================
   O ícone da extensão NÃO tem mais popup: o clique dispara
   chrome.action.onClicked e abre SEMPRE o jogo numa janela nativa própria
   em tela cheia (type:'popup' + state:'fullscreen'). Se a janela do jogo
   já existir, ela é focada e re-maximizada em tela cheia.
   O atalho global Ctrl+Shift+U / ⌘⇧U (S34) usa o mesmo caminho.
   Builds separadas por navegador: a build Chromium declara apenas
   background.service_worker (o Chrome rejeita 'background.scripts' no MV3);
   a build Firefox declara background.scripts (event page) + gecko id.
   Este arquivo é idêntico nas duas — usa apenas APIs comuns. */

let gameWinId = null;

/* ADR-001: no MV3 o service worker dorme depois de ~30 s e esquece a variável; o id da janela
   fica em storage.session (não pede permissão nova, ao contrário de buscar a aba por URL) */
function lerGameWin(cb) {
  if (gameWinId != null) { cb(gameWinId); return; }
  try {
    chrome.storage.session.get('ccGameWin', (r) => { void chrome.runtime.lastError; cb(r && r.ccGameWin != null ? r.ccGameWin : null); });
  } catch (e) { cb(null); }
}
function gravarGameWin(id) {
  gameWinId = id;
  try { chrome.storage.session.set({ ccGameWin: id }, () => { void chrome.runtime.lastError; }); } catch (e) { /* ignora */ }
}

function openGame() {
  const url = chrome.runtime.getURL('game.html');

  /* v2.5 (Android): o Firefox para Android não tem a API windows — abre numa
     aba normal (a página de jogo já é responsiva e tem viewport própria). */
  if (typeof chrome.windows === 'undefined' || !chrome.windows.create) {
    try { chrome.tabs.create({ url }); } catch (e) { /* ignora */ }
    return;
  }

  const focusOrFs = (win) => {
    if (!win || win.id == null) return;
    gravarGameWin(win.id);
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

  lerGameWin((id) => {
    if (id == null) { create(); return; }
    try {
      chrome.windows.get(id, (win) => {
        if (chrome.runtime.lastError || !win) { gravarGameWin(null); create(); return; }
        focusOrFs(win);
      });
    } catch (e) { create(); }
  });
}

try {
  chrome.windows.onRemoved.addListener((id) => { lerGameWin((cur) => { if (id === cur) gravarGameWin(null); }); });
} catch (e) { /* ignora */ }

try {
  chrome.action.onClicked.addListener(openGame);
} catch (e) { /* ignora */ }

try {
  chrome.commands.onCommand.addListener((cmd) => { if (cmd === 'abrir-conta-comigo') openGame(); });
} catch (e) { /* ignora */ }

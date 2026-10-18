'use strict';
/* ==================== Conta Comigo v2.0 — service worker (S34) ====================
   Atalho global de teclado abre o jogo em janela nativa em tela cheia.
   (Firefox 109–120 não suporta service worker MV3: o atalho fica para
   Chromium e Firefox 121+; o jogo continua abrindo pelo ícone da extensão.) */

chrome.commands && chrome.commands.onCommand.addListener((cmd) => {
  if (cmd !== 'abrir-conta-comigo') return;
  try {
    chrome.windows.create({
      url: chrome.runtime.getURL('game.html'),
      type: 'popup',
      focused: true,
      state: 'fullscreen',
    }, () => { void chrome.runtime.lastError; });
  } catch (e) { /* ignora */ }
});

'use strict';
/* Conta Comigo — Windows (Electron) — janela do jogo, 100% offline.
 * Carrega app/index.html (PWA gerada por scripts/build_pwa.py, copiada pelo CI).
 * Sem rede, sem telemetria; só os 3 canais oficiais abrem no navegador do sistema. © 2026 Klivfy Tecnologia. */
const { app, BrowserWindow, Menu, nativeTheme, shell } = require('electron');
const path = require('path');

/* Mesmos endereços de LEGAL em js/engine.js (tests/engine.test.cjs confere que não se afastam). */
const LEGAL_URLS = [
  'https://klivfy.com/privacidade',
  'https://klivfy.com/termos-de-uso',
  'https://klivfy.com/suporte',
];

let win = null;

/* Zoom: sem menu somem os atalhos padrão, então o app trata Ctrl+= / Ctrl++ /
 * Ctrl+− / Ctrl+0 e Ctrl+roda do mouse. Mesmos degraus do Chrome, até 300%
 * (a HIG e a WCAG pedem texto ampliável a pelo menos 200%). */
const ZOOM_STEPS = [0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3];
function stepZoom(wc, dir) {
  const cur = wc.getZoomFactor();
  let i = ZOOM_STEPS.findIndex((z) => z >= cur - 0.001);
  if (i < 0) i = ZOOM_STEPS.length - 1;
  if (dir === 0) i = ZOOM_STEPS.indexOf(1);
  else if (dir > 0) i = Math.min(ZOOM_STEPS.length - 1, ZOOM_STEPS[i] > cur + 0.001 ? i : i + 1);
  else i = Math.max(0, i - 1);
  wc.setZoomFactor(ZOOM_STEPS[i]);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 832,
    minWidth: 480,
    minHeight: 400,
    // mesma cor do fundo do tema automático (Clássico ou Espaço): sem clarão no modo escuro
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#131a33' : '#eaf6ff',
    icon: path.join(__dirname, 'build', 'icon.ico'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  Menu.setApplicationMenu(null);
  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(__dirname, 'app', 'index.html'));

  const wc = win.webContents;
  wc.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown' || !(input.control || input.meta) || input.alt) return;
    const k = input.key;
    if (k === '+' || k === '=') stepZoom(wc, 1);
    else if (k === '-' || k === '_') stepZoom(wc, -1);
    else if (k === '0') stepZoom(wc, 0);
    else return;
    e.preventDefault();
  });
  wc.on('zoom-changed', (e, dir) => stepZoom(wc, dir === 'in' ? 1 : -1));

  // App offline: bloqueia pop-ups e navegação externa
  wc.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('file://')) return { action: 'allow' };
    // única saída: os três canais oficiais (Privacidade, Termos e Suporte), no navegador do sistema.
    // O jogo só chega aqui depois da conferência para adultos; qualquer outro endereço segue negado.
    if (LEGAL_URLS.includes(url)) shell.openExternal(url).catch(() => { /* sem navegador: nada a fazer */ });
    return { action: 'deny' };
  });
  wc.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) e.preventDefault();
  });

  win.on('closed', () => { win = null; });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => app.quit());

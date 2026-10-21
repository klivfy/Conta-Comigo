'use strict';
/* Conta Comigo — Windows (Electron) — janela do jogo, 100% offline.
 * Carrega app/index.html (PWA gerada por scripts/build_pwa.py, copiada pelo CI).
 * Sem rede, sem telemetria, sem navegação externa. © 2026 Klivfy Tecnologia. */
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 832,
    minWidth: 480,
    minHeight: 400,
    backgroundColor: '#eaf6ff',
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

  // App offline: bloqueia pop-ups e navegação externa
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('file://')) return { action: 'allow' };
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
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

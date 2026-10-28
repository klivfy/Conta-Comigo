#!/usr/bin/env node
/* Capturas de tela para as lojas (Chrome, Edge, Firefox, Microsoft Store, Google Play)
   nos 3 idiomas. Serve a PWA gerada (python scripts/build_pwa.py) e salva em
   download/conta-comigo/loja/imagens/<idioma>/<formato>/NN-cena.png.
   Uso: node scripts/loja_capturas.cjs [pt|en|es ...]   (precisa de playwright) */
'use strict';
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PWA = path.join(ROOT, 'download', 'conta-comigo-pwa');
const OUT = path.join(ROOT, 'download', 'conta-comigo', 'loja', 'imagens');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

/* formato -> viewport (CSS px) × escala = tamanho final em pixels */
const FORMATS = {
  'desktop-1280x800':   { w: 1280, h: 800, dpr: 1, mobile: false, scenes: 8 },   // Chrome, Edge, Firefox
  'desktop-1920x1080':  { w: 960, h: 540, dpr: 2, mobile: false, scenes: 8 },    // Microsoft Store
  'celular-1080x1920':  { w: 360, h: 640, dpr: 3, mobile: true, scenes: 8 },     // Google Play (celular)
  'tablet7-1200x1920':  { w: 600, h: 960, dpr: 2, mobile: true, scenes: 6 },     // Google Play (tablet 7")
  'tablet10-1600x2560': { w: 800, h: 1280, dpr: 2, mobile: true, scenes: 6 },    // Google Play (tablet 10")
};
const LANGS = process.argv.slice(2).length ? process.argv.slice(2) : ['pt', 'en', 'es'];

const SCENES = [
  ['inicio', () => { show('home'); renderHome(); }],
  ['contar', () => startRound('contar')],
  ['comparar', () => startRound('comparar')],
  ['historia', () => startRound('historia')],
  ['dinheiro', () => startRound('dinheiro')],
  ['fim-de-rodada', async () => {
    startRound('somar');
    for (let i = 0; i < R.total; i++) {
      const ok = [...document.querySelectorAll('#answers button')].find((b) => b.dataset.v === String(R.current.answer));
      onAnswer(ok); await new Promise((r) => setTimeout(r, 2200));
      if (document.querySelector('#screen-end.active')) break;
    }
    await new Promise((r) => setTimeout(r, 1500)); hideOverlay(); await new Promise((r) => setTimeout(r, 300));
  }],
  ['loja', () => { show('shop'); renderShop(); }],
  ['conquistas', () => { show('ach'); renderAch(); }],
];

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
      const file = path.join(PWA, rel);
      if (!file.startsWith(PWA) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

const LVL = {}; ['contar', 'somar', 'comparar', 'subtrair', 'faltar', 'sequencia', 'dobrar', 'multiplicar', 'dividir', 'historia', 'dinheiro'].forEach((m, i) => {
  LVL[m] = {}; for (let l = 1; l <= 5 - (i % 4); l++) LVL[m][l] = { r: 9 - (l > 3 ? 4 : 0) + (i % 2), w: l > 3 ? 4 : l === 3 ? 2 : 0 };
});
const seed = (lang) => ({ v: 2, activeId: 'p1', profiles: [
  { id: 'p1', name: { pt: 'Bia', en: 'Mia', es: 'Lía' }[lang], avatar: '🦊', stars: 132, points: 640, streak: 5, lastPlay: new Date().toISOString().slice(0, 10),
    rounds: 24, rights: 180, wrongs: 22, playSec: 4300, bestCombo: 9, assessed: true,
    levels: { contar: 3, somar: 3, comparar: 2, subtrair: 2, faltar: 2, sequencia: 2, dobrar: 1, multiplicar: 1, dividir: 1, historia: 1, dinheiro: 1 },
    lvl: LVL, ach: { a1: 1, a2: 1, a3: 1, a4: 1, a5: 1 }, chests: { 3: 1 }, owned: { themes: ['classico', 'espaco', 'jardim'], hats: [], pets: ['fox', 'panda'] } },
  { id: 'p2', name: 'Theo', avatar: '🐼', stars: 8 }], settings: { lang, calmo: true, theme: 'classico', voiceOn: false, sfxOn: false, newtabOn: false } });

(async () => {
  if (!fs.existsSync(path.join(PWA, 'index.html'))) { console.error('rode antes: python scripts/build_pwa.py'); process.exit(2); }
  const srv = await serve(); const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const b = await chromium.launch(); let n = 0;
  for (const lang of LANGS) for (const [fmt, f] of Object.entries(FORMATS)) {
    const dir = path.join(OUT, lang, fmt); fs.mkdirSync(dir, { recursive: true });
    const ctx = await b.newContext({ viewport: { width: f.w, height: f.h }, deviceScaleFactor: f.dpr, isMobile: f.mobile, hasTouch: f.mobile, locale: { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }[lang], reducedMotion: 'reduce' });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(base + 'index.html');
    await p.evaluate((s) => { localStorage.clear(); localStorage.setItem('cc_state', JSON.stringify(s)); }, seed(lang));
    await p.reload(); await p.waitForTimeout(600);
    const scenes = SCENES.slice(0, f.scenes);
    for (let i = 0; i < scenes.length; i++) {
      const [name, fn] = scenes[i];
      await p.evaluate(() => { try { hideOverlay(); } catch (e) { /* ok */ } show('home'); });
      await p.addStyleTag({ content: '*{animation:none!important;transition:none!important}#toast{display:none!important}' }).catch(() => {});
      await p.evaluate(fn); await p.waitForTimeout(450);
      await p.screenshot({ path: path.join(dir, String(i + 1).padStart(2, '0') + '-' + name + '.png') }); n++;
    }
    /* o baú da ofensiva de 3 dias já foi aberto no seed (chests): sem ele, o aviso do baú aparecia por cima da Loja */
    // painel dos responsáveis (options.html), já destravado
    if (f.scenes >= 8) {
      await p.goto(base + 'options.html'); await p.waitForTimeout(500);
      await p.evaluate(() => { try { showContent(); } catch (e) { /* ok */ } });
      await p.addStyleTag({ content: '*{animation:none!important;transition:none!important}#toast{display:none!important}' });
      await p.waitForTimeout(400);
      await p.screenshot({ path: path.join(dir, '09-painel-responsaveis.png') }); n++;
    }
    for (const e of errs) console.log(lang, fmt, 'erro de JS:', e);
    await ctx.close();
  }
  await b.close(); srv.close();
  console.log('OK — ' + n + ' capturas em ' + path.relative(ROOT, OUT));
})();

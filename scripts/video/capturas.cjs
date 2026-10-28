'use strict';
/* Capturas extras para o vídeo (pt-BR): contagem por toque, acerto, temas, acessibilidade, senha.
   Uso: node capturas.cjs <pasta de saída>   (precisa da PWA: python scripts/build_pwa.py) */
const fs = require('fs'), http = require('http'), path = require('path');
const { chromium } = require('playwright');
const PWA = path.join(__dirname, '..', '..', 'download', 'conta-comigo-pwa');
const OUT = process.argv[2];
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(PWA, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html'); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const LVL = {}; ['contar', 'somar', 'comparar', 'subtrair', 'faltar', 'sequencia', 'dobrar', 'multiplicar', 'dividir', 'historia', 'dinheiro'].forEach((m, i) => { LVL[m] = {}; for (let l = 1; l <= 5 - (i % 4); l++) LVL[m][l] = { r: 9 + (i % 2), w: l > 3 ? 4 : l === 3 ? 2 : 0 }; });
const seed = (extra) => ({ v: 2, activeId: 'p1', profiles: [
  { id: 'p1', name: 'Bia', avatar: '🦊', stars: 132, points: 640, streak: 5, lastPlay: new Date().toISOString().slice(0, 10), rounds: 24, rights: 180, wrongs: 22, playSec: 4300, bestCombo: 9, assessed: true, lvl: LVL,
    levels: { contar: 2, somar: 3, comparar: 2 }, ach: { a1: 1, a2: 1, a3: 1, a4: 1, a5: 1 }, owned: { themes: ['classico', 'espaco', 'jardim', 'oceano', 'arcoiris', 'doces', 'neve'], hats: [], pets: ['fox', 'panda'] } },
  { id: 'p2', name: 'Theo', avatar: '🐼', stars: 8 }], settings: Object.assign({ lang: 'pt', calmo: true, theme: 'classico', voiceOn: false, sfxOn: false, newtabOn: false }, extra || {}) });
const NOANIM = '*{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}#toast{display:none!important}';
(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const b = await chromium.launch();
  for (const [fmt, vp] of [['desk', { width: 960, height: 540, dpr: 2, m: false }], ['cel', { width: 360, height: 640, dpr: 3, m: true }]]) {
    const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.dpr, isMobile: vp.m, hasTouch: vp.m, locale: 'pt-BR' });
    const p = await ctx.newPage(); const shot = (n) => p.screenshot({ path: path.join(OUT, fmt + '-' + n + '.png') });
    const load = async (extra) => { await p.goto(base + 'index.html'); await p.evaluate((s) => { localStorage.clear(); localStorage.setItem('cc_state', JSON.stringify(s)); }, seed(extra)); await p.reload(); await p.waitForTimeout(500); await p.addStyleTag({ content: NOANIM }); };
    await load();
    // contagem por toque: rodada com 4 a 6 objetos
    for (let k = 0; k < 30; k++) { const n = await p.evaluate(() => { show('home'); startRound('contar'); return R.current.answer; }); if (n >= 4 && n <= 6) break; }
    await p.waitForTimeout(300); await shot('contar-0');
    const objs = await p.$$('#visual .obj.tappable');
    for (let i = 0; i < objs.length; i++) { await objs[i].click(); await p.waitForTimeout(120); await shot('contar-' + (i + 1)); }
    await p.evaluate(() => { const ok = [...document.querySelectorAll('#answers button')].find((b) => b.dataset.v === String(R.current.answer)); onAnswer(ok); });
    await p.waitForTimeout(250); await shot('contar-acerto');
    // somar com acerto
    await p.evaluate(() => { hideOverlay(); show('home'); startRound('somar'); }); await p.waitForTimeout(250); await shot('somar-0');
    await p.evaluate(() => { const ok = [...document.querySelectorAll('#answers button')].find((b) => b.dataset.v === String(R.current.answer)); onAnswer(ok); });
    await p.waitForTimeout(250); await shot('somar-acerto');
    // temas e acessibilidade na tela inicial
    for (const th of ['classico', 'espaco', 'jardim', 'oceano', 'arcoiris', 'doces', 'neve']) { await load({ theme: th }); await p.evaluate(() => { show('home'); renderHome(); }); await shot('tema-' + th); }
    await load({ contrast: 'on' }); await p.evaluate(() => { show('home'); renderHome(); }); await shot('alto-contraste');
    await load({ dys: true }); await p.evaluate(() => { show('home'); renderHome(); }); await shot('dislexia');
    // portão da área dos responsáveis
    await load({ passHash: 'pbkdf2$600000$00', passSalt: '00' }); await p.goto(base + 'options.html'); await p.waitForTimeout(500); await p.addStyleTag({ content: NOANIM }); await shot('portao');
    await ctx.close();
  }
  await b.close(); srv.close(); console.log('ok', fs.readdirSync(OUT).length);
})();

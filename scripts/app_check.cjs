#!/usr/bin/env node
/* Apps Capacitor (Android e iOS): os caminhos nativos do jogo no Chromium, com uma
   ponte Capacitor simulada. Confere o botão Voltar do Android (balão, telas, aviso
   aberto, minimizar no início), o backup pela folha de compartilhar (gravado,
   cancelado e no painel), o estilo das barras do sistema nos temas e que a web
   comum continua baixando o arquivo.
   Uso: node scripts/app_check.cjs [pasta]   (padrão native/android/www, gerada por
        python scripts/build_android_www.py; precisa de playwright) */
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const WWW = path.resolve(process.argv[2] || path.join(__dirname, '..', 'native', 'android', 'www'));
if (!fs.existsSync(path.join(WWW, 'index.html'))) {
  console.log('FALHOU — ' + WWW + ' não existe: rode python scripts/build_android_www.py');
  process.exit(1);
}
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => {
  const rel = decodeURIComponent(q.url.split('?')[0]);
  const p = path.join(WWW, rel === '/' ? 'index.html' : rel);
  if (!p.startsWith(WWW)) { r.writeHead(403); r.end(); return; }
  fs.readFile(p, (e, b) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); r.end(b); });
});
const MOCK = (shareRejects) => {
  const calls = window.__calls = [];
  const rec = (n) => (o) => { calls.push([n, o]); return Promise.resolve(); };
  const listeners = window.__listeners = {};
  window.Capacitor = {
    isNativePlatform: () => true, isPluginAvailable: () => true, getPlatform: () => 'android',
    Plugins: {
      Preferences: { get: () => Promise.resolve({ value: null }), set: rec('prefs.set'), remove: rec('prefs.remove') },
      TextToSpeech: { getSupportedVoices: () => Promise.resolve({ voices: [] }), speak: rec('tts.speak'), stop: rec('tts.stop') },
      Filesystem: { writeFile: (o) => { calls.push(['fs.writeFile', o]); return Promise.resolve({ uri: 'file:///data/cache/' + o.path }); } },
      Share: { share: (o) => { calls.push(['share', o]); return shareRejects ? Promise.reject(new Error('Share canceled')) : Promise.resolve({}); } },
      App: { addListener: (ev, cb) => { (listeners[ev] = listeners[ev] || []).push(cb); return Promise.resolve({ remove() {} }); },
             minimizeApp: rec('app.minimize'), exitApp: rec('app.exit') },
      SystemBars: { setStyle: rec('bars.setStyle') },
    },
  };
};
(async () => {
  await new Promise((r) => srv.listen(0, r));
  const url = 'http://127.0.0.1:' + srv.address().port + '/index.html';
  const browser = await chromium.launch();
  const fails = [];
  const ok = (cond, msg) => { console.log((cond ? 'OK   ' : 'FALHA') + ' ' + msg); if (!cond) fails.push(msg); };
  for (const shareRejects of [false, true]) {
    const ctx = await browser.newContext({ locale: 'pt-BR', viewport: { width: 412, height: 915 } });
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
    await page.addInitScript(MOCK, shareRejects);
    await page.goto(url);
    await page.waitForFunction(() => document.querySelector('#screen-home.active'));
    await page.evaluate(() => { if (typeof overlayOpen === 'function' && overlayOpen()) hideOverlay(); });
    const back = () => page.evaluate(() => { (window.__listeners.backButton || []).forEach((cb) => cb({ canGoBack: false })); });
    if (!shareRejects) {
      ok(await page.evaluate(() => (window.__listeners.backButton || []).length === 1), 'um ouvinte de backButton registrado');
      ok(await page.evaluate(() => IN_NATIVE_APP && !!NATIVE_FS && !!NATIVE_SHARE), 'engine detecta app e plugins Filesystem/Share');
      ok(await page.evaluate(() => window.__calls.some(([n, o]) => n === 'bars.setStyle' && o.style === 'LIGHT')), 'tema claro → barras LIGHT');
      // tela da loja → Voltar → início
      await page.click('#btn-shop'); await page.waitForSelector('#screen-shop.active');
      await back();
      ok(await page.evaluate(() => document.querySelector('#screen-home.active') !== null), 'Voltar na Loja volta ao início');
      await page.click('#btn-ach'); await page.waitForSelector('#screen-ach.active');
      await back();
      ok(await page.evaluate(() => document.querySelector('#screen-home.active') !== null), 'Voltar nas Conquistas volta ao início');
      // balão do perfil → Voltar fecha
      await page.click('#btn-profile');
      ok(await page.evaluate(() => !document.querySelector('#pop-profile').classList.contains('hidden')), 'balão do perfil abriu');
      await back();
      ok(await page.evaluate(() => document.querySelector('#pop-profile').classList.contains('hidden')), 'Voltar fecha o balão');
      ok(await page.evaluate(() => !window.__calls.some(([n]) => n === 'app.minimize')), 'ainda não minimizou');
      // aviso aberto → Voltar não faz nada
      await page.evaluate(() => showOverlay('<h3>teste</h3><button class="big-btn" id="x">ok</button>'));
      await back();
      ok(await page.evaluate(() => overlayOpen() && !window.__calls.some(([n]) => n === 'app.minimize')), 'Voltar com aviso aberto não fecha nem minimiza');
      await page.evaluate(() => hideOverlay());
      // início → Voltar minimiza
      await back();
      ok(await page.evaluate(() => window.__calls.some(([n]) => n === 'app.minimize')), 'Voltar no início minimiza o app');
      // tema escuro → barras DARK
      await page.evaluate(() => { G().theme = 'espaco'; applyTheme(G()); });
      ok(await page.evaluate(() => { const c = window.__calls.filter(([n]) => n === 'bars.setStyle'); return c[c.length - 1][1].style === 'DARK'; }), 'tema Espaço → barras DARK');
      await page.evaluate(() => { G().theme = 'classico'; G().contrast = 'on'; applyTheme(G()); });
      const hc = await page.evaluate(() => document.body.classList.contains('hc'));
      if (hc) ok(await page.evaluate(() => { const c = window.__calls.filter(([n]) => n === 'bars.setStyle'); return c[c.length - 1][1].style === 'DARK'; }), 'alto contraste → barras DARK');
    }
    // backup
    const before = await page.evaluate(() => G().lastBackupAt);
    await page.evaluate(() => downloadBackup());
    await page.waitForTimeout(300);
    const fsCall = await page.evaluate(() => window.__calls.find(([n]) => n === 'fs.writeFile'));
    const shareCall = await page.evaluate(() => window.__calls.find(([n]) => n === 'share'));
    ok(fsCall && /^conta-comigo-backup-\d{4}-\d{2}-\d{2}\.json$/.test(fsCall[1].path) && fsCall[1].directory === 'CACHE' && fsCall[1].encoding === 'utf8', 'backup gravado no cache: ' + (fsCall && fsCall[1].path));
    ok(fsCall && (() => { const d = JSON.parse(fsCall[1].data); return Array.isArray(d.profiles) && !('passHash' in (d.settings || {})); })(), 'backup é o JSON compartilhável (sem passHash)');
    ok(shareCall && shareCall[1].files[0] === 'file:///data/cache/' + fsCall[1].path && /backup/i.test(shareCall[1].dialogTitle), 'folha de compartilhar recebe o arquivo');
    const after = await page.evaluate(() => G().lastBackupAt);
    const toastTxt = await page.evaluate(() => (document.querySelector('#toast') || {}).textContent || '');
    if (shareRejects) {
      ok(after === before, 'cancelado: lastBackupAt não muda');
      ok(!/guardado/.test(toastTxt), 'cancelado: sem aviso de backup guardado');
    } else {
      ok(after > before, 'compartilhado: lastBackupAt atualizado');
      ok(/Backup guardado!/.test(toastTxt), 'compartilhado: aviso "Backup guardado!" (' + toastTxt.trim() + ')');
    }
    ok(errs.length === 0, 'sem erros de JS na página' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await ctx.close();
  }
  // painel dos responsáveis: exportar pelo mesmo caminho
  {
    const ctx = await browser.newContext({ locale: 'pt-BR' });
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
    await page.addInitScript(MOCK, false);
    await page.goto(url.replace('index.html', 'options.html'));
    await page.waitForTimeout(800);
    await page.evaluate(() => doBackupDownload());
    await page.waitForTimeout(300);
    ok(await page.evaluate(() => window.__calls.some(([n]) => n === 'share')), 'painel: backup datado vai para a folha de compartilhar');
    await page.evaluate(() => doExport());
    await page.waitForTimeout(300);
    ok(await page.evaluate(() => window.__calls.some(([n, o]) => n === 'fs.writeFile' && o.path === 'conta-comigo-progresso.json')), 'painel: exportar grava conta-comigo-progresso.json');
    ok(await page.evaluate(() => !(window.__listeners.backButton || []).length), 'painel: sem ouvinte (o Capacitor faz goBack sozinho)');
    ok(errs.length === 0, 'painel: sem erros de JS' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await ctx.close();
  }
  // web comum (sem Capacitor): download continua igual
  {
    const ctx = await browser.newContext({ locale: 'pt-BR', acceptDownloads: true });
    const page = await ctx.newPage();
    await page.goto(url);
    await page.waitForFunction(() => document.querySelector('#screen-home.active'));
    const [dl] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => downloadBackup())]);
    ok(/^conta-comigo-backup-\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename()), 'web: download ' + dl.suggestedFilename());
    await page.waitForTimeout(200);
    ok(/Backup baixado!/.test(await page.evaluate(() => document.querySelector('#toast').textContent)), 'web: aviso "Backup baixado!"');
    await ctx.close();
  }
  await browser.close(); srv.close();
  console.log(fails.length ? '\nFALHOU — ' + fails.length + ' verificações' : '\nOK — Voltar, backup nativo, barras do sistema e download da web');
  process.exit(fails.length ? 1 : 0);
})();

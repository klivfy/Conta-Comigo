#!/usr/bin/env node
/* PWA: instalar, offline, convite para instalar e acessibilidade, com identidades de iPhone e de Android.
   Serve a PWA gerada (python scripts/build_pwa.py) e testa no navegador.
   Motor: CC_ENGINE=chromium (padrão) ou webkit (o motor do Safari; com PLAYWRIGHT_BROWSERS_PATH que o tenha).
   Uso: node scripts/pwa_check.cjs   (precisa de playwright; axe-core é opcional) */
'use strict';
const fs = require('fs');
const http = require('http');
const path = require('path');
const pw = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PWA = path.join(ROOT, 'download', 'conta-comigo-pwa');
const ENGINE = process.env.CC_ENGINE || 'chromium';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const UA_ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const UA_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

let falhas = 0;
let total = 0;
function ok(cond, msg) { total++; if (cond) console.log('  ok   ' + msg); else { falhas++; console.log('  FALHA ' + msg); } }

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

/* evento beforeinstallprompt simulado (o navegador só o dispara em aparelho real) */
const FIRE_BIP = `(() => { const e = new Event('beforeinstallprompt', { cancelable: true });
  e.prompt = () => { window.__prompted = (window.__prompted || 0) + 1; return Promise.resolve(); };
  e.userChoice = Promise.resolve({ outcome: 'accepted' });
  window.dispatchEvent(e); return e.defaultPrevented; })()`;
const STANDALONE = `(() => { const mm = window.matchMedia.bind(window);
  window.matchMedia = (q) => /display-mode:\\s*standalone/.test(q) ? { matches: true, media: q, addEventListener() {}, removeEventListener() {} } : mm(q); })();`;

(async () => {
  if (!fs.existsSync(path.join(PWA, 'index.html'))) { console.error('Rode antes: python3 scripts/build_pwa.py'); process.exit(2); }
  const srv = await serve();
  const url = 'http://127.0.0.1:' + srv.address().port + '/index.html';
  const browser = await pw[ENGINE].launch();
  console.log('PWA, motor ' + ENGINE + ' ' + browser.version());

  async function pagina(opts, init, alvo) {
    const ctx = await browser.newContext({ locale: 'pt-BR', ...opts });
    const p = await ctx.newPage();
    const erros = [];
    p.on('pageerror', (e) => erros.push('pageerror: ' + e.message));
    p.on('console', (m) => { if (m.type() === 'error' || /content security policy/i.test(m.text())) erros.push(m.text()); });
    if (init) await p.addInitScript(init);
    await p.goto(alvo || url);
    await p.waitForSelector('#screen-home.active', { timeout: 8000 });
    await p.waitForTimeout(400);
    return { ctx, p, erros };
  }
  const caixa = (p, sel) => p.evaluate((s) => { const n = document.querySelector(s); if (!n) return null; const r = n.getBoundingClientRect(); return { w: r.width, h: r.height, vis: !!n.offsetParent }; }, sel);

  /* 1) iPhone: convite com o passo a passo, sem botão Instalar */
  {
    console.log('iPhone (Safari)');
    const iphone = ENGINE === 'webkit' ? pw.devices['iPhone 14'] : { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
    const { ctx, p, erros } = await pagina({ ...iphone, userAgent: UA_IPHONE });
    ok(await p.$('#pwa-install'), 'o cartão aparece na tela inicial');
    ok(!(await p.$('#pwa-install-btn')), 'sem botão Instalar (o iOS não tem aviso de instalação)');
    const corpo = await p.evaluate(() => document.querySelector('#pwa-install .pwa-body').textContent);
    ok(corpo === await p.evaluate(() => t('pwa_body_ios')) && /Compartilhar/.test(corpo), 'texto do passo a passo: "' + corpo + '"');
    const later = await caixa(p, '#pwa-install-later');
    ok(later && later.vis && later.h >= 44 && later.w >= 44, 'alvo de toque do "Agora não" ≥ 44px (' + later.w + '×' + later.h + ')');
    ok(await p.evaluate(() => { const r = document.getElementById('pwa-install').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }), 'o cartão cabe na largura da tela');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'a página não rola na horizontal');
    await p.evaluate(() => show('shop'));
    ok(!(await caixa(p, '#pwa-install')).vis, 'some quando a criança sai da tela inicial');
    await p.evaluate(() => show('home'));
    ok((await caixa(p, '#pwa-install')).vis, 'volta na tela inicial');
    await p.evaluate(() => { const g = G(); g.lang = 'es'; applyLang(); });
    ok(await p.evaluate(() => document.querySelector('#pwa-install-title').textContent) === 'Instala Cuenta Conmigo', 'troca de idioma atualiza o cartão (es)');
    await p.evaluate(() => { const g = G(); g.lang = 'en'; applyLang(); });
    ok(await p.evaluate(() => document.querySelector('#pwa-install .pwa-body').textContent) === 'Tap Share, then Add to Home Screen.', 'troca de idioma atualiza o cartão (en)');
    await p.click('#pwa-install-later');
    ok(!(await p.$('#pwa-install')), '"Agora não" fecha o cartão');
    await p.reload(); await p.waitForSelector('#screen-home.active'); await p.waitForTimeout(300);
    ok(!(await p.$('#pwa-install')), 'e ele não volta depois de recarregar');
    ok(await p.evaluate(() => !JSON.stringify(shareableDB(DB)).includes('cc_pwa_hint_off')), 'o aviso lembrado não entra no backup');
    ok(erros.length === 0, 'sem erro de console nem de CSP' + (erros.length ? ': ' + erros[0] : ''));
    await ctx.close();
  }

  /* 2) iPhone já instalado (modo app): nada de convite */
  {
    console.log('iPhone instalado (modo app)');
    const { ctx, p } = await pagina({ userAgent: UA_IPHONE, viewport: { width: 390, height: 844 }, hasTouch: true }, STANDALONE);
    ok(!(await p.$('#pwa-install')), 'sem cartão no modo app');
    await ctx.close();
  }

  /* 3) Android: sem bloqueio, instalável, convite com botão Instalar */
  {
    console.log('Android (Chrome)');
    const { ctx, p, erros } = await pagina({ userAgent: UA_ANDROID, viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
    ok(await p.evaluate(() => !!document.querySelector('link[rel=manifest]')), 'o manifest continua na página (a PWA não é mais bloqueada no Android)');
    ok(!(await p.$('#pwa-install')), 'sem cartão antes do evento de instalação');
    ok(await p.evaluate(FIRE_BIP) === true, 'o convite assume o evento (preventDefault: sem barra do navegador)');
    await p.waitForSelector('#pwa-install-btn');
    ok(true, 'cartão com o botão Instalar aparece depois do evento');
    const go = await caixa(p, '#pwa-install-btn');
    ok(go.h >= 44 && go.w >= 44, 'alvo de toque do "Instalar" ≥ 44px');
    if (ENGINE === 'chromium') {
      const cdp = await ctx.newCDPSession(p);
      const m = await cdp.send('Page.getAppManifest');
      ok(!!m.data && /manifest\.webmanifest$/.test(m.url), 'o navegador lê o manifest');
      ok(!(m.errors || []).length, 'manifest sem erros' + ((m.errors || []).length ? ': ' + m.errors[0].message : ''));
      const inst = await cdp.send('Page.getInstallabilityErrors');
      ok(inst.installabilityErrors.length === 0, 'instalável pelo Chrome (WebAPK), sem erros' + (inst.installabilityErrors.length ? ': ' + inst.installabilityErrors.map((e) => e.errorId).join() : ''));
    }
    await p.click('#pwa-install-btn');
    await p.waitForTimeout(200);
    ok(await p.evaluate(() => window.__prompted) === 1, 'tocar em Instalar abre o aviso do sistema uma vez');
    ok(!(await p.$('#pwa-install')), 'o cartão fecha');
    ok(await p.evaluate(() => localStorage.getItem('cc_pwa_hint_off')) === '1', 'instalou: não convida de novo');
    await p.evaluate(FIRE_BIP); await p.waitForTimeout(150);
    ok(!(await p.$('#pwa-install')), 'novo evento não reabre o cartão');
    ok(erros.length === 0, 'sem erro de console nem de CSP' + (erros.length ? ': ' + erros[0] : ''));
    await ctx.close();
  }
  {
    const { ctx, p } = await pagina({ userAgent: UA_ANDROID, viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
    await p.evaluate(FIRE_BIP); await p.waitForSelector('#pwa-install-later');
    await p.click('#pwa-install-later');
    ok(!(await p.$('#pwa-install')) && await p.evaluate(() => localStorage.getItem('cc_pwa_hint_off')) === '1', 'Android: "Agora não" fecha e lembra');
    await ctx.close();
  }
  {
    const { ctx, p } = await pagina({ userAgent: UA_ANDROID, viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true }, STANDALONE);
    await p.evaluate(FIRE_BIP); await p.waitForTimeout(150);
    ok(!(await p.$('#pwa-install')), 'Android instalado (modo app): sem cartão');
    await ctx.close();
  }

  /* 4) computador: sem evento, sem cartão */
  {
    console.log('Computador');
    const { ctx, p } = await pagina({ viewport: { width: 1280, height: 800 } });
    ok(!(await p.$('#pwa-install')), 'sem evento de instalação, sem cartão');
    await ctx.close();
  }

  /* 5) offline de verdade: o servidor é desligado (o setOffline do Playwright não é confiável no WebKit) */
  for (const [nome, opts] of [['computador', { viewport: { width: 1280, height: 800 } }], ['iPhone', { userAgent: UA_IPHONE, viewport: { width: 390, height: 844 }, hasTouch: true }], ['Android', { userAgent: UA_ANDROID, viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true }]]) {
    console.log('Offline (' + nome + ')');
    const s2 = await serve();
    const alvo = 'http://127.0.0.1:' + s2.address().port + '/index.html';
    const { ctx, p, erros } = await pagina(opts, null, alvo);
    await p.waitForFunction(() => navigator.serviceWorker.getRegistrations().then((r) => r.some((x) => x.active)), null, { timeout: 8000 });
    ok(true, 'service worker ativo');
    const cache = await p.evaluate(async () => { const ks = await caches.keys(); let n = 0; for (const k of ks) n += (await (await caches.open(k)).keys()).length; return { ks, n }; });
    ok(cache.ks.length === 1 && cache.n >= 15, 'um cache com o app inteiro (' + cache.n + ' arquivos)');
    await p.reload({ waitUntil: 'load' }); // o service worker já controla a página
    await new Promise((r) => { s2.closeAllConnections(); s2.close(r); });
    let abriu = false;
    try { await p.reload({ waitUntil: 'load' }); await p.waitForSelector('#screen-home.active', { timeout: 8000 }); abriu = true; } catch (e) { console.log('    ' + String(e.message).split('\n')[0]); }
    ok(abriu, 'recarrega e abre com o servidor desligado');
    if (abriu) {
      await p.evaluate(() => startRound('contar'));
      ok(await p.waitForSelector('#screen-game.active', { timeout: 4000 }).then(() => true, () => false), 'joga uma rodada offline');
    }
    ok(erros.filter((e) => !/Failed to load resource|net::ERR|NetworkError/i.test(e)).length === 0, 'sem erro de console nem de CSP');
    await ctx.close();
  }

  /* 5) acessibilidade com o cartão visível */
  {
    let axeSrc = null;
    try { axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'); } catch (e) { /* sem axe-core */ }
    console.log('Acessibilidade (axe)');
    if (!axeSrc) console.log('  pulado (axe-core não instalado)');
    else {
      for (const [nome, opts, fire] of [['iPhone', { userAgent: UA_IPHONE, viewport: { width: 390, height: 844 }, hasTouch: true }, false], ['Android', { userAgent: UA_ANDROID, viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true }, true]]) {
        const { ctx, p } = await pagina({ ...opts, bypassCSP: true }); // só para o axe entrar; as outras seções testam a CSP de verdade
        if (fire) { await p.evaluate(FIRE_BIP); await p.waitForSelector('#pwa-install'); }
        await p.addScriptTag({ content: axeSrc });
        const r = await p.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] }));
        const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
        ok(graves.length === 0, nome + ': axe sem violações graves com o cartão' + (graves.length ? ': ' + graves.map((v) => v.id + ' ' + v.nodes[0].target.join(' ')).join('; ') : ''));
        await ctx.close();
      }
    }
  }

  await browser.close();
  srv.close();
  console.log('\n' + (falhas ? 'FALHOU' : 'OK') + ': ' + (total - falhas) + '/' + total + ' verificações');
  process.exit(falhas ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

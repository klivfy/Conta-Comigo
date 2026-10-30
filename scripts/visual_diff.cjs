#!/usr/bin/env node
/* Regressão visual por pixel para refatorar o CSS sem mudar a aparência.
   Tira capturas (sorteio fixo, sem animação) de 10 tamanhos de tela × 15 telas na página cheia
   (PWA), mais o popup 400×600, e compara com um conjunto salvo antes. Sombras e desfoque do
   Chromium variam em tons quase invisíveis entre execuções, então só conta como mudança quem
   passa de 40 pixels com diferença de cor acima de 24 (de 255): deslocar 1px um botão passa disso.
   Uso:
     node scripts/visual_diff.cjs salvar  <pasta>   (antes de mexer no CSS)
     node scripts/visual_diff.cjs comparar <pasta>  (depois: lista o que mudou e grava <pasta>/dif/)
   CC_TEXTO=200 repete tudo com o texto do sistema a 200%. Precisa de playwright e da PWA gerada
   (python scripts/build_pwa.py); o popup vem direto de download/conta-comigo/popup.html. */
'use strict';
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium, devices } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PWA = path.join(ROOT, 'download', 'conta-comigo-pwa');
const SRC = path.join(ROOT, 'download', 'conta-comigo');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const D = devices;
const DEV = {
  'iphone-se': D['iPhone SE'], 'iphone-14': D['iPhone 14'], 'pixel-7': D['Pixel 7'],
  'fold-280': { ...D['Pixel 7'], viewport: { width: 280, height: 653 }, screen: { width: 280, height: 653 } },
  'iphone-se-paisagem': D['iPhone SE landscape'], 'iphone-14-paisagem': D['iPhone 14 landscape'],
  'ipad-mini': D['iPad Mini'], 'ipad-mini-paisagem': D['iPad Mini landscape'],
  'desktop-1366': { viewport: { width: 1366, height: 768 } }, 'desktop-1920': { viewport: { width: 1920, height: 1080 } },
};
const POPUP = { viewport: { width: 400, height: 600 } };
const MODES = ['contar', 'somar', 'comparar', 'subtrair', 'dinheiro', 'historia'];
const SCEN = [['home0', 0], ['home', 200], ...MODES.map((m) => ['jogo-' + m, 200]), ['fim', 200], ['duelo', 200], ['loja', 200],
  ['conquistas', 200], ['modal', 200], ['perfis', 200], ['balao', 200]];
const TEXTO = Number(process.env.CC_TEXTO || 100);

const SEED = `window.__seed = (n) => { let s = n; Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }; window.__seed(123456789);`;

function serve(root) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
      const file = path.join(root, rel);
      if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

const TOL_COR = 24, TOL_PX = 40;
/* compara dois PNGs num canvas do próprio Chromium (sem dependências) */
async function difere(page, a, b) {
  return page.evaluate(async ([x, y, tc]) => {
    const img = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + u; });
    const [A, B] = await Promise.all([img(x), img(y)]);
    if (A.width !== B.width || A.height !== B.height) return 1e9;
    const px = (i) => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height).data; };
    const da = px(A), db = px(B); let n = 0;
    for (let k = 0; k < da.length; k += 4) if (Math.max(Math.abs(da[k] - db[k]), Math.abs(da[k + 1] - db[k + 1]), Math.abs(da[k + 2] - db[k + 2])) > tc) n++;
    return n;
  }, [a.toString('base64'), b.toString('base64'), TOL_COR]);
}

async function cena(p, sn, stars, last) {
  if (stars !== last) {
    await p.evaluate((s) => { localStorage.clear(); localStorage.setItem('cc_state', JSON.stringify({ v: 2, activeId: 'p1', profiles: [
      { id: 'p1', name: 'Bia', avatar: '🦊', stars: s, streak: 3, lastPlay: '2026-10-21' }, { id: 'p2', name: 'Theo', avatar: '🐼', stars: 5 }], settings: { calmo: true } })); }, stars);
    await p.reload(); await p.waitForTimeout(500);
    // o aviso de conquista aparece e some sozinho: espera sumir para a captura não depender do relógio
    await p.waitForFunction(() => { const t = document.querySelector('#toast'); return !t || !t.classList.contains('show'); }, null, { timeout: 8000 }).catch(() => {});
  }
  await p.evaluate(() => { try { hideOverlay(); } catch (e) { /* ok */ } const pp = document.querySelector('.popover'); if (pp) pp.classList.add('hidden'); show('home'); try { renderHome(); } catch (e) { /* ok */ } });
  await p.addStyleTag({ content: '*{animation:none!important;transition:none!important;caret-color:transparent!important}#toast{display:none!important}' + (TEXTO !== 100 ? 'html{font-size:' + TEXTO + '%!important}' : '') }).catch(() => {});
  await p.evaluate((sn) => {
    window.__seed(987654321); // cada tela sorteia a partir do mesmo ponto, não importa o que rodou antes
    if (sn.startsWith('jogo-')) startRound(sn.slice(5));
    else if (sn === 'fim') { startRound('contar'); endRound(); }
    else if (sn === 'duelo') startDuelSetup();
    else if (sn === 'loja') { show('shop'); renderShop(); }
    else if (sn === 'conquistas') { show('ach'); renderAch(); }
    else if (sn === 'modal') showOverlay('<div class="ov-emoji">🎁</div><h3>' + t('chest_title') + '</h3><p>' + t('chest_msg', { n: 3 }) + '</p><button class="big-btn" data-close="1">' + t('ok') + '</button>');
    else if (sn === 'perfis') toggleProfilePop();
    else if (sn === 'balao') showBubble('🎁', t('next_say', { n: 30, m: t('m_multiplicar') }));
  }, sn);
  await p.waitForTimeout(150);
  await p.evaluate(() => { const t = document.querySelector('#toast'); if (t) t.classList.remove('show'); });
}

(async () => {
  const [modo, dir] = process.argv.slice(2);
  if (!['salvar', 'comparar'].includes(modo) || !dir) { console.error('uso: visual_diff.cjs salvar|comparar <pasta>'); process.exit(2); }
  if (!fs.existsSync(path.join(PWA, 'index.html'))) { console.error('rode antes: python scripts/build_pwa.py'); process.exit(2); }
  const out = path.resolve(dir) + (TEXTO !== 100 ? '-texto' + TEXTO : '');
  fs.mkdirSync(out, { recursive: true });
  const difDir = path.join(out, 'dif');
  const srvP = await serve(PWA), srvS = await serve(SRC);
  const b = await chromium.launch();
  const cmp = await (await b.newContext()).newPage();
  const faltou = []; let total = 0;
  const alvos = [...Object.entries(DEV).map(([n, d]) => [n, d, 'http://127.0.0.1:' + srvP.address().port + '/index.html']),
    ['popup-400x600', POPUP, 'http://127.0.0.1:' + srvS.address().port + '/popup.html']];
  const passada = async () => {
  const mudou = [];
  for (const [dn, dev, url] of alvos) {
    const ctx = await b.newContext({ ...dev, reducedMotion: 'reduce', locale: 'pt-BR' });
    await ctx.addInitScript(SEED);
    const p = await ctx.newPage(); await p.goto(url); let last = -1;
    for (const [sn, stars] of SCEN) {
      await cena(p, sn, stars, last); last = stars;
      const png = await p.screenshot({ fullPage: false });
      const nome = dn + '__' + sn + '.png', f = path.join(out, nome); total++;
      if (modo === 'salvar') fs.writeFileSync(f, png);
      else if (!fs.existsSync(f)) faltou.push(nome);
      else if ((await difere(cmp, fs.readFileSync(f), png)) > TOL_PX) { mudou.push(nome); fs.mkdirSync(difDir, { recursive: true }); fs.writeFileSync(path.join(difDir, nome), png); }
    }
    await ctx.close();
  }
  return mudou;
  };
  let mudou = await passada();
  /* confete, balão e aviso têm relógio próprio e piscam em telas diferentes a cada execução:
     só vale a tela que difere em duas passadas seguidas */
  if (modo === 'comparar' && mudou.length) { const de = new Set(await passada()); mudou = mudou.filter((n) => de.has(n)); }
  await b.close(); srvP.close(); srvS.close();
  if (modo === 'salvar') { console.log('salvas ' + total + ' capturas em ' + out); return; }
  if (faltou.length) console.log('sem base (' + faltou.length + '): ' + faltou.slice(0, 5).join(', '));
  if (mudou.length) { console.log('MUDOU ' + mudou.length + ' de ' + total + ' (novas em ' + difDir + '):\n  ' + mudou.join('\n  ')); process.exit(1); }
  console.log('IGUAL — ' + total + ' capturas sem mudança visível');
})();

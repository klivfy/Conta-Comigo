#!/usr/bin/env node
/* Fase 7 — responsividade: celulares e tablets emulados (toque, retrato e paisagem)
   × as telas do jogo. Falha se algo estoura a largura, sai da tela, se sobrepõe,
   tem alvo de toque <44px ou texto <11px. "Essencial abaixo da dobra" só avisa
   (alguns modos sorteiam muitos objetos).
   Uso: node scripts/resp_check.cjs          (precisa de playwright; serve a PWA gerada) */
'use strict';
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium, devices } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PWA = path.join(ROOT, 'download', 'conta-comigo-pwa');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const D = devices;
const DEV = {
  'iPhone SE (320x568)': D['iPhone SE'], 'iPhone 14': D['iPhone 14'], 'Pixel 7': D['Pixel 7'],
  'Galaxy Fold fechado (280x653)': { ...D['Pixel 7'], viewport: { width: 280, height: 653 }, screen: { width: 280, height: 653 } },
  'iPhone SE paisagem': D['iPhone SE landscape'], 'iPhone 14 paisagem': D['iPhone 14 landscape'],
  'iPad Mini': D['iPad Mini'], 'iPad Mini paisagem': D['iPad Mini landscape'],
};
const MODES = ['contar', 'somar', 'comparar', 'subtrair', 'dinheiro', 'historia'];
const SCEN = [['home0', 0], ['home', 200], ...MODES.map((m) => ['jogo-' + m, 200]), ['fim', 200], ['duelo', 200], ['loja', 200],
  ['conquistas', 200], ['modal', 200], ['perfis', 200], ['balao', 200]];
const FAIL = ['scroll-horizontal', 'fora-da-tela-x', 'texto-fora-da-tela', 'sobreposicao', 'flutuante-fora', 'alvo<44', 'texto<11px'];
const WARN = ['essencial-abaixo-da-dobra'];
// o cadeado do "próximo prêmio" fica de propósito fora da caixa do emoji
const IGNORE = (i) => i.type === 'texto-vaza-do-caixa' && /mode-emoji/.test(i.el);

const PROBE = () => {
  const vw = innerWidth, vh = innerHeight, issues = [];
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !e.closest('.hidden') && !e.closest('[inert]') === !e.closest('[inert]') && !e.closest('.sr-only') && cs.opacity !== '0'; };
  const name = (e) => (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') || e.tagName.toLowerCase();
  const txt = (e) => (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24);
  const add = (type, e, extra) => issues.push({ type, el: name(e), txt: txt(e), ...extra });
  if (document.documentElement.scrollWidth > vw + 1) issues.push({ type: 'scroll-horizontal', el: 'html', txt: '', w: document.documentElement.scrollWidth, vw });
  // camada de cima manda: com modal aberto só ele conta; com popover, só ele; senão a tela + barra
  const ov = document.querySelector('#overlay:not(.hidden)'), po = document.querySelector('.popover:not(.hidden)');
  const roots = ov ? [ov] : po ? [po] : [...document.querySelectorAll('#topbar, .screen.active, #bubble:not(.hidden)')];
  const inScope = (e) => roots.some((r) => r.contains(e));
  const inter = [...document.querySelectorAll('button, a[href], input:not([type=hidden]), select, summary, .mode-card, .obj.tappable')].filter((e) => inScope(e) && vis(e) && !e.disabled);
  const rects = inter.map((e) => [e, e.getBoundingClientRect()]);
  for (const [e, r] of rects) {
    if (r.left < -1 || r.right > vw + 1) add('fora-da-tela-x', e, { l: Math.round(r.left), r: Math.round(r.right), vw });
    if (Math.min(r.width, r.height) < 43.5) add('alvo<44', e, { w: Math.round(r.width), h: Math.round(r.height) });
  }
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const [a, A] = rects[i], [b, B] = rects[j]; if (a.contains(b) || b.contains(a)) continue;
    const w = Math.min(A.right, B.right) - Math.max(A.left, B.left), h = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
    if (w > 6 && h > 6) issues.push({ type: 'sobreposicao', el: name(a) + ' × ' + name(b), txt: txt(a) + ' | ' + txt(b), w: Math.round(w), h: Math.round(h) });
  }
  // texto que escapa do próprio botão/cartão ou da tela
  const leaf = [...document.querySelectorAll('button, .mode-card, .mission, .diff-chip, .chip, #star-chip, #chip-streak, #level-chip, #pts-chip, .badge, .hrow, #bubble, #toast, h2, h3, p, b, span, small, label')].filter((e) => inScope(e) && vis(e));
  const seen = new Set();
  for (const e of leaf) {
    const hasText = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!hasText) continue;
    const rg = document.createRange(); rg.selectNodeContents(e); const tr = rg.getBoundingClientRect(); const er = e.getBoundingClientRect();
    const fs = parseFloat(getComputedStyle(e).fontSize);
    if (fs < 11 && !seen.has('f' + name(e))) { seen.add('f' + name(e)); add('texto<11px', e, { fs }); }
    if (tr.left < -1 || tr.right > vw + 1) add('texto-fora-da-tela', e, { l: Math.round(tr.left), r: Math.round(tr.right), vw });
    else if (tr.right > er.right + 2 || tr.left < er.left - 2) { const k = 'c' + name(e); if (!seen.has(k)) { seen.add(k); add('texto-vaza-do-caixa', e, { box: Math.round(er.width), texto: Math.round(tr.width) }); } }
  }
  // flutuantes
  for (const sel of ['#bubble:not(.hidden)', '#toast.show', '.popover:not(.hidden)', '#overlay-card']) {
    const e = document.querySelector(sel); if (!e || !vis(e)) continue; const r = e.getBoundingClientRect();
    if (r.left < -1 || r.right > vw + 1 || r.top < -1 || r.bottom > vh + 1) add('flutuante-fora', e, { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), vw, vh });
  }
  // jogo: o essencial cabe sem rolar?
  const g = document.querySelector('#screen-game.active');
  if (g) { for (const sel of ['#answers', '#btn-repeat', '#equation']) { const e = document.querySelector(sel); if (e && vis(e)) { const r = e.getBoundingClientRect(); if (r.bottom > vh + 1) add('essencial-abaixo-da-dobra', e, { b: Math.round(r.bottom), vh }); } } }
  const s = document.querySelector('.screen.active'); if (s && s.scrollHeight > s.clientHeight + 2) issues.push({ type: 'rola-vertical', el: name(s), txt: '', alt: s.scrollHeight, vh: s.clientHeight });
  return issues;
};

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

(async () => {
  if (!fs.existsSync(path.join(PWA, 'index.html'))) { console.error('rode antes: python scripts/build_pwa.py'); process.exit(2); }
  const srv = await serve(); const base = 'http://127.0.0.1:' + srv.address().port + '/index.html';
  const b = await chromium.launch(); const bad = [], warn = [];
  for (const [dn, dev] of Object.entries(DEV)) {
    const ctx = await b.newContext({ ...dev, reducedMotion: 'reduce' }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(base); let last = -1;
    for (const [sn, stars] of SCEN) {
      if (stars !== last) {
        await p.evaluate((s) => { localStorage.clear(); localStorage.setItem('cc_state', JSON.stringify({ v: 2, activeId: 'p1', profiles: [
          { id: 'p1', name: 'Bia', avatar: '🦊', stars: s, streak: 3, lastPlay: '2026-10-21' }, { id: 'p2', name: 'Theo', avatar: '🐼', stars: 5 }], settings: { calmo: true } })); }, stars);
        await p.reload(); await p.waitForTimeout(500); last = stars;
      }
      await p.evaluate(() => { try { hideOverlay(); } catch (e) { /* ok */ } const pp = document.querySelector('.popover'); if (pp) pp.classList.add('hidden'); show('home'); try { renderHome(); } catch (e) { /* ok */ } });
      await p.addStyleTag({ content: '*{animation:none!important;transition:none!important}' }).catch(() => {});
      await p.evaluate((sn) => {
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
      for (const i of (await p.evaluate(PROBE)).filter((x) => !IGNORE(x))) {
        const line = dn + ' · ' + sn + ' · ' + i.type + ' · ' + i.el + (i.txt ? ' "' + i.txt + '"' : '');
        if (FAIL.includes(i.type) || (!WARN.includes(i.type))) bad.push(line); else warn.push(line);
      }
    }
    for (const e of errs) bad.push(dn + ' · erro de JS: ' + e);
    await ctx.close();
  }
  await b.close(); srv.close();
  const uniq = (a) => [...new Set(a)];
  if (warn.length) console.log('Avisos (' + uniq(warn).length + '):\n  ' + uniq(warn).slice(0, 10).join('\n  '));
  if (bad.length) { console.log('\nFALHOU — ' + uniq(bad).length + ' problemas de layout:\n  ' + uniq(bad).slice(0, 40).join('\n  ')); process.exit(1); }
  console.log('OK — ' + Object.keys(DEV).length + ' dispositivos × ' + SCEN.length + ' telas sem estouro, sobreposição, alvo <44px ou texto <11px');
})();

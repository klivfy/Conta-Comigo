#!/usr/bin/env node
/* Conta Comigo — contraste medido no render, em todos os modos de cor.
 *
 * O axe (a11y_check.cjs) roda só em 3 temas e pula dois casos que já escaparam:
 * texto pintado com degradê (background-clip: text, como o título) e o anel de
 * estado da dica, que é contorno e não texto. Este check cobre os 7 temas e o
 * alto contraste, no computador (1280×800) e no celular (390×844), nas telas
 * início, loja, conquistas, rodada e painel dos responsáveis:
 *   - texto visível: 4,5:1, ou 3:1 se for grande (≥24px, ou ≥18,66px com peso ≥700);
 *   - texto em degradê: cada cor do degradê contra o fundo;
 *   - anel da dica (.ans.hint) e anel de foco do teclado: 3:1 contra o fundo em
 *     volta do controle (WCAG 1.4.11 e 2.4.7). O foco do Espaço já saiu com 1,2:1
 *     porque --focus era resolvido em :root com a tinta do Clássico.
 * Texto de controle desabilitado fica de fora, como a WCAG permite.
 * Uso:  node scripts/contrast_check.cjs      (precisa da PWA gerada e do playwright)
 */
'use strict';
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PWA = path.join(ROOT, 'download', 'conta-comigo-pwa');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const TODOS = ['classico', 'espaco', 'jardim', 'arcoiris', 'oceano', 'doces', 'neve', 'hc'];
// CC_MODOS=hc,espaco roda só esses modos (uso local, para iterar mais rápido)
const MODOS = process.env.CC_MODOS ? process.env.CC_MODOS.split(',').filter((m) => TODOS.includes(m)) : TODOS;
const TELAS = [{ nome: 'computador', viewport: { width: 1280, height: 800 } },
  { nome: 'celular', viewport: { width: 390, height: 844 }, touch: true }];

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

/* Roda dentro da página: devolve os textos abaixo do mínimo. */
function medirTextos() {
  const P = (c) => { const m = (c.match(/[\d.]+/g) || []).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const hex = (h) => { h = h.trim().replace('#', ''); if (h.length === 3) h = [...h].map((x) => x + x).join('');
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 }; };
  const lum = (c) => { const v = [c.r, c.g, c.b].map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const sobre = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
  const bs = getComputedStyle(document.body);
  // o fundo da página é um degradê de 3 cores: o pior caso é contra qualquer uma delas
  const fundosPagina = ['--bg-a', '--bg-b', '--bg-c'].map((k) => bs.getPropertyValue(k)).filter((v) => v.trim().startsWith('#')).map(hex);
  const fundos = (el) => {
    const camadas = [];
    for (let e = el; e; e = e.parentElement) { const c = P(getComputedStyle(e).backgroundColor); if (c.a > 0) { camadas.push(c); if (c.a >= 1) break; } }
    const ultima = camadas[camadas.length - 1];
    const bases = (ultima && ultima.a >= 1) ? [camadas.pop()] : (fundosPagina.length ? fundosPagina : [{ r: 255, g: 255, b: 255, a: 1 }]);
    return bases.map((b) => camadas.reduceRight((acc, l) => sobre(l, acc), b));
  };
  const visivel = (el) => {
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false;
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0 || e.classList.contains('sr-only')) return false;
    }
    return true;
  };
  const nome = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''));
  const ruins = {};
  for (const el of document.querySelectorAll('body *')) {
    const proprio = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
    if (!proprio || !/[\p{L}\p{N}]/u.test(proprio) || !visivel(el)) continue;
    if (el.closest('[disabled], [aria-disabled="true"]')) continue;
    const cs = getComputedStyle(el);
    const tam = parseFloat(cs.fontSize), peso = +cs.fontWeight || 400;
    const min = (tam >= 24 || (tam >= 18.66 && peso >= 700)) ? 3 : 4.5;
    const degrade = cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text';
    let cores;
    if (degrade) cores = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).map(P);
    else { let op = 1; for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity; const c = P(cs.color); c.a *= op; cores = [c]; }
    let pior = 99;
    for (const b of fundos(el)) for (const f of cores) pior = Math.min(pior, cr(sobre(f, b), b));
    if (pior < min) {
      const k = nome(el) + (degrade ? ' [degradê]' : '');
      if (!ruins[k] || ruins[k].r > pior) ruins[k] = { r: +pior.toFixed(2), min, texto: proprio.slice(0, 30) };
    }
  }
  return ruins;
}

/* Roda dentro da página: contraste de um anel (outline) contra o fundo em volta do
   controle. Sem seletor, mede o elemento com foco; com seletor, liga a dica nele. */
function medirAnel(sel) {
  const P = (c) => (c.match(/[\d.]+/g) || []).map(Number);
  const hex = (h) => { h = h.trim().replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)); };
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const b = sel ? document.querySelector(sel) : document.activeElement;
  if (!b || b === document.body) return null;
  if (sel) b.classList.add('hint');
  const cor = P(getComputedStyle(b).outlineColor);
  let fundo = null;
  for (let e = b.parentElement; e; e = e.parentElement) {
    const m = P(getComputedStyle(e).backgroundColor);
    if (m.length === 3 || (m.length > 3 && m[3] >= 1)) { fundo = [m]; break; }
  }
  const bs = getComputedStyle(document.body);
  const fundos = fundo || ['--bg-a', '--bg-b', '--bg-c'].map((k) => hex(bs.getPropertyValue(k)));
  if (sel) b.classList.remove('hint');
  return +Math.min(...fundos.map((f) => cr(cor, f))).toFixed(2);
}

/* Roda dentro da página (só no alto contraste): borda dos controles e dos pontos de
   progresso. No alto contraste o cartão e o fundo são pretos, então um controle com
   fundo próprio só se distingue pela borda: ela (ou o fundo) precisa de 3:1 contra o
   que está em volta (WCAG 1.4.11). Botão só de texto, sem fundo e sem borda, fica de
   fora: é o próprio texto que o identifica, e o texto já é medido acima. */
function medirLimites() {
  const P = (c) => { const m = (c.match(/[\d.]+/g) || []).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const lum = (c) => { const v = [c.r, c.g, c.b].map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const sobre = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
  const fundoDe = (el) => {
    const camadas = [];
    for (let e = el; e; e = e.parentElement) { const c = P(getComputedStyle(e).backgroundColor); if (c.a > 0) { camadas.push(c); if (c.a >= 1) break; } }
    let acc = { r: 0, g: 0, b: 0, a: 1 }; // alto contraste: a página é preta
    if (camadas.length && camadas[camadas.length - 1].a >= 1) acc = camadas.pop();
    return camadas.reduceRight((a, l) => sobre(l, a), acc);
  };
  const visivel = (el) => {
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false;
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0 || e.classList.contains('sr-only')) return false;
    }
    return true;
  };
  const nome = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''));
  const ruins = {};
  for (const el of document.querySelectorAll('button, [role="button"], select, textarea, input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), .dot')) {
    if (!visivel(el) || el.closest('[disabled], [aria-disabled="true"]')) continue;
    const cs = getComputedStyle(el);
    const proprio = P(cs.backgroundColor);
    const bw = parseFloat(cs.borderTopWidth) || 0;
    const temBorda = bw >= 1 && cs.borderTopStyle !== 'none';
    if (proprio.a === 0 && !temBorda && !el.classList.contains('dot')) continue;
    const volta = fundoDe(el.parentElement);
    const rFundo = cr(sobre(proprio, volta), volta);
    const rBorda = temBorda ? cr(sobre(P(cs.borderTopColor), volta), volta) : 0;
    const melhor = Math.max(rFundo, rBorda);
    if (melhor < 3) {
      const k = nome(el);
      if (!ruins[k] || ruins[k].r > melhor) ruins[k] = { r: +melhor.toFixed(2), min: 3, texto: '(borda do controle)' };
    }
  }
  return ruins;
}

(async () => {
  if (!fs.existsSync(path.join(PWA, 'index.html'))) {
    console.error('PWA não encontrada — rode antes: python scripts/build_pwa.py'); process.exit(2);
  }
  const srv = await serve();
  const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const browser = await chromium.launch();
  const falhas = [];
  const erros = [];
  const anotar = (onde, ruins) => Object.entries(ruins).forEach(([k, v]) =>
    falhas.push(onde + ' · ' + k + ' ' + v.r + ':1 (mínimo ' + v.min + ') "' + v.texto + '"'));

  for (const tela of TELAS) {
    const ctx = await browser.newContext({ viewport: tela.viewport, hasTouch: !!tela.touch, isMobile: !!tela.touch, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => erros.push(e.message));
    for (const modo of MODOS) {
      const onde = (s) => tela.nome + '/' + modo + '/' + s;
      await page.goto(base + 'index.html');
      await page.evaluate((m) => { localStorage.clear(); localStorage.setItem('cc_state', JSON.stringify({
        v: 2, activeId: 'p1', profiles: [{ id: 'p1', name: 'Teste', avatar: '🦊' }],
        settings: { theme: m === 'hc' ? 'classico' : m, hc: m === 'hc' },
      })); }, modo);
      await page.reload(); await page.waitForTimeout(800);
      anotar(onde('inicio'), await page.evaluate(medirTextos));
      if (modo === 'hc') anotar(onde('inicio'), await page.evaluate(medirLimites));
      await page.keyboard.press('Tab');
      const foco = await page.evaluate(medirAnel, null);
      if (foco === null || foco < 3) falhas.push(onde('inicio') + ' · anel de foco do teclado ' + foco + ':1 (mínimo 3) contra o fundo');
      await page.click('#btn-shop'); await page.waitForTimeout(250);
      anotar(onde('loja'), await page.evaluate(medirTextos));
      if (modo === 'hc') anotar(onde('loja'), await page.evaluate(medirLimites));
      await page.click('#btn-home'); await page.click('#btn-ach'); await page.waitForTimeout(250);
      anotar(onde('conquistas'), await page.evaluate(medirTextos));
      if (modo === 'hc') anotar(onde('conquistas'), await page.evaluate(medirLimites));
      await page.click('#btn-home');
      await page.locator('#modes-grid > *').first().click(); await page.waitForTimeout(1200);
      anotar(onde('rodada'), await page.evaluate(medirTextos));
      if (modo === 'hc') anotar(onde('rodada'), await page.evaluate(medirLimites));
      const dica = await page.evaluate(medirAnel, '#answers .ans');
      if (dica !== null && dica < 3) falhas.push(onde('rodada') + ' · anel da dica (.ans.hint) ' + dica + ':1 (mínimo 3) contra o fundo');

      await page.goto(base + 'options.html'); await page.waitForTimeout(600);
      const q = await page.evaluate(() => document.getElementById('gc-adult-q').textContent);
      const m = q.match(/(\d+)\s*×\s*(\d+)/);
      await page.fill('#gc-adult-in', String(Number(m[1]) * Number(m[2]))); await page.click('#gc-adult-go');
      await page.waitForTimeout(250);
      await page.fill('#gc-pwd', 'teste123'); await page.fill('#gc-pwd2', 'teste123'); await page.fill('#gc-hint', 'dica');
      await page.click('#gc-go'); await page.waitForTimeout(800);
      anotar(onde('painel'), await page.evaluate(medirTextos));
      if (modo === 'hc') anotar(onde('painel'), await page.evaluate(medirLimites));
    }
    await ctx.close();
  }
  await browser.close(); srv.close();

  if (erros.length) { console.error('Erros de JavaScript:\n  ' + [...new Set(erros)].join('\n  ')); process.exit(1); }
  if (falhas.length) {
    console.error(falhas.length + ' caso(s) de contraste abaixo do mínimo:\n  ' + falhas.join('\n  '));
    process.exit(1);
  }
  console.log('OK — contraste dentro do mínimo em ' + MODOS.length + ' modos de cor × ' + TELAS.length + ' tamanhos × 5 telas, com degradê, anel da dica, anel de foco e bordas no alto contraste.');
})().catch((e) => { console.error(e); process.exit(1); });

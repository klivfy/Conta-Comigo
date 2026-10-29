#!/usr/bin/env node
/* Conta Comigo — verificação de acessibilidade (axe-core + Playwright).
 *
 * Abre a PWA gerada (download/conta-comigo-pwa) num servidor local, passa por
 * início, perfis, loja, conquistas, rodada, portão e painel dos responsáveis
 * (temas claro, escuro e alto contraste), roda o axe (WCAG 2.1 A/AA) e compara
 * as violações sérias/críticas com scripts/a11y-baseline.json.
 *   - violação nova (página|regra fora do baseline) → sai com código 1
 *   - violação corrigida → avisa para atualizar o baseline
 * Uso:  node scripts/a11y_check.cjs [--update-baseline]
 * Requer: npm i --no-save playwright axe-core  (+ npx playwright install chromium)
 */
'use strict';
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PWA = path.join(ROOT, 'download', 'conta-comigo-pwa');
const BASELINE = path.join(__dirname, 'a11y-baseline.json');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };

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

async function audit(page, label, found) {
  await page.addScriptTag({ content: AXE });
  const v = await page.evaluate(async () => (await axe.run(document, {
    runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  })).violations.filter((x) => x.impact === 'serious' || x.impact === 'critical')
    .map((x) => ({ id: x.id, impact: x.impact, n: x.nodes.length, help: x.help,
      at: x.nodes.slice(0, 3).map((n) => n.target.join(' ')) })));
  v.forEach((x) => { found[label + '|' + x.id] = x; });
}

/* O axe pula textos de 1 caractere ("content too short") — exatamente os dígitos
   dos botões de resposta. Aqui o contraste deles é calculado direto (WCAG 1.4.3). */
async function answerContrast(page, label, found, min) {
  const low = await page.$$eval('#answers .ans', (bs, min) => {
    const rgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const lum = (c) => { const v = rgb(c).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
    return bs.map((b, i) => {
      const cs = getComputedStyle(b); const a = lum(cs.color), c = lum(cs.backgroundColor);
      return { i: i + 1, r: (Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05) };
    }).filter((x) => x.r < min).map((x) => 'botão ' + x.i + ': ' + x.r.toFixed(2) + ':1');
  }, min);
  if (low.length) found[label + '|contraste-respostas'] = { impact: 'serious', n: low.length, help: 'Botões de resposta abaixo de ' + min + ':1 — ' + low.join(', ') };
}

(async () => {
  if (!fs.existsSync(path.join(PWA, 'index.html'))) {
    console.error('PWA não encontrada — rode antes: python scripts/build_pwa.py'); process.exit(2);
  }
  const srv = await serve();
  const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const browser = await chromium.launch();
  // bypassCSP: o CSP do app bloqueia a injeção do axe (script inline)
  const ctx = await browser.newContext({ bypassCSP: true, viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const found = {};

  // claro, escuro e alto contraste: os três extremos da paleta
  for (const theme of ['classico', 'espaco', 'hc']) {
    const tag = (k) => (theme === 'classico' ? k : theme + ':' + k);
    await page.goto(base + 'index.html');
    await page.evaluate((th) => { localStorage.clear(); localStorage.setItem('cc_state', JSON.stringify({
      v: 2, activeId: 'p1', profiles: [{ id: 'p1', name: 'Teste', avatar: '🦊' }],
      settings: { theme: th === 'hc' ? 'classico' : th, hc: th === 'hc' },
    })); }, theme);
    await page.reload(); await page.waitForTimeout(1200);
    await audit(page, tag('inicio'), found);
    await page.click('#btn-profile'); await page.waitForTimeout(300);
    await audit(page, tag('perfil'), found);
    await page.keyboard.press('Escape');
    await page.click('#btn-shop'); await page.waitForTimeout(300);
    await audit(page, tag('loja'), found);
    await page.click('#shop-back'); await page.click('#btn-ach'); await page.waitForTimeout(300);
    await audit(page, tag('conquistas'), found);
    await page.click('#ach-back');

    await page.locator('#modes-grid > *').first().click(); await page.waitForTimeout(1500);
    await audit(page, tag('rodada'), found);
    await answerContrast(page, tag('rodada'), found, 4.5);

    await page.goto(base + 'options.html'); await page.waitForTimeout(1000);
    await audit(page, tag('opcoes'), found);
    // v2.7.3: conferência de adulto antes do formulário de senha
    const q = await page.evaluate(() => document.getElementById('gc-adult-q').textContent);
    const m = q.match(/(\d+)\s*×\s*(\d+)/);
    await page.fill('#gc-adult-in', String(Number(m[1]) * Number(m[2]))); await page.click('#gc-adult-go');
    await page.waitForTimeout(300);
    await audit(page, tag('opcoes-senha'), found);
    // cria a senha para auditar o painel inteiro (campos, perfis, dados)
    await page.fill('#gc-pwd', 'teste123'); await page.fill('#gc-pwd2', 'teste123'); await page.fill('#gc-hint', 'dica');
    await page.click('#gc-go'); await page.waitForTimeout(1000);
    await audit(page, tag('painel'), found);
  }

  await browser.close(); srv.close();
  if (errors.length) { console.error('Erros de JavaScript:\n  ' + errors.join('\n  ')); process.exit(1); }

  const keys = Object.keys(found).sort();
  if (process.argv.includes('--update-baseline')) {
    fs.writeFileSync(BASELINE, JSON.stringify(keys, null, 2) + '\n');
    console.log('Baseline atualizado: ' + keys.length + ' violações conhecidas.'); return;
  }
  const known = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : [];
  const added = keys.filter((k) => !known.includes(k));
  const fixed = known.filter((k) => !keys.includes(k));
  keys.forEach((k) => console.log((added.includes(k) ? 'NOVA  ' : 'conh. ') + k + ' (' + found[k].impact + ', ' + found[k].n + ' nós) ' + found[k].help +
    (found[k].at ? '\n      em: ' + found[k].at.join(' · ') : '')));
  if (fixed.length) console.log('\nCorrigidas (rode com --update-baseline): ' + fixed.join(', '));
  if (added.length) { console.error('\n' + added.length + ' violação(ões) nova(s) de acessibilidade.'); process.exit(1); }
  console.log('\nOK — nenhuma violação nova (' + keys.length + ' conhecidas no baseline).');
})().catch((e) => { console.error(e); process.exit(1); });

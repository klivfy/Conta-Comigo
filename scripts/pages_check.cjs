#!/usr/bin/env node
/* Páginas que o a11y_check e o resp_check não abrem (eles testam só a PWA):
   - nova aba (newtab.html): o acerto não quebra a página, conta a ofensiva do dia,
     a próxima pergunta volta, e o botão liga/desliga tem nome e estado;
   - jogo (game.html): "Jogar agora", fim de rodada e boas-vindas (v2.8.0);
   - versão para escolas (web/index.html) e nova aba: axe sem violação séria ou crítica;
   - painel (options.html): sem senha criada, a conferência de adulto vem antes do formulário.
   Serve a fonte (download/conta-comigo) num servidor local.
   Uso: node scripts/pages_check.cjs   (precisa de playwright e axe-core) */
'use strict';
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const SRC = path.resolve(__dirname, '..', 'download', 'conta-comigo');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'game.html';
      const file = path.join(SRC, rel);
      if (!file.startsWith(SRC)) { res.writeHead(403); res.end(); return; }
      fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
        res.end(buf);
      });
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

(async () => {
  const srv = await serve();
  const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const browser = await chromium.launch();
  const fails = [];
  const ok = (cond, msg) => { console.log((cond ? 'OK    ' : 'FALHOU') + ' ' + msg); if (!cond) fails.push(msg); };

  // 1) nova aba: acerto, ofensiva e botão liga/desliga
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'pt-BR' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + 'newtab.html'); await page.waitForTimeout(600);
    const tg = await page.evaluate(() => { const b = document.getElementById('nt-toggle'); return { label: b.getAttribute('aria-label') || '', pressed: b.getAttribute('aria-pressed') }; });
    ok(tg.label.length > 3 && tg.pressed === 'true', 'nova aba: botão liga/desliga com nome ("' + tg.label + '") e aria-pressed=true');
    const q1 = await page.evaluate(() => document.getElementById('nt-q').textContent);
    await page.evaluate(() => { const b = [...document.querySelectorAll('#nt-ans button')].find((x) => Number(x.textContent) === NTQ.answer); b.click(); });
    await page.waitForTimeout(300);
    const st = await page.evaluate(() => ({ streak: P().streak || 0, lastPlay: P().lastPlay || '', stars: P().stars }));
    ok(errors.length === 0, 'nova aba: acerto sem erro de JavaScript' + (errors.length ? ' (' + errors.join(' | ') + ')' : ''));
    ok(st.streak >= 1 && !!st.lastPlay, 'nova aba: o acerto conta a ofensiva do dia (streak ' + st.streak + ')');
    await page.waitForTimeout(2200);
    const back = await page.evaluate(() => !document.getElementById('nt-play').classList.contains('hidden') && !!document.getElementById('nt-q').textContent);
    ok(back, 'nova aba: a próxima pergunta aparece depois do acerto (antes: "' + q1 + '")');
    await page.click('#nt-toggle'); await page.waitForTimeout(200);
    const off = await page.evaluate(() => document.getElementById('nt-toggle').getAttribute('aria-pressed'));
    ok(off === 'false', 'nova aba: desligar atualiza aria-pressed');
    await ctx.close();
  }

  // 2) axe na nova aba e na versão web (sérias e críticas)
  for (const [file, w, h] of [['newtab.html', 1280, 800], ['newtab.html', 390, 844], ['web/index.html', 1280, 800], ['web/index.html', 390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'pt-BR', bypassCSP: true }); // só para injetar o axe
    const page = await ctx.newPage();
    await page.goto(base + file); await page.waitForTimeout(900);
    await page.evaluate(() => { const c = document.getElementById('consent'); if (c) c.remove(); });
    await page.addScriptTag({ content: AXE });
    const res = await page.evaluate(async () => {
      const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
      return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id + ' (' + v.nodes.length + ')');
    });
    ok(res.length === 0, 'axe ' + file + ' a ' + w + 'px' + (res.length ? ': ' + res.join(', ') : ''));
    await ctx.close();
  }

  // 3) painel sem senha: conferência de adulto antes do formulário
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-BR' });
    const page = await ctx.newPage();
    await page.goto(base + 'options.html'); await page.waitForTimeout(800);
    const before = await page.evaluate(() => ({
      adult: !document.getElementById('gc-adult').classList.contains('hidden'),
      form: !document.getElementById('gc-form').classList.contains('hidden'),
    }));
    ok(before.adult && !before.form, 'painel: sem senha, a conferência de adulto aparece e o formulário de senha não');
    await page.fill('#gc-adult-in', '1'); await page.click('#gc-adult-go');
    const wrong = await page.evaluate(() => ({ err: document.getElementById('gc-adult-err').textContent, form: !document.getElementById('gc-form').classList.contains('hidden') }));
    ok(!!wrong.err && !wrong.form, 'painel: resposta errada mostra o erro e mantém o formulário fechado');
    const q = await page.evaluate(() => document.getElementById('gc-adult-q').textContent);
    const m = q.match(/(\d+)\s*×\s*(\d+)/);
    await page.fill('#gc-adult-in', String(Number(m[1]) * Number(m[2]))); await page.click('#gc-adult-go');
    const after = await page.evaluate(() => !document.getElementById('gc-form').classList.contains('hidden'));
    ok(after, 'painel: resposta certa abre o formulário de senha');
    await ctx.close();
  }

  // 4) v2.8.0: "Jogar agora" (N3), fim de rodada (N2) e boas-vindas (N1)
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-BR', bypassCSP: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + 'game.html'); await page.waitForTimeout(900);
    await page.evaluate(() => { P().stars = 120; saveState(); renderHome(); });
    const pn = await page.evaluate(() => { const b = document.getElementById('play-now'); return b ? { label: b.getAttribute('aria-label'), h: b.getBoundingClientRect().height } : null; });
    ok(!!pn && pn.h >= 44 && /Jogar agora/.test(pn.label), 'home: cartão "Jogar agora" existe, alvo >= 44px ("' + (pn && pn.label) + '")');
    await page.click('#play-now'); await page.waitForTimeout(500);
    ok(await page.evaluate(() => document.getElementById('screen-game').classList.contains('active')), 'home: "Jogar agora" abre uma rodada');
    // responde tudo: a primeira conta errada de propósito, para a ficha de revisão por voz
    let wrongOnce = false;
    for (let i = 0; i < 12; i++) {
      const done = await page.evaluate(() => document.getElementById('screen-end').classList.contains('active'));
      if (done) break;
      await page.evaluate((w) => {
        const q = R.current; if (!q || R.locked) return;
        const btns = [...document.querySelectorAll('#answers button')];
        const bad = btns.find((b) => String(b.dataset.v) !== String(q.answer));
        const good = btns.find((b) => String(b.dataset.v) === String(q.answer));
        (w && bad ? bad : good).click();
      }, !wrongOnce && (wrongOnce = true));
      await page.waitForTimeout(450);
      await page.evaluate(() => { const b = [...document.querySelectorAll('#answers button')].find((x) => String(x.dataset.v) === String(R.current && R.current.answer)); if (b && !R.locked) b.click(); });
      await page.waitForTimeout(1300);
    }
    ok(await page.evaluate(() => document.getElementById('screen-end').classList.contains('active')), 'fim: a rodada chega à tela final');
    const end = await page.evaluate(() => ({
      next: !!document.getElementById('end-next') && !document.getElementById('end-next').classList.contains('hidden'),
      emo: document.querySelectorAll('#end-history .hemo').length,
      say: document.querySelectorAll('#end-history button[data-say]').length,
    }));
    ok(end.emo > 0, 'fim: fichas com o emoji do objeto (' + end.emo + ')');
    ok(end.say >= 1, 'fim: a conta errada volta por voz (botão com 🔊)');
    await page.addScriptTag({ content: AXE });
    const ax = await page.evaluate(async () => { const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } }); return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id + ' (' + v.nodes.length + ')'); });
    ok(ax.length === 0, 'axe fim de rodada' + (ax.length ? ': ' + ax.join(', ') : ''));
    // N1: boas-vindas
    await page.evaluate(() => { const p = P(); p.rounds = 0; p.name = DEFAULT_NAME; hideOverlay(); renderHome(); show('home'); showWelcome(); });
    await page.waitForTimeout(400);
    const ax2 = await page.evaluate(async () => { const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } }); return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id + ' (' + v.nodes.length + ')'); });
    ok(ax2.length === 0, 'axe boas-vindas' + (ax2.length ? ': ' + ax2.join(', ') : ''));
    await page.click('[data-wav="🐼"]'); await page.fill('#wl-name', 'Bia'); await page.click('#wl-go'); await page.waitForTimeout(600);
    const w = await page.evaluate(() => ({ name: P().name, av: P().avatar, game: document.getElementById('screen-game').classList.contains('active') }));
    ok(w.name === 'Bia' && w.av === '🐼' && w.game, 'boas-vindas: avatar e nome salvos e a primeira conta começa (' + w.name + ' ' + w.av + ')');
    // lote B (N6, N7): loja por proximidade, voz do que falta, prévia do tema, missão e conquista narradas
    await page.evaluate(() => { window.__said = []; TTS.speak = (x) => { window.__said.push(x); }; P().stars = 40; saveState(); hideOverlay(); renderShop(); show('shop'); });
    const hats = await page.$$eval('#shop-hats .shop-item b', (els) => els.map((e) => e.textContent));
    const fares = await page.$$eval('#shop-hats [data-far]', (els) => els.map((e) => Number(e.dataset.far)));
    ok(fares.length > 0 && fares.every((v, i) => i === 0 || v >= fares[i - 1]), 'loja: o que falta menos vem primeiro (' + fares.join(',') + ')');
    await page.click('#shop-hats [data-far]', { force: true });
    ok(await page.evaluate(() => /\d/.test(window.__said.slice(-1)[0] || '') && window.__said.length > 0), 'loja: o que falta é dito em voz com o nome do item');
    const th0 = await page.evaluate(() => document.body.dataset.theme);
    await page.click('#shop-themes [data-prev="oceano"]');
    ok(await page.evaluate(() => document.body.dataset.theme) === 'oceano' && await page.evaluate(() => G().theme !== 'oceano'), 'loja: prévia aplica o tema sem salvar');
    await page.evaluate(() => show('home'));
    ok(await page.evaluate(() => document.body.dataset.theme) === th0, 'loja: a prévia termina ao sair');
    await page.evaluate(() => { renderHome(); show('home'); });
    const mh = await page.$eval('#mission-row .mission', (e) => e.getBoundingClientRect().height);
    ok(mh >= 44, 'missão: alvo de toque >= 44px (' + Math.round(mh) + ')');
    await page.click('#mission-row .mission');
    ok(await page.evaluate(() => /\d/.test(window.__said.slice(-1)[0] || '')), 'missão: o toque narra o objetivo e o progresso');
    await page.evaluate(() => { celebrateMissions(advanceMissions(P(), 'round', 2)); });
    ok(await page.evaluate(() => /:\s.+!/.test(document.getElementById('toast').textContent)), 'missão: o aviso diz qual missão foi cumprida');
    await page.evaluate(() => { renderAch(); show('ach'); });
    await page.click('#ach-grid .ach-card');
    ok(await page.evaluate(() => (window.__said.slice(-1)[0] || '').length > 10), 'conquista: o toque narra nome e descrição');
    ok(errors.length === 0, 'jogo: sem erro de JavaScript' + (errors.length ? ' (' + errors.join(' | ') + ')' : ''));
    await ctx.close();
  }

  // 5) v2.8.0 lote C: painel desbloqueado (resumo, âncoras, um primário por seção, zona de perigo)
  {
    const errors = [];
    for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
      const ctx = await browser.newContext({ viewport: vp, locale: 'pt-BR', bypassCSP: true });
      const page = await ctx.newPage();
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(base + 'options.html'); await page.waitForTimeout(700);
      const q = await page.evaluate(() => document.getElementById('gc-adult-q').textContent);
      const m = q.match(/(\d+)\s*×\s*(\d+)/);
      await page.fill('#gc-adult-in', String(Number(m[1]) * Number(m[2]))); await page.click('#gc-adult-go');
      await page.fill('#gc-pwd', 'teste123'); await page.fill('#gc-pwd2', 'teste123'); await page.fill('#gc-hint', 'dica');
      await page.click('#gc-go'); await page.waitForTimeout(800);
      const w = vp.width;
      const r = await page.evaluate(() => {
        const nav = [...document.querySelectorAll('#opt-nav a')];
        const secs = [...document.querySelectorAll('.opt-card[id]')].map((c) => c.id);
        const small = nav.filter((a) => a.getBoundingClientRect().height < 44).length;
        const lone = [...document.querySelectorAll('.opt-card')].map((c) => c.querySelectorAll('.mini-btn:not(.ghost):not(.danger-btn):not(.using)').length);
        const dz = document.getElementById('sec-danger');
        const dataCard = document.getElementById('sec-data');
        return {
          summary: document.getElementById('opt-summary').textContent,
          links: nav.length, broken: nav.filter((a) => !secs.includes(a.getAttribute('href').slice(1))).length, small,
          maxPrimary: Math.max(...lone),
          dangerOutside: !dataCard.contains(dz) && !!document.getElementById('btn-reset-all') && dz.contains(document.getElementById('btn-reset-all')),
          legalAsButtons: document.querySelectorAll('#lnk-privacy.mini-btn, #lnk-terms.mini-btn, #lnk-support.mini-btn').length,
          emojiExposed: [...document.querySelectorAll('.opt-card > h2')].filter((h) => h.firstElementChild && h.firstElementChild.getAttribute('aria-hidden') !== 'true').length,
          gateTitles: [...document.querySelectorAll('#gate h2')].length,
          scrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth || document.body.scrollWidth > window.innerWidth || document.querySelector('.opt-wrap').getBoundingClientRect().right > window.innerWidth,
          labelW: Math.max(...[...document.querySelectorAll('.opt-row label')].map((l) => l.getBoundingClientRect().width)),
        };
      });
      ok(/Jogador: /.test(r.summary) && /rodada/.test(r.summary), 'painel ' + w + 'px: resumo da semana no topo ("' + r.summary + '")');
      ok(r.links === 9 && r.broken === 0 && r.small === 0, 'painel ' + w + 'px: 9 âncoras, todas com destino e alvo >= 44px');
      ok(r.maxPrimary <= 1, 'painel ' + w + 'px: no máximo um botão primário por seção (' + r.maxPrimary + ')');
      ok(r.dangerOutside && r.legalAsButtons === 0, 'painel ' + w + 'px: zona de perigo própria e links legais como links');
      ok(r.emojiExposed === 0 && r.gateTitles === 0, 'painel ' + w + 'px: emoji dos títulos escondido do leitor de tela e título do portão sem repetição');
      ok(!r.scrollX, 'painel ' + w + 'px: sem rolagem horizontal da página');
      if (w >= 1000) ok(r.labelW <= 345, 'painel desktop: rótulo não estica até a borda (' + Math.round(r.labelW) + 'px)');
      await page.click('#opt-nav a[href="#sec-data"]'); await page.waitForTimeout(400);
      ok(await page.evaluate(() => document.getElementById('sec-data').getBoundingClientRect().top < window.innerHeight - 100), 'painel ' + w + 'px: a âncora leva à seção');
      await ctx.close();
    }
    ok(errors.length === 0, 'painel: sem erro de JavaScript' + (errors.length ? ' (' + errors.join(' | ') + ')' : ''));
  }

  await browser.close(); srv.close();
  if (fails.length) { console.log('\n' + fails.length + ' falha(s).'); process.exit(1); }
  console.log('\nOK — nova aba, versão web e portão do painel');
})().catch((e) => { console.error(e); process.exit(1); });
